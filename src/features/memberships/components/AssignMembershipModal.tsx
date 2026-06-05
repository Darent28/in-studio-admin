import { useState, useEffect, useMemo } from 'react';
import {
  Box, Alert, Typography, InputAdornment, CircularProgress,
  List, ListItemButton, ListItemAvatar, ListItemText, Avatar, Chip,
  Divider, FormControl, InputLabel, Select, MenuItem,
} from '@mui/material';
import { Search, CheckCircle } from '@mui/icons-material';
import { AppModal } from '../../../shared/components/AppModal';
import { AppInput } from '../../../shared/components/AppInput';
import { AppButton } from '../../../shared/components/AppButton';
import { useUsers } from '../../users/hooks/useUsers';
import { usePlans } from '../../plans/hooks/usePlans';
import type { AdminUser } from '../../../types/adminUser';
import type { Plan } from '../../../types/plan';
import type { MembershipPayload } from '../../../types/membership';

interface AssignMembershipModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: MembershipPayload) => Promise<void>;
  loading?: boolean;
  error?: string;
}

function initials(first: string, last: string) {
  return `${first[0] ?? ''}${last[0] ?? ''}`.toUpperCase();
}

function addDays(isoDate: string, days: number): string {
  const d = new Date(isoDate);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export function AssignMembershipModal({ open, onClose, onSubmit, loading, error }: AssignMembershipModalProps) {
  const { data: users = [], isLoading: loadingUsers } = useUsers();
  const { data: plans = [] } = usePlans();

  const [query, setQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [planId, setPlanId] = useState<number>(0);
  const [startDate, setStartDate] = useState(today());

  useEffect(() => {
    if (!open) {
      setQuery('');
      setSelectedUser(null);
      setPlanId(0);
      setStartDate(today());
    }
  }, [open]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users.slice(0, 20);
    return users.filter((u: AdminUser) =>
      u.firstName.toLowerCase().includes(q) ||
      u.lastName.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q)
    );
  }, [users, query]);

  const activePlans = useMemo(
    () => (plans as Plan[]).filter((p: Plan) => p.active),
    [plans],
  );

  const selectedPlan = activePlans.find((p: Plan) => p.planId === planId);
  const endDate = selectedPlan ? addDays(startDate, selectedPlan.durationDays) : null;

  const handleSubmit = async () => {
    if (!selectedUser || !planId) return;
    await onSubmit({ userId: selectedUser.userId, planId, startDate });
  };

  return (
    <AppModal open={open} onClose={onClose} title="Assign Membership">
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
        {error && <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>}

        {/* User search */}
        <AppInput
          label="Search user by name or email"
          value={query}
          onChange={setQuery}
          startAdornment={
            <InputAdornment position="start">
              {loadingUsers ? <CircularProgress size={16} /> : <Search fontSize="small" sx={{ color: 'text.disabled' }} />}
            </InputAdornment>
          }
        />

        {filtered.length > 0 && !selectedUser && (
          <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden', maxHeight: 200, overflowY: 'auto' }}>
            <List dense disablePadding>
              {filtered.map((user: AdminUser, idx: number) => (
                <Box key={user.userId}>
                  {idx > 0 && <Divider component="li" />}
                  <ListItemButton onClick={() => setSelectedUser(user)} sx={{ gap: 1 }}>
                    <ListItemAvatar sx={{ minWidth: 40 }}>
                      <Avatar sx={{ width: 32, height: 32, fontSize: 13, bgcolor: 'grey.300' }}>
                        {initials(user.firstName, user.lastName)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={`${user.firstName} ${user.lastName}`}
                      secondary={user.email}
                      slotProps={{
                        primary: { style: { fontSize: 14 } },
                        secondary: { style: { fontSize: 12 } },
                      }}
                    />
                  </ListItemButton>
                </Box>
              ))}
            </List>
          </Box>
        )}

        {/* Selected user pill */}
        {selectedUser && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5, bgcolor: 'primary.50', borderRadius: 2, border: '1px solid', borderColor: 'primary.200' }}>
            <Avatar sx={{ width: 32, height: 32, fontSize: 13, bgcolor: 'primary.main' }}>
              {initials(selectedUser.firstName, selectedUser.lastName)}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>{selectedUser.firstName} {selectedUser.lastName}</Typography>
              <Typography variant="caption" color="text.secondary">{selectedUser.email}</Typography>
            </Box>
            <CheckCircle fontSize="small" color="primary" />
            <Chip label="Change" size="small" variant="outlined" onClick={() => { setSelectedUser(null); setQuery(''); }} sx={{ cursor: 'pointer' }} />
          </Box>
        )}

        {selectedUser && (
          <>
            <Divider />

            <FormControl fullWidth size="small">
              <InputLabel>Plan</InputLabel>
              <Select value={planId || ''} label="Plan" onChange={(e) => setPlanId(Number(e.target.value))}>
                {activePlans.map((p: Plan) => (
                  <MenuItem key={p.planId} value={p.planId}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                      <Typography variant="body2">{p.name}</Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
                        {p.type} · {p.type === 'UNLIMITED' ? '∞' : p.credits} credits · ${p.price}
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <AppInput label="Start date" value={startDate} onChange={setStartDate} type="date" required />

            {endDate && (
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Box sx={{ flex: 1, p: 1.5, bgcolor: 'grey.50', borderRadius: 2, textAlign: 'center' }}>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>Ends</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{endDate}</Typography>
                </Box>
                <Box sx={{ flex: 1, p: 1.5, bgcolor: 'grey.50', borderRadius: 2, textAlign: 'center' }}>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>Credits</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {selectedPlan?.type === 'UNLIMITED' ? '∞' : selectedPlan?.credits}
                  </Typography>
                </Box>
                <Box sx={{ flex: 1, p: 1.5, bgcolor: 'grey.50', borderRadius: 2, textAlign: 'center' }}>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>Duration</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{selectedPlan?.durationDays}d</Typography>
                </Box>
              </Box>
            )}
          </>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 1 }}>
          <AppButton text="Cancel" variant="outlined" onClick={onClose} />
          <AppButton text="Assign Membership" onClick={handleSubmit} loading={loading} disabled={!selectedUser || !planId} />
        </Box>
      </Box>
    </AppModal>
  );
}
