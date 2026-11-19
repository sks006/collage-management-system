import { Injectable, Inject } from "@nestjs/common";
import { DATABASE_CONNECTION } from "../../../shared/database/database.provider";
import { DatabaseInstance, student, staff, notice } from "@sms/database";
import { ilike, or } from "drizzle-orm";

@Injectable()
export class SearchRepository {
  constructor(@Inject(DATABASE_CONNECTION) private db: DatabaseInstance) {}

  // Invariant 4: Search returns IDs only. Full rows are loaded with authorization checks.
  async searchStudents(q: string) {
    const rows = await this.db
      .select({ id: student.id, admissionNo: student.admissionNo, nameEn: student.nameEn })
      .from(student)
      .where(or(ilike(student.nameEn, `%${q}%`), ilike(student.admissionNo, `%${q}%`)))
      .limit(20);
    return rows;
  }

  async searchStaff(q: string) {
    const rows = await this.db
      .select({ id: staff.id, employeeNo: staff.employeeNo, nameEn: staff.nameEn })
      .from(staff)
      .where(or(ilike(staff.nameEn, `%${q}%`), ilike(staff.employeeNo, `%${q}%`)))
      .limit(20);
    return rows;
  }

  async searchNotices(q: string) {
    const rows = await this.db
      .select({ id: notice.id, title: notice.title })
      .from(notice)
      .where(ilike(notice.title, `%${q}%`))
      .limit(20);
    return rows;
  }
}
