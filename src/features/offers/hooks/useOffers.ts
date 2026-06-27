import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../lib/api';
import { useAuthContext } from '../../../context/AuthContext';
import type { OfferPayload } from '../../../types/offer';

export function useOffers(planId?: number) {
  const { token } = useAuthContext();
  return useQuery({
    queryKey: ['offers', planId],
    queryFn: () => api.admin.offers.getAll(token!, planId),
    enabled: !!token,
  });
}

export function useCreateOffer() {
  const { token } = useAuthContext();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: OfferPayload) => api.admin.offers.create(payload, token!),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['offers'] }),
  });
}

export function useUpdateOffer() {
  const { token } = useAuthContext();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: OfferPayload }) =>
      api.admin.offers.update(id, payload, token!),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['offers'] }),
  });
}

export function useDeleteOffer() {
  const { token } = useAuthContext();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.admin.offers.delete(id, token!),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['offers'] }),
  });
}
