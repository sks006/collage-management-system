# 🏛️ Part 1: Total System Modules (11 Bounded Contexts)

The system is built as a **Modular Monolith**. Every module owns its PostgreSQL schema, communicates asynchronously via the transactional Postgres Outbox (`outbox.job`), and enforces compile-time isolation via `@nx/enforce-module-boundaries`.

### 🟢 Core & Platform
1. **Identity & Access (`auth`)**
2. **Academic Structure (`academic`)**
3. **People — Students & Staff (`people`)**

### 🔵 Attendance & Time
4. **Attendance — Student & Staff (`attendance`)**
5. **Leave & Calendar (`leave`)**
6. **Period Close — The Gate (`attendance/period-close`)**

### 🟣 Financials
7. **Student Finance — Ledger, Invoices & Payments (`finance`)**
8. **Payroll — Runs, Computation & BEFTN Dispatch (`payroll`)**

### 🟡 Support & System
9. **Notices & Communication (`notice`)**
10. **Search (`search`)**
11. **System — Outbox, Audit, S3/R2 & Observability (`shared`)**

---

# 📋 Part 2: Module Specifications & Definition-of-Done Checklists

---

## 1. Identity & Access (`auth`)
* **Purpose:** Authenticate users via self-hosted Keycloak (OIDC + Google Workspace OAuth), validate stateless JWTs, enforce the 7 RBAC roles, and attach row-level data scopes.
* **Key Entities:** Users and roles live in Keycloak (`infra/keycloak/realm-export.json`); linked via `keycloak_user_id` on `people.staff` and `people.student`.
* **Files:** `apps/api/src/modules/auth/*`, `apps/api/src/shared/guards/{jwt,roles}.guard.ts`, `apps/api/src/shared/middleware/request-id.middleware.ts`, `apps/web/src/lib/auth.ts`.

**Checklist:**
- [x] Keycloak realm export created (`infra/keycloak/realm-export.json`) with the 7 canonical roles: `ADMIN`, `PRINCIPAL`, `TEACHER`, `OFFICE`, `FINANCE`, `STUDENT`, `PARENT`.
- [x] Custom NestJS `JwtGuard` (`jose` JWKS verification) and `RolesGuard` scaffolded.
- [ ] Configure Google/Gmail Identity Brokering and SMTP password-reset flows in Keycloak.
- [ ] Enforce mandatory MFA for `ADMIN`, `PRINCIPAL`, and `FINANCE` roles.
- [ ] Implement bulk Keycloak Admin REST API provisioning in `auth.service.ts` (20k accounts).
- [ ] Complete `RowScope` middleware attachment (`TEACHER` -> `sectionIds`, `STUDENT`/`PARENT` -> `studentIds`).
- [ ] Wire Next.js HTTP-only cookie auth shield in `apps/web/src/app/(dashboard)/layout.tsx`.

---

## 2. Academic Structure (`academic`)
* **Purpose:** Define institutional hierarchy and teacher-to-section mappings required for attendance and row-level security.
* **Key Entities:** `academic_year`, `term`, `class`, `section` (`DAILY` vs `PER_PERIOD` mode), `subject`, `teacher_section`.
* **Dependencies:** `people` (Staff).

**Checklist:**
- [x] Drizzle schema `packages/database/src/schema/academic.ts` created.
- [x] NestJS `academic` controller, service, and repository scaffolded.
- [ ] Complete Zod request/response DTOs in `apps/api/src/modules/academic/dtos/academic.dto.ts`.
- [ ] Implement bulk teacher-to-section assignment endpoint (`POST /api/v1/academic/teacher-assignments`).
- [ ] Build Next.js admin forms & server actions on `/academic` for full hierarchy setup.
- [ ] Emit `audit.log` entries on all academic structure mutations.

---

## 3. People — Students & Staff (`people`)
* **Purpose:** Maintain authoritative records of students, guardians, staff, and term enrollments.
* **Key Entities:** `student`, `staff`, `enrollment`.
* **Dependencies:** `academic`, `auth`.

**Checklist:**
- [x] Drizzle schema `packages/database/src/schema/people.ts` and shared Zod schemas created.
- [x] NestJS `student` and `staff` controllers, services, and repositories scaffolded.
- [ ] Add Postgres `pg_trgm` and FTS indexes on `full_name`, `admission_no`, and `employee_no`.
- [ ] Implement streaming/batched CSV bulk import (`POST /api/v1/students/import`, 20k rows < 5 min).
- [ ] Enforce `RowScope` filtering on student queries so teachers only see assigned sections.
- [ ] Log every sensitive PII read/update to `audit.log`.
- [ ] Complete `/students` and `/staff` UI tables, CSV importer, and enrollment modals.

---

## 4. Attendance — Student & Staff (`attendance`)
* **Purpose:** Capture high-volume daily and per-period attendance from teachers and LAN biometric/RFID devices.
* **Key Entities:** `period_event` (range-partitioned by `event_date`), `daily_summary` (Materialized View), `correction_request`.
* **Dependencies:** `academic`, `people`.

**Checklist:**
- [x] Drizzle schema `packages/database/src/schema/attendance.ts` and `attendance.actions.ts` created.
- [x] NestJS `attendance` controller, service, and repository scaffolded.
- [ ] Add hand-written SQL migration for `attendance.period_event` monthly range partitioning + 60-day ahead partition scheduler job.
- [ ] Create `attendance.daily_summary` Materialized View with unique index for concurrent refresh.
- [ ] Implement atomic `POST /api/v1/attendance/batch` (40 rows < 100ms) + outbox `NOTIFY_ABSENTEE_PARENTS` (deduped).
- [ ] Implement VLAN-scoped `POST /api/v1/attendance/device` with per-device HMAC signature verification.
- [ ] Implement correction request workflow (Teacher submits -> Admin/Principal approves -> Audit logged).
- [ ] Load test 500 concurrent teachers at p95 < 500ms.

---

## 5. Leave & Calendar (`leave`)
* **Purpose:** Track official school holidays/weekends, staff leave balances, approvals, and substitute teachers so approved absences are not deducted from payroll.
* **Key Entities:** `calendar_day`, `leave_type`, `leave_request`, `substitution`.
* **Dependencies:** `people`, `academic`.

**Checklist:**
- [x] Drizzle schema `packages/database/src/schema/leave.ts` and NestJS `leave` module scaffolded.
- [ ] Implement school calendar CRUD and bulk holiday import (`GET/POST /api/v1/leave/calendar`).
- [ ] Implement leave request submission and Maker-Checker approval (`POST /api/v1/leave`, `/approve`).
- [ ] Implement leave balance accrual/deduction calculation and substitute teacher assignment.
- [ ] Build `apps/web/src/app/(dashboard)/leave/page.tsx` and server actions for staff requests and HR approval queue.

---

## 6. Period Close — The Gate 🔒 (`attendance/period-close`)
* **Purpose:** Freeze monthly attendance into an immutable snapshot before payroll calculation begins.
* **Key Entities:** `period_close`.
* **Dependencies:** `attendance`, `leave`.

**Checklist:**
- [x] `period-close.controller.ts`, `period-close.service.ts`, `period-close.repository.ts`, and `/attendance/period-close/page.tsx` scaffolded.
- [ ] Implement summary aggregation combining `period_event`, approved `leave_request`, and `calendar_day`.
- [ ] Enforce DB `CHECK (approved_by IS NULL OR approved_by <> submitted_by)` Maker-Checker constraint.
- [ ] Enforce DB role isolation: revoke `SELECT` on `attendance.period_event` from `sms_payroll_reader`; grant `SELECT` only on `attendance.period_close` (`status IN ('APPROVED', 'LOCKED')`).
- [ ] Implement post-close adjustment flow that posts deltas to the next open period without mutating locked snapshots.

---

## 7. Student Finance — Ledger, Invoices & Payments (`finance`)
* **Purpose:** Manage fee schedules, bulk invoicing, local MFS/card payments (SSLCommerz/aamarPay), and an immutable append-only financial ledger.
* **Key Entities:** `ledger_entry` (append-only), `fee_schedule`, `invoice`, `payment`, `adjustment`, `reconciliation_run`.
* **Dependencies:** `people`, `academic`.

**Checklist:**
- [x] Drizzle schema `packages/database/src/schema/finance.ts`, `finance` API module (`invoice`, `ledger`, `payment`), `payment.actions.ts`, and `/finance` page scaffolded.
- [ ] Enforce append-only triggers & grants on `finance.ledger_entry` (forbid `UPDATE`/`DELETE`; allow only offsetting `reversal_of` rows).
- [ ] Implement background bulk invoice generator (20k invoices in < 10 min via chunked outbox jobs).
- [ ] Implement `POST /api/v1/finance/payments/initiate` (with `Idempotency-Key`) and IPN webhook handler (signature check + aggregator validation API + amount/currency/tran_id match).
- [ ] Complete `payment-reconcile.processor.ts` for 5-minute stale payment polling and daily 02:00 settlement reconciliation.
- [ ] Complete `pdf-generation.processor.ts` to upload PDF receipts to Cloudflare R2 and trigger deduped SMS links.
- [ ] Implement Maker-Checker waivers/scholarships (`POST /api/v1/finance/waivers`).

---

## 8. Payroll — Runs, Computation & Dispatch (`payroll`)
* **Purpose:** Compute monthly staff salaries strictly from approved `period_close` records and dispatch bulk bank payouts via BEFTN.
* **Key Entities:** `payroll_run`, `payroll_line`, `dispatch_batch`, `payslip`.
* **Dependencies:** `attendance/period-close`, `people`, `finance`.

**Checklist:**
- [x] Drizzle schema `packages/database/src/schema/payroll.ts`, `payroll` API module, `/payroll` page, and worker processors scaffolded.
- [ ] Enforce `PayrollRun` state machine (`DRAFT -> PENDING_APPROVAL -> APPROVED -> DISPATCHED -> PAID`) and DB `maker_neq_checker` constraint (`approved_by <> created_by`).
- [ ] Complete `payroll-compute.processor.ts` reading exclusively from approved `period_close` snapshots.
- [ ] Complete `beftn-dispatch.processor.ts` generating bank BEFTN CSV/payloads to Cloudflare R2 and posting to `finance.ledger_entry`.
- [ ] Implement failed payout retry queue (`POST /api/v1/payroll/failed-lines/{id}/retry`) and R2 payslip PDF generation.
- [ ] Execute 1-month parallel payroll verification against legacy calculations before cutover.

---

## 9. Notices & Communication (`notice`)
* **Purpose:** Publish role-targeted announcements in Bangla and English and dispatch deduped SMS/Email/In-App notifications.
* **Key Entities:** `notice`.
* **Dependencies:** `people`, `shared/outbox`.

**Checklist:**
- [x] Drizzle schema `packages/database/src/schema/notice.ts`, `notice` API module, and `/notices` page scaffolded.
- [ ] Add `tsvector` GIN index for Bangla/English notice search.
- [ ] Implement `POST /api/v1/notices/{id}/publish` enqueueing deduped `SEND_NOTICE` outbox jobs.
- [ ] Complete `notification.processor.ts` with provider rate-limiting and deduplication.

---

## 10. Search (`search`)
* **Purpose:** Fast, safe lookup returning entity IDs only; full rows and permissions are always resolved through PostgreSQL.
* **Key Entities:** Reads indexes on `people.student`, `people.staff`, and `notice.notice`.
* **Dependencies:** `people`, `notice`.

**Checklist:**
- [x] NestJS `search` controller, service, and repository scaffolded.
- [ ] Implement `GET /api/v1/search/students`, `/staff`, and `/notices` returning IDs + minimal display labels only.
- [ ] Enforce `RowScope` filtering after ID lookup so unauthorized records are never returned.
- [ ] Run Bangla recall benchmark (200 queries across 20k names); trigger Meilisearch spike only if Postgres recall fails threshold.

---

## 11. System — Outbox, Audit, S3/R2 & Observability (`shared`)
* **Purpose:** Provide transactional background job execution, immutable audit trails, S3/R2 signed URL storage, and telemetry.
* **Key Entities:** `outbox.job`, `audit.log`.
* **Dependencies:** None.

**Checklist:**
- [x] `outbox.ts` & `audit.ts` schemas, `OutboxService`, `AuditService`, `S3Service`, `OutboxConsumer` (`FOR UPDATE SKIP LOCKED`), and Prometheus/Grafana configs created.
- [ ] Add stuck-row visibility timeout reclaimer and dead-letter queue (`DEAD` status) alerting in `outbox-consumer.ts`.
- [ ] Enforce append-only SQL trigger & `INSERT`-only DB grant on `audit.log`.
- [ ] Wire Sentry DSNs (API, Worker, Web), Pino-to-Loki log shipping, and Grafana alert rules.
- [ ] Add GitHub Actions CI workflow running Vitest (`unplugin-swc`), Testcontainers Postgres integration tests, and `@nx/enforce-module-boundaries`.