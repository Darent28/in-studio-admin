import { useState } from 'react';
import { Box, Typography, Alert, Snackbar } from '@mui/material';
import { AppButton } from '../shared/components/AppButton';
import { ConfirmDialog } from '../shared/components/ConfirmDialog';
import { PlanTable } from '../features/plans/components/PlanTable';
import { PlanFormModal } from '../features/plans/components/PlanFormModal';
import { usePlans, useCreatePlan, useUpdatePlan, useDeletePlan } from '../features/plans/hooks/usePlans';
import type { Plan, PlanPayload } from '../types/plan';

export function PlansPage() {
  const { data: plans = [], isLoading } = usePlans();
  const createPlan = useCreatePlan();
  const updatePlan = useUpdatePlan();
  const deletePlan = useDeletePlan();

  const [formOpen, setFormOpen] = useState(false);
  const [selected, setSelected] = useState<Plan | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Plan | null>(null);
  const [formError, setFormError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const openCreate = () => { setSelected(null); setFormError(''); setFormOpen(true); };
  const openEdit = (plan: Plan) => { setSelected(plan); setFormError(''); setFormOpen(true); };

  const handleFormSubmit = async (payload: PlanPayload) => {
    setFormError('');
    try {
      if (selected) {
        await updatePlan.mutateAsync({ id: selected.planId, payload });
        setSuccessMsg('Plan updated successfully.');
      } else {
        await createPlan.mutateAsync(payload);
        setSuccessMsg('Plan created successfully.');
      }
      setFormOpen(false);
    } catch (err: any) {
      setFormError(err.message ?? 'Something went wrong.');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deletePlan.mutateAsync(deleteTarget.planId);
      setSuccessMsg('Plan deleted successfully.');
    } catch {
      // error handled silently
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>Plans</Typography>
          <Typography variant="body2" color="text.secondary">{plans.length} total plans</Typography>
        </Box>
        <AppButton text="Create Plan" onClick={openCreate} />
      </Box>

      <PlanTable plans={plans} loading={isLoading} onEdit={openEdit} onDelete={setDeleteTarget} />

      <PlanFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
        plan={selected}
        loading={createPlan.isPending || updatePlan.isPending}
        error={formError}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Plan"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        loading={deletePlan.isPending}
      />

      <Snackbar open={!!successMsg} autoHideDuration={3000} onClose={() => setSuccessMsg('')} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity="success" onClose={() => setSuccessMsg('')} sx={{ borderRadius: 2 }}>{successMsg}</Alert>
      </Snackbar>
    </Box>
  );
}
