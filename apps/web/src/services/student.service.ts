import { apiClient } from "@/lib/api-client";

export interface StudentDto {
  id: string;
  admissionNo: string;
  nameEn: string;
  nameBn?: string;
  phone: string;
  email?: string;
  class?: string;
  section?: string;
  status: "ACTIVE" | "INACTIVE";
  guardianName?: string;
  guardianPhone?: string;
}

export const studentService = {
  getAll: (params?: Record<string, any>) =>
    apiClient<StudentDto[]>("/students", { params }),
  getById: (id: string) => apiClient<StudentDto>(`/students/${id}`),
  create: (payload: Partial<StudentDto>) =>
    apiClient<StudentDto>("/students", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  bulkImport: (students: Partial<StudentDto>[]) =>
    apiClient<{ count: number }>("/students/bulk", {
      method: "POST",
      body: JSON.stringify({ students }),
    }),
};
