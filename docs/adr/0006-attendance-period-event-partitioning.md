# 6. High-Volume Attendance: Monthly Range Partitioning

Date: 2026-11-20
Status: Accepted

## Context
With 20,000 students and up to 7 periods per day, attendance records accumulate at ~140,000 rows/day or ~3.5 million rows/month. Monolithic tables cause index bloat, vacuum degradation, and sluggish queries.

## Decision
Apply PostgreSQL monthly range partitioning on `attendance.period_event` keyed on `event_date`:
- Pre-generate monthly partitions 60 days in advance via a scheduled maintenance routine.
- Query filters targeting specific dates or terms achieve instant partition pruning.
- Materialize derived attendance summaries into `attendance.daily_summary` to avoid recomputing period-level scans on dashboard loads.

## Consequences
- High-throughput parallel bulk inserts (e.g. 50-student section batch marks) complete in sub-100ms.
- Retains query performance across years of historical data without table lock degradation.
