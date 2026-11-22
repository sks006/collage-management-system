import * as React from "react";
import { useToast } from "@/components/ui/toast";
import { StudentRosterItem, PeriodCloseItem, IAttendanceHandlers } from "./attendance.types";
import { attendanceApi, AttendanceApiService } from "./attendance.api";

const INITIAL_ROSTERS: Record<string, StudentRosterItem[]> = {
  "11-SCI-A": [
    { id: "stu-1", roll: "101", name: "Tanvir Hasan (DMC-2026-001)", status: "PRESENT" },
    { id: "stu-3", roll: "102", name: "Sadman Sakib (DMC-2026-003)", status: "PRESENT" },
    { id: "stu-5", roll: "103", name: "Kazi Nabil (DMC-2026-005)", status: "LATE" },
  ],
  "11-SCI-B": [
    { id: "stu-2", roll: "201", name: "Nusrat Jahan (DMC-2026-002)", status: "PRESENT" },
    { id: "stu-6", roll: "202", name: "Sultana Razia (DMC-2026-006)", status: "PRESENT" },
  ],
  "12-HUM": [
    { id: "stu-4", roll: "301", name: "Mehnaz Akter (DMC-2026-004)", status: "PRESENT" },
  ],
};

export function useAttendanceSlice(api: AttendanceApiService = attendanceApi) {
  const { toast } = useToast();
  const [selectedClass, setSelectedClass] = React.useState("11-SCI-A");
  const [roster, setRoster] = React.useState<StudentRosterItem[]>(INITIAL_ROSTERS["11-SCI-A"]!);
  const [periodCloses, setPeriodCloses] = React.useState<PeriodCloseItem[]>([]);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [loadingCloses, setLoadingCloses] = React.useState(false);

  const fetchPeriodCloses = React.useCallback(async () => {
    setLoadingCloses(true);
    try {
      const data = await api.getPeriodCloses();
      setPeriodCloses(Array.isArray(data) ? data : []);
    } catch {
      // Ignore fallback
    } finally {
      setLoadingCloses(false);
    }
  }, [api]);

  React.useEffect(() => {
    fetchPeriodCloses();
  }, [fetchPeriodCloses]);

  const handleSelectClass = (cls: string) => {
    setSelectedClass(cls);
    setRoster(INITIAL_ROSTERS[cls] || []);
  };

  const handleToggleStatus = (studentId: string, status: "PRESENT" | "ABSENT" | "LATE") => {
    setRoster((prev) =>
      prev.map((s) => (s.id === studentId ? { ...s, status } : s)),
    );
  };

  const handleSubmitRoster = async (): Promise<boolean> => {
    setIsSubmitting(true);
    try {
      await api.submitBatch({
        classId: selectedClass,
        date: new Date().toISOString().split("T")[0]!,
        records: roster,
      });

      const absentCount = roster.filter((s) => s.status === "ABSENT").length;
      toast({
        title: "Attendance Recorded & SMS Enqueued",
        description: `Class ${selectedClass} attendance finalized. ${absentCount} absentee alerts dispatched to Outbox.`,
        type: "success",
      });
      return true;
    } catch (err: any) {
      toast({
        title: "Submission Error",
        description: err.message,
        type: "error",
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApprovePeriodClose = async (id: string): Promise<boolean> => {
    try {
      await api.approvePeriodClose(id);
      setPeriodCloses((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status: "LOCKED" as const } : p)),
      );
      toast({
        title: "Period Close Approved",
        description: "Attendance records locked and ready for payroll computation.",
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

  const handlers: IAttendanceHandlers = {
    handleSelectClass,
    handleToggleStatus,
    handleSubmitRoster,
    handleApprovePeriodClose,
    handleRefresh: fetchPeriodCloses,
  };

  return {
    selectedClass,
    roster,
    periodCloses,
    isSubmitting,
    loadingCloses,
    handlers,
  };
}
