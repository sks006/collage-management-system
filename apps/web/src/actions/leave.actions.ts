"use server";

import { leaveService } from "@/services/leave.service";

export async function submitLeaveRequestAction(payload: any) {
  return leaveService.apply(payload);
}

export async function approveLeaveRequestAction(id: string) {
  return leaveService.approve(id);
}

export async function assignSubstitutionAction(payload: any) {
  return leaveService.assignSubstitution(payload);
}
