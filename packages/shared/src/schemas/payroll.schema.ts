import { z } from "zod";
import { uuidSchema } from "./common.schema";

export const createPayrollRunSchema = z.object({
  month: z.string().date(), // YYYY-MM-01
});

export const approvePayrollRunSchema = z.object({
  runId: uuidSchema,
});

export const retryFailedLineSchema = z.object({
  payrollLineId: uuidSchema,
});
