"use server";

import { apiClient } from "@/lib/api-client";

export async function initiatePaymentAction(invoiceId: string, method: string) {
  return apiClient("/finance/payments/initiate", {
    method: "POST",
    body: JSON.stringify({ invoiceId, method }),
  });
}
