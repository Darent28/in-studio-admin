import React, { useState, useMemo } from 'react';
import {
  Box, Typography, Accordion, AccordionSummary, AccordionDetails,
  Chip, Avatar, CircularProgress, Alert, Divider,
  FormControl, InputLabel, Select, MenuItem,
} from '@mui/material';
import { ExpandMore } from '@mui/icons-material';
import { useSessionSchedule } from '../features/sessions/hooks/useSessionSchedule';
import type { Attendee, SessionSchedule } from '../types/sessionSchedule';

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function SpotsChip({ session }: { session: SessionSchedule }) {
  const spots = Math.max(0, session.capacity - session.reservedCount);
  if (spots === 0) return <Chip label="Full" size="small" color="error" sx={{ fontSize: 11 }} />;
  if (spots <= 3) return <Chip label={`${spots} spot${spots === 1 ? '' : 's'} left`} size="small" color="warning" sx={{ fontSize: 11 }} />;
  return <Chip label={`${spots} spots available`} size="small" color="success" sx={{ fontSize: 11 }} />;
}

function WaitlistChip({ count }: { count: number }) {
  if (count === 0) return null;
  return <Chip label={`${count} on waitlist`} size="small" color="info" variant="outlined" sx={{ fontSize: 11 }} />;
}

export function SchedulePage() {
  const [date, setDate] = useState(todayISO());
  const [instructor, setInstructor] = useState('ALL');

  const { data: sessions = [], isLoading, isError } = useSessionSchedule(date);

  const instructors = useMemo(() => {
    const seen = new Set<string>();
    return sessions
      .filter((s: SessionSchedule) => {
        const name = `${s.instructorFirstName} ${s.instructorLastName}`;
        if (seen.has(name)) return false;
        seen.add(name);
        return true;
      })
      .map((s: SessionSchedule) => `${s.instructorFirstName} ${s.instructorLastName}`);
  }, [sessions]);

  const visible = useMemo(() =>
    instructor === 'ALL'
      ? sessions
      : sessions.filter((s: SessionSchedule) =>
          `${s.instructorFirstName} ${s.instructorLastName}` === instructor
        ),
    [sessions, instructor]
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>Schedule</Typography>
          <Typography variant="body2" color="text.secondary">
            {visible.length} session{visible.length !== 1 ? 's' : ''} on this day
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Instructor</InputLabel>
            <Select
              value={instructor}
              label="Instructor"
              onChange={(e) => setInstructor(e.target.value)}
            >
              <MenuItem value="ALL">All instructors</MenuItem>
              {instructors.map((name: string) => (
                <MenuItem key={name} value={name}>{name}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <Box
            component="input"
            type="date"
            value={date}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setDate(e.target.value);
              setInstructor('ALL');
            }}
            sx={{
              px: '14px', py: '8.5px',
              border: '1px solid rgba(0,0,0,0.23)', borderRadius: 1,
              fontSize: 14, fontFamily: 'inherit', outline: 'none', cursor: 'pointer',
              '&:focus': { borderColor: 'primary.main', borderWidth: '2px' },
            }}
          />
        </Box>
      </Box>

      {isError && <Alert severity="error" sx={{ mb: 2 }}>Failed to load schedule.</Alert>}

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : visible.length === 0 ? (
        <Box sx={{ py: 8, textAlign: 'center', color: 'text.secondary' }}>
          <Typography>No sessions scheduled for this day.</Typography>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {visible.map((session: SessionSchedule) => (
            <Accordion
              key={session.sessionId}
              disableGutters
              elevation={0}
              sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '8px !important', '&:before': { display: 'none' } }}
            >
              <AccordionSummary expandIcon={<ExpandMore />} sx={{ px: 2.5, py: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1, flexWrap: 'wrap', mr: 1 }}>
                  <Box sx={{ minWidth: 60 }}>
                    <Typography variant="body2" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                      {session.startTime}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {session.endTime}
                    </Typography>
                  </Box>

                  <Divider orientation="vertical" flexItem />

                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {session.title ?? `Session #${session.sessionId}`}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {session.instructorFirstName} {session.instructorLastName} · {session.roomName}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexShrink: 0 }}>
                    <SpotsChip session={session} />
                    <WaitlistChip count={session.onHoldCount} />
                    <Chip
                      label={`${session.reservedCount}/${session.capacity}`}
                      size="small"
                      variant="outlined"
                      sx={{ fontSize: 11, color: 'text.secondary' }}
                    />
                  </Box>
                </Box>
              </AccordionSummary>

              <AccordionDetails sx={{ px: 2.5, pt: 0, pb: 2 }}>
                <Divider sx={{ mb: 2 }} />
                {session.attendees.length === 0 ? (
                  <Typography variant="body2" color="text.secondary" sx={{ py: 1 }}>
                    No bookings yet for this session.
                  </Typography>
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {session.attendees.map((a: Attendee) => (
                      <Box key={a.reservationId} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar sx={{ width: 30, height: 30, fontSize: 12, bgcolor: a.status === 'ON_HOLD' ? 'grey.400' : 'primary.main' }}>
                          {a.firstName[0]}{a.lastName[0]}
                        </Avatar>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                            {a.firstName} {a.lastName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" noWrap>
                            {a.email}
                          </Typography>
                        </Box>
                        <Chip
                          label={a.status === 'ON_HOLD' ? 'Waitlist' : 'Reserved'}
                          size="small"
                          color={a.status === 'ON_HOLD' ? 'default' : 'success'}
                          sx={{ fontSize: 11 }}
                        />
                      </Box>
                    ))}
                  </Box>
                )}
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      )}
    </Box>
  );
}
