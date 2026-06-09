import { useState, useEffect } from 'react';
import { Box, Alert, FormControl, InputLabel, Select, MenuItem, Typography } from '@mui/material';
import { AppModal } from '../../../shared/components/AppModal';
import { AppButton } from '../../../shared/components/AppButton';
import type { Membership, MembershipStatus } from '../../../types/membership';

interface ChangeStatusModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (status: MembershipStatus) => Promise<void>;
  membership: Membership | null;
  loading?: boolean;
  error?: string;
}

const STATUSES: { value: MembershipStatus; label: string; description: string }[] = [
  { value: 'ACTIVE',    label: 'Active',    description: 'Member can book classes' },
  { value: 'FROZEN',    label: 'Frozen',    description: 'Temporarily suspended' },
  { value: 'CANCELLED', label: 'Cancelled', description: 'Permanently cancelled' },
  { value: 'EXPIRED',   label: 'Expired',   description: 'End date has passed' },
];

export function ChangeStatusModal({ open, onClose, onSubmit, membership, loading, error }: ChangeStatusModalProps) {
  const [status, setStatus] = useState<MembershipStatus>('ACTIVE');

  useEffect(() => {
    if (open && membership) setStatus(membership.status);
  }, [open, membership]);

  if (!membership) return null;

  return (
    <AppModal open={open} onClose={onClose} title="Change Status">
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

        <FormControl fullWidth size="small">
          <InputLabel>Status</InputLabel>
          <Select value={status} label="Status" onChange={(e) => setStatus(e.target.value as MembershipStatus)}>
            {STATUSES.map((s) => (
              <MenuItem key={s.value} value={s.value}>
                <Box>
                  <Typography variant="body2">{s.label}</Typography>
                  <Typography variant="caption" color="text.secondary">{s.description}</Typography>
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 1 }}>
          <AppButton text="Cancel" variant="outlined" onClick={onClose} />
          <AppButton text="Save" onClick={() => onSubmit(status)} loading={loading} />
        </Box>
      </Box>
    </AppModal>
  );
}
