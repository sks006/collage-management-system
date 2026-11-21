# 2. Database: PostgreSQL as Single Source of Truth

Date: 2026-11-20
Status: Accepted

## Context
Educational institutions require strict relational integrity between academic terms, class enrollments, fee schedules, attendance events, and accounting entries. Dual-writing to secondary databases or message brokers introduces race conditions and consistency gaps.

## Decision
PostgreSQL 16 is designated as the sole authoritative source of truth:
- Organized into 9 dedicated logical schemas (`auth`, `academic`, `people`, `attendance`, `leave`, `finance`, `payroll`, `notice`, `audit`).
- Transactional integrity guarantees ACID compliance for enrollments, fee payments, and period closures.
- Secondary indexes (`pg_trgm`, `tsvector`) provide search capabilities directly within PostgreSQL without external sync dependencies.

## Consequences
- Guaranteed consistency without distributed transaction sagas.
- Simplifies operational backups (WAL-G/pgBackRest) and point-in-time recovery.
- Avoids dual-write synchronization bugs.
