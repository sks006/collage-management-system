export interface InvoiceItem {
  id: string;
  studentId?: string;
  studentName?: string;
  student?: string;
  admissionNo?: string;
  month: string;
  head?: string;
  amount: number;
  status: "PAID" | "ISSUED" | "PENDING" | "OVERDUE";
  dueDate?: string;
  paidAt?: string | null;
  method?: string;
  transactionId?: string | null;
}

export interface LedgerItem {
  id: string;
  date?: string;
  createdAt?: string;
  account: string;
  partyType?: string;
  partyName?: string;
  party?: string;
  direction: "DEBIT" | "CREDIT";
  amount: number;
  currency?: string;
  source: string;
  time?: string;
  postedAt?: string;
  status?: "POSTED" | "REVERSED";
  idempotencyKey?: string;
}

export interface CreateInvoiceInput {
  studentId: string;
  month: string;
  head: string;
  amount: number;
  dueDate: string;
}

export interface IFinanceHandlers {
  handleCreateInvoice: (input: CreateInvoiceInput) => Promise<boolean>;
  handleInitiatePayment: (invoiceId: string, method: string) => Promise<{ redirectUrl?: string } | null>;
  handleRefresh: () => Promise<void>;
}
