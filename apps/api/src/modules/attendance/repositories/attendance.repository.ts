import { Injectable, Inject } from "@nestjs/common";
import { DATABASE_CONNECTION } from "../../../shared/database/database.provider";
import { DatabaseInstance, periodEvent, correctionRequest } from "@sms/database";
import { eq, and } from "drizzle-orm";

@Injectable()
export class AttendanceRepository {
  constructor(@Inject(DATABASE_CONNECTION) private db: DatabaseInstance) {}

  async saveBatch(events: Array<typeof periodEvent.$inferInsert>) {
    return this.db.transaction(async (tx) => {
      const inserted = [];
      for (const e of events) {
        const [row] = await tx
          .insert(periodEvent)
          .values(e)
          .onConflictDoUpdate({
            target: [periodEvent.studentId, periodEvent.eventDate, periodEvent.period],
            set: {
              status: e.status,
              source: e.source,
              markedBy: e.markedBy,
              note: e.note,
            },
          })
          .returning();
        inserted.push(row);
      }
      return inserted;
    });
  }

  async findByStudent(studentId: string, limit = 50) {
    return this.db.select().from(periodEvent).where(eq(periodEvent.studentId, studentId)).limit(limit);
  }

  async createCorrection(data: typeof correctionRequest.$inferInsert) {
    const [row] = await this.db.insert(correctionRequest).values(data).returning();
    return row;
  }
}
