export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const baseUrl = typeof window === "undefined"
    ? process.env.API_URL || "http://localhost:4000"
    : "";

  const url = `${baseUrl}/api/v1${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    credentials: "include",
  });

  if (!res.ok) {
    const errorJson = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(errorJson.detail || `Request failed with status ${res.status}`);
  }

  const json = await res.json();
  return json.data !== undefined ? json.data : json;
}
