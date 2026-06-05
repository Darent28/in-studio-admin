import { useState, useEffect } from 'react';
import { Box, Checkbox, FormControlLabel, Alert, Typography, Divider } from '@mui/material';
import { AppModal } from '../../../shared/components/AppModal';
import { AppInput } from '../../../shared/components/AppInput';
import { AppButton } from '../../../shared/components/AppButton';
import { SeatLayoutEditor } from '../../../shared/components/SeatLayoutEditor';
import { seatCode } from '../../../shared/components/SeatMap';
import type { Room, RoomPayload } from '../../../types/room';

interface RoomFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: RoomPayload) => Promise<void>;
  room?: Room | null;
  loading?: boolean;
  error?: string;
}

interface FormState {
  name: string;
  capacity: number;
  location: string;
  equipment: string;
  active: boolean;
  layoutRows: number;
  layoutCols: number;
  activeSeats: string[];
}

function allSeatsFor(rows: number, cols: number): string[] {
  const seats: string[] = [];
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++)
      seats.push(seatCode(r, c));
  return seats;
}

function parseLayoutData(data: string | null | undefined): string[] {
  if (!data) return [];
  try { return JSON.parse(data); } catch { return []; }
}

const EMPTY: FormState = {
  name: '', capacity: 1, location: '', equipment: '', active: true,
  layoutRows: 0, layoutCols: 0, activeSeats: [],
};

export function RoomFormModal({ open, onClose, onSubmit, room, loading, error }: RoomFormModalProps) {
  const isEdit = !!room;
  const [form, setForm] = useState<FormState>(EMPTY);

  useEffect(() => {
    if (open) {
      setForm(
        room
          ? {
              name: room.name,
              capacity: room.capacity,
              location: room.location ?? '',
              equipment: room.equipment ?? '',
              active: room.active,
              layoutRows: room.layoutRows ?? 0,
              layoutCols: room.layoutCols ?? 0,
              activeSeats: parseLayoutData(room.layoutData),
            }
          : EMPTY
      );
    }
  }, [open, room]);

  const handleRowsChange = (val: string) => {
    const newRows = Math.max(0, Math.min(26, Number(val)));
    setForm((p) => {
      const kept = p.activeSeats.filter((s) => s.charCodeAt(0) - 65 < newRows);
      const added: string[] = [];
      for (let r = p.layoutRows; r < newRows; r++)
        for (let c = 0; c < p.layoutCols; c++)
          added.push(seatCode(r, c));
      return { ...p, layoutRows: newRows, activeSeats: [...kept, ...added] };
    });
  };

  const handleColsChange = (val: string) => {
    const newCols = Math.max(0, Number(val));
    setForm((p) => {
      const kept = p.activeSeats.filter((s) => parseInt(s.slice(1)) - 1 < newCols);
      const added: string[] = [];
      for (let r = 0; r < p.layoutRows; r++)
        for (let c = p.layoutCols; c < newCols; c++)
          added.push(seatCode(r, c));
      return { ...p, layoutCols: newCols, activeSeats: [...kept, ...added] };
    });
  };

  const handleSubmit = async () => {
    const payload: RoomPayload = {
      name: form.name,
      capacity: form.capacity,
      active: form.active,
      layoutRows: form.layoutRows,
      layoutCols: form.layoutCols,
      layoutData: JSON.stringify(form.activeSeats),
    };
    if (form.location) payload.location = form.location;
    if (form.equipment) payload.equipment = form.equipment;
    await onSubmit(payload);
  };

  return (
    <AppModal open={open} onClose={onClose} title={isEdit ? 'Edit Room' : 'Create Room'}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
        {error && <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>}

        <AppInput label="Name" value={form.name} onChange={(v) => setForm((p) => ({ ...p, name: v }))} required />

        <AppInput
          label="Capacity"
          value={String(form.capacity)}
          onChange={(v) => setForm((p) => ({ ...p, capacity: Number(v) }))}
          type="number"
          required
        />

        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
          <AppInput label="Location" value={form.location} onChange={(v) => setForm((p) => ({ ...p, location: v }))} />
          <AppInput label="Equipment" value={form.equipment} onChange={(v) => setForm((p) => ({ ...p, equipment: v }))} />
        </Box>

        <FormControlLabel
          control={
            <Checkbox
              checked={form.active}
              onChange={(e) => setForm((p) => ({ ...p, active: e.target.checked }))}
            />
          }
          label="Active"
        />

        <Divider />

        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Seat Layout</Typography>

        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
          <AppInput
            label="Rows (max 26)"
            value={String(form.layoutRows)}
            onChange={handleRowsChange}
            type="number"
          />
          <AppInput
            label="Columns"
            value={String(form.layoutCols)}
            onChange={handleColsChange}
            type="number"
          />
        </Box>

        <SeatLayoutEditor
          rows={form.layoutRows}
          cols={form.layoutCols}
          value={form.activeSeats}
          onChange={(seats) => setForm((p) => ({ ...p, activeSeats: seats }))}
        />

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 1 }}>
          <AppButton text="Cancel" variant="outlined" onClick={onClose} />
          <AppButton text={isEdit ? 'Save Changes' : 'Create Room'} onClick={handleSubmit} loading={loading} />
        </Box>
      </Box>
    </AppModal>
  );
}
