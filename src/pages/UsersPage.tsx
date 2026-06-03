import { useState } from 'react';
import { Box, Typography, Alert, Snackbar } from '@mui/material';
import { AppButton } from '../shared/components/AppButton';
import { ConfirmDialog } from '../shared/components/ConfirmDialog';
import { UserTable } from '../features/users/components/UserTable';
import { UserFormModal } from '../features/users/components/UserFormModal';
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
  const [formError, setFormError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const openCreate = () => { setSelected(null); setFormError(''); setFormOpen(true); };
  const openEdit = (user: AdminUser) => { setSelected(user); setFormError(''); setFormOpen(true); };

  const handleFormSubmit = async (payload: AdminUserPayload) => {
    setFormError('');
    try {
      if (selected) {
        await updateUser.mutateAsync({ id: selected.userId, payload });
        setSuccessMsg('User updated successfully.');
      } else {
        await createUser.mutateAsync(payload);
        setSuccessMsg('User created successfully.');
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
      setSuccessMsg('User deleted successfully.');
      setDeleteTarget(null);
    } catch (err: any) {
      setDeleteTarget(null);
    }
  };

  const isFormLoading = createUser.isPending || updateUser.isPending;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>Users</Typography>
          <Typography variant="body2" color="text.secondary">{users.length} total users</Typography>
        </Box>
        <AppButton text="Create User" onClick={openCreate} />
      </Box>

      <UserTable
        users={users}
        loading={isLoading}
        onEdit={openEdit}
        onDelete={setDeleteTarget}
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
        title="Delete User"
        message={`Are you sure you want to delete ${deleteTarget?.firstName} ${deleteTarget?.lastName}? This action cannot be undone.`}
        loading={deleteUser.isPending}
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
