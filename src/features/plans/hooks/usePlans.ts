import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { request, authHeader } from '../../../lib/api';
import { useAuthContext } from '../../../context/AuthContext';
import type { Plan, PlanPayload } from '../../../types/plan';

const plansApi = {
  getAll: (token: string) => request<Plan[]>('/admin/plans', { headers: authHeader(token) }),
  create: (payload: PlanPayload, token: string) => request<Plan>('/admin/plans', { method: 'POST', body: JSON.stringify(payload), headers: authHeader(token) }),
  update: (id: number, payload: PlanPayload, token: string) => request<Plan>(`/admin/plans/${id}`, { method: 'PUT', body: JSON.stringify(payload), headers: authHeader(token) }),
  delete: (id: number, token: string) => request<void>(`/admin/plans/${id}`, { method: 'DELETE', headers: authHeader(token) }),
};

const KEY = 'admin-plans';

export function usePlans() {
  const { token } = useAuthContext();
  return useQuery({ queryKey: [KEY], queryFn: () => plansApi.getAll(token!), enabled: !!token });
}

export function useCreatePlan() {
  const { token } = useAuthContext();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: PlanPayload) => plansApi.create(payload, token!),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useUpdatePlan() {
  const { token } = useAuthContext();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: PlanPayload }) => plansApi.update(id, payload, token!),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useDeletePlan() {
  const { token } = useAuthContext();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => plansApi.delete(id, token!),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}
