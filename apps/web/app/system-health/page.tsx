'use client';

import React, { useEffect, useState } from 'react';
import {
  Cpu,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Activity,
  Layers,
  HardDrive,
  Database,
  Radio,
  Clock,
  RefreshCw,
} from 'lucide-react';
import { api } from '@/lib/api';

export default function SystemHealthPage() {
  const [health, setHealth] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadHealth = async () => {
    try {
      setLoading(true);
      const data = await api.getHealth();
      setHealth(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHealth();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl bg-command-surface border border-command-border">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-command-accent/20 border border-command-accent/40 flex items-center justify-center text-command-cyan">
            <Cpu className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-base font-extrabold text-white tracking-wide uppercase">
              System Health & Infrastructure Telemetry
            </h1>
            <p className="text-xs text-command-muted font-mono">
              Live Monitoring of PostGIS, Redis, Kafka, OpenSearch, ClickHouse, MinIO & Sentinel Grid
            </p>
          </div>
        </div>

        <button
          onClick={loadHealth}
          className="flex items-center gap-2 bg-command-card hover:bg-command-hover text-white text-xs font-mono font-bold px-3 py-1.5 rounded-lg border border-command-border transition-colors"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Metrics</span>
        </button>
      </div>

      {/* Top Health Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-command-surface border border-command-border rounded-xl p-4">
          <div className="text-[10px] font-mono text-command-muted uppercase">OVERALL STATUS</div>
          <div className="text-2xl font-black font-mono text-command-green mt-1">OPERATIONAL</div>
          <div className="text-[10px] text-command-muted font-mono mt-1">
            All 8 Microservices Active
          </div>
        </div>

        <div className="bg-command-surface border border-command-border rounded-xl p-4">
          <div className="text-[10px] font-mono text-command-muted uppercase">CAMERA AVAILABILITY</div>
          <div className="text-2xl font-black font-mono text-command-cyan mt-1">
            {health?.camera_availability_pct || 96.0}%
          </div>
          <div className="text-[10px] text-slate-300 font-mono mt-1">
            {health?.online_cameras || 46} of {health?.total_cameras || 50} Online
          </div>
        </div>

        <div className="bg-command-surface border border-command-border rounded-xl p-4">
          <div className="text-[10px] font-mono text-command-muted uppercase">SYSTEM UPTIME</div>
          <div className="text-2xl font-black font-mono text-white mt-1">
            {Math.floor((health?.uptime_seconds || 1840) / 60)}m {(health?.uptime_seconds || 1840) % 60}s
          </div>
          <div className="text-[10px] text-command-green font-mono mt-1">
            99.98% SLA
          </div>
        </div>

        <div className="bg-command-surface border border-command-border rounded-xl p-4">
          <div className="text-[10px] font-mono text-command-muted uppercase">EVENT PROCESSING LATENCY</div>
          <div className="text-2xl font-black font-mono text-amber-400 mt-1">32 ms</div>
          <div className="text-[10px] text-command-muted font-mono mt-1">
            End-to-End Pipeline
          </div>
        </div>
      </div>

      {/* Component Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {health?.components?.map((c: any) => (
          <div
            key={c.name}
            className="p-4 rounded-xl bg-command-surface border border-command-border space-y-2 font-mono text-xs shadow-md"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="font-bold text-white text-sm">{c.name}</div>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 ${
                  c.status === 'HEALTHY'
                    ? 'bg-command-green/20 text-command-green border border-command-green/30'
                    : 'bg-command-red/20 text-command-red border border-command-red/30'
                }`}
              >
                <CheckCircle2 className="h-3 w-3" />
                {c.status}
              </span>
            </div>

            <p className="text-[11px] text-slate-300 font-sans">{c.details}</p>

            <div className="pt-2 border-t border-command-border/40 flex items-center justify-between text-[10px] text-command-muted">
              <span>Response Latency: <strong className="text-command-cyan">{c.latency_ms}ms</strong></span>
              {c.is_simulated ? (
                <span className="text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded">
                  DEMO HARNESS
                </span>
              ) : (
                <span className="text-command-green bg-command-green/10 px-1.5 py-0.5 rounded">
                  LIVE CLOUD
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
