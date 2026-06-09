import { useState, useMemo } from 'react';
import {
  Box, Typography, Alert, Snackbar, Chip, CircularProgress,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  InputAdornment, TextField, ToggleButtonGroup, ToggleButton, Tooltip, IconButton,
} from '@mui/material';
import { Search, CheckCircleOutlined } from '@mui/icons-material';
import { AppButton } from '../shared/components/AppButton';
import { AddPaymentModal } from '../features/payments/components/AddPaymentModal';
import { usePayments, useCreatePayment, useConfirmPayment } from '../features/payments/hooks/usePayments';
import type { Payment, PaymentPayload, PaymentStatus } from '../types/payment';

const STATUS_COLOR: Record<PaymentStatus, 'warning' | 'success' | 'error' | 'default'> = {
  PENDING:   'warning',
  COMPLETED: 'success',
  FAILED:    'error',
  REFUNDED:  'default',
};

function fmt(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function fmtAmount(amount: number, currency: string) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
}

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

      <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ '& th': { fontWeight: 700, bgcolor: 'background.default' } }}>
              <TableCell>ID</TableCell>
              <TableCell>User</TableCell>
              <TableCell>Plan</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Method</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Created</TableCell>
              <TableCell>Paid at</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                  <CircularProgress size={24} />
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                  No payments found.
                </TableCell>
              </TableRow>
            ) : filtered.map((p: Payment) => (
              <TableRow key={p.paymentId} hover>
                <TableCell sx={{ color: 'text.secondary', fontSize: 12 }}>#{p.paymentId}</TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {p.userFirstName} {p.userLastName}
                  </Typography>
                </TableCell>
                <TableCell>{p.planName}</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>{fmtAmount(p.amount, p.currency)}</TableCell>
                <TableCell>
                  <Chip label={p.method} size="small" variant="outlined" sx={{ fontSize: 11 }} />
                </TableCell>
                <TableCell>
                  <Chip
                    label={p.status}
                    size="small"
                    color={STATUS_COLOR[p.status]}
                    sx={{ fontSize: 11, fontWeight: 600 }}
                  />
                </TableCell>
                <TableCell sx={{ fontSize: 12, color: 'text.secondary' }}>{fmt(p.createdAt)}</TableCell>
                <TableCell sx={{ fontSize: 12, color: 'text.secondary' }}>{fmt(p.paidAt)}</TableCell>
                <TableCell align="center">
                  {p.status === 'PENDING' && (
                    <Tooltip title="Confirm payment">
                      <span>
                        <IconButton
                          size="small"
                          color="success"
                          disabled={confirmingId === p.paymentId}
                          onClick={() => handleConfirm(p)}
                        >
                          {confirmingId === p.paymentId
                            ? <CircularProgress size={16} color="success" />
                            : <CheckCircleOutlined fontSize="small" />}
                        </IconButton>
                      </span>
                    </Tooltip>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

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
