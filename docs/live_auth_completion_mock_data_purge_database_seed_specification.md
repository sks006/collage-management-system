# Specification: Live Auth Completion, Mock Data Purge & Database Seeding

> **Target Audience:** AI Coding Agent & Engineering Contributors  
> **Repository:** `collage-management-system` (Nx + pnpm Monorepo)  
> **Scope:** `apps/api`, `apps/web`, `apps/worker`, `packages/database`, `infra/keycloak`  
> **Execution Order:** **Stage 1 (Real Auth)** $\rightarrow$ **Stage 2 (Mock Purge)** $\rightarrow$ **Stage 3 (DB & Keycloak Seed)**  
> **Related Docs:**
> - `docs/authentication_and_authorization_specification.md`
> - `docs/frontend_api_gateway_architecture.md`
> - `docs/onboarding_and_verification_specification.md`
> - `infra/keycloak/realm-export.json`
> - `.agents/skills/skill.md`

---

## 1. Objective & Strict Execution Sequence

To transition the **Dhaka Model College School Management System** from development fallbacks to a 100% live, database-backed system, execute the following three stages in strict order:

1. **Stage 1 — Complete Real Login, Registration & RBAC Auth:** Remove all unauthenticated dev bypasses, fake `jwt-sms-access-*` tokens, `demoOtp` responses, and `DEMO_PERSONAS` UI shortcuts. Enforce real Keycloak OIDC + JWKS verification, Redis OTP storage, Gmail SMTP delivery, and dashboard route guards.
2. **Stage 2 — Purge All Remaining Mock Data:** Delete any remaining `databaseStore` arrays, hardcoded persona objects, and fallback actor UUIDs (`00000000-0000-0000-0000-000000000001`).
3. **Stage 3 — Push Idempotent Seed Data into PostgreSQL & Keycloak:** Update `packages/database/src/seed.ts` so `pnpm db:seed` provisions real users in Keycloak (`realm: sms`) and inserts matching institutional records across all 9 PostgreSQL schemas linked via `keycloak_user_id`.

---

## 2. Environment & Infrastructure Prerequisites

### 2.1 Required `.env` Configuration

Ensure `.env` (and `.env.example`) defines the following variables so `apps/api`, `apps/worker`, `apps/web`, and `packages/database` connect to live services without falling back to mocks:

```env
# PostgreSQL (Superuser for migrations/seed, least-privilege sms_api for runtime)
DATABASE_URL=postgresql://sms_api:sms_api_password@127.0.0.1:5432/sms
DATABASE_ADMIN_URL=postgresql://postgres:postgres@127.0.0.1:5432/sms

# Redis (OTP storage & rate limiting)
REDIS_URL=redis://127.0.0.1:6379

# Keycloak OIDC & Admin API
STRICT_AUTH=true
KEYCLOAK_URL=http://127.0.0.1:8080
KEYCLOAK_REALM=sms
KEYCLOAK_CLIENT_ID=sms-web
KEYCLOAK_CLIENT_SECRET=sms-web-secret
KEYCLOAK_ADMIN_CLIENT_ID=admin-cli
KEYCLOAK_ADMIN_USERNAME=admin
KEYCLOAK_ADMIN_PASSWORD=admin
JWT_ISSUER=http://localhost:8080/realms/sms
JWT_AUDIENCE=sms-api

# OTP Hashing & Gmail SMTP
OTP_HASH_SECRET=replace-with-strong-32-char-random-secret
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-college-noreply@gmail.com
SMTP_PASSWORD=your-16-char-google-app-password
MAIL_FROM_NAME="Dhaka Model College SMS"
MAIL_FROM_ADDRESS=your-college-noreply@gmail.com
```

### 2.2 Infrastructure Health Check

Confirm PostgreSQL, Redis, and Keycloak are up before running migrations or tests:

```bash
docker compose up -d postgres redis keycloak
docker compose ps
```

---

## 3. Stage 1: Complete Real Login, Registration & Auth

### 3.1 Backend Auth Hardening (`apps/api`)

1. **Strict JWT Verification (`apps/api/src/shared/guards/jwt.guard.ts`):**
   - Remove any unauthenticated development fallback (`if (!authHeader && process.env.NODE_ENV === "development")`) so every `@UseGuards(JwtGuard)` route requires a valid `Authorization: Bearer <token>`.
   - Verify RS256 tokens against Keycloak's JWKS endpoint (`${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/certs`).
   - Load the user's active institutional profile (`people.staff` or `people.student`) by `keycloak_user_id` (or `email`) and attach `{ id, sub, email, roles, staffId, studentId }` to `request.user`.

2. **Real Keycloak, Redis & PostgreSQL Auth Service (`apps/api/src/modules/auth/services/auth.service.ts`):**
   - **`getAdminToken()`:** Authenticate against `${KEYCLOAK_URL}/realms/master/protocol/openid-connect/token` using `grant_type=password`, `client_id=admin-cli`, `username=process.env.KEYCLOAK_ADMIN_USERNAME`, and `password=process.env.KEYCLOAK_ADMIN_PASSWORD`. If Keycloak is unreachable or rejects credentials, throw `ServiceUnavailableException("Identity provider unavailable")`—never return mock `kc-*` IDs.
   - **`login(email, password)`:**
     - Exchange credentials with `${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/token` (`grant_type=password`, `client_id=sms-web`).
     - If Keycloak returns `400`/`401`, throw `UnauthorizedException("Invalid email or password")`—remove all fake `jwt-sms-access-*` token generators.
     - Query `people.staff`, `people.student`, and `people.role_request`:
       - If user has a `PENDING` or `REJECTED` row in `people.role_request` and no active `people.staff` profile, throw `ForbiddenException("Account is awaiting administrator role approval")`.
       - Return `{ user, accessToken, refreshToken, expiresIn }`.
   - **`register(dto)`:**
     - Validate email uniqueness in `people.student`, `people.staff`, and `people.role_request` (`409 Conflict`).
     - Enforce 60-second Redis cooldown (`auth:otp:cooldown:${email}`).
     - Create user in Keycloak (`enabled: true`, `emailVerified: false`, `credentials: [{ type: "password", value: dto.password, temporary: false }]`).
     - Store `{ codeHash, attempts: 0, keycloakUserId, registrationData }` in Redis (`auth:otp:${email}`, `EX 600`).
     - Insert `SEND_OTP_EMAIL` into `outbox.job` and `USER_REGISTERED` into `audit.log`.
     - **Do not** return `demoOtp` in the HTTP response.
   - **`verifyOtp(email, otp)`:**
     - Verify HMAC-SHA256 hash against Redis (`max 5 attempts`), delete Redis key, and update Keycloak user to `emailVerified: true`.
     - If `requestedRole` is `STUDENT` or `PARENT`: assign Keycloak realm role, insert real record into `people.student` inside a PostgreSQL transaction, exchange credentials with Keycloak for real `accessToken` and `refreshToken`, and return `{ status: "ACTIVE", user, accessToken, refreshToken }`.
     - If `requestedRole` is `TEACHER`, `FINANCE`, or `OFFICE`: insert `PENDING` record into `people.role_request`, enqueue `ADMIN_ROLE_REQUEST` into `outbox.job`, and return `{ status: "PENDING_APPROVAL", requestId }`.
   - **`approveRoleRequest(requestId, adminUser, roleOverride?)`:**
     - Inside a PostgreSQL transaction, update `people.role_request` (`status: "APPROVED"`, `reviewedBy: adminUser.id`, `reviewedAt: new Date()`), generate sequential `employeeNo` (`EMP-2026-XXX`), insert active row into `people.staff` with `keycloakUserId`, assign the role in Keycloak via Admin API, enqueue `SEND_ROLE_APPROVED_EMAIL` into `outbox.job`, and log to `audit.log`.

3. **Replace Fallback Actor UUIDs (`apps/api/src/shared/audit/audit.service.ts` & `payment.service.ts`):**
   - Replace any hardcoded `"00000000-0000-0000-0000-000000000001"` actor ID with the authenticated `user.id` from the request context (or a dedicated system constant only for unauthenticated MFS bank webhooks).

### 3.2 Frontend Auth & Route Guards (`apps/web`)

1. **`apps/web/src/lib/auth-context.tsx` & `apps/web/src/lib/auth.ts`:**
   - Remove `DEMO_PERSONAS`, `switchPersona()`, and any hardcoded default user (`"Dr. Rafiqul Islam"`).
   - Initialize `user` to `null` and `isLoading` to `true`.
   - On mount, check `localStorage.getItem("sms_access_token")`; if present, call `authService.me()` (`GET /api/v1/auth/me`) to hydrate `user`, clearing invalid tokens on `401`.
   - Store `accessToken` and `refreshToken` on `login()` and `verifyOtp()`, and clear both + redirect to `/login` on `logout()`.

2. **Protect Dashboard Routes (`apps/web/src/app/(dashboard)/layout.tsx`):**
   - Check `useAuth()`: while `isLoading` is `true`, show a clean loading skeleton; if `!isLoading && !user`, call `router.replace("/login")` so unauthenticated visitors cannot access dashboard screens.

3. **Clean Up Auth Pages & Navbar:**
   - **`apps/web/src/app/(auth)/login/page.tsx`:** Remove Quick Persona Switch buttons; submit email + password exclusively to `authService.login()` or redirect to Keycloak OIDC (`kc_idp_hint=google`).
   - **`apps/web/src/app/(auth)/callback/page.tsx`:** Remove `handleUseDemoAdmin` ("Continue with Admin Persona") fallback button.
   - **`apps/web/src/app/(auth)/register/page.tsx`:** Remove any `demoOtp` display/auto-fill banner so users enter the real 6-digit OTP sent by `apps/worker` via Gmail SMTP.
   - **`apps/web/src/components/shared/navbar.tsx`:** Remove the "Switch Active Persona" dropdown; display the real logged-in user's `name`, `email`, primary role badge, and `Sign Out` button.

---

## 4. Stage 2: Purge All Remaining Mock Data

1. **Verify BFF Proxy (`apps/web/src/app/api/v1/[...slug]/route.ts`):**
   - Ensure zero `databaseStore` arrays or fallback handlers exist anywhere in `route.ts`. Every `GET`, `POST`, `PUT`, `PATCH`, and `DELETE` request must forward directly to `${process.env.API_URL || "http://127.0.0.1:4000"}/api/v1/...` and return the real upstream status code.

2. **Repository-Wide Mock Audit:**
   Run the following grep check across `apps/` and `packages/` and remove every match:
   ```bash
   grep -rnE "DEMO_PERSONAS|databaseStore|jwt-sms-access|demoOtp|handleUseDemoAdmin|switchPersona|00000000-0000-0000-0000-000000000001" apps/ packages/
   ```

---

## 5. Stage 3: Push Idempotent Seed Data to PostgreSQL & Keycloak

Because `RowScopeMiddleware` (`apps/api/src/shared/middleware/row-scope.middleware.ts`) resolves permissions and row-level ownership via `keycloak_user_id`, **`packages/database/src/seed.ts` must synchronize users between Keycloak (`realm: sms`) and PostgreSQL**.

### 5.1 Keycloak + PostgreSQL Sync in `packages/database/src/seed.ts`

1. **Idempotent Keycloak User Provisioning Helper (`ensureKeycloakUser`):**
   - Authenticate against `${KEYCLOAK_URL}/realms/master/protocol/openid-connect/token` (`admin-cli`).
   - Look up user by email (`GET /admin/realms/sms/users?email=...`).
   - If not found, create user (`POST /admin/realms/sms/users` with `enabled: true`, `emailVerified: true`, and password `College@2026`).
   - Fetch the realm role representation (`GET /admin/realms/sms/roles/${roleName}`) and assign it (`POST /admin/realms/sms/users/${kcUserId}/role-mappings/realm`).
   - Return `kcUserId` so it is saved directly into `people.staff.keycloak_user_id` or `people.student.keycloak_user_id`.

2. **Seeded Institutional Accounts (Default Password: `College@2026`):**

| Email | Keycloak Role(s) | PostgreSQL Table & ID | Name / Designation |
| :--- | :--- | :--- | :--- |
| `principal@dhakamodel.edu.bd` | `ADMIN`, `PRINCIPAL` | `people.staff` (`EMP-2026-001`) | Dr. Rafiqul Islam — Principal |
| `vice.principal@dhakamodel.edu.bd` | `PRINCIPAL` | `people.staff` (`EMP-2026-002`) | Dr. Mohammad Harun — Vice Principal |
| `rahim.physics@dhakamodel.edu.bd` | `TEACHER` | `people.staff` (`EMP-2026-003`) | Rahim Ahmed — Senior Lecturer (Physics) |
| `nasrin.math@dhakamodel.edu.bd` | `TEACHER` | `people.staff` (`EMP-2026-004`) | Nasrin Sultana — Lecturer (Mathematics) |
| `admissions@dhakamodel.edu.bd` | `OFFICE` | `people.staff` (`EMP-2026-006`) | Farhana Yasmin — Head Admin Officer |
| `finance@dhakamodel.edu.bd` | `FINANCE` | `people.staff` (`EMP-2026-007`) | Kamal Hossain — Chief Accounts Officer |
| `tanvir.student@dhakamodel.edu.bd` | `STUDENT` | `people.student` (`DMC-2026-001`) | Tanvir Hasan — Class 11 Science (Padma) |
| `parent.kalam@gmail.com` | `PARENT` | `people.student.guardian_keycloak_id` | Abul Kalam (Guardian of `DMC-2026-001`) |

3. **Idempotent Institutional Domain Seed (All 9 Schemas):**
   - Use `.onConflictDoNothing()` (or `.onConflictDoUpdate()`) on every insert in `packages/database/src/seed.ts`:
     - **`academic`:** Academic Year `2026`, 3 Terms, Classes `11` & `12` (`Science`, `Commerce`, `Humanities`), Sections (`Padma`, `Meghna`), Subjects, and `teacher_section` allocations for `EMP-2026-003` and `EMP-2026-004`.
     - **`people`:** All 10 staff members (`EMP-2026-001`..`010`), 10+ enrolled students (`DMC-2026-001`..`010`), and `people.enrollment` mappings.
     - **`attendance`:** Historical Feb 2026 locked `period_close` snapshot (Maker-Checker compliant: `submitted_by !== approved_by`) and Mar 2026 active period.
     - **`finance`:** Tuition, Lab, and Exam `fee_schedule` rows, student `invoice` rows, and balanced double-entry `ledger_entry` rows (`SUM(DEBIT) === SUM(CREDIT)`).
     - **`payroll`:** Feb 2026 `payroll_run` and `payroll_line` records linked to `people.staff` bank accounts.
     - **`leave`:** 2026 holiday calendar and staff leave allocations.
     - **`notice`:** 4 bilingual (English + Bangla) `PUBLISHED` institutional notices.

---

## 6. Verification & Acceptance Checklist

Run the following commands to verify every stage end-to-end:

```bash
# 1. Start PostgreSQL, Redis, and Keycloak
docker compose up -d postgres redis keycloak

# 2. Apply migrations & SQL triggers/roles (if starting from a clean volume)
DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:5432/sms" pnpm db:migrate
docker exec -i sms-postgres psql -U postgres -d sms < infra/docker/postgres/init.sql

# 3. Push idempotent seed data into both Keycloak and PostgreSQL (run twice to verify idempotency)
pnpm db:seed
pnpm db:seed

# 4. Verify Keycloak UUID linkage in PostgreSQL
docker exec -it sms-postgres psql -U postgres -d sms -c "SELECT employee_no, email, keycloak_user_id FROM people.staff WHERE keycloak_user_id IS NOT NULL; SELECT admission_no, email, keycloak_user_id FROM people.student WHERE keycloak_user_id IS NOT NULL;"

# 5. Run automated invariant tests & full monorepo build
pnpm --filter @sms/api test
pnpm build
```

### Manual Acceptance Gates

- [ ] Visiting `http://localhost:3000` while logged out redirects automatically to `/login` (no default static Admin persona).
- [ ] Signing in as `principal@dhakamodel.edu.bd` / `College@2026` issues a real Keycloak RS256 JWT and loads real PostgreSQL data across all dashboard routes.
- [ ] Signing in as `rahim.physics@dhakamodel.edu.bd` / `College@2026` scopes views to Teacher permissions and assigned sections.
- [ ] Registering a new Student with a real `@gmail.com` address sends a 6-digit OTP via `apps/worker` Gmail SMTP, creates the Keycloak user, and inserts a new row into `people.student`.
- [ ] Registering a new Teacher creates a `PENDING` row in `people.role_request`, and approving it as Principal/Admin inserts a new row into `people.staff` and assigns the `TEACHER` role in Keycloak.