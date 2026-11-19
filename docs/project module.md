

# 🏛️ Part 1: Total System Modules

The system is built as a Modular Monolith. Every module owns its data, communicates via the Postgres Outbox, and enforces strict boundaries.

### 🟢 Core & Platform
1. **Identity & Access (Auth)**
2. **Academic Structure**
3. **People (Students & Staff)**

### 🔵 Attendance & Time
4. **Attendance (Student & Staff)**
5. **Leave & Calendar**
6. **Period Close (The Gate)**

### 🟣 Financials
7. **Student Finance (Ledger & Invoicing)**
8. **Payroll (Runs & Dispatch)**

### 🟡 Support & System
9. **Notices & Communication**
10. **Search**
11. **System (Outbox, Audit, Observability)**

---

# 📋 Part 2: Module Details & Build Checklists

Below are the technical details and definition-of-done checklists for each module.

---

## 1. Identity & Access (Auth)
**Purpose:** Authenticate users and provide coarse-grained role data to the API.
**Key Entities:** None in our DB (Users live in Keycloak).
**Tech Stack:** Keycloak, `jose` library, NestJS Guards, `@nx/enforce-module-boundaries`.

**Checklist:**
- [ ] Keycloak realm deployed and configured with roles (`ADMIN`, `PRINCIPAL`, `TEACHER`, `FINANCE`, `STUDENT`, `PARENT`).
- [ ] Keycloak connected to its own dedicated PostgreSQL database.
- [ ] MFA enabled for Admin, Principal, and Finance roles.
- [ ] Split-horizon DNS configured (LAN resolves Keycloak to local IP; remote via Cloudflare Tunnel).
- [ ] Custom `jose` NestJS Guard implemented (JWKS cached 1 hour, validates `exp`, `iss`, `aud`).
- [ ] Row-Scope middleware primitive built to attach user context (e.g., teacher's assigned section IDs) to the request.

---

## 2. Academic Structure
**Purpose:** Define the hierarchy of the school. This is the foundation for attendance and grading.
**Key Entities:** `AcademicYear`, `Term`, `Class`, `Section`, `Subject`, `TeacherSection`.
**Dependencies:** People (Staff).

**Checklist:**
- [ ] Database schema `academic` created.
- [ ] `TeacherSection` table created to map exactly which teacher can mark attendance for which section/subject.
- [ ] API: CRUD for Years, Terms, Classes, Sections.
- [ ] API: Bulk assign teachers to sections.
- [ ] Drizzle ORM schema defined and mapped.
- [ ] UI (Next.js): Admin screens to configure the academic year and timetable.
- [ ] Audit: Log every creation/modification of academic structure.

---

## 3. People (Students & Staff)
**Purpose:** Manage the directory of all humans in the system.
**Key Entities:** `Student`, `Staff`, `Enrollment`.
**Dependencies:** Academic (for enrollment).

**Checklist:**
- [ ] Database schema `people` created.
- [ ] FTS & `pg_trgm` indexes created on `name_bn`, `name_en`, `admission_no`, `employee_no`.
- [ ] API: CRUD for Students and Staff.
- [ ] API: Bulk CSV import for students (must process 20k rows in < 5 mins).
- [ ] API: Enroll students into specific sections.
- [ ] Row-Scope enforced: Teachers can only fetch students in their `TeacherSection` assignments.
- [ ] UI (Next.js): Directory with instant search and CSV uploader.
- [ ] Audit: Log every access to student PII (Personally Identifiable Information).

---

## 4. Attendance (Student & Staff)
**Purpose:** The highest volume module. Captures daily or per-period presence.
**Key Entities:** `PeriodEvent` (partitioned), `DailySummary` (Materialized View), `CorrectionRequest`.
**Dependencies:** Academic, People.

**Checklist:**
- [ ] Database table `attendance.period_event` created and `PARTITION BY RANGE (event_date)`.
- [ ] Scheduled outbox job created to provision partitions 60 days in advance.
- [ ] `DailySummary` Materialized View created and indexed (derived, never written directly).
- [ ] API: `POST /attendance/batch` (Teacher UI marking).
- [ ] API: `POST /attendance/device` (HMAC-signed payloads from local biometric/RFID devices, LAN-restricted).
- [ ] API: Correction request flow (Teacher submits -> Admin approves).
- [ ] Outbox Job: `NOTIFY_ABSENTEE_PARENTS` (deduped per student per day).
- [ ] UI (Next.js): Mobile-friendly attendance marking screen.
- [ ] Load Test: Prove 500 concurrent teachers can submit attendance with p95 < 500ms.

---

## 5. Leave & Calendar
**Purpose:** Manage approved absences so they do not get penalized in payroll.
**Key Entities:** `CalendarDay` (holidays/weekends), `LeaveType`, `LeaveRequest`, `Substitution`.
**Dependencies:** People, Academic.

**Checklist:**
- [ ] Database schema `leave` created.
- [ ] API: Manage school calendar (bulk holiday import).
- [ ] API: Staff submits leave request.
- [ ] API: Manager/HR approves/rejects leave (Maker-checker).
- [ ] API: Substitute teacher assignment.
- [ ] Logic: Calculate remaining leave balances per staff member.
- [ ] UI (Next.js): Leave application form and HR approval queue.
- [ ] Audit: Log all leave approvals and calendar changes.

---

## 6. Period Close (The Gate 🔒)
**Purpose:** The most critical logical boundary. Freezes attendance to prevent late edits from changing paid salaries.
**Key Entities:** `PeriodClose` (snapshot).
**Dependencies:** Attendance, Leave.

**Checklist:**
- [ ] Database table `attendance.period_close` created.
- [ ] API: HR triggers monthly close (DRAFT state) -> system computes summary from PeriodEvents + Leave + Calendar.
- [ ] API: HR approves close (LOCKED state).
- [ ] Database constraints: `maker_neq_checker` enforced on approval.
- [ ] **DB Security (Crucial):** Revoke `SELECT` on `attendance.period_event` from the `sms_payroll_reader` role. It can *only* read `period_close` where `status = 'APPROVED'`.
- [ ] UI (Next.js): HR dashboard to preview and lock monthly attendance.

---

## 7. Student Finance (Ledger & Invoicing)
**Purpose:** Collect fees via local Bangladeshi payment methods safely.
**Key Entities:** `LedgerEntry` (append-only), `Invoice`, `Payment`, `Adjustment`.
**Dependencies:** People, Academic.

**Checklist:**
- [ ] Database schema `finance` created.
- [ ] `ledger_entry` table created with unique `idempotency_key` and NO UPDATE/DELETE database grants.
- [ ] API: Bulk monthly invoice generation (20k students in < 10 mins via outbox worker).
- [ ] API: `POST /payments/initiate` (Idempotency-Key required).
- [ ] Integration: SSLCommerz / aamarPay session creation (bKash, Nagad, Cards).
- [ ] API: IPN Webhook handler (verify signature, call aggregator validation API, match amount/tran_id, post to ledger).
- [ ] Outbox Job: Poller every 5 mins for missed IPN webhooks.
- [ ] Outbox Job: Daily 02:00 reconciliation vs Aggregator settlement report.
- [ ] Outbox Job: Generate PDF receipts -> Upload to Cloudflare R2 -> Send SMS/Email (deduped).
- [ ] UI (Next.js): Parent payment portal and Finance dashboard.

---

## 8. Payroll
**Purpose:** Calculate and dispatch salaries safely.
**Key Entities:** `PayrollRun`, `PayrollLine`, `DispatchBatch`, `Payslip`.
**Dependencies:** Period Close, People, Finance (Ledger).

**Checklist:**
- [ ] Database schema `payroll` created.
- [ ] `PayrollRun` state machine implemented (DRAFT -> PENDING_APPROVAL -> APPROVED -> DISPATCHED -> PAID).
- [ ] Outbox Job: `COMPUTE_PAYROLL` (reads *only* approved `period_close` data).
- [ ] API: `POST /payroll/runs` and `/approve` (Maker-checker enforced).
- [ ] Logic: Generate BEFTN file (or bank API payload) based on P6-01 decision.
- [ ] Outbox Job: Dispatch to bank -> update ledger -> generate payslip PDF to R2.
- [ ] Outbox Job: Handle failed bank dispatches (retry queue -> manual resolution).
- [ ] UI (Next.js): Finance payroll run screen and manual resolution queue.
- [ ] **Parallel Run:** Execute old and new payroll side-by-side for one month to verify math.

---

## 9. Notices & Communication
**Purpose:** Broadcast information to specific groups.
**Key Entities:** `Notice`.
**Dependencies:** People.

**Checklist:**
- [ ] Database schema `notice` created.
- [ ] `tsvector` generated column for full-text search on Bangla + English.
- [ ] API: CRUD for notices.
- [ ] API: Publish notice (triggers outbox event).
- [ ] Outbox Job: `SEND_NOTICE` (routes to SMS, Email, or In-App based on audience).
- [ ] UI (Next.js): Notice board and admin publishing form.

---

## 10. Search
**Purpose:** Provide fast, safe lookup of students, staff, and notices.
**Key Entities:** None (reads from People/Notice).
**Dependencies:** Postgres FTS.

**Checklist:**
- [ ] GIN indexes created using `pg_trgm` on People and `tsvector` on Notices.
- [ ] API: `GET /search/students?q=` (Returns IDs and minimal data *only*).
- [ ] API: `GET /search/staff?q=`
- [ ] API: `GET /search/notices?q=`
- [ ] Security: API loads full rows from Postgres *after* checking permissions based on the returned IDs.
- [ ] *Spike:* Test 200 Bangla queries against 20k names. If recall is poor, implement Meilisearch.

---

## 11. System (Outbox, Audit, Observability)
**Purpose:** The engine that keeps the monolith reliable.
**Key Entities:** `outbox.job`, `audit.log`.
**Dependencies:** None.

**Checklist:**
- [ ] Database schema `outbox` and `audit` created.
- [ ] Outbox worker built (NestJS): uses `FOR UPDATE SKIP LOCKED` and a stuck-row reclaimer.
- [ ] Outbox dead-letter queue handling + Sentry alerts.
- [ ] Audit log database role created (INSERT only, no UPDATE/DELETE).
- [ ] Sentry integrated into API and Next.js.
- [ ] Pino structured logging configured (traces to Loki).
- [ ] Grafana dashboards built:
  - [ ] Outbox backlog & dead-letters.
  - [ ] API p95 latency.
  - [ ] Postgres connection pool health.
  - [ ] Keycloak login failures.
- [ ] CI Pipeline: Vitest (`unplugin-swc`), architecture tests (`@nx/enforce-module-boundaries`), Testcontainers.