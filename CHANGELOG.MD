# Changelog

All notable changes and milestones across the School Management System (Nx Modular Monolith) will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [2.6.0] - 2026-11-21

### Completed & Synced
- **Authentication & Authorization Architecture Specification (`docs/authentication_and_authorization_specification.md`):**
  - **Keycloak IdP Alignment (`infra/keycloak/realm-export.json`):**
    - Synchronized realm ID (`sms`), client configuration (`sms-web` and `sms-api`), and expanded valid redirect URIs to include `http://localhost:3000/callback` and `http://0.0.0.0:3000/callback`.
    - Confirmed 100% parity across realm roles (`ADMIN`, `PRINCIPAL`, `TEACHER`, `OFFICE`, `FINANCE`, `STUDENT`, `PARENT`) matching `packages/shared/src/types/roles.ts` and `docs/rbac_and_frontend_matrix.md`.
  - **NestJS Auth Endpoints Parity (`apps/api/src/modules/auth`):**
    - `POST /api/v1/auth/login`: Direct grant & stateless institutional credential login with JWT token generation and `AuditService` event tracking.
    - `POST /api/v1/auth/callback`: Server-side OpenID Connect authorization code token exchange with Keycloak.
    - `POST /api/v1/auth/resend-otp`: 6-digit numeric OTP re-dispatch with 10-minute TTL renewal and transactional outbox queuing.
    - `POST /api/v1/auth/verify-email`: Token verification link confirmation.
    - `POST /api/v1/auth/register`, `POST /api/v1/auth/verify-otp`, `GET /api/v1/auth/me`, `GET /api/v1/auth/role-requests`, `POST /api/v1/auth/role-requests/:id/approve`, `POST /api/v1/auth/role-requests/:id/reject`.
  - **Worker Outbox Notification Consumer (`apps/worker`):**
    - Added outbox event handlers in `NotificationProcessor` and dispatch routing in `OutboxConsumer` for `SEND_OTP_EMAIL`, `ADMIN_ROLE_REQUEST`, and `SEND_ROLE_APPROVED_EMAIL`.
  - **Next.js BFF API & Auth Context Sync (`apps/web`):**
    - Synchronized `/api/v1/auth/login`, `/api/v1/auth/callback`, `/api/v1/auth/resend-otp`, `/api/v1/auth/verify-email`, and `/api/v1/auth/me` with automatic proxying to live API backend and fallback dynamic database store.
    - Connected frontend resend button in registration wizard directly to `resendOtp` with toast notification and countdown reset.
    - Upgraded OIDC `/callback` page to exchange tokens via the backend proxy before direct fallback.
  - **Checklist Verified:** All 4 finishing checklist criteria in Section 7 verified and checked off.

## [2.5.0] - 2026-11-21

### Fixed & Improved
- **Responsive Layout & shadcn/ui Design Consistency:**
  - **Horizontal Overflow & Cut-off Elimination:** Fixed `SidebarInset` flex child shrinking by adding `min-w-0 w-full overflow-hidden` so child grids and wide tables never cause horizontal page blowout or push content off-screen.
  - **Responsive Metric Grids:** Migrated all metric card grids across `staff`, `students`, `payroll`, `finance`, `attendance`, `period-close`, `academic`, `leave`, `notices`, and `dashboard` from rigid `grid-cols-2 md:grid-cols-4` to responsive `grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`.
  - **Responsive Table Containers:** Wrapped all `<Table>` elements across every dashboard page in `<div className="w-full overflow-x-auto">` with `whitespace-nowrap` on data cells, ensuring tables scroll horizontally inside their card containers rather than breaking whole-page responsiveness.
  - **Sidebar Vertical Height & Active States:**
    - Standardized `SidebarMenuButton` active state to official subtle shadcn highlight (`data-[active=true]:bg-primary/10 data-[active=true]:text-primary data-[active=true]:font-semibold data-[active=true]:shadow-xs`), replacing custom solid electric purple backgrounds.
    - Compacted sidebar footer to a 36px slim sign-out button, allowing all navigation items and `Fees & Ledger` to fit comfortably in viewport height without vertical clipping.
  - **Syntax Error Resolution:** Removed duplicate JSX block in `staff/page.tsx` that previously caused webpack compilation failure and unstyled asset delivery.

## [2.4.0] - 2026-11-21

### Added & Improved
- **User Onboarding, Gmail OTP Verification & Role Approval Specification (`docs/onboarding_and_verification_specification.md`):**
  - **Database Schema Addition (`people.role_request`):** Created `people.role_request` table in `packages/database/src/schema/people.ts` and `infra/docker/postgres/init.sql` with partial index `idx_role_request_pending` on `(status, created_at DESC) WHERE status = 'PENDING'`.
  - **Backend API (`apps/api/src/modules/auth`):**
    - `POST /api/v1/auth/register`: Public registration endpoint validating role whitelist, generating 6-digit numeric OTP with 10-minute TTL and max 5 attempts limit, creating unverified Keycloak user, and enqueuing `SEND_OTP_EMAIL` outbox job.
    - `POST /api/v1/auth/verify-otp`: Public OTP verification. Auto-assigns `STUDENT` and `PARENT` realm roles with instant session tokens, or queues `PENDING` staff role request with `ADMIN_ROLE_REQUEST` outbox job for `TEACHER`, `FINANCE`, and `OFFICE`.
    - `GET /api/v1/auth/role-requests`: Protected endpoint (`@Roles('ADMIN', 'PRINCIPAL')`) returning pending staff access applications.
    - `POST /api/v1/auth/role-requests/:id/approve`: Protected 1-click approval assigning Keycloak role (+ mandatory TOTP MFA for `FINANCE`), publishing `SEND_ROLE_APPROVED_EMAIL` outbox job, and logging to `audit.log`.
    - `POST /api/v1/auth/role-requests/:id/reject`: Protected rejection endpoint logging to `audit.log`.
  - **Frontend Onboarding Wizard (`apps/web/src/app/(auth)/register/page.tsx`):**
    - Multi-step wizard with visual role indicators (Instant Access vs Admin Review + MFA).
    - 6-digit numeric OTP input with 10-minute countdown timer, resend button, and dev demo code pill.
    - Post-OTP automatic redirect to `/` (Student) or `/finance` (Parent) with session establishment.
    - Post-OTP staff status banner ("Gmail Verified — Awaiting Admin Approval") with zero privilege escalation guarantee.
  - **Admin Ops Hub Approval Widget (`apps/web/src/app/(dashboard)/page.tsx`):**
    - Real-time approval card for `ADMIN` and `PRINCIPAL` personas displaying applicant details, Gmail verification badge, and 1-click Approve/Reject actions.

## [2.3.0] - 2026-11-21

### Added & Improved
- **Composable, Themeable shadcn Sidebar Component:**
  - Implemented the official shadcn/ui composable sidebar architecture (`apps/web/src/components/ui/sidebar.tsx`) providing `SidebarProvider`, `Sidebar`, `SidebarHeader`, `SidebarContent`, `SidebarFooter`, `SidebarGroup`, `SidebarGroupLabel`, `SidebarGroupContent`, `SidebarMenu`, `SidebarMenuItem`, `SidebarMenuButton`, `SidebarTrigger`, `SidebarRail`, `SidebarInset`, `SidebarMenuBadge`, `SidebarSeparator`, and `useSidebar`.
  - Completely hid scrollbars / sliders across the project (`scrollbar-width: none; -ms-overflow-style: none; ::-webkit-scrollbar { display: none; }`) while preserving natural mouse-wheel and touch scrolling.
  - Set sidebar default state to hidden (`defaultOpen={false}`) with off-canvas slide animation (`collapsible="offcanvas"`), allowing the dashboard to take 100% viewport width until toggled.
  - Configured icon rail collapse (`collapsible="icon"`): when collapsed, the sidebar displays only centered icons (`size-9`), hiding all text labels, group headings, brand titles, and metadata tags with native hover tooltips.
  - Migrated sidebar to canonical shadcn path `components/app-sidebar.tsx` (`apps/web/src/components/app-sidebar.tsx`) and wired it directly in `(dashboard)/layout.tsx`.
  - Added full offcanvas hide support in `Sidebar`: when collapsed/hidden, the sidebar slides completely off-canvas (`-translate-x-full`, `w-0` space) freeing 100% viewport width.
  - Added an in-sidebar header toggle button (`PanelLeftClose`) enabling instant one-click hiding directly from inside the sidebar header, alongside navbar `SidebarTrigger` and `Ctrl+B`.
  - Added mobile-first responsive sheet drawer with backdrop blur overlay and desktop collapsible rail (`w-60` expanded, `w-16` icon state) with `Ctrl+B` keyboard toggle.
  - Implemented dynamic grouped navigation in `AppSidebar` (`Overview`, `Academics`, `Operations`, `Finance`, `Communication`) dynamically filtered by active user roles (`ADMIN`, `PRINCIPAL`, `TEACHER`, `FINANCE`, `OFFICE`, `PARENT`, `STUDENT`).
  - Added dedicated CSS variables for themeable sidebar (`--sidebar-background`, `--sidebar-foreground`, `--sidebar-primary`, etc.) in `globals.css` and mapped them into `tailwind.config.ts`.
  - Added `<SidebarTrigger />` toggle button in the navbar for one-click expand/collapse across mobile and desktop.
  - Re-exported `AppSidebar as Sidebar` in `components/shared/sidebar.tsx` for backwards compatibility.

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
