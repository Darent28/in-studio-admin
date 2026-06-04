import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { api } from '../lib/api';
import type { User } from '../types/user';

interface AuthState {
  user: User | null;
  token: string | null;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<true | string>;
  logout: () => void;
  isAuthenticated: boolean;
  authFetch: (input: RequestInfo, init?: RequestInit) => Promise<Response>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function getStoredAuth(): AuthState {
  const token = localStorage.getItem('is_token');
  const expiresAt = localStorage.getItem('is_expiresAt');
  const raw = localStorage.getItem('is_user');
  if (!token || !expiresAt || !raw) return { user: null, token: null };
  if (new Date(expiresAt) <= new Date()) {
    localStorage.clear();
    return { user: null, token: null };
  }
  return { token, user: JSON.parse(raw) };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<AuthState>(getStoredAuth);

  const persist = (token: string, expiresAt: string, user: User) => {
    localStorage.setItem('is_token', token);
    localStorage.setItem('is_expiresAt', expiresAt);
    localStorage.setItem('is_user', JSON.stringify(user));
    setAuth({ token, user });
  };

  const login = useCallback(async (email: string, password: string): Promise<true | string> => {
    try {
      const data = await api.auth.login(email, password);
      if (data.user.role !== 'ADMIN') {
        return 'You are not authorized to access this panel.';
      }
      persist(data.token, data.expiresAt, data.user);
      return true;
    } catch (err: any) {
      return err.message ?? 'Login failed. Please try again.';
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('is_token');
    localStorage.removeItem('is_expiresAt');
    localStorage.removeItem('is_user');
    setAuth({ user: null, token: null });
  }, []);

  const authFetch = useCallback(
    async (input: RequestInfo, init?: RequestInit): Promise<Response> => {
      const res = await fetch(input, {
        ...init,
        headers: {
          'Content-Type': 'application/json',
          ...(init?.headers ?? {}),
          Authorization: auth.token ? `Bearer ${auth.token}` : '',
        },
      });
      if (res.status === 401) logout();
      return res;
    },
    [auth.token, logout]
  );

  return (
    <AuthContext.Provider
      value={{ ...auth, login, logout, isAuthenticated: auth.token !== null, authFetch }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used inside <AuthProvider>');
  return ctx;
}
