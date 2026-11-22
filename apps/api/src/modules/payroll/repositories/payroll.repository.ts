import { Injectable, Inject } from "@nestjs/common";
import { DATABASE_CONNECTION } from "../../../shared/database/database.provider";
import { DatabaseInstance, payrollRun, payrollLine } from "@sms/database";
import { eq } from "drizzle-orm";

@Injectable()
export class PayrollRepository {
  constructor(@Inject(DATABASE_CONNECTION) private db: DatabaseInstance) {}

  async createRun(month: string, createdBy: string) {
    const [row] = await this.db
      .insert(payrollRun)
      .values({
        month,
        status: "DRAFT",
        createdBy,
      })
      .returning();
    return row;
  }

  async findRunById(id: string) {
    const [row] = await this.db.select().from(payrollRun).where(eq(payrollRun.id, id));
    return row;
  }

  async findAllRuns() {
    return this.db.select().from(payrollRun).orderBy(payrollRun.month);
  }

  async findLines(runId: string) {
    return this.db.select().from(payrollLine).where(eq(payrollLine.payrollRunId, runId));
  }

  async approveRun(id: string, approverId: string) {
    const [row] = await this.db
      .update(payrollRun)
      .set({
        status: "APPROVED",
        approvedBy: approverId,
        approvedAt: new Date(),
      })
      .where(eq(payrollRun.id, id))
      .returning();
    return row;
  }
}
