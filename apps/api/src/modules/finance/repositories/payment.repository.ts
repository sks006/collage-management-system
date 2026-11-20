import { Injectable, Inject } from "@nestjs/common";
import { DATABASE_CONNECTION } from "../../../shared/database/database.provider";
import { DatabaseInstance, payment, invoice } from "@sms/database";
import { eq, desc } from "drizzle-orm";

@Injectable()
export class PaymentRepository {
  constructor(@Inject(DATABASE_CONNECTION) private db: DatabaseInstance) {}

  async create(data: typeof payment.$inferInsert, tx?: any) {
    const client = tx || this.db;
    const [row] = await client.insert(payment).values(data).returning();
    return row;
  }

  async findById(id: string) {
    const [row] = await this.db.select().from(payment).where(eq(payment.id, id));
    return row;
  }

  async findByInvoiceId(invoiceId: string) {
    return this.db.select().from(payment).where(eq(payment.invoiceId, invoiceId));
  }

  async findByIdempotencyKey(key: string) {
    const [row] = await this.db.select().from(payment).where(eq(payment.idempotencyKey, key));
    return row;
  }

  async findByStatus(status: string, limit = 100) {
    return this.db.select().from(payment).where(eq(payment.status, status)).limit(limit);
  }

  async updateStatus(id: string, status: string, validatedAt?: Date, tx?: any) {
    const client = tx || this.db;
    const [row] = await client
      .update(payment)
      .set({ status, validatedAt: validatedAt || new Date() })
      .where(eq(payment.id, id))
      .returning();
    return row;
  }
}
