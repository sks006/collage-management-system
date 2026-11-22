export interface StudentRosterItem {
  id: string;
  roll: string;
  name: string;
  status: "PRESENT" | "ABSENT" | "LATE";
}

export interface PeriodCloseItem {
  id: string;
  sectionId?: string;
  sectionName?: string;
  periodName?: string;
  month?: string;
  startDate?: string;
  endDate?: string;
  status: "DRAFT" | "PENDING_APPROVAL" | "APPROVED" | "PENDING" | "LOCKED";
  totalDays?: number;
  presentRate?: number;
  submittedBy?: string;
  approvedBy?: string | null;
  approvedAt?: string | null;
  lockedBy?: string | null;
  lockedAt?: string | null;
}

export interface IAttendanceHandlers {
  handleSelectClass: (cls: string) => void;
  handleToggleStatus: (studentId: string, status: "PRESENT" | "ABSENT" | "LATE") => void;
  handleSubmitRoster: () => Promise<boolean>;
  handleApprovePeriodClose: (id: string) => Promise<boolean>;
  handleRefresh: () => Promise<void>;
}
