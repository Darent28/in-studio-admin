import { useState, useMemo } from 'react';
import { Box, Typography, Alert, Snackbar, TextField, InputAdornment } from '@mui/material';
import { Search } from '@mui/icons-material';
import { AppButton } from '../shared/components/AppButton';
import { ConfirmDialog } from '../shared/components/ConfirmDialog';
import { ClassSessionTable } from '../features/sessions/components/ClassSessionTable';
import { ClassSessionFormModal } from '../features/sessions/components/ClassSessionFormModal';
import { useClassSessions, useCreateSession, useUpdateSession, useDeleteSession } from '../features/sessions/hooks/useClassSessions';
import type { ClassSession, ClassSessionPayload } from '../types/classSession';

export function ClassSessionsPage() {
  const { data: sessions = [], isLoading } = useClassSessions();
  const createSession = useCreateSession();
  const updateSession = useUpdateSession();
  const deleteSession = useDeleteSession();

  const [formOpen, setFormOpen] = useState(false);
  const [selected, setSelected] = useState<ClassSession | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ClassSession | null>(null);
  const [formError, setFormError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return sessions;
    return sessions.filter((s: ClassSession) =>
      (s.title ?? '').toLowerCase().includes(q) ||
      s.instructorFirstName.toLowerCase().includes(q) ||
      s.instructorLastName.toLowerCase().includes(q) ||
      s.roomName.toLowerCase().includes(q)
    );
  }, [sessions, search]);

  const openCreate = () => { setSelected(null); setFormError(''); setFormOpen(true); };
  const openEdit = (session: ClassSession) => { setSelected(session); setFormError(''); setFormOpen(true); };

  const handleFormSubmit = async (payload: ClassSessionPayload) => {
    setFormError('');
    try {
      if (selected) {
        await updateSession.mutateAsync({ id: selected.sessionId, payload });
        setSuccessMsg('Session updated successfully.');
      } else {
        await createSession.mutateAsync(payload);
        setSuccessMsg('Session created successfully.');
      }
      setFormOpen(false);
    } catch (err: any) {
      setFormError(err.message ?? 'Something went wrong.');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteSession.mutateAsync(deleteTarget.sessionId);
      setSuccessMsg('Session deleted successfully.');
    } catch {
      // error handled silently
    } finally {
      setDeleteTarget(null);
    }
  };

  const fmtSession = (s: ClassSession) =>
    `${s.instructorFirstName} ${s.instructorLastName} at ${s.startTime}`;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, flexWrap: 'wrap', gap: 1 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>Class Sessions</Typography>
          <Typography variant="body2" color="text.secondary">{sessions.length} total sessions</Typography>
        </Box>
        <AppButton text="Create Session" onClick={openCreate} />
      </Box>

      <Box sx={{ mb: 2 }}>
        <TextField
          size="small"
          placeholder="Search by title, instructor or room…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ width: { xs: '100%', sm: 300 } }}
          slotProps={{ input: { startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment> } }}
        />
      </Box>

      <ClassSessionTable sessions={filtered} loading={isLoading} onEdit={openEdit} onDelete={setDeleteTarget} />

      <ClassSessionFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
        session={selected}
        loading={createSession.isPending || updateSession.isPending}
        error={formError}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Session"
        message={`Are you sure you want to delete the session "${deleteTarget ? fmtSession(deleteTarget) : ''}"? This action cannot be undone.`}
        loading={deleteSession.isPending}
      />

      <Snackbar open={!!successMsg} autoHideDuration={3000} onClose={() => setSuccessMsg('')} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity="success" onClose={() => setSuccessMsg('')} sx={{ borderRadius: 2 }}>{successMsg}</Alert>
      </Snackbar>
    </Box>
  );
}
