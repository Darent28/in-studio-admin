import { useState } from 'react';
import { Avatar, Box, Chip, IconButton, ListItemIcon, Menu, MenuItem, Typography } from '@mui/material';
import { Settings, Edit, Delete } from '@mui/icons-material';
import { AppTable } from '../../../shared/components/AppTable';
import { useAuthContext } from '../../../context/AuthContext';
import type { ColDef } from '../../../shared/components/AppTable';
import type { Instructor } from '../../../types/instructor';

interface Props {
  instructors: Instructor[];
  loading: boolean;
  onEdit: (instructor: Instructor) => void;
  onDelete: (instructor: Instructor) => void;
}

function initials(first: string, last: string) {
  return `${first[0] ?? ''}${last[0] ?? ''}`.toUpperCase();
}

function RowMenu({ instructor, onEdit, onDelete, isStaff }: { instructor: Instructor; onEdit: (i: Instructor) => void; onDelete: (i: Instructor) => void; isStaff: boolean }) {
  const [anchor, setAnchor] = useState<null | HTMLElement>(null);
  if (isStaff) return null;
  return (
    <>
      <IconButton size="small" onClick={(e) => setAnchor(e.currentTarget)}><Settings fontSize="small" /></IconButton>
      <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={() => setAnchor(null)}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}>
        <MenuItem onClick={() => { setAnchor(null); onEdit(instructor); }}>
          <ListItemIcon><Edit fontSize="small" /></ListItemIcon>Edit
        </MenuItem>
        <MenuItem onClick={() => { setAnchor(null); onDelete(instructor); }} sx={{ color: 'error.main' }}>
          <ListItemIcon><Delete fontSize="small" color="error" /></ListItemIcon>Delete
        </MenuItem>
      </Menu>
    </>
  );
}

export function InstructorTable({ instructors, loading, onEdit, onDelete }: Props) {
  const { user } = useAuthContext();
  const isStaff = user?.role === 'STAFF';
  const columns: ColDef<Instructor>[] = [
    {
      key: 'instructor', header: 'Instructor',
      render: (i) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar sx={{ width: 32, height: 32, fontSize: 13, bgcolor: 'primary.main' }}>
            {initials(i.firstName, i.lastName)}
          </Avatar>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>{i.firstName} {i.lastName}</Typography>
            {i.bio && (
              <Typography variant="caption" color="text.secondary"
                sx={{ display: 'block', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {i.bio}
              </Typography>
            )}
          </Box>
        </Box>
      ),
    },
    { key: 'email', header: 'Email', sx: { color: 'text.secondary', fontSize: 13 }, render: (i) => i.email },
    { key: 'specialty', header: 'Specialty', sx: { color: 'text.secondary', fontSize: 13 }, render: (i) => i.specialty ?? '—' },
    {
      key: 'status', header: 'Status', align: 'center',
      render: (i) => (
        <Chip label={i.active ? 'Active' : 'Inactive'} size="small"
          color={i.active ? 'success' : 'default'} variant="outlined" />
      ),
    },
    { key: 'actions', header: '', align: 'right', render: (i) => <RowMenu instructor={i} onEdit={onEdit} onDelete={onDelete} isStaff={isStaff} /> },
  ];

  return (
    <AppTable
      columns={columns}
      rows={instructors}
      loading={loading}
      getRowKey={(i) => i.instructorId}
      emptyMessage="No instructors yet."
    />
  );
}
