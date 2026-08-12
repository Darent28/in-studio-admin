import { useQuery } from '@tanstack/react-query';
import { request, authHeader } from '../../../lib/api';
import { useAuthContext } from '../../../context/AuthContext';
import type { SessionSchedule } from '../../../types/sessionSchedule';

const sessionsApi = {
  getSchedule: (date: string, token: string) => request<SessionSchedule[]>(`/admin/sessions/schedule?date=${date}`, { headers: authHeader(token) }),
};

export function useSessionSchedule(date: string) {
  const { token } = useAuthContext();
  return useQuery<SessionSchedule[]>({
    queryKey: ['session-schedule', date],
    queryFn: () => sessionsApi.getSchedule(date, token!),
    enabled: !!token && !!date,
  });
}
