import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../lib/api';
import { useAuthContext } from '../../../context/AuthContext';
import type { CouponPayload } from '../../../types/coupon';

const KEY = ['coupons'];

export function useCoupons() {
  const { token } = useAuthContext();
  return useQuery({ queryKey: KEY, queryFn: () => api.admin.coupons.getAll(token!), staleTime: 30_000 });
}

export function useCreateCoupon() {
  const { token } = useAuthContext();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CouponPayload) => api.admin.coupons.create(payload, token!),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useUpdateCoupon() {
  const { token } = useAuthContext();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: CouponPayload }) =>
      api.admin.coupons.update(id, payload, token!),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useDeleteCoupon() {
  const { token } = useAuthContext();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.admin.coupons.delete(id, token!),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}
