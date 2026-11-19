import { z } from "zod";
import { uuidSchema } from "./common.schema";

export const createAcademicYearSchema = z.object({
  name: z.string().min(1),
  startDate: z.string().date(),
  endDate: z.string().date(),
  isCurrent: z.boolean().default(false),
});

export const createTermSchema = z.object({
  academicYearId: uuidSchema,
  name: z.string().min(1),
  startDate: z.string().date(),
  endDate: z.string().date(),
  sequence: z.number().int().min(1),
});

export const createClassSchema = z.object({
  academicYearId: uuidSchema,
  name: z.string().min(1),
  numericLevel: z.number().int().min(1).max(12),
});

export const createSectionSchema = z.object({
  classId: uuidSchema,
  name: z.string().min(1),
  capacity: z.number().int().min(1).default(40),
});

export const createSubjectSchema = z.object({
  classId: uuidSchema,
  name: z.string().min(1),
  code: z.string().min(1),
});

export const teacherAssignmentSchema = z.object({
  staffId: uuidSchema,
  sectionId: uuidSchema,
  subjectId: uuidSchema.optional(),
  academicYearId: uuidSchema,
});

export const bulkTeacherAssignmentSchema = z.object({
  assignments: z.array(teacherAssignmentSchema),
});
