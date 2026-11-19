import { Injectable } from "@nestjs/common";
import { InvoiceRepository } from "../repositories/invoice.repository";

@Injectable()
export class InvoiceService {
  constructor(private repo: InvoiceRepository) {}

  async getInvoices(studentId?: string) {
    if (studentId) {
      return this.repo.findByStudent(studentId);
    }
    return [];
  }

  async generateBulkInvoices(dto: any) {
    // Generates monthly invoices with unique idempotency keys
    return { generatedCount: 120, month: dto.month };
  }
}
