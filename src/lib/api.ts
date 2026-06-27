import type { User } from '../types/user';
import type { AdminUser, AdminUserPayload } from '../types/adminUser';
import type { Room, RoomPayload } from '../types/room';
import type { Plan, PlanPayload } from '../types/plan';
import type { ClassSession, ClassSessionPayload } from '../types/classSession';
import type { Instructor, InstructorPayload, InstructorUpdatePayload, UserSearchResult } from '../types/instructor';
import type { Membership, MembershipPayload, AdjustCreditsPayload, ChangePeriodPayload, MembershipStatus } from '../types/membership';
import type { Payment, PaymentPayload } from '../types/payment';
import type { Offer, OfferPayload } from '../types/offer';
import type { SessionSchedule } from '../types/sessionSchedule';
import type { Dashboard } from '../types/dashboard';

const BASE = process.env.REACT_APP_API_URL ?? '/api';

export interface AuthResponse {
  token: string;
  expiresAt: string;
  user: User;
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
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
      getAll:      (token: string) => request<Instructor[]>('/admin/instructors', { headers: authHeader(token) }),
      create:      (payload: InstructorPayload, token: string) => request<Instructor>('/admin/instructors', { method: 'POST', body: JSON.stringify(payload), headers: authHeader(token) }),
      update:      (id: number, payload: InstructorUpdatePayload, token: string) => request<Instructor>(`/admin/instructors/${id}`, { method: 'PUT', body: JSON.stringify(payload), headers: authHeader(token) }),
      delete:      (id: number, token: string) => request<void>(`/admin/instructors/${id}`, { method: 'DELETE', headers: authHeader(token) }),
      searchUsers: (q: string, token: string) => request<UserSearchResult[]>(`/admin/instructors/user-search?q=${encodeURIComponent(q)}`, { headers: authHeader(token) }),
    },

    memberships: {
      getAll:        (token: string) => request<Membership[]>('/admin/memberships', { headers: authHeader(token) }),
      getByUser:     (userId: number, token: string) => request<Membership[]>(`/admin/memberships/user/${userId}`, { headers: authHeader(token) }),
      create:        (payload: MembershipPayload, token: string) => request<Membership>('/admin/memberships', { method: 'POST', body: JSON.stringify(payload), headers: authHeader(token) }),
      adjustCredits: (id: number, payload: AdjustCreditsPayload, token: string) => request<Membership>(`/admin/memberships/${id}/credits`, { method: 'PATCH', body: JSON.stringify(payload), headers: authHeader(token) }),
      changePeriod:  (id: number, payload: ChangePeriodPayload, token: string) => request<Membership>(`/admin/memberships/${id}/period`, { method: 'PATCH', body: JSON.stringify(payload), headers: authHeader(token) }),
      changeStatus:  (id: number, status: MembershipStatus, token: string) => request<Membership>(`/admin/memberships/${id}/status?status=${status}`, { method: 'PATCH', headers: authHeader(token) }),
      delete:        (id: number, token: string) => request<void>(`/admin/memberships/${id}`, { method: 'DELETE', headers: authHeader(token) }),
    },

    sessions: {
      getAll:      (token: string) => request<ClassSession[]>('/admin/sessions', { headers: authHeader(token) }),
      create:      (payload: ClassSessionPayload, token: string) => request<ClassSession>('/admin/sessions', { method: 'POST', body: JSON.stringify(payload), headers: authHeader(token) }),
      update:      (id: number, payload: ClassSessionPayload, token: string) => request<ClassSession>(`/admin/sessions/${id}`, { method: 'PUT', body: JSON.stringify(payload), headers: authHeader(token) }),
      delete:      (id: number, token: string) => request<void>(`/admin/sessions/${id}`, { method: 'DELETE', headers: authHeader(token) }),
      getSchedule: (date: string, token: string) => request<SessionSchedule[]>(`/admin/sessions/schedule?date=${date}`, { headers: authHeader(token) }),
    },

    payments: {
      getAll:   (token: string) => request<Payment[]>('/admin/payments', { headers: authHeader(token) }),
      create:   (payload: PaymentPayload, token: string) => request<Payment>('/admin/payments', { method: 'POST', body: JSON.stringify(payload), headers: authHeader(token) }),
      confirm:  (id: number, token: string) => request<Payment>(`/admin/payments/${id}/confirm`, { method: 'PATCH', headers: authHeader(token) }),
    },

    offers: {
      getAll:  (token: string, planId?: number) => request<Offer[]>(`/admin/offers${planId ? `?planId=${planId}` : ''}`, { headers: authHeader(token) }),
      create:  (payload: OfferPayload, token: string) => request<Offer>('/admin/offers', { method: 'POST', body: JSON.stringify(payload), headers: authHeader(token) }),
      update:  (id: number, payload: OfferPayload, token: string) => request<Offer>(`/admin/offers/${id}`, { method: 'PUT', body: JSON.stringify(payload), headers: authHeader(token) }),
      delete:  (id: number, token: string) => request<void>(`/admin/offers/${id}`, { method: 'DELETE', headers: authHeader(token) }),
    },

    dashboard: {
      get: (token: string) => request<Dashboard>('/admin/dashboard', { headers: authHeader(token) }),
    },
  },
};
