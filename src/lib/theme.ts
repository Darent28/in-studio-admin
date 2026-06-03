import { createTheme } from '@mui/material';

export const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#7C3AED',
      light: '#C4B5FD',
      dark: '#4C1D95',
    },
    secondary: {
      main: '#C4B5FD',
    },
    background: {
      default: '#0F0820',
      paper: '#1A0F2E',
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#C4B5FD',
    },
    error: {
      main: '#F87171',
    },
    divider: '#3B1F6A',
  },
  typography: {
    fontFamily: "'Segoe UI', Roboto, sans-serif",
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
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
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          border: '1px solid #3B1F6A',
        },
      },
    },
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
      styleOverrides: {
        root: {
          color: '#C4B5FD',
        },
      },
    },
  },
});
