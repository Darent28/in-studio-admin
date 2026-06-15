import { useQuery } from '@tanstack/react-query';
import { api } from '../../../lib/api';
import { useAuthContext } from '../../../context/AuthContext';
import type { SessionSchedule } from '../../../types/sessionSchedule';

export function useSessionSchedule(date: string) {
  const { token } = useAuthContext();
  return useQuery<SessionSchedule[]>({
    queryKey: ['session-schedule', date],
    queryFn: () => api.admin.sessions.getSchedule(date, token!),
    enabled: !!token && !!date,
  });
}
