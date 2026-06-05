import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../lib/api';
import { useAuthContext } from '../../../context/AuthContext';
import type { InstructorPayload, InstructorUpdatePayload } from '../../../types/instructor';

export function useInstructors() {
  const { token } = useAuthContext();
  return useQuery({
    queryKey: ['admin-instructors'],
    queryFn: () => api.admin.instructors.getAll(token!),
    enabled: !!token,
  });
}

export function useCreateInstructor() {
  const { token } = useAuthContext();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: InstructorPayload) => api.admin.instructors.create(payload, token!),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-instructors'] }),
  });
}

export function useUpdateInstructor() {
  const { token } = useAuthContext();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: InstructorUpdatePayload }) =>
      api.admin.instructors.update(id, payload, token!),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-instructors'] }),
  });
}

export function useDeleteInstructor() {
  const { token } = useAuthContext();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.admin.instructors.delete(id, token!),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-instructors'] }),
  });
}
