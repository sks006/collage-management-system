import { pgSchema, uuid, text, numeric, timestamp, date, jsonb } from "drizzle-orm/pg-core";
import { student } from "./people";
import { academicYear, classTable } from "./academic";

export const financeSchema = pgSchema("finance");

export const feeSchedule = financeSchema.table("fee_schedule", {
  id: uuid("id").primaryKey().defaultRandom(),
  academicYearId: uuid("academic_year_id").references(() => academicYear.id).notNull(),
  classId: uuid("class_id").references(() => classTable.id).notNull(),
  name: text("name").notNull(),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  frequency: text("frequency").notNull(), // MONTHLY, QUARTERLY, ANNUAL, ONE_TIME
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const invoice = financeSchema.table("invoice", {
  id: uuid("id").primaryKey().defaultRandom(),
  studentId: uuid("student_id").references(() => student.id).notNull(),
  academicYearId: uuid("academic_year_id").references(() => academicYear.id).notNull(),
  month: date("month").notNull(),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  dueDate: date("due_date").notNull(),
  status: text("status").default("ISSUED").notNull(), // DRAFT, ISSUED, PAID, PARTIAL, OVERDUE, CANCELLED, WAIVED
  idempotencyKey: text("idempotency_key").unique().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const payment = financeSchema.table("payment", {
  id: uuid("id").primaryKey().defaultRandom(),
  invoiceId: uuid("invoice_id").references(() => invoice.id).notNull(),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  currency: text("currency").default("BDT").notNull(),
  method: text("method").notNull(), // BKASH, NAGAD, ROCKET, CARD, CASH
  aggregatorTranId: text("aggregator_tran_id"),
  aggregatorSessionKey: text("aggregator_session_key"),
  status: text("status").default("PENDING").notNull(), // PENDING, PROCESSING, PROCESSED, FAILED, MISMATCH, REFUNDED
  idempotencyKey: text("idempotency_key").unique().notNull(),
  ipnPayload: jsonb("ipn_payload"),
  validatedAt: timestamp("validated_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const ledgerEntry = financeSchema.table("ledger_entry", {
  id: uuid("id").primaryKey().defaultRandom(),
  account: text("account").notNull(), // STUDENT_FEES, PAYROLL, WAIVER, REFUND, ADJUSTMENT
  partyType: text("party_type").notNull(), // STUDENT, STAFF
  partyId: uuid("party_id").notNull(),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  currency: text("currency").default("BDT").notNull(),
  direction: text("direction").notNull(), // DEBIT, CREDIT
  source: text("source").notNull(), // PAYMENT, PAYROLL, WAIVER, REFUND
  sourceId: uuid("source_id").notNull(),
  reversalOf: uuid("reversal_of"),
  idempotencyKey: text("idempotency_key").unique().notNull(),
  postedAt: timestamp("posted_at", { withTimezone: true }).defaultNow().notNull(),
  postedBy: uuid("posted_by").notNull(),
  status: text("status").default("POSTED").notNull(), // POSTED, REVERSED
});

export const adjustment = financeSchema.table("adjustment", {
  id: uuid("id").primaryKey().defaultRandom(),
  ledgerEntryId: uuid("ledger_entry_id").references(() => ledgerEntry.id).notNull(),
  type: text("type").notNull(), // WAIVER, REFUND, SCHOLARSHIP, CORRECTION
  reason: text("reason").notNull(),
  approvedBy: uuid("approved_by").notNull(),
  approvedAt: timestamp("approved_at", { withTimezone: true }).defaultNow().notNull(),
  createdBy: uuid("created_by").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const reconciliationRun = financeSchema.table("reconciliation_run", {
  id: uuid("id").primaryKey().defaultRandom(),
  runDate: date("run_date").notNull(),
  status: text("status").notNull(), // PENDING, MATCHED, MISMATCHED
  mismatches: jsonb("mismatches"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
