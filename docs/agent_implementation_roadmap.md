# Agent Execution Direction: Live Database Seeding, Mock Removal & Production Completion

> **Target Audience:** AI Coding Agent  
> **Repository:** `collage-management-system` (Nx + pnpm Monorepo)  
> **Current Baseline:** PostgreSQL 16 schemas/triggers applied; Auth + Redis OTP + Gmail SMTP + Role Approval verified live.  
> **Primary Objective:** Eliminate all remaining in-memory mock fallbacks (`databaseStore`), seed institutional data into PostgreSQL, and complete P1/P2 worker, IAM, storage, and test deliverables.

---

## 0. Mandatory Guardrails Before Coding

1. **Follow Repository Skills:** Read `.agents/skills/skill.md` before modifying files and update `CHANGELOG.MD` upon completing each phase.
2. **Preserve Completed Auth Work:** Do **not** regress the live PostgreSQL/Redis/SMTP authentication and role-approval flows in `apps/api/src/modules/auth/` or `apps/worker/src/processors/notification.processor.ts`.
3. **Zero Mock Fallbacks:** Never re-introduce hardcoded arrays or in-memory stores in `apps/web` or `apps/api`. All reads and writes must hit PostgreSQL via Drizzle ORM.
4. **Respect Financial & Audit Invariants:**
   - Never run `UPDATE` or `DELETE` on `finance.ledger_entry` or `audit.log` (append-only triggers are active).
   - Enforce Maker-Checker separation (`approved_by !== created_by`) on period close and payroll approvals.

---

## 1. Phase 1 (P0 — Immediate): Institutional Seed Script & Full Mock Removal

### 1.1 Create Idempotent Database Seed (`packages/database/src/seed.ts`)
Create `packages/database/src/seed.ts` using Drizzle ORM (`@sms/database`) and `DATABASE_ADMIN_URL` (or `DATABASE_URL`) with `onConflictDoNothing()` / upsert semantics so running it multiple times is safe. Seed realistic data for **Dhaka Model College**:

- **`academic` Schema:**
  - Academic Year: `2026` (`isActive: true`).
  - Terms: `First Term 2026`, `Mid-Term 2026`, `Final Term 2026`.
  - Classes & Groups: `Class 11` and `Class 12` across `Science`, `Commerce`, and `Humanities`.
  - Sections: `Section A`, `Section B` per class/group.
  - Subjects & Teacher Allocations: Physics, Chemistry, Higher Mathematics, Biology, Accounting, Finance & Banking, Economics, Bangla, English, ICT.
- **`people` Schema:**
  - Seed initial active staff in `people.staff` covering all institutional roles (`ADMIN`, `PRINCIPAL`, `TEACHER`, `OFFICE`, `FINANCE`) with sequential employee IDs (`EMP-2026-001` through `EMP-2026-010`).
  - Seed sample guardians and students in `people.student` across Class 11 & 12 sections (linked to `academic` classes/sections) if fewer than 10 students exist.
- **`leave` Schema:**
  - Institutional holiday calendar for `2026` and initial annual/casual/medical leave balances for seeded staff.
- **`finance` Schema:**
  - Monthly Tuition, Lab Fee, and Exam Fee schedules for Class 11 & 12.
  - Sample generated invoices and balanced double-entry rows in `finance.ledger_entry` (Debit Cash/Bank, Credit Fee Receivable/Revenue).
- **`notice` Schema:**
  - 3–5 bilingual (English + Bangla) institutional notices (`PUBLISHED`) so full-text `tsvector` search works immediately.

### 1.2 Register Seed Scripts
- Add `"db:seed": "tsx src/seed.ts"` to `packages/database/package.json`.
- Add `"db:seed": "pnpm --filter @sms/database db:seed"` to the root `package.json`.

### 1.3 Purge `databaseStore` Fallback (`apps/web/src/app/api/v1/[...slug]/route.ts`)
- Open `apps/web/src/app/api/v1/[...slug]/route.ts`.
- **Delete** the entire in-memory `databaseStore` object and all fallback handlers that return fake records when `apps/api` is unreachable or returns empty results.
- Ensure all `GET`, `POST`, `PUT`, `PATCH`, and `DELETE` requests proxy cleanly to `${process.env.API_BASE_URL || 'http://localhost:4000'}/api/v1/...` (forwarding `Authorization`, `x-request-id`, and `Content-Type` headers) and pass through the exact backend HTTP status code and JSON body.
- Check `apps/web/src/lib/auth-context.tsx`: ensure the dev persona switcher (if retained for local QA) authenticates against real backend endpoints or issues valid dev JWTs rather than bypassing API persistence.

### Phase 1 Verification
- Run `pnpm db:seed` twice (confirming idempotency and zero trigger errors).
- Verify non-zero row counts across `academic`, `people`, `finance`, `leave`, and `notice` schemas in PostgreSQL.
- Open `/academic`, `/students`, `/staff`, `/attendance`, `/leave`, `/finance`, `/payroll`, and `/notices` in `apps/web` and confirm all data loads from PostgreSQL.

---

## 2. Phase 2 (P1): Standalone Keycloak SSO & Google OAuth Wiring

1. **Docker Compose & Realm Configuration (`docker-compose.yml` & `infra/keycloak/realm-export.json`):**
   - Ensure `docker-compose.yml` starts `sms-keycloak` on port `8080` (and avoids port collisions if another local Postgres container is already bound to `5432`—document `POSTGRES_PORT` override in `.env.example` if needed).
   - Verify `infra/keycloak/realm-export.json` imports the `sms` realm, all 7 RBAC roles (`ADMIN`, `PRINCIPAL`, `TEACHER`, `OFFICE`, `FINANCE`, `STUDENT`, `PARENT`), client `sms-web`, and the Google Identity Provider (`google`) configuration.
2. **Backend & Frontend OIDC Handshake:**
   - Verify `apps/api/src/shared/guards/jwt.guard.ts` validates both Keycloak RS256 JWKS tokens and native fallback JWTs seamlessly.
   - Verify `apps/web/src/app/(auth)/login/page.tsx` ("Continue with Google" / OIDC redirect with `kc_idp_hint=google`) and `apps/web/src/app/(auth)/callback/page.tsx` exchange authorization codes with `apps/api` and upsert/link the user profile in `people.student` or `people.staff`.

---

## 3. Phase 3 (P1): Production Background Processors (`apps/worker`)

Implement real business logic in the three stubbed processors under `apps/worker/src/processors/`:

### 3.1 PDF Generation Engine (`pdf-generation.processor.ts`)
- Install `pdfkit` (or `@react-pdf/renderer`) in `apps/worker`:
  ```bash
  pnpm --filter @sms/worker add pdfkit
  pnpm --filter @sms/worker add -D @types/pdfkit
  ```
- Implement structured PDF generators for:
  1. **Fee Payment Receipt** (Institution header, receipt no., student admission no., line items, paid BDT amount, timestamp).
  2. **Monthly Staff Payslip** (Employee no., designation, basic/allowances/deductions breakdown, net payable BDT).
  3. **Student ID Card** (Student name, admission no., class/section, session year).
- Upload the generated PDF buffer to S3/MinIO (see Phase 4.1) and persist the resulting object key/URL back to the corresponding database record.

### 3.2 Bangladesh Bank 128-Byte BEFTN Formatter (`beftn-dispatch.processor.ts`)
- Implement strict **128-character fixed-width ASCII line formatting** per Bangladesh Electronic Funds Transfer Network (BEFTN) batch specifications:
  - **File Header Record (`Record Type 1`):** Originator bank routing number, company ID, file creation date/time (`YYMMDD`/`HHMM`), format code.
  - **Batch Header Record (`Record Type 5`):** Effective entry date, batch number, currency (`BDT`).
  - **Entry Detail Records (`Record Type 6`):** Receiving bank 9-digit routing number, DFI account number (zero/space padded), transaction code (`22` for checking credit), amount in **paisa** (12 digits, zero-padded), employee ID, employee name (22 chars fixed).
  - **Batch & File Control Trailers (`Record Type 8` & `9`):** Entry hash totals, total credit dollar/paisa amount, and line count validation (`line.length === 128` assertion on every line).
- Store the generated `.txt` batch file in S3/MinIO and record batch metadata in `payroll`.

### 3.3 MFS Payment Webhook Reconciliation (`payment-reconcile.processor.ts` & `apps/api/src/modules/finance/`)
- Add webhook endpoints in `apps/api/src/modules/finance/controllers/payment.controller.ts` for **bKash IPN**, **Nagad**, and **SSLCommerz** callbacks with HMAC/signature verification and idempotency key checks (`transactionId`).
- Enqueue `RECONCILE_PAYMENT` into `outbox.job`.
- In `payment-reconcile.processor.ts`, verify transaction status, mark the invoice `PAID` (or `PARTIALLY_PAID`), and insert balanced double-entry rows into `finance.ledger_entry` inside a single PostgreSQL transaction.

---

## 4. Phase 4 (P2): MinIO / S3 Storage, Biometric Ingest & E2E Tests

1. **Object Storage (`apps/api/src/shared/s3/s3.service.ts` & `docker-compose.yml`):**
   - Add a `minio` service (ports `9000` API, `9001` Console) to `docker-compose.yml` with default bucket `sms-documents`.
   - Implement real `@aws-sdk/client-s3` + `@aws-sdk/s3-request-presigner` methods in `S3Service` for presigned `PUT` (student photos, birth certificates) and presigned `GET` URLs (receipts, payslips, BEFTN files).
2. **Biometric Device Attendance Ingest (`apps/api/src/modules/attendance/`):**
   - Secure `POST /api/v1/attendance/device` with a `DEVICE_API_KEY` header guard, deduplicate punch events within a configurable window (e.g., 5 minutes), update `attendance.daily_summary`, and enqueue `ABSENTEE_SMS_ALERT` into `outbox.job` after cutoff time.
3. **Automated Integration & E2E Tests (`apps/api`):**
   - Add Vitest integration tests covering:
     - Append-only enforcement (verifying SQL `UPDATE`/`DELETE` on `finance.ledger_entry` throws a PostgreSQL exception).
     - Maker-Checker enforcement (verifying `created_by === approved_by` fails on `payroll.payroll_run` and period close).
     - Idempotent MFS webhook processing (duplicate webhook calls produce only one ledger entry).
     - BEFTN 128-byte line length and control-total reconciliation.

---

## 5. Final Verification Checklist

Before concluding work, the agent must verify and report:
- [x] `pnpm db:seed` populates all institutional modules cleanly and idempotently.
- [x] `apps/web/src/app/api/v1/[...slug]/route.ts` contains zero `databaseStore` mock data.
- [x] `apps/worker` generates real PDF buffers and valid 128-byte BEFTN batch files.
- [x] `S3Service` generates working presigned URLs against MinIO/S3.
- [x] All Vitest unit/integration tests pass (`pnpm test`) and all workspaces build cleanly (`pnpm build`).
- [x] `CHANGELOG.MD` is updated with all changes.