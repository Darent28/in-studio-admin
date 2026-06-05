import { useState } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Chip, IconButton, Skeleton, Typography, Box, LinearProgress,
  Menu, MenuItem, ListItemIcon,
} from '@mui/material';
import { Settings, Delete, CreditScore, SwapHoriz } from '@mui/icons-material';
import type { Membership, MembershipStatus } from '../../../types/membership';

interface MembershipTableProps {
  memberships: Membership[];
  loading: boolean;
  onAdjustCredits: (m: Membership) => void;
  onChangeStatus: (m: Membership) => void;
  onDelete: (m: Membership) => void;
}

const STATUS_COLOR: Record<MembershipStatus, 'success' | 'warning' | 'error' | 'default'> = {
  ACTIVE:    'success',
  FROZEN:    'warning',
  EXPIRED:   'default',
  CANCELLED: 'error',
};

function CreditsDisplay({ creditsLeft, planCredits, planType }: { creditsLeft: number; planCredits: number; planType: string }) {
  if (planType === 'UNLIMITED') {
    return <Typography variant="body2" sx={{ color: 'primary.main', fontWeight: 600 }}>∞ Unlimited</Typography>;
  }
  const pct = planCredits > 0 ? Math.round((creditsLeft / planCredits) * 100) : 0;
  return (
    <Box sx={{ minWidth: 100 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.25 }}>
        <Typography variant="caption" sx={{ fontWeight: 600 }}>{creditsLeft}</Typography>
        <Typography variant="caption" color="text.secondary">/ {planCredits}</Typography>
      </Box>
      <LinearProgress
        variant="determinate"
        value={pct}
        sx={{ height: 5, borderRadius: 4, bgcolor: 'grey.200',
          '& .MuiLinearProgress-bar': { bgcolor: pct > 30 ? 'success.main' : 'warning.main' } }}
      />
    </Box>
  );
}

function RowMenu({ m, onAdjustCredits, onChangeStatus, onDelete }: {
  m: Membership;
  onAdjustCredits: (m: Membership) => void;
  onChangeStatus: (m: Membership) => void;
  onDelete: (m: Membership) => void;
}) {
  const [anchor, setAnchor] = useState<null | HTMLElement>(null);
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
        <MenuItem onClick={() => { setAnchor(null); onDelete(m); }} sx={{ color: 'error.main' }}>
          <ListItemIcon><Delete fontSize="small" color="error" /></ListItemIcon>Delete
        </MenuItem>
      </Menu>
    </>
  );
}

export function MembershipTable({ memberships, loading, onAdjustCredits, onChangeStatus, onDelete }: MembershipTableProps) {
  if (loading) {
    return (
      <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
        <Table size="small"><TableBody>
          {Array.from({ length: 5 }).map((_, i) => (
            <TableRow key={i}>{Array.from({ length: 6 }).map((__, j) => (
              <TableCell key={j}><Skeleton variant="text" /></TableCell>
            ))}</TableRow>
          ))}
        </TableBody></Table>
      </TableContainer>
    );
  }

  return (
    <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
      <Table size="small">
        <TableHead>
          <TableRow sx={{ '& th': { fontWeight: 700, bgcolor: 'grey.50' } }}>
            <TableCell>User</TableCell>
            <TableCell>Plan</TableCell>
            <TableCell>Credits</TableCell>
            <TableCell>Period</TableCell>
            <TableCell align="center">Status</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {memberships.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                No memberships yet
              </TableCell>
            </TableRow>
          ) : memberships.map((m) => (
            <TableRow key={m.membershipId} hover>
              <TableCell>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {m.userFirstName} {m.userLastName}
                </Typography>
                <Typography variant="caption" color="text.secondary">{m.userEmail}</Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2">{m.planName}</Typography>
                <Typography variant="caption" color="text.secondary">{m.planType}</Typography>
              </TableCell>
              <TableCell>
                <CreditsDisplay creditsLeft={m.creditsLeft} planCredits={m.planCredits} planType={m.planType} />
              </TableCell>
              <TableCell sx={{ fontSize: 12, color: 'text.secondary' }}>
                {m.startDate}<br />{m.endDate}
              </TableCell>
              <TableCell align="center">
                <Chip
                  label={m.status}
                  size="small"
                  color={STATUS_COLOR[m.status]}
                  variant="outlined"
                />
              </TableCell>
              <TableCell align="right">
                <RowMenu m={m} onAdjustCredits={onAdjustCredits} onChangeStatus={onChangeStatus} onDelete={onDelete} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
