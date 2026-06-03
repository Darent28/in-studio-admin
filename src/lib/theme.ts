import { createTheme } from '@mui/material';

const sharedComponents = {
  MuiButton: {
    styleOverrides: {
      root: {
        textTransform: 'none' as const,
        borderRadius: 10,
        fontWeight: 600,
      },
      contained: {
        background: 'linear-gradient(135deg, #7C3AED 0%, #4C1D95 100%)',
        '&:hover': {
          background: 'linear-gradient(135deg, #6D28D9 0%, #3B1F6A 100%)',
        },
      },
    },
  },
};

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#7C3AED', light: '#C4B5FD', dark: '#4C1D95' },
    secondary: { main: '#C4B5FD' },
    background: { default: '#0F0820', paper: '#1A0F2E' },
    text: { primary: '#FFFFFF', secondary: '#C4B5FD' },
    error: { main: '#F87171' },
    divider: '#3B1F6A',
  },
  typography: { fontFamily: "'Segoe UI', Roboto, sans-serif" },
  components: {
    ...sharedComponents,
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 10,
            '& fieldset': { borderColor: '#3B1F6A' },
            '&:hover fieldset': { borderColor: '#7C3AED' },
          },
        },
      },
    },
    MuiLink: {
      styleOverrides: { root: { color: '#C4B5FD' } },
    },
  },
});

export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#7C3AED', light: '#C4B5FD', dark: '#4C1D95' },
    secondary: { main: '#4C1D95' },
    background: { default: '#F5F3FF', paper: '#FFFFFF' },
    text: { primary: '#1A0F2E', secondary: '#6D28D9' },
    error: { main: '#DC2626' },
    divider: '#E9D5FF',
  },
  typography: { fontFamily: "'Segoe UI', Roboto, sans-serif" },
  components: {
    ...sharedComponents,
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#FFFFFF',
          color: '#1A0F2E',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          border: '1px solid #E9D5FF',
          boxShadow: '0 1px 4px rgba(124,58,237,0.08)',
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: { backgroundColor: '#F5F3FF' },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 10,
            '& fieldset': { borderColor: '#E9D5FF' },
            '&:hover fieldset': { borderColor: '#7C3AED' },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 600 },
      },
    },
  },
});
