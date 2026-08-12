import { useState } from 'react';
import {
  Box, Typography, Paper, FormControl, InputLabel, Select, MenuItem, TextField, Snackbar, Alert,
} from '@mui/material';
import { AppButton } from '../shared/components/AppButton';
import { DynamicResultsTable } from '../shared/components/DynamicResultsTable';
import { useRooms } from '../features/rooms/hooks/useRooms';
import { useReportPreview, downloadReport } from '../features/reports/hooks/useReports';
import { useAuthContext } from '../context/AuthContext';
import { REPORT_TYPES, AVAILABLE_REPORT_TYPES, ROOM_FILTERABLE_REPORT_TYPES } from '../types/report';
import type { ReportType, ReportFilters } from '../types/report';
import type { Room } from '../types/room';

export function BasicReportPage() {
  const { token } = useAuthContext();
  const { data: rooms = [] } = useRooms();

  const [roomId, setRoomId] = useState<number | 'ALL'>('ALL');
  const [type, setType] = useState<ReportType | ''>('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [notice, setNotice] = useState('');
  const [downloading, setDownloading] = useState(false);

  const isAvailable = !!type && AVAILABLE_REPORT_TYPES.has(type);
  const isRoomFilterable = !!type && ROOM_FILTERABLE_REPORT_TYPES.has(type);

  const filters: ReportFilters = {
    type: type || 'BOOKINGS',
    roomId: isRoomFilterable && roomId !== 'ALL' ? roomId : undefined,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
  };

  const { data: result, isFetching, refetch } = useReportPreview(filters);

  const handleView = () => {
    if (!isAvailable) {
      setNotice('This report type isn’t built yet — coming in a later phase.');
      return;
    }
    refetch();
  };

  const handleDownload = async () => {
    if (!isAvailable) {
      setNotice('This report type isn’t built yet — coming in a later phase.');
      return;
    }
    setDownloading(true);
    try {
      await downloadReport(filters, token!);
    } catch (err: any) {
      setNotice(err.message ?? 'Download failed.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>Basic Report</Typography>

      <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 2.5, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <FormControl size="small" sx={{ minWidth: 180 }} disabled={!isRoomFilterable}>
            <InputLabel>Room</InputLabel>
            <Select
              value={roomId}
              label="Room"
              onChange={(e) => setRoomId(e.target.value as number | 'ALL')}
            >
              <MenuItem value="ALL">All rooms</MenuItem>
              {rooms.map((r: Room) => (
                <MenuItem key={r.roomId} value={r.roomId}>{r.name}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 260 }}>
            <InputLabel>Type</InputLabel>
            <Select
              value={type}
              label="Type"
              onChange={(e) => setType(e.target.value as ReportType)}
            >
              {REPORT_TYPES.map((t) => (
                <MenuItem key={t.value} value={t.value} disabled={!AVAILABLE_REPORT_TYPES.has(t.value)}>
                  {t.label}{!AVAILABLE_REPORT_TYPES.has(t.value) ? ' (coming soon)' : ''}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            size="small"
            label="Start"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
            sx={{ width: 160 }}
          />

          <TextField
            size="small"
            label="End"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
            sx={{ width: 160 }}
          />

          <Box sx={{ display: 'flex', gap: 1 }}>
            <AppButton text="View" variant="outlined" onClick={handleView} disabled={!type} loading={isFetching} sx={{ height: 40 }} />
            <AppButton text="Download" onClick={handleDownload} disabled={!type} loading={downloading} sx={{ height: 40 }} />
          </Box>
        </Box>
      </Paper>

      {result && <DynamicResultsTable result={result} loading={isFetching} />}

      <Snackbar open={!!notice} autoHideDuration={4000} onClose={() => setNotice('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity="info" onClose={() => setNotice('')} sx={{ borderRadius: 2 }}>{notice}</Alert>
      </Snackbar>
    </Box>
  );
}
