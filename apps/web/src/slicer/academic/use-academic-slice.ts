import * as React from "react";
import { AcademicYear, ClassItem, SectionItem, IAcademicHandlers } from "./academic.types";
import { academicApi, AcademicApiService } from "./academic.api";

export function useAcademicSlice(api: AcademicApiService = academicApi) {
  const [years, setYears] = React.useState<AcademicYear[]>([]);
  const [classes, setClasses] = React.useState<ClassItem[]>([]);
  const [sections, setSections] = React.useState<SectionItem[]>([]);
  const [loading, setLoading] = React.useState(true);

  const fetchAcademicData = React.useCallback(async () => {
    setLoading(true);
    try {
      const [yearsRes, classesRes, sectionsRes] = await Promise.allSettled([
        api.getYears(),
        api.getClasses(),
        api.getSections(),
      ]);

      if (yearsRes.status === "fulfilled" && Array.isArray(yearsRes.value)) {
        setYears(yearsRes.value);
      }
      if (classesRes.status === "fulfilled" && Array.isArray(classesRes.value)) {
        setClasses(classesRes.value);
      }
      if (sectionsRes.status === "fulfilled" && Array.isArray(sectionsRes.value)) {
        setSections(sectionsRes.value);
      }
    } finally {
      setLoading(false);
    }
  }, [api]);

  React.useEffect(() => {
    fetchAcademicData();
  }, [fetchAcademicData]);

  const handlers: IAcademicHandlers = {
    handleRefresh: fetchAcademicData,
  };

  return {
    years,
    classes,
    sections,
    loading,
    handlers,
  };
}
