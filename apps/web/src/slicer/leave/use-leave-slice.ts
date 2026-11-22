import * as React from "react";
import { useToast } from "@/components/ui/toast";
import { LeaveRequestItem, ApplyLeaveInput, ILeaveHandlers } from "./leave.types";
import { leaveApi, LeaveApiService } from "./leave.api";

export function useLeaveSlice(api: LeaveApiService = leaveApi) {
  const { toast } = useToast();
  const [requests, setRequests] = React.useState<LeaveRequestItem[]>([]);
  const [loading, setLoading] = React.useState(true);

  const fetchRequests = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getRequests();
      setRequests(Array.isArray(data) ? data : []);
    } catch (err: any) {
      toast({
        title: "Leave Load Error",
        description: err.message,
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  }, [api, toast]);

  React.useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleApplyLeave = async (input: ApplyLeaveInput): Promise<boolean> => {
    try {
      const created = await api.applyLeave(input);
      setRequests((prev) => [created, ...prev]);
      toast({
        title: "Leave Application Submitted",
        description: `Requested ${input.days} days of ${input.leaveType} leave.`,
        type: "success",
      });
      return true;
    } catch (err: any) {
      toast({
        title: "Application Failed",
        description: err.message,
        type: "error",
      });
      return false;
    }
  };

  const handleApproveLeave = async (id: string): Promise<boolean> => {
    try {
      await api.approveLeave(id);
      setRequests((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: "APPROVED" as const } : r)),
      );
      toast({
        title: "Leave Approved",
        description: "Application approved and calendar updated.",
        type: "success",
      });
      return true;
    } catch (err: any) {
      toast({
        title: "Approval Failed",
        description: err.message,
        type: "error",
      });
      return false;
    }
  };

  const handleRejectLeave = async (id: string, reason?: string): Promise<boolean> => {
    try {
      await api.rejectLeave(id, reason);
      setRequests((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: "REJECTED" as const } : r)),
      );
      toast({
        title: "Leave Rejected",
        description: "Application rejected.",
        type: "info",
      });
      return true;
    } catch (err: any) {
      toast({
        title: "Rejection Failed",
        description: err.message,
        type: "error",
      });
      return false;
    }
  };

  const handleAssignSubstitution = async (payload: any): Promise<boolean> => {
    try {
      await api.assignSubstitution(payload);
      toast({
        title: "Substitution Assigned",
        description: "Assigned substitute teacher for academic continuity.",
        type: "success",
      });
      return true;
    } catch (err: any) {
      toast({
        title: "Substitution Error",
        description: err.message,
        type: "error",
      });
      return false;
    }
  };

  const handlers: ILeaveHandlers = {
    handleApplyLeave,
    handleApproveLeave,
    handleRejectLeave,
    handleAssignSubstitution,
    handleRefresh: fetchRequests,
  };

  return {
    requests,
    loading,
    handlers,
  };
}
