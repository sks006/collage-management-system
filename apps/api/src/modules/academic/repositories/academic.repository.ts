import { Injectable, Inject } from "@nestjs/common";
import { DATABASE_CONNECTION } from "../../../shared/database/database.provider";
import { DatabaseInstance, academicYear, term, classTable, section, subject, teacherSection } from "@sms/database";
import { eq, desc } from "drizzle-orm";

@Injectable()
export class AcademicRepository {
  constructor(@Inject(DATABASE_CONNECTION) private db: DatabaseInstance) {}

  async findYears() {
    return this.db.select().from(academicYear).orderBy(desc(academicYear.startDate));
  }

  async createYear(data: typeof academicYear.$inferInsert) {
    const [row] = await this.db.insert(academicYear).values(data).returning();
    return row;
  }

  async findTerms(yearId: string) {
    return this.db.select().from(term).where(eq(term.academicYearId, yearId));
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

  async assignTeacher(data: typeof teacherSection.$inferInsert) {
    const [row] = await this.db.insert(teacherSection).values(data).returning();
    return row;
  }

  async findTeacherSections(staffId: string) {
    return this.db.select().from(teacherSection).where(eq(teacherSection.staffId, staffId));
  }
}
