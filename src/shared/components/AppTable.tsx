import { ReactNode } from 'react';
import {
  Box, CircularProgress, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow,
} from '@mui/material';
import type { SxProps, Theme } from '@mui/material';

export interface ColDef<T> {
  key: string;
  header: string;
  align?: 'left' | 'center' | 'right';
  sx?: SxProps<Theme>;
  render: (row: T) => ReactNode;
}

interface AppTableProps<T> {
  columns: ColDef<T>[];
  rows: T[];
  loading?: boolean;
  getRowKey: (row: T) => string | number;
  emptyMessage?: string;
}

export function AppTable<T>({
  columns, rows, loading, getRowKey, emptyMessage = 'No data found.',
}: AppTableProps<T>) {
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <TableContainer component={Paper} sx={{ border: '1px solid', borderColor: 'divider' }}>
      <Table>
        <TableHead>
          <TableRow sx={{ '& th': { fontWeight: 700, color: 'text.secondary', fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5 } }}>
            {columns.map((col) => (
              <TableCell key={col.key} align={col.align}>{col.header}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : rows.map((row) => (
            <TableRow key={getRowKey(row)} hover>
              {columns.map((col) => (
                <TableCell key={col.key} align={col.align} sx={col.sx}>
                  {col.render(row)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
