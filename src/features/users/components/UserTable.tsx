import { useState } from 'react';
import { IconButton, Menu, MenuItem, ListItemIcon, Chip } from '@mui/material';
import { Settings, Edit, Delete, CheckCircle, Cancel, Person } from '@mui/icons-material';
import { AppTable } from '../../../shared/components/AppTable';
import type { ColDef } from '../../../shared/components/AppTable';
import type { AdminUser } from '../../../types/adminUser';

const ROLE_COLORS: Record<string, 'default' | 'primary' | 'secondary' | 'warning'> = {
  CLIENT: 'default', STAFF: 'warning', ADMIN: 'secondary',
};

interface Props {
  users: AdminUser[];
  loading?: boolean;
  onEdit: (user: AdminUser) => void;
  onDelete: (user: AdminUser) => void;
  onProfile: (user: AdminUser) => void;
}

function RowMenu({ user, onEdit, onDelete, onProfile }: {
  user: AdminUser;
  onEdit: (u: AdminUser) => void;
  onDelete: (u: AdminUser) => void;
  onProfile: (u: AdminUser) => void;
}) {
  const [anchor, setAnchor] = useState<null | HTMLElement>(null);
  return (
    <>
      <IconButton size="small" onClick={(e) => setAnchor(e.currentTarget)}><Settings fontSize="small" /></IconButton>
      <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={() => setAnchor(null)}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}>
        <MenuItem onClick={() => { setAnchor(null); onProfile(user); }}>
          <ListItemIcon><Person fontSize="small" /></ListItemIcon>View profile
        </MenuItem>
        <MenuItem onClick={() => { setAnchor(null); onEdit(user); }}>
          <ListItemIcon><Edit fontSize="small" /></ListItemIcon>Edit
        </MenuItem>
        <MenuItem onClick={() => { setAnchor(null); onDelete(user); }} sx={{ color: 'error.main' }}>
          <ListItemIcon><Delete fontSize="small" color="error" /></ListItemIcon>Delete
        </MenuItem>
      </Menu>
    </>
  );
}

export function UserTable({ users, loading, onEdit, onDelete, onProfile }: Props) {
  const columns: ColDef<AdminUser>[] = [
    { key: 'name', header: 'Name', sx: { fontWeight: 500 }, render: (u) => `${u.firstName} ${u.lastName}` },
    { key: 'email', header: 'Email', render: (u) => u.email },
    { key: 'phone', header: 'Phone', render: (u) => u.phone ?? '—' },
    { key: 'role', header: 'Role', render: (u) => <Chip label={u.role} size="small" color={ROLE_COLORS[u.role] ?? 'default'} sx={{ textTransform: 'capitalize', fontSize: 11 }} /> },
    { key: 'active', header: 'Active', render: (u) => u.active ? <CheckCircle fontSize="small" color="success" /> : <Cancel fontSize="small" color="disabled" /> },
    { key: 'verified', header: 'Verified', render: (u) => u.emailVerified ? <CheckCircle fontSize="small" color="success" /> : <Cancel fontSize="small" color="disabled" /> },
    { key: 'created', header: 'Created', sx: { color: 'text.secondary', fontSize: 13 }, render: (u) => new Date(u.createdAt).toLocaleDateString() },
    { key: 'actions', header: '', align: 'right', render: (u) => <RowMenu user={u} onEdit={onEdit} onDelete={onDelete} onProfile={onProfile} /> },
  ];

  return (
    <AppTable
      columns={columns}
      rows={users}
      loading={loading}
      getRowKey={(u) => u.userId}
      emptyMessage="No users yet."
    />
  );
}
