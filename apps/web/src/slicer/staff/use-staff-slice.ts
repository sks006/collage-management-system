import * as React from "react";
import { useToast } from "@/components/ui/toast";
import { StaffItem, RoleRequestItem, CreateStaffInput, IStaffHandlers } from "./staff.types";
import { staffApi, StaffApiService } from "./staff.api";

/**
 * useStaffSlice Hook
 * Centralizes all handles and state for the Staff feature slice.
 * Adheres to Single Responsibility Principle (SRP) and Open-Closed Principle (OCP).
 */
export function useStaffSlice(api: StaffApiService = staffApi) {
  const { toast } = useToast();
  const [staffList, setStaffList] = React.useState<StaffItem[]>([]);
  const [roleRequests, setRoleRequests] = React.useState<RoleRequestItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [loadingRequests, setLoadingRequests] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [actionLoading, setActionLoading] = React.useState<string | null>(null);

  const fetchStaff = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getAll();
      setStaffList(Array.isArray(data) ? data : []);
    } catch (err: any) {
      toast({
        title: "Failed to load staff directory",
        description: err.message,
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  }, [api, toast]);

  const fetchRoleRequests = React.useCallback(async () => {
    setLoadingRequests(true);
    try {
      const data = await api.getRoleRequests();
      setRoleRequests(Array.isArray(data) ? data : []);
    } catch {
      // Ignored if user lacks permission
    } finally {
      setLoadingRequests(false);
    }
  }, [api]);

  React.useEffect(() => {
    fetchStaff();
    fetchRoleRequests();
  }, [fetchStaff, fetchRoleRequests]);

  const handleCreateStaff = async (input: CreateStaffInput): Promise<boolean> => {
    try {
      const created = await api.create(input);
      setStaffList((prev) => [created, ...prev]);
      toast({
        title: "Staff Member Created",
        description: `Successfully added ${input.name} (${input.employeeNo}).`,
        type: "success",
      });
      return true;
    } catch (err: any) {
      toast({
        title: "Creation Failed",
        description: err.message,
        type: "error",
      });
      return false;
    }
  };

  const handleApproveRequest = async (id: string, name: string, role: string): Promise<boolean> => {
    setActionLoading(id);
    try {
      await api.approveRoleRequest(id, role);
      setRoleRequests((prev) => prev.filter((r) => r.id !== id));
      toast({
        title: "Role Application Approved",
        description: `Approved ${role} access for ${name}. Activation notice dispatched.`,
        type: "success",
      });
      fetchStaff();
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

  const handleRejectRequest = async (id: string, name: string, reason: string): Promise<boolean> => {
    setActionLoading(id);
    try {
      await api.rejectRoleRequest(id, reason);
      setRoleRequests((prev) => prev.filter((r) => r.id !== id));
      toast({
        title: "Role Application Rejected",
        description: `Rejected application for ${name}. Reason recorded.`,
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

  const filteredStaff = React.useMemo(() => {
    if (!searchTerm.trim()) return staffList;
    const q = searchTerm.toLowerCase();
    return staffList.filter(
      (s) =>
        s.nameEn?.toLowerCase().includes(q) ||
        s.name?.toLowerCase().includes(q) ||
        s.employeeNo.toLowerCase().includes(q) ||
        s.department.toLowerCase().includes(q) ||
        s.designation.toLowerCase().includes(q),
    );
  }, [staffList, searchTerm]);

  const handlers: IStaffHandlers = {
    handleCreateStaff,
    handleApproveRequest,
    handleRejectRequest,
    handleRefresh: async () => {
      await Promise.all([fetchStaff(), fetchRoleRequests()]);
    },
    handleSearch: setSearchTerm,
  };

  return {
    staffList: filteredStaff,
    allStaffCount: staffList.length,
    roleRequests,
    loading,
    loadingRequests,
    searchTerm,
    actionLoading,
    handlers,
  };
}
