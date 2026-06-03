import { useState } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, IconButton, Menu, MenuItem, CircularProgress, Box, Chip, ListItemIcon,
} from '@mui/material';
import { Settings, Edit, Delete, CheckCircle, Cancel } from '@mui/icons-material';
import type { AdminUser } from '../../../types/adminUser';

const ROLE_COLORS: Record<string, 'default' | 'primary' | 'secondary' | 'warning'> = {
  CLIENT: 'default',
  STAFF: 'warning',
  ADMIN: 'secondary',
};

interface UserTableProps {
  users: AdminUser[];
  loading?: boolean;
  onEdit: (user: AdminUser) => void;
  onDelete: (user: AdminUser) => void;
}

function RowMenu({ user, onEdit, onDelete }: { user: AdminUser; onEdit: (u: AdminUser) => void; onDelete: (u: AdminUser) => void }) {
  const [anchor, setAnchor] = useState<null | HTMLElement>(null);
  return (
    <>
      <IconButton size="small" onClick={(e) => setAnchor(e.currentTarget)}>
        <Settings fontSize="small" />
      </IconButton>
      <Menu
        anchorEl={anchor}
        open={Boolean(anchor)}
        onClose={() => setAnchor(null)}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={() => { setAnchor(null); onEdit(user); }}>
          <ListItemIcon><Edit fontSize="small" /></ListItemIcon>
          Edit
        </MenuItem>
        <MenuItem onClick={() => { setAnchor(null); onDelete(user); }} sx={{ color: 'error.main' }}>
          <ListItemIcon><Delete fontSize="small" color="error" /></ListItemIcon>
          Delete
        </MenuItem>
      </Menu>
    </>
  );
}

export function UserTable({ users, loading, onEdit, onDelete }: UserTableProps) {
  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>;
  }

  return (
    <TableContainer component={Paper} sx={{ border: '1px solid', borderColor: 'divider' }}>
      <Table>
        <TableHead>
          <TableRow sx={{ '& th': { fontWeight: 700, color: 'text.secondary', fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5 } }}>
            <TableCell>Name</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Phone</TableCell>
            <TableCell>Role</TableCell>
            <TableCell>Active</TableCell>
            <TableCell>Verified</TableCell>
            <TableCell>Created</TableCell>
            <TableCell align="right" />
          </TableRow>
        </TableHead>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.userId} hover>
              <TableCell sx={{ fontWeight: 500 }}>{user.firstName} {user.lastName}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.phone ?? '—'}</TableCell>
              <TableCell>
                <Chip label={user.role} size="small" color={ROLE_COLORS[user.role] ?? 'default'} sx={{ textTransform: 'capitalize', fontSize: 11 }} />
              </TableCell>
              <TableCell>
                {user.active ? <CheckCircle fontSize="small" color="success" /> : <Cancel fontSize="small" color="disabled" />}
              </TableCell>
              <TableCell>
                {user.emailVerified ? <CheckCircle fontSize="small" color="success" /> : <Cancel fontSize="small" color="disabled" />}
              </TableCell>
              <TableCell sx={{ color: 'text.secondary', fontSize: 13 }}>
                {new Date(user.createdAt).toLocaleDateString()}
              </TableCell>
              <TableCell align="right">
                <RowMenu user={user} onEdit={onEdit} onDelete={onDelete} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
