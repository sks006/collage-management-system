import { pgSchema, uuid, text, smallint, timestamp, date, boolean } from "drizzle-orm/pg-core";
import { staff } from "./people";
import { academicYear, section } from "./academic";

export const leaveSchema = pgSchema("leave");

export const calendarDay = leaveSchema.table("calendar_day", {
  id: uuid("id").primaryKey().defaultRandom(),
  date: date("date").notNull().unique(),
  type: text("type").notNull(), // WORKING, WEEKEND, HOLIDAY, EXAM
  label: text("label"),
  academicYearId: uuid("academic_year_id").references(() => academicYear.id).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const leaveType = leaveSchema.table("leave_type", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull().unique(),
  maxDaysPerYear: smallint("max_days_per_year").notNull(),
  isPaid: boolean("is_paid").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const leaveRequest = leaveSchema.table("leave_request", {
  id: uuid("id").primaryKey().defaultRandom(),
  staffId: uuid("staff_id").references(() => staff.id).notNull(),
  leaveTypeId: uuid("leave_type_id").references(() => leaveType.id).notNull(),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  days: smallint("days").notNull(),
  reason: text("reason").notNull(),
  status: text("status").default("PENDING").notNull(), // PENDING, APPROVED, REJECTED, CANCELLED
  requestedAt: timestamp("requested_at", { withTimezone: true }).defaultNow().notNull(),
  approvedBy: uuid("approved_by"),
  approvedAt: timestamp("approved_at", { withTimezone: true }),
});

export const substitution = leaveSchema.table("substitution", {
  id: uuid("id").primaryKey().defaultRandom(),
  leaveRequestId: uuid("leave_request_id").references(() => leaveRequest.id).notNull(),
  originalStaffId: uuid("original_staff_id").references(() => staff.id).notNull(),
  substituteStaffId: uuid("substitute_staff_id").references(() => staff.id).notNull(),
  sectionId: uuid("section_id").references(() => section.id).notNull(),
  date: date("date").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
