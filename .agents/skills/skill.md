name	sms-change-tracking
description	Maintain School Management System (SMS) changelog, auto-check feature checklists, and update lock files when implementing or fixing material changes. Use when asked to record SMS UI changes, complete features, or update the changelog.

SMS change tracking & workflow
Keep SMS-specific agent skills inside this codebase under .agents/skills/. Do not install or copy them into global skills directories.

For material SMS work, you must complete the following three actions before handing off the change:
1. Update `CHANGELOG.md`
2. Check off completed items in `feature_checklist_by_phase.md`
3. Update the package lock file (`pnpm-lock.yaml` or `package-lock.json`) if any dependencies were added, removed, or updated.

Locate the application from the current checkout. Follow applicable repository instructions and preserve existing unrelated edits.

Required changelog content (CHANGELOG.md)
Add or update a dated entry under [Unreleased]. Do not invent a release version or deployment claim. Every material entry must explicitly include:
- **UI changes:** Identify affected Next.js routes (`apps/web/src/app/...`) and user-visible behavior (e.g., role-based landing redirects, Maker-Checker approval buttons, loading/error states). If the change has no UI effect, write “None; no UI behavior changed.”
- **Features implemented:** Explain the functionality delivered. Reference the exact `F-X.X` Feature IDs from `feature_checklist_by_phase.md`. Distinguish a completed implementation slice from completion of the entire roadmap phase.
- **Verification:** Detail the tests actually run (e.g., Vitest unit tests, Testcontainers Postgres integration, `@nx/enforce-module-boundaries`). Do not report existing test files as passing tests unless you executed them.
- **Migrations/Config:** Note any new SQL migrations (partitions, triggers, DB roles) or Keycloak realm changes.

Required checklist updates (feature_checklist_by_phase.md)
- Automatically change the checkbox from `[ ]` to `[x]` for any Feature ID that you fully implement in this change.
- Add a brief inline note or link to the PR/commit next to the checked item.
- **Do not mark a feature `[x]` unless it passes the strict Definition of Done in Section 8 of `complete_project_outline.md`** (Migrations verified, Boundary tests pass, Integration tests pass, RBAC/RowScope enforced, Audit logs written).
- Keep the priority tags (`[P0]`, `[P1]`) and Feature IDs (`F-1.1`) unchanged.

Architectural Guardrails (Enforce strictly)
- **No BullMQ / Redis Queues:** All async jobs must use the Postgres `outbox.job` table. Never add Redis-based job queues.
- **Append-Only Financials:** Never write SQL or code that `UPDATE`s or `DELETE`s rows in `finance.ledger_entry` or `audit.log`.
- **Payroll Isolation:** The payroll module must only read from `attendance.period_close` (APPROVED/LOCKED). Never allow it to query `attendance.period_event`.
- **Auth:** Do not use `nest-keycloak-connect`. Validate JWTs using the custom `jose` guard.
- **Monorepo Boundaries:** Do not cross-import between domain modules. Use `packages/shared` or `packages/database` for shared code.

Final Validation
Check the final changelog against the code diff and the feature checklist. Ensure UI changes and implemented features are both explicitly covered, and pending work is not presented as finished. Documentation-only updates need content/link validation rather than application tests unless behavior also changes.