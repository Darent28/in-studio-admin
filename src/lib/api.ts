import type { User } from '../types/user';
import type { AdminUser, AdminUserPayload } from '../types/adminUser';
import type { Room, RoomPayload } from '../types/room';
import type { Plan, PlanPayload } from '../types/plan';
import type { ClassSession, ClassSessionPayload } from '../types/classSession';
import type { Instructor } from '../types/instructor';

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
    const violations: string[] | undefined = body.violations;
    const detail = violations?.length ? violations.join(', ') : (body.detail ?? body.message ?? 'Request failed');
    throw new Error(detail);
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

    rooms: {
      getAll:  (token: string) => request<Room[]>('/admin/rooms', { headers: authHeader(token) }),
      create:  (payload: RoomPayload, token: string) => request<Room>('/admin/rooms', { method: 'POST', body: JSON.stringify(payload), headers: authHeader(token) }),
      update:  (id: number, payload: RoomPayload, token: string) => request<Room>(`/admin/rooms/${id}`, { method: 'PUT', body: JSON.stringify(payload), headers: authHeader(token) }),
      delete:  (id: number, token: string) => request<void>(`/admin/rooms/${id}`, { method: 'DELETE', headers: authHeader(token) }),
    },

    plans: {
      getAll:  (token: string) => request<Plan[]>('/admin/plans', { headers: authHeader(token) }),
      create:  (payload: PlanPayload, token: string) => request<Plan>('/admin/plans', { method: 'POST', body: JSON.stringify(payload), headers: authHeader(token) }),
      update:  (id: number, payload: PlanPayload, token: string) => request<Plan>(`/admin/plans/${id}`, { method: 'PUT', body: JSON.stringify(payload), headers: authHeader(token) }),
      delete:  (id: number, token: string) => request<void>(`/admin/plans/${id}`, { method: 'DELETE', headers: authHeader(token) }),
    },

    instructors: {
      getAll: (token: string) => request<Instructor[]>('/admin/instructors', { headers: authHeader(token) }),
    },

    sessions: {
      getAll:  (token: string) => request<ClassSession[]>('/admin/sessions', { headers: authHeader(token) }),
      create:  (payload: ClassSessionPayload, token: string) => request<ClassSession>('/admin/sessions', { method: 'POST', body: JSON.stringify(payload), headers: authHeader(token) }),
      update:  (id: number, payload: ClassSessionPayload, token: string) => request<ClassSession>(`/admin/sessions/${id}`, { method: 'PUT', body: JSON.stringify(payload), headers: authHeader(token) }),
      delete:  (id: number, token: string) => request<void>(`/admin/sessions/${id}`, { method: 'DELETE', headers: authHeader(token) }),
    },
  },
};
