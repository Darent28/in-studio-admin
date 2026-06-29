import { useState, useMemo } from 'react';
import { Box, Typography, Alert, Snackbar, TextField, InputAdornment } from '@mui/material';
import { Search } from '@mui/icons-material';
import { AppButton } from '../shared/components/AppButton';
import { ConfirmDialog } from '../shared/components/ConfirmDialog';
import { UserTable } from '../features/users/components/UserTable';
import { UserFormModal } from '../features/users/components/UserFormModal';
import { UserProfileDrawer } from '../features/users/components/UserProfileDrawer';
import { useUsers, useCreateUser, useUpdateUser, useDeleteUser } from '../features/users/hooks/useUsers';
import type { AdminUser, AdminUserPayload } from '../types/adminUser';

export function UsersPage() {
  const { data: users = [], isLoading } = useUsers();
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();

  const [formOpen, setFormOpen] = useState(false);
  const [selected, setSelected] = useState<AdminUser | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null);
  const [profileUser, setProfileUser] = useState<AdminUser | null>(null);
  const [formError, setFormError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u: AdminUser) =>
      u.firstName.toLowerCase().includes(q) ||
      u.lastName.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q)
    );
  }, [users, search]);

  const openCreate = () => { setSelected(null); setFormError(''); setFormOpen(true); };
  const openEdit = (user: AdminUser) => { setSelected(user); setFormError(''); setFormOpen(true); };

  const handleFormSubmit = async (payload: AdminUserPayload) => {
    setFormError('');
    try {
      if (selected) {
        await updateUser.mutateAsync({ id: selected.userId, payload });
        setSuccessMsg('Member updated successfully.');
      } else {
        await createUser.mutateAsync(payload);
        setSuccessMsg('Member created successfully.');
      }
      setFormOpen(false);
    } catch (err: any) {
      setFormError(err.message ?? 'Something went wrong.');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteUser.mutateAsync(deleteTarget.userId);
      setSuccessMsg('Member deleted successfully.');
      setDeleteTarget(null);
    } catch {
      setDeleteTarget(null);
    }
  };

  const isFormLoading = createUser.isPending || updateUser.isPending;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, flexWrap: 'wrap', gap: 1 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>Members</Typography>
          <Typography variant="body2" color="text.secondary">{users.length} total members</Typography>
        </Box>
        <AppButton text="Create Member" onClick={openCreate} />
      </Box>

      <Box sx={{ mb: 2 }}>
        <TextField
          size="small"
          placeholder="Search by name or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ width: { xs: '100%', sm: 280 } }}
          slotProps={{ input: { startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment> } }}
        />
      </Box>

      <UserTable
        users={filtered}
        loading={isLoading}
        onEdit={openEdit}
        onDelete={setDeleteTarget}
        onProfile={setProfileUser}
      />

      <UserFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
        user={selected}
        loading={isFormLoading}
        error={formError}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Member"
        message={`Are you sure you want to delete ${deleteTarget?.firstName} ${deleteTarget?.lastName}? This action cannot be undone.`}
        loading={deleteUser.isPending}
      />

      <UserProfileDrawer user={profileUser} onClose={() => setProfileUser(null)} />

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
