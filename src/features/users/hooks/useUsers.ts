import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../lib/api';
import { useAuthContext } from '../../../context/AuthContext';
import type { AdminUserPayload } from '../../../types/adminUser';

const KEY = 'admin-users';

export function useUsers() {
  const { token } = useAuthContext();
  return useQuery({
    queryKey: [KEY],
    queryFn: () => api.admin.users.getAll(token!),
    enabled: !!token,
  });
}

export function useCreateUser() {
  const { token } = useAuthContext();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: AdminUserPayload) => api.admin.users.create(payload, token!),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useUpdateUser() {
  const { token } = useAuthContext();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: AdminUserPayload }) =>
      api.admin.users.update(id, payload, token!),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useDeleteUser() {
  const { token } = useAuthContext();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.admin.users.delete(id, token!),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}
