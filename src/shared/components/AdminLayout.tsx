import { useState } from 'react';
import { AppBar, Toolbar, Typography, Box, Tabs, Tab, Avatar, Menu, MenuItem, IconButton, Divider } from '@mui/material';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { Logout, People } from '@mui/icons-material';
import { useAuthContext } from '../../context/AuthContext';

const NAV_ITEMS = [
  { label: 'Users', path: '/users', icon: <People fontSize="small" /> },
];

export function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthContext();
  const [anchor, setAnchor] = useState<null | HTMLElement>(null);

  const currentTab = NAV_ITEMS.findIndex((item) => location.pathname.startsWith(item.path));

  const initials = user
    ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
    : 'U';

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar position="sticky" elevation={0} sx={{ borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
        <Toolbar sx={{ gap: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 800, color: 'primary.light', letterSpacing: 1, mr: 2 }}>
            IS
          </Typography>

          <Tabs
            value={currentTab === -1 ? false : currentTab}
            onChange={(_, i) => navigate(NAV_ITEMS[i].path)}
            sx={{ flexGrow: 1 }}
          >
            {NAV_ITEMS.map((item) => (
              <Tab key={item.path} label={item.label} icon={item.icon} iconPosition="start" sx={{ minHeight: 64 }} />
            ))}
          </Tabs>

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

      <Box component="main" sx={{ p: 3 }}>
        <Outlet />
      </Box>
    </Box>
  );
}
