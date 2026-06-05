import { useState } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, IconButton, Skeleton, Avatar, Typography, Box, Menu, MenuItem, ListItemIcon } from '@mui/material';
import { Delete, Edit, Settings } from '@mui/icons-material';
import type { Instructor } from '../../../types/instructor';

interface InstructorTableProps {
  instructors: Instructor[];
  loading: boolean;
  onEdit: (instructor: Instructor) => void;
  onDelete: (instructor: Instructor) => void;
}

function initials(first: string, last: string) {
  return `${first[0] ?? ''}${last[0] ?? ''}`.toUpperCase();
}

function RowMenu({ instructor, onEdit, onDelete }: { instructor: Instructor; onEdit: (i: Instructor) => void; onDelete: (i: Instructor) => void }) {
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
        <MenuItem onClick={() => { setAnchor(null); onEdit(instructor); }}>
          <ListItemIcon><Edit fontSize="small" /></ListItemIcon>
          Edit
        </MenuItem>
        <MenuItem onClick={() => { setAnchor(null); onDelete(instructor); }} sx={{ color: 'error.main' }}>
          <ListItemIcon><Delete fontSize="small" color="error" /></ListItemIcon>
          Delete
        </MenuItem>
      </Menu>
    </>
  );
}

export function InstructorTable({ instructors, loading, onEdit, onDelete }: InstructorTableProps) {
  if (loading) {
    return (
      <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
        <Table size="small">
          <TableBody>
            {Array.from({ length: 4 }).map((_, i) => (
              <TableRow key={i}>
                {Array.from({ length: 5 }).map((__, j) => (
                  <TableCell key={j}><Skeleton variant="text" /></TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  }

  return (
    <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
      <Table size="small">
        <TableHead>
          <TableRow sx={{ '& th': { fontWeight: 700, bgcolor: 'grey.50' } }}>
            <TableCell>Instructor</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Specialty</TableCell>
            <TableCell align="center">Status</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {instructors.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                No instructors yet
              </TableCell>
            </TableRow>
          ) : (
            instructors.map((instructor) => (
              <TableRow key={instructor.instructorId} hover>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar sx={{ width: 32, height: 32, fontSize: 13, bgcolor: 'primary.main' }}>
                      {initials(instructor.firstName, instructor.lastName)}
                    </Avatar>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {instructor.firstName} {instructor.lastName}
                      </Typography>
                      {instructor.bio && (
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {instructor.bio}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </TableCell>
                <TableCell sx={{ color: 'text.secondary', fontSize: 13 }}>{instructor.email}</TableCell>
                <TableCell sx={{ color: 'text.secondary', fontSize: 13 }}>{instructor.specialty ?? '—'}</TableCell>
                <TableCell align="center">
                  <Chip
                    label={instructor.active ? 'Active' : 'Inactive'}
                    size="small"
                    color={instructor.active ? 'success' : 'default'}
                    variant="outlined"
                  />
                </TableCell>
                <TableCell align="right">
                  <RowMenu instructor={instructor} onEdit={onEdit} onDelete={onDelete} />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
