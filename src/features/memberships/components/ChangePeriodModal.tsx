import { useState, useEffect } from 'react';
import { Box, Alert, Typography } from '@mui/material';
import { AppModal } from '../../../shared/components/AppModal';
import { AppInput } from '../../../shared/components/AppInput';
import { AppButton } from '../../../shared/components/AppButton';
import type { Membership, ChangePeriodPayload } from '../../../types/membership';

interface ChangePeriodModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: ChangePeriodPayload) => Promise<void>;
  membership: Membership | null;
  loading?: boolean;
  error?: string;
}

export function ChangePeriodModal({ open, onClose, onSubmit, membership, loading, error }: ChangePeriodModalProps) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    if (open && membership) {
      setStartDate(membership.startDate);
      setEndDate(membership.endDate);
    }
  }, [open, membership]);

  if (!membership) return null;

  const handleSubmit = async () => {
    if (!startDate || !endDate) return;
    await onSubmit({ startDate, endDate });
  };

  return (
    <AppModal open={open} onClose={onClose} title="Edit Period">
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
        {error && <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>}

        <Box sx={{ p: 1.5, bgcolor: 'grey.50', borderRadius: 2 }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {membership.userFirstName} {membership.userLastName}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {membership.userEmail}
          </Typography>
        </Box>

        <AppInput label="Start date" value={startDate} onChange={setStartDate} type="date" required />
        <AppInput label="End date"   value={endDate}   onChange={setEndDate}   type="date" required />

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 1 }}>
          <AppButton text="Cancel" variant="outlined" onClick={onClose} />
          <AppButton text="Save" onClick={handleSubmit} loading={loading} disabled={!startDate || !endDate} />
        </Box>
      </Box>
    </AppModal>
  );
}
