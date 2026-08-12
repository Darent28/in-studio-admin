import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { request, authHeader } from '../../../lib/api';
import { useAuthContext } from '../../../context/AuthContext';
import type { Offer, OfferPayload } from '../../../types/offer';

const offersApi = {
  getAll: (token: string, planId?: number) => request<Offer[]>(`/admin/offers${planId ? `?planId=${planId}` : ''}`, { headers: authHeader(token) }),
  create: (payload: OfferPayload, token: string) => request<Offer>('/admin/offers', { method: 'POST', body: JSON.stringify(payload), headers: authHeader(token) }),
  update: (id: number, payload: OfferPayload, token: string) => request<Offer>(`/admin/offers/${id}`, { method: 'PUT', body: JSON.stringify(payload), headers: authHeader(token) }),
  delete: (id: number, token: string) => request<void>(`/admin/offers/${id}`, { method: 'DELETE', headers: authHeader(token) }),
  validate: (planId: number, date: string, time: string, token: string) =>
    request<Offer | undefined>(`/admin/offers/validate?planId=${planId}&date=${date}&time=${encodeURIComponent(time)}`, { headers: authHeader(token) }),
};

export function useOffers(planId?: number) {
  const { token } = useAuthContext();
  return useQuery({
    queryKey: ['offers', planId],
    queryFn: () => offersApi.getAll(token!, planId),
    enabled: !!token,
  });
}

export function useCreateOffer() {
  const { token } = useAuthContext();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: OfferPayload) => offersApi.create(payload, token!),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['offers'] }),
  });
}

export function useUpdateOffer() {
  const { token } = useAuthContext();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: OfferPayload }) =>
      offersApi.update(id, payload, token!),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['offers'] }),
  });
}

export function useDeleteOffer() {
  const { token } = useAuthContext();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => offersApi.delete(id, token!),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['offers'] }),
  });
}

export function validateOffer(planId: number, date: string, time: string, token: string) {
  return offersApi.validate(planId, date, time, token);
}
