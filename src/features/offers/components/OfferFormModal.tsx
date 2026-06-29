import { useState, useEffect } from 'react';
import {
  Box, Alert, MenuItem, Select, FormControl, InputLabel,
  TextField, Switch, FormControlLabel, DialogActions,
  Typography, ToggleButton, ToggleButtonGroup,
} from '@mui/material';
import { CalendarMonth, ViewWeek } from '@mui/icons-material';
import { AppModal } from '../../../shared/components/AppModal';
import { AppButton } from '../../../shared/components/AppButton';
import type { Offer, OfferPayload } from '../../../types/offer';
import type { Plan } from '../../../types/plan';

// Mon = bit 0 … Sun = bit 6
const DAYS = [
  { label: 'Mon', bit: 0 },
  { label: 'Tue', bit: 1 },
  { label: 'Wed', bit: 2 },
  { label: 'Thu', bit: 3 },
  { label: 'Fri', bit: 4 },
  { label: 'Sat', bit: 5 },
  { label: 'Sun', bit: 6 },
];

type Mode = 'days' | 'dates';

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: OfferPayload) => Promise<void>;
  loading: boolean;
  plans: Plan[];
  editing?: Offer | null;
}

const emptyForm = (): OfferPayload => ({
  planId: 0,
  discountPercent: 10,
  daysOfWeek: null,
  startDate: null,
  endDate: null,
  startHour: null,
  endHour: null,
  active: true,
});

function maskToBits(mask: number | null): number[] {
  if (!mask) return [];
  return DAYS.filter((d) => (mask >> d.bit) & 1).map((d) => d.bit);
}

function bitsToMask(bits: number[]): number {
  return bits.reduce((acc, b) => acc | (1 << b), 0);
}

function detectMode(offer: Offer): Mode {
  if (offer.startDate || offer.endDate) return 'dates';
  return 'days';
}

export function OfferFormModal({ open, onClose, onSubmit, loading, plans, editing }: Props) {
  const [mode, setMode] = useState<Mode>('days');
  const [form, setForm] = useState<OfferPayload>(emptyForm());
  const [selectedBits, setSelectedBits] = useState<number[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setError('');
    if (editing) {
      const m = detectMode(editing);
      setMode(m);
      setSelectedBits(maskToBits(editing.daysOfWeek));
      setForm({
        planId: editing.planId,
        discountPercent: editing.discountPercent,
        daysOfWeek: editing.daysOfWeek ?? null,
        startDate: editing.startDate ?? null,
        endDate: editing.endDate ?? null,
        startHour: editing.startHour ?? null,
        endHour: editing.endHour ?? null,
        active: editing.active,
      });
    } else {
      setMode('days');
      setSelectedBits([]);
      setForm(emptyForm());
    }
  }, [open, editing]);

  const set = (key: keyof OfferPayload, value: unknown) =>
    setForm((p) => ({ ...p, [key]: value }));

  const handleModeChange = (_: React.MouseEvent, next: Mode | null) => {
    if (!next) return;
    setMode(next);
    // clear the other mode's fields
    if (next === 'days') {
      setForm((p) => ({ ...p, startDate: null, endDate: null }));
    } else {
      setSelectedBits([]);
      setForm((p) => ({ ...p, daysOfWeek: null }));
    }
  };

  const handleDayToggle = (_: React.MouseEvent, bits: number[]) => {
    setSelectedBits(bits);
  };

  const handleSubmit = async () => {
    setError('');
    if (!form.planId) { setError('Plan is required.'); return; }
    if (!form.discountPercent || form.discountPercent < 1 || form.discountPercent > 100) {
      setError('Discount must be between 1 and 100.'); return;
    }
    if (mode === 'dates') {
      if (form.startDate && form.endDate && form.startDate > form.endDate) {
        setError('End date must be on or after start date.'); return;
      }
    }
    if (form.startHour && form.endHour && form.startHour >= form.endHour) {
      setError('End hour must be after start hour.'); return;
    }

    const payload: OfferPayload = {
      ...form,
      daysOfWeek: mode === 'days' ? bitsToMask(selectedBits) : null,
      startDate:  mode === 'dates' ? form.startDate : null,
      endDate:    mode === 'dates' ? form.endDate : null,
    };

    try {
      await onSubmit(payload);
      onClose();
    } catch (e: any) {
      setError(e.message ?? 'Failed to save offer.');
    }
  };

  return (
    <AppModal open={open} onClose={onClose} title={editing ? 'Edit Offer' : 'New Offer'}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
        {error && <Alert severity="error">{error}</Alert>}

        {/* Plan */}
        <FormControl size="small" fullWidth required>
          <InputLabel>Plan</InputLabel>
          <Select value={form.planId || ''} label="Plan" onChange={(e) => set('planId', Number(e.target.value))}>
            {plans.map((p) => (
              <MenuItem key={p.planId} value={p.planId}>{p.name}</MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Discount */}
        <TextField
          size="small"
          label="Discount %"
          type="number"
          required
          value={form.discountPercent}
          onChange={(e) => set('discountPercent', Number(e.target.value))}
          slotProps={{ htmlInput: { min: 1, max: 100 } }}
        />

        {/* Mode toggle */}
        <Box>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, mb: 1, display: 'block' }}>
            Validity type
          </Typography>
          <ToggleButtonGroup
            value={mode}
            exclusive
            onChange={handleModeChange}
            size="small"
            fullWidth
          >
            <ToggleButton value="days" sx={{ gap: 0.75, fontSize: 13 }}>
              <ViewWeek fontSize="small" /> By day of week
            </ToggleButton>
            <ToggleButton value="dates" sx={{ gap: 0.75, fontSize: 13 }}>
              <CalendarMonth fontSize="small" /> By date range
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {/* Day of week mode */}
        {mode === 'days' && (
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, mb: 0.75, display: 'block' }}>
              Days (leave empty = any day)
            </Typography>
            <ToggleButtonGroup
              value={selectedBits}
              onChange={handleDayToggle}
              size="small"
              sx={{ flexWrap: 'wrap', gap: 0.5 }}
            >
              {DAYS.map((d) => (
                <ToggleButton
                  key={d.bit}
                  value={d.bit}
                  sx={{ px: 1.5, py: 0.5, fontSize: 12, fontWeight: 600, minWidth: 44 }}
                >
                  {d.label}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Box>
        )}

        {/* Date range mode */}
        {mode === 'dates' && (
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              size="small"
              label="Start date"
              type="date"
              value={form.startDate ?? ''}
              onChange={(e) => set('startDate', e.target.value || null)}
              sx={{ flex: 1 }}
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <TextField
              size="small"
              label="End date"
              type="date"
              value={form.endDate ?? ''}
              onChange={(e) => set('endDate', e.target.value || null)}
              sx={{ flex: 1 }}
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Box>
        )}

        {/* Time range — always visible */}
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            size="small"
            label="Start hour (optional)"
            type="time"
            value={form.startHour ?? ''}
            onChange={(e) => set('startHour', e.target.value || null)}
            sx={{ flex: 1 }}
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <TextField
            size="small"
            label="End hour (optional)"
            type="time"
            value={form.endHour ?? ''}
            onChange={(e) => set('endHour', e.target.value || null)}
            sx={{ flex: 1 }}
            slotProps={{ inputLabel: { shrink: true } }}
          />
        </Box>

        <FormControlLabel
          control={<Switch checked={!!form.active} onChange={(e) => set('active', e.target.checked)} />}
          label="Active"
        />
      </Box>

      <DialogActions sx={{ px: 0, pt: 2 }}>
        <AppButton text={editing ? 'Save changes' : 'Create offer'} onClick={handleSubmit} loading={loading} />
      </DialogActions>
    </AppModal>
  );
}
