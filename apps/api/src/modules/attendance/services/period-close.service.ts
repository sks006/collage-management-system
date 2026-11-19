import { Injectable, BadRequestException } from "@nestjs/common";
import { PeriodCloseRepository } from "../repositories/period-close.repository";
import { AuditService } from "../../../shared/audit/audit.service";

@Injectable()
export class PeriodCloseService {
  constructor(
    private repo: PeriodCloseRepository,
    private audit: AuditService,
  ) {}

  async initiateClose(dto: { sectionId: string; month: string }, submittedBy: string) {
    // Generate snapshot summary
    const summarySnapshot = {
      sectionId: dto.sectionId,
      month: dto.month,
      computedAt: new Date().toISOString(),
      totalWorkingDays: 24,
      aggregateStats: { presentRate: 0.92, excusedAbsences: 8 },
    };

    return this.repo.createOrUpdate({
      sectionId: dto.sectionId,
      month: dto.month,
      status: "PENDING_APPROVAL",
      summary: summarySnapshot,
      submittedBy,
      submittedAt: new Date(),
    });
  }

  async approveClose(id: string, approverId: string, approverRole: string) {
    const existing = await this.repo.findById(id);
    if (!existing) {
      throw new BadRequestException("Period close not found");
    }

    // Enforce Invariant: Maker != Checker
    if (existing.submittedBy === approverId) {
      throw new BadRequestException("Maker-checker violation: Submitter cannot approve their own period close");
    }

    const approved = await this.repo.approve(id, approverId);
    await this.audit.log({
      actorId: approverId,
      actorRole: approverRole,
      action: "APPROVE_PERIOD_CLOSE",
      resourceType: "period_close",
      resourceId: id,
      newValue: approved,
    });

    return approved;
  }
}
