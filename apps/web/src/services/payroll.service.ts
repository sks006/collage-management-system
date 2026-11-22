import { apiClient } from "@/lib/api-client";

export interface PayrollRunDto {
  id: string;
  month: string;
  staffCount?: number;
  totalStaff?: number;
  totalGross?: number;
  totalNet?: number;
  totalAmount?: number;
  status: "DRAFT" | "PENDING_APPROVAL" | "APPROVED" | "DISPATCHED" | "PAID";
  maker?: string;
  checker?: string;
  approvedBy?: string | null;
  approvedAt?: string | null;
}

export interface PayrollLineDto {
  id: string;
  runId?: string;
  staffId?: string;
  employeeName?: string;
  baseSalary?: number;
  gross?: number;
  net?: number;
  status: string;
}

export const payrollService = {
  getRuns: () => apiClient<PayrollRunDto[]>("/payroll/runs"),
  getLines: (runId?: string) =>
    apiClient<PayrollLineDto[]>(`/payroll/lines${runId ? `?runId=${runId}` : ""}`),
  compute: (month: string) =>
    apiClient("/payroll/compute", {
      method: "POST",
      body: JSON.stringify({ month }),
    }),
  approve: (runId: string) =>
    apiClient(`/payroll/runs/${runId}/approve`, {
      method: "POST",
    }),
  dispatchBeftn: (runId: string) =>
    apiClient(`/payroll/runs/${runId}/dispatch`, {
      method: "POST",
    }),
};
