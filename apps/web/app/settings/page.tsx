'use client';

import React from 'react';
import { Settings, Shield, HardDrive, Bell, Eye, Database } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3 p-4 rounded-xl bg-command-surface border border-command-border">
        <div className="h-9 w-9 rounded-lg bg-command-accent/20 border border-command-accent/40 flex items-center justify-center text-command-cyan">
          <Settings className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-base font-extrabold text-white tracking-wide uppercase">
            Platform Configuration & Security Policies
          </h1>
          <p className="text-xs text-command-muted font-mono">
            SentinelX Operational Configuration · Data Retention · Live Grid Ingestion
          </p>
        </div>
      </div>

      <div className="bg-command-surface border border-command-border rounded-xl p-5 space-y-4 font-mono text-xs">
        <h2 className="text-sm font-bold text-white uppercase border-b border-command-border pb-2">
          Sentinel Camera Grid Ingestion Policy
        </h2>

        <div className="space-y-3 text-slate-300">
          <div className="flex justify-between py-1 border-b border-command-border/40">
            <span className="text-command-muted">Grid CDN Host:</span>
            <span className="text-command-cyan font-bold">cctv.corp8.cloud</span>
          </div>
          <div className="flex justify-between py-1 border-b border-command-border/40">
            <span className="text-command-muted">RTSP Gateway IP:</span>
            <span className="text-white font-bold">103.250.160.189:8554 (TCP Forcing Active)</span>
          </div>
          <div className="flex justify-between py-1 border-b border-command-border/40">
            <span className="text-command-muted">WebRTC (WHEP) Port:</span>
            <span className="text-white">8889 / TCP</span>
          </div>
          <div className="flex justify-between py-1 border-b border-command-border/40">
            <span className="text-command-muted">Timing Strategy:</span>
            <span className="text-command-green font-bold">Monotonic PTS (Arrival Time Discarded)</span>
          </div>
          <div className="flex justify-between py-1 border-b border-command-border/40">
            <span className="text-command-muted">Reconnection Backoff:</span>
            <span className="text-white">Exponential (2s initial, 30s max cap)</span>
          </div>
          <div className="flex justify-between py-1 border-b border-command-border/40">
            <span className="text-command-muted">Video Retention Policy:</span>
            <span className="text-white">30 Days Automated Circular Buffer</span>
          </div>
        </div>
      </div>
    </div>
  );
}
