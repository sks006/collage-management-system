import { IHttpTransport } from "../core/types";
import { defaultTransport } from "../core/transport";
import { DashboardRoleRequestItem } from "./dashboard.types";

export class DashboardApiService {
  constructor(private transport: IHttpTransport = defaultTransport) {}

  async getRoleRequests(): Promise<DashboardRoleRequestItem[]> {
    return this.transport.get<DashboardRoleRequestItem[]>("/auth/role-requests");
  }

  async approveRoleRequest(id: string): Promise<any> {
    return this.transport.post(`/auth/role-requests/${id}/approve`, {});
  }

  async rejectRoleRequest(id: string, reason?: string): Promise<any> {
    return this.transport.post(`/auth/role-requests/${id}/reject`, { reason });
  }
}

export const dashboardApi = new DashboardApiService();
