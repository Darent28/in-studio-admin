import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../lib/api';
import { useAuthContext } from '../../../context/AuthContext';
import type { ClassSessionPayload } from '../../../types/classSession';

const KEY = 'admin-sessions';

export function useClassSessions() {
  const { token } = useAuthContext();
  return useQuery({ queryKey: [KEY], queryFn: () => api.admin.sessions.getAll(token!), enabled: !!token });
}

export function useCreateSession() {
  const { token } = useAuthContext();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: ClassSessionPayload) => api.admin.sessions.create(payload, token!),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useUpdateSession() {
  const { token } = useAuthContext();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: ClassSessionPayload }) => api.admin.sessions.update(id, payload, token!),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useDeleteSession() {
  const { token } = useAuthContext();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.admin.sessions.delete(id, token!),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}
