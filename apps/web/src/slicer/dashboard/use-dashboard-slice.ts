import * as React from "react";
import { useToast } from "@/components/ui/toast";
import { DashboardRoleRequestItem, IDashboardHandlers } from "./dashboard.types";
import { dashboardApi, DashboardApiService } from "./dashboard.api";

export function useDashboardSlice(
  isAdminOrPrincipal: boolean,
  api: DashboardApiService = dashboardApi,
) {
  const { toast } = useToast();
  const [roleRequests, setRoleRequests] = React.useState<DashboardRoleRequestItem[]>([]);
  const [loadingRequests, setLoadingRequests] = React.useState(false);
  const [actionLoading, setActionLoading] = React.useState<string | null>(null);

  const fetchRoleRequests = React.useCallback(async () => {
    if (!isAdminOrPrincipal) return;
    setLoadingRequests(true);
    try {
      const data = await api.getRoleRequests();
      setRoleRequests(Array.isArray(data) ? data : []);
    } catch {
      // Ignored
    } finally {
      setLoadingRequests(false);
    }
  }, [isAdminOrPrincipal, api]);

  React.useEffect(() => {
    fetchRoleRequests();
  }, [fetchRoleRequests]);

  const handleApproveRoleRequest = async (
    id: string,
    name: string,
    roleName: string,
  ): Promise<boolean> => {
    setActionLoading(id);
    try {
      await api.approveRoleRequest(id);
      setRoleRequests((prev) => prev.filter((r) => r.id !== id));
      toast({
        title: "Staff Role Approved",
        description: `Granted ${roleName} permissions to ${name}. Activation notice dispatched.`,
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
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectRoleRequest = async (
    id: string,
    name: string,
    reason?: string,
  ): Promise<boolean> => {
    setActionLoading(id);
    try {
      await api.rejectRoleRequest(id, reason);
      setRoleRequests((prev) => prev.filter((r) => r.id !== id));
      toast({
        title: "Role Application Rejected",
        description: `Rejected application for ${name}.`,
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
    } finally {
      setActionLoading(null);
    }
  };

  const handlers: IDashboardHandlers = {
    handleApproveRoleRequest,
    handleRejectRoleRequest,
    handleRefresh: fetchRoleRequests,
  };

  return {
    roleRequests,
    loadingRequests,
    actionLoading,
    handlers,
  };
}
