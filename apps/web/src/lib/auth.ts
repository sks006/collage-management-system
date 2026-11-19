export interface UserSession {
  id: string;
  name: string;
  email: string;
  roles: string[];
}

export function getCurrentUser(): UserSession {
  return {
    id: "00000000-0000-0000-0000-000000000001",
    name: "Dr. Rafiqul Islam",
    email: "principal@school.edu.bd",
    roles: ["ADMIN", "PRINCIPAL", "TEACHER", "FINANCE"],
  };
}
