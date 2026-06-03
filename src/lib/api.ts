import type { User } from '../types/user';
import type { AdminUser, AdminUserPayload } from '../types/adminUser';

const BASE = process.env.REACT_APP_API_URL ?? '/api';

export interface AuthResponse {
  token: string;
  expiresAt: string;
  user: User;
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const { headers: extraHeaders, ...restOptions } = options ?? {};
  console.log('[api]', options?.method ?? 'GET', `${BASE}${path}`);
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(extraHeaders ?? {}) },
    ...restOptions,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail ?? body.message ?? 'Request failed');
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

function authHeader(token: string) {
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

  admin: {
    users: {
      getAll: (token: string) =>
        request<AdminUser[]>('/admin/users', { headers: authHeader(token) }),

      getById: (id: number, token: string) =>
        request<AdminUser>(`/admin/users/${id}`, { headers: authHeader(token) }),

      create: (payload: AdminUserPayload, token: string) =>
        request<AdminUser>('/admin/users', {
          method: 'POST',
          body: JSON.stringify(payload),
          headers: authHeader(token),
        }),

      update: (id: number, payload: AdminUserPayload, token: string) =>
        request<AdminUser>(`/admin/users/${id}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
          headers: authHeader(token),
        }),

      delete: (id: number, token: string) =>
        request<void>(`/admin/users/${id}`, {
          method: 'DELETE',
          headers: authHeader(token),
        }),
    },
  },
};
