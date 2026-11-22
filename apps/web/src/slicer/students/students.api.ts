import { IHttpTransport } from "../core/types";
import { defaultTransport } from "../core/transport";
import { StudentItem, EnrollStudentInput } from "./students.types";

export class StudentApiService {
  constructor(private transport: IHttpTransport = defaultTransport) {}

  async getAll(): Promise<StudentItem[]> {
    return this.transport.get<StudentItem[]>("/students");
  }

  async enroll(input: EnrollStudentInput): Promise<StudentItem> {
    const admissionNo = `DMC-2026-${Math.floor(100 + Math.random() * 900)}`;
    return this.transport.post<StudentItem>("/students", {
      admissionNo,
      nameEn: input.nameEn,
      nameBn: input.nameBn || input.nameEn,
      phone: input.phone,
      email: input.email || `${input.nameEn.toLowerCase().replace(/\s+/g, ".")}@dhakamodel.edu.bd`,
      guardianName: input.guardianName || "Guardian",
      guardianPhone: input.guardianPhone || input.phone,
      status: "ACTIVE",
    });
  }

  async importBatch(students: Partial<StudentItem>[]): Promise<{ count: number }> {
    return this.transport.post<{ count: number }>("/students/bulk", { students });
  }
}

export const studentApi = new StudentApiService();
