import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { request, authHeader } from '../../../lib/api';
import { useAuthContext } from '../../../context/AuthContext';
import type { Room, RoomPayload } from '../../../types/room';

const roomsApi = {
  getAll: (token: string) => request<Room[]>('/admin/rooms', { headers: authHeader(token) }),
  create: (payload: RoomPayload, token: string) => request<Room>('/admin/rooms', { method: 'POST', body: JSON.stringify(payload), headers: authHeader(token) }),
  update: (id: number, payload: RoomPayload, token: string) => request<Room>(`/admin/rooms/${id}`, { method: 'PUT', body: JSON.stringify(payload), headers: authHeader(token) }),
  delete: (id: number, token: string) => request<void>(`/admin/rooms/${id}`, { method: 'DELETE', headers: authHeader(token) }),
};

const KEY = 'admin-rooms';

export function useRooms() {
  const { token } = useAuthContext();
  return useQuery({ queryKey: [KEY], queryFn: () => roomsApi.getAll(token!), enabled: !!token });
}

export function useCreateRoom() {
  const { token } = useAuthContext();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: RoomPayload) => roomsApi.create(payload, token!),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useUpdateRoom() {
  const { token } = useAuthContext();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: RoomPayload }) => roomsApi.update(id, payload, token!),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useDeleteRoom() {
  const { token } = useAuthContext();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => roomsApi.delete(id, token!),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}
