import { apiClient } from "@/lib/api-client";

export interface StaffDto {
  id: string;
  employeeNo: string;
  nameEn?: string;
  nameBn?: string;
  name?: string;
  designation: string;
  department: string;
  email: string;
  phone: string;
  baseSalary?: number;
  status: "ACTIVE" | "ON_LEAVE" | "INACTIVE";
}

export const staffService = {
  getAll: (params?: Record<string, any>) =>
    apiClient<StaffDto[]>("/staff", { params }),
  getById: (id: string) => apiClient<StaffDto>(`/staff/${id}`),
  create: (payload: Partial<StaffDto>) =>
    apiClient<StaffDto>("/staff", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};
