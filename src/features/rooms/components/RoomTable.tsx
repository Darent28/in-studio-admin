import { useState } from 'react';
import { IconButton, ListItemIcon, Menu, MenuItem } from '@mui/material';
import { Settings, Edit, Delete, CheckCircle, Cancel } from '@mui/icons-material';
import { AppTable } from '../../../shared/components/AppTable';
import type { ColDef } from '../../../shared/components/AppTable';
import type { Room } from '../../../types/room';

interface Props {
  rooms: Room[];
  loading?: boolean;
  onEdit: (room: Room) => void;
  onDelete: (room: Room) => void;
}

function RowMenu({ room, onEdit, onDelete }: { room: Room; onEdit: (r: Room) => void; onDelete: (r: Room) => void }) {
  const [anchor, setAnchor] = useState<null | HTMLElement>(null);
  return (
    <>
      <IconButton size="small" onClick={(e) => setAnchor(e.currentTarget)}><Settings fontSize="small" /></IconButton>
      <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={() => setAnchor(null)}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}>
        <MenuItem onClick={() => { setAnchor(null); onEdit(room); }}>
          <ListItemIcon><Edit fontSize="small" /></ListItemIcon>Edit
        </MenuItem>
        <MenuItem onClick={() => { setAnchor(null); onDelete(room); }} sx={{ color: 'error.main' }}>
          <ListItemIcon><Delete fontSize="small" color="error" /></ListItemIcon>Delete
        </MenuItem>
      </Menu>
    </>
  );
}

export function RoomTable({ rooms, loading, onEdit, onDelete }: Props) {
  const columns: ColDef<Room>[] = [
    { key: 'name', header: 'Name', sx: { fontWeight: 500 }, render: (r) => r.name },
    { key: 'capacity', header: 'Capacity', render: (r) => r.capacity },
    { key: 'location', header: 'Location', render: (r) => r.location ?? '—' },
    { key: 'equipment', header: 'Equipment', render: (r) => r.equipment ?? '—' },
    { key: 'active', header: 'Active', render: (r) => r.active ? <CheckCircle fontSize="small" color="success" /> : <Cancel fontSize="small" color="disabled" /> },
    { key: 'actions', header: '', align: 'right', render: (r) => <RowMenu room={r} onEdit={onEdit} onDelete={onDelete} /> },
  ];

  return (
    <AppTable
      columns={columns}
      rows={rooms}
      loading={loading}
      getRowKey={(r) => r.roomId}
      emptyMessage="No rooms yet."
    />
  );
}
