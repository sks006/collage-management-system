import { Injectable } from "@nestjs/common";
import { AcademicRepository } from "../repositories/academic.repository";

@Injectable()
export class AcademicService {
  constructor(private repo: AcademicRepository) {}

  async listYears() {
    return this.repo.findYears();
  }

  async createYear(data: any, actorId: string, actorRole: string) {
    const row = await this.repo.createYear(data);
    return row;
  }

  async listTerms(yearId: string) {
    return this.repo.findTerms(yearId);
  }

  async createTerm(data: any, actorId: string, actorRole: string) {
    const row = await this.repo.createTerm(data);
    return row;
  }

  async listClasses(yearId?: string) {
    return this.repo.findClasses(yearId);
  }

  async createClass(data: any, actorId: string, actorRole: string) {
    const row = await this.repo.createClass(data);
    return row;
  }

  async listSections(classId?: string) {
    return this.repo.findSections(classId);
  }

  async createSection(data: any, actorId: string, actorRole: string) {
    const row = await this.repo.createSection(data);
    return row;
  }

  async listSubjects(classId: string) {
    return this.repo.findSubjects(classId);
  }

  async createSubject(data: any, actorId: string, actorRole: string) {
    const row = await this.repo.createSubject(data);
    return row;
  }

  async assignTeachers(assignments: any[]) {
    const results = [];
    for (const a of assignments) {
      results.push(await this.repo.assignTeacher(a));
    }
    return results;
  }
}
