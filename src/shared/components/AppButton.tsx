import { Button, CircularProgress } from '@mui/material';
import type { SxProps, Theme } from '@mui/material';

interface AppButtonProps {
  text: string;
  size?: 'small' | 'medium' | 'large';
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'contained' | 'outlined' | 'text';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  sx?: SxProps<Theme>;
}

export function AppButton({
  text,
  size = 'medium',
  onClick,
  type = 'button',
  variant = 'contained',
  disabled = false,
  loading = false,
  fullWidth = false,
  sx,
}: AppButtonProps) {
  return (
    <Button
      type={type}
      size={size}
      variant={variant}
      onClick={onClick}
      disabled={disabled || loading}
      fullWidth={fullWidth}
      sx={{ borderRadius: '50px', ...sx }}
    >
      {loading ? <CircularProgress size={20} color="inherit" /> : text}
    </Button>
  );
}
