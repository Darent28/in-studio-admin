import { TextField } from '@mui/material';
import type { SxProps, Theme } from '@mui/material';
import type { ReactNode } from 'react';

interface AppInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  size?: 'small' | 'medium';
  autoComplete?: string;
  type?: string;
  required?: boolean;
  disabled?: boolean;
  helperText?: string;
  error?: boolean;
  placeholder?: string;
  sx?: SxProps<Theme>;
  startAdornment?: ReactNode;
}

export function AppInput({
  label,
  value,
  onChange,
  size = 'medium',
  autoComplete,
  type = 'text',
  required = false,
  disabled = false,
  helperText,
  error,
  placeholder,
  sx,
  startAdornment,
}: AppInputProps) {
  const needsShrink = type === 'time' || type === 'date' || type === 'datetime-local';
  return (
    <TextField
      label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      size={size}
      autoComplete={autoComplete}
      type={type}
      required={required}
      disabled={disabled}
      helperText={helperText}
      error={error}
      placeholder={placeholder}
      fullWidth
      slotProps={{
        ...(needsShrink ? { inputLabel: { shrink: true } } : {}),
        ...(startAdornment ? { input: { startAdornment } } : {}),
      }}
      sx={sx}
    />
  );
}
