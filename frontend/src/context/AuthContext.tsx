import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AuthState } from '../types';
import { authApi } from '../utils/api';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, username: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: localStorage.getItem('gpo_token'),
    isLoading: true,
    isBanned: false,
    banReason: undefined,
  });

  // Listen for ban events
  useEffect(() => {
    const handleBan = (event: CustomEvent<{ reason: string }>) => {
      setState(prev => ({
        ...prev,
        isBanned: true,
        banReason: event.detail.reason,
        user: null,
        token: null,
      }));
      localStorage.removeItem('gpo_token');
      localStorage.removeItem('gpo_user');
    };

    window.addEventListener('user-banned', handleBan as EventListener);
    return () => window.removeEventListener('user-banned', handleBan as EventListener);
  }, []);

  const checkAuth = useCallback(async () => {
    const token = localStorage.getItem('gpo_token');

    if (!token) {
      setState(prev => ({ ...prev, isLoading: false }));
      return;
    }

    try {
      const response = await authApi.getMe();
      setState(prev => ({
        ...prev,
        user: response.data.user,
        token,
        isLoading: false,
        isBanned: false,
      }));
    } catch (error: any) {
      if (error.response?.data?.error === 'BANNED') {
        setState(prev => ({
          ...prev,
          isBanned: true,
          banReason: error.response.data.reason,
          user: null,
          token: null,
          isLoading: false,
        }));
        localStorage.removeItem('gpo_token');
        localStorage.removeItem('gpo_user');
      } else {
        localStorage.removeItem('gpo_token');
        localStorage.removeItem('gpo_user');
        setState(prev => ({
          ...prev,
          user: null,
          token: null,
          isLoading: false,
        }));
      }
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (email: string, password: string) => {
    try {
      const response = await authApi.login(email, password);
      const { token, user } = response.data;

      localStorage.setItem('gpo_token', token);
      localStorage.setItem('gpo_user', JSON.stringify(user));

      setState(prev => ({
        ...prev,
        user,
        token,
        isBanned: false,
      }));
    } catch (error: any) {
      if (error.response?.data?.error === 'BANNED') {
        setState(prev => ({
          ...prev,
          isBanned: true,
          banReason: error.response.data.reason,
        }));
      }
      throw error;
    }
  };

  const register = async (email: string, username: string, password: string) => {
    const response = await authApi.register(email, username, password);
    const { token, user } = response.data;

    localStorage.setItem('gpo_token', token);
    localStorage.setItem('gpo_user', JSON.stringify(user));

    setState(prev => ({
      ...prev,
      user,
      token,
      isBanned: false,
    }));
  };

  const logout = () => {
    localStorage.removeItem('gpo_token');
    localStorage.removeItem('gpo_user');
    setState({
      user: null,
      token: null,
      isLoading: false,
      isBanned: false,
    });
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        logout,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
