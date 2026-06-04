import { useState } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Menu, MenuItem, CircularProgress, Box, Chip, ListItemIcon } from '@mui/material';
import { Settings, Edit, Delete, CheckCircle, Cancel } from '@mui/icons-material';
import type { Plan, PlanType } from '../../../types/plan';

const TYPE_COLORS: Record<PlanType, 'default' | 'primary' | 'secondary' | 'warning' | 'info'> = {
  PACK: 'primary', UNLIMITED: 'secondary', MONTHLY: 'info', DROP_IN: 'warning',
};

interface PlanTableProps {
  plans: Plan[];
  loading?: boolean;
  onEdit: (plan: Plan) => void;
  onDelete: (plan: Plan) => void;
}

function RowMenu({ plan, onEdit, onDelete }: { plan: Plan; onEdit: (p: Plan) => void; onDelete: (p: Plan) => void }) {
  const [anchor, setAnchor] = useState<null | HTMLElement>(null);
  return (
    <>
      <IconButton size="small" onClick={(e) => setAnchor(e.currentTarget)}><Settings fontSize="small" /></IconButton>
      <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={() => setAnchor(null)} transformOrigin={{ horizontal: 'right', vertical: 'top' }} anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}>
        <MenuItem onClick={() => { setAnchor(null); onEdit(plan); }}>
          <ListItemIcon><Edit fontSize="small" /></ListItemIcon>Edit
        </MenuItem>
        <MenuItem onClick={() => { setAnchor(null); onDelete(plan); }} sx={{ color: 'error.main' }}>
          <ListItemIcon><Delete fontSize="small" color="error" /></ListItemIcon>Delete
        </MenuItem>
      </Menu>
    </>
  );
}

export function PlanTable({ plans, loading, onEdit, onDelete }: PlanTableProps) {
  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>;
  return (
    <TableContainer component={Paper} sx={{ border: '1px solid', borderColor: 'divider' }}>
      <Table>
        <TableHead>
          <TableRow sx={{ '& th': { fontWeight: 700, color: 'text.secondary', fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5 } }}>
            <TableCell>Name</TableCell>
            <TableCell>Type</TableCell>
            <TableCell>Credits</TableCell>
            <TableCell>Price</TableCell>
            <TableCell>Duration</TableCell>
            <TableCell>Active</TableCell>
            <TableCell align="right" />
          </TableRow>
        </TableHead>
        <TableBody>
          {plans.map((p) => (
            <TableRow key={p.planId} hover>
              <TableCell sx={{ fontWeight: 500 }}>{p.name}</TableCell>
              <TableCell><Chip label={p.type.replace('_', ' ')} size="small" color={TYPE_COLORS[p.type]} sx={{ fontSize: 11, fontWeight: 600 }} /></TableCell>
              <TableCell>{p.credits}</TableCell>
              <TableCell>${Number(p.price).toFixed(2)}</TableCell>
              <TableCell>{p.durationDays}d</TableCell>
              <TableCell>{p.active ? <CheckCircle fontSize="small" color="success" /> : <Cancel fontSize="small" color="disabled" />}</TableCell>
              <TableCell align="right"><RowMenu plan={p} onEdit={onEdit} onDelete={onDelete} /></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
