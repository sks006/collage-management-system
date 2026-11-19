import { Injectable, Inject } from "@nestjs/common";
import { DATABASE_CONNECTION } from "../../../shared/database/database.provider";
import { DatabaseInstance, notice } from "@sms/database";
import { desc, eq } from "drizzle-orm";

@Injectable()
export class NoticeRepository {
  constructor(@Inject(DATABASE_CONNECTION) private db: DatabaseInstance) {}

  async create(data: typeof notice.$inferInsert) {
    const [row] = await this.db.insert(notice).values(data).returning();
    return row;
  }

  async findPublished() {
    return this.db.select().from(notice).where(eq(notice.published, true)).orderBy(desc(notice.publishedAt));
  }

  async publish(id: string) {
    const [row] = await this.db
      .update(notice)
      .set({ published: true, publishedAt: new Date(), updatedAt: new Date() })
      .where(eq(notice.id, id))
      .returning();
    return row;
  }
}
