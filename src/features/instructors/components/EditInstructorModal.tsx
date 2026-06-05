import { useState, useEffect } from 'react';
import { Box, Alert, Checkbox, FormControlLabel, Avatar, Typography, Divider } from '@mui/material';
import { AppModal } from '../../../shared/components/AppModal';
import { AppInput } from '../../../shared/components/AppInput';
import { AppButton } from '../../../shared/components/AppButton';
import type { Instructor, InstructorUpdatePayload } from '../../../types/instructor';

interface EditInstructorModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: InstructorUpdatePayload) => Promise<void>;
  instructor: Instructor | null;
  loading?: boolean;
  error?: string;
}

function initials(first: string, last: string) {
  return `${first[0] ?? ''}${last[0] ?? ''}`.toUpperCase();
}

export function EditInstructorModal({ open, onClose, onSubmit, instructor, loading, error }: EditInstructorModalProps) {
  const [specialty, setSpecialty] = useState('');
  const [bio, setBio] = useState('');
  const [active, setActive] = useState(true);

  useEffect(() => {
    if (open && instructor) {
      setSpecialty(instructor.specialty ?? '');
      setBio(instructor.bio ?? '');
      setActive(instructor.active);
    }
  }, [open, instructor]);

  const handleSubmit = async () => {
    const payload: InstructorUpdatePayload = { active };
    if (specialty) payload.specialty = specialty;
    if (bio) payload.bio = bio;
    await onSubmit(payload);
  };

  return (
    <AppModal open={open} onClose={onClose} title="Edit Instructor">
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
        {error && <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>}

        {instructor && (
          <>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5, bgcolor: 'grey.50', borderRadius: 2 }}>
              <Avatar sx={{ width: 36, height: 36, fontSize: 14, bgcolor: 'primary.main' }}>
                {initials(instructor.firstName, instructor.lastName)}
              </Avatar>
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {instructor.firstName} {instructor.lastName}
                </Typography>
                <Typography variant="caption" color="text.secondary">{instructor.email}</Typography>
              </Box>
            </Box>
            <Divider />
          </>
        )}

        <AppInput label="Specialty" value={specialty} onChange={setSpecialty} />
        <AppInput label="Bio" value={bio} onChange={setBio} />

        <FormControlLabel
          control={<Checkbox checked={active} onChange={(e) => setActive(e.target.checked)} />}
          label="Active"
        />

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 1 }}>
          <AppButton text="Cancel" variant="outlined" onClick={onClose} />
          <AppButton text="Save Changes" onClick={handleSubmit} loading={loading} />
        </Box>
      </Box>
    </AppModal>
  );
}
