import { Injectable } from "@nestjs/common";
import { StudentRepository } from "../repositories/student.repository";
import { AuditService } from "../../../shared/audit/audit.service";

@Injectable()
export class StudentService {
  constructor(
    private repo: StudentRepository,
    private audit: AuditService,
  ) {}

  async getStudents(limit: number, q?: string) {
    return this.repo.findMany(limit, q);
  }

  async getStudentById(id: string) {
    return this.repo.findById(id);
  }

  async createStudent(data: any, actorId: string, actorRole: string) {
    const created = await this.repo.create(data);
    await this.audit.log({
      actorId,
      actorRole,
      action: "CREATE",
      resourceType: "student",
      resourceId: created.id,
      newValue: created,
    });
    return created;
  }

  async enrollStudent(data: any) {
    return this.repo.enroll(data);
  }
}
