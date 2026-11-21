# 5. Financial Operations: Append-Only Double-Entry Ledger

Date: 2026-11-20
Status: Accepted

## Context
Educational institutions handle millions in student tuition fees and staff payroll disbursements. Modifying or deleting ledger records causes accounting discrepancies, destroys audit trails, and violates financial regulatory standards.

## Decision
Implement an immutable, append-only ledger in `finance.ledger_entry`:
- Database triggers and application guards prohibit `UPDATE` and `DELETE` queries on `finance.ledger_entry`.
- Corrections and adjustments require an explicit offsetting debit or credit entry referencing `reversal_of`.
- Every entry tracks running account balances, student IDs, transaction references, and timestamped audit metadata.

## Consequences
- Guaranteed auditability and mathematical integrity for institutional accountants and auditors.
- Zero risk of retrospective ledger tampering or balance corruption.
