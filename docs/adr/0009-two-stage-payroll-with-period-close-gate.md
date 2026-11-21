# 9. Payroll Workflow: Maker-Checker Approval with Period Close Gate

Date: 2026-11-20
Status: Accepted

## Context
Staff salary computation depends heavily on monthly attendance (present days, late deductions, unpaid leaves). Computing payroll against mutable attendance records leads to discrepancies and fraud.

## Decision
Enforce a two-stage locking gate:
1. Stage 1 - Period Close Gate: Academic and attendance data for a calendar month is locked and signed by the Academic Supervisor/Principal (`status = 'APPROVED'`).
2. Stage 2 - Payroll Maker-Checker: Finance creates the payroll run strictly reading from the locked period close snapshot (`created_by`). A different user with `PRINCIPAL` role must approve it (`approved_by <> created_by`).

## Consequences
- Guaranteed mathematical consistency between attendance records and salary paystubs.
- Strong maker-checker separation of duties preventing unauthorized salary disbursements.
