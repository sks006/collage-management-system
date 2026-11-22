import { IHttpTransport } from "../core/types";
import { defaultTransport } from "../core/transport";
import { PeriodCloseItem, StudentRosterItem } from "./attendance.types";

export class AttendanceApiService {
  constructor(private transport: IHttpTransport = defaultTransport) {}

  async submitBatch(payload: { classId: string; date: string; records: StudentRosterItem[] }): Promise<any> {
    return this.transport.post("/attendance/batch", payload);
  }

  async getPeriodCloses(): Promise<PeriodCloseItem[]> {
    return this.transport.get<PeriodCloseItem[]>("/attendance/close");
  }

  async approvePeriodClose(id: string): Promise<any> {
    return this.transport.post(`/attendance/close/${id}/approve`, {});
  }
}

export const attendanceApi = new AttendanceApiService();
