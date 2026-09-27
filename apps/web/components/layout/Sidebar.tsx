'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Video,
  MapPin,
  Camera,
  Car,
  Briefcase,
  Activity,
  AlertTriangle,
  FileCheck,
  BarChart3,
  Network,
  Cpu,
  Users,
  ShieldAlert,
  Settings,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Radio,
  X,
} from 'lucide-react';

import { useSidebar } from '@/context/SidebarContext';

const navigationItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Live Monitoring', href: '/live', icon: Video, badge: '50 Feeds' },
  { name: 'Ingest & Stream Ops', href: '/ingest', icon: Radio, badge: 'PTS / TCP' },
  { name: 'GIS Map', href: '/map', icon: MapPin },
  { name: 'Camera Registry', href: '/cameras', icon: Camera },
  { name: 'Vehicle Intelligence', href: '/vehicles', icon: Car },
  { name: 'RC & e-Challan Portal', href: '/rc-challan', icon: ShieldCheck, badge: 'MoRTH' },
  { name: 'Investigations', href: '/investigations', icon: Briefcase },
  { name: 'Events Stream', href: '/events', icon: Activity },
  { name: 'Alerts', href: '/alerts', icon: AlertTriangle, alertBadge: true },
  { name: 'Watchlists', href: '/watchlists', icon: FileCheck },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'VMS Integrations', href: '/vms', icon: Network },
  { name: 'System Health', href: '/system-health', icon: Cpu },
  { name: 'Users & Roles', href: '/users', icon: Users },
  { name: 'Audit Logs', href: '/audit-logs', icon: ShieldAlert },
  { name: 'Settings', href: '/settings', icon: Settings },
];


export default function Sidebar() {
  const pathname = usePathname();
  const { isCollapsed, toggleCollapse, isMobileOpen, setIsMobileOpen } = useSidebar();

  const sidebarContent = (
    <div className="h-full flex flex-col justify-between">
      {/* Sidebar Header & Toggle */}
      <div>
        <div className="p-3 text-[11px] font-mono tracking-wider text-slate-500 dark:text-command-muted uppercase font-bold border-b border-command-border/50 flex items-center justify-between bg-command-bg/50">
          {!isCollapsed && <span className="truncate">Navigation Console</span>}
          <div className="flex items-center gap-1 mx-auto lg:mx-0">
            {/* Desktop Collapse Toggle */}
            <button
              onClick={toggleCollapse}
              className="hidden lg:flex p-1.5 rounded-lg hover:bg-command-surface text-slate-400 hover:text-command-cyan transition-colors"
              title={isCollapsed ? 'Expand Sidebar (Ctrl+B)' : 'Collapse Sidebar (Ctrl+B)'}
              aria-label="Toggle Sidebar Collapse"
            >
              {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </button>

            {/* Mobile Close Button */}
            <button
              onClick={() => setIsMobileOpen(false)}
              className="lg:hidden p-1.5 rounded-lg hover:bg-command-surface text-slate-400 hover:text-rose-500 transition-colors"
              aria-label="Close Mobile Menu"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1 p-2 overflow-y-auto max-h-[calc(100vh-170px)]">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href || (pathname?.startsWith(item.href + '/') && item.href !== '/');
            const Icon = item.icon;

            return (
              <div key={item.name} className="relative group">
                <Link
                  href={item.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={`flex items-center text-xs font-medium rounded-lg transition-all ${
                    isCollapsed
                      ? 'justify-center p-2.5'
                      : 'justify-between px-3 py-2'
                  } ${
                    isActive
                      ? 'bg-command-accent text-white shadow-xs font-bold'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-command-surface hover:text-slate-900 dark:hover:text-white'
                  }`}
                  title={isCollapsed ? item.name : undefined}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon
                      className={`h-4 w-4 flex-shrink-0 ${
                        isActive ? 'text-white' : 'text-slate-400 dark:text-command-muted group-hover:text-command-cyan'
                      }`}
                    />
                    {!isCollapsed && <span className="truncate">{item.name}</span>}
                  </div>

                  {!isCollapsed && item.badge && (
                    <span className="text-[10px] font-mono bg-blue-500/10 border border-blue-500/30 text-blue-600 dark:text-cyan-400 px-1.5 py-0.2 rounded font-semibold ml-2 flex-shrink-0">
                      {item.badge}
                    </span>
                  )}
                </Link>

                {/* Floating Tooltip in Collapsed Mode */}
                {isCollapsed && (
                  <div className="hidden lg:group-hover:flex absolute left-full top-1/2 -translate-y-1/2 ml-2 z-50 bg-slate-900 text-white text-xs px-2.5 py-1.5 rounded-md shadow-xl border border-slate-700 font-mono whitespace-nowrap pointer-events-none items-center gap-1.5">
                    <span>{item.name}</span>
                    {item.badge && (
                      <span className="text-[9px] bg-cyan-900/60 text-cyan-300 px-1 rounded">
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>

      {/* Jurisdiction Footer */}
      <div className="p-3 border-t border-command-border bg-command-surface/40 text-[11px] font-mono flex-shrink-0">
        {!isCollapsed ? (
          <div>
            <div className="font-bold text-slate-700 dark:text-slate-300">STATE JURISDICTION: GUJARAT</div>
            <div className="text-[10px] text-slate-500 mt-0.5">33 DISTRICTS · 80,000 CAMERAS</div>
          </div>
        ) : (
          <div className="text-center" title="Gujarat Police · 33 Districts">
            <span className="text-[10px] font-black text-command-cyan">GJ</span>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* 1. Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-40 lg:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* 2. Mobile Drawer (Slide-in) */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-command-bg border-r border-command-border shadow-2xl transform transition-transform duration-300 ease-in-out lg:hidden flex flex-col ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* 3. Desktop Collapsible Sidebar */}
      <aside
        className={`hidden lg:flex flex-col flex-shrink-0 sticky top-[80px] h-[calc(100vh-80px)] border-r border-command-border bg-command-bg transition-all duration-300 ease-in-out z-30 shadow-xs ${
          isCollapsed ? 'w-18' : 'w-64'
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
