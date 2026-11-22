export class ApiError extends Error {
  public readonly status: number;
  public readonly requestId: string;
  public readonly details?: unknown;

  constructor(
    status: number,
    message: string,
    requestId: string,
    details?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.requestId = requestId;
    this.details = details;
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
    if (isDev && !skipDebugLog && !isServer) {
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
    if (isDev && !skipDebugLog && !isServer) {
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
