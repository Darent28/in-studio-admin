import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { Box, Typography, Link } from '@mui/material';
import { AuthLayout } from '../shared/components/AuthLayout';
import { PasswordField } from '../shared/components/PasswordField';
import { AppButton } from '../shared/components/AppButton';
import { AppInput } from '../shared/components/AppInput';
import { useAuthContext } from '../context/AuthContext';

export function LoginPage() {
  const { login } = useAuthContext();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password);
    setLoading(false);

    if (result === true) {
      navigate('/');
    } else {
      setError(result);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your In Studio account"
      error={error}
    >
      <Box component="form" onSubmit={handleSubmit}>
        <AppInput
          label="Email"
          value={email}
          onChange={setEmail}
          type="email"
          autoComplete="email"
          required
          sx={{ mb: 2 }}
        />
        <PasswordField
          label="Password"
          value={password}
          onChange={setPassword}
          autoComplete="current-password"
          sx={{ mb: 1 }}
        />
        <Box sx={{ textAlign: 'right', mb: 2.5 }}>
          <Link component={RouterLink} to="/forgot-password" variant="body2" underline="hover">
            Forgot your password?
          </Link>
        </Box>
        <AppButton
          text="Sign In"
          type="submit"
          size="large"
          fullWidth
          loading={loading}
          sx={{ py: 1.5 }}
        />
      </Box>
    </AuthLayout>
  );
}
