'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import './globals.css';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import DemoBanner from '@/components/layout/DemoBanner';
import AlertDrawer from '@/components/layout/AlertDrawer';
import { ThemeProvider } from '@/components/ThemeProvider';
import { AuthProvider } from '@/context/AuthContext';
import { SidebarProvider } from '@/context/SidebarContext';
import AuthGuard from '@/components/auth/AuthGuard';

function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);
  const [alertCount, setAlertCount] = useState(1);

  const isLoginPage = pathname === '/login';

  if (isLoginPage) {
    return <AuthGuard>{children}</AuthGuard>;
  }

  return (
    <AuthGuard>
      <header className="sticky top-0 z-40 flex flex-col w-full bg-command-bg border-b border-command-border shadow-sm">
        <Navbar
          onToggleAlerts={() => setIsAlertsOpen(!isAlertsOpen)}
          unacknowledgedAlerts={alertCount}
        />
        <DemoBanner />
      </header>
      <div className="flex-1 flex w-full relative">
        <Sidebar />
        <main className="flex-1 min-w-0 bg-command-bg p-3 sm:p-4 md:p-6 overflow-x-hidden">
          {children}
        </main>
      </div>
      <AlertDrawer
        isOpen={isAlertsOpen}
        onClose={() => setIsAlertsOpen(false)}
        onAlertAcknowledged={() => setAlertCount((c) => Math.max(0, c - 1))}
      />
    </AuthGuard>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <title>Gujarat SentinelX — CCTV Intelligence & Investigation Platform</title>
        <meta
          name="description"
          content="Integrated CCTV Intelligence, GIS & Cross-Camera Investigation Platform. Government of Gujarat — Home Department."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <link rel="icon" href="/gujarat-police-logo.png" />
      </head>
      <body className="bg-command-bg text-command-text min-h-screen flex flex-col antialiased">
        <ThemeProvider>
          <AuthProvider>
            <SidebarProvider>
              <AppShell>{children}</AppShell>
            </SidebarProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
