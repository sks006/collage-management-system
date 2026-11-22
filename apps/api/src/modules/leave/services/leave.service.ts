import { Injectable } from "@nestjs/common";
import { LeaveRepository } from "../repositories/leave.repository";
import { AuditService } from "../../../shared/audit/audit.service";

@Injectable()
export class LeaveService {
  constructor(
    private repo: LeaveRepository,
    private audit: AuditService,
  ) {}

  async submitRequest(dto: any, staffId: string) {
    return this.repo.createRequest({
      ...dto,
      staffId,
      days: 1,
    });
  }

  async approveRequest(id: string, approverId: string, approverRole: string) {
    const row = await this.repo.approveRequest(id, approverId);
    await this.audit.log({
      actorId: approverId,
      actorRole: approverRole,
      action: "APPROVE_LEAVE",
      resourceType: "leave_request",
      resourceId: id,
      newValue: row,
    });
    return row;
  }

  async createSubstitution(data: any, actorId: string, actorRole: string) {
    const row = await this.repo.createSubstitution(data);
    await this.audit.log({
      actorId,
      actorRole,
      action: "ASSIGN_SUBSTITUTION",
      resourceType: "substitution",
      resourceId: row.id,
      newValue: row,
    });
    return row;
  }

  async getSubstitutions(staffId?: string) {
    return this.repo.findSubstitutions(staffId);
  }

  async getRequests(staffId?: string) {
    return this.repo.findRequests(staffId);
  }

  async getCalendar(yearId: string) {
    return this.repo.getCalendarDays(yearId);
  }

  async addCalendarDay(data: any) {
    return this.repo.createCalendarDay(data);
  }
}
