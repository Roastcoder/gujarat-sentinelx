'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Shield,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  Radio,
  CheckCircle2,
  KeyRound,
  Sun,
  Moon,
  Sparkles,
  Fingerprint,
} from 'lucide-react';
import { useAuth, SEEDED_OFFICERS } from '@/context/AuthContext';
import { useTheme } from '@/components/ThemeProvider';

export default function LoginPage() {
  const router = useRouter();
  const { login, quickLogin } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [username, setUsername] = useState('investigator');
  const [password, setPassword] = useState('SentinelX@2026');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'credentials' | 'quick'>('credentials');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError('Please provide both Officer Username and Password.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const ok = await login(username, password);
      if (ok) {
        router.push('/dashboard');
      } else {
        setError('Authentication failed. Please verify credentials.');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err?.message || 'Invalid officer credentials or gateway error.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (targetUsername: string) => {
    setLoading(true);
    setError(null);
    setUsername(targetUsername);
    setPassword('SentinelX@2026');

    try {
      const ok = await quickLogin(targetUsername);
      if (ok) {
        router.push('/dashboard');
      } else {
        setError('Quick sign-in failed. Please verify gateway connectivity.');
      }
    } catch (err: any) {
      setError(err?.message || 'Quick login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-command-bg text-command-text relative px-4 py-8 select-none overflow-x-hidden">
      {/* Background Subtle Cyber Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-command-cyan/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Floating Top Controls (Theme & System Status) */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 flex items-center gap-2.5 z-20">
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-command-surface border border-command-border text-[11px] font-mono shadow-xs">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
          <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
            STATE GATEWAY: 103.250.160.189
          </span>
        </div>

        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl bg-command-surface border border-command-border text-slate-500 hover:text-command-cyan transition-colors shadow-xs"
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          aria-label="Toggle Theme"
        >
          {theme === 'dark' ? (
            <Sun className="h-4 w-4 text-amber-400" />
          ) : (
            <Moon className="h-4 w-4 text-command-cyan" />
          )}
        </button>
      </div>

      {/* Centered Main Login Container */}
      <div className="relative z-10 w-full max-w-lg flex flex-col items-center space-y-6">
        {/* Centered Gujarat Police Logo & Platform Heading */}
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="relative group">
            {/* Soft Ambient Glow under Emblem */}
            <div className="absolute -inset-2 bg-gradient-to-r from-command-cyan/30 to-blue-600/30 rounded-full blur-md opacity-60 group-hover:opacity-100 transition-opacity" />

            <div className="relative h-20 w-16 sm:h-24 sm:w-20 p-2 rounded-2xl bg-command-surface/95 border border-command-border/80 shadow-xl flex items-center justify-center backdrop-blur-md">
              <Image
                src="/gujarat-police-logo.png"
                alt="Gujarat Police Official Emblem"
                width={68}
                height={84}
                className="object-contain drop-shadow"
                priority
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black font-mono tracking-wider text-slate-900 dark:text-white uppercase">
                GUJARAT SENTINEL<span className="text-command-cyan">X</span>
              </h1>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-command-accent/20 border border-command-accent/40 text-command-cyan font-bold uppercase">
                v1.0 POC
              </span>
            </div>
            <p className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 tracking-tight">
              State Police CCTV Intelligence & Investigation Platform
            </p>
            <p className="text-[11px] text-slate-500 font-mono">
              Government of Gujarat — Home Department
            </p>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-[11px] font-mono font-bold tracking-wide shadow-2xs">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>RESTRICTED LAW ENFORCEMENT ACCESS</span>
          </div>
        </div>

        {/* Centered Login Card */}
        <div className="w-full bg-command-surface/95 border border-command-border/80 backdrop-blur-xl rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
          {/* Navigation Tabs: Officer Credentials vs 1-Click Rapid Access */}
          <div className="flex rounded-xl bg-command-hover/80 p-1 border border-command-border/60">
            <button
              onClick={() => setActiveTab('credentials')}
              className={`flex-1 py-2 text-xs font-mono font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'credentials'
                  ? 'bg-command-card text-command-cyan shadow-sm border border-command-border/60'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Fingerprint className="h-3.5 w-3.5" />
              <span>Officer Sign-In</span>
            </button>
            <button
              onClick={() => setActiveTab('quick')}
              className={`flex-1 py-2 text-xs font-mono font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'quick'
                  ? 'bg-command-card text-command-cyan shadow-sm border border-command-border/60'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-500 dark:text-amber-400" />
              <span>1-Click Demo Profiles</span>
            </button>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/40 text-rose-600 dark:text-rose-400 text-xs font-mono flex items-center gap-2 animate-shake">
              <AlertTriangle className="h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Tab 1: Form Login */}
          {activeTab === 'credentials' && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono font-bold text-slate-700 dark:text-slate-300 uppercase mb-1.5">
                  Officer Username / Badge ID
                </label>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. investigator, admin, operator"
                    className="w-full bg-command-card border border-command-border rounded-xl pl-10 pr-4 py-2.5 text-sm font-mono text-slate-900 dark:text-white focus:outline-none focus:border-command-accent focus:ring-1 focus:ring-command-accent transition-all shadow-inner"
                    required
                  />
                  <User className="absolute left-3.5 h-4 w-4 text-slate-400" />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-mono font-bold text-slate-700 dark:text-slate-300 uppercase">
                    Password
                  </label>
                  <span className="text-[11px] text-slate-400 font-mono">
                    Demo: <code className="text-command-cyan font-bold">SentinelX@2026</code>
                  </span>
                </div>
                <div className="relative flex items-center">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-command-card border border-command-border rounded-xl pl-10 pr-10 py-2.5 text-sm font-mono text-slate-900 dark:text-white focus:outline-none focus:border-command-accent focus:ring-1 focus:ring-command-accent transition-all shadow-inner"
                    required
                  />
                  <Lock className="absolute left-3.5 h-4 w-4 text-slate-400" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-command-accent hover:bg-blue-600 active:scale-[0.99] text-white font-mono font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg hover:shadow-command-accent/25 transition-all disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <KeyRound className="h-4 w-4 animate-spin" />
                    <span>Verifying Credentials...</span>
                  </>
                ) : (
                  <>
                    <span>Authenticate & Access Console</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Tab 2: 1-Click Fast Officer Profiles */}
          {activeTab === 'quick' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-500 font-mono text-center">
                Select an authorized Gujarat Police personnel profile for immediate demonstration sign-in:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {SEEDED_OFFICERS.map((officer) => (
                  <button
                    key={officer.username}
                    onClick={() => handleQuickLogin(officer.username)}
                    disabled={loading}
                    className="p-3 rounded-xl border border-command-border/80 bg-command-card hover:border-command-accent hover:bg-command-accent/10 active:scale-[0.99] transition-all text-left flex items-start gap-3 group shadow-xs"
                  >
                    <div className="h-9 w-9 rounded-xl bg-command-accent/20 border border-command-accent/40 flex items-center justify-center text-command-cyan flex-shrink-0 group-hover:scale-105 transition-transform">
                      <Shield className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {officer.name}
                      </div>
                      <div className="text-[10px] text-command-muted font-mono flex items-center gap-1 mt-0.5">
                        <span className="text-command-cyan font-bold">{officer.badge}</span>
                        <span>·</span>
                        <span className="truncate">{officer.role}</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Hardware Security / GovNet Badge */}
          <div className="pt-2 border-t border-command-border/60 flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-command-cyan" />
              <span>256-Bit GovNet TLS</span>
            </span>
            <span>Default: SentinelX@2026</span>
          </div>
        </div>

        {/* Centered Government Footer */}
        <footer className="text-center space-y-1 text-xs font-mono text-slate-500 pt-2 max-w-md">
          <p>
            Official Law Enforcement Portal · Access restricted to authorized personnel.
          </p>
          <p className="text-[10px] text-slate-400">
            Governed by Information Technology Act 2000 & Gujarat Police Act
          </p>
        </footer>
      </div>
    </div>
  );
}
