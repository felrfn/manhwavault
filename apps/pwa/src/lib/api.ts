const API_BASE = import.meta.env.VITE_API_BASE as string;

if (!API_BASE) {
  // eslint-disable-next-line no-console
  console.warn("[API] VITE_API_BASE is not set");
}

type ApiEnvelope<T> = { success: boolean; data?: T; error?: any };

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const url = `${API_BASE.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
  const res = await fetch(url, init);
  const ct = res.headers.get("content-type") || "";
  const isJson = ct.includes("application/json");
  const payload = isJson ? await res.json() : undefined;

  if (!res.ok) {
    const msg =
      (payload && (payload.error || payload.message)) || res.statusText;
    throw new Error(typeof msg === "string" ? msg : "Request failed");
  }

  // If API uses envelope { success, data }
  if (payload && typeof payload === "object" && "success" in payload) {
    const env = payload as ApiEnvelope<T>;
    if (!env.success) throw new Error(String(env.error || "Request failed"));
    return env.data as T;
  }

  return payload as T;
}

export async function postJson<T>(
  path: string,
  body: unknown,
  headers: Record<string, string> = {}
) {
  return request<T>(path, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
}

export async function patchJson<T>(
  path: string,
  body: unknown,
  headers: Record<string, string> = {}
) {
  return request<T>(path, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
}

export async function getJson<T>(
  path: string,
  params?: Record<string, string | number | undefined>,
  headers?: Record<string, string>
) {
  const qp = params
    ? "?" +
      Object.entries(params)
        .filter(([, v]) => v !== undefined && v !== "")
        .map(
          ([k, v]) =>
            `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`
        )
        .join("&")
    : "";
  return request<T>(`${path}${qp}`, { headers });
}

// Return the entire API envelope (useful when you need meta alongside data)
export async function getJsonEnvelope<TEnvelope = unknown>(
  path: string,
  params?: Record<string, string | number | undefined>,
  headers?: Record<string, string>
) {
  const qp = params
    ? "?" +
      Object.entries(params)
        .filter(([, v]) => v !== undefined && v !== "")
        .map(
          ([k, v]) =>
            `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`
        )
        .join("&")
    : "";
  const url = `${API_BASE.replace(/\/$/, "")}/${path.replace(/^\//, "")}${qp}`;
  const res = await fetch(url, { headers });
  const ct = res.headers.get("content-type") || "";
  const isJson = ct.includes("application/json");
  const payload = isJson ? await res.json() : undefined;
  if (!res.ok) {
    const msg =
      (payload && (payload.error || payload.message)) || res.statusText;
    throw new Error(typeof msg === "string" ? msg : "Request failed");
  }
  return payload as TEnvelope;
}
