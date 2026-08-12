import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { request, authHeader } from '../../../lib/api';
import { useAuthContext } from '../../../context/AuthContext';
import type { Coupon, CouponPayload } from '../../../types/coupon';

const couponsApi = {
  getAll: (token: string) => request<Coupon[]>('/admin/coupons', { headers: authHeader(token) }),
  create: (payload: CouponPayload, token: string) => request<Coupon>('/admin/coupons', { method: 'POST', body: JSON.stringify(payload), headers: authHeader(token) }),
  update: (id: number, payload: CouponPayload, token: string) => request<Coupon>(`/admin/coupons/${id}`, { method: 'PUT', body: JSON.stringify(payload), headers: authHeader(token) }),
  delete: (id: number, token: string) => request<void>(`/admin/coupons/${id}`, { method: 'DELETE', headers: authHeader(token) }),
};

const KEY = ['coupons'];

export function useCoupons() {
  const { token } = useAuthContext();
  return useQuery({ queryKey: KEY, queryFn: () => couponsApi.getAll(token!), staleTime: 30_000 });
}

export function useCreateCoupon() {
  const { token } = useAuthContext();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CouponPayload) => couponsApi.create(payload, token!),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useUpdateCoupon() {
  const { token } = useAuthContext();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: CouponPayload }) =>
      couponsApi.update(id, payload, token!),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useDeleteCoupon() {
  const { token } = useAuthContext();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => couponsApi.delete(id, token!),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}
