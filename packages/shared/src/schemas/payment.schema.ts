import { z } from "zod";
import { uuidSchema } from "./common.schema";

export const initiatePaymentSchema = z.object({
  invoiceId: uuidSchema,
  method: z.enum(["BKASH", "NAGAD", "ROCKET", "CARD", "CASH"]),
  returnUrl: z.string().url().optional(),
});

export const ipnWebhookSchema = z.object({
  tran_id: z.string().min(1),
  val_id: z.string().optional(),
  amount: z.string().or(z.number()),
  currency: z.string().default("BDT"),
  status: z.string().min(1),
  verify_sign: z.string().optional(),
  bank_tran_id: z.string().optional(),
});

export const bulkInvoiceSchema = z.object({
  academicYearId: uuidSchema,
  month: z.string().date(),
  classIds: z.array(uuidSchema).min(1),
  dueDate: z.string().date(),
});

export const createWaiverSchema = z.object({
  invoiceId: uuidSchema,
  amount: z.number().positive(),
  reason: z.string().min(5),
});
