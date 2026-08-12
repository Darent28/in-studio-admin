import { useQuery } from '@tanstack/react-query';
import { request, authHeader } from '../../../lib/api';
import { useAuthContext } from '../../../context/AuthContext';
import type { Dashboard } from '../../../types/dashboard';

const dashboardApi = {
  get: (token: string) => request<Dashboard>('/admin/dashboard', { headers: authHeader(token) }),
};

export function useDashboard() {
  const { token } = useAuthContext();
  return useQuery<Dashboard>({
    queryKey: ['dashboard'],
    queryFn: () => dashboardApi.get(token!),
    enabled: !!token,
    staleTime: 60_000,
  });
}
