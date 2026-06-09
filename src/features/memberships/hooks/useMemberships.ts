import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../lib/api';
import { useAuthContext } from '../../../context/AuthContext';
import type { MembershipPayload, AdjustCreditsPayload, ChangePeriodPayload, MembershipStatus } from '../../../types/membership';

const KEY = 'admin-memberships';

export function useMemberships() {
  const { token } = useAuthContext();
  return useQuery({
    queryKey: [KEY],
    queryFn: () => api.admin.memberships.getAll(token!),
    enabled: !!token,
  });
}

export function useCreateMembership() {
  const { token } = useAuthContext();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: MembershipPayload) => api.admin.memberships.create(payload, token!),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useAdjustCredits() {
  const { token } = useAuthContext();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: AdjustCreditsPayload }) =>
      api.admin.memberships.adjustCredits(id, payload, token!),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useChangeMembershipPeriod() {
  const { token } = useAuthContext();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: ChangePeriodPayload }) =>
      api.admin.memberships.changePeriod(id, payload, token!),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useChangeMembershipStatus() {
  const { token } = useAuthContext();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: MembershipStatus }) =>
      api.admin.memberships.changeStatus(id, status, token!),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useDeleteMembership() {
  const { token } = useAuthContext();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.admin.memberships.delete(id, token!),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}
