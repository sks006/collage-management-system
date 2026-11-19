import { z } from "zod";
import { uuidSchema } from "./common.schema";

export const attendanceItemSchema = z.object({
  studentId: uuidSchema,
  status: z.enum(["PRESENT", "ABSENT", "LATE", "EXCUSED"]),
  period: z.number().int().min(0).default(0),
  note: z.string().optional(),
});

export const attendanceBatchSchema = z.object({
  sectionId: uuidSchema,
  eventDate: z.string().date(),
  period: z.number().int().min(0).default(0),
  subjectId: uuidSchema.optional(),
  records: z.array(attendanceItemSchema).min(1),
});

export const deviceAttendanceSchema = z.object({
  deviceId: uuidSchema,
  timestamp: z.string().datetime(),
  records: z.array(z.object({
    studentId: uuidSchema,
    timestamp: z.string().datetime(),
    status: z.enum(["PRESENT", "ABSENT", "LATE"]),
  })),
  hmacSignature: z.string().min(1),
});

export const correctionRequestSchema = z.object({
  studentId: uuidSchema,
  eventDate: z.string().date(),
  period: z.number().int().min(0).default(0),
  newStatus: z.enum(["PRESENT", "ABSENT", "LATE", "EXCUSED"]),
  reason: z.string().min(5),
});

export const periodCloseSchema = z.object({
  sectionId: uuidSchema,
  month: z.string().date(), // YYYY-MM-01
});
