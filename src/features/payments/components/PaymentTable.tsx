import { Chip, CircularProgress, IconButton, Tooltip } from '@mui/material';
import { CheckCircleOutlined } from '@mui/icons-material';
import { AppTable } from '../../../shared/components/AppTable';
import type { ColDef } from '../../../shared/components/AppTable';
import type { Payment, PaymentStatus } from '../../../types/payment';

const STATUS_COLOR: Record<PaymentStatus, 'warning' | 'success' | 'error' | 'default'> = {
  PENDING: 'warning', COMPLETED: 'success', FAILED: 'error', REFUNDED: 'default',
};

function fmt(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function fmtAmount(amount: number, currency: string) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
}

interface Props {
  payments: Payment[];
  loading: boolean;
  confirmingId: number | null;
  onConfirm: (p: Payment) => void;
}

export function PaymentTable({ payments, loading, confirmingId, onConfirm }: Props) {
  const columns: ColDef<Payment>[] = [
    { key: 'id', header: 'ID', sx: { color: 'text.secondary', fontSize: 12, fontFamily: 'monospace' }, render: (p) => `#${p.paymentId}` },
    { key: 'user', header: 'User', sx: { fontWeight: 500 }, render: (p) => `${p.userFirstName} ${p.userLastName}` },
    { key: 'plan', header: 'Plan', render: (p) => p.planName },
    { key: 'amount', header: 'Amount', sx: { fontWeight: 600 }, render: (p) => fmtAmount(p.amount, p.currency) },
    { key: 'method', header: 'Method', render: (p) => <Chip label={p.method} size="small" sx={{ fontSize: 11 }} />, exportValue: (p) => p.method },
    {
      key: 'status', header: 'Status',
      render: (p) => <Chip label={p.status} size="small" color={STATUS_COLOR[p.status]} sx={{ fontSize: 11 }} />,
      exportValue: (p) => p.status,
    },
    { key: 'created', header: 'Created', sx: { fontSize: 12, color: 'text.secondary' }, render: (p) => fmt(p.createdAt) },
    { key: 'paidAt', header: 'Paid at', sx: { fontSize: 12, color: 'text.secondary' }, render: (p) => fmt(p.paidAt) },
    {
      key: 'actions', header: '', align: 'right',
      render: (p) => p.status === 'PENDING' ? (
        <Tooltip title="Confirm payment">
          <span>
            <IconButton size="small" color="success" disabled={confirmingId === p.paymentId} onClick={() => onConfirm(p)}>
              {confirmingId === p.paymentId
                ? <CircularProgress size={16} color="success" />
                : <CheckCircleOutlined fontSize="small" />}
            </IconButton>
          </span>
        </Tooltip>
      ) : null,
    },
  ];

  return (
    <AppTable
      columns={columns}
      rows={payments}
      loading={loading}
      getRowKey={(p) => p.paymentId}
      emptyMessage="No payments found."
      title="Payments"
    />
  );
}
