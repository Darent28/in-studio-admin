import { useState, useEffect } from 'react';
import { Box, Alert, Typography, ToggleButtonGroup, ToggleButton, Divider } from '@mui/material';
import { Add, Remove } from '@mui/icons-material';
import { AppModal } from '../../../shared/components/AppModal';
import { AppInput } from '../../../shared/components/AppInput';
import { AppButton } from '../../../shared/components/AppButton';
import type { Membership } from '../../../types/membership';

interface AdjustCreditsModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (delta: number) => Promise<void>;
  membership: Membership | null;
  loading?: boolean;
  error?: string;
}

export function AdjustCreditsModal({ open, onClose, onSubmit, membership, loading, error }: AdjustCreditsModalProps) {
  const [mode, setMode] = useState<'add' | 'remove'>('add');
  const [amount, setAmount] = useState('1');

  useEffect(() => {
    if (open) { setMode('add'); setAmount('1'); }
  }, [open]);

  if (!membership) return null;
  const isUnlimited = membership.planType === 'UNLIMITED';
  const delta = mode === 'add' ? Number(amount) : -Number(amount);
  const preview = Math.max(0, membership.creditsLeft + delta);

  const handleSubmit = async () => {
    if (!amount || Number(amount) <= 0) return;
    await onSubmit(delta);
  };

  return (
    <AppModal open={open} onClose={onClose} title="Adjust Credits">
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
        {error && <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>}

        {/* Membership info */}
        <Box sx={{ p: 1.5, bgcolor: 'grey.50', borderRadius: 2 }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {membership.userFirstName} {membership.userLastName}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {membership.planName} · {membership.planType}
          </Typography>
        </Box>

        {isUnlimited ? (
          <Alert severity="info" sx={{ borderRadius: 2 }}>This is an UNLIMITED plan — credits don't apply.</Alert>
        ) : (
          <>
            {/* Current vs preview */}
            <Box sx={{ display: 'flex', gap: 2, textAlign: 'center' }}>
              <Box sx={{ flex: 1, p: 1.5, bgcolor: 'grey.50', borderRadius: 2 }}>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>Current</Typography>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>{membership.creditsLeft}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.disabled', fontSize: 20 }}>→</Box>
              <Box sx={{ flex: 1, p: 1.5, bgcolor: mode === 'add' ? 'success.50' : 'warning.50', borderRadius: 2 }}>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>After</Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, color: mode === 'add' ? 'success.main' : 'warning.main' }}>
                  {preview}
                </Typography>
              </Box>
            </Box>

            <Divider />

            <ToggleButtonGroup
              value={mode}
              exclusive
              onChange={(_, v) => { if (v) setMode(v); }}
              fullWidth
              size="small"
            >
              <ToggleButton value="add" sx={{ gap: 0.5 }}>
                <Add fontSize="small" /> Add credits
              </ToggleButton>
              <ToggleButton value="remove" sx={{ gap: 0.5 }}>
                <Remove fontSize="small" /> Remove credits
              </ToggleButton>
            </ToggleButtonGroup>

            <AppInput
              label="Amount"
              value={amount}
              onChange={(v) => setAmount(v.replace(/\D/g, ''))}
              type="number"
            />
          </>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 1 }}>
          <AppButton text="Cancel" variant="outlined" onClick={onClose} />
          {!isUnlimited && (
            <AppButton text="Apply" onClick={handleSubmit} loading={loading} disabled={!amount || Number(amount) <= 0} />
          )}
        </Box>
      </Box>
    </AppModal>
  );
}
