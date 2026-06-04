import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../lib/api';
import { useAuthContext } from '../../../context/AuthContext';
import type { PlanPayload } from '../../../types/plan';

const KEY = 'admin-plans';

export function usePlans() {
  const { token } = useAuthContext();
  return useQuery({ queryKey: [KEY], queryFn: () => api.admin.plans.getAll(token!), enabled: !!token });
}

export function useCreatePlan() {
  const { token } = useAuthContext();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: PlanPayload) => api.admin.plans.create(payload, token!),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useUpdatePlan() {
  const { token } = useAuthContext();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: PlanPayload }) => api.admin.plans.update(id, payload, token!),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useDeletePlan() {
  const { token } = useAuthContext();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.admin.plans.delete(id, token!),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}
