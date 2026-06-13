import { useState } from 'react';
import { Chip, IconButton, ListItemIcon, Menu, MenuItem } from '@mui/material';
import { Settings, Edit, Delete, CheckCircle, Cancel } from '@mui/icons-material';
import { AppTable } from '../../../shared/components/AppTable';
import type { ColDef } from '../../../shared/components/AppTable';
import type { Plan, PlanType } from '../../../types/plan';

const TYPE_COLORS: Record<PlanType, 'default' | 'primary' | 'secondary' | 'warning' | 'info'> = {
  PACK: 'primary', UNLIMITED: 'secondary', MONTHLY: 'info', DROP_IN: 'warning',
};

interface Props {
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
      <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={() => setAnchor(null)}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}>
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

export function PlanTable({ plans, loading, onEdit, onDelete }: Props) {
  const columns: ColDef<Plan>[] = [
    { key: 'name', header: 'Name', sx: { fontWeight: 500 }, render: (p) => p.name },
    { key: 'type', header: 'Type', render: (p) => <Chip label={p.type.replace('_', ' ')} size="small" color={TYPE_COLORS[p.type]} sx={{ fontSize: 11, fontWeight: 600 }} /> },
    { key: 'credits', header: 'Credits', render: (p) => p.credits },
    { key: 'price', header: 'Price', render: (p) => `$${Number(p.price).toFixed(2)}` },
    { key: 'duration', header: 'Duration', render: (p) => `${p.durationDays}d` },
    { key: 'active', header: 'Active', render: (p) => p.active ? <CheckCircle fontSize="small" color="success" /> : <Cancel fontSize="small" color="disabled" /> },
    { key: 'actions', header: '', align: 'right', render: (p) => <RowMenu plan={p} onEdit={onEdit} onDelete={onDelete} /> },
  ];

  return (
    <AppTable
      columns={columns}
      rows={plans}
      loading={loading}
      getRowKey={(p) => p.planId}
      emptyMessage="No plans yet."
    />
  );
}
