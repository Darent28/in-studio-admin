import { useState } from 'react';
import { Chip, IconButton, ListItemIcon, Menu, MenuItem } from '@mui/material';
import { Settings, Edit, Delete } from '@mui/icons-material';
import { AppTable } from '../../../shared/components/AppTable';
import { useAuthContext } from '../../../context/AuthContext';
import type { ColDef } from '../../../shared/components/AppTable';
import type { ClassSession, SessionStatus } from '../../../types/classSession';

const STATUS_COLORS: Record<SessionStatus, 'success' | 'error' | 'default'> = {
  SCHEDULED: 'success', CANCELLED: 'error', COMPLETED: 'default',
};

const DAY_ABBR: Record<string, string> = {
  MONDAY: 'Mon', TUESDAY: 'Tue', WEDNESDAY: 'Wed',
  THURSDAY: 'Thu', FRIDAY: 'Fri', SATURDAY: 'Sat', SUNDAY: 'Sun',
};

interface Props {
  sessions: ClassSession[];
  loading?: boolean;
  onEdit: (session: ClassSession) => void;
  onDelete: (session: ClassSession) => void;
}

function RowMenu({ session, onEdit, onDelete }: { session: ClassSession; onEdit: (s: ClassSession) => void; onDelete: (s: ClassSession) => void }) {
  const [anchor, setAnchor] = useState<null | HTMLElement>(null);
  const { user } = useAuthContext();
  if (user?.role === 'STAFF') return null;
  return (
    <>
      <IconButton size="small" onClick={(e) => setAnchor(e.currentTarget)}><Settings fontSize="small" /></IconButton>
      <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={() => setAnchor(null)}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}>
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

export function ClassSessionTable({ sessions, loading, onEdit, onDelete }: Props) {
  const columns: ColDef<ClassSession>[] = [
    { key: 'title', header: 'Title', sx: { fontWeight: 500 }, render: (s) => s.title ?? '—' },
    { key: 'instructor', header: 'Instructor', render: (s) => `${s.instructorFirstName} ${s.instructorLastName}` },
    { key: 'room', header: 'Room', render: (s) => s.roomName },
    { key: 'start', header: 'Start', sx: { fontSize: 13 }, render: (s) => s.startTime },
    { key: 'end', header: 'End', sx: { fontSize: 13 }, render: (s) => s.endTime },
    { key: 'days', header: 'Days', sx: { fontSize: 12 }, render: (s) => s.days?.length ? s.days.map((d) => DAY_ABBR[d] ?? d).join(', ') : '—' },
    { key: 'status', header: 'Status', render: (s) => <Chip label={s.status} size="small" color={STATUS_COLORS[s.status]} sx={{ fontSize: 11, fontWeight: 600 }} />, exportValue: (s) => s.status },
    { key: 'actions', header: '', align: 'right', render: (s) => <RowMenu session={s} onEdit={onEdit} onDelete={onDelete} /> },
  ];

  return (
    <AppTable
      columns={columns}
      rows={sessions}
      loading={loading}
      getRowKey={(s) => s.sessionId}
      emptyMessage="No sessions yet."
      title="Class Sessions"
    />
  );
}
