import { Injectable, BadRequestException } from "@nestjs/common";
import { PayrollRepository } from "../repositories/payroll.repository";
import { OutboxService } from "../../../shared/outbox/outbox.service";
import { AuditService } from "../../../shared/audit/audit.service";

@Injectable()
export class PayrollService {
  constructor(
    private repo: PayrollRepository,
    private outbox: OutboxService,
    private audit: AuditService,
  ) {}

  async createRun(month: string, createdBy: string) {
    const run = await this.repo.createRun(month, createdBy);
    // Invariant 9: Outbox job triggers payroll worker to compute against approved period close only
    await this.outbox.publish("COMPUTE_PAYROLL", { runId: run.id, month }, `compute_pay_${run.id}`);
    return run;
  }

  async approveRun(runId: string, approverId: string, approverRole: string) {
    const run = await this.repo.findRunById(runId);
    if (!run) throw new BadRequestException("Payroll run not found");

    // Invariant: Maker != Checker on payroll approvals
    if (run.createdBy === approverId) {
      throw new BadRequestException("Maker-checker violation: Submitter cannot approve payroll run");
    }

    const approved = await this.repo.approveRun(runId, approverId);

    // Trigger BEFTN dispatch file generation
    await this.outbox.publish("DISPATCH_PAYROLL", { runId }, `dispatch_pay_${runId}`);

    await this.audit.log({
      actorId: approverId,
      actorRole: approverRole,
      action: "APPROVE_PAYROLL_RUN",
      resourceType: "payroll_run",
      resourceId: runId,
      newValue: approved,
    });

    return approved;
  }

  async getRunLines(runId: string) {
    return this.repo.findLines(runId);
  }
}
