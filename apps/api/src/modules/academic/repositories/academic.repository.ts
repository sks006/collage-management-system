import { Injectable } from "@nestjs/common";
import { DatabaseInstance, academicYear, term, classTable, section, subject, teacherSection } from "@sms/database";
import { eq, and } from "drizzle-orm";

@Injectable()
export class AcademicRepository {
  constructor(private db: DatabaseInstance) {}

  async findYears() {
    return this.db.select().from(academicYear).orderBy(academicYear.startDate);
  }

  async findById(id: string) {
    const [row] = await this.db.select().from(academicYear).where(eq(academicYear.id, id));
    return row;
  }

  async createYear(data: typeof academicYear.$inferInsert) {
    const [row] = await this.db.insert(academicYear).values(data).returning();
    return row;
  }

  async findTerms(yearId: string) {
    return this.db.select().from(term).where(eq(term.academicYearId, yearId)).orderBy(term.sequence);
  }

  async createTerm(data: typeof term.$inferInsert) {
    const [row] = await this.db.insert(term).values(data).returning();
    return row;
  }

  async findClasses(yearId: string) {
    return this.db.select().from(classTable).where(eq(classTable.academicYearId, yearId));
  }

  async createClass(data: typeof classTable.$inferInsert) {
    const [row] = await this.db.insert(classTable).values(data).returning();
    return row;
  }

  async findSections(classId: string) {
    return this.db.select().from(section).where(eq(section.classId, classId));
  }

  async createSection(data: typeof section.$inferInsert) {
    const [row] = await this.db.insert(section).values(data).returning();
    return row;
  }

  async findSubjects(classId: string) {
    return this.db.select().from(subject).where(eq(subject.classId, classId));
  }

  async createSubject(data: typeof subject.$inferInsert) {
    const [row] = await this.db.insert(subject).values(data).returning();
    return row;
  }

  async assignTeacher(data: typeof teacherSection.$inferInsert) {
    const [row] = await this.db.insert(teacherSection).values(data).returning();
    return row;
  }
}
