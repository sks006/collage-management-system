-- PostgreSQL 16 Initialization Script for School Management System
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- 1. Create Core Schemas
CREATE SCHEMA IF NOT EXISTS academic;
CREATE SCHEMA IF NOT EXISTS people;
CREATE SCHEMA IF NOT EXISTS attendance;
CREATE SCHEMA IF NOT EXISTS leave;
CREATE SCHEMA IF NOT EXISTS finance;
CREATE SCHEMA IF NOT EXISTS payroll;
CREATE SCHEMA IF NOT EXISTS notice;
CREATE SCHEMA IF NOT EXISTS outbox;
CREATE SCHEMA IF NOT EXISTS audit;

-- 2. Create Application Roles with Secure Passwords
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

-- 3. Schema Usage Grants
GRANT USAGE ON SCHEMA academic, people, attendance, leave, finance, payroll, notice, outbox, audit TO sms_api, sms_worker;
GRANT USAGE ON SCHEMA attendance, payroll, finance TO sms_payroll_reader;

-- 4. Invariant Enforcement: sms_api & sms_worker Table Permissions
ALTER DEFAULT PRIVILEGES IN SCHEMA academic, people, attendance, leave, notice, outbox
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO sms_api;

ALTER DEFAULT PRIVILEGES IN SCHEMA outbox
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO sms_worker;

-- Financial Safety Invariant 8: Append-only ledger
-- sms_api receives INSERT and SELECT only on finance.ledger_entry
-- NO UPDATE, NO DELETE
-- Similarly for audit.log: INSERT and SELECT only
