"use server";

import { financeService } from "@/services/finance.service";

export async function initiatePaymentAction(invoiceId: string, method: string) {
  return financeService.initiatePayment(invoiceId, method);
}
