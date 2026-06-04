import { useQuery } from '@tanstack/react-query';
import { api } from '../../../lib/api';
import { useAuthContext } from '../../../context/AuthContext';

export function useInstructors() {
  const { token } = useAuthContext();
  return useQuery({ queryKey: ['admin-instructors'], queryFn: () => api.admin.instructors.getAll(token!), enabled: !!token });
}
