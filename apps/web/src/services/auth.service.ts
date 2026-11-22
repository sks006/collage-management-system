import { apiClient } from "@/lib/api-client";

export interface RegisterRequest {
  email: string;
  password?: string;
  fullName: string;
  requestedRole: string;
  referenceNo?: string;
  phone?: string;
}

export interface LoginRequest {
  email: string;
  password?: string;
  requestedRole?: string;
}

export const authService = {
  login: (payload: LoginRequest) =>
    apiClient<{ user: any; accessToken: string; refreshToken: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  register: (payload: RegisterRequest) =>
    apiClient<{ success: boolean; email: string; message: string; demoOtp?: string }>(
      "/auth/register",
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
    ),

  verifyOtp: (payload: { email: string; otp: string }) =>
    apiClient<any>("/auth/verify-otp", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  resendOtp: (email: string) =>
    apiClient<{ success: boolean; message: string }>("/auth/resend-otp", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),

  me: () => apiClient<any>("/auth/me"),

  callback: (payload: { code: string; redirectUri: string; state?: string }) =>
    apiClient<{ user: any; accessToken: string; refreshToken: string }>("/auth/callback", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  listRoleRequests: (status = "PENDING") =>
    apiClient<any[]>("/auth/role-requests", { params: { status } }),

  approveRoleRequest: (id: string, roleOverride?: string) =>
    apiClient(`/auth/role-requests/${id}/approve`, {
      method: "POST",
      body: JSON.stringify({ roleOverride }),
    }),

  rejectRoleRequest: (id: string, reason?: string) =>
    apiClient(`/auth/role-requests/${id}/reject`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    }),
};
