export interface LeaveRequestItem {
  id: string;
  staffId?: string;
  staffName?: string;
  applicant?: string;
  designation?: string;
  leaveType?: string;
  type?: string;
  startDate?: string;
  from?: string;
  endDate?: string;
  to?: string;
  days: number;
  reason: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  approvedBy?: string | null;
  approver?: string;
}

export interface ApplyLeaveInput {
  leaveType: string;
  from: string;
  to: string;
  days: number;
  reason: string;
}

export interface ILeaveHandlers {
  handleApplyLeave: (input: ApplyLeaveInput) => Promise<boolean>;
  handleApproveLeave: (id: string) => Promise<boolean>;
  handleRejectLeave: (id: string, reason?: string) => Promise<boolean>;
  handleAssignSubstitution: (payload: any) => Promise<boolean>;
  handleRefresh: () => Promise<void>;
}
