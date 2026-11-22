"use server";

import { attendanceService } from "@/services/attendance.service";

export async function submitAttendanceBatchAction(payload: any) {
  return attendanceService.submitBatch(payload);
}

export async function approvePeriodCloseAction(id: string) {
  return attendanceService.approvePeriodClose(id);
}
