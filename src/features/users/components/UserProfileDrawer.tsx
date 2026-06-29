import {
  Drawer, Box, Typography, Avatar, Chip, CircularProgress,
} from '@mui/material';
import { CheckCircle, Cancel } from '@mui/icons-material';
import { AppTable } from '../../../shared/components/AppTable';
import type { ColDef } from '../../../shared/components/AppTable';
import { useUserMemberships } from '../../memberships/hooks/useMemberships';
import type { AdminUser } from '../../../types/adminUser';
import type { Membership, MembershipStatus } from '../../../types/membership';

const STATUS_COLOR: Record<MembershipStatus, 'success' | 'warning' | 'error' | 'default'> = {
  ACTIVE: 'success', FROZEN: 'warning', EXPIRED: 'default', CANCELLED: 'error',
};

function fmt(d: string) {
  return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function initials(u: AdminUser) {
  return `${u.firstName[0]}${u.lastName[0]}`.toUpperCase();
}

interface Props {
  user: AdminUser | null;
  onClose: () => void;
}

export function UserProfileDrawer({ user, onClose }: Props) {
  const { data: memberships = [], isLoading } = useUserMemberships(user?.userId ?? null);

  const columns: ColDef<Membership>[] = [
    {
      key: 'period', header: 'Period',
      render: (m) => (
        <Box>
          <Typography variant="body2" sx={{ fontSize: 12 }}>{fmt(m.startDate)}</Typography>
          <Typography variant="caption" color="text.secondary">→ {fmt(m.endDate)}</Typography>
        </Box>
      ),
    },
    {
      key: 'credits', header: 'Credits',
      render: (m) => (
        <Typography variant="body2">
          {m.creditsLeft}
          {m.creditsTotal > 0 && (
            <Typography component="span" variant="caption" color="text.secondary"> / {m.creditsTotal}</Typography>
          )}
        </Typography>
      ),
    },
    {
      key: 'status', header: 'Status',
      render: (m) => <Chip label={m.status} size="small" color={STATUS_COLOR[m.status]} sx={{ fontSize: 11 }} />,
    },
    {
      key: 'payment', header: 'Payment', sx: { fontSize: 12, color: 'text.secondary', fontFamily: 'monospace' },
      render: (m) => m.lastPaymentId != null ? `#${m.lastPaymentId}` : '—',
    },
  ];

  return (
    <Drawer
      anchor="right"
      open={!!user}
      onClose={onClose}
      slotProps={{ paper: { sx: { width: { xs: '100%', sm: 480 } } } }}
    >
      {user && (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          {/* Header */}
          <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
            <Avatar sx={{ width: 56, height: 56, fontSize: 20, bgcolor: 'primary.main' }}>
              {initials(user)}
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                {user.firstName} {user.lastName}
              </Typography>
              <Typography variant="body2" color="text.secondary" noWrap>{user.email}</Typography>
            </Box>
            <Chip
              label={user.role}
              size="small"
              color={user.role === 'ADMIN' ? 'secondary' : user.role === 'STAFF' ? 'warning' : 'default'}
              sx={{ fontSize: 11 }}
            />
          </Box>

          {/* User info */}
          <Box sx={{ px: 3, py: 2.5, display: 'flex', flexDirection: 'column', gap: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
            <Row label="Phone" value={user.phone ?? '—'} />
            <Row label="Birthdate" value={user.birthdate ? fmt(user.birthdate) : '—'} />
            <Row label="Member since" value={fmt(user.createdAt)} />
            <Box sx={{ display: 'flex', gap: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                {user.active ? <CheckCircle fontSize="small" color="success" /> : <Cancel fontSize="small" color="disabled" />}
                <Typography variant="body2" color="text.secondary">Active</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                {user.emailVerified ? <CheckCircle fontSize="small" color="success" /> : <Cancel fontSize="small" color="disabled" />}
                <Typography variant="body2" color="text.secondary">Email verified</Typography>
              </Box>
            </Box>
          </Box>

          {/* Membership history */}
          <Box sx={{ flex: 1, overflow: 'auto', px: 3, py: 2.5 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>
              Membership history
              {!isLoading && (
                <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                  {memberships.length} record{memberships.length !== 1 ? 's' : ''}
                </Typography>
              )}
            </Typography>

            {isLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress size={24} />
              </Box>
            ) : (
              <AppTable
                columns={columns}
                rows={memberships}
                loading={false}
                getRowKey={(m) => m.membershipId}
                emptyMessage="No memberships found for this user."
              />
            )}
          </Box>
        </Box>
      )}
    </Drawer>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <Box sx={{ display: 'flex', gap: 1 }}>
      <Typography variant="body2" color="text.secondary" sx={{ minWidth: 110 }}>{label}</Typography>
      <Typography variant="body2" sx={{ fontWeight: 500 }}>{value}</Typography>
    </Box>
  );
}
