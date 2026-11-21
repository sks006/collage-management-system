export interface UserSession {
  id: string;
  name: string;
  email: string;
  roles: string[];
  phone?: string;
}

export function getCurrentUser(): UserSession {
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem("sms_active_user");
      if (stored) return JSON.parse(stored);
    } catch {
      // Fallback
    }
  }

  return {
    id: "00000000-0000-0000-0000-000000000001",
    name: "Dr. Rafiqul Islam",
    email: "principal@dhakamodel.edu.bd",
    roles: ["ADMIN", "PRINCIPAL", "TEACHER", "FINANCE"],
    phone: "+8801711000001",
  };
}
