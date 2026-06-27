import { Dialog, DialogTitle, DialogContent, IconButton, useMediaQuery, useTheme } from '@mui/material';
import { Close } from '@mui/icons-material';
import type { ReactNode } from 'react';

interface AppModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg';
}

export function AppModal({ open, onClose, title, children, maxWidth = 'sm' }: AppModalProps) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  return (
    <Dialog open={open} onClose={onClose} maxWidth={maxWidth} fullWidth fullScreen={fullScreen}>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pr: 1, fontWeight: 700 }}>
        {title}
        <IconButton onClick={onClose} size="small"><Close fontSize="small" /></IconButton>
      </DialogTitle>
      <DialogContent dividers>{children}</DialogContent>
    </Dialog>
  );
}
