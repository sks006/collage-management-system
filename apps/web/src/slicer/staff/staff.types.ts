export interface StaffItem {
  id: string;
  employeeNo: string;
  nameEn?: string;
  nameBn?: string;
  name?: string;
  designation: string;
  department: string;
  email: string;
  phone: string;
  baseSalary?: number;
  status: "ACTIVE" | "ON_LEAVE" | "INACTIVE";
}

export interface RoleRequestItem {
  id: string;
  keycloakUserId: string;
  email: string;
  fullName: string;
  phone?: string;
  requestedRole: string;
  referenceNo?: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  rejectionReason?: string;
}

export interface CreateStaffInput {
  employeeNo: string;
  name: string;
  designation: string;
  department: string;
  email: string;
  phone: string;
  baseSalary: number;
}

export interface IStaffHandlers {
  handleCreateStaff: (input: CreateStaffInput) => Promise<boolean>;
  handleApproveRequest: (id: string, name: string, role: string) => Promise<boolean>;
  handleRejectRequest: (id: string, name: string, reason: string) => Promise<boolean>;
  handleRefresh: () => Promise<void>;
  handleSearch: (term: string) => void;
}
