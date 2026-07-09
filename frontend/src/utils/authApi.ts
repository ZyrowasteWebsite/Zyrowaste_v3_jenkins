const API_BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "";

export const AUTH_TOKEN_KEY = "zyrowaste_access_token";

export type AuthErrorBody = { detail?: unknown };

function parseErrorDetail(detail: unknown): string {
  if (detail == null) {
    return "Request failed";
  }
  if (typeof detail === "string") {
    return detail;
  }
  if (Array.isArray(detail)) {
    return detail
      .map((x) => {
        if (typeof x === "object" && x !== null && "msg" in x) {
          return String((x as { msg: string }).msg);
        }
        return typeof x === "string" ? x : JSON.stringify(x);
      })
      .join("; ");
  }
  return "Request failed";
}

export async function apiSignup(payload: {
  email: string;
  mobile: string;
  password: string;
}): Promise<{ access_token: string }> {
  const res = await fetch(`${API_BASE}/api/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const j = (await res.json().catch(() => ({}))) as AuthErrorBody;
    throw new Error(parseErrorDetail(j.detail));
  }
  return res.json() as Promise<{ access_token: string }>;
}

export async function apiLogin(payload: {
  email: string;
  password: string;
}): Promise<{ access_token: string }> {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const j = (await res.json().catch(() => ({}))) as AuthErrorBody;
    throw new Error(parseErrorDetail(j.detail));
  }
  return res.json() as Promise<{ access_token: string }>;
}

export async function apiForgotPassword(email: string): Promise<{
  message: string;
  reset_token?: string | null;
  reset_path?: string | null;
}> {
  const res = await fetch(`${API_BASE}/api/auth/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  if (!res.ok) {
    const j = (await res.json().catch(() => ({}))) as AuthErrorBody;
    throw new Error(parseErrorDetail(j.detail));
  }
  return res.json() as Promise<{
    message: string;
    reset_token?: string | null;
    reset_path?: string | null;
  }>;
}

export async function apiResetPassword(token: string, new_password: string): Promise<{ message: string }> {
  const res = await fetch(`${API_BASE}/api/auth/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, new_password }),
  });
  if (!res.ok) {
    const j = (await res.json().catch(() => ({}))) as AuthErrorBody;
    throw new Error(parseErrorDetail(j.detail));
  }
  return res.json() as Promise<{ message: string }>;
}

export function notifyAuthChanged(): void {
  window.dispatchEvent(new Event("zyrowaste-auth-changed"));
}

export function saveToken(token: string): void {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
  notifyAuthChanged();
}

export function clearToken(): void {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  notifyAuthChanged();
}

export function getStoredToken(): string | null {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}
