import { pgSchema, uuid, text, smallint, timestamp, date, jsonb, primaryKey, uniqueIndex, index } from "drizzle-orm/pg-core";
import { student } from "./people";
import { section, subject } from "./academic";

export const attendanceSchema = pgSchema("attendance");

export const periodEvent = attendanceSchema.table("period_event", {
  studentId: uuid("student_id").references(() => student.id).notNull(),
  eventDate: date("event_date").notNull(),
  period: smallint("period").default(0).notNull(),
  sectionId: uuid("section_id").references(() => section.id).notNull(),
  subjectId: uuid("subject_id").references(() => subject.id),
  status: text("status").notNull(),
  source: text("source").notNull(),
  markedBy: uuid("marked_by").notNull(),
  markedAt: timestamp("marked_at", { withTimezone: true }).defaultNow().notNull(),
  deviceId: uuid("device_id"),
  note: text("note"),
}, (t) => ({
  pk: primaryKey({ columns: [t.studentId, t.eventDate, t.period] }),
  eventDateIdx: index("period_event_event_date_idx").on(t.eventDate),
}));

export const dailySummary = attendanceSchema.table("daily_summary", {
  studentId: uuid("student_id").notNull(),
  eventDate: date("event_date").notNull(),
  sectionId: uuid("section_id").notNull(),
  presentCount: smallint("present_count").default(0).notNull(),
  absentCount: smallint("absent_count").default(0).notNull(),
  lateCount: smallint("late_count").default(0).notNull(),
  excusedCount: smallint("excused_count").default(0).notNull(),
  totalPeriods: smallint("total_periods").default(0).notNull(),
  attendanceRate: numeric("attendance_rate", { precision: 5, scale: 2 }),
  computedAt: timestamp("computed_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  pk: primaryKey({ columns: [t.studentId, t.eventDate, t.sectionId] }),
}));

export const correctionRequest = attendanceSchema.table("correction_request", {
  id: uuid("id").primaryKey().defaultRandom(),
  studentId: uuid("student_id").references(() => student.id).notNull(),
  eventDate: date("event_date").notNull(),
  period: smallint("period").default(0).notNull(),
  oldStatus: text("old_status").notNull(),
  newStatus: text("new_status").notNull(),
  reason: text("reason").notNull(),
  requestedBy: uuid("requested_by").notNull(),
  requestedAt: timestamp("requested_at", { withTimezone: true }).defaultNow().notNull(),
  approvedBy: uuid("approved_by"),
  approvedAt: timestamp("approved_at", { withTimezone: true }),
  status: text("status").default("PENDING").notNull(),
});

export const periodClose = attendanceSchema.table("period_close", {
  id: uuid("id").primaryKey().defaultRandom(),
  sectionId: uuid("section_id").references(() => section.id).notNull(),
  month: date("month").notNull(),
  status: text("status").default("DRAFT").notNull(),
  summary: jsonb("summary").notNull(),
  submittedBy: uuid("submitted_by"),
  submittedAt: timestamp("submitted_at", { withTimezone: true }),
  approvedBy: uuid("approved_by"),
  approvedAt: timestamp("approved_at", { withTimezone: true }),
  lockedAt: timestamp("locked_at", { withTimezone: true }),
}, (t) => ({
  unq: uniqueIndex().on(t.sectionId, t.month),
}));
