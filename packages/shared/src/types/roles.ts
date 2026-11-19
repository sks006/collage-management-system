export const ROLES = [
  "ADMIN",
  "PRINCIPAL",
  "TEACHER",
  "OFFICE",
  "FINANCE",
  "STUDENT",
  "PARENT",
] as const;

export type Role = typeof ROLES[number];
