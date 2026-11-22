import { apiClient } from "@/lib/api-client";

export interface LeaveRequestDto {
  id?: string;
  staffId?: string;
  staffName?: string;
  leaveType: string;
  startDate?: string;
  endDate?: string;
  from?: string;
  to?: string;
  days: number;
  reason: string;
  status?: "PENDING" | "APPROVED" | "REJECTED";
}

export const leaveService = {
  getRequests: () => apiClient<LeaveRequestDto[]>("/leave/requests"),
  apply: (payload: LeaveRequestDto) =>
    apiClient<LeaveRequestDto>("/leave/requests", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  approve: (id: string) =>
    apiClient(`/leave/requests/${id}/approve`, {
      method: "POST",
    }),
  reject: (id: string, reason?: string) =>
    apiClient(`/leave/requests/${id}/reject`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    }),
  assignSubstitution: (payload: any) =>
    apiClient("/leave/substitutions", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};
