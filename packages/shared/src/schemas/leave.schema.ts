import { z } from "zod";
import { uuidSchema } from "./common.schema";

export const createLeaveRequestSchema = z.object({
  leaveTypeId: uuidSchema,
  startDate: z.string().date(),
  endDate: z.string().date(),
  reason: z.string().min(5),
});

export const createCalendarDaySchema = z.object({
  date: z.string().date(),
  type: z.enum(["WORKING", "WEEKEND", "HOLIDAY", "EXAM"]),
  label: z.string().optional(),
  academicYearId: uuidSchema,
});

export const bulkHolidayImportSchema = z.object({
  academicYearId: uuidSchema,
  holidays: z.array(z.object({
    date: z.string().date(),
    label: z.string().min(1),
  })),
});
