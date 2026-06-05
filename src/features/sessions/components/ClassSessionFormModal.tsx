import { useState, useEffect } from 'react';
import { Box, Alert, FormControl, InputLabel, Select, MenuItem, ToggleButtonGroup, ToggleButton, Typography } from '@mui/material';
import { AppModal } from '../../../shared/components/AppModal';
import { AppInput } from '../../../shared/components/AppInput';
import { AppButton } from '../../../shared/components/AppButton';
import { useRooms } from '../../rooms/hooks/useRooms';
import { useInstructors } from '../hooks/useInstructors';
import type { Room } from '../../../types/room';
import type { Instructor } from '../../../types/instructor';
import type { ClassSession, ClassSessionPayload, SessionStatus, DayOfWeek } from '../../../types/classSession';

interface ClassSessionFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: ClassSessionPayload) => Promise<void>;
  session?: ClassSession | null;
  loading?: boolean;
  error?: string;
}

const DAYS: { value: DayOfWeek; label: string }[] = [
  { value: 'MONDAY',    label: 'Mon' },
  { value: 'TUESDAY',   label: 'Tue' },
  { value: 'WEDNESDAY', label: 'Wed' },
  { value: 'THURSDAY',  label: 'Thu' },
  { value: 'FRIDAY',    label: 'Fri' },
  { value: 'SATURDAY',  label: 'Sat' },
  { value: 'SUNDAY',    label: 'Sun' },
];

interface FormState {
  instructorId: number;
  roomId: number;
  startTime: string;
  endTime: string;
  status: SessionStatus;
  days: DayOfWeek[];
  notes: string;
}

const EMPTY: FormState = {
  instructorId: 0,
  roomId: 0,
  startTime: '',
  endTime: '',
  status: 'SCHEDULED',
  days: [],
  notes: '',
};

export function ClassSessionFormModal({ open, onClose, onSubmit, session, loading, error }: ClassSessionFormModalProps) {
  const isEdit = !!session;
  const [form, setForm] = useState<FormState>(EMPTY);
  const { data: rooms = [] } = useRooms();
  const { data: instructors = [] } = useInstructors();

  useEffect(() => {
    if (open) {
      setForm(
        session
          ? {
              instructorId: session.instructorId,
              roomId: session.roomId,
              startTime: session.startTime,
              endTime: session.endTime,
              status: session.status,
              days: session.days ?? [],
              notes: session.notes ?? '',
            }
          : EMPTY
      );
    }
  }, [open, session]);

  const handleSubmit = async () => {
    const payload: ClassSessionPayload = {
      instructorId: form.instructorId,
      roomId: form.roomId,
      startTime: form.startTime,
      endTime: form.endTime,
      status: form.status,
      days: form.days,
    };
    if (form.notes) payload.notes = form.notes;
    await onSubmit(payload);
  };

  return (
    <AppModal open={open} onClose={onClose} title={isEdit ? 'Edit Session' : 'Create Session'}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
        {error && <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>}

        <FormControl fullWidth size="small">
          <InputLabel>Instructor</InputLabel>
          <Select
            value={form.instructorId || ''}
            label="Instructor"
            onChange={(e) => setForm((p) => ({ ...p, instructorId: Number(e.target.value) }))}
          >
            {instructors.map((i: Instructor) => (
              <MenuItem key={i.instructorId} value={i.instructorId}>
                {i.firstName} {i.lastName}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth size="small">
          <InputLabel>Room</InputLabel>
          <Select
            value={form.roomId || ''}
            label="Room"
            onChange={(e) => setForm((p) => ({ ...p, roomId: Number(e.target.value) }))}
          >
            {rooms.map((r: Room) => (
              <MenuItem key={r.roomId} value={r.roomId}>{r.name}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
          <AppInput
            label="Start time"
            value={form.startTime}
            onChange={(v) => setForm((p) => ({ ...p, startTime: v }))}
            type="time"
            required
          />
          <AppInput
            label="End time"
            value={form.endTime}
            onChange={(v) => setForm((p) => ({ ...p, endTime: v }))}
            type="time"
            required
          />
        </Box>

        <Box>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
            Days
          </Typography>
          <ToggleButtonGroup
            value={form.days}
            onChange={(_, newDays: DayOfWeek[] | null) => setForm((p) => ({ ...p, days: newDays ?? [] }))}
            sx={{ flexWrap: 'wrap', gap: 0.5 }}
          >
            {DAYS.map((d) => (
              <ToggleButton
                key={d.value}
                value={d.value}
                size="small"
                sx={{ borderRadius: '20px !important', border: '1px solid !important', minWidth: 44, fontSize: 12 }}
              >
                {d.label}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Box>

        <FormControl fullWidth size="small">
          <InputLabel>Status</InputLabel>
          <Select
            value={form.status}
            label="Status"
            onChange={(e) => setForm((p) => ({ ...p, status: e.target.value as SessionStatus }))}
          >
            <MenuItem value="SCHEDULED">Scheduled</MenuItem>
            <MenuItem value="CANCELLED">Cancelled</MenuItem>
            <MenuItem value="COMPLETED">Completed</MenuItem>
          </Select>
        </FormControl>

        <AppInput
          label="Notes (optional)"
          value={form.notes}
          onChange={(v) => setForm((p) => ({ ...p, notes: v }))}
        />

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 1 }}>
          <AppButton text="Cancel" variant="outlined" onClick={onClose} />
          <AppButton text={isEdit ? 'Save Changes' : 'Create Session'} onClick={handleSubmit} loading={loading} />
        </Box>
      </Box>
    </AppModal>
  );
}
