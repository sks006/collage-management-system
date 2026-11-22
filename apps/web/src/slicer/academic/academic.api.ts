import { IHttpTransport } from "../core/types";
import { defaultTransport } from "../core/transport";
import { AcademicYear, ClassItem, SectionItem } from "./academic.types";

export class AcademicApiService {
  constructor(private transport: IHttpTransport = defaultTransport) {}

  async getYears(): Promise<AcademicYear[]> {
    return this.transport.get<AcademicYear[]>("/academic/years");
  }

  async getClasses(): Promise<ClassItem[]> {
    return this.transport.get<ClassItem[]>("/academic/classes");
  }

  async getSections(): Promise<SectionItem[]> {
    return this.transport.get<SectionItem[]>("/academic/sections");
  }
}

export const academicApi = new AcademicApiService();
