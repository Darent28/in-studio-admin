import type { ReactNode } from 'react';
import { Box, Typography, Alert } from '@mui/material';

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  error?: string;
  maxWidth?: number;
  children: ReactNode;
  footer?: ReactNode;
}

export function AuthLayout({ title, subtitle, error, maxWidth = 420, children, footer }: AuthLayoutProps) {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
        background: 'radial-gradient(ellipse at 50% 0%, #241540 0%, #0F0820 60%)',
      }}
    >
      <Box sx={{ maxWidth, width: '100%' }}>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Box
            sx={{
              width: 72,
              height: 72,
              borderRadius: '20px',
              background: 'linear-gradient(135deg, #7C3AED 0%, #4C1D95 100%)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 2,
              boxShadow: '0 8px 32px rgba(124, 58, 237, 0.4)',
            }}
          >
            <Typography sx={{ color: '#fff', fontSize: 26, fontWeight: 800, letterSpacing: 1 }}>
              IS
            </Typography>
          </Box>

          <Typography variant="h5" sx={{ fontWeight: 700 }} color="text.primary">
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {subtitle}
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 2, bgcolor: '#3B0A0A', border: '1px solid #F87171' }}>
            {error}
          </Alert>
        )}

        {children}
        {footer}
      </Box>
    </Box>
  );
}
