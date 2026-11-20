# 🗺️ School Management System — Actionable Feature Checklist by Phase

**Version:** 2.2 (Reconciled with Repository Codebase & RBAC Frontend Matrix)
**Architecture:** Nx Modular Monolith (`apps/api`, `apps/worker`, `apps/web`, `packages/database`, `packages/shared`)
**Identity Provider:** Keycloak (Self-Hosted)
**Scope:** Single institution (10k–20k students, 200–500 staff)

---

## 📊 Priority & Status Legend

| Priority | Definition | Implication |
| :--- | :--- | :--- |
| **P0** | **Critical (Must Have)** | The system cannot go live without this. |
| **P1** | **High (Should Have)** | Essential for daily operations; short manual workaround possible. |
| **P2** | **Medium (Nice to Have)** | Enhances efficiency and UX; can follow initial launch. |
| **P3** | **Low (Future)** | Post-launch analytics and optional hardware/mobile extensions. |

* `[x]` = Implemented / Scaffolded in repository
* `[ ]` = Pending SQL migration, full business logic wiring, or verification

---

## 🛠️ Phase 0: De-risk & Foundation (Weeks 1–3)

**Goal:** Close architectural decisions, establish the Nx monorepo, and prove the Postgres Outbox + Worker pipeline.

- [ ] **F-0.1: ADR Logs** - Document 10 core decisions in `docs/adr/` (Bank BEFTN/API, Aggregator, Postgres HA, Keycloak HA, Bangla Search, SMS, Hosting, Attendance Granularity, Gov Portal). `[P0]`
- [x] **F-0.2a: Nx Monorepo & Boundary Config** - `nx.json`, `tsconfig.base.json`, `apps/{api,worker,web}`, and `packages/{database,shared}` structured. `[P0]`
- [ ] **F-0.2b: CI/CD & Testcontainers** - GitHub Actions pipeline running Vitest (`unplugin-swc`), Testcontainers Postgres tests, and `@nx/enforce-module-boundaries`. `[P0]`
- [x] **F-0.3: Local Environment** - `docker-compose.yml`, `Makefile`, `infra/docker/postgres/init.sql`, and `infra/keycloak/realm-export.json` configured. `[P0]`
- [x] **F-0.4a: Observability Provisioning** - Prometheus (`infra/prometheus/prometheus.yml`) and Grafana dashboards (`infra/grafana/provisioning/`) provisioned. `[P0]`
- [ ] **F-0.4b: Sentry & Loki Wiring** - Connect production/dev Sentry DSNs and Pino-to-Loki log shipping with alert rules. `[P0]`
- [x] **F-0.5: Transactional Outbox Engine** - `OutboxService` (`apps/api/src/shared/outbox/`) and `OutboxConsumer` (`apps/worker/src/shared/outbox-consumer.ts` using `FOR UPDATE SKIP LOCKED`) implemented. `[P0]`

---

## 🔐 Phase 1: Identity, Auth & RBAC (Weeks 3–5)

**Goal:** Secure the system with Keycloak OIDC, stateless JWT verification, 7-role RBAC, default role landing redirects, and row-level data isolation.

- [x] **F-1.1: Keycloak Realm & 7 Roles** - `infra/keycloak/realm-export.json` configured with `ADMIN`, `PRINCIPAL`, `TEACHER`, `OFFICE`, `FINANCE`, `STUDENT`, `PARENT`. `[P0]`
- [ ] **F-1.2: Gmail / Google OAuth** - Configure Keycloak Identity Brokering (`kc_idp_hint=google`) for `@gmail.com` and Google Workspace staff logins. `[P0]`
- [ ] **F-1.3: Password & MFA Management** - Configure Keycloak SMTP flows (Forgot Password, Email Verification) and mandatory MFA for `ADMIN`, `PRINCIPAL`, `FINANCE`. `[P0]`
- [x] **F-1.4: JWT Validation Guard** - Custom NestJS `jose` `JwtGuard` (`apps/api/src/shared/guards/jwt.guard.ts`) validating JWKS signatures and extracting roles. `[P0]`
- [x] **F-1.5: RBAC Enforcement** - `RolesGuard` and `@Roles()` decorator (`apps/api/src/shared/guards/roles.guard.ts`) protecting controllers. `[P0]`
- [ ] **F-1.6: User Provisioning (Admin)** - Complete Keycloak Admin REST API single & bulk provisioning (20k accounts) in `apps/api/src/modules/auth/services/auth.service.ts`. `[P0]`
- [ ] **F-1.7: Row-Level Scoping Primitive** - Attach `rowScope` (`TEACHER` -> `sectionIds`, `STUDENT`/`PARENT` -> `studentIds`) in `RequestIdMiddleware` and enforce in repositories. `[P0]`
- [x] **F-1.8: Frontend Auth Shield & Default Role Landing Redirect** - Implemented Keycloak OIDC code exchange in `(auth)/login/page.tsx`, HTTP-only cookie storage (`lib/auth.ts`), `DEFAULT_LANDING_ROUTE` `302` redirects (`lib/rbac.ts`), and `canAccessPath` route protection in `(dashboard)/layout.tsx`. `[P0]`

---

## 🧱 Phase 2: Core Platform & Academic Structure (Weeks 5–8)

**Goal:** Establish institutional hierarchy, staff/student directories, enrollments, and PII audit trails.

- [x] **F-2.1: Academic Years & Terms (Backend Scaffold)** - Schema (`academic.ts`) and `academic` module scaffolded. `[P0]`
- [x] **F-2.2: Classes & Sections (Backend Scaffold)** - Schema and endpoints supporting `DAILY` vs `PER_PERIOD` attendance modes scaffolded. `[P0]`
- [x] **F-2.3: Subjects (Backend Scaffold)** - Bangla/English subject schema and service scaffolded. `[P0]`
- [ ] **F-2.4: Teacher Assignments & Academic UI** - Complete `academic.dto.ts`, bulk teacher-section assignment API, and `/academic` admin UI forms. `[P0]`
- [x] **F-2.5: Staff Directory (Backend & Route)** - `people.ts` schema, `staff` API module, and `/staff` route scaffolded; complete CRUD UI & Keycloak linking. `[P0]`
- [ ] **F-2.6: Student Directory & Bulk CSV Import** - Complete `/students` UI and streaming CSV importer (`POST /api/v1/students/import`, 20k rows < 5 min). `[P0]`
- [ ] **F-2.7: Student Enrollment** - Wire term-section enrollment endpoints and UI workflows. `[P0]`
- [x] **F-2.8: Audit Logging Service** - `AuditService` (`apps/api/src/shared/audit/audit.service.ts`) created; enforce append-only SQL trigger and PII read logging across controllers. `[P0]`

---

## 📋 Phase 3: Attendance & Leave (Weeks 8–16)

**Goal:** High-throughput, tamper-resistant attendance capture with derived daily summaries and leave integration.

- [x] **F-3.1: Batch Attendance Service & Action** - `AttendanceService.markBatch` and `submitBatchAttendanceAction` implemented; wire to `/attendance` roster UI. `[P0]`
- [x] **F-3.2: Device Attendance Service** - `AttendanceService.ingestDeviceEvent` with HMAC verification implemented; restrict endpoint to device VLAN. `[P1]`
- [ ] **F-3.3: Derived Daily Summary & Partitioning** - Add SQL migration for monthly range partitioning on `attendance.period_event`, 60-day partition job, and `attendance.daily_summary` Materialized View. `[P0]`
- [x] **F-3.4: Attendance Correction Service** - `requestCorrection` and `approveCorrection` (Maker-Checker) implemented; wire to UI. `[P0]`
- [ ] **F-3.5: Leave Management** - Complete `leave` service workflows and build `apps/web/src/app/(dashboard)/leave/page.tsx` + server actions. `[P1]`
- [ ] **F-3.6: School Calendar** - Implement holiday/weekend calendar management (`GET/POST /api/v1/leave/calendar`) to prevent false absentees. `[P1]`
- [ ] **F-3.7: Substitutions** - Assign substitute teachers during approved staff leave. `[P2]`
- [x] **F-3.8: Absentee Parent SMS Producer & Worker** - Deduped `NOTIFY_ABSENTEE_PARENTS` outbox enqueueing and `NotificationProcessor` implemented. `[P1]`

---

## 🔒 Phase 4: Period Close & Money In (Weeks 16–22)

**Goal:** Lock monthly attendance via Maker-Checker approval and operate an append-only student fee ledger.

- [x] **F-4.1: Period Close Gate Service & Action** - `PeriodCloseService` (`initiateClose`, `approveClose` with Maker-Checker) and `submitPeriodCloseAction` implemented; wire to `/attendance/period-close` UI. `[P0]`
- [ ] **F-4.2: Shared Append-Only Ledger** - Add SQL triggers & DB grants forbidding `UPDATE`/`DELETE` on `finance.ledger_entry`; allow only offsetting `reversal_of` entries. `[P0]`
- [ ] **F-4.3: Fee Schedules** - Implement per-class/term fee schedule CRUD (`Tuition`, `Exam`, `Transport`) and `/finance` UI management. `[P0]`
- [ ] **F-4.4: Bulk Invoicing** - Implement chunked background outbox worker handler (`BULK_GENERATE_INVOICES`) generating 20k student invoices in < 10 minutes. `[P0]`
- [x] **F-4.5: Payment Aggregator (MFS) Initiation** - `PaymentService.initiatePayment` (with `Idempotency-Key`) and `initiatePaymentAction` implemented. `[P0]`
- [x] **F-4.6: IPN Webhook Handler** - `PaymentService.handleIpnWebhook` (aggregator validation API + amount/currency match + atomic ledger entry + receipt outbox) implemented. `[P0]`
- [ ] **F-4.7: Payment Poller** - Complete 5-minute stale payment recovery loop in `apps/worker/src/processors/payment-reconcile.processor.ts`. `[P0]`
- [ ] **F-4.8: Daily Reconciliation** - Implement daily 02:00 settlement report comparison against `finance.ledger_entry` with mismatch alerts. `[P0]`
- [x] **F-4.9: Waivers & Adjustments Service** - `PaymentService.postWaiver` (Maker-Checker) implemented; wire to `/finance` UI. `[P1]`
- [x] **F-4.10: Digital Receipts Worker** - `PdfGenerationProcessor.handleReceipt` uploading PDF receipts to Cloudflare R2 implemented. `[P1]`

---

## 💸 Phase 5: Money Out / Payroll (Weeks 22–26)

**Goal:** Compute and disburse staff salaries accurately from locked attendance snapshots.

- [ ] **F-5.1: Payroll State Machine** - Enforce `DRAFT -> PENDING_APPROVAL -> APPROVED -> DISPATCHED -> PAID` transitions in `payroll.service.ts`. `[P0]`
- [ ] **F-5.2: Payroll Computation** - Complete `payroll-compute.processor.ts` reading strictly from `APPROVED`/`LOCKED` `attendance.period_close` records (`sms_payroll_reader` role). `[P0]`
- [ ] **F-5.3: Maker-Checker Approval** - Enforce DB `CHECK (approved_by IS NULL OR approved_by <> created_by)` constraint on `payroll.payroll_run`. `[P0]`
- [ ] **F-5.4: BEFTN / Bank Dispatch** - Complete `beftn-dispatch.processor.ts` generating bulk bank payout files to Cloudflare R2 and posting to `finance.ledger_entry`. `[P0]`
- [ ] **F-5.5: Payslip Generation** - Generate individual staff PDF payslips to Cloudflare R2 via `pdf-generation.processor.ts`. `[P1]`
- [ ] **F-5.6: Failed Payout Queue** - Implement `POST /api/v1/payroll/failed-lines/{id}/retry` and manual resolution UI on `/payroll`. `[P0]`
- [ ] **F-5.7: Bank Reconciliation** - Daily job reconciling dispatched payroll ledger entries against bank debit statements. `[P1]`
- [ ] **F-5.8: Parallel Payroll Run** - Run legacy payroll and new system side-by-side for 1 full month and verify 100% net-pay parity. `[P0]`

---

## 📢 Phase 6: Communication & Search (Weeks 26–28)

**Goal:** Role-targeted notices, ID-only Postgres full-text search, and role-specific dashboards.

- [x] **F-6.1: Global Search (ID-Only + RowScope)** - `SearchService.searchStudents` (ID-only lookup + post-lookup `RowScope` filtering) implemented; add `pg_trgm` GIN indexes. `[P0]`
- [ ] **F-6.2: Notice Board** - Complete Bangla/English notice creation, role targeting, publishing (`POST /api/v1/notices/{id}/publish`), and `/notices` UI. `[P1]`
- [x] **F-6.3: Notice Search** - `SearchService.searchNotices` full-text search implemented; add `tsvector` GIN index on `notice.notice`. `[P1]`
- [x] **F-6.4: Role-Based UI Dashboards & Sidebar** - Implemented role-filtered navigation in `sidebar.tsx` and tailored home screens in `(dashboard)/page.tsx` per `docs/rbac_and_frontend_matrix.md`. `[P1]`
- [ ] **F-6.5: Bangla Search Spike (Fallback)** - Benchmark 200 Bangla queries against 20k records; deploy Meilisearch only if Postgres recall falls short. `[P2]`

---

## 🚀 Phase 7: Migration & Go-Live (Weeks 28–36)

**Goal:** Migrate historical institutional records, verify control totals, train staff, and execute cutover.

- [ ] **F-7.1: Legacy Data Extract** - Build extraction scripts for legacy student, staff, academic, and fee balances. `[P0]`
- [ ] **F-7.2: Data Migration & Verification** - Execute two dry runs, load data, and reconcile opening ledger balances against legacy accounts. `[P0]`
- [ ] **F-7.3: User Training Material** - Deliver Bangla/English role guides and walkthrough videos for Teachers, Office, Finance, and HR. `[P0]`
- [ ] **F-7.4: UAT (User Acceptance Testing)** - Conduct staging UAT sign-off across all 7 roles with real institutional data. `[P0]`
- [ ] **F-7.5: Restore Drill #2** - Execute full PostgreSQL WAL/base backup restore into isolated staging and verify RTO <= 4 hours. `[P0]`
- [ ] **F-7.6: Cutover & Rollback Plan** - Finalize weekend cutover checklist and rollback triggers. `[P0]`
- [ ] **F-7.7: Hypercare (2–4 Weeks)** - Dedicated engineering triage during initial live attendance, fee collection, and payroll cycles. `[P0]`

---

## 🌟 Phase 8: Post-Launch / Future Roadmap (P3)

- [ ] **F-8.1: Advanced Analytics** - BI dashboards for attendance trends, dropout risk, and fee collection rates. `[P3]`
- [ ] **F-8.2: LMS Integration** - LTI 1.3 bridge to external LMS platforms. `[P3]`
- [ ] **F-8.3: Mobile Apps** - React Native apps for Parents and Teachers consuming `/api/v1`. `[P3]`
- [ ] **F-8.4: Library Management** - Book catalog, circulation, and overdue fine ledger integration. `[P3]`
- [ ] **F-8.5: Transport Management** - Bus routes, stops, and GPS tracking. `[P3]`
- [ ] **F-8.6: Biometric Hardware Sync** - Direct vendor SDK adapters for ZKTeco/Suprema terminals. `[P3]`