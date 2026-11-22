export interface AcademicYear {
  id?: string;
  year?: number;
  name: string;
  startDate?: string;
  endDate?: string;
  isCurrent?: boolean;
  status?: string;
  classesCount?: number;
  sectionsCount?: number;
}

export interface ClassItem {
  id?: string;
  name: string;
  code?: string;
  group?: string;
  gradeLevel?: number;
  sections?: string[];
  students?: number;
}

export interface SectionItem {
  id?: string;
  name: string;
  classId?: string;
  roomNo?: string;
  capacity?: number;
  enrolled?: number;
}

export interface IAcademicHandlers {
  handleRefresh: () => Promise<void>;
}
