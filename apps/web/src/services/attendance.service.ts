import { apiClient } from "@/lib/api-client";

export interface AttendanceRecordDto {
  studentId: string;
  status: "PRESENT" | "ABSENT" | "LATE";
  source?: string;
}

export interface AttendanceBatchDto {
  sectionId?: string;
  classId?: string;
  date?: string;
  eventDate?: string;
  period?: number;
  records?: any[];
  events?: any[];
}

export const attendanceService = {
  submitBatch: (payload: AttendanceBatchDto) =>
    apiClient("/attendance/batch", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  getPeriodCloses: () => apiClient<any[]>("/attendance/close"),
  approvePeriodClose: (id: string) =>
    apiClient(`/attendance/close/${id}/approve`, {
      method: "POST",
    }),
};
