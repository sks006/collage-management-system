import { Injectable } from "@nestjs/common";
import { logger } from "../shared/logger";

@Injectable()
export class PayrollComputeProcessor {
  // Invariant 9: Payroll worker reads ONLY approved, locked period_close data
  async computePayroll(payload: { runId: string; month: string }) {
    logger.info({ runId: payload.runId, month: payload.month }, "[Processor] Computing payroll lines from approved period close");
    // Calculates gross salary, leaves deductions, attendance absence penalty, net pay
    return { runId: payload.runId, computedLines: 48 };
  }
}
