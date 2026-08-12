import { useQuery } from '@tanstack/react-query';
import { request, requestBlob, authHeader } from '../../../lib/api';
import { useAuthContext } from '../../../context/AuthContext';
import type { ReportFilters, ReportResult } from '../../../types/report';

function buildQuery(filters: ReportFilters): string {
  const params = new URLSearchParams({ type: filters.type });
  if (filters.roomId != null) params.set('roomId', String(filters.roomId));
  if (filters.startDate) params.set('startDate', filters.startDate);
  if (filters.endDate) params.set('endDate', filters.endDate);
  return params.toString();
}

const reportsApi = {
  view: (filters: ReportFilters, token: string) =>
    request<ReportResult>(`/admin/reports?${buildQuery(filters)}`, { headers: authHeader(token) }),
  download: (filters: ReportFilters, token: string) =>
    requestBlob(`/admin/reports/download?${buildQuery(filters)}`, { headers: authHeader(token) }),
};

export function useReportPreview(filters: ReportFilters) {
  const { token } = useAuthContext();
  return useQuery({
    queryKey: ['report-preview', filters],
    queryFn: () => reportsApi.view(filters, token!),
    enabled: false,
  });
}

export async function downloadReport(filters: ReportFilters, token: string) {
  const blob = await reportsApi.download(filters, token);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filters.type.toLowerCase()}.xlsx`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
