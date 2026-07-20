import { useState } from 'react';
import type { ReactNode } from 'react';
import {
  AppBar, Toolbar, Typography, Box, Avatar, Menu, MenuItem,
  IconButton, Divider, Drawer, List, ListItemButton, ListItemIcon,
  ListItemText, ListSubheader, useMediaQuery, useTheme, Button,
} from '@mui/material';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import {
  Logout, People, MeetingRoom, CardMembership, EventNote,
  SportsGymnastics, Menu as MenuIcon, CreditCard, Payments,
  CalendarMonth, LocalOffer, Dashboard, Groups, School, AccountBalance,
  ConfirmationNumber, Settings,
} from '@mui/icons-material';
import { useAuthContext } from '../../context/AuthContext';

// ─── Nav structure ────────────────────────────────────────────────────────────

interface NavItem {
  label: string;
  path: string;
  icon: ReactNode;
  exact?: boolean;
}

interface NavSection {
  label: string;
  icon: ReactNode;
  items: NavItem[];
}

const SECTIONS: NavSection[] = [
  {
    label: 'Overview',
    icon: <Dashboard fontSize="small" />,
    items: [
      { label: 'Dashboard', path: '/', icon: <Dashboard fontSize="small" />, exact: true },
    ],
  },
  {
    label: 'Users',
    icon: <Groups fontSize="small" />,
    items: [
      { label: 'Members',     path: '/users',       icon: <People fontSize="small" /> },
      { label: 'Memberships', path: '/memberships', icon: <CreditCard fontSize="small" /> },
      { label: 'Instructors', path: '/instructors', icon: <SportsGymnastics fontSize="small" /> },
    ],
  },
  {
    label: 'Schedule',
    icon: <CalendarMonth fontSize="small" />,
    items: [
      { label: 'Schedule', path: '/schedule', icon: <CalendarMonth fontSize="small" /> },
    ],
  },
  {
    label: 'Settings',
    icon: <Settings fontSize="small" />,
    items: [
      { label: 'Sessions', path: '/sessions', icon: <EventNote fontSize="small" /> },
      { label: 'Rooms',    path: '/rooms',    icon: <MeetingRoom fontSize="small" /> },
      { label: 'Plans',    path: '/plans',    icon: <CardMembership fontSize="small" /> },
    ],
  },
  {
    label: 'Finance',
    icon: <AccountBalance fontSize="small" />,
    items: [
      { label: 'Offers',   path: '/offers',   icon: <LocalOffer fontSize="small" /> },
      { label: 'Coupons',  path: '/coupons',  icon: <ConfirmationNumber fontSize="small" /> },
      { label: 'Payments', path: '/payments', icon: <Payments fontSize="small" /> },
    ],
  },
];

// ─── helpers ──────────────────────────────────────────────────────────────────

function isItemActive(item: NavItem, pathname: string) {
  return item.exact ? pathname === item.path : pathname.startsWith(item.path);
}

function findActiveSection(pathname: string): number {
  return SECTIONS.findIndex((s) => s.items.some((i) => isItemActive(i, pathname)));
}

// ─── Layout ───────────────────────────────────────────────────────────────────

export function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthContext();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [anchor, setAnchor] = useState<null | HTMLElement>(null);

  const activeSectionIdx = findActiveSection(location.pathname);
  const activeSection    = SECTIONS[activeSectionIdx] ?? null;
  const activeItem       = activeSection?.items.find((i) => isItemActive(i, location.pathname));

  const initials = user ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase() : 'U';

  const handleSectionClick = (section: NavSection) => {
    // navigate to first item in the section
    navigate(section.items[0].path);
    setDrawerOpen(false);
  };

  const handleItemClick = (path: string) => {
    navigate(path);
    setDrawerOpen(false);
  };

  // Sub-bar only shows when active section has more than one item
  const showSubBar = !isMobile && activeSection && activeSection.items.length > 1;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>

      {/* ── Sticky wrapper for both bars ── */}
      <Box sx={{ position: 'sticky', top: 0, zIndex: 1100 }}>

        {/* ── Primary AppBar ── */}
        <AppBar
          position="relative"
          elevation={0}
          sx={{ borderBottom: showSubBar ? 'none' : '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}
        >
          <Toolbar sx={{ gap: 1.5, minHeight: '56px !important' }}>

            {isMobile && (
              <IconButton onClick={() => setDrawerOpen(true)} edge="start" sx={{ color: 'text.primary' }}>
                <MenuIcon />
              </IconButton>
            )}

            <Typography variant="h6" sx={{ fontWeight: 800, color: 'primary.main', letterSpacing: 1.5, fontSize: 18 }}>
              IS
            </Typography>

            {isMobile ? (
              /* Mobile: show active section + item */
              <Box sx={{ flex: 1, ml: 1 }}>
                {activeItem && (
                  <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary', lineHeight: 1.1 }}>
                    {activeItem.label}
                  </Typography>
                )}
                {activeSection && (
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: 11 }}>
                    {activeSection.label}
                  </Typography>
                )}
              </Box>
            ) : (
              /* Desktop: section tabs */
              <Box sx={{ display: 'flex', flex: 1, ml: 2, gap: 0.5 }}>
                {SECTIONS.map((section, idx) => {
                  const isActive = activeSectionIdx === idx;
                  return (
                    <Button
                      key={section.label}
                      onClick={() => handleSectionClick(section)}
                      startIcon={section.icon}
                      size="small"
                      sx={{
                        px: 2,
                        py: 0.75,
                        fontSize: 13,
                        fontWeight: isActive ? 700 : 500,
                        color: isActive ? 'primary.main' : 'text.secondary',
                        bgcolor: isActive ? 'primary.50' : 'transparent',
                        borderRadius: 2,
                        textTransform: 'none',
                        '&:hover': { bgcolor: isActive ? 'primary.50' : 'action.hover', color: isActive ? 'primary.main' : 'text.primary' },
                      }}
                    >
                      {section.label}
                    </Button>
                  );
                })}
              </Box>
            )}

            {/* Avatar + user menu */}
            <IconButton onClick={(e) => setAnchor(e.currentTarget)} sx={{ p: 0, ml: 'auto' }}>
              <Avatar sx={{ bgcolor: 'primary.main', width: 34, height: 34, fontSize: 13 }}>
                {initials}
              </Avatar>
            </IconButton>

            <Menu
              anchorEl={anchor}
              open={Boolean(anchor)}
              onClose={() => setAnchor(null)}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
              <Box sx={{ px: 2, py: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>{user?.firstName} {user?.lastName}</Typography>
                <Typography variant="caption" color="text.secondary">{user?.email}</Typography>
              </Box>
              <Divider />
              <MenuItem onClick={() => { logout(); navigate('/login'); }} sx={{ gap: 1, color: 'error.main' }}>
                <Logout fontSize="small" /> Sign out
              </MenuItem>
            </Menu>
          </Toolbar>
        </AppBar>

        {/* ── Secondary sub-bar ── */}
        {showSubBar && (
          <Box
            sx={{
              bgcolor: 'background.paper',
              borderBottom: '1px solid',
              borderColor: 'divider',
              px: 2,
              overflowX: 'auto',
              display: 'flex',
              gap: 0.5,
              alignItems: 'center',
              minHeight: 40,
              '&::-webkit-scrollbar': { display: 'none' },
            }}
          >
            {activeSection.items.map((item) => {
              const active = isItemActive(item, location.pathname);
              return (
                <Button
                  key={item.path}
                  onClick={() => handleItemClick(item.path)}
                  startIcon={item.icon}
                  size="small"
                  sx={{
                    px: 1.5,
                    py: 0.4,
                    fontSize: 12,
                    fontWeight: active ? 700 : 400,
                    color: active ? 'primary.main' : 'text.secondary',
                    borderBottom: active ? '2px solid' : '2px solid transparent',
                    borderColor: active ? 'primary.main' : 'transparent',
                    borderRadius: 0,
                    textTransform: 'none',
                    whiteSpace: 'nowrap',
                    '&:hover': { color: 'text.primary', bgcolor: 'action.hover' },
                  }}
                >
                  {item.label}
                </Button>
              );
            })}
          </Box>
        )}
      </Box>

      {/* ── Mobile drawer ── */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        slotProps={{ paper: { sx: { width: 260 } } }}
      >
        {/* Drawer header */}
        <Box sx={{ px: 2.5, py: 2, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Typography variant="h6" sx={{ fontWeight: 800, color: 'primary.main', letterSpacing: 1.5 }}>IS</Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>Admin Panel</Typography>
        </Box>

        {/* Sections */}
        <Box sx={{ flex: 1, overflowY: 'auto', py: 1 }}>
          {SECTIONS.map((section, sIdx) => (
            <Box key={section.label}>
              {sIdx > 0 && <Divider sx={{ my: 0.5 }} />}
              <ListSubheader
                sx={{
                  px: 2, py: 0.5, fontSize: 11, fontWeight: 700, letterSpacing: 0.8,
                  textTransform: 'uppercase', color: 'text.disabled', lineHeight: 2,
                  bgcolor: 'transparent',
                }}
              >
                {section.label}
              </ListSubheader>
              <List disablePadding>
                {section.items.map((item) => {
                  const active = isItemActive(item, location.pathname);
                  return (
                    <ListItemButton
                      key={item.path}
                      selected={active}
                      onClick={() => handleItemClick(item.path)}
                      sx={{
                        mx: 1, borderRadius: 2, mb: 0.25, py: 0.75,
                        '&.Mui-selected': { bgcolor: 'primary.50', color: 'primary.main' },
                        '&.Mui-selected .MuiListItemIcon-root': { color: 'primary.main' },
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 34 }}>{item.icon}</ListItemIcon>
                      <ListItemText
                        primary={item.label}
                        slotProps={{ primary: { style: { fontSize: 14, fontWeight: active ? 700 : 400 } } }}
                      />
                    </ListItemButton>
                  );
                })}
              </List>
            </Box>
          ))}
        </Box>

        {/* Drawer footer */}
        <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
            <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32, fontSize: 13 }}>{initials}</Avatar>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                {user?.firstName} {user?.lastName}
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap>{user?.email}</Typography>
            </Box>
          </Box>
          <ListItemButton
            onClick={() => { logout(); navigate('/login'); }}
            sx={{ borderRadius: 2, color: 'error.main', px: 1 }}
          >
            <ListItemIcon sx={{ minWidth: 32, color: 'error.main' }}><Logout fontSize="small" /></ListItemIcon>
            <ListItemText primary="Sign out" slotProps={{ primary: { style: { fontSize: 14 } } }} />
          </ListItemButton>
        </Box>
      </Drawer>

      {/* ── Main content ── */}
      <Box component="main" sx={{ p: { xs: 2, md: 3 } }}>
        <Outlet />
      </Box>
    </Box>
  );
}
