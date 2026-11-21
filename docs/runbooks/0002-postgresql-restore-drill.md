# Runbook: PostgreSQL Disaster Recovery & Restore Drill

**Frequency:** Bi-annual (or prior to institutional go-live)
**Target RTO:** <= 4 hours
**Target RPO:** <= 5 minutes

## Verification Procedure
1. Provision isolated staging database server with identical PostgreSQL 16 configuration.
2. Fetch latest base backup from S3/R2 storage:
   ```bash
   wal-g backup-fetch /var/lib/postgresql/data LATEST
   ```
3. Generate `recovery.signal` and configure `restore_command`:
   ```bash
   restore_command = 'wal-g wal-fetch "%f" "%p"'
   ```
4. Start PostgreSQL service and monitor log output for consistent WAL recovery point.
5. Execute checksum verification across all 9 schemas:
   - Verify row count parity across `attendance.period_event`, `finance.ledger_entry`, and `people.student`.
   - Confirm ledger entries balance: `SUM(DEBIT) = SUM(CREDIT)`.
6. Document audit certificate signed by Database Administrator and Systems Architect.
