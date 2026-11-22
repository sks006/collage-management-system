CREATE SCHEMA IF NOT EXISTS "academic";
--> statement-breakpoint
CREATE SCHEMA IF NOT EXISTS "attendance";
--> statement-breakpoint
CREATE SCHEMA IF NOT EXISTS "audit";
--> statement-breakpoint
CREATE SCHEMA IF NOT EXISTS "finance";
--> statement-breakpoint
CREATE SCHEMA IF NOT EXISTS "leave";
--> statement-breakpoint
CREATE SCHEMA IF NOT EXISTS "notice";
--> statement-breakpoint
CREATE SCHEMA IF NOT EXISTS "outbox";
--> statement-breakpoint
CREATE SCHEMA IF NOT EXISTS "payroll";
--> statement-breakpoint
CREATE SCHEMA IF NOT EXISTS "people";
--> statement-breakpoint
CREATE TABLE "academic"."academic_year" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"is_current" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "academic"."class" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"numeric_level" smallint NOT NULL,
	"academic_year_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "academic"."section" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"class_id" uuid NOT NULL,
	"name" text NOT NULL,
	"capacity" smallint DEFAULT 40 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "academic"."subject" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"code" text NOT NULL,
	"class_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "academic"."teacher_section" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"staff_id" uuid NOT NULL,
	"section_id" uuid NOT NULL,
	"subject_id" uuid,
	"academic_year_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "teacher_section_staff_id_section_id_subject_id_academic_year_id_unique" UNIQUE("staff_id","section_id","subject_id","academic_year_id")
);
--> statement-breakpoint
CREATE TABLE "academic"."term" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"academic_year_id" uuid NOT NULL,
	"name" text NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"sequence" smallint NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "attendance"."correction_request" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"student_id" uuid NOT NULL,
	"event_date" date NOT NULL,
	"period" smallint DEFAULT 0 NOT NULL,
	"old_status" text NOT NULL,
	"new_status" text NOT NULL,
	"reason" text NOT NULL,
	"requested_by" uuid NOT NULL,
	"requested_at" timestamp with time zone DEFAULT now() NOT NULL,
	"approved_by" uuid,
	"approved_at" timestamp with time zone,
	"status" text DEFAULT 'PENDING' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "attendance"."daily_summary" (
	"student_id" uuid NOT NULL,
	"event_date" date NOT NULL,
	"section_id" uuid NOT NULL,
	"present_count" smallint DEFAULT 0 NOT NULL,
	"absent_count" smallint DEFAULT 0 NOT NULL,
	"late_count" smallint DEFAULT 0 NOT NULL,
	"excused_count" smallint DEFAULT 0 NOT NULL,
	"total_periods" smallint DEFAULT 0 NOT NULL,
	"attendance_rate" numeric(5, 2),
	"computed_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "daily_summary_student_id_event_date_section_id_pk" PRIMARY KEY("student_id","event_date","section_id")
);
--> statement-breakpoint
CREATE TABLE "attendance"."period_close" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"section_id" uuid NOT NULL,
	"month" date NOT NULL,
	"status" text DEFAULT 'DRAFT' NOT NULL,
	"summary" jsonb NOT NULL,
	"submitted_by" uuid,
	"submitted_at" timestamp with time zone,
	"approved_by" uuid,
	"approved_at" timestamp with time zone,
	"locked_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "attendance"."period_event" (
	"student_id" uuid NOT NULL,
	"event_date" date NOT NULL,
	"period" smallint DEFAULT 0 NOT NULL,
	"section_id" uuid NOT NULL,
	"subject_id" uuid,
	"status" text NOT NULL,
	"source" text NOT NULL,
	"marked_by" uuid NOT NULL,
	"marked_at" timestamp with time zone DEFAULT now() NOT NULL,
	"device_id" uuid,
	"note" text,
	CONSTRAINT "period_event_student_id_event_date_period_pk" PRIMARY KEY("student_id","event_date","period")
);
--> statement-breakpoint
CREATE TABLE "audit"."log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"actor_id" uuid NOT NULL,
	"actor_role" text NOT NULL,
	"action" text NOT NULL,
	"resource_type" text NOT NULL,
	"resource_id" uuid NOT NULL,
	"old_value" jsonb,
	"new_value" jsonb,
	"ip_address" text,
	"user_agent" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "finance"."adjustment" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ledger_entry_id" uuid NOT NULL,
	"type" text NOT NULL,
	"reason" text NOT NULL,
	"approved_by" uuid NOT NULL,
	"approved_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "finance"."fee_schedule" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"academic_year_id" uuid NOT NULL,
	"class_id" uuid NOT NULL,
	"name" text NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"frequency" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "finance"."invoice" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"student_id" uuid NOT NULL,
	"academic_year_id" uuid NOT NULL,
	"month" date NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"due_date" date NOT NULL,
	"status" text DEFAULT 'ISSUED' NOT NULL,
	"idempotency_key" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "invoice_idempotency_key_unique" UNIQUE("idempotency_key")
);
--> statement-breakpoint
CREATE TABLE "finance"."ledger_entry" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"account" text NOT NULL,
	"party_type" text NOT NULL,
	"party_id" uuid NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"currency" text DEFAULT 'BDT' NOT NULL,
	"direction" text NOT NULL,
	"source" text NOT NULL,
	"source_id" uuid NOT NULL,
	"reversal_of" uuid,
	"idempotency_key" text NOT NULL,
	"posted_at" timestamp with time zone DEFAULT now() NOT NULL,
	"posted_by" uuid NOT NULL,
	"status" text DEFAULT 'POSTED' NOT NULL,
	CONSTRAINT "ledger_entry_idempotency_key_unique" UNIQUE("idempotency_key")
);
--> statement-breakpoint
CREATE TABLE "finance"."payment" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"invoice_id" uuid NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"currency" text DEFAULT 'BDT' NOT NULL,
	"method" text NOT NULL,
	"aggregator_tran_id" text,
	"aggregator_session_key" text,
	"status" text DEFAULT 'PENDING' NOT NULL,
	"idempotency_key" text NOT NULL,
	"ipn_payload" jsonb,
	"validated_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "payment_idempotency_key_unique" UNIQUE("idempotency_key")
);
--> statement-breakpoint
CREATE TABLE "finance"."reconciliation_run" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"run_date" date NOT NULL,
	"status" text NOT NULL,
	"mismatches" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "leave"."calendar_day" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"date" date NOT NULL,
	"type" text NOT NULL,
	"label" text,
	"academic_year_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "calendar_day_date_unique" UNIQUE("date")
);
--> statement-breakpoint
CREATE TABLE "leave"."leave_request" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"staff_id" uuid NOT NULL,
	"leave_type_id" uuid NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"days" smallint NOT NULL,
	"reason" text NOT NULL,
	"status" text DEFAULT 'PENDING' NOT NULL,
	"requested_at" timestamp with time zone DEFAULT now() NOT NULL,
	"approved_by" uuid,
	"approved_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "leave"."leave_type" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"max_days_per_year" smallint NOT NULL,
	"is_paid" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "leave_type_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "leave"."substitution" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"leave_request_id" uuid NOT NULL,
	"original_staff_id" uuid NOT NULL,
	"substitute_staff_id" uuid NOT NULL,
	"section_id" uuid NOT NULL,
	"date" date NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notice"."notice" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"body" text NOT NULL,
	"audience" jsonb NOT NULL,
	"published" boolean DEFAULT false NOT NULL,
	"published_at" timestamp with time zone,
	"created_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "outbox"."job" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" text NOT NULL,
	"payload" jsonb NOT NULL,
	"dedupe_key" text NOT NULL,
	"status" text DEFAULT 'PENDING' NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"max_attempts" integer DEFAULT 5 NOT NULL,
	"next_attempt_at" timestamp with time zone DEFAULT now() NOT NULL,
	"locked_at" timestamp with time zone,
	"locked_by" text,
	"last_error" text,
	"run_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone,
	CONSTRAINT "job_dedupe_key_unique" UNIQUE("dedupe_key")
);
--> statement-breakpoint
CREATE TABLE "payroll"."dispatch_batch" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"payroll_run_id" uuid NOT NULL,
	"file_url" text NOT NULL,
	"format" text DEFAULT 'BEFTN' NOT NULL,
	"status" text DEFAULT 'PENDING' NOT NULL,
	"dispatched_at" timestamp with time zone,
	"confirmed_at" timestamp with time zone,
	"error" text
);
--> statement-breakpoint
CREATE TABLE "payroll"."payroll_line" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"payroll_run_id" uuid NOT NULL,
	"staff_id" uuid NOT NULL,
	"basic_salary" numeric(12, 2) NOT NULL,
	"allowances" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"deductions" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"gross" numeric(12, 2) NOT NULL,
	"net" numeric(12, 2) NOT NULL,
	"is_immutable" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payroll"."payroll_run" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"month" date NOT NULL,
	"status" text DEFAULT 'DRAFT' NOT NULL,
	"created_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"approved_by" uuid,
	"approved_at" timestamp with time zone,
	"dispatched_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "payroll"."payslip" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"payroll_line_id" uuid NOT NULL,
	"file_url" text NOT NULL,
	"generated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "people"."enrollment" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"student_id" uuid NOT NULL,
	"section_id" uuid NOT NULL,
	"academic_year_id" uuid NOT NULL,
	"roll_no" text NOT NULL,
	"enrolled_at" timestamp with time zone DEFAULT now() NOT NULL,
	"status" text DEFAULT 'ENROLLED' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "people"."role_request" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"keycloak_user_id" text NOT NULL,
	"email" text NOT NULL,
	"full_name" text NOT NULL,
	"phone" text,
	"requested_role" text NOT NULL,
	"reference_no" text,
	"institutional_meta" jsonb,
	"status" text DEFAULT 'PENDING' NOT NULL,
	"reviewed_by" uuid,
	"reviewed_at" timestamp with time zone,
	"rejection_reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "people"."staff" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"employee_no" text NOT NULL,
	"name_en" text NOT NULL,
	"name_bn" text,
	"role" text DEFAULT 'TEACHER' NOT NULL,
	"designation" text DEFAULT 'Faculty',
	"department" text DEFAULT 'General',
	"department_id" uuid,
	"date_of_birth" date,
	"gender" text DEFAULT 'OTHER',
	"phone" text,
	"email" text NOT NULL,
	"address" text,
	"join_date" date,
	"bank_account_no" text,
	"bank_name" text,
	"bank_branch" text,
	"keycloak_user_id" text,
	"photo_url" text,
	"status" text DEFAULT 'ACTIVE' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "staff_employee_no_unique" UNIQUE("employee_no"),
	CONSTRAINT "staff_email_unique" UNIQUE("email"),
	CONSTRAINT "staff_keycloak_user_id_unique" UNIQUE("keycloak_user_id")
);
--> statement-breakpoint
CREATE TABLE "people"."student" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"admission_no" text NOT NULL,
	"name_en" text NOT NULL,
	"name_bn" text,
	"date_of_birth" date,
	"gender" text DEFAULT 'OTHER',
	"blood_group" text,
	"phone" text,
	"email" text,
	"address" text,
	"department_id" uuid,
	"session_year" text,
	"guardian_name" text,
	"guardian_phone" text,
	"guardian_email" text,
	"guardian_keycloak_id" text,
	"keycloak_user_id" text,
	"photo_url" text,
	"status" text DEFAULT 'ACTIVE' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "student_admission_no_unique" UNIQUE("admission_no"),
	CONSTRAINT "student_email_unique" UNIQUE("email"),
	CONSTRAINT "student_keycloak_user_id_unique" UNIQUE("keycloak_user_id")
);
--> statement-breakpoint
ALTER TABLE "academic"."class" ADD CONSTRAINT "class_academic_year_id_academic_year_id_fk" FOREIGN KEY ("academic_year_id") REFERENCES "academic"."academic_year"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "academic"."section" ADD CONSTRAINT "section_class_id_class_id_fk" FOREIGN KEY ("class_id") REFERENCES "academic"."class"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "academic"."subject" ADD CONSTRAINT "subject_class_id_class_id_fk" FOREIGN KEY ("class_id") REFERENCES "academic"."class"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "academic"."teacher_section" ADD CONSTRAINT "teacher_section_section_id_section_id_fk" FOREIGN KEY ("section_id") REFERENCES "academic"."section"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "academic"."teacher_section" ADD CONSTRAINT "teacher_section_subject_id_subject_id_fk" FOREIGN KEY ("subject_id") REFERENCES "academic"."subject"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "academic"."teacher_section" ADD CONSTRAINT "teacher_section_academic_year_id_academic_year_id_fk" FOREIGN KEY ("academic_year_id") REFERENCES "academic"."academic_year"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "academic"."term" ADD CONSTRAINT "term_academic_year_id_academic_year_id_fk" FOREIGN KEY ("academic_year_id") REFERENCES "academic"."academic_year"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attendance"."correction_request" ADD CONSTRAINT "correction_request_student_id_student_id_fk" FOREIGN KEY ("student_id") REFERENCES "people"."student"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attendance"."period_close" ADD CONSTRAINT "period_close_section_id_section_id_fk" FOREIGN KEY ("section_id") REFERENCES "academic"."section"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attendance"."period_event" ADD CONSTRAINT "period_event_student_id_student_id_fk" FOREIGN KEY ("student_id") REFERENCES "people"."student"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attendance"."period_event" ADD CONSTRAINT "period_event_section_id_section_id_fk" FOREIGN KEY ("section_id") REFERENCES "academic"."section"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attendance"."period_event" ADD CONSTRAINT "period_event_subject_id_subject_id_fk" FOREIGN KEY ("subject_id") REFERENCES "academic"."subject"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "finance"."adjustment" ADD CONSTRAINT "adjustment_ledger_entry_id_ledger_entry_id_fk" FOREIGN KEY ("ledger_entry_id") REFERENCES "finance"."ledger_entry"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "finance"."fee_schedule" ADD CONSTRAINT "fee_schedule_academic_year_id_academic_year_id_fk" FOREIGN KEY ("academic_year_id") REFERENCES "academic"."academic_year"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "finance"."fee_schedule" ADD CONSTRAINT "fee_schedule_class_id_class_id_fk" FOREIGN KEY ("class_id") REFERENCES "academic"."class"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "finance"."invoice" ADD CONSTRAINT "invoice_student_id_student_id_fk" FOREIGN KEY ("student_id") REFERENCES "people"."student"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "finance"."invoice" ADD CONSTRAINT "invoice_academic_year_id_academic_year_id_fk" FOREIGN KEY ("academic_year_id") REFERENCES "academic"."academic_year"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "finance"."payment" ADD CONSTRAINT "payment_invoice_id_invoice_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "finance"."invoice"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leave"."calendar_day" ADD CONSTRAINT "calendar_day_academic_year_id_academic_year_id_fk" FOREIGN KEY ("academic_year_id") REFERENCES "academic"."academic_year"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leave"."leave_request" ADD CONSTRAINT "leave_request_staff_id_staff_id_fk" FOREIGN KEY ("staff_id") REFERENCES "people"."staff"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leave"."leave_request" ADD CONSTRAINT "leave_request_leave_type_id_leave_type_id_fk" FOREIGN KEY ("leave_type_id") REFERENCES "leave"."leave_type"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leave"."substitution" ADD CONSTRAINT "substitution_leave_request_id_leave_request_id_fk" FOREIGN KEY ("leave_request_id") REFERENCES "leave"."leave_request"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leave"."substitution" ADD CONSTRAINT "substitution_original_staff_id_staff_id_fk" FOREIGN KEY ("original_staff_id") REFERENCES "people"."staff"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leave"."substitution" ADD CONSTRAINT "substitution_substitute_staff_id_staff_id_fk" FOREIGN KEY ("substitute_staff_id") REFERENCES "people"."staff"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leave"."substitution" ADD CONSTRAINT "substitution_section_id_section_id_fk" FOREIGN KEY ("section_id") REFERENCES "academic"."section"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payroll"."dispatch_batch" ADD CONSTRAINT "dispatch_batch_payroll_run_id_payroll_run_id_fk" FOREIGN KEY ("payroll_run_id") REFERENCES "payroll"."payroll_run"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payroll"."payroll_line" ADD CONSTRAINT "payroll_line_payroll_run_id_payroll_run_id_fk" FOREIGN KEY ("payroll_run_id") REFERENCES "payroll"."payroll_run"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payroll"."payroll_line" ADD CONSTRAINT "payroll_line_staff_id_staff_id_fk" FOREIGN KEY ("staff_id") REFERENCES "people"."staff"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payroll"."payslip" ADD CONSTRAINT "payslip_payroll_line_id_payroll_line_id_fk" FOREIGN KEY ("payroll_line_id") REFERENCES "payroll"."payroll_line"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "people"."enrollment" ADD CONSTRAINT "enrollment_student_id_student_id_fk" FOREIGN KEY ("student_id") REFERENCES "people"."student"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "people"."enrollment" ADD CONSTRAINT "enrollment_section_id_section_id_fk" FOREIGN KEY ("section_id") REFERENCES "academic"."section"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "people"."enrollment" ADD CONSTRAINT "enrollment_academic_year_id_academic_year_id_fk" FOREIGN KEY ("academic_year_id") REFERENCES "academic"."academic_year"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "period_close_section_id_month_index" ON "attendance"."period_close" USING btree ("section_id","month");--> statement-breakpoint
CREATE INDEX "period_event_event_date_idx" ON "attendance"."period_event" USING btree ("event_date");--> statement-breakpoint
CREATE INDEX "audit_resource_idx" ON "audit"."log" USING btree ("resource_type","resource_id");--> statement-breakpoint
CREATE INDEX "audit_actor_idx" ON "audit"."log" USING btree ("actor_id");--> statement-breakpoint
CREATE INDEX "outbox_job_status_next_idx" ON "outbox"."job" USING btree ("status","next_attempt_at");--> statement-breakpoint
CREATE UNIQUE INDEX "enrollment_student_id_academic_year_id_index" ON "people"."enrollment" USING btree ("student_id","academic_year_id");--> statement-breakpoint
CREATE INDEX "idx_role_request_pending" ON "people"."role_request" USING btree ("status","created_at");--> statement-breakpoint
CREATE INDEX "staff_name_en_trgm_idx" ON "people"."staff" USING btree ("name_en");--> statement-breakpoint
CREATE INDEX "staff_keycloak_user_id_idx" ON "people"."staff" USING btree ("keycloak_user_id");--> statement-breakpoint
CREATE INDEX "student_name_en_trgm_idx" ON "people"."student" USING btree ("name_en");--> statement-breakpoint
CREATE INDEX "student_name_bn_trgm_idx" ON "people"."student" USING btree ("name_bn");--> statement-breakpoint
CREATE INDEX "student_keycloak_user_id_idx" ON "people"."student" USING btree ("keycloak_user_id");--> statement-breakpoint
CREATE INDEX "student_guardian_keycloak_id_idx" ON "people"."student" USING btree ("guardian_keycloak_id");