import { useQuery } from '@tanstack/react-query';
import { api } from '../../../lib/api';
import { useAuthContext } from '../../../context/AuthContext';
import type { Dashboard } from '../../../types/dashboard';

export function useDashboard() {
  const { token } = useAuthContext();
  return useQuery<Dashboard>({
    queryKey: ['dashboard'],
    queryFn: () => api.admin.dashboard.get(token!),
    enabled: !!token,
    staleTime: 60_000,
  });
}
