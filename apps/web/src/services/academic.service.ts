import { apiClient } from "@/lib/api-client";

export interface AcademicYearDto {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
}

export interface ClassDto {
  id: string;
  name: string;
  group?: string;
}

export interface SectionDto {
  id: string;
  name: string;
  classId: string;
}

export const academicService = {
  getYears: () => apiClient<AcademicYearDto[]>("/academic/years"),
  getClasses: (academicYearId?: string) =>
    apiClient<ClassDto[]>("/academic/classes", {
      params: academicYearId ? { academicYearId } : undefined,
    }),
  getSections: (classId?: string) =>
    apiClient<SectionDto[]>("/academic/sections", {
      params: classId ? { classId } : undefined,
    }),
  createYear: (payload: { name: string; startDate: string; endDate: string }) =>
    apiClient<AcademicYearDto>("/academic/years", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};
