"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

export interface UserSession {
  id: string;
  name: string;
  email: string;
  roles: string[];
  phone?: string;
}

export const DEMO_PERSONAS: Record<string, UserSession> = {
  ADMIN: {
    id: "00000000-0000-0000-0000-000000000001",
    name: "Dr. Rafiqul Islam",
    email: "principal@dhakamodel.edu.bd",
    roles: ["ADMIN", "PRINCIPAL", "TEACHER", "FINANCE"],
    phone: "+8801711000001",
  },
  TEACHER: {
    id: "00000000-0000-0000-0000-000000000002",
    name: "Rahim Ahmed",
    email: "rahim.physics@dhakamodel.edu.bd",
    roles: ["TEACHER"],
    phone: "+8801711000002",
  },
  FINANCE: {
    id: "00000000-0000-0000-0000-000000000003",
    name: "Kamal Hossain",
    email: "finance@dhakamodel.edu.bd",
    roles: ["FINANCE"],
    phone: "+8801711000003",
  },
  OFFICE: {
    id: "00000000-0000-0000-0000-000000000004",
    name: "Farhana Yasmin",
    email: "admissions@dhakamodel.edu.bd",
    roles: ["OFFICE"],
    phone: "+8801711000004",
  },
  PARENT: {
    id: "00000000-0000-0000-0000-000000000005",
    name: "Abul Kalam (Guardian)",
    email: "parent.kalam@gmail.com",
    roles: ["PARENT"],
    phone: "+8801711000005",
  },
  STUDENT: {
    id: "00000000-0000-0000-0000-000000000006",
    name: "Tanvir Hasan (DMC-2026-001)",
    email: "tanvir.student@dhakamodel.edu.bd",
    roles: ["STUDENT"],
    phone: "+8801711000006",
  },
};

interface AuthContextValue {
  user: UserSession | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password?: string, role?: string) => Promise<void>;
  loginWithKeycloak: () => void;
  signup: (userData: { name: string; email: string; role: string; phone?: string }) => Promise<void>;
  registerUser: (data: {
    email: string;
    password?: string;
    fullName: string;
    requestedRole: string;
    referenceNo?: string;
    phone?: string;
  }) => Promise<{ success: boolean; demoOtp?: string; message: string; email: string }>;
  verifyUserOtp: (data: { email: string; otp: string }) => Promise<any>;
  logout: () => void;
  switchPersona: (roleKey: string) => void;
  setSession: (user: UserSession, token?: string) => void;
}

const AuthContext = React.createContext<AuthContextValue | null>(null);

const STORAGE_KEY = "sms_active_user";
const TOKEN_KEY = "sms_access_token";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<UserSession | null>(DEMO_PERSONAS["ADMIN"]!);
  const [token, setToken] = React.useState<string | null>(null);
  const [mounted, setMounted] = React.useState(false);
  const router = useRouter();

  React.useEffect(() => {
    setMounted(true);
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const storedToken = localStorage.getItem(TOKEN_KEY);
      if (stored) {
        setUser(JSON.parse(stored));
      } else {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DEMO_PERSONAS["ADMIN"]!));
      }
      if (storedToken) {
        setToken(storedToken);
      }
    } catch {
      // Fallback
    }
  }, []);

  const loginWithKeycloak = React.useCallback(() => {
    const keycloakUrl = process.env.NEXT_PUBLIC_KEYCLOAK_URL || "http://localhost:8080";
    const realm = process.env.NEXT_PUBLIC_KEYCLOAK_REALM || "sms";
    const clientId = process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID || "sms-web";
    const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
    const redirectUri = encodeURIComponent(`${origin}/callback`);
    const state = encodeURIComponent(Math.random().toString(36).substring(2));

    const authUrl = `${keycloakUrl}/realms/${realm}/protocol/openid-connect/auth?client_id=${clientId}&response_type=code&scope=openid%20profile%20email&redirect_uri=${redirectUri}&state=${state}`;
    window.location.href = authUrl;
  }, []);

  const setSession = React.useCallback((newUser: UserSession, accessToken?: string) => {
    setUser(newUser);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
      if (accessToken) {
        localStorage.setItem(TOKEN_KEY, accessToken);
        setToken(accessToken);
      }
    }
  }, []);

  const login = React.useCallback(async (email: string, _password?: string, role = "ADMIN") => {
    const matched = Object.values(DEMO_PERSONAS).find(
      (p) => p.email.toLowerCase() === email.toLowerCase(),
    );

    const newUser: UserSession = matched || {
      id: Math.random().toString(36).substring(2, 10),
      name: email.split("@")[0] || "User",
      email,
      roles: [role],
    };

    setSession(newUser);
    router.push("/");
  }, [router, setSession]);

  const signup = React.useCallback(async (data: { name: string; email: string; role: string; phone?: string }) => {
    const newUser: UserSession = {
      id: Math.random().toString(36).substring(2, 10),
      name: data.name,
      email: data.email,
      roles: [data.role],
      phone: data.phone,
    };

    setSession(newUser);
    router.push("/");
  }, [router, setSession]);

  const registerUser = React.useCallback(
    async (data: {
      email: string;
      password?: string;
      fullName: string;
      requestedRole: string;
      referenceNo?: string;
      phone?: string;
    }) => {
      const res = await fetch("/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || json.message || "Failed to send verification code");
      }
      return json;
    },
    []
  );

  const verifyUserOtp = React.useCallback(
    async (data: { email: string; otp: string }) => {
      const res = await fetch("/api/v1/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || json.message || "Invalid verification code");
      }
      return json;
    },
    []
  );

  const logout = React.useCallback(() => {
    setUser(null);
    setToken(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(TOKEN_KEY);
    }
    router.push("/login");
  }, [router]);

  const switchPersona = React.useCallback((roleKey: string) => {
    const persona = DEMO_PERSONAS[roleKey] || DEMO_PERSONAS["ADMIN"]!;
    setSession(persona);
  }, [setSession]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        login,
        loginWithKeycloak,
        signup,
        registerUser,
        verifyUserOtp,
        logout,
        switchPersona,
        setSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
