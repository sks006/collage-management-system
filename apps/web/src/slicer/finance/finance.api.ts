import { IHttpTransport } from "../core/types";
import { defaultTransport } from "../core/transport";
import { InvoiceItem, LedgerItem, CreateInvoiceInput } from "./finance.types";

export class FinanceApiService {
  constructor(private transport: IHttpTransport = defaultTransport) {}

  async getInvoices(): Promise<InvoiceItem[]> {
    return this.transport.get<InvoiceItem[]>("/finance/invoices");
  }

  async getLedger(): Promise<LedgerItem[]> {
    return this.transport.get<LedgerItem[]>("/finance/ledger");
  }

  async createInvoice(input: CreateInvoiceInput): Promise<InvoiceItem> {
    return this.transport.post<InvoiceItem>("/finance/invoices", input);
  }

  async initiatePayment(invoiceId: string, method: string): Promise<{ redirectUrl?: string }> {
    return this.transport.post<{ redirectUrl?: string }>("/finance/payments/initiate", {
      invoiceId,
      method,
    });
  }
}

export const financeApi = new FinanceApiService();
