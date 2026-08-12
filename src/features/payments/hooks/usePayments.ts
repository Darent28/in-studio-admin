import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { request, authHeader } from '../../../lib/api';
import { useAuthContext } from '../../../context/AuthContext';
import type { Payment, PaymentPayload } from '../../../types/payment';

const paymentsApi = {
  getAll: (token: string) => request<Payment[]>('/admin/payments', { headers: authHeader(token) }),
  create: (payload: PaymentPayload, token: string) => request<Payment>('/admin/payments', { method: 'POST', body: JSON.stringify(payload), headers: authHeader(token) }),
  confirm: (id: number, token: string) => request<Payment>(`/admin/payments/${id}/confirm`, { method: 'PATCH', headers: authHeader(token) }),
};

const KEY = 'admin-payments';

export function usePayments() {
  const { token } = useAuthContext();
  return useQuery({
    queryKey: [KEY],
    queryFn: () => paymentsApi.getAll(token!),
    enabled: !!token,
  });
}

export function useCreatePayment() {
  const { token } = useAuthContext();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: PaymentPayload) => paymentsApi.create(payload, token!),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useConfirmPayment() {
  const { token } = useAuthContext();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => paymentsApi.confirm(id, token!),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY] });
      qc.invalidateQueries({ queryKey: ['admin-memberships'] });
    },
  });
}
