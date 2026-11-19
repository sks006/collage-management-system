import { pgSchema, uuid, text, numeric, timestamp, date, jsonb, boolean } from "drizzle-orm/pg-core";
import { staff } from "./people";

export const payrollSchema = pgSchema("payroll");

export const payrollRun = payrollSchema.table("payroll_run", {
  id: uuid("id").primaryKey().defaultRandom(),
  month: date("month").notNull(),
  status: text("status").default("DRAFT").notNull(), // DRAFT, PENDING_APPROVAL, APPROVED, DISPATCHED, PAID, FAILED
  createdBy: uuid("created_by").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  approvedBy: uuid("approved_by"),
  approvedAt: timestamp("approved_at", { withTimezone: true }),
  dispatchedAt: timestamp("dispatched_at", { withTimezone: true }),
});

export const payrollLine = payrollSchema.table("payroll_line", {
  id: uuid("id").primaryKey().defaultRandom(),
  payrollRunId: uuid("payroll_run_id").references(() => payrollRun.id).notNull(),
  staffId: uuid("staff_id").references(() => staff.id).notNull(),
  basicSalary: numeric("basic_salary", { precision: 12, scale: 2 }).notNull(),
  allowances: jsonb("allowances").default({}).notNull(),
  deductions: jsonb("deductions").default({}).notNull(),
  gross: numeric("gross", { precision: 12, scale: 2 }).notNull(),
  net: numeric("net", { precision: 12, scale: 2 }).notNull(),
  isImmutable: boolean("is_immutable").default(false).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const dispatchBatch = payrollSchema.table("dispatch_batch", {
  id: uuid("id").primaryKey().defaultRandom(),
  payrollRunId: uuid("payroll_run_id").references(() => payrollRun.id).notNull(),
  fileUrl: text("file_url").notNull(),
  format: text("format").default("BEFTN").notNull(), // BEFTN, API
  status: text("status").default("PENDING").notNull(), // PENDING, DISPATCHED, CONFIRMED, FAILED
  dispatchedAt: timestamp("dispatched_at", { withTimezone: true }),
  confirmedAt: timestamp("confirmed_at", { withTimezone: true }),
  error: text("error"),
});

export const payslip = payrollSchema.table("payslip", {
  id: uuid("id").primaryKey().defaultRandom(),
  payrollLineId: uuid("payroll_line_id").references(() => payrollLine.id).notNull(),
  fileUrl: text("file_url").notNull(),
  generatedAt: timestamp("generated_at", { withTimezone: true }).defaultNow().notNull(),
});
