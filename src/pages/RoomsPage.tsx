import { useState, useMemo } from 'react';
import { Box, Typography, Alert, Snackbar, TextField, InputAdornment } from '@mui/material';
import { Search } from '@mui/icons-material';
import { AppButton } from '../shared/components/AppButton';
import { ConfirmDialog } from '../shared/components/ConfirmDialog';
import { RoomTable } from '../features/rooms/components/RoomTable';
import { RoomFormModal } from '../features/rooms/components/RoomFormModal';
import { useRooms, useCreateRoom, useUpdateRoom, useDeleteRoom } from '../features/rooms/hooks/useRooms';
import type { Room, RoomPayload } from '../types/room';

export function RoomsPage() {
  const { data: rooms = [], isLoading } = useRooms();
  const createRoom = useCreateRoom();
  const updateRoom = useUpdateRoom();
  const deleteRoom = useDeleteRoom();

  const [formOpen, setFormOpen] = useState(false);
  const [selected, setSelected] = useState<Room | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Room | null>(null);
  const [formError, setFormError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rooms;
    return rooms.filter((r: Room) =>
      r.name.toLowerCase().includes(q) ||
      (r.location ?? '').toLowerCase().includes(q)
    );
  }, [rooms, search]);

  const openCreate = () => { setSelected(null); setFormError(''); setFormOpen(true); };
  const openEdit = (room: Room) => { setSelected(room); setFormError(''); setFormOpen(true); };

  const handleFormSubmit = async (payload: RoomPayload) => {
    setFormError('');
    try {
      if (selected) {
        await updateRoom.mutateAsync({ id: selected.roomId, payload });
        setSuccessMsg('Room updated successfully.');
      } else {
        await createRoom.mutateAsync(payload);
        setSuccessMsg('Room created successfully.');
      }
      setFormOpen(false);
    } catch (err: any) {
      setFormError(err.message ?? 'Something went wrong.');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteRoom.mutateAsync(deleteTarget.roomId);
      setSuccessMsg('Room deleted successfully.');
    } catch {
      // error handled silently
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, flexWrap: 'wrap', gap: 1 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>Rooms</Typography>
          <Typography variant="body2" color="text.secondary">{rooms.length} total rooms</Typography>
        </Box>
        <AppButton text="Create Room" onClick={openCreate} />
      </Box>

      <Box sx={{ mb: 2 }}>
        <TextField
          size="small"
          placeholder="Search by name or location…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ width: { xs: '100%', sm: 280 } }}
          slotProps={{ input: { startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment> } }}
        />
      </Box>

      <RoomTable rooms={filtered} loading={isLoading} onEdit={openEdit} onDelete={setDeleteTarget} />

      <RoomFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
        room={selected}
        loading={createRoom.isPending || updateRoom.isPending}
        error={formError}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Room"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        loading={deleteRoom.isPending}
      />

      <Snackbar open={!!successMsg} autoHideDuration={3000} onClose={() => setSuccessMsg('')} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity="success" onClose={() => setSuccessMsg('')} sx={{ borderRadius: 2 }}>{successMsg}</Alert>
      </Snackbar>
    </Box>
  );
}
