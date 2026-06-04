import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../lib/api';
import { useAuthContext } from '../../../context/AuthContext';
import type { RoomPayload } from '../../../types/room';

const KEY = 'admin-rooms';

export function useRooms() {
  const { token } = useAuthContext();
  return useQuery({ queryKey: [KEY], queryFn: () => api.admin.rooms.getAll(token!), enabled: !!token });
}

export function useCreateRoom() {
  const { token } = useAuthContext();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: RoomPayload) => api.admin.rooms.create(payload, token!),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useUpdateRoom() {
  const { token } = useAuthContext();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: RoomPayload }) => api.admin.rooms.update(id, payload, token!),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useDeleteRoom() {
  const { token } = useAuthContext();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.admin.rooms.delete(id, token!),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}
