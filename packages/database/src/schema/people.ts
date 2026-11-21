import { pgSchema, uuid, text, timestamp, date, uniqueIndex, index } from "drizzle-orm/pg-core";
import { section, academicYear } from "./academic";

export const peopleSchema = pgSchema("people");

export const student = peopleSchema.table("student", {
  id: uuid("id").primaryKey().defaultRandom(),
  admissionNo: text("admission_no").notNull().unique(),
  nameEn: text("name_en").notNull(),
  nameBn: text("name_bn"),
  dateOfBirth: date("date_of_birth").notNull(),
  gender: text("gender").notNull(),
  bloodGroup: text("blood_group"),
  phone: text("phone"),
  email: text("email"),
  address: text("address"),
  guardianName: text("guardian_name").notNull(),
  guardianPhone: text("guardian_phone").notNull(),
  guardianEmail: text("guardian_email"),
  guardianKeycloakId: text("guardian_keycloak_id"),
  keycloakUserId: text("keycloak_user_id"),
  photoUrl: text("photo_url"),
  status: text("status").default("ACTIVE").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  nameEnIdx: index("student_name_en_trgm_idx").on(t.nameEn),
  nameBnIdx: index("student_name_bn_trgm_idx").on(t.nameBn),
  keycloakUserIdIdx: index("student_keycloak_user_id_idx").on(t.keycloakUserId),
  guardianKeycloakIdIdx: index("student_guardian_keycloak_id_idx").on(t.guardianKeycloakId),
}));

export const staff = peopleSchema.table("staff", {
  id: uuid("id").primaryKey().defaultRandom(),
  employeeNo: text("employee_no").notNull().unique(),
  nameEn: text("name_en").notNull(),
  nameBn: text("name_bn"),
  designation: text("designation").notNull(),
  department: text("department").notNull(),
  dateOfBirth: date("date_of_birth").notNull(),
  gender: text("gender").notNull(),
  phone: text("phone").notNull(),
  email: text("email").notNull().unique(),
  address: text("address"),
  joinDate: date("join_date").notNull(),
  bankAccountNo: text("bank_account_no"),
  bankName: text("bank_name"),
  bankBranch: text("bank_branch"),
  keycloakUserId: text("keycloak_user_id"),
  photoUrl: text("photo_url"),
  status: text("status").default("ACTIVE").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  nameEnIdx: index("staff_name_en_trgm_idx").on(t.nameEn),
  keycloakUserIdIdx: index("staff_keycloak_user_id_idx").on(t.keycloakUserId),
}));

export const enrollment = peopleSchema.table("enrollment", {
  id: uuid("id").primaryKey().defaultRandom(),
  studentId: uuid("student_id").references(() => student.id).notNull(),
  sectionId: uuid("section_id").references(() => section.id).notNull(),
  academicYearId: uuid("academic_year_id").references(() => academicYear.id).notNull(),
  rollNo: text("roll_no").notNull(),
  enrolledAt: timestamp("enrolled_at", { withTimezone: true }).defaultNow().notNull(),
  status: text("status").default("ENROLLED").notNull(),
}, (t) => ({
  unq: uniqueIndex().on(t.studentId, t.academicYearId),
}));

export const roleRequest = peopleSchema.table("role_request", {
  id: uuid("id").primaryKey().defaultRandom(),
  keycloakUserId: text("keycloak_user_id").notNull(),
  email: text("email").notNull(),
  fullName: text("full_name").notNull(),
  requestedRole: text("requested_role").notNull(),
  referenceNo: text("reference_no"),
  status: text("status").default("PENDING").notNull(),
  reviewedBy: uuid("reviewed_by"),
  reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  pendingIdx: index("idx_role_request_pending").on(t.status, t.createdAt),
}));
