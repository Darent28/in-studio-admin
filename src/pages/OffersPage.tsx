import { useState } from 'react';
import {
  Box, Typography, Alert, Snackbar, Chip,
  IconButton, Menu, MenuItem, ListItemIcon,
} from '@mui/material';
import { CheckCircle, Cancel, Settings, Edit, Delete } from '@mui/icons-material';
import { AppButton } from '../shared/components/AppButton';
import { AppTable } from '../shared/components/AppTable';
import { OfferFormModal } from '../features/offers/components/OfferFormModal';
import { ConfirmDialog } from '../shared/components/ConfirmDialog';
import { useOffers, useCreateOffer, useUpdateOffer, useDeleteOffer } from '../features/offers/hooks/useOffers';
import { usePlans } from '../features/plans/hooks/usePlans';
import type { ColDef } from '../shared/components/AppTable';
import type { Offer, OfferPayload } from '../types/offer';

const DAYS = ['', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function RowMenu({ offer, onEdit, onDelete }: { offer: Offer; onEdit: (o: Offer) => void; onDelete: (o: Offer) => void }) {
  const [anchor, setAnchor] = useState<null | HTMLElement>(null);
  return (
    <>
      <IconButton size="small" onClick={(e) => setAnchor(e.currentTarget)}><Settings fontSize="small" /></IconButton>
      <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={() => setAnchor(null)}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}>
        <MenuItem onClick={() => { setAnchor(null); onEdit(offer); }}>
          <ListItemIcon><Edit fontSize="small" /></ListItemIcon>Edit
        </MenuItem>
        <MenuItem onClick={() => { setAnchor(null); onDelete(offer); }} sx={{ color: 'error.main' }}>
          <ListItemIcon><Delete fontSize="small" color="error" /></ListItemIcon>Delete
        </MenuItem>
      </Menu>
    </>
  );
}

export function OffersPage() {
  const { data: offers = [], isLoading } = useOffers();
  const { data: plans = [] } = usePlans();
  const createOffer = useCreateOffer();
  const updateOffer = useUpdateOffer();
  const deleteOffer = useDeleteOffer();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Offer | null>(null);
  const [deleting, setDeleting] = useState<Offer | null>(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (payload: OfferPayload) => {
    if (editing) {
      await updateOffer.mutateAsync({ id: editing.offerId, payload });
      setSuccessMsg('Offer updated.');
    } else {
      await createOffer.mutateAsync(payload);
      setSuccessMsg('Offer created.');
    }
    setEditing(null);
    setFormOpen(false);
  };

  const handleDelete = async () => {
    if (!deleting) return;
    try {
      await deleteOffer.mutateAsync(deleting.offerId);
      setSuccessMsg('Offer deleted.');
    } catch (e: any) {
      setErrorMsg(e.message ?? 'Failed to delete offer.');
    } finally {
      setDeleting(null);
    }
  };

  const columns: ColDef<Offer>[] = [
    { key: 'plan', header: 'Plan', sx: { fontWeight: 500 }, render: (o) => o.planName },
    {
      key: 'discount', header: 'Discount',
      render: (o) => (
        <Chip label={`${o.discountPercent}% off`} size="small" color="primary" sx={{ fontSize: 11, fontWeight: 600 }} />
      ),
    },
    { key: 'day', header: 'Day', render: (o) => o.dayOfWeek ? DAYS[o.dayOfWeek] : '—' },
    {
      key: 'hours', header: 'Hours',
      sx: { fontSize: 12, color: 'text.secondary' },
      render: (o) => (o.startHour && o.endHour) ? `${o.startHour} – ${o.endHour}` : '—',
    },
    {
      key: 'active', header: 'Active',
      render: (o) => o.active
        ? <CheckCircle fontSize="small" color="success" />
        : <Cancel fontSize="small" color="disabled" />,
    },
    {
      key: 'actions', header: '', align: 'right',
      render: (o) => (
        <RowMenu
          offer={o}
          onEdit={(o) => { setEditing(o); setFormOpen(true); }}
          onDelete={setDeleting}
        />
      ),
    },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, flexWrap: 'wrap', gap: 1 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>Offers</Typography>
          <Typography variant="body2" color="text.secondary">
            {offers.length} offer{offers.length !== 1 ? 's' : ''}
          </Typography>
        </Box>
        <AppButton text="Add Offer" onClick={() => { setEditing(null); setFormOpen(true); }} />
      </Box>

      {errorMsg && (
        <Alert severity="error" onClose={() => setErrorMsg('')} sx={{ mb: 2 }}>{errorMsg}</Alert>
      )}

      <AppTable
        columns={columns}
        rows={offers}
        loading={isLoading}
        getRowKey={(o) => o.offerId}
        emptyMessage="No offers yet."
      />

      <OfferFormModal
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditing(null); }}
        onSubmit={handleSubmit}
        loading={createOffer.isPending || updateOffer.isPending}
        plans={plans}
        editing={editing}
      />

      <ConfirmDialog
        open={!!deleting}
        title="Delete offer"
        message={`Delete the ${deleting?.discountPercent}% off offer for ${deleting?.planName}?`}
        onConfirm={handleDelete}
        onClose={() => setDeleting(null)}
        loading={deleteOffer.isPending}
      />

      <Snackbar open={!!successMsg} autoHideDuration={4000} onClose={() => setSuccessMsg('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity="success" onClose={() => setSuccessMsg('')} sx={{ borderRadius: 2 }}>{successMsg}</Alert>
      </Snackbar>
    </Box>
  );
}
