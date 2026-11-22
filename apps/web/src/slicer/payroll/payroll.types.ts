export interface PayrollRunItem {
  id: string;
  month: string;
  staffCount?: number;
  totalStaff?: number;
  totalGross?: number;
  totalNet?: number;
  totalAmount?: number;
  status: "DRAFT" | "PENDING_APPROVAL" | "APPROVED" | "DISPATCHED" | "PAID";
  maker?: string;
  checker?: string;
  approvedBy?: string | null;
  approvedAt?: string | null;
}

export interface PayrollLineItem {
  id: string;
  runId?: string;
  staffId?: string;
  employeeName?: string;
  staff?: string;
  role?: string;
  designation?: string;
  baseSalary?: number;
  gross?: number;
  grossSalary?: number;
  deductions?: number;
  net?: number;
  netSalary?: number;
  status: "CALCULATED" | "DISPATCHED" | "PAID" | "FAILED" | string;
  bankAccount?: string;
}

export interface IPayrollHandlers {
  handleComputePayroll: (month: string) => Promise<boolean>;
  handleApproveRun: (runId: string) => Promise<boolean>;
  handleDispatchBeftn: (runId: string) => Promise<boolean>;
  handleRefresh: () => Promise<void>;
}
