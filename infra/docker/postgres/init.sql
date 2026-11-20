-- SMS Database Complete Initialization
-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Schemas
CREATE SCHEMA IF NOT EXISTS academic;
CREATE SCHEMA IF NOT EXISTS people;
CREATE SCHEMA IF NOT EXISTS attendance;
CREATE SCHEMA IF NOT EXISTS leave;
CREATE SCHEMA IF NOT EXISTS finance;
CREATE SCHEMA IF NOT EXISTS payroll;
CREATE SCHEMA IF NOT EXISTS notice;
CREATE SCHEMA IF NOT EXISTS outbox;
CREATE SCHEMA IF NOT EXISTS audit;

-- Application roles
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'sms_api') THEN
    CREATE ROLE sms_api WITH LOGIN PASSWORD 'sms_api_password';
  END IF;
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'sms_worker') THEN
    CREATE ROLE sms_worker WITH LOGIN PASSWORD 'sms_worker_password';
  END IF;
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'sms_payroll_reader') THEN
    CREATE ROLE sms_payroll_reader WITH LOGIN PASSWORD 'sms_payroll_reader_password';
  END IF;
END $$;

-- Schema usage grants
GRANT USAGE ON SCHEMA academic, people, attendance, leave, finance, payroll, notice, outbox, audit TO sms_api, sms_worker;
GRANT USAGE ON SCHEMA attendance, payroll, finance TO sms_payroll_reader;

-- Default table privileges for sms_api
ALTER DEFAULT PRIVILEGES IN SCHEMA academic, people, attendance, leave, notice, outbox
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO sms_api;
ALTER DEFAULT PRIVILEGES IN SCHEMA outbox
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO sms_worker;
ALTER DEFAULT PRIVILEGES IN SCHEMA finance
  GRANT SELECT, INSERT ON TABLES TO sms_api;
ALTER DEFAULT PRIVILEGES IN SCHEMA attendance, payroll
  GRANT SELECT ON TABLES TO sms_payroll_reader;

-- ============================================================
-- FINANCIAL SAFETY: Append-only ledger_entry (Invariant 8)
-- ============================================================
CREATE OR REPLACE FUNCTION finance.prevent_ledger_mutation()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'finance.ledger_entry is append-only. Use reversal_of for corrections.';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS ledger_entry_no_modify ON finance.ledger_entry;
CREATE TRIGGER ledger_entry_no_modify
  BEFORE UPDATE OR DELETE ON finance.ledger_entry
  FOR EACH ROW EXECUTE FUNCTION finance.prevent_ledger_mutation();

-- ============================================================
-- AUDIT SAFETY: Append-only audit.log (Invariant 10)
-- ============================================================
CREATE OR REPLACE FUNCTION audit.prevent_audit_mutation()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'audit.log is append-only. Modifications are forbidden.';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS audit_log_no_modify ON audit.log;
CREATE TRIGGER audit_log_no_modify
  BEFORE UPDATE OR DELETE ON audit.log
  FOR EACH ROW EXECUTE FUNCTION audit.prevent_audit_mutation();

-- INSERT-only grants for audit.log
REVOKE UPDATE, DELETE ON audit.log FROM sms_api, sms_worker;
GRANT INSERT, SELECT ON audit.log TO sms_api, sms_worker;

-- INSERT-only grant for finance.ledger_entry
REVOKE UPDATE, DELETE ON finance.ledger_entry FROM sms_api;
GRANT INSERT, SELECT ON finance.ledger_entry TO sms_api;

-- ============================================================
-- PAYROLL ISOLATION: sms_payroll_reader cannot access period_event (Invariant 9)
-- ============================================================
REVOKE SELECT ON attendance.period_event FROM sms_payroll_reader;
GRANT SELECT ON attendance.period_close TO sms_payroll_reader;

-- ============================================================
-- MAKER-CHECKER: period_close approval constraint (F-4.1)
-- ============================================================
ALTER TABLE attendance.period_close
  ADD CONSTRAINT maker_neq_checker_period_close
  CHECK (approved_by IS NULL OR approved_by <> submitted_by);

-- ============================================================
-- MAKER-CHECKER: payroll_run approval constraint (F-5.3)
-- ============================================================
ALTER TABLE payroll.payroll_run
  ADD CONSTRAINT maker_neq_checker_payroll
  CHECK (approved_by IS NULL OR approved_by <> created_by);

-- ============================================================
-- ATTENDANCE PARTITIONING: Create initial monthly partitions (F-3.3)
-- ============================================================
-- Parent table is already range-partitioned by event_date via drizzle schema.
-- Create partitions for current and next 3 months.
DO $$
DECLARE
  d date := date_trunc('month', CURRENT_DATE);
BEGIN
  FOR i IN 0..3 LOOP
    EXECUTE format('CREATE TABLE IF NOT EXISTS attendance.period_event_%s
      PARTITION OF attendance.period_event
      FOR VALUES FROM (%L) TO (%L);',
      to_char(d + (i || ' months')::interval, 'YYYY_MM'),
      d + (i || ' months')::interval,
      d + ((i + 1) || ' months')::interval);
  END LOOP;
END $$;

-- ============================================================
-- INDEXES: Performance (pg_trgm + GIN)
-- ============================================================
CREATE INDEX IF NOT EXISTS student_name_en_trgm_idx
  ON people.student USING gin (name_en gin_trgm_ops);
CREATE INDEX IF NOT EXISTS student_name_bn_trgm_idx
  ON people.student USING gin (name_bn gin_trgm_ops);
CREATE INDEX IF NOT EXISTS student_admission_no_idx
  ON people.student (admission_no);
CREATE INDEX IF NOT EXISTS staff_name_en_trgm_idx
  ON people.staff USING gin (name_en gin_trgm_ops);
CREATE INDEX IF NOT EXISTS staff_employee_no_idx
  ON people.staff (employee_no);

-- Notice full-text search index (F-6.2 / F-6.3)
CREATE INDEX IF NOT EXISTS notice_fts_idx
  ON notice.notice USING gin (to_tsvector('simple', title || ' ' || body));

-- Outbox job status index for SKIP LOCKED
CREATE INDEX IF NOT EXISTS outbox_job_status_next_idx
  ON outbox.job (status, next_attempt_at);

-- Attendance composite lookup
CREATE INDEX IF NOT EXISTS period_event_student_date_idx
  ON attendance.period_event (student_id, event_date);
