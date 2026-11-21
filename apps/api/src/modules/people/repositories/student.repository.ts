import { Injectable, Inject } from "@nestjs/common";
import { DATABASE_CONNECTION } from "../../../shared/database/database.provider";
import { DatabaseInstance, student, enrollment } from "@sms/database";
import { eq, ilike, or } from "drizzle-orm";

@Injectable()
export class StudentRepository {
  constructor(@Inject(DATABASE_CONNECTION) private db: DatabaseInstance) {}

  async findMany(limit = 50, q?: string) {
    if (q) {
      return this.db.select().from(student).where(
        or(
          ilike(student.admissionNo, `%${q}%`),
          ilike(student.nameEn, `%${q}%`),
          ilike(student.nameBn, `%${q}%`),
        )
      ).limit(limit);
    }
    return this.db.select().from(student).limit(limit);
  }

  async findById(id: string) {
    const [row] = await this.db.select().from(student).where(eq(student.id, id));
    return row;
  }

  async create(data: typeof student.$inferInsert) {
    const [row] = await this.db.insert(student).values(data).returning();
    return row;
  }

  async createMany(dataList: (typeof student.$inferInsert)[]) {
    if (dataList.length === 0) return [];
    const chunkSize = 500;
    const inserted: (typeof student.$inferSelect)[] = [];
    for (let i = 0; i < dataList.length; i += chunkSize) {
      const chunk = dataList.slice(i, i + chunkSize);
      const rows = await this.db.insert(student).values(chunk).returning();
      inserted.push(...rows);
    }
    return inserted;
  }

  async enroll(data: typeof enrollment.$inferInsert) {
    const [row] = await this.db.insert(enrollment).values(data).returning();
    return row;
  }
}
