import { useState } from 'react';
import * as XLSX from 'xlsx';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Grid, Paper, CircularProgress, Alert,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Avatar, Chip, LinearProgress, Divider, Button,
  Dialog, DialogTitle, DialogContent, IconButton,
} from '@mui/material';
import {
  CreditCard, Money, TrendingUp, People,
  CalendarMonth, ArrowForward, EmojiEvents, Inventory2,
  VisibilityOff, Visibility, Download, OpenInFull, Close,
} from '@mui/icons-material';
import { AppButton } from '../shared/components/AppButton';
import { useDashboard } from '../features/dashboard/hooks/useDashboard';
import type { TopAttendee, TopPackage, RecentMember, MemberCredits } from '../types/dashboard';
import type { Payment } from '../types/payment';
import type { SessionSchedule } from '../types/sessionSchedule';

// ─── helpers ────────────────────────────────────────────────────────────────

function fmtCurrency(n: number) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(n);
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function initials(first: string, last: string) {
  return `${first[0]}${last[0]}`.toUpperCase();
}

// ─── StatCard ────────────────────────────────────────────────────────────────

interface StatCardProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  color: string;
  sub?: string;
}

function StatCard({ label, value, icon, color, sub }: StatCardProps) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, sm: 2.5 },
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        display: 'flex',
        alignItems: 'flex-start',
        gap: 2,
      }}
    >
      <Box
        sx={{
          width: 44, height: 44, borderRadius: 2, flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          bgcolor: `${color}.50`, color: `${color}.main`,
        }}
      >
        {icon}
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, fontSize: 11 }}>
          {label}
        </Typography>
        <Typography variant="h5" sx={{ fontWeight: 800, lineHeight: 1.2, mt: 0.25 }}>
          {value}
        </Typography>
        {sub && (
          <Typography variant="caption" color="text.secondary">{sub}</Typography>
        )}
      </Box>
    </Paper>
  );
}

// ─── SectionCard ─────────────────────────────────────────────────────────────

function SectionCard({ title, action, children }: { title: React.ReactNode; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}>
      <Box sx={{ px: 2.5, py: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid', borderColor: 'divider' }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{title}</Typography>
        {action}
      </Box>
      {children}
    </Paper>
  );
}

// ─── TodayClasses ────────────────────────────────────────────────────────────

function SessionsTableBody({ sessions }: { sessions: SessionSchedule[] }) {
  return (
    <Table size="small">
      <TableHead>
        <TableRow sx={{ '& th': { fontWeight: 700, fontSize: 11, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.5 } }}>
          <TableCell>Time</TableCell>
          <TableCell>Session</TableCell>
          <TableCell>Instructor</TableCell>
          <TableCell>Room</TableCell>
          <TableCell align="center">Spots</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {sessions.map((s) => {
          const spots = Math.max(0, s.capacity - s.reservedCount);
          return (
            <TableRow key={s.sessionId} hover>
              <TableCell sx={{ fontWeight: 700, fontSize: 13, whiteSpace: 'nowrap' }}>
                {s.startTime}
                <Typography variant="caption" sx={{ display: 'block' }} color="text.secondary">{s.endTime}</Typography>
              </TableCell>
              <TableCell sx={{ fontWeight: 500 }}>{s.title ?? `#${s.sessionId}`}</TableCell>
              <TableCell sx={{ color: 'text.secondary', fontSize: 13 }}>
                {s.instructorFirstName} {s.instructorLastName}
              </TableCell>
              <TableCell sx={{ color: 'text.secondary', fontSize: 13 }}>{s.roomName}</TableCell>
              <TableCell align="center">
                <Chip
                  label={spots === 0 ? 'Full' : `${spots} left`}
                  size="small"
                  color={spots === 0 ? 'error' : spots <= 3 ? 'warning' : 'success'}
                  sx={{ fontSize: 11 }}
                />
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}

function TodayClasses({ sessions }: { sessions: SessionSchedule[] }) {
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const MAX = 5;
  const shown = sessions.slice(0, MAX);
  const hasMore = sessions.length > MAX;

  const handleExport = () => {
    const rows = sessions.map((s) => ({
      Time: `${s.startTime} – ${s.endTime}`,
      Session: s.title ?? `#${s.sessionId}`,
      Instructor: `${s.instructorFirstName} ${s.instructorLastName}`,
      Room: s.roomName,
      'Spots Left': Math.max(0, s.capacity - s.reservedCount),
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Today's Classes");
    XLSX.writeFile(wb, "todays-classes.xlsx");
  };

  return (
    <>
      <SectionCard
        title={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CalendarMonth fontSize="small" color="primary" />
            Today's Classes
            <Chip label={sessions.length} size="small" color="primary" sx={{ fontSize: 11, height: 20 }} />
          </Box>
        }
        action={
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button size="small" startIcon={<Download fontSize="small" />} onClick={handleExport} sx={{ textTransform: 'none', fontSize: 12 }}>Excel</Button>
            <AppButton text="View schedule" onClick={() => navigate('/schedule')} size="small" sx={{ fontSize: 12 }} />
          </Box>
        }
      >
        {shown.length === 0 ? (
          <Box sx={{ py: 4, textAlign: 'center', color: 'text.secondary' }}>
            <Typography variant="body2">No classes scheduled today.</Typography>
          </Box>
        ) : (
          <TableContainer sx={{ overflowX: 'auto' }}>
            <SessionsTableBody sessions={shown} />
          </TableContainer>
        )}
        {hasMore && (
          <Box sx={{ px: 2, py: 1, borderTop: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="caption" color="text.secondary">Showing {MAX} of {sessions.length}</Typography>
            <Button size="small" startIcon={<OpenInFull fontSize="small" />} onClick={() => setModalOpen(true)} sx={{ textTransform: 'none', fontSize: 12 }}>
              View all {sessions.length}
            </Button>
          </Box>
        )}
      </SectionCard>

      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>Today's Classes</Typography>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Button size="small" startIcon={<Download fontSize="small" />} onClick={handleExport} sx={{ textTransform: 'none', fontSize: 12 }}>Excel</Button>
            <IconButton size="small" onClick={() => setModalOpen(false)}><Close fontSize="small" /></IconButton>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          <TableContainer sx={{ overflowX: 'auto' }}>
            <SessionsTableBody sessions={sessions} />
          </TableContainer>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ─── RecentPurchases ─────────────────────────────────────────────────────────

function RecentPurchases({ payments }: { payments: Payment[] }) {
  return (
    <SectionCard title="Recent Package Purchases">
      {payments.length === 0 ? (
        <Box sx={{ py: 3, textAlign: 'center', color: 'text.secondary' }}>
          <Typography variant="body2">No purchases yet.</Typography>
        </Box>
      ) : (
        <Box>
          {payments.map((p, i) => (
            <Box key={p.paymentId}>
              {i > 0 && <Divider />}
              <Box sx={{ px: 2.5, py: 1.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Avatar sx={{ width: 34, height: 34, fontSize: 13, bgcolor: 'primary.main' }}>
                  {initials(p.userFirstName, p.userLastName)}
                </Avatar>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                    {p.userFirstName} {p.userLastName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" noWrap>{p.planName}</Typography>
                </Box>
                <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>{fmtCurrency(p.amount)}</Typography>
                  <Chip
                    label={p.method}
                    size="small"
                    sx={{ fontSize: 10, height: 18 }}
                    color={p.method === 'CARD' ? 'primary' : 'default'}
                    variant="outlined"
                  />
                </Box>
              </Box>
            </Box>
          ))}
        </Box>
      )}
    </SectionCard>
  );
}

// ─── TopAttendees ────────────────────────────────────────────────────────────

function TopAttendees({ attendees }: { attendees: TopAttendee[] }) {
  const max = attendees[0]?.attendanceCount ?? 1;

  return (
    <SectionCard
      title={
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <EmojiEvents fontSize="small" sx={{ color: 'warning.main' }} />
          Top Member Attendance
        </Box>
      }
    >
      {attendees.length === 0 ? (
        <Box sx={{ py: 3, textAlign: 'center', color: 'text.secondary' }}>
          <Typography variant="body2">No attendance data yet.</Typography>
        </Box>
      ) : (
        <Box>
          {attendees.map((a, i) => (
            <Box key={a.userId}>
              {i > 0 && <Divider />}
              <Box sx={{ px: 2.5, py: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.75 }}>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.disabled', minWidth: 16 }}>
                    #{i + 1}
                  </Typography>
                  <Avatar sx={{ width: 28, height: 28, fontSize: 11, bgcolor: i === 0 ? 'warning.main' : 'primary.light' }}>
                    {initials(a.firstName, a.lastName)}
                  </Avatar>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                      {a.firstName} {a.lastName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" noWrap>{a.email}</Typography>
                  </Box>
                  <Typography variant="body2" sx={{ fontWeight: 700, flexShrink: 0 }}>
                    {a.attendanceCount} classes
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={(a.attendanceCount / max) * 100}
                  sx={{ height: 4, borderRadius: 2, ml: 4.5, bgcolor: 'action.hover' }}
                  color={i === 0 ? 'warning' : 'primary'}
                />
              </Box>
            </Box>
          ))}
        </Box>
      )}
    </SectionCard>
  );
}

// ─── TopPackages ─────────────────────────────────────────────────────────────

function TopPackages({ packages }: { packages: TopPackage[] }) {
  const max = packages[0]?.purchaseCount ?? 1;

  return (
    <SectionCard
      title={
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Inventory2 fontSize="small" color="secondary" />
          Top Purchased Packages
        </Box>
      }
    >
      {packages.length === 0 ? (
        <Box sx={{ py: 3, textAlign: 'center', color: 'text.secondary' }}>
          <Typography variant="body2">No purchase data yet.</Typography>
        </Box>
      ) : (
        <Box>
          {packages.map((p, i) => (
            <Box key={p.planId}>
              {i > 0 && <Divider />}
              <Box sx={{ px: 2.5, py: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.75 }}>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.disabled', minWidth: 16 }}>
                    #{i + 1}
                  </Typography>
                  <Box
                    sx={{
                      width: 28, height: 28, borderRadius: 1, bgcolor: 'secondary.main',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}
                  >
                    <Inventory2 sx={{ fontSize: 14, color: 'secondary.contrastText' }} />
                  </Box>
                  <Typography variant="body2" sx={{ fontWeight: 600, flex: 1, minWidth: 0 }} noWrap>
                    {p.planName}
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, flexShrink: 0 }}>
                    {p.purchaseCount} sold
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={(p.purchaseCount / max) * 100}
                  sx={{ height: 4, borderRadius: 2, ml: 4.5, bgcolor: 'action.hover' }}
                  color="secondary"
                />
              </Box>
            </Box>
          ))}
        </Box>
      )}
    </SectionCard>
  );
}

// ─── RecentMembers ───────────────────────────────────────────────────────────

function RecentMembers({ members }: { members: RecentMember[] }) {
  return (
    <SectionCard title="Recent Members">
      {members.length === 0 ? (
        <Box sx={{ py: 3, textAlign: 'center', color: 'text.secondary' }}>
          <Typography variant="body2">No members yet.</Typography>
        </Box>
      ) : (
        <Box>
          {members.map((m, i) => (
            <Box key={m.userId}>
              {i > 0 && <Divider />}
              <Box sx={{ px: 2.5, py: 1.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Avatar sx={{ width: 34, height: 34, fontSize: 13, bgcolor: 'success.light' }}>
                  {initials(m.firstName, m.lastName)}
                </Avatar>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                    {m.firstName} {m.lastName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" noWrap>{m.email}</Typography>
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ flexShrink: 0 }}>
                  {fmtDate(m.createdAt)}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
      )}
    </SectionCard>
  );
}

// ─── MemberCreditsTable ──────────────────────────────────────────────────────

function CreditsTableBody({ credits }: { credits: MemberCredits[] }) {
  return (
    <Table size="small">
      <TableHead>
        <TableRow sx={{ '& th': { fontWeight: 700, fontSize: 11, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.5 } }}>
          <TableCell>Member</TableCell>
          <TableCell>Email</TableCell>
          <TableCell align="center">Credits Left</TableCell>
          <TableCell align="center">Credits Total</TableCell>
          <TableCell align="center">Usage</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {credits.map((c) => {
          const pct = c.creditsTotal > 0 ? Math.round(((c.creditsTotal - c.creditsLeft) / c.creditsTotal) * 100) : 0;
          const color = c.creditsLeft === 0 ? 'error' : c.creditsLeft <= 2 ? 'warning' : 'success';
          return (
            <TableRow key={c.membershipId} hover>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Avatar sx={{ width: 28, height: 28, fontSize: 11, bgcolor: 'primary.main' }}>
                    {initials(c.firstName, c.lastName)}
                  </Avatar>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {c.firstName} {c.lastName}
                  </Typography>
                </Box>
              </TableCell>
              <TableCell sx={{ color: 'text.secondary', fontSize: 13 }}>{c.email}</TableCell>
              <TableCell align="center">
                <Chip label={c.creditsLeft} size="small" color={color} sx={{ fontSize: 12, fontWeight: 700, minWidth: 36 }} />
              </TableCell>
              <TableCell align="center" sx={{ color: 'text.secondary', fontSize: 13 }}>{c.creditsTotal}</TableCell>
              <TableCell align="center" sx={{ minWidth: 90 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LinearProgress variant="determinate" value={pct} sx={{ flex: 1, height: 6, borderRadius: 3, bgcolor: 'action.hover' }} color={color} />
                  <Typography variant="caption" sx={{ fontSize: 11, minWidth: 28 }}>{pct}%</Typography>
                </Box>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}

function MemberCreditsTable({ credits }: { credits: MemberCredits[] }) {
  const [modalOpen, setModalOpen] = useState(false);
  const MAX = 5;
  const shown = credits.slice(0, MAX);
  const hasMore = credits.length > MAX;

  const handleExport = () => {
    const rows = credits.map((c) => ({
      Member: `${c.firstName} ${c.lastName}`,
      Email: c.email,
      'Credits Left': c.creditsLeft,
      'Credits Total': c.creditsTotal,
      'Usage %': c.creditsTotal > 0 ? Math.round(((c.creditsTotal - c.creditsLeft) / c.creditsTotal) * 100) : 0,
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Member Credits');
    XLSX.writeFile(wb, 'member-credits.xlsx');
  };

  return (
    <>
      <SectionCard
        title={`Member Class Credits · ${credits.length} active`}
        action={
          <Button size="small" startIcon={<Download fontSize="small" />} onClick={handleExport} sx={{ textTransform: 'none', fontSize: 12 }}>Excel</Button>
        }
      >
        {credits.length === 0 ? (
          <Box sx={{ py: 4, textAlign: 'center', color: 'text.secondary' }}>
            <Typography variant="body2">No active memberships.</Typography>
          </Box>
        ) : (
          <TableContainer sx={{ overflowX: 'auto' }}>
            <CreditsTableBody credits={shown} />
          </TableContainer>
        )}
        {hasMore && (
          <Box sx={{ px: 2, py: 1, borderTop: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="caption" color="text.secondary">Showing {MAX} of {credits.length}</Typography>
            <Button size="small" startIcon={<OpenInFull fontSize="small" />} onClick={() => setModalOpen(true)} sx={{ textTransform: 'none', fontSize: 12 }}>
              View all {credits.length}
            </Button>
          </Box>
        )}
      </SectionCard>

      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>Member Class Credits</Typography>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Button size="small" startIcon={<Download fontSize="small" />} onClick={handleExport} sx={{ textTransform: 'none', fontSize: 12 }}>Excel</Button>
            <IconButton size="small" onClick={() => setModalOpen(false)}><Close fontSize="small" /></IconButton>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          <TableContainer sx={{ overflowX: 'auto' }}>
            <CreditsTableBody credits={credits} />
          </TableContainer>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export function HomePage() {
  const [blurred, setBlurred] = useState(true);
  const { data, isLoading, isError } = useDashboard();

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 12 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError || !data) {
    return <Alert severity="error">Failed to load dashboard data.</Alert>;
  }

  return (
    <Box sx={{ position: 'relative' }}>
      {/* ── Header row ── */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>Dashboard</Typography>
        {!blurred && (
          <Button
            variant="outlined"
            size="small"
            startIcon={<VisibilityOff fontSize="small" />}
            onClick={() => setBlurred(true)}
            sx={{ fontSize: 13 }}
          >
            Hide
          </Button>
        )}
      </Box>

      {/* ── Blurred overlay ── */}
      {blurred && (
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 2,
          }}
        >
          <Button
            variant="contained"
            size="large"
            startIcon={<Visibility />}
            onClick={() => setBlurred(false)}
            sx={{
              px: 4, py: 1.5, fontSize: 15, fontWeight: 700,
              backdropFilter: 'blur(4px)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.24)',
            }}
          >
            View Dashboard
          </Button>
        </Box>
      )}

      {/* ── Dashboard content ── */}
      <Box
        sx={{
          filter: blurred ? 'blur(8px)' : 'none',
          transition: 'filter 0.3s ease',
          pointerEvents: blurred ? 'none' : 'auto',
          userSelect: blurred ? 'none' : 'auto',
        }}
      >
        {/* ── Stat cards ── */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid size={{ xs: 6, sm: 3 }}>
            <StatCard
              label="Card Earnings"
              value={fmtCurrency(data.totalEarningsCard)}
              icon={<CreditCard />}
              color="primary"
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <StatCard
              label="Cash Earnings"
              value={fmtCurrency(data.totalEarningsCash)}
              icon={<Money />}
              color="success"
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <StatCard
              label="Total Earnings"
              value={fmtCurrency(data.totalEarnings)}
              icon={<TrendingUp />}
              color="warning"
              sub="All completed payments"
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <StatCard
              label="Total Members"
              value={data.totalMembers.toLocaleString()}
              icon={<People />}
              color="secondary"
            />
          </Grid>
        </Grid>

        {/* ── Today's classes + Recent purchases ── */}
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid size={{ xs: 12, md: 7 }}>
            <TodayClasses sessions={data.todayClasses} />
          </Grid>
          <Grid size={{ xs: 12, md: 5 }}>
            <RecentPurchases payments={data.recentPurchases} />
          </Grid>
        </Grid>

        {/* ── Top attendees + Top packages + Recent members ── */}
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TopAttendees attendees={data.topAttendees} />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TopPackages packages={data.topPackages} />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <RecentMembers members={data.recentMembers} />
          </Grid>
        </Grid>

        {/* ── Member credits table ── */}
        <MemberCreditsTable credits={data.memberCredits} />
      </Box>
    </Box>
  );
}
