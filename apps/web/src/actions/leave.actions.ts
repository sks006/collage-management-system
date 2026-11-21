"use server";

import { apiClient } from "@/lib/api-client";

export async function submitLeaveRequestAction(payload: any) {
  return apiClient("/leave/requests", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function approveLeaveRequestAction(id: string) {
  return apiClient(`/leave/requests/${id}/approve`, {
    method: "POST",
  });
}

export async function assignSubstitutionAction(payload: any) {
  return apiClient("/leave/substitutions", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
