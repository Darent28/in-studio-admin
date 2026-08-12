import type { User } from '../types/user';

const BASE = process.env.REACT_APP_API_URL;

export interface AuthResponse {
  token: string;
  expiresAt: string;
  user: User;
}

export async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const { headers: extraHeaders, ...restOptions } = options ?? {};
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(extraHeaders ?? {}) },
    ...restOptions,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const violations: string[] | undefined = body.violations;
    const detail = violations?.length ? violations.join(', ') : (body.detail ?? body.message ?? 'Request failed');
    throw new Error(detail);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export async function requestBlob(path: string, options?: RequestInit): Promise<Blob> {
  const { headers: extraHeaders, ...restOptions } = options ?? {};
  const res = await fetch(`${BASE}${path}`, { headers: extraHeaders ?? {}, ...restOptions });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail ?? body.message ?? 'Request failed');
  }
  return res.blob();
}

export function authHeader(token: string) {
  return { Authorization: `Bearer ${token}` };
}

export const api = {
  auth: {
    login: (email: string, password: string) =>
      request<AuthResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),
  },
};
