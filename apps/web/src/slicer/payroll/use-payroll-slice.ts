import * as React from "react";
import { useToast } from "@/components/ui/toast";
import { PayrollRunItem, PayrollLineItem, IPayrollHandlers } from "./payroll.types";
import { payrollApi, PayrollApiService } from "./payroll.api";

export function usePayrollSlice(api: PayrollApiService = payrollApi) {
  const { toast } = useToast();
  const [runs, setRuns] = React.useState<PayrollRunItem[]>([]);
  const [lines, setLines] = React.useState<PayrollLineItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [computing, setComputing] = React.useState(false);

  const fetchPayroll = React.useCallback(async () => {
    setLoading(true);
    try {
      const [runsData, linesData] = await Promise.allSettled([
        api.getRuns(),
        api.getLines(),
      ]);

      if (runsData.status === "fulfilled" && Array.isArray(runsData.value)) {
        setRuns(runsData.value);
      }
      if (linesData.status === "fulfilled" && Array.isArray(linesData.value)) {
        setLines(linesData.value);
      }
    } catch (err: any) {
      toast({
        title: "Payroll Load Error",
        description: err.message,
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  }, [api, toast]);

  React.useEffect(() => {
    fetchPayroll();
  }, [fetchPayroll]);

  const handleComputePayroll = async (month: string): Promise<boolean> => {
    setComputing(true);
    try {
      await api.computeRun(month);
      toast({
        title: "Payroll Computation Enqueued",
        description: `Triggered salary calculation for ${month}. Outbox job enqueued.`,
        type: "success",
      });
      await fetchPayroll();
      return true;
    } catch (err: any) {
      toast({
        title: "Computation Failed",
        description: err.message,
        type: "error",
      });
      return false;
    } finally {
      setComputing(false);
    }
  };

  const handleApproveRun = async (runId: string): Promise<boolean> => {
    try {
      await api.approveRun(runId);
      setRuns((prev) =>
        prev.map((r) => (r.id === runId ? { ...r, status: "APPROVED" as const } : r)),
      );
      toast({
        title: "Maker-Checker Signoff",
        description: "Payroll batch approved. Ready for BEFTN dispatch.",
        type: "success",
      });
      return true;
    } catch (err: any) {
      toast({
        title: "Approval Rejected",
        description: err.message,
        type: "error",
      });
      return false;
    }
  };

  const handleDispatchBeftn = async (runId: string): Promise<boolean> => {
    try {
      await api.dispatchBeftn(runId);
      setRuns((prev) =>
        prev.map((r) => (r.id === runId ? { ...r, status: "DISPATCHED" as const } : r)),
      );
      toast({
        title: "BEFTN File Dispatched",
        description: "128-byte fixed-width ASCII file transmitted to Bangladesh Bank.",
        type: "success",
      });
      return true;
    } catch (err: any) {
      toast({
        title: "Dispatch Failed",
        description: err.message,
        type: "error",
      });
      return false;
    }
  };

  const handlers: IPayrollHandlers = {
    handleComputePayroll,
    handleApproveRun,
    handleDispatchBeftn,
    handleRefresh: fetchPayroll,
  };

  return {
    runs,
    lines,
    loading,
    computing,
    handlers,
  };
}
