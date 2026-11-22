import { IHttpTransport } from "../core/types";
import { defaultTransport } from "../core/transport";
import { LeaveRequestItem, ApplyLeaveInput } from "./leave.types";

export class LeaveApiService {
  constructor(private transport: IHttpTransport = defaultTransport) {}

  async getRequests(): Promise<LeaveRequestItem[]> {
    return this.transport.get<LeaveRequestItem[]>("/leave/requests");
  }

  async applyLeave(input: ApplyLeaveInput): Promise<LeaveRequestItem> {
    return this.transport.post<LeaveRequestItem>("/leave/requests", input);
  }

  async approveLeave(id: string): Promise<any> {
    return this.transport.post(`/leave/requests/${id}/approve`, {});
  }

  async rejectLeave(id: string, reason?: string): Promise<any> {
    return this.transport.post(`/leave/requests/${id}/reject`, { reason });
  }

  async assignSubstitution(payload: any): Promise<any> {
    return this.transport.post("/leave/substitutions", payload);
  }
}

export const leaveApi = new LeaveApiService();
