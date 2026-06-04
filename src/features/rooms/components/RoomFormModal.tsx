import { useState, useEffect } from 'react';
import { Box, Checkbox, FormControlLabel, Alert } from '@mui/material';
import { AppModal } from '../../../shared/components/AppModal';
import { AppInput } from '../../../shared/components/AppInput';
import { AppButton } from '../../../shared/components/AppButton';
import type { Room, RoomPayload } from '../../../types/room';

interface RoomFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: RoomPayload) => Promise<void>;
  room?: Room | null;
  loading?: boolean;
  error?: string;
}

const EMPTY: RoomPayload = { name: '', capacity: 1, location: '', equipment: '', active: true };

export function RoomFormModal({ open, onClose, onSubmit, room, loading, error }: RoomFormModalProps) {
  const isEdit = !!room;
  const [form, setForm] = useState<RoomPayload>(EMPTY);

  useEffect(() => {
    if (open) {
      setForm(
        room
          ? { name: room.name, capacity: room.capacity, location: room.location ?? '', equipment: room.equipment ?? '', active: room.active }
          : EMPTY
      );
    }
  }, [open, room]);

  const set = (field: keyof RoomPayload) => (value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async () => {
    const payload: RoomPayload = { ...form };
    if (!payload.location) delete payload.location;
    if (!payload.equipment) delete payload.equipment;
    await onSubmit(payload);
  };

  return (
    <AppModal open={open} onClose={onClose} title={isEdit ? 'Edit Room' : 'Create Room'}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
        {error && <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>}

        <AppInput label="Name" value={form.name} onChange={set('name')} required />

        <AppInput
          label="Capacity"
          value={String(form.capacity)}
          onChange={(v) => setForm((p) => ({ ...p, capacity: Number(v) }))}
          type="number"
          required
        />

        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
          <AppInput label="Location" value={form.location ?? ''} onChange={set('location')} />
          <AppInput label="Equipment" value={form.equipment ?? ''} onChange={set('equipment')} />
        </Box>

        <FormControlLabel
          control={
            <Checkbox
              checked={form.active ?? true}
              onChange={(e) => setForm((p) => ({ ...p, active: e.target.checked }))}
            />
          }
          label="Active"
        />

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 1 }}>
          <AppButton text="Cancel" variant="outlined" onClick={onClose} />
          <AppButton text={isEdit ? 'Save Changes' : 'Create Room'} onClick={handleSubmit} loading={loading} />
        </Box>
      </Box>
    </AppModal>
  );
}
