import { useState, useMemo } from 'react';
import {
  Box, Typography, Accordion, AccordionSummary, AccordionDetails,
  Chip, Avatar, CircularProgress, Alert, Divider, Snackbar,
  FormControl, Select, MenuItem, IconButton, Tooltip,
} from '@mui/material';
import { ExpandMore, ChevronLeft, ChevronRight, Edit } from '@mui/icons-material';
import { useSessionSchedule } from '../features/sessions/hooks/useSessionSchedule';
import { useClassSessions, useUpdateSession } from '../features/sessions/hooks/useClassSessions';
import { ClassSessionFormModal } from '../features/sessions/components/ClassSessionFormModal';
import type { Attendee, SessionSchedule } from '../types/sessionSchedule';
import type { ClassSession, ClassSessionPayload } from '../types/classSession';

// ─── helpers ────────────────────────────────────────────────────────────────

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];
const DAYS_ABBR = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

function isoToDateParts(iso: string) {
  const [y, m, d] = iso.split('-').map(Number);
  return { year: y, month: m - 1, day: d };
}

// ─── MiniCalendar ────────────────────────────────────────────────────────────

function MiniCalendar({ value, onChange }: { value: string; onChange: (iso: string) => void }) {
  const today = todayISO();
  const { year: selYear, month: selMonth, day: selDay } = isoToDateParts(value);

  const [viewYear, setViewYear] = useState(selYear);
  const [viewMonth, setViewMonth] = useState(selMonth);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const daysInPrev = new Date(viewYear, viewMonth, 0).getDate();

  const cells: { day: number; curr: boolean }[] = [];
  for (let i = firstDay - 1; i >= 0; i--) cells.push({ day: daysInPrev - i, curr: false });
  for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d, curr: true });
  while (cells.length % 7 !== 0) cells.push({ day: cells.length - firstDay - daysInMonth + 1, curr: false });

  const isSelected = (day: number, curr: boolean) =>
    curr && day === selDay && viewMonth === selMonth && viewYear === selYear;

  const isToday = (day: number, curr: boolean) => {
    if (!curr) return false;
    const iso = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return iso === today;
  };

  const handleClick = (day: number, curr: boolean) => {
    if (!curr) return;
    const iso = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    onChange(iso);
  };

  return (
    <Box>
      {/* nav */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <IconButton size="small" onClick={prevMonth}><ChevronLeft fontSize="small" /></IconButton>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {MONTHS[viewMonth].slice(0, 3)} {viewYear}
        </Typography>
        <IconButton size="small" onClick={nextMonth}><ChevronRight fontSize="small" /></IconButton>
      </Box>

      {/* weekday headers */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', mb: 0.5 }}>
        {DAYS_ABBR.map(d => (
          <Typography key={d} variant="caption" align="center"
            sx={{ color: 'text.disabled', fontWeight: 600, fontSize: 11, py: 0.5 }}>
            {d}
          </Typography>
        ))}
      </Box>

      {/* days */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: '2px' }}>
        {cells.map((cell, i) => {
          const selected = isSelected(cell.day, cell.curr);
          const today_ = isToday(cell.day, cell.curr);
          return (
            <Box
              key={i}
              onClick={() => handleClick(cell.day, cell.curr)}
              sx={{
                aspectRatio: '1',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderRadius: '50%',
                cursor: cell.curr ? 'pointer' : 'default',
                bgcolor: selected ? 'primary.main' : 'transparent',
                border: today_ && !selected ? '1.5px solid' : 'none',
                borderColor: 'text.secondary',
                '&:hover': cell.curr && !selected ? { bgcolor: 'action.hover' } : {},
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  fontSize: 13,
                  fontWeight: selected || today_ ? 700 : 400,
                  color: selected ? 'primary.contrastText'
                    : !cell.curr ? 'text.disabled'
                    : 'text.primary',
                  lineHeight: 1,
                }}
              >
                {cell.day}
              </Typography>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}

// ─── chips ───────────────────────────────────────────────────────────────────

function SpotsChip({ session }: { session: SessionSchedule }) {
  const spots = Math.max(0, session.capacity - session.reservedCount);
  if (spots === 0) return <Chip label="Full" size="small" color="error" sx={{ fontSize: 11 }} />;
  if (spots <= 3) return <Chip label={`${spots} left`} size="small" color="warning" sx={{ fontSize: 11 }} />;
  return <Chip label={`${spots} available`} size="small" color="success" sx={{ fontSize: 11 }} />;
}

function WaitlistChip({ count }: { count: number }) {
  if (count === 0) return null;
  return <Chip label={`${count} waitlist`} size="small" color="info" variant="outlined" sx={{ fontSize: 11 }} />;
}

// ─── Page ────────────────────────────────────────────────────────────────────

export function SchedulePage() {
  const [date, setDate] = useState(todayISO());
  const [instructor, setInstructor] = useState('ALL');
  const [room, setRoom] = useState('ALL');
  const [editTarget, setEditTarget] = useState<ClassSession | null>(null);
  const [formError, setFormError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const { data: sessions = [], isLoading, isError } = useSessionSchedule(date);
  const { data: allSessions = [] } = useClassSessions();
  const updateSession = useUpdateSession();

  const instructors = useMemo(() => {
    const seen = new Set<string>();
    return sessions
      .filter((s: SessionSchedule) => {
        const n = `${s.instructorFirstName} ${s.instructorLastName}`;
        if (seen.has(n)) return false;
        seen.add(n); return true;
      })
      .map((s: SessionSchedule) => `${s.instructorFirstName} ${s.instructorLastName}`);
  }, [sessions]);

  const rooms = useMemo(() => {
    const seen = new Set<string>();
    return sessions
      .filter((s: SessionSchedule) => { if (seen.has(s.roomName)) return false; seen.add(s.roomName); return true; })
      .map((s: SessionSchedule) => s.roomName);
  }, [sessions]);

  const visible = useMemo(() =>
    sessions.filter((s: SessionSchedule) => {
      if (instructor !== 'ALL' && `${s.instructorFirstName} ${s.instructorLastName}` !== instructor) return false;
      if (room !== 'ALL' && s.roomName !== room) return false;
      return true;
    }),
    [sessions, instructor, room]
  );

  const handleDateChange = (iso: string) => {
    setDate(iso);
    setInstructor('ALL');
    setRoom('ALL');
  };

  const openEdit = (s: SessionSchedule) => {
    const full = allSessions.find((c: ClassSession) => c.sessionId === s.sessionId);
    if (full) { setFormError(''); setEditTarget(full); }
  };

  const handleEditSubmit = async (payload: ClassSessionPayload) => {
    if (!editTarget) return;
    setFormError('');
    try {
      await updateSession.mutateAsync({ id: editTarget.sessionId, payload });
      setSuccessMsg('Session updated.');
      setEditTarget(null);
    } catch (err: any) {
      setFormError(err.message ?? 'Something went wrong.');
    }
  };

  const { year, month } = isoToDateParts(date);

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>Schedule</Typography>

      <Box sx={{ display: 'flex', gap: 3, alignItems: 'flex-start', flexWrap: 'wrap' }}>

        {/* ── Left panel ── */}
        <Box sx={{ width: { xs: '100%', sm: 280 }, flexShrink: 0 }}>
          <Typography variant="h4" sx={{ fontWeight: 300, mb: 2, color: 'text.primary' }}>
            {MONTHS[month]} {year}
          </Typography>

          <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 2, mb: 3 }}>
            <MiniCalendar value={date} onChange={handleDateChange} />
          </Box>

          {/* Filter by instructor */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ fontWeight: 700, mb: 0.75 }}>Filter by instructor</Typography>
            <FormControl fullWidth size="small">
              <Select value={instructor} onChange={(e) => setInstructor(e.target.value)}>
                <MenuItem value="ALL">All instructors</MenuItem>
                {instructors.map((n: string) => (
                  <MenuItem key={n} value={n}>{n}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* Filter by room */}
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 700, mb: 0.75 }}>Filter by room</Typography>
            <FormControl fullWidth size="small">
              <Select value={room} onChange={(e) => setRoom(e.target.value)}>
                <MenuItem value="ALL">All rooms</MenuItem>
                {rooms.map((r: string) => (
                  <MenuItem key={r} value={r}>{r}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Box>

        {/* ── Right panel ── */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {visible.length} session{visible.length !== 1 ? 's' : ''} on this day
          </Typography>

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
                  disableGutters elevation={0}
                  sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '8px !important', '&:before': { display: 'none' } }}
                >
                  <AccordionSummary expandIcon={<ExpandMore />} sx={{ px: { xs: 1.5, sm: 2.5 }, py: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 }, flex: 1, flexWrap: 'wrap', mr: 1 }}>
                      <Box sx={{ minWidth: 52 }}>
                        <Typography variant="body2" sx={{ fontWeight: 700, lineHeight: 1.2 }}>{session.startTime}</Typography>
                        <Typography variant="caption" color="text.secondary">{session.endTime}</Typography>
                      </Box>

                      <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', sm: 'block' } }} />

                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="body1" sx={{ fontWeight: 600, fontSize: { xs: 14, sm: 16 } }}>
                          {session.title ?? `Session #${session.sessionId}`}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" noWrap>
                          {session.instructorFirstName} {session.instructorLastName} · {session.roomName}
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center', flexWrap: 'wrap', flexShrink: 0 }}>
                        <SpotsChip session={session} />
                        <WaitlistChip count={session.onHoldCount} />
                        <Chip label={`${session.reservedCount}/${session.capacity}`} size="small" variant="outlined"
                          sx={{ fontSize: 11, color: 'text.secondary' }} />
                        <Tooltip title="Edit session">
                          <IconButton
                            size="small"
                            onClick={(e) => { e.stopPropagation(); openEdit(session); }}
                            sx={{ ml: 0.5 }}
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>
                  </AccordionSummary>

                  <AccordionDetails sx={{ px: { xs: 1.5, sm: 2.5 }, pt: 0, pb: 2 }}>
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
                              <Typography variant="caption" color="text.secondary" noWrap>{a.email}</Typography>
                            </Box>
                            {a.spotNumber && (
                              <Chip label={`Spot ${a.spotNumber}`} size="small" variant="outlined" sx={{ fontSize: 11 }} />
                            )}
                            <Chip label={a.status === 'ON_HOLD' ? 'Waitlist' : 'Reserved'} size="small"
                              color={a.status === 'ON_HOLD' ? 'default' : 'success'} sx={{ fontSize: 11 }} />
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
      </Box>

      <ClassSessionFormModal
        open={!!editTarget}
        onClose={() => setEditTarget(null)}
        onSubmit={handleEditSubmit}
        session={editTarget}
        loading={updateSession.isPending}
        error={formError}
      />

      <Snackbar open={!!successMsg} autoHideDuration={3000} onClose={() => setSuccessMsg('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity="success" onClose={() => setSuccessMsg('')} sx={{ borderRadius: 2 }}>{successMsg}</Alert>
      </Snackbar>
    </Box>
  );
}
