export async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  return (await res.json()) as T;
}

export async function sendJson<T>(url: string, method: "POST" | "PUT" | "DELETE", body?: unknown): Promise<{ ok: boolean; data: T }> {
  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = (await res.json()) as T;
  return { ok: res.ok, data };
}
