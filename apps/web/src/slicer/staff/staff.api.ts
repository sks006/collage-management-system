import { IHttpTransport } from "../core/types";
import { defaultTransport } from "../core/transport";
import { StaffItem, RoleRequestItem, CreateStaffInput } from "./staff.types";

/**
 * Staff API Service adhering to Single Responsibility Principle (SRP)
 * and Dependency Inversion Principle (DIP).
 */
export class StaffApiService {
  constructor(private transport: IHttpTransport = defaultTransport) {}

  async getAll(): Promise<StaffItem[]> {
    return this.transport.get<StaffItem[]>("/staff");
  }

  async create(input: CreateStaffInput): Promise<StaffItem> {
    return this.transport.post<StaffItem>("/staff", {
      employeeNo: input.employeeNo,
      nameEn: input.name,
      designation: input.designation,
      department: input.department,
      email: input.email,
      phone: input.phone,
      baseSalary: input.baseSalary,
      status: "ACTIVE",
    });
  }

  async getRoleRequests(): Promise<RoleRequestItem[]> {
    return this.transport.get<RoleRequestItem[]>("/auth/role-requests?status=PENDING");
  }

  async approveRoleRequest(id: string, assignedRole?: string): Promise<any> {
    try {
      return await this.transport.patch(`/auth/role-requests/${id}`, {
        decision: "APPROVED",
        assignedRole,
      });
    } catch {
      return this.transport.post(`/auth/role-requests/${id}/approve`, {});
    }
  }

  async rejectRoleRequest(id: string, reason: string): Promise<any> {
    try {
      return await this.transport.patch(`/auth/role-requests/${id}`, {
        decision: "REJECTED",
        rejectionReason: reason,
      });
    } catch {
      return this.transport.post(`/auth/role-requests/${id}/reject`, { reason });
    }
  }
}

export const staffApi = new StaffApiService();
