'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Camera,
  Car,
  AlertTriangle,
  Activity,
  Search,
  CheckCircle2,
  XCircle,
  Radio,
  MapPin,
  Clock,
  ArrowRight,
  Shield,
  Layers,
  Sparkles,
  BarChart3,
  TrendingUp,
  Cpu,
  Zap,
  Eye,
  ChevronRight,
  Filter,
  Check,
} from 'lucide-react';
import { api } from '@/lib/api';

export default function DashboardPage() {
  const router = useRouter();
  const [analytics, setAnalytics] = useState<any>(null);
  const [recentDetections, setRecentDetections] = useState<any[]>([]);
  const [quickPlate, setQuickPlate] = useState('');
  const [loading, setLoading] = useState(true);
  const [hoveredHour, setHoveredHour] = useState<any>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [aData, detData] = await Promise.all([
          api.getAnalytics().catch(() => null),
          api.searchVehicles('limit=8').catch(() => []),
        ]);
        setAnalytics(aData);
        setRecentDetections(detData || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleQuickSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickPlate.trim()) {
      router.push(`/vehicles/${quickPlate.trim().toUpperCase()}`);
    }
  };

  const kpis = analytics?.kpis || {
    total_cameras: 50,
    online_cameras: 46,
    offline_cameras: 3,
    degraded_cameras: 1,
    live_events_today: 12482,
    vehicles_today: '2.4M',
    total_alerts: 4,
    critical_alerts: 1,
    simulated_state_cameras: '80,000+',
    simulated_state_online: '76,420',
  };

  const hourlyTrends = analytics?.hourly_trends || [
    { hour: '00:00', detections: 120, alerts: 0 },
    { hour: '02:00', detections: 65, alerts: 0 },
    { hour: '04:00', detections: 90, alerts: 0 },
    { hour: '06:00', detections: 380, alerts: 1 },
    { hour: '08:00', detections: 1250, alerts: 3 },
    { hour: '10:00', detections: 1840, alerts: 8 },
    { hour: '12:00', detections: 1620, alerts: 4 },
    { hour: '14:00', detections: 1410, alerts: 3 },
    { hour: '16:00', detections: 1950, alerts: 9 },
    { hour: '18:00', detections: 2420, alerts: 14 },
    { hour: '20:00', detections: 1890, alerts: 6 },
    { hour: '22:00', detections: 840, alerts: 2 },
  ];

  const maxDetection = Math.max(...hourlyTrends.map((h: any) => h.detections), 1);

  const vehicleBreakdown = analytics?.vehicle_types_breakdown || {
    SUV: 42,
    Sedan: 28,
    Hatchback: 18,
    Truck: 7,
    Bus: 3,
    Motorcycle: 2,
  };

  const totalVehicleSample = Object.values(vehicleBreakdown).reduce(
    (a: any, b: any) => Number(a) + Number(b),
    0
  ) as number;

  return (
    <div className="space-y-6 pb-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-command-border">
        <div className="flex items-center gap-3">
          <div className="h-11 w-9 relative flex-shrink-0">
            <Image
              src="/gujarat-police-logo.png"
              alt="Gujarat Police Crest"
              width={36}
              height={44}
              className="object-contain drop-shadow-sm"
              priority
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-wide uppercase">
                State CCTV Command & Intelligence Center
              </h1>
              <span className="hidden sm:inline-block bg-blue-500/10 border border-blue-500/30 text-blue-600 dark:text-cyan-400 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full uppercase">
                GUJARAT POLICE
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono font-medium mt-0.5">
              STATE SURVEILLANCE & RECONSTRUCTION PLATFORM · SECURE COMMAND PORTAL
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 font-mono text-xs">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800/60 shadow-2xs">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-emerald-800 dark:text-emerald-300 font-bold">GRID OPERATIONAL</span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-command-surface border border-command-border text-slate-700 dark:text-slate-200 font-semibold shadow-2xs">
            <span className="text-command-cyan font-bold">50</span> FEEDS ACTIVE
          </div>
        </div>
      </div>

      {/* Authoritative CCTV Ingest & Stream Operations Banner */}
      <div className="flex flex-col sm:flex-row items-center justify-between p-3.5 rounded-xl bg-command-surface border border-command-border text-xs font-mono gap-3 shadow-xs">

        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-command-accent/20 text-command-cyan border border-command-accent/30">
            <Radio className="h-4 w-4 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white uppercase">Authoritative CCTV Ingest & Stream Operations</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-command-green/20 text-command-green border border-command-green/30">
                GET /api/ingest
              </span>
            </div>
            <p className="text-[11px] text-command-muted">
              Forced RTSP TCP · Presentation Timestamps (PTS) · Atomic Reference Counting · H.264 & H.265 Decoding
            </p>
          </div>
        </div>

        <Link
          href="/ingest"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-command-accent hover:bg-command-accent/80 text-white font-bold text-xs transition-all shadow-xs shrink-0"
        >
          <span>STREAM CONSOLE</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* KPI Cards (6 Grid) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">

        {/* Total Projected Statewide */}
        <div className="bg-command-surface border-t-2 border-t-blue-500 border-x border-b border-command-border rounded-xl p-3.5 relative overflow-hidden shadow-xs hover:border-blue-400 transition-all">
          <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold">
            STATE CAMERAS
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white font-mono mt-1 tracking-tight">
            80,000+
          </div>
          <div className="text-[11px] text-blue-600 dark:text-cyan-400 mt-1.5 flex items-center gap-1 font-mono font-bold">
            <Layers className="h-3 w-3" />
            <span>33 Districts</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-2.5 overflow-hidden">
            <div className="bg-blue-500 h-full rounded-full" style={{ width: '82%' }}></div>
          </div>
        </div>

        {/* Prototype Feeds Active */}
        <div className="bg-command-surface border-t-2 border-t-cyan-500 border-x border-b border-command-border rounded-xl p-3.5 relative overflow-hidden shadow-xs hover:border-cyan-400 transition-all">
          <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold">
            ACTIVE EDGE FEEDS
          </div>
          <div className="text-2xl font-black text-command-cyan font-mono mt-1 tracking-tight">
            {kpis.total_cameras}
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1.5 font-mono font-bold flex items-center gap-1">
            <Check className="h-3 w-3" />
            <span>{kpis.online_cameras} Online (92% SLA)</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-2.5 overflow-hidden">
            <div className="bg-cyan-500 h-full rounded-full" style={{ width: '92%' }}></div>
          </div>
        </div>

        {/* System Health / Degraded */}
        <div className="bg-command-surface border-t-2 border-t-amber-500 border-x border-b border-command-border rounded-xl p-3.5 relative overflow-hidden shadow-xs hover:border-amber-400 transition-all">
          <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold">
            OFFLINE / DEGRADED
          </div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400 font-mono mt-1 tracking-tight">
            {kpis.offline_cameras + kpis.degraded_cameras}
          </div>
          <div className="text-[11px] text-slate-600 dark:text-slate-400 mt-1.5 font-mono font-medium">
            {kpis.offline_cameras} Offline · {kpis.degraded_cameras} Degraded
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-2.5 overflow-hidden">
            <div className="bg-amber-500 h-full rounded-full" style={{ width: '8%' }}></div>
          </div>
        </div>

        {/* Live Events Today */}
        <div className="bg-command-surface border-t-2 border-t-purple-500 border-x border-b border-command-border rounded-xl p-3.5 relative overflow-hidden shadow-xs hover:border-purple-400 transition-all">
          <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold">
            ANPR EVENTS TODAY
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white font-mono mt-1 tracking-tight">
            {kpis.live_events_today.toLocaleString()}
          </div>
          <div className="text-[11px] text-purple-600 dark:text-purple-400 mt-1.5 font-mono font-bold flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            <span>+142 / min rate</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-2.5 overflow-hidden">
            <div className="bg-purple-500 h-full rounded-full" style={{ width: '74%' }}></div>
          </div>
        </div>

        {/* Vehicles Today */}
        <div className="bg-command-surface border-t-2 border-t-sky-500 border-x border-b border-command-border rounded-xl p-3.5 relative overflow-hidden shadow-xs hover:border-sky-400 transition-all">
          <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold">
            VEHICLES SCANNED
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white font-mono mt-1 tracking-tight">
            2.4M
          </div>
          <div className="text-[11px] text-sky-600 dark:text-sky-400 mt-1.5 font-mono font-bold flex items-center gap-1">
            <Car className="h-3 w-3" />
            <span>MoRTH Synced</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-2.5 overflow-hidden">
            <div className="bg-sky-500 h-full rounded-full" style={{ width: '88%' }}></div>
          </div>
        </div>

        {/* Active Alerts (Clean Ruby/Rose Styling - High Contrast, Not Muddy) */}
        <div className="bg-command-surface border-t-2 border-t-rose-500 border-x border-b border-command-border rounded-xl p-3.5 relative overflow-hidden shadow-xs hover:border-rose-400 transition-all">
          <div className="text-[10px] font-mono text-rose-600 dark:text-rose-400 uppercase tracking-wider font-bold flex items-center justify-between">
            <span>ACTIVE ALERTS</span>
            <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping"></span>
          </div>
          <div className="text-2xl font-black text-rose-600 dark:text-rose-400 font-mono mt-1 tracking-tight">
            {kpis.total_alerts}
          </div>
          <div className="text-[11px] text-slate-600 dark:text-slate-300 mt-1.5 font-mono font-bold flex items-center gap-1">
            <AlertTriangle className="h-3 w-3 text-rose-500" />
            <span>{kpis.critical_alerts || 1} High Priority</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-2.5 overflow-hidden">
            <div className="bg-rose-500 h-full rounded-full" style={{ width: '100%' }}></div>
          </div>
        </div>
      </div>

      {/* Prominent Vehicle Investigation Banner */}
      <div className="bg-gradient-to-r from-command-surface via-blue-50/50 dark:via-[#09152C] to-command-surface border border-command-border rounded-xl p-5 shadow-xs relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1.5 max-w-xl">
            <div className="flex items-center gap-2 text-xs font-mono text-command-cyan font-bold uppercase tracking-wider">
              <Sparkles className="h-4 w-4" />
              <span>Cross-Camera Spatio-Temporal Intelligence Engine</span>
            </div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-wide">
              INVESTIGATE VEHICLE JOURNEY ACROSS GUJARAT CCTV
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Query any registration plate to reconstruct chronological multi-camera timelines,
              generate GIS travel trajectories, view high-confidence ANPR snapshots, and cross-match watchlists.
            </p>

            {/* Quick Demo Plate Pills */}
            <div className="pt-2 flex flex-wrap items-center gap-2 text-xs font-mono">
              <span className="text-[11px] text-slate-500 font-bold uppercase">Quick Samples:</span>
              <button
                type="button"
                onClick={() => router.push('/vehicles/GJ01AB1234')}
                className="bg-command-card hover:bg-command-accent/15 border border-command-border text-slate-800 dark:text-slate-200 px-2 py-0.5 rounded text-[11px] font-bold transition-colors"
              >
                GJ01AB1234 <span className="text-command-cyan text-[10px]">(7 Cams)</span>
              </button>
              <button
                type="button"
                onClick={() => router.push('/vehicles/GJ03KL5544')}
                className="bg-command-card hover:bg-command-accent/15 border border-command-border text-slate-800 dark:text-slate-200 px-2 py-0.5 rounded text-[11px] font-bold transition-colors"
              >
                GJ03KL5544 <span className="text-emerald-500 text-[10px]">(Rajkot)</span>
              </button>
              <button
                type="button"
                onClick={() => router.push('/rc-challan?plate=RJ60HS6517')}
                className="bg-command-card hover:bg-command-accent/15 border border-command-border text-slate-800 dark:text-slate-200 px-2 py-0.5 rounded text-[11px] font-bold transition-colors"
              >
                RJ60HS6517 <span className="text-blue-500 text-[10px]">(Clean RC)</span>
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
            <form onSubmit={handleQuickSearch} className="flex items-center gap-2 flex-1 sm:w-80">
              <input
                type="text"
                value={quickPlate}
                onChange={(e) => setQuickPlate(e.target.value)}
                placeholder="Enter Plate (e.g. GJ01AB1234)"
                className="w-full bg-command-surface border border-command-border text-slate-900 dark:text-white text-xs rounded-lg px-3 py-2.5 font-mono uppercase focus:border-command-accent focus:outline-none shadow-xs"
              />
              <button
                type="submit"
                className="bg-command-accent hover:bg-blue-600 text-white text-xs font-bold px-4 py-2.5 rounded-lg transition-colors flex items-center gap-1.5 flex-shrink-0 shadow-sm"
              >
                <span>Search</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </form>

            <Link
              href="/vehicles/GJ01AB1234"
              className="bg-command-surface border border-command-accent hover:bg-command-accent/10 text-command-cyan text-xs font-mono font-bold px-4 py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 shadow-xs"
            >
              <span>DEMO: GJ01AB1234</span>
              <span className="bg-command-accent/20 px-1.5 py-0.5 rounded text-[10px]">7 CAMS</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Analytics & Real-Time Intelligence Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: 24h Detection Volume Graph & AI Telemetry (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* 24-Hour Traffic & ANPR Ingest Chart */}
          <div className="bg-command-surface border border-command-border rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-command-border/60 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-blue-500/10 text-command-cyan border border-blue-500/20">
                  <BarChart3 className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-wide uppercase">
                    24-Hour ANPR Ingest Volume & Threat Distribution
                  </h3>
                  <p className="text-[11px] text-slate-500 font-mono">
                    Real-time statewide camera traffic curve with peak congestion analysis
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-xs font-mono">
                <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
                  <span className="h-2.5 w-2.5 rounded-sm bg-command-cyan"></span> Detections
                </span>
                <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
                  <span className="h-2.5 w-2.5 rounded-sm bg-rose-500"></span> Alerts
                </span>
              </div>
            </div>

            {/* Interactive Custom Time-Series Bars */}
            <div className="pt-2">
              <div className="h-48 w-full flex items-end justify-between gap-1 sm:gap-2 px-1">
                {hourlyTrends.map((item: any, idx: number) => {
                  const heightPercent = Math.max(Math.round((item.detections / maxDetection) * 100), 8);
                  const isHovered = hoveredHour?.hour === item.hour;
                  return (
                    <div
                      key={item.hour}
                      className="flex-1 flex flex-col items-center gap-1.5 group cursor-pointer"
                      onMouseEnter={() => setHoveredHour(item)}
                      onMouseLeave={() => setHoveredHour(null)}
                    >
                      <div className="w-full flex items-end justify-center h-36 relative">
                        {/* Tooltip on Hover */}
                        {isHovered && (
                          <div className="absolute -top-12 z-20 bg-slate-900 text-white border border-command-border px-2.5 py-1 rounded text-[10px] font-mono shadow-xl whitespace-nowrap">
                            <div className="font-bold text-command-cyan">{item.hour} hrs</div>
                            <div>{item.detections.toLocaleString()} Detections · {item.alerts} Alerts</div>
                          </div>
                        )}
                        <div
                          className={`w-full max-w-[28px] rounded-t transition-all ${
                            isHovered
                              ? 'bg-command-cyan shadow-lg shadow-cyan-500/30'
                              : 'bg-command-accent/80 hover:bg-command-cyan'
                          }`}
                          style={{ height: `${heightPercent}%` }}
                        >
                          {item.alerts > 0 && (
                            <div
                              className="w-full bg-rose-500 rounded-t"
                              style={{ height: `${Math.min(item.alerts * 5, 40)}%` }}
                              title={`${item.alerts} alerts fired`}
                            ></div>
                          )}
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 group-hover:text-command-cyan font-semibold">
                        {item.hour}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* AI Vision Telemetry Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-command-border/60 text-xs font-mono">
              <div className="p-2.5 rounded-lg bg-command-card border border-command-border">
                <div className="text-[10px] text-slate-500 font-bold uppercase">Average OCR Latency</div>
                <div className="text-base font-black text-command-cyan mt-0.5">16.4 ms</div>
                <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">GPU TensorRT</div>
              </div>
              <div className="p-2.5 rounded-lg bg-command-card border border-command-border">
                <div className="text-[10px] text-slate-500 font-bold uppercase">OCR Confidence Rate</div>
                <div className="text-base font-black text-slate-900 dark:text-white mt-0.5">98.9%</div>
                <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">High Accuracy</div>
              </div>
              <div className="p-2.5 rounded-lg bg-command-card border border-command-border">
                <div className="text-[10px] text-slate-500 font-bold uppercase">Cross-Cam Match</div>
                <div className="text-base font-black text-purple-600 dark:text-purple-400 mt-0.5">99.4%</div>
                <div className="text-[10px] text-purple-500 font-medium">SMR Correlated</div>
              </div>
              <div className="p-2.5 rounded-lg bg-command-card border border-command-border">
                <div className="text-[10px] text-slate-500 font-bold uppercase">Edge Ingest Speed</div>
                <div className="text-base font-black text-emerald-600 dark:text-emerald-400 mt-0.5">2.4 GB/s</div>
                <div className="text-[10px] text-slate-500 font-medium">50 Video Streams</div>
              </div>
            </div>
          </div>

          {/* Statewide CCTV Camera Distribution & GIS */}
          <div className="bg-command-surface border border-command-border rounded-xl p-5 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-command-border/60 pb-3">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-command-cyan" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-wide uppercase">
                  Statewide CCTV Camera Distribution & GIS Nodes
                </h3>
              </div>
              <Link
                href="/map"
                className="text-xs text-command-cyan hover:underline font-mono flex items-center gap-1 font-bold"
              >
                <span>Open Interactive GIS Map</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {/* Quick District Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs font-mono">
              {analytics?.districts?.slice(0, 8).map((d: any) => (
                <div
                  key={d.district_name}
                  className="p-3 rounded-lg bg-command-card border border-command-border flex flex-col justify-between shadow-2xs hover:border-command-accent/50 transition-all"
                >
                  <div className="text-[11px] font-bold text-slate-800 dark:text-slate-200 truncate">
                    {d.district_name}
                  </div>
                  <div className="mt-2 flex items-baseline justify-between">
                    <span className="text-lg font-black text-command-cyan">
                      {d.camera_count}
                    </span>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                      {d.online_count} Online
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Live Investigation Shortcut */}
            <div className="p-3.5 rounded-xl bg-command-card border border-command-border shadow-xs flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-command-accent/15 border border-command-accent/30 flex items-center justify-center text-command-cyan">
                  <Radio className="h-4 w-4 animate-pulse" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">
                    Primary Hackathon Case: C.G. Road Heist Getaway
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                    Vehicle GJ01AB1234 · 7 Cameras Correlated · Ahmedabad → Gandhinagar
                  </div>
                </div>
              </div>
              <Link
                href="/vehicles/GJ01AB1234"
                className="bg-command-accent text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-blue-600 transition-colors shadow-xs"
              >
                View Route →
              </Link>
            </div>
          </div>
        </div>

        {/* Right Column: Vehicle Classifications & Recent ANPR Detections */}
        <div className="space-y-6">
          {/* Vehicle Classification Distribution */}
          <div className="bg-command-surface border border-command-border rounded-xl p-5 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-command-border/60 pb-3">
              <div className="flex items-center gap-2">
                <Car className="h-4 w-4 text-command-cyan" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-wide uppercase">
                  Vehicle Classification Breakdown
                </h3>
              </div>
              <span className="text-[10px] font-mono text-slate-500">MoRTH VAHAN</span>
            </div>

            <div className="space-y-3 font-mono text-xs">
              {Object.entries(vehicleBreakdown).map(([vType, count]: [string, any]) => {
                const pct = Math.round((Number(count) / totalVehicleSample) * 100);
                return (
                  <div key={vType} className="space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-slate-800 dark:text-slate-200">{vType}</span>
                      <span className="text-slate-500">
                        {count} sample ({pct}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all bg-gradient-to-r from-command-accent to-command-cyan"
                        style={{ width: `${pct}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent ANPR Detections Stream - CRISP, HIGH-VISIBILITY DESIGN */}
          <div className="bg-command-surface border border-command-border rounded-xl p-5 space-y-3.5 shadow-xs">
            <div className="flex items-center justify-between border-b border-command-border/60 pb-3">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-wide uppercase">
                  Recent ANPR Detections
                </h3>
              </div>
              <Link
                href="/events"
                className="text-xs text-command-cyan hover:underline font-mono font-bold"
              >
                View All
              </Link>
            </div>

            {/* Clean, High-Contrast Detection Cards (No Muddy Red Wash!) */}
            <div className="space-y-2.5">
              {recentDetections.slice(0, 6).map((d: any) => {
                const isWatchlist = d.is_flagged || d.plate_number === 'GJ01AB1234';
                return (
                  <div
                    key={d.id || d.plate_number + d.timestamp}
                    className={`p-3 rounded-xl border text-xs flex items-center justify-between gap-3 transition-all ${
                      isWatchlist
                        ? 'border-l-4 border-l-rose-500 bg-white dark:bg-command-card border-y border-r border-slate-200 dark:border-command-border shadow-xs'
                        : 'border-l-4 border-l-emerald-500 bg-white dark:bg-command-card border-y border-r border-slate-200 dark:border-command-border shadow-xs'
                    }`}
                  >
                    <div className="min-w-0 space-y-1">
                      {/* Indian HSRP License Plate Visual */}
                      <div className="flex items-center gap-2">
                        <div className="inline-flex items-center border border-slate-300 dark:border-slate-600 rounded bg-slate-50 dark:bg-slate-900 px-2 py-0.5 font-mono shadow-2xs">
                          <span className="text-[9px] font-black text-blue-700 dark:text-blue-400 pr-1.5 border-r border-slate-300 dark:border-slate-700">
                            IND
                          </span>
                          <span className="pl-1.5 font-black text-slate-900 dark:text-white tracking-wider text-xs">
                            {d.plate_number}
                          </span>
                        </div>

                        {isWatchlist ? (
                          <span className="text-[10px] bg-rose-600 text-white font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-2xs">
                            WATCHLIST
                          </span>
                        ) : (
                          <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-bold px-2 py-0.5 rounded-full uppercase border border-emerald-500/20">
                            CLEAR
                          </span>
                        )}
                      </div>

                      <div className="text-[11px] text-slate-600 dark:text-slate-400 font-mono truncate">
                        {d.camera_code || 'CAM-01'} · {d.camera_name || 'Vidhan Sabha Marg'}
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0 space-y-1">
                      <div className="text-[11px] font-mono font-bold text-command-cyan">
                        {d.confidence ? `${Math.round(d.confidence * 100)}% Conf` : '99% Conf'}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {d.timestamp ? new Date(d.timestamp).toLocaleTimeString() : '05:36:12'}
                      </div>
                      <Link
                        href={`/vehicles/${d.plate_number}`}
                        className="inline-block text-[10px] font-bold text-blue-600 dark:text-cyan-400 hover:underline font-mono"
                      >
                        Track →
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>

            <Link
              href="/live"
              className="mt-2 block w-full py-2.5 rounded-lg border border-command-border bg-command-card hover:bg-command-hover text-center text-xs font-mono font-bold text-slate-800 dark:text-slate-200 transition-colors shadow-2xs"
            >
              OPEN LIVE 1/4/9/16 CCTV GRID →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
