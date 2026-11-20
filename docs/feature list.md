# 🗺️ School Management System — Actionable Feature Checklist by Phase

**Version:** 2.1 (Checklist Edition)
**Architecture:** Modular Monolith (V2.0 Compliant)
**Identity Provider:** Keycloak (Self-Hosted)
**Scope:** Single institution (10k–20k students, 200–500 staff)

---

## 📊 Priority Legend

| Priority | Definition | Implication |
| :--- | :--- | :--- |
| **P0** | **Critical (Must Have)** | The system cannot go live without this. |
| **P1** | **High (Should Have)** | Essential for daily operations, but a manual workaround exists for 1–2 weeks. |
| **P2** | **Medium (Nice to Have)** | Enhances efficiency and UX. Can be pushed to Post-Launch. |
| **P3** | **Low (Future)** | Quality of life features, advanced analytics. |

---

## 🛠️ Phase 0: De-risk & Foundation (Weeks 1–3)

**Goal:** Close architectural decisions, set up the repo, and prove the stack works with a walking skeleton.

- [ ] **F-0.1: ADR Logs** - Document 10 core decisions (Bank, Aggregator, HA, Bangla Search, etc.). `[P0]`
- [ ] **F-0.2: Repo & CI/CD** - Nx monorepo, GitHub Actions, Testcontainers, Architecture Boundary tests. `[P0]`
- [ ] **F-0.3: Local Environment** - `docker-compose` for Postgres, Redis, Keycloak, Grafana, Loki. `[P0]`
- [ ] **F-0.4: Observability Setup** - Sentry, Pino logs, Grafana dashboards (Outbox, API, Postgres). `[P0]`
- [ ] **F-0.5: Walking Skeleton** - Throwaway "Ping/Notify" feature proving Postgres Outbox + Worker + SMS. `[P0]`

---

## 🔐 Phase 1: Identity, Auth & RBAC (Weeks 3–5)

**Goal:** Secure the system before building any business logic. Establish exactly who can log in and what they are allowed to see. *(Keycloak handles identity; API validates JWTs).*

- [ ] **F-1.1: Keycloak Realm & Roles** - Configure Keycloak with the exact 7 system roles (`ADMIN`, `PRINCIPAL`, `TEACHER`, `OFFICE`, `FINANCE`, `STUDENT`, `PARENT`). `[P0]`
- [ ] **F-1.2: Gmail / Google OAuth** - Configure Keycloak Identity Brokering to allow users to log in with their `@gmail.com` or Google Workspace accounts (ideal for staff). `[P0]`
- [ ] **F-1.3: Password Management** - Enable standard Username/Password login. Configure SMTP in Keycloak for "Forgot Password", "Update Password", and "Email Verification" flows. `[P0]`
- [ ] **F-1.4: JWT Validation Guard** - Custom 50-line NestJS `jose` Guard. Fetches JWKS from Keycloak (cached 1h), validates signature/expiry, extracts roles. `[P0]`
- [ ] **F-1.5: RBAC Enforcement** - NestJS decorators (`@Roles('FINANCE')`) that block unauthorized API access at the controller level. `[P0]`
- [ ] **F-1.6: User Provisioning (Admin)** - API endpoints using Keycloak Admin API to create users (bulk creating 20k student accounts) and send invite emails. `[P0]`
- [ ] **F-1.7: Row-Level Scoping Primitive** - Middleware that attaches data constraints to the request (e.g., `role == TEACHER` limits access to `teacher_section_ids`). `[P0]`
- [ ] **F-1.8: Frontend Auth Shield** - Next.js middleware that redirects unauthenticated users to Keycloak login. Secure token storage (HTTP-only cookies). `[P0]`

---

## 🧱 Phase 2: Core Platform & Academic Structure (Weeks 5–8)

**Goal:** Define the school's hierarchy. Nothing can exist without a class and section.

- [ ] **F-2.1: Academic Years & Terms** - Create academic years (2026) and terms (Spring, Fall) with start/end dates. `[P0]`
- [ ] **F-2.2: Classes & Sections** - Create classes (Grade 8) and sections (8-A, 8-B). Set attendance mode (Daily vs. Per-Period). `[P0]`
- [ ] **F-2.3: Subjects** - Define subjects (Math, English) with Bangla/English names. `[P0]`
- [ ] **F-2.4: Teacher Assignments** - Map specific teachers to specific sections/subjects. *Crucial for row-scope security.* `[P0]`
- [ ] **F-2.5: Staff Directory** - CRUD for teachers and office workers. Linked to Keycloak `staff_id`. `[P0]`
- [ ] **F-2.6: Student Directory** - CRUD for students. Linked to Keycloak `student_id`. `[P0]`
- [ ] **F-2.7: Student Enrollment** - Assign students to a specific section for a specific term. `[P0]`
- [ ] **F-2.8: Audit Logging (Basic)** - Log all creations/modifications of academic structure and PII access. `[P0]`

---

## 📋 Phase 3: Attendance & Leave (Weeks 8–16)

**Goal:** The highest volume of data in the system. Must be fast, reliable, and forgery-proof.

- [ ] **F-3.1: Batch Attendance API** - `POST /attendance/batch` for teachers marking a whole roster at once. `[P0]`
- [ ] **F-3.2: Device Attendance API** - `POST /attendance/device` with HMAC signatures and VLAN restrictions for biometric/RFID. `[P1]`
- [ ] **F-3.3: Derived Daily Summary** - Materialized view that aggregates per-period events into a daily pass/fail. `[P0]`
- [ ] **F-3.4: Attendance Correction Flow** - Teacher requests a change -> Manager approves -> Updates audit log. `[P0]`
- [ ] **F-3.5: Leave Management** - Staff submit leave requests; Managers approve/reject. `[P1]`
- [ ] **F-3.6: School Calendar** - Admin defines holidays and weekends (prevents false absentees). `[P1]`
- [ ] **F-3.7: Substitutions** - Assign a substitute teacher when a teacher is on leave. `[P2]`
- [ ] **F-3.8: Absentee Parent SMS** - Auto-trigger SMS to parents if a student is marked absent (deduped). `[P1]`

---

## 🔒 Phase 4: Period Close & Money In (Weeks 16–22)

**Goal:** Freeze attendance for payroll and build the financial ledger to collect fees safely.

- [ ] **F-4.1: Period Close Gate** - HR locks monthly attendance. Generates an immutable `attendance_summary`. `[P0]`
- [ ] **F-4.2: Shared Append-Only Ledger** - The single financial truth. No updates/deletes; only offsetting entries. `[P0]`
- [ ] **F-4.3: Fee Schedules** - Define fees per class/term (Tuition, Exam, Transport). `[P0]`
- [ ] **F-4.4: Bulk Invoicing** - Background job generating 20k invoices in < 10 minutes. `[P0]`
- [ ] **F-4.5: Payment Aggregator (MFS)** - Integrate SSLCommerz/aamarPay for bKash, Nagad, Cards. `[P0]`
- [ ] **F-4.6: IPN Webhook Handler** - Validate aggregator IPN, check amount/tran_id, post to ledger. `[P0]`
- [ ] **F-4.7: Payment Poller** - Background job to recover missed webhooks every 5 minutes. `[P0]`
- [ ] **F-4.8: Daily Reconciliation** - Background job matching Aggregator settlement to Ledger. `[P0]`
- [ ] **F-4.9: Waivers & Adjustments** - Finance can grant scholarships/waivers with Maker-Checker approval. `[P1]`
- [ ] **F-4.10: Digital Receipts** - Generate PDF receipt -> R2 -> SMS link to parent. `[P1]`

---

## 💸 Phase 5: Money Out / Payroll (Weeks 22–26)

**Goal:** Pay 500 staff accurately based on the locked attendance summaries.

- [ ] **F-5.1: Payroll State Machine** - Draft -> Pending Approval -> Approved -> Dispatched -> Paid. `[P0]`
- [ ] **F-5.2: Payroll Computation** - Worker reads ONLY `attendance_summary` to calculate deductions. `[P0]`
- [ ] **F-5.3: Maker-Checker Approval** - DB constraint ensures the creator of a run cannot be the approver. `[P0]`
- [ ] **F-5.4: BEFTN / Bank Dispatch** - Generate bulk bank file (or API call) and upload to R2. `[P0]`
- [ ] **F-5.5: Payslip Generation** - Generate PDF payslips for all staff -> R2. `[P1]`
- [ ] **F-5.6: Failed Payout Queue** - Handle bank rejections; allow finance to manually resolve and retry. `[P0]`
- [ ] **F-5.7: Bank Reconciliation** - Daily job matching ledger payroll entries to actual bank debits. `[P1]`
- [ ] **F-5.8: Parallel Payroll Run** - Run legacy payroll and new system side-by-side for 1 month. `[P0]`

---

## 📢 Phase 6: Communication & Search (Weeks 26–28)

**Goal:** Notices, Search, and finalizing system access.

- [ ] **F-6.1: Global Search (Postgres FTS)** - Search students, staff, and notices by ID/Name/Phone. Returns IDs only. `[P0]`
- [ ] **F-6.2: Notice Board** - Create notices (Bangla/English) targeted to specific roles. `[P1]`
- [ ] **F-6.3: Notice Search** - Full-text search across notice titles and bodies. `[P1]`
- [ ] **F-6.4: Role-Based UI Dashboards** - Custom home screens for Admin, Teacher, Parent, Student based on RBAC. `[P1]`
- [ ] **F-6.5: Bangla Search Spike (Fallback)** - If Postgres FTS fails Bangla recall, implement Meilisearch. `[P2]`

---

## 🚀 Phase 7: Migration & Go-Live (Weeks 28–36)

**Goal:** Move real data, train users, and switch off the legacy system.

- [ ] **F-7.1: Legacy Data Extract** - Scripts to pull data from the old system (Excel, Access, or legacy DB). `[P0]`
- [ ] **F-7.2: Data Migration & Verification** - Load data, run control totals, verify ledger against legacy finance. `[P0]`
- [ ] **F-7.3: User Training Material** - Role-based guides and short videos for Teachers, Finance, HR. `[P0]`
- [ ] **F-7.4: UAT (User Acceptance Testing)** - Real users test the system on staging with real data. `[P0]`
- [ ] **F-7.5: Restore Drill #2** - Final Postgres backup/restore test before go-live. `[P0]`
- [ ] **F-7.6: Cutover Plan** - Step-by-step weekend switchover plan + rollback plan. `[P0]`
- [ ] **F-7.7: Hypercare (2–4 Weeks)** - On-call engineers available to triage immediate post-launch issues. `[P0]`

---

## 🌟 Phase 8: Post-Launch / Future Roadmap (P3)

**Goal:** Enhancements once the core system is stable.

- [ ] **F-8.1: Advanced Analytics** - BI dashboards for dropout rates, fee collection trends. `[P3]`
- [ ] **F-8.2: LMS Integration** - Connect to Moodle/Canvas via LTI 1.3. `[P3]`
- [ ] **F-8.3: Mobile Apps** - React Native apps for Parents and Teachers. `[P3]`
- [ ] **F-8.4: Library Management** - Track book loans and fines. `[P3]`
- [ ] **F-8.5: Transport Management** - Bus routes and GPS tracking integration. `[P3]`
- [ ] **F-8.6: Biometric Hardware Sync** - Direct SDK integration with specific ZKTeco/Suprema devices. `[P3]`