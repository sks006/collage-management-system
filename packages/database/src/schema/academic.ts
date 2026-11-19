import { pgSchema, uuid, text, smallint, timestamp, date, boolean, unique } from "drizzle-orm/pg-core";

export const academicSchema = pgSchema("academic");

export const academicYear = academicSchema.table("academic_year", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  isCurrent: boolean("is_current").default(false).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const term = academicSchema.table("term", {
  id: uuid("id").primaryKey().defaultRandom(),
  academicYearId: uuid("academic_year_id").references(() => academicYear.id).notNull(),
  name: text("name").notNull(),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  sequence: smallint("sequence").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const classTable = academicSchema.table("class", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  numericLevel: smallint("numeric_level").notNull(),
  academicYearId: uuid("academic_year_id").references(() => academicYear.id).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const section = academicSchema.table("section", {
  id: uuid("id").primaryKey().defaultRandom(),
  classId: uuid("class_id").references(() => classTable.id).notNull(),
  name: text("name").notNull(),
  capacity: smallint("capacity").default(40).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const subject = academicSchema.table("subject", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  code: text("code").notNull(),
  classId: uuid("class_id").references(() => classTable.id).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const teacherSection = academicSchema.table("teacher_section", {
  id: uuid("id").primaryKey().defaultRandom(),
  staffId: uuid("staff_id").notNull(),
  sectionId: uuid("section_id").references(() => section.id).notNull(),
  subjectId: uuid("subject_id").references(() => subject.id),
  academicYearId: uuid("academic_year_id").references(() => academicYear.id).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  unq: unique().on(t.staffId, t.sectionId, t.subjectId, t.academicYearId),
}));
