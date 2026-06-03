import { useState } from 'react';
import { TextField, InputAdornment, IconButton } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import type { SxProps, Theme } from '@mui/material';

interface PasswordFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  helperText?: string;
  error?: boolean;
  autoComplete?: string;
  sx?: SxProps<Theme>;
}

export function PasswordField({ label, value, onChange, helperText, error, autoComplete, sx }: PasswordFieldProps) {
  const [show, setShow] = useState(false);

  return (
    <TextField
      label={label}
      type={show ? 'text' : 'password'}
      fullWidth
      required
      value={value}
      onChange={(e) => onChange(e.target.value)}
      helperText={helperText}
      error={error}
      autoComplete={autoComplete}
      sx={sx}
      slotProps={{
        input: {
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                onClick={() => setShow(!show)}
                edge="end"
                aria-label={show ? 'Hide password' : 'Show password'}
              >
                {show ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        },
      }}
    />
  );
}
