import { useState } from 'react';
import { Box, Chip, IconButton, ListItemIcon, Menu, MenuItem, Typography } from '@mui/material';
import { Settings, Delete, CreditScore, SwapHoriz, DateRange } from '@mui/icons-material';
import { AppTable } from '../../../shared/components/AppTable';
import { useAuthContext } from '../../../context/AuthContext';
import type { ColDef } from '../../../shared/components/AppTable';
import type { Membership, MembershipStatus } from '../../../types/membership';

interface Props {
  memberships: Membership[];
  loading: boolean;
  onAdjustCredits: (m: Membership) => void;
  onChangeStatus: (m: Membership) => void;
  onChangePeriod: (m: Membership) => void;
  onDelete: (m: Membership) => void;
}

const STATUS_COLOR: Record<MembershipStatus, 'success' | 'warning' | 'error' | 'default'> = {
  ACTIVE: 'success', FROZEN: 'warning', EXPIRED: 'default', CANCELLED: 'error',
};

function CreditsCell({ m }: { m: Membership }) {
  return (
    <Box sx={{ minWidth: 110 }}>
      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5, mb: 0.5 }}>
        <Typography variant="body2" sx={{ fontWeight: 700 }}>{m.creditsLeft}</Typography>
        {m.creditsTotal > 0 && (
          <Typography variant="caption" color="text.secondary">/ {m.creditsTotal}</Typography>
        )}
      </Box>
      {m.creditsTotal > 0 ? (
        <Box sx={{ height: 4, borderRadius: 2, bgcolor: 'grey.200', overflow: 'hidden' }}>
          <Box sx={{
            height: '100%', borderRadius: 2,
            bgcolor: m.status === 'FROZEN' ? 'info.main'
              : m.creditsLeft > m.creditsTotal * 0.5 ? 'success.main'
              : m.creditsLeft > 0 ? 'warning.main' : 'error.main',
            width: `${Math.round((m.creditsLeft / m.creditsTotal) * 100)}%`,
          }} />
        </Box>
      ) : (
        <Typography variant="caption" color="text.secondary">credits</Typography>
      )}
    </Box>
  );
}

function RowMenu({ m, onAdjustCredits, onChangeStatus, onChangePeriod, onDelete }: {
  m: Membership;
  onAdjustCredits: (m: Membership) => void;
  onChangeStatus: (m: Membership) => void;
  onChangePeriod: (m: Membership) => void;
  onDelete: (m: Membership) => void;
}) {
  const [anchor, setAnchor] = useState<null | HTMLElement>(null);
  const { user } = useAuthContext();
  if (user?.role === 'STAFF') return null;
  return (
    <>
      <IconButton size="small" onClick={(e) => setAnchor(e.currentTarget)}>
        <Settings fontSize="small" />
      </IconButton>
      <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={() => setAnchor(null)}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}>
        <MenuItem onClick={() => { setAnchor(null); onAdjustCredits(m); }}>
          <ListItemIcon><CreditScore fontSize="small" /></ListItemIcon>Adjust credits
        </MenuItem>
        <MenuItem onClick={() => { setAnchor(null); onChangeStatus(m); }}>
          <ListItemIcon><SwapHoriz fontSize="small" /></ListItemIcon>Change status
        </MenuItem>
        <MenuItem onClick={() => { setAnchor(null); onChangePeriod(m); }}>
          <ListItemIcon><DateRange fontSize="small" /></ListItemIcon>Edit period
        </MenuItem>
        <MenuItem onClick={() => { setAnchor(null); onDelete(m); }} sx={{ color: 'error.main' }}>
          <ListItemIcon><Delete fontSize="small" color="error" /></ListItemIcon>Delete
        </MenuItem>
      </Menu>
    </>
  );
}

export function MembershipTable({ memberships, loading, onAdjustCredits, onChangeStatus, onChangePeriod, onDelete }: Props) {
  const columns: ColDef<Membership>[] = [
    {
      key: 'user', header: 'User',
      render: (m) => (
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>{m.userFirstName} {m.userLastName}</Typography>
          <Typography variant="caption" color="text.secondary">{m.userEmail}</Typography>
        </Box>
      ),
      exportValue: (m) => `${m.userFirstName} ${m.userLastName}`,
    },
    { key: 'credits', header: 'Credits', render: (m) => <CreditsCell m={m} />, exportValue: (m) => `${m.creditsLeft} / ${m.creditsTotal}` },
    { key: 'period', header: 'Period', sx: { fontSize: 12, color: 'text.secondary' }, render: (m) => <>{m.startDate}<br />{m.endDate}</>, exportValue: (m) => `${m.startDate} → ${m.endDate}` },
    { key: 'status', header: 'Status', align: 'center', render: (m) => <Chip label={m.status} size="small" color={STATUS_COLOR[m.status]} sx={{ fontSize: 11 }} />, exportValue: (m) => m.status },
    { key: 'paymentId', header: 'Payment ID', sx: { fontSize: 12, color: 'text.secondary', fontFamily: 'monospace' }, render: (m) => m.lastPaymentId != null ? `#${m.lastPaymentId}` : '—' },
    {
      key: 'actions', header: '', align: 'right',
      render: (m) => <RowMenu m={m} onAdjustCredits={onAdjustCredits} onChangeStatus={onChangeStatus} onChangePeriod={onChangePeriod} onDelete={onDelete} />,
    },
  ];

  return (
    <AppTable
      columns={columns}
      rows={memberships}
      loading={loading}
      getRowKey={(m) => m.membershipId}
      emptyMessage="No memberships yet."
      title="Memberships"
    />
  );
}
