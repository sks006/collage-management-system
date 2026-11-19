import { Injectable, Inject } from "@nestjs/common";
import { DATABASE_CONNECTION } from "../../../shared/database/database.provider";
import { DatabaseInstance, leaveRequest, calendarDay, leaveType } from "@sms/database";
import { eq } from "drizzle-orm";

@Injectable()
export class LeaveRepository {
  constructor(@Inject(DATABASE_CONNECTION) private db: DatabaseInstance) {}

  async createRequest(data: typeof leaveRequest.$inferInsert) {
    const [row] = await this.db.insert(leaveRequest).values(data).returning();
    return row;
  }

  async findRequests(staffId?: string) {
    if (staffId) {
      return this.db.select().from(leaveRequest).where(eq(leaveRequest.staffId, staffId));
    }
    return this.db.select().from(leaveRequest);
  }

  async approveRequest(id: string, approverId: string) {
    const [row] = await this.db
      .update(leaveRequest)
      .set({
        status: "APPROVED",
        approvedBy: approverId,
        approvedAt: new Date(),
      })
      .where(eq(leaveRequest.id, id))
      .returning();
    return row;
  }

  async createCalendarDay(data: typeof calendarDay.$inferInsert) {
    const [row] = await this.db.insert(calendarDay).values(data).returning();
    return row;
  }

  async getCalendarDays(yearId: string) {
    return this.db.select().from(calendarDay).where(eq(calendarDay.academicYearId, yearId));
  }
}
