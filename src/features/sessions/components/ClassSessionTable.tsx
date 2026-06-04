import { useState } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Menu, MenuItem, CircularProgress, Box, Chip, ListItemIcon } from '@mui/material';
import { Settings, Edit, Delete } from '@mui/icons-material';
import type { ClassSession, SessionStatus } from '../../../types/classSession';

const STATUS_COLORS: Record<SessionStatus, 'success' | 'error' | 'default'> = {
  SCHEDULED: 'success', CANCELLED: 'error', COMPLETED: 'default',
};

const DAY_ABBR: Record<string, string> = {
  MONDAY: 'Mon', TUESDAY: 'Tue', WEDNESDAY: 'Wed',
  THURSDAY: 'Thu', FRIDAY: 'Fri', SATURDAY: 'Sat', SUNDAY: 'Sun',
};

interface ClassSessionTableProps {
  sessions: ClassSession[];
  loading?: boolean;
  onEdit: (session: ClassSession) => void;
  onDelete: (session: ClassSession) => void;
}

function RowMenu({ session, onEdit, onDelete }: { session: ClassSession; onEdit: (s: ClassSession) => void; onDelete: (s: ClassSession) => void }) {
  const [anchor, setAnchor] = useState<null | HTMLElement>(null);
  return (
    <>
      <IconButton size="small" onClick={(e) => setAnchor(e.currentTarget)}><Settings fontSize="small" /></IconButton>
      <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={() => setAnchor(null)} transformOrigin={{ horizontal: 'right', vertical: 'top' }} anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}>
        <MenuItem onClick={() => { setAnchor(null); onEdit(session); }}>
          <ListItemIcon><Edit fontSize="small" /></ListItemIcon>Edit
        </MenuItem>
        <MenuItem onClick={() => { setAnchor(null); onDelete(session); }} sx={{ color: 'error.main' }}>
          <ListItemIcon><Delete fontSize="small" color="error" /></ListItemIcon>Delete
        </MenuItem>
      </Menu>
    </>
  );
}

export function ClassSessionTable({ sessions, loading, onEdit, onDelete }: ClassSessionTableProps) {
  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>;
  return (
    <TableContainer component={Paper} sx={{ border: '1px solid', borderColor: 'divider' }}>
      <Table>
        <TableHead>
          <TableRow sx={{ '& th': { fontWeight: 700, color: 'text.secondary', fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5 } }}>
            <TableCell>Instructor</TableCell>
            <TableCell>Room</TableCell>
            <TableCell>Start</TableCell>
            <TableCell>End</TableCell>
            <TableCell>Days</TableCell>
            <TableCell>Capacity</TableCell>
            <TableCell>Booked</TableCell>
            <TableCell>Status</TableCell>
            <TableCell align="right" />
          </TableRow>
        </TableHead>
        <TableBody>
          {sessions.map((s) => (
            <TableRow key={s.sessionId} hover>
              <TableCell>{s.instructorFirstName} {s.instructorLastName}</TableCell>
              <TableCell>{s.roomName}</TableCell>
              <TableCell sx={{ fontSize: 13 }}>{s.startTime}</TableCell>
              <TableCell sx={{ fontSize: 13 }}>{s.endTime}</TableCell>
              <TableCell sx={{ fontSize: 12 }}>
                {s.days?.length ? s.days.map((d) => DAY_ABBR[d] ?? d).join(', ') : '—'}
              </TableCell>
              <TableCell>{s.capacity}</TableCell>
              <TableCell>{s.bookedCount}</TableCell>
              <TableCell><Chip label={s.status} size="small" color={STATUS_COLORS[s.status]} sx={{ fontSize: 11, fontWeight: 600 }} /></TableCell>
              <TableCell align="right"><RowMenu session={s} onEdit={onEdit} onDelete={onDelete} /></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
