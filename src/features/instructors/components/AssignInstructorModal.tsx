import { useState, useEffect, useMemo } from 'react';
import {
  Box, Alert, Typography, InputAdornment, CircularProgress,
  List, ListItemButton, ListItemAvatar, ListItemText, Avatar, Chip, Divider,
} from '@mui/material';
import { Search, CheckCircle, PersonAdd } from '@mui/icons-material';
import { AppModal } from '../../../shared/components/AppModal';
import { AppInput } from '../../../shared/components/AppInput';
import { AppButton } from '../../../shared/components/AppButton';
import { useUsers } from '../../users/hooks/useUsers';
import { useInstructors } from '../hooks/useInstructors';
import type { AdminUser } from '../../../types/adminUser';
import type { Instructor, InstructorPayload } from '../../../types/instructor';

interface AssignInstructorModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: InstructorPayload) => Promise<void>;
  loading?: boolean;
  error?: string;
}

function initials(first: string, last: string) {
  return `${first[0] ?? ''}${last[0] ?? ''}`.toUpperCase();
}

export function AssignInstructorModal({ open, onClose, onSubmit, loading, error }: AssignInstructorModalProps) {
  const { data: users = [], isLoading: loadingUsers } = useUsers();
  const { data: instructors = [] } = useInstructors();

  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<AdminUser | null>(null);
  const [specialty, setSpecialty] = useState('');
  const [bio, setBio] = useState('');

  useEffect(() => {
    if (!open) {
      setQuery('');
      setSelected(null);
      setSpecialty('');
      setBio('');
    }
  }, [open]);

  const assignedUserIds = useMemo(
    () => new Set(instructors.map((i: Instructor) => i.userId)),
    [instructors],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return users.filter((u: AdminUser) => {
      if (assignedUserIds.has(u.userId)) return false;
      if (!q) return true;
      return (
        u.firstName.toLowerCase().includes(q) ||
        u.lastName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q)
      );
    });
  }, [users, assignedUserIds, query]);

  const handleSelect = (user: AdminUser) =>
    setSelected((prev) => (prev?.userId === user.userId ? null : user));

  const handleSubmit = async () => {
    if (!selected) return;
    const payload: InstructorPayload = { userId: selected.userId };
    if (specialty) payload.specialty = specialty;
    if (bio) payload.bio = bio;
    await onSubmit(payload);
  };

  return (
    <AppModal open={open} onClose={onClose} title="Assign Instructor">
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
        {error && <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>}

        <AppInput
          label="Search by name or email"
          value={query}
          onChange={setQuery}
          startAdornment={
            <InputAdornment position="start">
              {loadingUsers
                ? <CircularProgress size={16} />
                : <Search fontSize="small" sx={{ color: 'text.disabled' }} />}
            </InputAdornment>
          }
        />

        {filtered.length > 0 && (
          <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden', maxHeight: 220, overflowY: 'auto' }}>
            <List dense disablePadding>
              {filtered.map((user: AdminUser, idx: number) => {
                const isSelected = selected?.userId === user.userId;
                return (
                  <Box key={user.userId}>
                    {idx > 0 && <Divider component="li" />}
                    <ListItemButton onClick={() => handleSelect(user)} selected={isSelected} sx={{ gap: 1 }}>
                      <ListItemAvatar sx={{ minWidth: 40 }}>
                        <Avatar sx={{ width: 32, height: 32, fontSize: 13, bgcolor: isSelected ? 'primary.main' : 'grey.300' }}>
                          {initials(user.firstName, user.lastName)}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={`${user.firstName} ${user.lastName}`}
                        secondary={user.email}
                        slotProps={{
                          primary: { style: { fontSize: 14, fontWeight: isSelected ? 700 : 400 } },
                          secondary: { style: { fontSize: 12 } },
                        }}
                      />
                      {isSelected && <CheckCircle fontSize="small" color="primary" />}
                    </ListItemButton>
                  </Box>
                );
              })}
            </List>
          </Box>
        )}

        {!loadingUsers && query.trim() && filtered.length === 0 && (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 1 }}>
            No users found matching "{query}"
          </Typography>
        )}

        {selected && (
          <>
            <Divider />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5, bgcolor: 'primary.50', borderRadius: 2, border: '1px solid', borderColor: 'primary.200' }}>
              <PersonAdd fontSize="small" color="primary" />
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {selected.firstName} {selected.lastName}
                </Typography>
                <Typography variant="caption" color="text.secondary">{selected.email}</Typography>
              </Box>
              <Chip label="Selected" size="small" color="primary" variant="outlined" />
            </Box>

            <AppInput label="Specialty (optional)" value={specialty} onChange={setSpecialty} />
            <AppInput label="Bio (optional)" value={bio} onChange={setBio} />
          </>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 1 }}>
          <AppButton text="Cancel" variant="outlined" onClick={onClose} />
          <AppButton text="Assign Instructor" onClick={handleSubmit} loading={loading} disabled={!selected} />
        </Box>
      </Box>
    </AppModal>
  );
}
