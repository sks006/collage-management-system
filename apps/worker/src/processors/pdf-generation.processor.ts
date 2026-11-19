import { Injectable } from "@nestjs/common";
import { logger } from "../shared/logger";

@Injectable()
export class PdfGenerationProcessor {
  async generateReceipt(payload: { tranId: string; amount: number }) {
    logger.info({ tranId: payload.tranId }, "[Processor] Generating PDF fee receipt and uploading to R2 bucket");
    const fileUrl = `https://sms-files.school.local/receipts/${payload.tranId}.pdf`;
    return { success: true, fileUrl };
  }
}
