# Specification: User Sign-Up, Gmail OTP Verification & Role Approval (Live DB + Keycloak + Gmail SMTP)

> **Target Audience:** AI Coding Agent & Engineering Contributors  
> **Repository:** `collage-management-system` (Nx + pnpm Monorepo)  
> **Scope:** `.env.example`, `packages/database`, `packages/shared`, `apps/api`, `apps/worker`, `apps/web`  
> **Related Docs:**
> - `docs/adr/0003-transactional-outbox-worker-engine.md`
> - `docs/adr/0004-keycloak-self-hosted-oidc-stateless-jwt.md`
> - `docs/onboarding_and_verification_specification.md`
> - `docs/rbac_and_frontend_matrix.md`
> - `.agents/skills/skill.md`

---

## 1. Root-Cause Diagnosis & Mandatory Agent Objectives

In the current codebase, user registration and login appear to work with static/dummy records because five concrete mock fallbacks and unapplied database steps exist. **Your task is to eliminate every mock fallback below and connect the real stack end-to-end:**

1. **Unapplied Database Schema (`packages/database/src/migrations/`):**
   - `0000_init.sql` only executes `CREATE SCHEMA IF NOT EXISTS ...` for the 9 PostgreSQL schemas (`people`, `outbox`, `audit`, etc.) without creating any tables. Drizzle table migrations must be generated and pushed to PostgreSQL so `people.student`, `people.staff`, `people.role_request`, `outbox.job`, and `audit.log` exist.
2. **Next.js BFF Proxy Static Fallback (`apps/web/src/app/api/v1/[...slug]/route.ts`):**
   - `forwardToBackend()` currently uses a `1200ms` timeout and catches connection/timeout errors by serving hardcoded records from an in-memory `databaseStore` (`Tariqul Islam`, `Shahana Parveen`, `Tanvir Hasan`).
   - **Fix:** Increase the proxy timeout to `10000ms` and **remove the `databaseStore` mock fallback** for `/auth/*` (and all live backend endpoints) so failures surface real HTTP status codes (`400`, `409`, `502`) instead of fake static data.
3. **Frontend Default Static Persona (`apps/web/src/lib/auth-context.tsx`):**
   - `AuthProvider` currently initializes `user` state to `DEMO_PERSONAS["ADMIN"]` (`Dr. Rafiqul Islam`), causing unauthenticated visitors to appear logged in as a static demo admin.
   - **Fix:** Initialize `user` state to `null` and hydrate session state strictly from real JWT tokens and `GET /api/v1/auth/me`.
4. **In-Memory OTP & Skipped DB/Keycloak Persistence (`apps/api/src/modules/auth/services/auth.service.ts`):**
   - `getAdminToken()` expects `KEYCLOAK_ADMIN_CLIENT_ID` / `KEYCLOAK_ADMIN_CLIENT_SECRET` (which are missing from `.env.example`), causing it to return `null` and bypass Keycloak.
   - OTPs are stored in a process-local `Map` (`otpStore`) instead of Redis (`REDIS_CLIENT`).
   - `verifyOtp()` does not insert rows into `people.student` or `people.role_request`, and returns fake `jwt-sms-access-...` strings instead of real Keycloak tokens.
   - `approveRoleRequest()` does not insert approved staff into `people.staff`.
5. **Worker Email Processor Logs Instead of Sending (`apps/worker/src/processors/notification.processor.ts`):**
   - `handleSendOtpEmail()` and `handleSendRoleApprovedEmail()` only log messages to stdout instead of dispatching emails via Gmail SMTP.

---

## 2. Environment Variables & Database Setup

### 2.1 Update `.env.example` (and Local `.env`)

Ensure `.env.example` defines all required variables for PostgreSQL, Redis, Keycloak Admin API, and Gmail SMTP:

```env
# PostgreSQL
DATABASE_URL=postgresql://sms_app:sms_app_password@localhost:5432/sms
DATABASE_ADMIN_URL=postgresql://postgres:postgres@localhost:5432/sms

# Redis
REDIS_URL=redis://localhost:6379

# Keycloak OIDC & Admin API
KEYCLOAK_URL=http://localhost:8080
KEYCLOAK_REALM=sms
KEYCLOAK_CLIENT_ID=sms-web
KEYCLOAK_CLIENT_SECRET=sms-web-secret
KEYCLOAK_ADMIN_CLIENT_ID=admin-cli
KEYCLOAK_ADMIN_USERNAME=admin
KEYCLOAK_ADMIN_PASSWORD=admin

# OTP Security
OTP_HASH_SECRET=replace-with-strong-32-char-random-secret

# Gmail SMTP (Requires Google Account 2FA + 16-char App Password)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-college-noreply@gmail.com
SMTP_PASSWORD=xxxx-xxxx-xxxx-xxxx
MAIL_FROM_NAME="College Management System"
MAIL_FROM_ADDRESS=your-college-noreply@gmail.com
```

### 2.2 Database Migration & Table Creation (`packages/database`)

Inspect `packages/database/src/schema/people.ts`, `outbox.ts`, and `audit.ts` to verify all columns needed for registration, OTP verification, and role approval:

- **`people.student`:** `id`, `keycloakUserId` (unique), `email` (unique), `nameEn`, `nameBn` (optional), `phone`, `admissionNo`, `departmentId` (optional), `sessionYear` (optional), `status`, `createdAt`, `updatedAt`.
- **`people.staff`:** `id`, `keycloakUserId` (unique), `email` (unique), `nameEn`, `nameBn` (optional), `phone`, `employeeNo`, `role` (`TEACHER` | `FINANCE` | `OFFICE` | `ADMIN`), `designation` (optional), `departmentId` (optional), `status`, `createdAt`, `updatedAt`.
- **`people.role_request`:** `id`, `keycloakUserId`, `email`, `fullName`, `phone`, `requestedRole` (`TEACHER` | `FINANCE` | `OFFICE`), `institutionalMeta` (`jsonb`), `status` (`PENDING` | `APPROVED` | `REJECTED`), `reviewedBy` (nullable), `reviewedAt` (nullable), `rejectionReason` (nullable), `createdAt`, `updatedAt`.
- **`outbox.job`:** `id`, `eventType`, `payload` (`jsonb`), `status` (`PENDING` | `PROCESSED` | `FAILED`), `attempts`, `lastError`, `createdAt`, `processedAt`.
- **`audit.log`:** `id`, `actorId`, `action`, `targetType`, `targetId`, `metadata` (`jsonb`), `requestId`, `createdAt`.

Generate and push the Drizzle migrations so all tables are created in PostgreSQL:

```bash
pnpm --filter @sms/database exec drizzle-kit generate
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/sms pnpm --filter @sms/database exec drizzle-kit push
```

---

## 3. End-to-End Authentication & Approval Flow

```mermaid
sequenceDiagram
    actor User
    participant Web as Next.js Web (apps/web)
    participant BFF as Next.js Proxy (/api/v1/*)
    participant API as NestJS API (apps/api)
    participant Redis as Redis
    participant KC as Keycloak
    participant DB as PostgreSQL
    participant Worker as Worker (apps/worker)
    participant Gmail as Gmail SMTP
    actor Admin

    User->>Web: 1. Submits Sign-Up form (role, details, @gmail.com, password)
    Web->>BFF: POST /api/v1/auth/register
    BFF->>API: Forwards to AuthController (10s timeout, no mock fallback)
    API->>Redis: Enforce 60s cooldown & hourly rate limit
    API->>KC: Create disabled/unverified Keycloak user via Admin API
    API->>Redis: Store hashed 6-digit OTP + registration payload (TTL 600s)
    API->>DB: Insert SEND_OTP_EMAIL into outbox.job + audit.log
    API-->>Web: 201 Created { email, expiresInSeconds: 600, cooldownSeconds: 60 }

    Worker->>DB: Poll PENDING SEND_OTP_EMAIL from outbox.job
    Worker->>Gmail: Send 6-digit OTP email via Nodemailer
    Worker->>DB: Mark outbox.job PROCESSED

    User->>Web: 2. Submits 6-digit OTP
    Web->>BFF: POST /api/v1/auth/verify-otp
    BFF->>API: Forwards { email, otp }
    API->>Redis: Validate HMAC-SHA256 OTP hash & max 5 attempts
    API->>KC: Mark emailVerified=true & enable user in Keycloak

    alt Role == STUDENT
        API->>DB: TX: Insert into people.student + audit.log
        API->>KC: Exchange credentials for real OIDC accessToken & refreshToken
        API-->>Web: 200 OK { status: "ACTIVE", accessToken, refreshToken, user }
    else Role in [TEACHER, FINANCE, OFFICE]
        API->>DB: TX: Insert into people.role_request (PENDING) + ADMIN_ROLE_REQUEST outbox.job + audit.log
        API-->>Web: 200 OK { status: "PENDING_APPROVAL", requestId }
    end

    Admin->>Web: 3. Reviews pending role requests & clicks Approve / Reject
    Web->>BFF: PATCH /api/v1/auth/role-requests/:id
    BFF->>API: Forward decision (JwtGuard + RolesGuard: ADMIN/SUPER_ADMIN)
    API->>DB: TX: Update people.role_request; if APPROVED insert into people.staff; insert outbox.job + audit.log
    API->>KC: Assign approved realm role in Keycloak
    API-->>Web: 200 OK { status: "APPROVED" | "REJECTED" }

    Worker->>Gmail: Send SEND_ROLE_APPROVED_EMAIL (or rejection notice)
```

---

## 4. Backend API Specification (`apps/api/src/modules/auth/`)

### 4.1 `AuthService` (`apps/api/src/modules/auth/services/auth.service.ts`)

1. **Keycloak Admin Token (`getAdminToken()`):**
   - Support both client-credentials (if `KEYCLOAK_ADMIN_CLIENT_SECRET` is set) and password grant using `client_id=admin-cli`, `username=KEYCLOAK_ADMIN_USERNAME`, `password=KEYCLOAK_ADMIN_PASSWORD` against `${KEYCLOAK_URL}/realms/master/protocol/openid-connect/token`.
   - **Fail Explicitly:** If Keycloak cannot be reached or rejects authentication, throw a clear `ServiceUnavailableException('Identity provider unavailable')`—never silently generate mock `kc-...` IDs.
2. **Registration (`register()`):**
   - Normalize email (`trim().toLowerCase()`) and enforce `@gmail.com` domain validation via Zod (`packages/shared`).
   - Block self-registration for `ADMIN` and `SUPER_ADMIN` (`403 Forbidden`).
   - Check PostgreSQL (`people.student`, `people.staff`, `people.role_request`) for existing accounts with the same email (`409 Conflict`).
   - Check Redis cooldown key `auth:otp:cooldown:${email}` (`429 Too Many Requests` if active).
   - Generate a cryptographically secure 6-digit OTP (`crypto.randomInt(100000, 1000000).toString()`).
   - Compute `codeHash = crypto.createHmac('sha256', process.env.OTP_HASH_SECRET).update(`${email}:${otp}`).digest('hex')`.
   - Create the user in Keycloak (`emailVerified: false`, `enabled: true`) so `keycloakUserId` is persisted.
   - Store `{ codeHash, attempts: 0, keycloakUserId, registrationData }` in Redis under `auth:otp:${email}` with `EX 600` (10 minutes) and set `auth:otp:cooldown:${email}` with `EX 60`.
   - Insert `SEND_OTP_EMAIL` into `outbox.job` and `USER_REGISTERED` into `audit.log`.
3. **OTP Verification (`verifyOtp()`):**
   - Read `auth:otp:${email}` from Redis. If missing, throw `GoneException('OTP expired or not found')`.
   - Enforce `attempts < 5`; on mismatch, increment `attempts` in Redis and throw `BadRequestException('Invalid verification code')`.
   - Delete `auth:otp:${email}` from Redis upon valid match and mark `emailVerified: true` on the Keycloak user.
   - **If `requestedRole === 'STUDENT'`:**
     - Inside a PostgreSQL transaction (`db.transaction`), insert a new record into `people.student` (mapping `keycloakUserId`, `email`, `nameEn`, `phone`, `admissionNo`, `departmentId`, `sessionYear`) and log `STUDENT_VERIFIED` in `audit.log`.
     - Request a real OIDC token pair from `${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/token` (`grant_type=password`, `client_id`, `client_secret`, `username: email`, `password`) and return `{ status: 'ACTIVE', accessToken, refreshToken, user }`.
   - **If `requestedRole` is `TEACHER`, `FINANCE`, or `OFFICE`:**
     - Inside a PostgreSQL transaction, insert a `PENDING` row into `people.role_request`, insert `ADMIN_ROLE_REQUEST` into `outbox.job`, and log `ROLE_REQUEST_SUBMITTED` in `audit.log`.
     - Return `{ status: 'PENDING_APPROVAL', message: 'Email verified. Awaiting administrator role approval.' }`.
4. **Resend OTP (`resendOtp()`):**
   - Enforce Redis 60s cooldown (`auth:otp:cooldown:${email}`).
   - Generate a fresh 6-digit OTP, overwrite `auth:otp:${email}` with `EX 600` (resetting `attempts: 0`), reset cooldown `EX 60`, and enqueue `SEND_OTP_EMAIL` into `outbox.job`.
5. **Role Approval & Rejection (`listRoleRequests()`, `decideRoleRequest()`):**
   - `listRoleRequests(status?)`: Query `people.role_request` ordered by `createdAt DESC`.
   - `decideRoleRequest(requestId, adminUser, dto)`:
     - Prevent self-approval (`request.keycloakUserId !== adminUser.sub`).
     - Inside a PostgreSQL transaction:
       - Update `people.role_request` (`status: dto.decision`, `reviewedBy: adminUser.sub`, `reviewedAt: new Date()`, `rejectionReason: dto.rejectionReason ?? null`).
       - If `dto.decision === 'APPROVED'`: insert a new row into `people.staff` (`keycloakUserId`, `email`, `nameEn`, `phone`, `employeeNo`, `role: dto.assignedRole ?? request.requestedRole`, `designation`, `departmentId`), assign the realm role in Keycloak via Admin API, and enqueue `SEND_ROLE_APPROVED_EMAIL` into `outbox.job`.
       - If `dto.decision === 'REJECTED'`: enqueue `SEND_ROLE_REJECTED_EMAIL` (or `SEND_ROLE_APPROVED_EMAIL` with `decision: 'REJECTED'`) into `outbox.job`.
       - Write `ROLE_REQUEST_DECIDED` into `audit.log`.

### 4.2 Controller & Guard Parity (`auth.controller.ts` & `roles.guard.ts`)

- Ensure `AuthController` (`apps/api/src/modules/auth/controllers/auth.controller.ts`) exposes:
  - `POST /auth/register` (Public, `ZodValidationPipe`)
  - `POST /auth/verify-otp` (Public, `ZodValidationPipe`)
  - `POST /auth/resend-otp` (Public, `ZodValidationPipe`)
  - `POST /auth/login` (Public — exchanges credentials with Keycloak OIDC and loads profile from `people.student` / `people.staff` / `people.role_request`)
  - `GET /auth/me` (`JwtGuard` — returns live DB profile and approval status)
  - `GET /auth/role-requests` (`JwtGuard`, `RolesGuard`, `@Roles('ADMIN', 'SUPER_ADMIN')`)
  - `PATCH /auth/role-requests/:id` (`JwtGuard`, `RolesGuard`, `@Roles('ADMIN', 'SUPER_ADMIN')`)
- In `RolesGuard` (`apps/api/src/shared/guards/roles.guard.ts`), verify that users whose `people.role_request` is still `PENDING` or `REJECTED` (and who have no active `people.student` or `people.staff` profile) receive `403 Forbidden` with `{ code: 'ROLE_APPROVAL_REQUIRED' }`.

---

## 5. Worker Gmail SMTP Dispatch (`apps/worker/`)

1. **Install Nodemailer in `apps/worker`:**
   ```bash
   pnpm --filter @sms/worker add nodemailer
   pnpm --filter @sms/worker add -D @types/nodemailer
   ```
2. **Update `apps/worker/src/processors/notification.processor.ts`:**
   - Configure a `nodemailer` transporter from `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, and `SMTP_PASSWORD`.
   - **`SEND_OTP_EMAIL`:** Send an HTML and plain-text email to `payload.email` displaying the 6-digit OTP code (`payload.otp`), a 10-minute expiration notice, and institutional branding.
   - **`SEND_ROLE_APPROVED_EMAIL`:** Send an approval confirmation email with the assigned role and `/login` link (or rejection notice with `payload.rejectionReason` if rejected).
   - **`ADMIN_ROLE_REQUEST`:** Send a notification email to `SMTP_USER` / configured admin alert address when a new Teacher/Finance/Office registration awaits approval.
   - Let exceptions propagate if `transporter.sendMail` fails so `outbox-consumer.ts` retries the job rather than falsely marking it `PROCESSED`.

---

## 6. Frontend & BFF Proxy Fixes (`apps/web/`)

1. **Remove Mock Fallback in `apps/web/src/app/api/v1/[...slug]/route.ts`:**
   - Increase `AbortSignal.timeout(1200)` to `AbortSignal.timeout(10000)`.
   - Remove the `databaseStore` fallback for `/auth/*` routes (and any write/mutation routes). When `apps/api` returns an error or is unreachable, return the exact status code and JSON error message from the backend (or `502 Bad Gateway` with `{ message: 'Backend API unavailable on port 4000' }`).
2. **Remove Default Static Admin in `apps/web/src/lib/auth-context.tsx`:**
   - Change `useState<User | null>(DEMO_PERSONAS["ADMIN"])` to `useState<User | null>(null)` and add an `isLoading` boolean state.
   - On mount, read any stored access token (`localStorage` / cookie) and call `GET /api/v1/auth/me` to populate the real user; if missing or `401`, keep `user` as `null`.
   - Ensure `login()`, `register()`, `verifyOtp()`, and `logout()` call the real `/api/v1/auth/*` endpoints without falling back to `DEMO_PERSONAS`.
3. **Wire Registration & OTP Wizard (`apps/web/src/app/(auth)/register/page.tsx`):**
   - **Step 1:** Collect `fullName`, `@gmail.com` `email`, `phone`, `password`, `requestedRole` (`STUDENT`, `TEACHER`, `FINANCE`, `OFFICE`), and role-specific fields (`admissionNo` / `departmentId` / `sessionYear` for Student; `employeeNo` / `designation` / `departmentId` for Staff/Teacher). Submit to `POST /api/v1/auth/register`.
   - **Step 2:** Render 6-digit OTP verification screen with 60-second resend countdown (`POST /api/v1/auth/resend-otp`) and submit code to `POST /api/v1/auth/verify-otp`.
   - **Step 3:** If response `status === 'ACTIVE'` (Student), store tokens in `AuthContext` and redirect to `/`. If `status === 'PENDING_APPROVAL'` (Teacher/Finance/Office), show the "Awaiting Admin Approval" confirmation card with a link to `/login`.
4. **Admin Role Approval UI (`apps/web/src/app/(dashboard)/staff/page.tsx`):**
   - Add a **Pending Role Approvals** section/tab for `ADMIN` and `SUPER_ADMIN` users that fetches `GET /api/v1/auth/role-requests` and lets admins approve (with optional role confirmation) or reject (with required reason) via `PATCH /api/v1/auth/role-requests/:id`.

---

## 7. Agent Execution & Verification Checklist

Before finishing, the agent **must** verify every step below against a running local stack:

- [ ] **Infrastructure Running:** `docker compose up -d` shows `sms-postgres`, `sms-redis`, and `sms-keycloak` healthy.
- [ ] **Drizzle Tables Pushed:** `drizzle-kit generate` and `drizzle-kit push` succeed; `people.student`, `people.staff`, `people.role_request`, `outbox.job`, and `audit.log` exist in PostgreSQL.
- [ ] **Zero Static Auth Fallbacks:** `apps/web/src/app/api/v1/[...slug]/route.ts` no longer serves `Tariqul Islam` / `databaseStore` for `/auth/*`, and `apps/web/src/lib/auth-context.tsx` initializes `user` to `null` instead of `DEMO_PERSONAS["ADMIN"]`.
- [ ] **Student Sign-Up & OTP Flow:** Registering a Student with a `@gmail.com` address creates a Keycloak user, stores a hashed OTP in Redis, dispatches an email via `apps/worker` (`nodemailer`), and after `verify-otp` inserts a real row into `people.student` and returns real Keycloak JWT tokens.
- [ ] **Teacher/Staff Role Approval Flow:** Registering a Teacher/Staff inserts a `PENDING` row into `people.role_request` after OTP verification; approving it as Admin inserts a real row into `people.staff`, assigns the Keycloak role, and triggers the approval email via `outbox.job`.
- [ ] **Typecheck & Build:** `pnpm --filter @sms/api build`, `pnpm --filter @sms/worker build`, and `pnpm --filter @sms/web build` pass with zero errors.