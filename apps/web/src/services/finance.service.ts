import { apiClient } from "@/lib/api-client";

export interface InvoiceDto {
  id: string;
  studentId?: string;
  studentName?: string;
  admissionNo?: string;
  month: string;
  head?: string;
  amount: number;
  status: "PAID" | "ISSUED" | "PENDING" | "OVERDUE";
  dueDate?: string;
  paidAt?: string | null;
  transactionId?: string | null;
}

export interface LedgerDto {
  id: string;
  date?: string;
  createdAt?: string;
  account: string;
  direction: "DEBIT" | "CREDIT";
  amount: number;
  currency?: string;
  source: string;
  partyName?: string;
  idempotencyKey?: string;
  status?: string;
}

export const financeService = {
  getInvoices: () => apiClient<InvoiceDto[]>("/finance/invoices"),
  getLedger: () => apiClient<LedgerDto[]>("/finance/ledger"),
  createInvoice: (payload: any) =>
    apiClient<InvoiceDto>("/finance/invoices", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  initiatePayment: (invoiceId: string, method: string) =>
    apiClient<{ paymentId: string; tranId: string; redirectUrl?: string }>("/finance/payments/initiate", {
      method: "POST",
      body: JSON.stringify({ invoiceId, method }),
    }),
};
