import { useState } from 'react';
import {
  Box, Typography, Alert, Snackbar, Chip, IconButton,
  Menu, MenuItem, ListItemIcon,
} from '@mui/material';
import { Settings, Edit, Delete, CheckCircle, Cancel } from '@mui/icons-material';
import { AppButton } from '../shared/components/AppButton';
import { useAuthContext } from '../context/AuthContext';
import { AppTable } from '../shared/components/AppTable';
import { ConfirmDialog } from '../shared/components/ConfirmDialog';
import { CouponFormModal } from '../features/coupons/components/CouponFormModal';
import { useCoupons, useCreateCoupon, useUpdateCoupon, useDeleteCoupon } from '../features/coupons/hooks/useCoupons';
import { usePlans } from '../features/plans/hooks/usePlans';
import type { ColDef } from '../shared/components/AppTable';
import type { Coupon, CouponPayload } from '../types/coupon';

function fmtDate(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function RowMenu({ coupon, onEdit, onDelete }: { coupon: Coupon; onEdit: (c: Coupon) => void; onDelete: (c: Coupon) => void }) {
  const [anchor, setAnchor] = useState<null | HTMLElement>(null);
  const { user } = useAuthContext();
  if (user?.role === 'STAFF') return null;
  return (
    <>
      <IconButton size="small" onClick={(e) => setAnchor(e.currentTarget)}><Settings fontSize="small" /></IconButton>
      <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={() => setAnchor(null)}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}>
        <MenuItem onClick={() => { setAnchor(null); onEdit(coupon); }}>
          <ListItemIcon><Edit fontSize="small" /></ListItemIcon>Edit
        </MenuItem>
        <MenuItem onClick={() => { setAnchor(null); onDelete(coupon); }} sx={{ color: 'error.main' }}>
          <ListItemIcon><Delete fontSize="small" color="error" /></ListItemIcon>Delete
        </MenuItem>
      </Menu>
    </>
  );
}

export function CouponsPage() {
  const { data: coupons = [], isLoading } = useCoupons();
  const { data: plans = [] } = usePlans();
  const createCoupon = useCreateCoupon();
  const updateCoupon = useUpdateCoupon();
  const deleteCoupon = useDeleteCoupon();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Coupon | null>(null);
  const [deleting, setDeleting] = useState<Coupon | null>(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (payload: CouponPayload) => {
    if (editing) {
      await updateCoupon.mutateAsync({ id: editing.couponId, payload });
      setSuccessMsg('Coupon updated.');
    } else {
      await createCoupon.mutateAsync(payload);
      setSuccessMsg('Coupon created.');
    }
    setEditing(null);
    setFormOpen(false);
  };

  const handleDelete = async () => {
    if (!deleting) return;
    try {
      await deleteCoupon.mutateAsync(deleting.couponId);
      setSuccessMsg('Coupon deleted.');
    } catch (e: any) {
      setErrorMsg(e.message ?? 'Failed to delete coupon.');
    } finally {
      setDeleting(null);
    }
  };

  const columns: ColDef<Coupon>[] = [
    {
      key: 'code', header: 'Code',
      render: (c) => (
        <Typography variant="body2" sx={{ fontWeight: 700, letterSpacing: 1.5, fontFamily: 'monospace' }}>
          {c.code}
        </Typography>
      ),
    },
    {
      key: 'discount', header: 'Discount',
      render: (c) => (
        <Chip label={`${c.discountPercent}% off`} size="small" color="primary" sx={{ fontSize: 11, fontWeight: 600 }} />
      ),
    },
    {
      key: 'validity', header: 'Validity',
      render: (c) => (!c.startDate && !c.endDate)
        ? <Chip label="Always active" size="small" color="success" variant="outlined" sx={{ fontSize: 11 }} />
        : (
          <Typography variant="caption" color="text.secondary">
            {fmtDate(c.startDate)} → {fmtDate(c.endDate)}
          </Typography>
        ),
    },
    {
      key: 'plans', header: 'Plans',
      render: (c) => c.planNames.length === 0
        ? <Chip label="All plans" size="small" variant="outlined" sx={{ fontSize: 11 }} />
        : (
          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
            {c.planNames.map((name) => (
              <Chip key={name} label={name} size="small" variant="outlined" sx={{ fontSize: 10 }} />
            ))}
          </Box>
        ),
    },
    {
      key: 'active', header: 'Active',
      render: (c) => c.active
        ? <CheckCircle fontSize="small" color="success" />
        : <Cancel fontSize="small" color="disabled" />,
    },
    {
      key: 'actions', header: '', align: 'right',
      render: (c) => (
        <RowMenu coupon={c} onEdit={(c) => { setEditing(c); setFormOpen(true); }} onDelete={setDeleting} />
      ),
    },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, flexWrap: 'wrap', gap: 1 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>Coupons</Typography>
          <Typography variant="body2" color="text.secondary">
            {coupons.length} coupon{coupons.length !== 1 ? 's' : ''}
          </Typography>
        </Box>
        <AppButton text="Add Coupon" onClick={() => { setEditing(null); setFormOpen(true); }} />
      </Box>

      {errorMsg && <Alert severity="error" onClose={() => setErrorMsg('')} sx={{ mb: 2 }}>{errorMsg}</Alert>}

      <AppTable
        columns={columns}
        rows={coupons}
        loading={isLoading}
        getRowKey={(c) => c.couponId}
        emptyMessage="No coupons yet."
        title="Coupons"
      />

      <CouponFormModal
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditing(null); }}
        onSubmit={handleSubmit}
        loading={createCoupon.isPending || updateCoupon.isPending}
        plans={plans}
        editing={editing}
      />

      <ConfirmDialog
        open={!!deleting}
        title="Delete coupon"
        message={`Delete coupon "${deleting?.code}"?`}
        onConfirm={handleDelete}
        onClose={() => setDeleting(null)}
        loading={deleteCoupon.isPending}
      />

      <Snackbar open={!!successMsg} autoHideDuration={4000} onClose={() => setSuccessMsg('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity="success" onClose={() => setSuccessMsg('')} sx={{ borderRadius: 2 }}>{successMsg}</Alert>
      </Snackbar>
    </Box>
  );
}
