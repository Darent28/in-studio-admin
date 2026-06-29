import { useState, useEffect } from 'react';
import { Box, MenuItem, Select, InputLabel, FormControl, Checkbox, FormControlLabel, Alert } from '@mui/material';
import { AppModal } from '../../../shared/components/AppModal';
import { AppInput } from '../../../shared/components/AppInput';
import { AppButton } from '../../../shared/components/AppButton';
import { PasswordField } from '../../../shared/components/PasswordField';
import type { AdminUser, AdminUserPayload, UserRole } from '../../../types/adminUser';

interface UserFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: AdminUserPayload) => Promise<void>;
  user?: AdminUser | null;
  loading?: boolean;
  error?: string;
}

const EMPTY: AdminUserPayload = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  phone: '',
  birthdate: '',
  role: 'CLIENT',
  active: true,
};

export function UserFormModal({ open, onClose, onSubmit, user, loading, error }: UserFormModalProps) {
  const isEdit = !!user;
  const [form, setForm] = useState<AdminUserPayload>(EMPTY);

  useEffect(() => {
    if (open) {
      setForm(
        user
          ? { firstName: user.firstName, lastName: user.lastName, email: user.email,
              password: '', phone: user.phone ?? '', birthdate: user.birthdate ?? '',
              role: user.role, active: user.active }
          : EMPTY
      );
    }
  }, [open, user]);

  const set = (field: keyof AdminUserPayload) => (value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async () => {
    const payload: AdminUserPayload = { ...form };
    if (isEdit && !payload.password) delete payload.password;
    if (!payload.phone) delete payload.phone;
    if (!payload.birthdate) delete payload.birthdate;
    await onSubmit(payload);
  };

  return (
    <AppModal open={open} onClose={onClose} title={isEdit ? 'Edit User' : 'Create User'}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
        {error && <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>}

        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
          <AppInput label="First Name" value={form.firstName} onChange={set('firstName')} required />
          <AppInput label="Last Name" value={form.lastName} onChange={set('lastName')} required />
        </Box>

        <AppInput label="Email" value={form.email} onChange={set('email')} type="email" required />

        <PasswordField
          label={isEdit ? 'New Password (leave blank to keep)' : 'Password'}
          value={form.password ?? ''}
          onChange={(v) => setForm((p) => ({ ...p, password: v }))}
          autoComplete={isEdit ? 'new-password' : 'new-password'}
        />

        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
          <AppInput label="Phone" value={form.phone ?? ''} onChange={set('phone')} />
          <AppInput label="Birthdate" value={form.birthdate ?? ''} onChange={set('birthdate')} type="date" />
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, alignItems: 'center' }}>
          <FormControl fullWidth size="small">
            <InputLabel>Role</InputLabel>
            <Select
              value={form.role}
              label="Role"
              onChange={(e) => setForm((p) => ({ ...p, role: e.target.value as UserRole }))}
            >
              <MenuItem value="CLIENT">Client</MenuItem>
              <MenuItem value="STAFF">Staff</MenuItem>
              <MenuItem value="ADMIN">Admin</MenuItem>
            </Select>
          </FormControl>

          {isEdit && (
            <FormControlLabel
              control={
                <Checkbox
                  checked={form.active}
                  onChange={(e) => setForm((p) => ({ ...p, active: e.target.checked }))}
                />
              }
              label="Active"
            />
          )}
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 1 }}>
          <AppButton text="Cancel" variant="outlined" onClick={onClose} />
          <AppButton text={isEdit ? 'Save Changes' : 'Create User'} onClick={handleSubmit} loading={loading} />
        </Box>
      </Box>
    </AppModal>
  );
}
