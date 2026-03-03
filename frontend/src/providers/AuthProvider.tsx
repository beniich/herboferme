'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';
import { authEventBus } from '@/lib/auth-event-bus';
import { useAuthStore } from '@/store/authStore';

interface AuthContextType {
  user: any | null;
  isLoading: boolean;
  login: (data: { email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user, setUser, setIsLoading } = useAuthStore();
  const [isLoading, setLoading] = useState(true);
  const router = useRouter();

  const checkSession = async () => {
    try {
      setLoading(true);
      const data = await authApi.me();
      // Le backend retourne { user: {...} } ou directement l'objet user
      const userObj = data?.user ?? data;
      setUser(userObj ?? null);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkSession();

    const unsubscribe = authEventBus.on('session-expired', () => {
      setUser(null);
      router.push('/login');
    });

    return () => unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (data: { email: string; password: string }) => {
    const response = await authApi.login(data);
    // Apr  s le login, le cookie est pos   par le backend
    // On r  cup  re les donn  es user depuis la r  ponse ou on appelle /me
    const userObj = response?.user ?? null;
    if (userObj) {
      setUser(userObj);
      setLoading(false);
      router.push('/dashboard');
    } else {
      // Fallback : on v  rifie la session
      await checkSession();
      router.push('/dashboard');
    }
  };

  const logout = async () => {
    try { await authApi.logout(); } catch { /* ignore */ }
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, refreshUser: checkSession }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
