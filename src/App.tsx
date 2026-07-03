import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { darkTheme, lightTheme } from './lib/theme';
import { queryClient } from './lib/queryClient';
import { AuthProvider, useAuthContext } from './context/AuthContext';
import { AdminLayout } from './shared/components/AdminLayout';
import { LoginPage } from './pages/LoginPage';
import { HomePage } from './pages/HomePage';
import { UsersPage } from './pages/UsersPage';
import { RoomsPage } from './pages/RoomsPage';
import { PlansPage } from './pages/PlansPage';
import { ClassSessionsPage } from './pages/ClassSessionsPage';
import { InstructorsPage } from './pages/InstructorsPage';
import { MembershipsPage } from './pages/MembershipsPage';
import { PaymentsPage } from './pages/PaymentsPage';
import { SchedulePage } from './pages/SchedulePage';
import { OffersPage } from './pages/OffersPage';
import { CouponsPage } from './pages/CouponsPage';

function ProtectedRoute({ children }: { children: React.ReactElement }) {
  const { isAuthenticated } = useAuthContext();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function AppRoutes() {
  const { isAuthenticated } = useAuthContext();
  return (
    <Routes>
      <Route
        path="/login"
        element={
          isAuthenticated ? (
            <Navigate to="/" replace />
          ) : (
            <ThemeProvider theme={darkTheme}>
              <CssBaseline />
              <LoginPage />
            </ThemeProvider>
          )
        }
      />
      <Route
        element={
          <ProtectedRoute>
            <ThemeProvider theme={lightTheme}>
              <CssBaseline />
              <AdminLayout />
            </ThemeProvider>
          </ProtectedRoute>
        }
      >
        <Route index element={<HomePage />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="instructors" element={<InstructorsPage />} />
        <Route path="memberships" element={<MembershipsPage />} />
        <Route path="rooms" element={<RoomsPage />} />
        <Route path="plans" element={<PlansPage />} />
        <Route path="sessions" element={<ClassSessionsPage />} />
        <Route path="payments" element={<PaymentsPage />} />
        <Route path="schedule" element={<SchedulePage />} />
        <Route path="offers" element={<OffersPage />} />
        <Route path="coupons" element={<CouponsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
