import { useState } from 'react';
import {
  AppBar, Toolbar, Typography, Box, Tabs, Tab, Avatar, Menu, MenuItem,
  IconButton, Divider, Drawer, List, ListItemButton, ListItemIcon, ListItemText,
  useMediaQuery, useTheme,
} from '@mui/material';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { Logout, People, MeetingRoom, CardMembership, EventNote, SportsGymnastics, Menu as MenuIcon, CreditCard } from '@mui/icons-material';
import { useAuthContext } from '../../context/AuthContext';

const NAV_ITEMS = [
  { label: 'Users',       path: '/users',       icon: <People fontSize="small" /> },
  { label: 'Instructors', path: '/instructors', icon: <SportsGymnastics fontSize="small" /> },
  { label: 'Memberships', path: '/memberships', icon: <CreditCard fontSize="small" /> },
  { label: 'Rooms',       path: '/rooms',       icon: <MeetingRoom fontSize="small" /> },
  { label: 'Plans',       path: '/plans',       icon: <CardMembership fontSize="small" /> },
  { label: 'Sessions',    path: '/sessions',    icon: <EventNote fontSize="small" /> },
];

export function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthContext();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [anchor, setAnchor] = useState<null | HTMLElement>(null);

  const currentTab = NAV_ITEMS.findIndex((item) => location.pathname.startsWith(item.path));
  const currentItem = NAV_ITEMS[currentTab];

  const initials = user
    ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
    : 'U';

  const handleNavClick = (path: string) => {
    navigate(path);
    setDrawerOpen(false);
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar position="sticky" elevation={0} sx={{ borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
        <Toolbar sx={{ gap: 2 }}>

          {isMobile && (
            <IconButton onClick={() => setDrawerOpen(true)} edge="start" sx={{ color: 'text.primary' }}>
              <MenuIcon />
            </IconButton>
          )}

          <Typography variant="h6" sx={{ fontWeight: 800, color: 'primary.light', letterSpacing: 1, mr: isMobile ? 'auto' : 2 }}>
            IS
          </Typography>

          {isMobile && currentItem && (
            <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary', mr: 'auto' }}>
              {currentItem.label}
            </Typography>
          )}

          {!isMobile && (
            <Tabs
              value={currentTab === -1 ? false : currentTab}
              onChange={(_, i) => navigate(NAV_ITEMS[i].path)}
              sx={{ flexGrow: 1 }}
            >
              {NAV_ITEMS.map((item) => (
                <Tab key={item.path} label={item.label} icon={item.icon} iconPosition="start" sx={{ minHeight: 64 }} />
              ))}
            </Tabs>
          )}

          <IconButton onClick={(e) => setAnchor(e.currentTarget)} sx={{ p: 0 }}>
            <Avatar sx={{ bgcolor: 'primary.main', width: 36, height: 36, fontSize: 14 }}>
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
              <Logout fontSize="small" />
              Sign out
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        slotProps={{ paper: { sx: { width: 240 } } }}
      >
        <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography variant="h6" sx={{ fontWeight: 800, color: 'primary.main', letterSpacing: 1 }}>
            IS Admin
          </Typography>
        </Box>

        <List disablePadding sx={{ pt: 1 }}>
          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <ListItemButton
                key={item.path}
                selected={isActive}
                onClick={() => handleNavClick(item.path)}
                sx={{
                  mx: 1,
                  borderRadius: 2,
                  mb: 0.5,
                  '&.Mui-selected': { bgcolor: 'primary.50', color: 'primary.main' },
                  '&.Mui-selected .MuiListItemIcon-root': { color: 'primary.main' },
                }}
              >
                <ListItemIcon sx={{ minWidth: 36 }}>{item.icon}</ListItemIcon>
                <ListItemText
                  primary={item.label}
                  slotProps={{ primary: { style: { fontWeight: isActive ? 700 : 400, fontSize: 14 } } }}
                />
              </ListItemButton>
            );
          })}
        </List>

        <Box sx={{ mt: 'auto', p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
            <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32, fontSize: 13 }}>{initials}</Avatar>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.2 }}>{user?.firstName} {user?.lastName}</Typography>
              <Typography variant="caption" color="text.secondary">{user?.email}</Typography>
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

      <Box component="main" sx={{ p: { xs: 2, md: 3 } }}>
        <Outlet />
      </Box>
    </Box>
  );
}
