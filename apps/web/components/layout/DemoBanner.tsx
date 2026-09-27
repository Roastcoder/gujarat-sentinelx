'use client';

import React, { useState } from 'react';
import { AlertOctagon, Play, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

export default function DemoBanner() {
  const router = useRouter();
  const [running, setRunning] = useState(false);
  const [statusText, setStatusText] = useState<string | null>(null);

  const handleRun = async () => {
    try {
      setRunning(true);
      setStatusText('Simulating Cross-Camera Ingest & ANPR for GJ01AB1234...');
      await api.triggerDemo();
      setStatusText('Vehicle GJ01AB1234 detected across 7 cameras. Watchlist alert fired!');
      setTimeout(() => {
        router.push('/vehicles/GJ01AB1234');
        setRunning(false);
        setStatusText(null);
      }, 1000);
    } catch (err: any) {
      console.error(err);
      setRunning(false);
      setStatusText(null);
    }
  };

  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="bg-slate-900/95 text-slate-200 border-b border-blue-500/20 px-4 py-1.5 flex flex-wrap items-center justify-between gap-3 text-xs font-mono shadow-xs">
      <div className="flex items-center gap-2.5">
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
        </span>
        <div className="font-bold text-cyan-300 flex items-center gap-1.5">
          <AlertOctagon className="h-3.5 w-3.5 text-cyan-400" />
          <span>POLICE DEMO ENVIRONMENT · SENTINELX PROTOTYPE</span>
        </div>
        <span className="hidden md:inline-block text-[11px] text-slate-400">
          50 Active Feeds · Surepass VAHAN 4.0 & Gujarat e-Challan Connected
        </span>
      </div>

      <div className="flex items-center gap-3">
        {statusText && (
          <span className="text-xs font-mono text-cyan-300 animate-pulse">
            {statusText}
          </span>
        )}
        <button
          onClick={handleRun}
          disabled={running}
          className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded shadow-xs transition-all"
        >
          <Play className={`h-3 w-3 fill-current ${running ? 'animate-spin' : ''}`} />
          <span>SIMULATE GJ01AB1234</span>
        </button>
        <button
          onClick={() => setDismissed(true)}
          className="text-slate-400 hover:text-white text-xs px-1"
          title="Dismiss Banner"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
