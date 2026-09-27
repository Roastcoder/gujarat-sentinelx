'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Search,
  Bell,
  Play,
  Shield,
  Radio,
  CheckCircle2,
  AlertTriangle,
  Flame,
  UserCheck,
  Sun,
  Moon,
  LogOut,
  Menu,
} from 'lucide-react';
import { api } from '@/lib/api';
import { useTheme } from '@/components/ThemeProvider';
import { useAuth } from '@/context/AuthContext';
import { useSidebar } from '@/context/SidebarContext';

interface NavbarProps {
  onToggleAlerts?: () => void;
  unacknowledgedAlerts?: number;
}

export default function Navbar({ onToggleAlerts, unacknowledgedAlerts = 1 }: NavbarProps) {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const { toggleCollapse, toggleMobile } = useSidebar();
  const [searchPlate, setSearchPlate] = useState('');
  const [isDemoRunning, setIsDemoRunning] = useState(false);
  const [demoMessage, setDemoMessage] = useState<string | null>(null);

  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchPlate.trim()) {
      setIsMobileSearchOpen(false);
      router.push(`/vehicles/${searchPlate.trim().toUpperCase()}`);
    }
  };

  const handleRunDemo = async () => {
    try {
      setIsDemoRunning(true);
      setDemoMessage('Running 7-Camera Tracking & Watchlist Evaluation...');
      const res = await api.triggerDemo();
      setDemoMessage(`Scenario Complete: ${res.vehicle_number} detected across 7 cameras!`);
      setTimeout(() => {
        router.push('/vehicles/GJ01AB1234');
        setIsDemoRunning(false);
        setDemoMessage(null);
      }, 1200);
    } catch (err: any) {
      console.error('Demo trigger failed:', err);
      setIsDemoRunning(false);
      setDemoMessage(null);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-command-border bg-command-bg/95 backdrop-blur px-2.5 sm:px-4 py-2">
      <div className="flex items-center justify-between gap-2 sm:gap-3 md:gap-4">
        {/* Left: Hamburger Toggle & Gujarat Police Emblem */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 flex-shrink-0">
          {/* Mobile Drawer Hamburger */}
          <button
            onClick={toggleMobile}
            className="lg:hidden p-1.5 sm:p-2 rounded-lg bg-command-surface border border-command-border text-slate-700 dark:text-slate-300 hover:text-command-cyan transition-colors"
            title="Open Navigation Menu"
            aria-label="Toggle Mobile Navigation"
          >
            <Menu className="h-4 w-4" />
          </button>

          {/* Desktop Sidebar Collapse Toggle */}
          <button
            onClick={toggleCollapse}
            className="hidden lg:flex p-2 rounded-lg bg-command-surface border border-command-border text-slate-700 dark:text-slate-300 hover:text-command-cyan transition-colors"
            title="Toggle Sidebar Collapse (Ctrl+B)"
            aria-label="Toggle Sidebar"
          >
            <Menu className="h-4 w-4" />
          </button>

          <Link href="/dashboard" className="flex items-center gap-2 group flex-shrink-0">
            <div className="relative h-8 w-7 sm:h-9 sm:w-8 flex-shrink-0 transition-transform group-hover:scale-105">
              <Image
                src="/gujarat-police-logo.png"
                alt="Gujarat Police Crest"
                width={36}
                height={45}
                className="object-contain drop-shadow"
                priority
              />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold tracking-wider text-xs sm:text-sm md:text-base text-slate-900 dark:text-white whitespace-nowrap">
                  SENTINEL<span className="text-command-cyan">X</span>
                </span>
                <span className="hidden xs:inline-block bg-command-accent/20 text-command-cyan text-[9px] sm:text-[10px] font-mono px-1 py-0.5 rounded border border-command-accent/40 font-semibold uppercase">
                  POC
                </span>
              </div>
              <p className="hidden md:block text-[10px] text-slate-500 dark:text-command-muted font-medium truncate max-w-[200px] xl:max-w-none">
                Home Dept · Gujarat Police
              </p>
            </div>
          </Link>
        </div>

        {/* Center: Global Investigation Search (Visible on md and above) */}
        <div className="hidden md:flex flex-1 max-w-xl mx-2">
          <form onSubmit={handleSearch} className="w-full relative">
            <div className="relative flex items-center">
              <input
                type="text"
                value={searchPlate}
                onChange={(e) => setSearchPlate(e.target.value)}
                placeholder="Investigate Plate (e.g. GJ01AB1234)..."
                className="w-full bg-command-surface border border-command-border text-slate-900 dark:text-white text-xs rounded-lg pl-8 pr-22 py-1.5 placeholder-slate-400 focus:outline-none focus:border-command-accent focus:ring-1 focus:ring-command-accent font-mono uppercase shadow-xs"
              />
              <Search className="absolute left-2.5 h-3.5 w-3.5 text-command-muted" />
              <button
                type="submit"
                className="absolute right-1 bg-command-accent hover:bg-blue-600 text-white text-[10px] font-semibold px-2 py-1 rounded transition-colors shadow-xs"
              >
                Investigate
              </button>
            </div>
          </form>
          {demoMessage && (
            <div className="absolute top-12 left-1/2 -translate-x-1/2 bg-command-surface border border-command-cyan text-command-cyan text-xs px-3 py-1 rounded-full shadow-lg flex items-center gap-2 animate-pulse font-mono z-50">
              <Radio className="h-3 w-3" />
              {demoMessage}
            </div>
          )}
        </div>

        {/* Right: Actions, Mobile Search Toggle, Demo Button & Profile */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
          {/* Mobile Search Toggle Button */}
          <button
            onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
            className={`md:hidden p-1.5 sm:p-2 rounded-lg border transition-colors ${
              isMobileSearchOpen
                ? 'bg-command-accent text-white border-command-accent'
                : 'bg-command-surface border-command-border text-slate-600 dark:text-slate-300 hover:text-command-cyan'
            }`}
            title="Toggle Vehicle Search"
            aria-label="Search Vehicle"
          >
            <Search className="h-4 w-4" />
          </button>

          {/* RUN DEMO SCENARIO BUTTON */}
          <button
            onClick={handleRunDemo}
            disabled={isDemoRunning}
            className="flex items-center gap-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold px-2 sm:px-2.5 md:px-3 py-1.5 rounded-lg shadow-sm transition-all border border-blue-400/40"
            title="Execute 7-camera tracking demo for vehicle GJ01AB1234"
          >
            <Play className={`h-3 w-3 sm:h-3.5 sm:w-3.5 fill-current ${isDemoRunning ? 'animate-spin' : ''}`} />
            <span className="hidden lg:inline text-xs">RUN DEMO</span>
            <span className="hidden sm:inline lg:hidden text-xs">DEMO</span>
            <span className="hidden xs:inline bg-blue-950/60 text-cyan-200 text-[9px] sm:text-[10px] px-1 py-0.5 rounded font-mono border border-cyan-400/30">
              GJ01AB1234
            </span>
          </button>

          {/* Alert Notification Bell */}
          <button
            onClick={onToggleAlerts}
            className="relative p-1.5 sm:p-2 rounded-lg bg-command-surface border border-command-border hover:bg-command-hover text-command-muted hover:text-white transition-colors"
            title="Open Live Alert Center"
            aria-label="Alerts"
          >
            <Bell className="h-4 w-4" />
            {unacknowledgedAlerts > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-command-red text-[10px] font-bold text-white radar-alert">
                {unacknowledgedAlerts}
              </span>
            )}
          </button>

          {/* Light / Dark Mode Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-1.5 sm:p-2 rounded-lg bg-command-surface border border-command-border hover:bg-command-hover text-command-muted hover:text-command-cyan transition-colors"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4 text-amber-400" />
            ) : (
              <Moon className="h-4 w-4 text-command-cyan" />
            )}
          </button>

          {/* Officer Profile Badge & Sign Out */}
          <div className="flex items-center gap-1 sm:gap-1.5 pl-1 sm:pl-2 border-l border-command-border">
            <div
              className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-command-surface border border-command-accent flex items-center justify-center text-command-cyan flex-shrink-0"
              title={user?.full_name || 'Officer'}
            >
              <UserCheck className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </div>
            <div className="hidden xl:block text-left">
              <div className="text-xs font-semibold text-slate-900 dark:text-white leading-none">
                {user?.full_name || 'Inspector V. K. Patel'}
              </div>
              <div className="text-[10px] text-command-muted font-mono leading-tight mt-0.5">
                {user?.badge_number ? `${user.badge_number} · ` : ''}{user?.role || 'Investigator'}
              </div>
            </div>

            <button
              onClick={logout}
              className="p-1.5 rounded-lg bg-command-surface border border-command-border hover:bg-rose-500/20 text-slate-400 hover:text-rose-500 transition-colors"
              title="Sign Out"
              aria-label="Sign Out"
            >
              <LogOut className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Collapsible Search Tray (Dropdown on < md) */}
      {isMobileSearchOpen && (
        <div className="md:hidden mt-2 pt-2 border-t border-command-border/60 animate-in slide-in-from-top duration-200">
          <form onSubmit={handleSearch} className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                autoFocus
                value={searchPlate}
                onChange={(e) => setSearchPlate(e.target.value)}
                placeholder="Plate (e.g. GJ01AB1234)..."
                className="w-full bg-command-surface border border-command-border text-slate-900 dark:text-white text-xs rounded-lg pl-8 pr-3 py-2 placeholder-slate-400 focus:outline-none focus:border-command-accent font-mono uppercase"
              />
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-command-muted" />
            </div>
            <button
              type="submit"
              className="bg-command-accent hover:bg-blue-600 text-white text-xs font-bold px-3 py-2 rounded-lg transition-colors whitespace-nowrap shadow-xs"
            >
              Search
            </button>
          </form>
        </div>
      )}
    </header>
  );
}

