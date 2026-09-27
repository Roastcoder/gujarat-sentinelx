'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { api } from '@/lib/api';

export interface UserInfo {
  id: string;
  username: string;
  full_name: string;
  email: string;
  role: string;
  badge_number: string;
  department: string;
}

interface AuthContextType {
  user: UserInfo | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  quickLogin: (username: string) => Promise<boolean>;
}

export const SEEDED_OFFICERS = [
  {
    username: 'investigator',
    name: 'Inspector V. K. Patel',
    role: 'Investigator',
    badge: 'GJ-INV-402',
    dept: 'CID Crime & Investigation Lead',
  },
  {
    username: 'admin',
    name: 'Director General (Tech)',
    role: 'Super Admin',
    badge: 'GJ-POL-001',
    dept: 'Gujarat Police Headquarters',
  },
  {
    username: 'operator',
    name: 'Head Operator Rathod',
    role: 'Operator',
    badge: 'GJ-OP-112',
    dept: 'State CCTV Video Wall Grid',
  },
  {
    username: 'auditor',
    name: 'Auditor S. K. Joshi',
    role: 'Auditor',
    badge: 'GJ-AUD-009',
    dept: 'State Vigilance & Compliance',
  },
];

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => false,
  logout: () => {},
  quickLogin: async () => false,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore authentication state from localStorage on load
  useEffect(() => {
    try {
      const stored = localStorage.getItem('sentinelx_session');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.token && parsed.user) {
          setUser(parsed.user);
          setToken(parsed.token);
        }
      }
    } catch (e) {
      console.error('Failed to parse stored session:', e);
      localStorage.removeItem('sentinelx_session');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const res = await api.login({ username: username.trim(), password });
      if (res && res.access_token && res.user_info) {
        setUser(res.user_info);
        setToken(res.access_token);
        localStorage.setItem(
          'sentinelx_session',
          JSON.stringify({
            token: res.access_token,
            user: res.user_info,
            logged_at: Date.now(),
          })
        );
        document.cookie = `sentinelx_token=${res.access_token}; path=/; max-age=86400; SameSite=Lax`;
        return true;
      }
      return false;
    } catch (error: any) {
      // Offline fallback: if backend is unreachable or test mock
      const match = SEEDED_OFFICERS.find(
        (o) => o.username.toLowerCase() === username.trim().toLowerCase()
      );
      if (match && password === 'SentinelX@2026') {
        const mockUser: UserInfo = {
          id: `usr-${match.username}`,
          username: match.username,
          full_name: match.name,
          email: `${match.username}@sentinelx.gujarat.gov.in`,
          role: match.role,
          badge_number: match.badge,
          department: match.dept,
        };
        const mockToken = 'mock_jwt_' + Date.now();
        setUser(mockUser);
        setToken(mockToken);
        localStorage.setItem(
          'sentinelx_session',
          JSON.stringify({
            token: mockToken,
            user: mockUser,
            logged_at: Date.now(),
          })
        );
        document.cookie = `sentinelx_token=${mockToken}; path=/; max-age=86400; SameSite=Lax`;
        return true;
      }
      throw error;
    }
  };

  const quickLogin = async (targetUsername: string): Promise<boolean> => {
    return login(targetUsername, 'SentinelX@2026');
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('sentinelx_session');
    document.cookie = 'sentinelx_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    router.push('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: Boolean(user && token),
        isLoading,
        login,
        logout,
        quickLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
