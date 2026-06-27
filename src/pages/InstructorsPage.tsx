import { useState, useMemo } from 'react';
import { Box, Typography, Alert, Snackbar, TextField, InputAdornment } from '@mui/material';
import { Search } from '@mui/icons-material';
import { AppButton } from '../shared/components/AppButton';
import { ConfirmDialog } from '../shared/components/ConfirmDialog';
import { InstructorTable } from '../features/instructors/components/InstructorTable';
import { AssignInstructorModal } from '../features/instructors/components/AssignInstructorModal';
import { EditInstructorModal } from '../features/instructors/components/EditInstructorModal';
import { useInstructors, useCreateInstructor, useUpdateInstructor, useDeleteInstructor } from '../features/instructors/hooks/useInstructors';
import type { Instructor, InstructorPayload, InstructorUpdatePayload } from '../types/instructor';

export function InstructorsPage() {
  const { data: instructors = [], isLoading } = useInstructors();
  const createInstructor = useCreateInstructor();
  const updateInstructor = useUpdateInstructor();
  const deleteInstructor = useDeleteInstructor();

  const [assignOpen, setAssignOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Instructor | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Instructor | null>(null);
  const [formError, setFormError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return instructors;
    return instructors.filter((i: Instructor) =>
      i.firstName.toLowerCase().includes(q) ||
      i.lastName.toLowerCase().includes(q) ||
      i.email.toLowerCase().includes(q) ||
      (i.specialty ?? '').toLowerCase().includes(q)
    );
  }, [instructors, search]);

  const handleAssign = async (payload: InstructorPayload) => {
    setFormError('');
    try {
      await createInstructor.mutateAsync(payload);
      setSuccessMsg('Instructor assigned successfully.');
      setAssignOpen(false);
    } catch (err: any) {
      setFormError(err.message ?? 'Something went wrong.');
    }
  };

  const handleEdit = async (payload: InstructorUpdatePayload) => {
    if (!editTarget) return;
    setFormError('');
    try {
      await updateInstructor.mutateAsync({ id: editTarget.instructorId, payload });
      setSuccessMsg('Instructor updated.');
      setEditTarget(null);
    } catch (err: any) {
      setFormError(err.message ?? 'Something went wrong.');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteInstructor.mutateAsync(deleteTarget.instructorId);
      setSuccessMsg('Instructor removed.');
      setDeleteTarget(null);
    } catch {
      setDeleteTarget(null);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, flexWrap: 'wrap', gap: 1 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>Instructors</Typography>
          <Typography variant="body2" color="text.secondary">{instructors.length} total instructors</Typography>
        </Box>
        <AppButton text="Assign Instructor" onClick={() => { setFormError(''); setAssignOpen(true); }} />
      </Box>

      <Box sx={{ mb: 2 }}>
        <TextField
          size="small"
          placeholder="Search by name, email or specialty…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ width: { xs: '100%', sm: 300 } }}
          slotProps={{ input: { startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment> } }}
        />
      </Box>

      <InstructorTable
        instructors={filtered}
        loading={isLoading}
        onEdit={(i) => { setFormError(''); setEditTarget(i); }}
        onDelete={setDeleteTarget}
      />

      <AssignInstructorModal
        open={assignOpen}
        onClose={() => setAssignOpen(false)}
        onSubmit={handleAssign}
        loading={createInstructor.isPending}
        error={formError}
      />

      <EditInstructorModal
        open={!!editTarget}
        onClose={() => setEditTarget(null)}
        onSubmit={handleEdit}
        instructor={editTarget}
        loading={updateInstructor.isPending}
        error={formError}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Remove Instructor"
        message={`Remove ${deleteTarget?.firstName} ${deleteTarget?.lastName} as instructor? The user account will not be deleted.`}
        loading={deleteInstructor.isPending}
      />

      <Snackbar
        open={!!successMsg}
        autoHideDuration={3000}
        onClose={() => setSuccessMsg('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity="success" onClose={() => setSuccessMsg('')} sx={{ borderRadius: 2 }}>
          {successMsg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
