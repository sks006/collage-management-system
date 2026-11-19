import { Injectable, Inject } from "@nestjs/common";
import { DATABASE_CONNECTION } from "../../../shared/database/database.provider";
import { DatabaseInstance, invoice } from "@sms/database";
import { eq, desc } from "drizzle-orm";

@Injectable()
export class InvoiceRepository {
  constructor(@Inject(DATABASE_CONNECTION) private db: DatabaseInstance) {}

  async create(data: typeof invoice.$inferInsert, tx?: any) {
    const client = tx || this.db;
    const [row] = await client.insert(invoice).values(data).returning();
    return row;
  }

  async findById(id: string) {
    const [row] = await this.db.select().from(invoice).where(eq(invoice.id, id));
    return row;
  }

  async findByStudent(studentId: string) {
    return this.db.select().from(invoice).where(eq(invoice.studentId, studentId)).orderBy(desc(invoice.month));
  }

  async updateStatus(id: string, status: string, tx?: any) {
    const client = tx || this.db;
    const [row] = await client
      .update(invoice)
      .set({ status, updatedAt: new Date() })
      .where(eq(invoice.id, id))
      .returning();
    return row;
  }
}
