import { Injectable } from "@nestjs/common";
import { StaffRepository } from "../repositories/staff.repository";
import { AuditService } from "../../../shared/audit/audit.service";

@Injectable()
export class StaffService {
  constructor(
    private repo: StaffRepository,
    private audit: AuditService,
  ) {}

  async getStaffList(limit: number, q?: string) {
    return this.repo.findMany(limit, q);
  }

  async getStaffById(id: string) {
    return this.repo.findById(id);
  }

  async createStaff(data: any, actorId: string, actorRole: string) {
    const created = await this.repo.create(data);
    await this.audit.log({
      actorId,
      actorRole,
      action: "CREATE",
      resourceType: "staff",
      resourceId: created.id,
      newValue: created,
    });
    return created;
  }
}
