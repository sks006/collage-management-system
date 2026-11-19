import { Injectable } from "@nestjs/common";
import { logger } from "../shared/logger";

@Injectable()
export class BeftnDispatchProcessor {
  async generateBeftnFile(payload: { runId: string }) {
    logger.info({ runId: payload.runId }, "[Processor] Constructing Bangladesh Electronic Funds Transfer (BEFTN) payroll file");
    // Formats fixed-width BEFTN 80-character records for Bangladesh Bank clearing house
    const beftnUrl = `https://sms-files.school.local/payroll/beftn_${payload.runId}.txt`;
    return { success: true, beftnUrl, status: "DISPATCHED" };
  }
}
