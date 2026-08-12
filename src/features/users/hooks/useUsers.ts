import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { request, authHeader } from '../../../lib/api';
import { useAuthContext } from '../../../context/AuthContext';
import type { AdminUser, AdminUserPayload } from '../../../types/adminUser';

const usersApi = {
  getAll: (token: string) => request<AdminUser[]>('/admin/users', { headers: authHeader(token) }),
  getById: (id: number, token: string) => request<AdminUser>(`/admin/users/${id}`, { headers: authHeader(token) }),
  create: (payload: AdminUserPayload, token: string) => request<AdminUser>('/admin/users', { method: 'POST', body: JSON.stringify(payload), headers: authHeader(token) }),
  update: (id: number, payload: AdminUserPayload, token: string) => request<AdminUser>(`/admin/users/${id}`, { method: 'PUT', body: JSON.stringify(payload), headers: authHeader(token) }),
  delete: (id: number, token: string) => request<void>(`/admin/users/${id}`, { method: 'DELETE', headers: authHeader(token) }),
};

const KEY = 'admin-users';

export function useUsers() {
  const { token } = useAuthContext();
  return useQuery({
    queryKey: [KEY],
    queryFn: () => usersApi.getAll(token!),
    enabled: !!token,
  });
}

export function useCreateUser() {
  const { token } = useAuthContext();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: AdminUserPayload) => usersApi.create(payload, token!),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useUpdateUser() {
  const { token } = useAuthContext();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: AdminUserPayload }) =>
      usersApi.update(id, payload, token!),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useDeleteUser() {
  const { token } = useAuthContext();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => usersApi.delete(id, token!),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}
