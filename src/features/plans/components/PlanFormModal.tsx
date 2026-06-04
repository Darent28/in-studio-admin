import { useState, useEffect } from 'react';
import { Box, Checkbox, FormControlLabel, Alert, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { AppModal } from '../../../shared/components/AppModal';
import { AppInput } from '../../../shared/components/AppInput';
import { AppButton } from '../../../shared/components/AppButton';
import type { Plan, PlanPayload, PlanType } from '../../../types/plan';

interface PlanFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: PlanPayload) => Promise<void>;
  plan?: Plan | null;
  loading?: boolean;
  error?: string;
}

const EMPTY: PlanPayload = { name: '', credits: 0, price: 0, durationDays: 30, type: 'PACK', active: true };

export function PlanFormModal({ open, onClose, onSubmit, plan, loading, error }: PlanFormModalProps) {
  const isEdit = !!plan;
  const [form, setForm] = useState<PlanPayload>(EMPTY);

  useEffect(() => {
    if (open) {
      setForm(
        plan
          ? { name: plan.name, credits: plan.credits, price: Number(plan.price), durationDays: plan.durationDays, type: plan.type, active: plan.active }
          : EMPTY
      );
    }
  }, [open, plan]);

  const set = (field: keyof PlanPayload) => (value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async () => {
    await onSubmit({ ...form });
  };

  return (
    <AppModal open={open} onClose={onClose} title={isEdit ? 'Edit Plan' : 'Create Plan'}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
        {error && <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>}

        <AppInput label="Name" value={form.name} onChange={set('name')} required />

        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
          <AppInput
            label="Credits"
            value={String(form.credits)}
            onChange={(v) => setForm((p) => ({ ...p, credits: Number(v) }))}
            type="number"
            required
          />
          <AppInput
            label="Price"
            value={String(form.price)}
            onChange={(v) => setForm((p) => ({ ...p, price: Number(v) }))}
            type="number"
            required
          />
        </Box>

        <AppInput
          label="Duration (days)"
          value={String(form.durationDays)}
          onChange={(v) => setForm((p) => ({ ...p, durationDays: Number(v) }))}
          type="number"
          required
        />

        <FormControl fullWidth size="small">
          <InputLabel>Type</InputLabel>
          <Select
            value={form.type}
            label="Type"
            onChange={(e) => setForm((p) => ({ ...p, type: e.target.value as PlanType }))}
          >
            <MenuItem value="PACK">Pack</MenuItem>
            <MenuItem value="UNLIMITED">Unlimited</MenuItem>
            <MenuItem value="MONTHLY">Monthly</MenuItem>
            <MenuItem value="DROP_IN">Drop In</MenuItem>
          </Select>
        </FormControl>

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
          <AppButton text={isEdit ? 'Save Changes' : 'Create Plan'} onClick={handleSubmit} loading={loading} />
        </Box>
      </Box>
    </AppModal>
  );
}
