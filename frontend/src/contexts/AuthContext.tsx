import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api';
import type { User } from '../types';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<User>;
  register: (name: string, email: string, password: string) => Promise<User>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('u-hub-token');
    const savedUser = localStorage.getItem('u-hub-user');
    if (token && savedUser) {
      try { setUser(JSON.parse(savedUser)); } catch {
        localStorage.removeItem('u-hub-token');
        localStorage.removeItem('u-hub-user');
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (username: string, password: string): Promise<User> => {
    const res = await authAPI.login({ username, password });
    const userData: User = res.data;
    localStorage.setItem('u-hub-token', (userData as any).token);
    localStorage.setItem('u-hub-user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  }, []);

  const register = useCallback(async (name: string, email: string, password: string): Promise<User> => {
    const res = await authAPI.register({ name, email, password });
    const userData: User = res.data;
    localStorage.setItem('u-hub-token', (userData as any).token);
    localStorage.setItem('u-hub-user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('u-hub-token');
    localStorage.removeItem('u-hub-user');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
