export interface DashboardRoleRequestItem {
  id: string;
  email: string;
  fullName: string;
  requestedRole: string;
  referenceNo?: string;
  status: string;
  createdAt: string;
}

export interface DashboardMetrics {
  enrolledStudents: number;
  totalSections: number;
  attendanceRate: number;
  presentCount: number;
  monthlyCollections: number;
  periodCloseStatus: string;
  periodCloseMonth: string;
}

export interface IDashboardHandlers {
  handleApproveRoleRequest: (id: string, name: string, roleName: string) => Promise<boolean>;
  handleRejectRoleRequest: (id: string, name: string, reason?: string) => Promise<boolean>;
  handleRefresh: () => Promise<void>;
}
