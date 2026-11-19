import { Injectable, Inject } from "@nestjs/common";
import { DATABASE_CONNECTION } from "../../../shared/database/database.provider";
import { DatabaseInstance, periodClose } from "@sms/database";
import { eq, and } from "drizzle-orm";

@Injectable()
export class PeriodCloseRepository {
  constructor(@Inject(DATABASE_CONNECTION) private db: DatabaseInstance) {}

  async createOrUpdate(data: typeof periodClose.$inferInsert) {
    const [row] = await this.db
      .insert(periodClose)
      .values(data)
      .onConflictDoUpdate({
        target: [periodClose.sectionId, periodClose.month],
        set: {
          summary: data.summary,
          status: data.status,
          submittedBy: data.submittedBy,
          submittedAt: data.submittedAt,
        },
      })
      .returning();
    return row;
  }

  async findById(id: string) {
    const [row] = await this.db.select().from(periodClose).where(eq(periodClose.id, id));
    return row;
  }

  async approve(id: string, approverId: string) {
    const [row] = await this.db
      .update(periodClose)
      .set({
        status: "APPROVED",
        approvedBy: approverId,
        approvedAt: new Date(),
        lockedAt: new Date(),
      })
      .where(eq(periodClose.id, id))
      .returning();
    return row;
  }
}
