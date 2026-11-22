import * as React from "react";
import { useToast } from "@/components/ui/toast";
import { StudentItem, EnrollStudentInput, IStudentHandlers } from "./students.types";
import { studentApi, StudentApiService } from "./students.api";

export function useStudentSlice(api: StudentApiService = studentApi) {
  const { toast } = useToast();
  const [students, setStudents] = React.useState<StudentItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState("");

  const fetchStudents = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getAll();
      setStudents(Array.isArray(data) ? data : []);
    } catch (err: any) {
      toast({
        title: "Failed to load students",
        description: err.message,
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  }, [api, toast]);

  React.useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const handleEnrollStudent = async (input: EnrollStudentInput): Promise<boolean> => {
    try {
      const created = await api.enroll(input);
      setStudents((prev) => [created, ...prev]);
      toast({
        title: "Student Enrolled",
        description: `Successfully enrolled ${input.nameEn} (${created.admissionNo || "New"}).`,
        type: "success",
      });
      return true;
    } catch (err: any) {
      toast({
        title: "Enrollment Failed",
        description: err.message,
        type: "error",
      });
      return false;
    }
  };

  const handleImportCsv = async (csvContent: string): Promise<boolean> => {
    try {
      const lines = csvContent.split("\n").filter((l) => l.trim().length > 0);
      const parsed: Partial<StudentItem>[] = lines.slice(1).map((line, idx) => {
        const [nameEn, phone, className, section] = line.split(",").map((c) => c.trim());
        return {
          admissionNo: `DMC-2026-IMP${String(idx + 1).padStart(3, "0")}`,
          nameEn: nameEn || `Student ${idx + 1}`,
          phone: phone || "+8801700000000",
          class: className || "11-SCI",
          section: section || "A",
          status: "ACTIVE" as const,
        };
      });

      await api.importBatch(parsed);
      toast({
        title: "CSV Ingest Successful",
        description: `Imported ${parsed.length} student records.`,
        type: "success",
      });
      await fetchStudents();
      return true;
    } catch (err: any) {
      toast({
        title: "Import Failed",
        description: err.message,
        type: "error",
      });
      return false;
    }
  };

  const filteredStudents = React.useMemo(() => {
    if (!searchTerm.trim()) return students;
    const q = searchTerm.toLowerCase();
    return students.filter(
      (s) =>
        s.nameEn?.toLowerCase().includes(q) ||
        s.admissionNo?.toLowerCase().includes(q) ||
        s.phone?.includes(q) ||
        s.class?.toLowerCase().includes(q),
    );
  }, [students, searchTerm]);

  const handlers: IStudentHandlers = {
    handleEnrollStudent,
    handleImportCsv,
    handleSearch: setSearchTerm,
    handleRefresh: fetchStudents,
  };

  return {
    students: filteredStudents,
    allCount: students.length,
    loading,
    searchTerm,
    handlers,
  };
}
