import { useState, useMemo } from 'react';
import { Box, Typography, Alert, Snackbar, InputAdornment, TextField, ToggleButtonGroup, ToggleButton } from '@mui/material';
import { Search } from '@mui/icons-material';
import { AppButton } from '../shared/components/AppButton';
import { ConfirmDialog } from '../shared/components/ConfirmDialog';
import { MembershipTable } from '../features/memberships/components/MembershipTable';
import { AssignMembershipModal } from '../features/memberships/components/AssignMembershipModal';
import { AdjustCreditsModal } from '../features/memberships/components/AdjustCreditsModal';
import { ChangeStatusModal } from '../features/memberships/components/ChangeStatusModal';
import { ChangePeriodModal } from '../features/memberships/components/ChangePeriodModal';
import {
  useMemberships, useCreateMembership, useAdjustCredits,
  useChangeMembershipPeriod, useChangeMembershipStatus, useDeleteMembership,
} from '../features/memberships/hooks/useMemberships';
import type { Membership, MembershipPayload, ChangePeriodPayload, MembershipStatus } from '../types/membership';

export function MembershipsPage() {
  const { data: memberships = [], isLoading } = useMemberships();
  const createMembership = useCreateMembership();
  const adjustCredits = useAdjustCredits();
  const changePeriod = useChangeMembershipPeriod();
  const changeStatus = useChangeMembershipStatus();
  const deleteMembership = useDeleteMembership();

  const [assignOpen, setAssignOpen] = useState(false);
  const [creditTarget, setCreditTarget] = useState<Membership | null>(null);
  const [statusTarget, setStatusTarget] = useState<Membership | null>(null);
  const [periodTarget, setPeriodTarget] = useState<Membership | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Membership | null>(null);
  const [formError, setFormError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<MembershipStatus | 'ALL'>('ALL');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return memberships.filter((m: Membership) => {
      if (filterStatus !== 'ALL' && m.status !== filterStatus) return false;
      if (!q) return true;
      return (
        m.userFirstName.toLowerCase().includes(q) ||
        m.userLastName.toLowerCase().includes(q) ||
        m.userEmail.toLowerCase().includes(q) ||
        (m.lastPaymentId != null && String(m.lastPaymentId).includes(q))
      );
    });
  }, [memberships, search, filterStatus]);

  const handleAssign = async (payload: MembershipPayload) => {
    setFormError('');
    try {
      await createMembership.mutateAsync(payload);
      setSuccessMsg('Membership assigned.');
      setAssignOpen(false);
    } catch (err: any) { setFormError(err.message ?? 'Something went wrong.'); }
  };

  const handleAdjustCredits = async (delta: number) => {
    if (!creditTarget) return;
    setFormError('');
    try {
      await adjustCredits.mutateAsync({ id: creditTarget.membershipId, payload: { delta } });
      setSuccessMsg('Credits updated.');
      setCreditTarget(null);
    } catch (err: any) { setFormError(err.message ?? 'Something went wrong.'); }
  };

  const handleChangePeriod = async (payload: ChangePeriodPayload) => {
    if (!periodTarget) return;
    setFormError('');
    try {
      await changePeriod.mutateAsync({ id: periodTarget.membershipId, payload });
      setSuccessMsg('Period updated.');
      setPeriodTarget(null);
    } catch (err: any) { setFormError(err.message ?? 'Something went wrong.'); }
  };

  const handleChangeStatus = async (status: MembershipStatus) => {
    if (!statusTarget) return;
    setFormError('');
    try {
      await changeStatus.mutateAsync({ id: statusTarget.membershipId, status });
      setSuccessMsg('Status updated.');
      setStatusTarget(null);
    } catch (err: any) { setFormError(err.message ?? 'Something went wrong.'); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMembership.mutateAsync(deleteTarget.membershipId);
      setSuccessMsg('Membership deleted.');
      setDeleteTarget(null);
    } catch { setDeleteTarget(null); }
  };

  const counts = useMemo(() => ({
    total: memberships.length,
    active: memberships.filter((m: Membership) => m.status === 'ACTIVE').length,
  }), [memberships]);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>Memberships</Typography>
          <Typography variant="body2" color="text.secondary">
            {counts.active} active · {counts.total} total
          </Typography>
        </Box>
        <AppButton text="Assign Membership" onClick={() => { setFormError(''); setAssignOpen(true); }} />
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
        <TextField
          size="small"
          placeholder="Search by user, email or payment ID…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ width: 260 }}
          slotProps={{ input: { startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment> } }}
        />
        <ToggleButtonGroup
          value={filterStatus}
          exclusive
          onChange={(_, v) => { if (v) setFilterStatus(v); }}
          size="small"
        >
          {(['ALL', 'ACTIVE', 'FROZEN', 'CANCELLED', 'EXPIRED'] as const).map((s) => (
            <ToggleButton key={s} value={s} sx={{ fontSize: 11, px: 1.5 }}>{s}</ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Box>

      <MembershipTable
        memberships={filtered}
        loading={isLoading}
        onAdjustCredits={(m) => { setFormError(''); setCreditTarget(m); }}
        onChangeStatus={(m) => { setFormError(''); setStatusTarget(m); }}
        onChangePeriod={(m) => { setFormError(''); setPeriodTarget(m); }}
        onDelete={setDeleteTarget}
      />

      <AssignMembershipModal
        open={assignOpen}
        onClose={() => setAssignOpen(false)}
        onSubmit={handleAssign}
        loading={createMembership.isPending}
        error={formError}
      />

      <AdjustCreditsModal
        open={!!creditTarget}
        onClose={() => setCreditTarget(null)}
        onSubmit={handleAdjustCredits}
        membership={creditTarget}
        loading={adjustCredits.isPending}
        error={formError}
      />

      <ChangePeriodModal
        open={!!periodTarget}
        onClose={() => setPeriodTarget(null)}
        onSubmit={handleChangePeriod}
        membership={periodTarget}
        loading={changePeriod.isPending}
        error={formError}
      />

      <ChangeStatusModal
        open={!!statusTarget}
        onClose={() => setStatusTarget(null)}
        onSubmit={handleChangeStatus}
        membership={statusTarget}
        loading={changeStatus.isPending}
        error={formError}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Membership"
        message={`Delete the membership for ${deleteTarget?.userFirstName} ${deleteTarget?.userLastName}? This cannot be undone.`}
        loading={deleteMembership.isPending}
      />

      <Snackbar open={!!successMsg} autoHideDuration={3000} onClose={() => setSuccessMsg('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity="success" onClose={() => setSuccessMsg('')} sx={{ borderRadius: 2 }}>{successMsg}</Alert>
      </Snackbar>
    </Box>
  );
}
