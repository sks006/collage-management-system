# Specification: Frontend Single-Gateway API & Debugging Architecture

> **Target Audience:** AI Coding Agent & Frontend Contributors  
> **Repository:** `collage-management-system` (`apps/web` — Next.js 15 App Router + React 19 + TanStack Query)  
> **Related Docs:**  
> - `docs/agent_implementation_roadmap.md`  
> - `docs/authentication_and_authorization_specification.md`  
> - `apps/api/src/shared/middleware/request-id.middleware.ts`  
> - `apps/api/src/shared/interceptors/response.interceptor.ts`  
> - `apps/api/src/shared/interceptors/error.interceptor.ts`

---

## 1. Architectural Overview & Objectives

To make frontend-to-backend communication easy to debug, maintain, and secure across `apps/web`, **every HTTP request to `apps/api` must pass through a single client gateway (`apps/web/src/lib/api-client.ts`) and a single server-side BFF proxy (`apps/web/src/app/api/v1/[...slug]/route.ts`)**.

### Core Rules
1. **Zero Raw `fetch()` or `axios` in Pages/Components:** UI pages (`app/(dashboard)/*`, `app/(auth)/*`), React Contexts (`auth-context.tsx`), and Server Actions (`actions/*.ts`) must never call `fetch()` or hardcode `/api/v1/...` URLs directly.
2. **Typed Domain Services (`src/services/*.service.ts`):** Every backend module gets a dedicated service file exposing typed methods that delegate exclusively to `apiClient<T>()`.
3. **End-to-End Request Tracing (`X-Request-ID`):** `api-client.ts` generates a unique `X-Request-ID` UUID per request, forwards it through the Next.js BFF proxy into NestJS (`RequestIdMiddleware`), and logs method, path, HTTP status, latency (`ms`), and payload in development mode.
4. **Centralized Envelope & Error Normalization:** `api-client.ts` automatically unwraps NestJS `ResponseInterceptor` (`{ data: ... }`) envelopes and converts RFC 7807 / NestJS error responses into a typed `ApiError` class.

### Request Flow Diagram

```text
┌─────────────────────────────────────────────────────────────────────────┐
│  1. UI Layer: Pages & Components (app/(dashboard)/*, app/(auth)/*)      │
│     • Uses TanStack Query (useQuery / useMutation) & Domain Services    │
│     • ZERO direct fetch(), axios, or raw "/api/v1/..." strings          │
└───────────────────────────────────┬─────────────────────────────────────┘
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  2. Domain Service Layer (apps/web/src/services/*.service.ts)           │
│     • auth.service.ts, student.service.ts, staff.service.ts, etc.       │
│     • Typed request DTOs & response interfaces from @sms/shared         │
└───────────────────────────────────┬─────────────────────────────────────┘
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  3. SINGLE GATEWAY FILE: apps/web/src/lib/api-client.ts                 │
│     • Injects X-Request-ID & Authorization Bearer token (SSR + Client)  │
│     • Prints collapsible debug logs (status, duration, payload) in dev  │
│     • Unwraps { data } envelopes & throws normalized ApiError           │
└───────────────────────────────────┬─────────────────────────────────────┘
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  4. Server-Side BFF Proxy: apps/web/src/app/api/v1/[...slug]/route.ts   │
│     • Bridges HttpOnly session cookies to Authorization Bearer header   │
│     • Proxies GET/POST/PUT/PATCH/DELETE to NestJS (:4000) with trace ID │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Target Directory Structure (`apps/web/src/`)

```text
apps/web/src/
├── lib/
│   ├── api-client.ts              # <-- SINGLE CLIENT GATEWAY (every request passes here)
│   ├── auth-context.tsx           # Calls authService (no raw fetch)
│   ├── auth.ts                    # Token / session helpers
│   └── utils.ts
├── services/                      # <-- TYPED DOMAIN SERVICES (one per NestJS module)
│   ├── index.ts
│   ├── auth.service.ts
│   ├── academic.service.ts
│   ├── student.service.ts
│   ├── staff.service.ts
│   ├── attendance.service.ts
│   ├── leave.service.ts
│   ├── finance.service.ts
│   ├── payroll.service.ts
│   └── notice.service.ts
├── actions/                       # Next.js Server Actions (call services / apiClient)
│   ├── attendance.actions.ts
│   ├── leave.actions.ts
│   └── payment.actions.ts
└── app/
    └── api/v1/[...slug]/
        └── route.ts               # <-- SINGLE SERVER-SIDE BFF PROXY to NestJS
```

---

## 3. Tier 1: Single Application Gateway (`apps/web/src/lib/api-client.ts`)

Replace `apps/web/src/lib/api-client.ts` with the following implementation. It works identically in **Browser Client Components**, **Next.js Server Components**, and **Server Actions**:

```ts
// apps/web/src/lib/api-client.ts
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly message: string,
    public readonly requestId: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export interface ApiRequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined | null>;
  skipDebugLog?: boolean;
  /** Optional explicit token override (useful in Server Actions) */
  token?: string | null;
}

const isServer = typeof window === "undefined";
const isDev = process.env.NODE_ENV !== "production";

async function resolveAuthToken(explicitToken?: string | null): Promise<string | null> {
  if (explicitToken !== undefined) return explicitToken;

  if (!isServer) {
    return typeof window !== "undefined" ? localStorage.getItem("sms_access_token") : null;
  }

  // Automatically read HttpOnly session cookie during SSR / Server Actions
  try {
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    return cookieStore.get("sms_access_token")?.value ?? null;
  } catch {
    return null;
  }
}

function generateRequestId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `req-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export async function apiClient<T>(
  endpoint: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const {
    params,
    skipDebugLog,
    token: explicitToken,
    headers: customHeaders,
    ...fetchOptions
  } = options;

  // 1. Build target URL:
  //    - Server-side calls hit NestJS directly (process.env.API_URL)
  //    - Browser calls hit Next.js BFF proxy (/api/v1/*)
  const serverBase = process.env["API_URL"] || "http://localhost:4000";
  const normalizedPath = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const url = isServer
    ? new URL(`${serverBase}/api/v1${normalizedPath}`)
    : new URL(`/api/v1${normalizedPath}`, window.location.origin);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.set(key, String(value));
      }
    });
  }

  // 2. Attach correlation ID & auth headers
  const requestId = generateRequestId();
  const token = await resolveAuthToken(explicitToken);
  const method = (fetchOptions.method || "GET").toUpperCase();
  const startTime = performance.now();

  const headers: Record<string, string> = {
    ...(fetchOptions.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
    "X-Request-ID": requestId,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(customHeaders as Record<string, string>),
  };

  try {
    const response = await fetch(url.toString(), {
      ...fetchOptions,
      headers,
      credentials: "include",
    });

    const durationMs = Math.round(performance.now() - startTime);
    const serverRequestId = response.headers.get("X-Request-Id") || requestId;

    // Handle 204 No Content cleanly
    const rawText = await response.text();
    let rawBody: any = null;
    if (rawText) {
      try {
        rawBody = JSON.parse(rawText);
      } catch {
        rawBody = rawText;
      }
    }

    // 3. Centralized Development Debug Logger
    if (isDev && !skipDebugLog) {
      const badge = response.ok ? "✅" : "❌";
      console.groupCollapsed(
        `${badge} [API] ${method} ${normalizedPath} → ${response.status} (${durationMs}ms) [${serverRequestId}]`,
      );
      if (params) console.log("Query Params:", params);
      if (fetchOptions.body && typeof fetchOptions.body === "string") {
        try {
          console.log("Request Body:", JSON.parse(fetchOptions.body));
        } catch {
          console.log("Request Body:", fetchOptions.body);
        }
      }
      console.log("Response Payload:", rawBody);
      console.groupEnd();
    }

    // 4. Unified Error Handling
    if (!response.ok) {
      const errorMessage =
        (typeof rawBody === "object" && (rawBody?.detail || rawBody?.message || rawBody?.error)) ||
        `HTTP ${response.status}: ${response.statusText}`;

      if (response.status === 401 && !isServer && !normalizedPath.startsWith("/auth/")) {
        localStorage.removeItem("sms_access_token");
        localStorage.removeItem("sms_refresh_token");
        window.location.href = "/login";
      }

      throw new ApiError(response.status, String(errorMessage), serverRequestId, rawBody);
    }

    // 5. Unwrap NestJS ResponseInterceptor { data: ... } envelope
    if (rawBody && typeof rawBody === "object" && "data" in rawBody && Object.keys(rawBody).length <= 3) {
      return rawBody.data as T;
    }

    return rawBody as T;
  } catch (error) {
    if (error instanceof ApiError) throw error;

    const durationMs = Math.round(performance.now() - startTime);
    if (isDev && !skipDebugLog) {
      console.error(
        `🔥 [API NETWORK ERROR] ${method} ${normalizedPath} (${durationMs}ms) [${requestId}]`,
        error,
      );
    }

    throw new ApiError(
      0,
      "Backend API unreachable. Ensure apps/api is running on port 4000.",
      requestId,
      error,
    );
  }
}
```

---

## 4. Tier 2: Server-Side BFF Proxy (`apps/web/src/app/api/v1/[...slug]/route.ts`)

Update `apps/web/src/app/api/v1/[...slug]/route.ts` so all HTTP verbs (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`) forward cleanly to NestJS with `X-Request-ID` propagation, cookie-to-Bearer bridging, and **zero mock fallbacks**:

```ts
// apps/web/src/app/api/v1/[...slug]/route.ts
import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.API_URL || "http://localhost:4000";

async function proxyToBackend(request: NextRequest, slug: string[]) {
  const path = slug.join("/");
  const search = request.nextUrl.search;
  const targetUrl = `${BACKEND_URL}/api/v1/${path}${search}`;
  const requestId = request.headers.get("x-request-id") || crypto.randomUUID();
  const start = Date.now();

  const headers = new Headers();
  const incomingContentType = request.headers.get("content-type");
  if (incomingContentType) {
    headers.set("Content-Type", incomingContentType);
  }
  headers.set("X-Request-ID", requestId);

  // Forward explicit Bearer header OR promote HttpOnly session cookie
  const authHeader = request.headers.get("authorization");
  const cookieToken = request.cookies.get("sms_access_token")?.value;
  if (authHeader) {
    headers.set("Authorization", authHeader);
  } else if (cookieToken) {
    headers.set("Authorization", `Bearer ${cookieToken}`);
  }

  const hasBody = !["GET", "HEAD"].includes(request.method);
  const body = hasBody ? await request.arrayBuffer() : undefined;

  try {
    const upstream = await fetch(targetUrl, {
      method: request.method,
      headers,
      body,
      signal: AbortSignal.timeout(10000),
    });

    const duration = Date.now() - start;
    if (process.env.NODE_ENV !== "production") {
      console.log(
        `[BFF] ${request.method} /api/v1/${path} → ${upstream.status} (${duration}ms) [${requestId}]`,
      );
    }

    const responseBuffer = await upstream.arrayBuffer();
    return new NextResponse(responseBuffer, {
      status: upstream.status,
      headers: {
        "Content-Type": upstream.headers.get("content-type") || "application/json",
        "X-Request-Id": upstream.headers.get("X-Request-Id") || requestId,
      },
    });
  } catch (err: any) {
    console.error(`[BFF ERROR] ${request.method} /api/v1/${path} [${requestId}]:`, err?.message);
    return NextResponse.json(
      {
        statusCode: 502,
        message: "Upstream NestJS API unreachable",
        detail: err?.message || "Connection refused or timed out",
        requestId,
      },
      { status: 502 },
    );
  }
}

type RouteContext = { params: Promise<{ slug: string[] }> };

export async function GET(req: NextRequest, ctx: RouteContext) {
  return proxyToBackend(req, (await ctx.params).slug);
}
export async function POST(req: NextRequest, ctx: RouteContext) {
  return proxyToBackend(req, (await ctx.params).slug);
}
export async function PUT(req: NextRequest, ctx: RouteContext) {
  return proxyToBackend(req, (await ctx.params).slug);
}
export async function PATCH(req: NextRequest, ctx: RouteContext) {
  return proxyToBackend(req, (await ctx.params).slug);
}
export async function DELETE(req: NextRequest, ctx: RouteContext) {
  return proxyToBackend(req, (await ctx.params).slug);
}
```

---

## 5. Tier 3: Domain Service Layer (`apps/web/src/services/`)

Create a `services/` folder under `apps/web/src/` with typed service modules for each backend domain. Every service imports only `apiClient` from `@/lib/api-client` and types from `@sms/shared`.

### 5.1 Example: `apps/web/src/services/auth.service.ts`

```ts
// apps/web/src/services/auth.service.ts
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
```

### 5.2 Remaining Domain Services to Create (`apps/web/src/services/`)

Create matching service modules for all remaining NestJS controllers:
* `academic.service.ts` → `/academic/years`, `/academic/terms`, `/academic/classes`, `/academic/sections`, `/academic/subjects`
* `student.service.ts` → `/people/students`, `/people/students/:id`
* `staff.service.ts` → `/people/staff`, `/people/staff/:id`
* `attendance.service.ts` → `/attendance`, `/attendance/batch`, `/attendance/period-close`
* `leave.service.ts` → `/leave`, `/leave/:id/approve`, `/leave/:id/reject`
* `finance.service.ts` → `/finance/invoices`, `/finance/payments`, `/finance/ledger`
* `payroll.service.ts` → `/payroll/runs`, `/payroll/runs/:id/approve`, `/payroll/runs/:id/dispatch`
* `notice.service.ts` → `/notices`, `/notices/search`
* `index.ts` → Re-exports all services (`export * from "./auth.service"`, etc.)

---

## 6. Refactoring Checklist for Existing Files

The coding agent must audit and refactor the following existing files so **100% of backend calls** flow through `apiClient`:

1. **`apps/web/src/lib/auth-context.tsx`:**
   * Remove all direct `fetch("/api/v1/auth/...")` calls and replace them with `authService.login()`, `authService.register()`, `authService.verifyOtp()`, and `authService.resendOtp()`.
2. **`apps/web/src/app/(dashboard)/page.tsx`:**
   * Replace direct `fetch("/api/v1/auth/role-requests...")` calls with `authService.listRoleRequests()`, `authService.approveRoleRequest()`, and `authService.rejectRoleRequest()`.
3. **All Dashboard Pages (`apps/web/src/app/(dashboard)/*/page.tsx`):**
   * Ensure `academic`, `students`, `staff`, `attendance`, `attendance/period-close`, `leave`, `finance`, `payroll`, and `notices` call their respective `src/services/*.service.ts` functions (via TanStack Query `useQuery` / `useMutation`) rather than raw `fetch()`.
4. **Server Actions (`apps/web/src/actions/*.actions.ts`):**
   * Ensure `attendance.actions.ts`, `leave.actions.ts`, and `payment.actions.ts` invoke `apiClient` or the domain services so SSR/Server Action requests also carry `X-Request-ID` and `Authorization` headers.

---

## 7. Debugging & Verification Guide

### 7.1 End-to-End Request Tracing
When debugging any API failure:
1. Open Browser DevTools Console and expand the collapsed group:
   `❌ [API] POST /auth/register → 400 (42ms) [8f4a2c10-...]`
2. Copy the UUID in brackets (`8f4a2c10-...`).
3. Match that exact `X-Request-ID` in:
   * **Next.js BFF logs:** `[BFF] POST /api/v1/auth/register → 400 (45ms) [8f4a2c10-...]`
   * **NestJS API logs:** `RequestIdMiddleware` structured JSON log entry
   * **PostgreSQL Audit table:** `SELECT * FROM audit.log WHERE request_id = '8f4a2c10-...';`

### 7.2 Agent Completion Verification
Before marking this task complete, run:
* **Raw `fetch` Audit:** Search `apps/web/src/app` and `apps/web/src/lib/auth-context.tsx` to verify zero remaining `fetch("/api/` calls outside `api-client.ts` and `app/api/v1/[...slug]/route.ts`.
* **Build Check:** Run `pnpm --filter @sms/web build` and verify zero TypeScript or Next.js compilation errors.