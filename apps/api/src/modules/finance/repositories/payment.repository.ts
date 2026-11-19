import { Injectable, Inject } from "@nestjs/common";
import { DATABASE_CONNECTION } from "../../../shared/database/database.provider";
import { DatabaseInstance, payment } from "@sms/database";
import { eq } from "drizzle-orm";

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

  async findByIdempotencyKey(key: string) {
    const [row] = await this.db.select().from(payment).where(eq(payment.idempotencyKey, key));
    return row;
  }

  async updateStatus(id: string, status: string, payload?: any, tx?: any) {
    const client = tx || this.db;
    const [row] = await client
      .update(payment)
      .set({
        status,
        ipnPayload: payload || undefined,
        validatedAt: new Date(),
      })
      .where(eq(payment.id, id))
      .returning();
    return row;
  }
}
