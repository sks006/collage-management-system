# Runbook: Weekend Cutover and Rollback Plan (Go-Live)

**Target Institution:** Dhaka Model College
**Cutover Window:** Friday 18:00 to Sunday 06:00
**Emergency Rollback Trigger:** Data parity discrepancy > 0.01% or recovery failure exceeding 2 hours.

## Pre-Cutover Checklist (T - 24 Hours)
1. Complete final differential backup of legacy database.
2. Confirm Keycloak realm export and Google OAuth identity broker connectivity.
3. Validate PostgreSQL 16 replication and point-in-time recovery WAL shipping.
4. Notify all 20,000 parents and 250 staff of planned maintenance window via SMS.

## Execution Sequence (Cutover Weekend)
1. **Friday 18:00:** Put legacy portal into read-only mode.
2. **Friday 19:00:** Execute `scripts/migration/extract-legacy-data.ts`.
3. **Friday 22:00:** Run schema migrations (`pnpm --filter @sms/database db:migrate`).
4. **Saturday 02:00:** Load extracted data into `people.student`, `people.staff`, and `academic` structures.
5. **Saturday 06:00:** Generate opening ledger balance entries in `finance.ledger_entry`.
6. **Saturday 10:00:** Execute `scripts/migration/reconcile-control-totals.ts` to ensure 100% balance match.
7. **Saturday 14:00:** Conduct smoke tests across 7 user personas (Principal, Teacher, Finance, Office, Student, Parent, Admin).
8. **Sunday 06:00:** Switch DNS record `sms.dhakamodel.edu.bd` to new production cluster.

## Rollback Plan
If an unrecoverable failure occurs prior to Sunday 00:00:
1. Revert DNS pointers back to legacy infrastructure.
2. Purge staging SMS queue to prevent duplicate notifications.
3. Post maintenance notice on institutional website.
