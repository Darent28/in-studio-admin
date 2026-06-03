import { Box, Card, CardContent } from '@mui/material';
import type { SxProps, Theme } from '@mui/material';
import type { ReactNode } from 'react';

interface AppCardProps {
  children: ReactNode;
  padding?: number;
  maxWidth?: number | string;
  sx?: SxProps<Theme>;
}

export function AppCard({ children, padding = 3, maxWidth, sx }: AppCardProps) {
  return (
    <Box sx={{ maxWidth, width: '100%' }}>
      <Card sx={sx}>
        <CardContent sx={{ p: padding, '&:last-child': { pb: padding } }}>
          {children}
        </CardContent>
      </Card>
    </Box>
  );
}
