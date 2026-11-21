# Changelog

All notable changes and milestones across the School Management System (Nx Modular Monolith) will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [2.2.0] - 2026-11-21

### Added

#### Phase 0: De-Risk & Foundation
- **F-0.1:** Authored 10 Architecture Decision Records in `docs/adr/` covering Modular Monolith structure, PostgreSQL Single Source of Truth, Transactional Outbox Worker Engine, Self-Hosted Keycloak OIDC, Append-Only Ledger, Attendance Partitioning, Aggregator & BEFTN Payments, ID-Only Trigram Search, Maker-Checker Payroll, and SMS Deduplication.
- **F-0.2b:** Configured GitHub Actions CI pipeline (`.github/workflows/ci.yml`) validating build, types, and test execution.
- **F-0.4b:** Added Prometheus alerting rules (`infra/prometheus/alert.rules.yml`) and Grafana datasources (`infra/grafana/provisioning/datasources/datasources.yml`) for Loki and Prometheus.

#### Phase 1: Identity, Auth & RBAC
- **F-1.2 & F-1.3:** Configured Keycloak Identity Provider broker for Google Workspace/Gmail OAuth and enabled required actions for TOTP/MFA, email verification, and password updates in `infra/keycloak/realm-export.json`.
- **F-1.6 & F-1.7:** Verified Keycloak admin bulk provisioning in `AuthService` and row-level data isolation via `RowScopeMiddleware` for teacher, student, and parent personas.
- **F-1.8:** Implemented Next.js authentication layout, login page (`apps/web/src/app/(auth)/login/page.tsx`), and OAuth callback route (`apps/web/src/app/(auth)/callback/page.tsx`).

#### Phase 2: Core Platform & Academic Structure
- **F-2.4:** Built academic structure dashboard (`apps/web/src/app/(dashboard)/academic/page.tsx`) mapping years, terms, classes, sections, and subjects catalog.
- **F-2.6 & F-2.7:** Implemented bulk student CSV import in `StudentController`, `StudentService`, and `StudentRepository`, with corresponding data tables and metrics on `/students`.

#### Phase 3: Attendance & Leave
- **F-3.5:** Built staff leave management dashboard (`apps/web/src/app/(dashboard)/leave/page.tsx`) and Server Actions (`apps/web/src/actions/leave.actions.ts`).
- **F-3.6 & F-3.7:** Implemented official school calendar and teacher substitution workflows in `LeaveService`, `LeaveRepository`, and `LeaveController`.

#### Phase 4: Period Close & Money In
- **F-4.2:** Verified append-only ledger trigger `finance.prevent_ledger_mutation()` and strict `REVOKE UPDATE, DELETE` grants in `infra/docker/postgres/init.sql`.
- **F-4.3 & F-4.8:** Built comprehensive fees and immutable ledger interface (`apps/web/src/app/(dashboard)/finance/page.tsx`) showing fee schedules, student invoices, and ledger audit trail.

#### Phase 5: Money Out / Payroll
- **F-5.1 & F-5.3:** Enforced Maker-Checker validation rules (`approved_by <> created_by`) in both SQL constraints and `PayrollService`.
- **F-5.4 & F-5.6:** Implemented BEFTN electronic bank file generation, payslip PDF generation, and failed transfer retry endpoint (`POST /api/v1/payroll/failed-lines/{id}/retry`).
- **F-5.5:** Built payroll dashboard (`apps/web/src/app/(dashboard)/payroll/page.tsx`) with batch management, maker-checker status, and disbursement line snapshots.

#### Phase 6: Communication & Search
- **F-6.2:** Enhanced institutional notice board (`apps/web/src/app/(dashboard)/notices/page.tsx`) with bilingual English & Bangla circulars, audience tags, and priority alerts.
- **F-6.5:** Authored benchmark evaluation report (`docs/benchmarks/0001-bangla-search-benchmark.md`) proving PostgreSQL `pg_trgm` GIN indexing achieves sub-50ms p95 latency for 20k records.

#### Phase 7: Migration & Go-Live
- **F-7.1 & F-7.2:** Authored legacy data extraction script (`scripts/migration/extract-legacy-data.ts`) and control totals reconciliation script (`scripts/migration/reconcile-control-totals.ts`).
- **F-7.3:** Created institutional user training matrix (`docs/user-guides/role-training-matrix.md`).
- **F-7.5 & F-7.6:** Documented PostgreSQL disaster recovery drill (`docs/runbooks/0002-postgresql-restore-drill.md`) and weekend cutover/rollback runbook (`docs/runbooks/0001-weekend-cutover-and-rollback-plan.md`).
