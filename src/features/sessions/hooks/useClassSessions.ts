import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { request, authHeader } from '../../../lib/api';
import { useAuthContext } from '../../../context/AuthContext';
import type { ClassSession, ClassSessionPayload } from '../../../types/classSession';

const sessionsApi = {
  getAll: (token: string) => request<ClassSession[]>('/admin/sessions', { headers: authHeader(token) }),
  create: (payload: ClassSessionPayload, token: string) => request<ClassSession>('/admin/sessions', { method: 'POST', body: JSON.stringify(payload), headers: authHeader(token) }),
  update: (id: number, payload: ClassSessionPayload, token: string) => request<ClassSession>(`/admin/sessions/${id}`, { method: 'PUT', body: JSON.stringify(payload), headers: authHeader(token) }),
  delete: (id: number, token: string) => request<void>(`/admin/sessions/${id}`, { method: 'DELETE', headers: authHeader(token) }),
};

const KEY = 'admin-sessions';

export function useClassSessions() {
  const { token } = useAuthContext();
  return useQuery({ queryKey: [KEY], queryFn: () => sessionsApi.getAll(token!), enabled: !!token });
}

export function useCreateSession() {
  const { token } = useAuthContext();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: ClassSessionPayload) => sessionsApi.create(payload, token!),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useUpdateSession() {
  const { token } = useAuthContext();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: ClassSessionPayload }) => sessionsApi.update(id, payload, token!),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useDeleteSession() {
  const { token } = useAuthContext();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => sessionsApi.delete(id, token!),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}
