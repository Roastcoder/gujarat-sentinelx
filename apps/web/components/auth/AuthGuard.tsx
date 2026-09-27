'use client';

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Shield, ShieldAlert, Activity } from 'lucide-react';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const isLoginPage = pathname === '/login';

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated && !isLoginPage) {
        router.push('/login');
      } else if (isAuthenticated && isLoginPage) {
        router.push('/dashboard');
      }
    }
  }, [isAuthenticated, isLoading, isLoginPage, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-command-bg text-command-text space-y-4">
        <div className="relative">
          <div className="h-16 w-16 rounded-2xl bg-command-surface border border-command-border flex items-center justify-center shadow-lg">
            <Shield className="h-8 w-8 text-command-cyan animate-pulse" />
          </div>
          <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-command-cyan opacity-75" />
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-command-cyan" />
          </span>
        </div>
        <div className="text-center space-y-1">
          <h2 className="text-sm font-bold font-mono text-white tracking-widest uppercase">
            Gujarat SentinelX
          </h2>
          <p className="text-xs text-command-muted font-mono flex items-center gap-1.5 justify-center">
            <Activity className="h-3 w-3 animate-spin text-command-cyan" />
            <span>Verifying Law Enforcement Credentials...</span>
          </p>
        </div>
      </div>
    );
  }

  // If unauthenticated and on a protected route, show nothing while redirecting
  if (!isAuthenticated && !isLoginPage) {
    return null;
  }

  return <>{children}</>;
}
