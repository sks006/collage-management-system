import { Injectable } from "@nestjs/common";
import { AcademicRepository } from "../repositories/academic.repository";
import { AuditService } from "../../../shared/audit/audit.service";

@Injectable()
export class AcademicService {
  constructor(
    private repo: AcademicRepository,
    private audit: AuditService,
  ) {}

  async listYears() {
    return this.repo.findYears();
  }

  async createYear(data: any, actorId: string, actorRole: string) {
    const row = await this.repo.createYear(data);
    await this.audit.log({
      actorId,
      actorRole,
      action: "CREATE",
      resourceType: "academic_year",
      resourceId: row.id,
      newValue: row,
    });
    return row;
  }

  async listClasses(yearId: string) {
    return this.repo.findClasses(yearId);
  }

  async createClass(data: any, actorId: string, actorRole: string) {
    const row = await this.repo.createClass(data);
    await this.audit.log({
      actorId,
      actorRole,
      action: "CREATE",
      resourceType: "class",
      resourceId: row.id,
      newValue: row,
    });
    return row;
  }

  async listSections(classId: string) {
    return this.repo.findSections(classId);
  }

  async createSection(data: any) {
    return this.repo.createSection(data);
  }

  async assignTeachers(assignments: any[]) {
    const results = [];
    for (const a of assignments) {
      results.push(await this.repo.assignTeacher(a));
    }
    return results;
  }
}
