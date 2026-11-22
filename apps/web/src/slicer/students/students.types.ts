export interface StudentItem {
  id: string;
  admissionNo: string;
  nameEn: string;
  nameBn?: string;
  class?: string;
  section?: string;
  status: "ACTIVE" | "INACTIVE";
  phone: string;
  email?: string;
  guardianName?: string;
  guardianPhone?: string;
}

export interface EnrollStudentInput {
  nameEn: string;
  nameBn?: string;
  class: string;
  section: string;
  phone: string;
  email?: string;
  guardianName?: string;
  guardianPhone?: string;
}

export interface IStudentHandlers {
  handleEnrollStudent: (input: EnrollStudentInput) => Promise<boolean>;
  handleImportCsv: (csvContent: string) => Promise<boolean>;
  handleSearch: (term: string) => void;
  handleRefresh: () => Promise<void>;
}
