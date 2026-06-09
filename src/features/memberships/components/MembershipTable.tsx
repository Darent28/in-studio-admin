import { useState } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Chip, IconButton, Skeleton, Typography, Box,
  Menu, MenuItem, ListItemIcon,
} from '@mui/material';
import { Settings, Delete, CreditScore, SwapHoriz, DateRange } from '@mui/icons-material';
import type { Membership, MembershipStatus } from '../../../types/membership';

interface MembershipTableProps {
  memberships: Membership[];
  loading: boolean;
  onAdjustCredits: (m: Membership) => void;
  onChangeStatus: (m: Membership) => void;
  onChangePeriod: (m: Membership) => void;
  onDelete: (m: Membership) => void;
}

const STATUS_COLOR: Record<MembershipStatus, 'success' | 'warning' | 'error' | 'default'> = {
  ACTIVE:    'success',
  FROZEN:    'warning',
  EXPIRED:   'default',
  CANCELLED: 'error',
};

function RowMenu({ m, onAdjustCredits, onChangeStatus, onChangePeriod, onDelete }: {
  m: Membership;
  onAdjustCredits: (m: Membership) => void;
  onChangeStatus: (m: Membership) => void;
  onChangePeriod: (m: Membership) => void;
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

export function MembershipTable({ memberships, loading, onAdjustCredits, onChangeStatus, onChangePeriod, onDelete }: MembershipTableProps) {
  if (loading) {
    return (
      <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
        <Table size="small"><TableBody>
          {Array.from({ length: 5 }).map((_, i) => (
            <TableRow key={i}>{Array.from({ length: 5 }).map((__, j) => (
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
            <TableCell>Credits</TableCell>
            <TableCell>Period</TableCell>
            <TableCell align="center">Status</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {memberships.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} align="center" sx={{ py: 4, color: 'text.secondary' }}>
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
                <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{m.creditsLeft}</Typography>
                  <Typography variant="caption" color="text.secondary">credits</Typography>
                </Box>
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
                <RowMenu m={m} onAdjustCredits={onAdjustCredits} onChangeStatus={onChangeStatus} onChangePeriod={onChangePeriod} onDelete={onDelete} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
