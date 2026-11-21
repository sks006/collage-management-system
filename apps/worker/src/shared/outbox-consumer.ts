import { Injectable, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { createDb, createDbPool, job } from "@sms/database";
import { eq, and, lte, sql } from "drizzle-orm";
import { NotificationProcessor } from "../processors/notification.processor";
import { PdfGenerationProcessor } from "../processors/pdf-generation.processor";
import { BeftnDispatchProcessor } from "../processors/beftn-dispatch.processor";
import { PaymentReconcileProcessor } from "../processors/payment-reconcile.processor";
import { PayrollComputeProcessor } from "../processors/payroll-compute.processor";
import { logger } from "./logger";

@Injectable()
export class OutboxConsumer implements OnModuleInit, OnModuleDestroy {
  private isRunning = false;
  private pool = createDbPool(process.env.DATABASE_WORKER_URL);
  private db = createDb(this.pool);

  constructor(
    private notificationProcessor: NotificationProcessor,
    private pdfProcessor: PdfGenerationProcessor,
    private beftnProcessor: BeftnDispatchProcessor,
    private reconcileProcessor: PaymentReconcileProcessor,
    private payrollProcessor: PayrollComputeProcessor,
  ) {}

  onModuleInit() {
    this.isRunning = true;
    this.pollLoop();
  }

  onModuleDestroy() {
    this.isRunning = false;
  }

  // Core Section 2 Invariant 7: SKIP LOCKED claim loop
  private async pollLoop() {
    while (this.isRunning) {
      try {
        await this.processNextBatch();
      } catch (err: any) {
        logger.error({ error: err.message }, "[Outbox] Error in worker poll cycle");
      }
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }

  private async processNextBatch() {
    const claimedJobs = await this.db.transaction(async (tx) => {
      // 1. SELECT * FROM outbox.job FOR UPDATE SKIP LOCKED
      const jobs = await tx
        .select()
        .from(job)
        .where(
          and(
            eq(job.status, "PENDING"),
            lte(job.nextAttemptAt, new Date()),
          ),
        )
        .limit(10)
        .for("update", { skipLocked: true });

      if (jobs.length === 0) return [];

      // 2. Mark claimed
      for (const j of jobs) {
        await tx
          .update(job)
          .set({
            status: "CLAIMED",
            lockedAt: new Date(),
            lockedBy: "worker_node_1",
          })
          .where(eq(job.id, j.id));
      }
      return jobs;
    });

    for (const j of claimedJobs) {
      try {
        await this.dispatch(j.type, j.payload);
        await this.db
          .update(job)
          .set({ status: "DONE", completedAt: new Date() })
          .where(eq(job.id, j.id));
        logger.info({ jobId: j.id, type: j.type }, "[Outbox] Successfully processed job");
      } catch (err: any) {
        const nextAttempts = j.attempts + 1;
        const isDead = nextAttempts >= j.maxAttempts;
        await this.db
          .update(job)
          .set({
            status: isDead ? "DEAD" : "PENDING",
            attempts: nextAttempts,
            lastError: err.message,
            nextAttemptAt: new Date(Date.now() + Math.pow(2, nextAttempts) * 1000),
          })
          .where(eq(job.id, j.id));
        logger.warn({ jobId: j.id, attempts: nextAttempts, isDead }, "[Outbox] Job failed execution");
      }
    }
  }

  private async dispatch(type: string, payload: any) {
    switch (type) {
      case "SEND_OTP_EMAIL":
        return this.notificationProcessor.handleSendOtpEmail(payload);
      case "ADMIN_ROLE_REQUEST":
        return this.notificationProcessor.handleAdminRoleRequest(payload);
      case "SEND_ROLE_APPROVED_EMAIL":
        return this.notificationProcessor.handleSendRoleApprovedEmail(payload);
      case "NOTIFY_ABSENTEE_PARENTS":
        return this.notificationProcessor.handleAbsenteeNotification(payload);
      case "SEND_NOTICE":
        return this.notificationProcessor.handleNoticeBroadcast(payload);
      case "SEND_RECEIPT":
      case "GENERATE_PDF":
        return this.pdfProcessor.generateReceipt(payload);
      case "DISPATCH_PAYROLL":
        return this.beftnProcessor.generateBeftnFile(payload);
      case "COMPUTE_PAYROLL":
        return this.payrollProcessor.computePayroll(payload);
      case "RECONCILE_PAYMENTS":
        return this.reconcileProcessor.reconcile5Min();
      default:
        logger.warn({ type }, "[Outbox] Unknown job type received");
        return null;
    }
  }
}
