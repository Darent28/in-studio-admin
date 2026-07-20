import { useState } from 'react';
import {
  Box, Typography, Alert, Snackbar, Chip,
  IconButton, Menu, MenuItem, ListItemIcon,
  Paper, TextField, FormControl, InputLabel, Select,
  Divider, CircularProgress,
} from '@mui/material';
import { CheckCircle, Cancel, Settings, Edit, Delete } from '@mui/icons-material';
import { AppButton } from '../shared/components/AppButton';
import { AppTable } from '../shared/components/AppTable';
import { OfferFormModal } from '../features/offers/components/OfferFormModal';
import { ConfirmDialog } from '../shared/components/ConfirmDialog';
import { useOffers, useCreateOffer, useUpdateOffer, useDeleteOffer } from '../features/offers/hooks/useOffers';
import { usePlans } from '../features/plans/hooks/usePlans';
import { useAuthContext } from '../context/AuthContext';
import { api } from '../lib/api';
import type { ColDef } from '../shared/components/AppTable';
import type { Offer, OfferPayload } from '../types/offer';

// ─── helpers ─────────────────────────────────────────────────────────────────

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function daysLabel(mask: number | null): string {
  if (!mask) return 'Any day';
  return DAY_LABELS.filter((_, i) => (mask >> i) & 1).join(', ');
}

function fmtDate(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// ─── RowMenu ─────────────────────────────────────────────────────────────────

function RowMenu({ offer, onEdit, onDelete }: { offer: Offer; onEdit: (o: Offer) => void; onDelete: (o: Offer) => void }) {
  const [anchor, setAnchor] = useState<null | HTMLElement>(null);
  const { user } = useAuthContext();
  if (user?.role === 'STAFF') return null;
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

// ─── ValidateCard ─────────────────────────────────────────────────────────────

function ValidateCard({ plans }: { plans: Array<{ planId: number; name: string }> }) {
  const { token } = useAuthContext();
  const today = new Date().toISOString().slice(0, 10);
  const nowTime = new Date().toTimeString().slice(0, 5);

  const [planId, setPlanId] = useState<number | ''>('');
  const [date, setDate] = useState(today);
  const [time, setTime] = useState(nowTime);
  const [result, setResult] = useState<Offer | null | 'none' | 'idle'>('idle');
  const [loading, setLoading] = useState(false);

  const handleValidate = async () => {
    if (!planId || !date || !time) return;
    setLoading(true);
    try {
      const offer = await api.admin.offers.validate(planId as number, date, time, token!);
      setResult(offer ?? 'none');
    } catch {
      setResult('none');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, mb: 3 }}>
      <Box sx={{ px: 2.5, py: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Validate Offer</Typography>
        <Typography variant="caption" color="text.secondary">
          Check if an active offer applies to a plan on a specific date and time
        </Typography>
      </Box>

      <Box sx={{ p: 2.5, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel>Plan</InputLabel>
          <Select<number | ''>
            value={planId}
            label="Plan"
            onChange={(e) => { setPlanId(e.target.value as number | ''); setResult('idle'); }}
          >
            {plans.map((p) => (
              <MenuItem key={p.planId} value={p.planId}>{p.name}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          size="small"
          label="Date"
          type="date"
          value={date}
          onChange={(e) => { setDate(e.target.value); setResult('idle'); }}
          slotProps={{ inputLabel: { shrink: true } }}
          sx={{ width: 160 }}
        />

        <TextField
          size="small"
          label="Time"
          type="time"
          value={time}
          onChange={(e) => { setTime(e.target.value); setResult('idle'); }}
          slotProps={{ inputLabel: { shrink: true } }}
          sx={{ width: 130 }}
        />

        <AppButton
          text="Validate"
          onClick={handleValidate}
          loading={loading}
          sx={{ height: 40 }}
        />
      </Box>

      {result !== 'idle' && (
        <>
          <Divider />
          <Box sx={{ px: 2.5, py: 2 }}>
            {loading ? (
              <CircularProgress size={20} />
            ) : result === 'none' ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Cancel fontSize="small" color="error" />
                <Typography variant="body2" color="error.main" sx={{ fontWeight: 600 }}>
                  No active offer found for this plan on that date and time.
                </Typography>
              </Box>
            ) : result && typeof result === 'object' ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                <CheckCircle fontSize="small" color="success" />
                <Typography variant="body2" sx={{ fontWeight: 700, color: 'success.main' }}>
                  Offer applies!
                </Typography>
                <Chip label={`${result.discountPercent}% off`} size="small" color="success" sx={{ fontWeight: 700, fontSize: 13 }} />
                <Typography variant="body2" color="text.secondary">
                  {result.planName}
                </Typography>
                {result.daysOfWeek ? (
                  <Chip label={daysLabel(result.daysOfWeek)} size="small" variant="outlined" sx={{ fontSize: 11 }} />
                ) : null}
                {(result.startDate || result.endDate) && (
                  <Chip label={`${fmtDate(result.startDate)} → ${fmtDate(result.endDate)}`} size="small" variant="outlined" sx={{ fontSize: 11 }} />
                )}
                {(result.startHour || result.endHour) && (
                  <Chip label={`${result.startHour ?? '—'} – ${result.endHour ?? '—'}`} size="small" variant="outlined" sx={{ fontSize: 11 }} />
                )}
              </Box>
            ) : null}
          </Box>
        </>
      )}
    </Paper>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

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
    {
      key: 'validity', header: 'Validity',
      render: (o) => {
        if (o.startDate || o.endDate) {
          return (
            <Box>
              <Chip label="Date range" size="small" variant="outlined" sx={{ fontSize: 10, mb: 0.5 }} />
              <Typography variant="caption" sx={{ display: 'block', fontSize: 12, color: 'text.secondary' }}>
                {fmtDate(o.startDate)} → {fmtDate(o.endDate)}
              </Typography>
            </Box>
          );
        }
        return (
          <Box>
            <Chip label="Day of week" size="small" variant="outlined" sx={{ fontSize: 10, mb: 0.5 }} />
            <Typography variant="caption" sx={{ display: 'block', fontSize: 12, color: 'text.secondary' }}>
              {daysLabel(o.daysOfWeek)}
            </Typography>
          </Box>
        );
      },
    },
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

      <ValidateCard plans={plans} />

      {errorMsg && (
        <Alert severity="error" onClose={() => setErrorMsg('')} sx={{ mb: 2 }}>{errorMsg}</Alert>
      )}

      <AppTable
        columns={columns}
        rows={offers}
        loading={isLoading}
        getRowKey={(o) => o.offerId}
        emptyMessage="No offers yet."
        title="Offers"
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
