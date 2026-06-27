import { useState, useEffect } from 'react';
import {
  Box, Alert, MenuItem, Select, FormControl, InputLabel,
  TextField, Switch, FormControlLabel, DialogActions,
} from '@mui/material';
import { AppModal } from '../../../shared/components/AppModal';
import { AppButton } from '../../../shared/components/AppButton';
import type { Offer, OfferPayload } from '../../../types/offer';
import type { Plan } from '../../../types/plan';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: OfferPayload) => Promise<void>;
  loading: boolean;
  plans: Plan[];
  editing?: Offer | null;
}

const empty = (): OfferPayload => ({
  planId: 0,
  discountPercent: 10,
  dayOfWeek: null,
  startHour: null,
  endHour: null,
  active: true,
});

export function OfferFormModal({ open, onClose, onSubmit, loading, plans, editing }: Props) {
  const [form, setForm] = useState<OfferPayload>(empty());
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setError('');
      setForm(editing
        ? {
            planId: editing.planId,
            discountPercent: editing.discountPercent,
            dayOfWeek: editing.dayOfWeek ?? null,
            startHour: editing.startHour ?? null,
            endHour: editing.endHour ?? null,
            active: editing.active,
          }
        : empty()
      );
    }
  }, [open, editing]);

  const set = (key: keyof OfferPayload, value: unknown) =>
    setForm((p) => ({ ...p, [key]: value }));

  const handleSubmit = async () => {
    setError('');
    if (!form.planId) { setError('Plan is required.'); return; }
    if (!form.discountPercent || form.discountPercent < 1 || form.discountPercent > 100) {
      setError('Discount must be between 1 and 100.'); return;
    }
    try {
      await onSubmit(form);
      onClose();
    } catch (e: any) {
      setError(e.message ?? 'Failed to save offer.');
    }
  };

  return (
    <AppModal open={open} onClose={onClose} title={editing ? 'Edit Offer' : 'New Offer'}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
        {error && <Alert severity="error">{error}</Alert>}

        <FormControl size="small" fullWidth required>
          <InputLabel>Plan</InputLabel>
          <Select value={form.planId || ''} label="Plan" onChange={(e) => set('planId', Number(e.target.value))}>
            {plans.map((p) => (
              <MenuItem key={p.planId} value={p.planId}>{p.name}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          size="small"
          label="Discount %"
          type="number"
          required
          value={form.discountPercent}
          onChange={(e) => set('discountPercent', Number(e.target.value))}
          slotProps={{ htmlInput: { min: 1, max: 100 } }}
        />

        <FormControl size="small" fullWidth>
          <InputLabel>Day of week (optional)</InputLabel>
          <Select<number | ''>
            value={form.dayOfWeek ?? ''}
            label="Day of week (optional)"
            onChange={(e) => set('dayOfWeek', e.target.value === '' ? null : Number(e.target.value))}
          >
            <MenuItem value="">Any day</MenuItem>
            {DAYS.map((d, i) => (
              <MenuItem key={i + 1} value={i + 1}>{d}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            size="small"
            label="Start hour (optional)"
            placeholder="HH:mm"
            value={form.startHour ?? ''}
            onChange={(e) => set('startHour', e.target.value || null)}
            sx={{ flex: 1 }}
          />
          <TextField
            size="small"
            label="End hour (optional)"
            placeholder="HH:mm"
            value={form.endHour ?? ''}
            onChange={(e) => set('endHour', e.target.value || null)}
            sx={{ flex: 1 }}
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
