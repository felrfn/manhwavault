import { api } from "./client";

export async function loginRequest(
  username: string,
  password: string,
): Promise<{ token: string }> {
  const res = await api.post("/auth/login", { username, password });
  return res.data.data;
}

export async function registerRequest(
  username: string,
  password: string,
  displayName?: string,
) {
  const res = await api.post("/auth/register", {
    username,
    password,
    displayName,
  });
  return res.data.data;
}

export async function fetchMe(token: string) {
  const res = await api.get("/auth/me", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data.data;
}
