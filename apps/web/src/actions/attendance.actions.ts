"use server";

import { apiClient } from "@/lib/api-client";

export async function submitAttendanceBatchAction(payload: any) {
  return apiClient("/attendance/batch", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function approvePeriodCloseAction(id: string) {
  return apiClient(`/attendance/close/${id}/approve`, {
    method: "POST",
  });
}
