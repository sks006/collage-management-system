/**
 * Slicer Architecture Hub
 * Centralizes all feature slices, handlers, API contracts, and layouts.
 * Adheres strictly to SOLID Principles:
 * - Single Responsibility: Separate presentation, state handling, and HTTP transport.
 * - Open/Closed: Extensible handler pipelines and transport contracts.
 * - Liskov Substitution: Uniform result contracts (ActionResult, AsyncState).
 * - Interface Segregation: Granular interfaces per feature domain.
 * - Dependency Inversion: High-level UI relies on slice hooks, which rely on IHttpTransport.
 */

export * from "./core/types";
export * from "./core/transport";
export * from "./slicer-layout";

// Feature Slices
export * from "./staff/staff.types";
export * from "./staff/staff.api";
export * from "./staff/use-staff-slice";

export * from "./students/students.types";
export * from "./students/students.api";
export * from "./students/use-student-slice";

export * from "./attendance/attendance.types";
export * from "./attendance/attendance.api";
export * from "./attendance/use-attendance-slice";

export * from "./finance/finance.types";
export * from "./finance/finance.api";
export * from "./finance/use-finance-slice";

export * from "./payroll/payroll.types";
export * from "./payroll/payroll.api";
export * from "./payroll/use-payroll-slice";

export * from "./leave/leave.types";
export * from "./leave/leave.api";
export * from "./leave/use-leave-slice";

export * from "./notices/notices.types";
export * from "./notices/notices.api";
export * from "./notices/use-notice-slice";

export * from "./academic/academic.types";
export * from "./academic/academic.api";
export * from "./academic/use-academic-slice";

export * from "./dashboard/dashboard.types";
export * from "./dashboard/dashboard.api";
export * from "./dashboard/use-dashboard-slice";
