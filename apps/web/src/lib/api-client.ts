export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const baseUrl =
    typeof window === "undefined"
      ? process.env["API_URL"] || "http://localhost:4000"
      : "";

  const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const url = `${baseUrl}/api/v1${path}`;

  let token: string | null = null;
  if (typeof window !== "undefined") {
    token = localStorage.getItem("sms_access_token");
  }

  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
    credentials: "include",
  });

  if (!res.ok) {
    const errorJson = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(errorJson.detail || errorJson.message || `Request failed with status ${res.status}`);
  }

  const json = await res.json();
  return json.data !== undefined ? json.data : json;
}
