import { Injectable, Inject } from "@nestjs/common";
import { DATABASE_CONNECTION } from "../../../shared/database/database.provider";
import { DatabaseInstance, staff } from "@sms/database";
import { eq, ilike, or } from "drizzle-orm";

@Injectable()
export class StaffRepository {
  constructor(@Inject(DATABASE_CONNECTION) private db: DatabaseInstance) {}

  async findMany(limit = 50, q?: string) {
    if (q) {
      return this.db.select().from(staff).where(
        or(
          ilike(staff.employeeNo, `%${q}%`),
          ilike(staff.nameEn, `%${q}%`),
          ilike(staff.email, `%${q}%`),
        )
      ).limit(limit);
    }
    return this.db.select().from(staff).limit(limit);
  }

  async findById(id: string) {
    const [row] = await this.db.select().from(staff).where(eq(staff.id, id));
    return row;
  }

  async create(data: typeof staff.$inferInsert) {
    const [row] = await this.db.insert(staff).values(data).returning();
    return row;
  }
}
