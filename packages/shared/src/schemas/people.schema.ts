import { z } from "zod";
import { uuidSchema } from "./common.schema";

export const createStudentSchema = z.object({
  admissionNo: z.string().min(1),
  nameEn: z.string().min(1),
  nameBn: z.string().optional(),
  dateOfBirth: z.string().date(),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]),
  bloodGroup: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  address: z.string().optional(),
  guardianName: z.string().min(1),
  guardianPhone: z.string().min(1),
  guardianEmail: z.string().email().optional(),
});

export const createStaffSchema = z.object({
  employeeNo: z.string().min(1),
  nameEn: z.string().min(1),
  nameBn: z.string().optional(),
  designation: z.string().min(1),
  department: z.string().min(1),
  dateOfBirth: z.string().date(),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]),
  phone: z.string().min(1),
  email: z.string().email(),
  address: z.string().optional(),
  joinDate: z.string().date(),
  bankAccountNo: z.string().optional(),
  bankName: z.string().optional(),
  bankBranch: z.string().optional(),
});

export const createEnrollmentSchema = z.object({
  studentId: uuidSchema,
  sectionId: uuidSchema,
  academicYearId: uuidSchema,
  rollNo: z.string().min(1),
});

export const studentSearchQuerySchema = z.object({
  q: z.string().min(1),
  sectionId: uuidSchema.optional(),
  limit: z.coerce.number().default(20),
});
