"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/services/auth.service";

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
  isLoading: boolean;
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
  resendOtp: (email: string) => Promise<any>;
  logout: () => void;
  switchPersona: (roleKey: string) => void;
  setSession: (user: UserSession, token?: string) => void;
}

const AuthContext = React.createContext<AuthContextValue | null>(null);

const STORAGE_KEY = "sms_active_user";
const TOKEN_KEY = "sms_access_token";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Initialize user to NULL strictly as required by specification
  const [user, setUser] = React.useState<UserSession | null>(null);
  const [token, setToken] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const router = useRouter();

  const setSession = React.useCallback((newUser: UserSession | null, accessToken?: string | null) => {
    setUser(newUser);
    if (typeof window !== "undefined") {
      if (newUser) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
      if (accessToken) {
        localStorage.setItem(TOKEN_KEY, accessToken);
        setToken(accessToken);
      } else if (accessToken === null) {
        localStorage.removeItem(TOKEN_KEY);
        setToken(null);
      }
    }
  }, []);

  // Hydrate user session from stored token & verify with live backend GET /api/v1/auth/me
  React.useEffect(() => {
    let isCancelled = false;

    async function hydrate() {
      try {
        const storedToken = typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null;
        const storedUser = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;

        if (storedToken) {
          setToken(storedToken);
          // Verify with live backend via single gateway
          try {
            const data = await authService.me();
            if (!isCancelled && data) {
              const u = data.user || data;
              const liveUser: UserSession = {
                id: u.id || u.sub || "user",
                name: u.name || data.profile?.nameEn || u.email?.split("@")[0] || "User",
                email: u.email || data.profile?.email || "",
                roles: u.roles || (data.profile?.role ? [data.profile.role] : ["USER"]),
                phone: data.profile?.phone,
              };
              setUser(liveUser);
              localStorage.setItem(STORAGE_KEY, JSON.stringify(liveUser));
            }
          } catch {
            // Stored token is invalid or expired
            if (!isCancelled) {
              setUser(null);
              setToken(null);
              localStorage.removeItem(STORAGE_KEY);
              localStorage.removeItem(TOKEN_KEY);
            }
          }
        } else if (storedUser) {
          try {
            const parsed = JSON.parse(storedUser);
            if (!isCancelled) setUser(parsed);
          } catch {}
        }
      } catch (err) {
        // Network or parse issue
      } finally {
        if (!isCancelled) setIsLoading(false);
      }
    }

    hydrate();

    return () => {
      isCancelled = true;
    };
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

  const login = React.useCallback(
    async (email: string, password?: string, role = "ADMIN") => {
      const json = await authService.login({ email, password, requestedRole: role });

      if (json.user && json.accessToken) {
        setSession(json.user, json.accessToken);
        router.push("/");
        return;
      }

      if (json.accessToken) {
        const fallbackUser: UserSession = {
          id: `usr-${Buffer.from(email).toString("base64").substring(0, 8)}`,
          email,
          name: email.split("@")[0],
          roles: [role],
        };
        setSession(fallbackUser, json.accessToken);
        router.push("/");
      }
    },
    [router, setSession],
  );

  const signup = React.useCallback(
    async (data: { name: string; email: string; role: string; phone?: string }) => {
      const newUser: UserSession = {
        id: Math.random().toString(36).substring(2, 10),
        name: data.name,
        email: data.email,
        roles: [data.role],
        phone: data.phone,
      };

      setSession(newUser);
      router.push("/");
    },
    [router, setSession],
  );

  const registerUser = React.useCallback(
    async (data: {
      email: string;
      password?: string;
      fullName: string;
      requestedRole: string;
      referenceNo?: string;
      phone?: string;
    }) => {
      return authService.register(data);
    },
    [],
  );

  const verifyUserOtp = React.useCallback(
    async (data: { email: string; otp: string }) => {
      const json = await authService.verifyOtp(data);
      if (json.tokens?.accessToken && json.user) {
        setSession(json.user, json.tokens.accessToken);
      }
      return json;
    },
    [setSession],
  );

  const resendOtp = React.useCallback(async (email: string) => {
    return authService.resendOtp(email);
  }, []);

  const logout = React.useCallback(() => {
    setUser(null);
    setToken(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(TOKEN_KEY);
    }
    router.push("/login");
  }, [router]);

  const switchPersona = React.useCallback(
    (roleKey: string) => {
      const persona = DEMO_PERSONAS[roleKey];
      if (persona) {
        setSession(persona, `jwt-demo-${roleKey.toLowerCase()}`);
      }
    },
    [setSession],
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        loginWithKeycloak,
        signup,
        registerUser,
        verifyUserOtp,
        resendOtp,
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
