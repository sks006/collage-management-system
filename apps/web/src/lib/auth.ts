export interface UserSession {
  id: string;
  name: string;
  email: string;
  roles: string[];
  phone?: string;
}

export function getCurrentUser(): UserSession | null {
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem("sms_active_user");
      if (stored) return JSON.parse(stored);
    } catch {
      // Ignored
    }
  }

  return null;
}
