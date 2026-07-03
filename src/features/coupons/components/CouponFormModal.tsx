import { useState, useEffect } from 'react';
import {
  Box, Alert, TextField, Switch, FormControlLabel,
  DialogActions, Typography, Checkbox, FormGroup, FormLabel,
} from '@mui/material';
import { AppModal } from '../../../shared/components/AppModal';
import { AppButton } from '../../../shared/components/AppButton';
import type { Coupon, CouponPayload } from '../../../types/coupon';
import type { Plan } from '../../../types/plan';

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: CouponPayload) => Promise<void>;
  loading: boolean;
  plans: Plan[];
  editing?: Coupon | null;
}

const empty = (): CouponPayload => ({
  code: '',
  discountPercent: 10,
  active: true,
  startDate: null,
  endDate: null,
  planIds: [],
});

export function CouponFormModal({ open, onClose, onSubmit, loading, plans, editing }: Props) {
  const [form, setForm] = useState<CouponPayload>(empty());
  const [alwaysActive, setAlwaysActive] = useState(true);
  const [allPlans, setAllPlans] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setError('');
    if (editing) {
      const hasDateRange = !!(editing.startDate || editing.endDate);
      setAlwaysActive(!hasDateRange);
      setAllPlans(editing.planIds.length === 0);
      setForm({
        code: editing.code,
        discountPercent: editing.discountPercent,
        active: editing.active,
        startDate: editing.startDate ?? null,
        endDate: editing.endDate ?? null,
        planIds: editing.planIds,
      });
    } else {
      setAlwaysActive(true);
      setAllPlans(true);
      setForm(empty());
    }
  }, [open, editing]);

  const set = (key: keyof CouponPayload, value: unknown) =>
    setForm((p) => ({ ...p, [key]: value }));

  const handleCodeChange = (v: string) => set('code', v.toUpperCase().replace(/[^A-Z0-9]/g, ''));

  const handlePlanToggle = (planId: number) => {
    const ids = form.planIds ?? [];
    set('planIds', ids.includes(planId) ? ids.filter((id) => id !== planId) : [...ids, planId]);
  };

  const handleSubmit = async () => {
    setError('');
    if (!form.code) { setError('Code is required.'); return; }
    if (!form.discountPercent || form.discountPercent < 1 || form.discountPercent > 100) {
      setError('Discount must be between 1 and 100.'); return;
    }
    if (!alwaysActive) {
      if (form.startDate && form.endDate && form.startDate > form.endDate) {
        setError('End date must be on or after start date.'); return;
      }
    }

    const payload: CouponPayload = {
      ...form,
      startDate: alwaysActive ? null : form.startDate,
      endDate: alwaysActive ? null : form.endDate,
      planIds: allPlans ? [] : (form.planIds ?? []),
    };

    try {
      await onSubmit(payload);
      onClose();
    } catch (e: any) {
      setError(e.message ?? 'Failed to save coupon.');
    }
  };

  return (
    <AppModal open={open} onClose={onClose} title={editing ? 'Edit Coupon' : 'New Coupon'}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
        {error && <Alert severity="error">{error}</Alert>}

        <TextField
          size="small"
          label="Coupon code"
          required
          value={form.code}
          onChange={(e) => handleCodeChange(e.target.value)}
          slotProps={{ htmlInput: { style: { textTransform: 'uppercase', letterSpacing: 2, fontWeight: 700 } } }}
          helperText="Uppercase letters and digits only"
        />

        <TextField
          size="small"
          label="Discount %"
          type="number"
          required
          value={form.discountPercent}
          onChange={(e) => set('discountPercent', Number(e.target.value))}
          slotProps={{ htmlInput: { min: 1, max: 100 } }}
        />

        <FormControlLabel
          control={<Switch checked={!!form.active} onChange={(e) => set('active', e.target.checked)} />}
          label="Active"
        />

        {/* Date range */}
        <Box>
          <FormControlLabel
            control={<Switch checked={alwaysActive} onChange={(e) => {
              setAlwaysActive(e.target.checked);
              if (e.target.checked) set('startDate', null);
              if (e.target.checked) set('endDate', null);
            }} />}
            label="Always active (no date limit)"
          />
          {!alwaysActive && (
            <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
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
        </Box>

        {/* Plan scope */}
        <Box>
          <FormControlLabel
            control={<Switch checked={allPlans} onChange={(e) => {
              setAllPlans(e.target.checked);
              if (e.target.checked) set('planIds', []);
            }} />}
            label="Applies to all plans"
          />
          {!allPlans && (
            <Box sx={{ mt: 1 }}>
              <FormLabel sx={{ fontSize: 12, fontWeight: 600 }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                  Select plans
                </Typography>
              </FormLabel>
              <FormGroup>
                {plans.map((p) => (
                  <FormControlLabel
                    key={p.planId}
                    control={
                      <Checkbox
                        size="small"
                        checked={(form.planIds ?? []).includes(p.planId)}
                        onChange={() => handlePlanToggle(p.planId)}
                      />
                    }
                    label={<Typography variant="body2">{p.name}</Typography>}
                  />
                ))}
              </FormGroup>
            </Box>
          )}
        </Box>
      </Box>

      <DialogActions sx={{ px: 0, pt: 2 }}>
        <AppButton text={editing ? 'Save changes' : 'Create coupon'} onClick={handleSubmit} loading={loading} />
      </DialogActions>
    </AppModal>
  );
}
