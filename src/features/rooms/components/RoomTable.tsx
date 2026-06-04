import { useState } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Menu, MenuItem, CircularProgress, Box, Chip, ListItemIcon } from '@mui/material';
import { Settings, Edit, Delete, CheckCircle, Cancel } from '@mui/icons-material';
import type { Room } from '../../../types/room';

interface RoomTableProps {
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
      <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={() => setAnchor(null)} transformOrigin={{ horizontal: 'right', vertical: 'top' }} anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}>
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

export function RoomTable({ rooms, loading, onEdit, onDelete }: RoomTableProps) {
  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>;
  return (
    <TableContainer component={Paper} sx={{ border: '1px solid', borderColor: 'divider' }}>
      <Table>
        <TableHead>
          <TableRow sx={{ '& th': { fontWeight: 700, color: 'text.secondary', fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5 } }}>
            <TableCell>Name</TableCell>
            <TableCell>Capacity</TableCell>
            <TableCell>Location</TableCell>
            <TableCell>Equipment</TableCell>
            <TableCell>Active</TableCell>
            <TableCell align="right" />
          </TableRow>
        </TableHead>
        <TableBody>
          {rooms.map((r) => (
            <TableRow key={r.roomId} hover>
              <TableCell sx={{ fontWeight: 500 }}>{r.name}</TableCell>
              <TableCell>{r.capacity}</TableCell>
              <TableCell>{r.location ?? '—'}</TableCell>
              <TableCell>{r.equipment ?? '—'}</TableCell>
              <TableCell>{r.active ? <CheckCircle fontSize="small" color="success" /> : <Cancel fontSize="small" color="disabled" />}</TableCell>
              <TableCell align="right"><RowMenu room={r} onEdit={onEdit} onDelete={onDelete} /></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
