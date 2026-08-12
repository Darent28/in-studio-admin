import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { request, authHeader } from '../../../lib/api';
import { useAuthContext } from '../../../context/AuthContext';
import type { Membership, MembershipPayload, AdjustCreditsPayload, ChangePeriodPayload, MembershipStatus } from '../../../types/membership';

const membershipsApi = {
  getAll: (token: string) => request<Membership[]>('/admin/memberships', { headers: authHeader(token) }),
  getByUser: (userId: number, token: string) => request<Membership[]>(`/admin/memberships/user/${userId}`, { headers: authHeader(token) }),
  create: (payload: MembershipPayload, token: string) => request<Membership>('/admin/memberships', { method: 'POST', body: JSON.stringify(payload), headers: authHeader(token) }),
  adjustCredits: (id: number, payload: AdjustCreditsPayload, token: string) => request<Membership>(`/admin/memberships/${id}/credits`, { method: 'PATCH', body: JSON.stringify(payload), headers: authHeader(token) }),
  changePeriod: (id: number, payload: ChangePeriodPayload, token: string) => request<Membership>(`/admin/memberships/${id}/period`, { method: 'PATCH', body: JSON.stringify(payload), headers: authHeader(token) }),
  changeStatus: (id: number, status: MembershipStatus, token: string) => request<Membership>(`/admin/memberships/${id}/status?status=${status}`, { method: 'PATCH', headers: authHeader(token) }),
  delete: (id: number, token: string) => request<void>(`/admin/memberships/${id}`, { method: 'DELETE', headers: authHeader(token) }),
};

const KEY = 'admin-memberships';

export function useUserMemberships(userId: number | null) {
  const { token } = useAuthContext();
  return useQuery({
    queryKey: [KEY, 'user', userId],
    queryFn: () => membershipsApi.getByUser(userId!, token!),
    enabled: !!token && userId != null,
  });
}

export function useMemberships() {
  const { token } = useAuthContext();
  return useQuery({
    queryKey: [KEY],
    queryFn: () => membershipsApi.getAll(token!),
    enabled: !!token,
  });
}

export function useCreateMembership() {
  const { token } = useAuthContext();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: MembershipPayload) => membershipsApi.create(payload, token!),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useAdjustCredits() {
  const { token } = useAuthContext();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: AdjustCreditsPayload }) =>
      membershipsApi.adjustCredits(id, payload, token!),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useChangeMembershipPeriod() {
  const { token } = useAuthContext();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: ChangePeriodPayload }) =>
      membershipsApi.changePeriod(id, payload, token!),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useChangeMembershipStatus() {
  const { token } = useAuthContext();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: MembershipStatus }) =>
      membershipsApi.changeStatus(id, status, token!),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useDeleteMembership() {
  const { token } = useAuthContext();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => membershipsApi.delete(id, token!),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}
