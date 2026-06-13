import { useState, useMemo } from 'react';
import {
  Box, Typography, Alert, Snackbar,
  InputAdornment, TextField, ToggleButtonGroup, ToggleButton,
} from '@mui/material';
import { Search } from '@mui/icons-material';
import { AppButton } from '../shared/components/AppButton';
import { AddPaymentModal } from '../features/payments/components/AddPaymentModal';
import { PaymentTable } from '../features/payments/components/PaymentTable';
import { usePayments, useCreatePayment, useConfirmPayment } from '../features/payments/hooks/usePayments';
import type { Payment, PaymentPayload, PaymentStatus } from '../types/payment';

export function PaymentsPage() {
  const { data: payments = [], isLoading } = usePayments();
  const createPayment = useCreatePayment();
  const confirmPayment = useConfirmPayment();

  const [addOpen, setAddOpen] = useState(false);
  const [confirmingId, setConfirmingId] = useState<number | null>(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<PaymentStatus | 'ALL'>('ALL');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return payments.filter((p: Payment) => {
      if (filterStatus !== 'ALL' && p.status !== filterStatus) return false;
      if (!q) return true;
      return (
        p.userFirstName.toLowerCase().includes(q) ||
        p.userLastName.toLowerCase().includes(q) ||
        p.planName.toLowerCase().includes(q) ||
        p.method.toLowerCase().includes(q)
      );
    });
  }, [payments, search, filterStatus]);

  const handleAddPayment = async (payload: PaymentPayload) => {
    setErrorMsg('');
    try {
      await createPayment.mutateAsync(payload);
      setSuccessMsg('Payment created. Confirm it once cash/transfer is received.');
      setAddOpen(false);
    } catch (err: any) {
      setErrorMsg(err.message ?? 'Failed to create payment.');
    }
  };

  const handleConfirm = async (p: Payment) => {
    setConfirmingId(p.paymentId);
    setErrorMsg('');
    try {
      await confirmPayment.mutateAsync(p.paymentId);
      setSuccessMsg(`Payment #${p.paymentId} confirmed. Credits added to membership.`);
    } catch (err: any) {
      setErrorMsg(err.message ?? 'Failed to confirm payment.');
    } finally {
      setConfirmingId(null);
    }
  };

  const counts = useMemo(() => ({
    total: payments.length,
    pending: payments.filter((p: Payment) => p.status === 'PENDING').length,
  }), [payments]);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>Payments</Typography>
          <Typography variant="body2" color="text.secondary">
            {counts.pending} pending · {counts.total} total
          </Typography>
        </Box>
        <AppButton text="Add Payment" onClick={() => { setErrorMsg(''); setAddOpen(true); }} />
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
        <TextField
          size="small"
          placeholder="Search user, plan or method…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ width: 280 }}
          slotProps={{ input: { startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment> } }}
        />
        <ToggleButtonGroup
          value={filterStatus}
          exclusive
          onChange={(_, v) => { if (v) setFilterStatus(v); }}
          size="small"
        >
          {(['ALL', 'PENDING', 'COMPLETED', 'FAILED', 'REFUNDED'] as const).map((s) => (
            <ToggleButton key={s} value={s} sx={{ fontSize: 11, px: 1.5 }}>{s}</ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Box>

      {errorMsg && (
        <Alert severity="error" onClose={() => setErrorMsg('')} sx={{ mb: 2 }}>{errorMsg}</Alert>
      )}

      <PaymentTable
        payments={filtered}
        loading={isLoading}
        confirmingId={confirmingId}
        onConfirm={handleConfirm}
      />

      <AddPaymentModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSubmit={handleAddPayment}
        loading={createPayment.isPending}
        error={errorMsg}
      />

      <Snackbar open={!!successMsg} autoHideDuration={4000} onClose={() => setSuccessMsg('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity="success" onClose={() => setSuccessMsg('')} sx={{ borderRadius: 2 }}>{successMsg}</Alert>
      </Snackbar>
    </Box>
  );
}
