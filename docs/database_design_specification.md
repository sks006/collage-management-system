# 🗄️ Database Architecture & Schema Specification

**Version:** 1.0  
**Engine:** PostgreSQL 16+ (Primary + Streaming Replica, PITR enabled)  
**ORM / Migration Strategy:** Drizzle ORM (`packages/database/src/schema/*`) for query building + Hand-Written SQL (`packages/database/src/migrations/*`) for partitions, triggers, roles, and views  
**Core Invariant:** PostgreSQL is the single source of truth; Redis holds zero persistent state or job queues.

---

## 1. Schema Map (9 Bounded PostgreSQL Schemas)

Every bounded context owns a dedicated PostgreSQL schema to prevent accidental cross-module joins and enable strict `GRANT`/`REVOKE` isolation at the database role level:

| Schema | Drizzle File | Tables / Views | Core Responsibility |
| :--- | :--- | :--- | :--- |
| **`academic`** | `schema/academic.ts` | `academic_year`, `term`, `class`, `section`, `subject`, `teacher_section` | Institutional hierarchy & teacher-section row-scope mappings |
| **`people`** | `schema/people.ts` | `student`, `staff`, `enrollment` | Authoritative human records & term-section enrollments |
| **`attendance`** | `schema/attendance.ts` | `period_event` *(partitioned)*, `daily_summary` *(matview)*, `correction_request`, `period_close` | High-volume presence events & monthly Maker-Checker lock gate |
| **`leave`** | `schema/leave.ts` | `calendar_day`, `leave_type`, `leave_request`, `substitution` | Holidays, weekends, leave balances & substitute assignments |
| **`finance`** | `schema/finance.ts` | `ledger_entry` *(append-only)*, `fee_schedule`, `invoice`, `payment`, `adjustment`, `reconciliation_run` | Student fee billing, MFS/card payments & immutable financial ledger |
| **`payroll`** | `schema/payroll.ts` | `payroll_run`, `payroll_line`, `dispatch_batch`, `payslip` | Monthly salary computation from locked attendance & BEFTN dispatch |
| **`notice`** | `schema/notice.ts` | `notice` | Role-targeted Bangla/English circulars with `tsvector` FTS |
| **`outbox`** | `schema/outbox.ts` | `job` | Transactional event bus, scheduler & `SKIP LOCKED` job queue |
| **`audit`** | `schema/audit.ts` | `log` *(append-only)* | Immutable compliance trail for mutations & PII reads |

---

## 2. Entity-Relationship Overview (Core Domain Boundaries)

```mermaid
erDiagram
    ACADEMIC_YEAR ||--o{ TERM : contains
    ACADEMIC_YEAR ||--o{ SECTION : defines
    CLASS ||--o{ SECTION : groups
    SECTION ||--o{ TEACHER_SECTION : assigns
    STAFF ||--o{ TEACHER_SECTION : teaches
    STUDENT ||--o{ ENROLLMENT : enrolled_in
    SECTION ||--o{ ENROLLMENT : hosts

    STUDENT ||--o{ PERIOD_EVENT : generates
    SECTION ||--o{ PERIOD_EVENT : scoped_to
    SECTION ||--o{ PERIOD_CLOSE : locked_by
    PERIOD_CLOSE ||--o{ PAYROLL_LINE : feeds

    STUDENT ||--o{ INVOICE : billed
    INVOICE ||--o{ PAYMENT : settled_by
    PAYMENT ||--o{ LEDGER_ENTRY : posts_credit
    PAYROLL_RUN ||--o{ PAYROLL_LINE : contains
    PAYROLL_RUN ||--o{ LEDGER_ENTRY : posts_debit
```

---

## 3. Critical Table Specifications & DDL

### 3.1 `attendance.period_event` (Range-Partitioned High-Volume Table)
* **Scale:** ~4M rows/year (`DAILY` mode, `period = 0`) up to ~24M rows/year (`PER_PERIOD` mode, `period = 1..12`).
* **Partitioning:** Declarative `PARTITION BY RANGE (event_date)` with monthly child partitions (`attendance.period_event_y2026m01`, etc.) provisioned 60 days ahead by an automated outbox job.

```sql
CREATE TABLE attendance.period_event (
    student_id   uuid NOT NULL,
    event_date   date NOT NULL,
    period       smallint NOT NULL DEFAULT 0, -- 0 = daily-only; 1..12 = per-period
    section_id   uuid NOT NULL,
    subject_id   uuid,
    status       text NOT NULL CHECK (status IN ('PRESENT', 'ABSENT', 'LATE', 'EXCUSED')),
    source       text NOT NULL CHECK (source IN ('DEVICE', 'MANUAL', 'IMPORT', 'CORRECTION')),
    marked_by    uuid NOT NULL,
    marked_at    timestamptz NOT NULL DEFAULT now(),
    device_id    uuid,
    note         text,
    PRIMARY KEY (student_id, event_date, period)
) PARTITION BY RANGE (event_date);

CREATE INDEX idx_period_event_section_date
    ON attendance.period_event (section_id, event_date);
```

### 3.2 `attendance.daily_summary` (Derived Materialized View)
* Never written to directly; refreshed via `REFRESH MATERIALIZED VIEW CONCURRENTLY attendance.daily_summary` after batch or approved correction commits.

```sql
CREATE MATERIALIZED VIEW attendance.daily_summary AS
SELECT
    student_id,
    section_id,
    event_date,
    COUNT(*) AS total_periods,
    COUNT(*) FILTER (WHERE status = 'PRESENT') AS present_periods,
    COUNT(*) FILTER (WHERE status = 'ABSENT') AS absent_periods,
    COUNT(*) FILTER (WHERE status = 'LATE') AS late_periods,
    CASE
        WHEN COUNT(*) FILTER (WHERE status IN ('PRESENT', 'LATE')) > 0 THEN 'PRESENT'
        WHEN COUNT(*) FILTER (WHERE status = 'EXCUSED') = COUNT(*) THEN 'EXCUSED'
        ELSE 'ABSENT'
    END AS daily_status
FROM attendance.period_event
GROUP BY student_id, section_id, event_date;

CREATE UNIQUE INDEX idx_daily_summary_pk
    ON attendance.daily_summary (student_id, event_date);
```

### 3.3 `attendance.period_close` (The Gate Between Attendance & Payroll)
* Freezes monthly attendance per section. Enforces `maker_neq_checker` at the database constraint level so the submitter cannot approve their own close.

```sql
CREATE TABLE attendance.period_close (
    id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    section_id     uuid NOT NULL,
    month          date NOT NULL, -- Normalized to first day of month (YYYY-MM-01)
    status         text NOT NULL DEFAULT 'DRAFT'
                   CHECK (status IN ('DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'LOCKED')),
    summary        jsonb NOT NULL,
    submitted_by   uuid,
    submitted_at   timestamptz,
    approved_by    uuid,
    approved_at    timestamptz,
    locked_at      timestamptz,
    UNIQUE (section_id, month),
    CONSTRAINT maker_neq_checker
        CHECK (approved_by IS NULL OR approved_by <> submitted_by)
);
```

### 3.4 `finance.ledger_entry` (Strictly Append-Only Financial Truth)
* **Invariant #8:** No `UPDATE` or `DELETE` is ever permitted on `finance.ledger_entry`. Reversals, refunds, and waivers insert new offsetting rows referencing `reversal_of`.

```sql
CREATE TABLE finance.ledger_entry (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    account         text NOT NULL CHECK (account IN ('STUDENT_FEES', 'PAYROLL', 'WAIVER', 'REFUND', 'ADJUSTMENT')),
    party_type      text NOT NULL CHECK (party_type IN ('STUDENT', 'STAFF')),
    party_id        uuid NOT NULL,
    amount          numeric(12, 2) NOT NULL CHECK (amount > 0),
    currency        char(3) NOT NULL DEFAULT 'BDT',
    direction       text NOT NULL CHECK (direction IN ('DEBIT', 'CREDIT')),
    source          text NOT NULL, -- 'IPN_WEBHOOK', 'PAYMENT_POLLER', 'WAIVER_APPROVAL', 'BEFTN_DISPATCH'
    source_id       uuid NOT NULL,
    reversal_of     uuid REFERENCES finance.ledger_entry(id),
    idempotency_key text UNIQUE NOT NULL,
    posted_at       timestamptz NOT NULL DEFAULT now(),
    posted_by       uuid NOT NULL,
    status          text NOT NULL DEFAULT 'POSTED' CHECK (status IN ('POSTED', 'REVERSED'))
);

CREATE INDEX idx_ledger_party ON finance.ledger_entry (party_type, party_id, posted_at DESC);
```

### 3.5 `outbox.job` (Single Transactional Queue & Scheduler)
* **Invariant #3 & #7:** Replaces Kafka, RabbitMQ, and BullMQ. Claimed concurrently by `apps/worker` using `FOR UPDATE SKIP LOCKED`.

```sql
CREATE TABLE outbox.job (
    id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    type              text NOT NULL,
    payload           jsonb NOT NULL,
    dedupe_key        text UNIQUE NOT NULL,
    status            text NOT NULL DEFAULT 'PENDING'
                      CHECK (status IN ('PENDING', 'CLAIMED', 'DONE', 'DEAD')),
    attempts          int NOT NULL DEFAULT 0,
    max_attempts      int NOT NULL DEFAULT 5,
    next_attempt_at   timestamptz NOT NULL DEFAULT now(),
    locked_at         timestamptz,
    locked_by         text,
    last_error        text,
    run_at            timestamptz NOT NULL DEFAULT now(),
    created_at        timestamptz NOT NULL DEFAULT now(),
    completed_at      timestamptz
);

CREATE INDEX idx_outbox_claimable
    ON outbox.job (status, next_attempt_at)
    WHERE status IN ('PENDING', 'CLAIMED');
```

---

## 4. Database Security, Roles & Append-Only Enforcement

### 4.1 Database Roles (`infra/docker/postgres/init.sql`)
Three distinct PostgreSQL roles enforce least-privilege access independently of application code:

| DB Role | Used By | Permissions & Hard Restrictions |
| :--- | :--- | :--- |
| **`sms_api`** | `apps/api` | CRUD on operational tables; **`INSERT, SELECT` ONLY** on `finance.ledger_entry` and `audit.log` (no `UPDATE`/`DELETE`). |
| **`sms_worker`** | `apps/worker` | Claims `outbox.job`, updates payment/payroll states, inserts ledger entries & PDF artifact keys. |
| **`sms_payroll_reader`** | Payroll computation worker | **`REVOKE ALL ON attendance.period_event`**; granted `SELECT` **only** on `attendance.period_close`. Physically incapable of reading unapproved attendance. |

### 4.2 Append-Only Trigger Guard
Even if a superuser or misconfigured role attempts a mutation on `finance.ledger_entry` or `audit.log`, a `BEFORE UPDATE OR DELETE` trigger aborts the transaction:

```sql
CREATE OR REPLACE FUNCTION prevent_mutation()
RETURNS trigger AS $$
BEGIN
    RAISE EXCEPTION 'Table %.% is append-only; UPDATE and DELETE are forbidden',
        TG_TABLE_SCHEMA, TG_TABLE_NAME;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_ledger_append_only
    BEFORE UPDATE OR DELETE ON finance.ledger_entry
    FOR EACH ROW EXECUTE FUNCTION prevent_mutation();

CREATE TRIGGER trg_audit_append_only
    BEFORE UPDATE OR DELETE ON audit.log
    FOR EACH ROW EXECUTE FUNCTION prevent_mutation();
```

---

## 5. Indexing & Bangla/English Search Strategy

* **Invariant #4:** Search indexes return entity `id`s only; PostgreSQL repositories subsequently load rows filtered by `RowScope`.
* **Extensions:** `pg_trgm` and `pgcrypto` enabled in `init.sql`.
* **People Lookup (`people.student`, `people.staff`):**
  * GIN trigram indexes (`gin_trgm_ops`) on `full_name` (Bangla + English) and B-tree prefix indexes on `admission_no`, `employee_no`, and `guardian_phone`.
* **Notice Full-Text Search (`notice.notice`):**
  * `GIN (to_tsvector('simple', coalesce(title, '') || ' ' || coalesce(body, '')))` using the `'simple'` dictionary so Bangla Unicode tokens are preserved without English stemming distortion.
  * *Upgrade Trigger (`F-6.5`):* If the 200-query Bangla recall benchmark falls below target recall, deploy Meilisearch as a sidecar index returning IDs only.

---

## 6. Migration Workflow & Disaster Recovery

### 6.1 Migration Rules (`packages/database`)
1. Schema definitions live in `packages/database/src/schema/*.ts` for TypeScript query safety.
2. Structural DDL that Drizzle cannot express natively—**range partitions, materialized views, triggers, `CHECK` constraints, and `GRANT`/`REVOKE` statements**—lives in numbered, idempotent SQL files under `packages/database/src/migrations/`.
3. Every migration must pass **forward $\rightarrow$ rollback $\rightarrow$ forward** verification in CI against PostgreSQL 16.

### 6.2 Backup, PITR & Restore Drills
* **RPO:** $\le$ 15 minutes via continuous WAL archiving to off-site S3-compatible storage in a separate credential domain.
* **RTO:** $\le$ 4 hours for full database restore.
* **Restore Drills:** Executed before go-live (`F-7.5`) and quarterly thereafter into an isolated staging environment with measured RTO logged in runbook `restore-postgres.md`.