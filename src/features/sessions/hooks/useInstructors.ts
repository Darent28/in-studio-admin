import { useQuery } from '@tanstack/react-query';
import { request, authHeader } from '../../../lib/api';
import { useAuthContext } from '../../../context/AuthContext';
import type { Instructor } from '../../../types/instructor';

const instructorsApi = {
  getAll: (token: string) => request<Instructor[]>('/admin/instructors', { headers: authHeader(token) }),
};

export function useInstructors() {
  const { token } = useAuthContext();
  return useQuery({ queryKey: ['admin-instructors'], queryFn: () => instructorsApi.getAll(token!), enabled: !!token });
}
