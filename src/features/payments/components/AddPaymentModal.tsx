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
import type { PaymentPayload, PaymentMethod } from '../../../types/payment';

interface AddPaymentModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: PaymentPayload) => Promise<void>;
  loading?: boolean;
  error?: string;
}

const METHODS: { value: PaymentMethod; label: string; hint: string }[] = [
  { value: 'CASH',     label: 'Cash',          hint: 'Requires confirmation' },
  { value: 'TRANSFER', label: 'Bank Transfer',  hint: 'Requires confirmation' },
  { value: 'CARD',     label: 'Card',           hint: 'Auto-confirmed' },
];

function initials(first: string, last: string) {
  return `${first[0] ?? ''}${last[0] ?? ''}`.toUpperCase();
}

export function AddPaymentModal({ open, onClose, onSubmit, loading, error }: AddPaymentModalProps) {
  const { data: users = [], isLoading: loadingUsers } = useUsers();
  const { data: plans = [] } = usePlans();

  const [query, setQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [planId, setPlanId] = useState<number>(0);
  const [method, setMethod] = useState<PaymentMethod>('CASH');
  const [transactionRef, setTransactionRef] = useState('');

  useEffect(() => {
    if (!open) {
      setQuery('');
      setSelectedUser(null);
      setPlanId(0);
      setMethod('CASH');
      setTransactionRef('');
    }
  }, [open]);

  const filteredUsers = useMemo(() => {
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

  const handleSubmit = async () => {
    if (!selectedUser || !planId || !selectedPlan) return;
    await onSubmit({
      userId: selectedUser.userId,
      planId,
      amount: selectedPlan.price,
      currency: 'MXN',
      method,
      transactionRef: transactionRef.trim() || undefined,
    });
  };

  return (
    <AppModal open={open} onClose={onClose} title="Add Payment">
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
        {error && <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>}

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

        {filteredUsers.length > 0 && !selectedUser && (
          <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden', maxHeight: 200, overflowY: 'auto' }}>
            <List dense disablePadding>
              {filteredUsers.map((user: AdminUser, idx: number) => (
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

            {selectedPlan && (
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Box sx={{ flex: 1, p: 1.5, bgcolor: 'grey.50', borderRadius: 2, textAlign: 'center' }}>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>Amount</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>${selectedPlan.price} MXN</Typography>
                </Box>
                <Box sx={{ flex: 1, p: 1.5, bgcolor: 'grey.50', borderRadius: 2, textAlign: 'center' }}>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>Credits</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    {selectedPlan.type === 'UNLIMITED' ? '∞' : selectedPlan.credits}
                  </Typography>
                </Box>
                <Box sx={{ flex: 1, p: 1.5, bgcolor: 'grey.50', borderRadius: 2, textAlign: 'center' }}>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>Duration</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>{selectedPlan.durationDays}d</Typography>
                </Box>
              </Box>
            )}

            <FormControl fullWidth size="small">
              <InputLabel>Payment method</InputLabel>
              <Select value={method} label="Payment method" onChange={(e) => setMethod(e.target.value as PaymentMethod)}>
                {METHODS.map((m) => (
                  <MenuItem key={m.value} value={m.value}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                      <Typography variant="body2">{m.label}</Typography>
                      <Typography variant="caption" color={m.hint === 'Auto-confirmed' ? 'success.main' : 'text.secondary'} sx={{ ml: 'auto' }}>
                        {m.hint}
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <AppInput
              label="Transaction reference (optional)"
              value={transactionRef}
              onChange={setTransactionRef}
            />
          </>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 1 }}>
          <AppButton text="Cancel" variant="outlined" onClick={onClose} />
          <AppButton text="Add Payment" onClick={handleSubmit} loading={loading} disabled={!selectedUser || !planId} />
        </Box>
      </Box>
    </AppModal>
  );
}
