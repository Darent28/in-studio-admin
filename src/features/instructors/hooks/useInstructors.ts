import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { request, authHeader } from '../../../lib/api';
import { useAuthContext } from '../../../context/AuthContext';
import type { Instructor, InstructorPayload, InstructorUpdatePayload, UserSearchResult } from '../../../types/instructor';

const instructorsApi = {
  getAll: (token: string) => request<Instructor[]>('/admin/instructors', { headers: authHeader(token) }),
  create: (payload: InstructorPayload, token: string) => request<Instructor>('/admin/instructors', { method: 'POST', body: JSON.stringify(payload), headers: authHeader(token) }),
  update: (id: number, payload: InstructorUpdatePayload, token: string) => request<Instructor>(`/admin/instructors/${id}`, { method: 'PUT', body: JSON.stringify(payload), headers: authHeader(token) }),
  delete: (id: number, token: string) => request<void>(`/admin/instructors/${id}`, { method: 'DELETE', headers: authHeader(token) }),
  searchUsers: (q: string, token: string) => request<UserSearchResult[]>(`/admin/instructors/user-search?q=${encodeURIComponent(q)}`, { headers: authHeader(token) }),
};

export function useInstructors() {
  const { token } = useAuthContext();
  return useQuery({
    queryKey: ['admin-instructors'],
    queryFn: () => instructorsApi.getAll(token!),
    enabled: !!token,
  });
}

export function useCreateInstructor() {
  const { token } = useAuthContext();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: InstructorPayload) => instructorsApi.create(payload, token!),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-instructors'] }),
  });
}

export function useUpdateInstructor() {
  const { token } = useAuthContext();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: InstructorUpdatePayload }) =>
      instructorsApi.update(id, payload, token!),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-instructors'] }),
  });
}

export function useDeleteInstructor() {
  const { token } = useAuthContext();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => instructorsApi.delete(id, token!),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-instructors'] }),
  });
}
