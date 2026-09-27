'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  FileCheck,
  Plus,
  ShieldAlert,
  Car,
  Clock,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { api } from '@/lib/api';

export default function WatchlistsPage() {
  const [watchlists, setWatchlists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadWatchlists() {
      try {
        setLoading(true);
        const data = await api.getWatchlists();
        setWatchlists(data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadWatchlists();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl bg-command-surface border border-command-border">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-command-accent/20 border border-command-accent/40 flex items-center justify-center text-command-cyan">
            <FileCheck className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-base font-extrabold text-white tracking-wide uppercase">
              Statewide Watchlists & Hotlist Vehicle Registry
            </h1>
            <p className="text-xs text-command-muted font-mono">
              High-Priority Criminal Suspects · Stolen Commercial Vehicles · Traffic Flagging
            </p>
          </div>
        </div>

        <div className="text-xs font-mono text-command-cyan font-bold">
          {watchlists.reduce((acc, w) => acc + (w.vehicle_count || 0), 0)} FLAGGED VEHICLES
        </div>
      </div>

      {/* Watchlist Cards */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-8 text-center text-xs text-command-muted">Loading watchlists...</div>
        ) : (
          watchlists.map((wl) => (
            <div
              key={wl.id}
              className="bg-command-surface border border-command-border rounded-xl p-5 space-y-4 shadow-md"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-command-border">
                <div>
                  <div className="flex items-center gap-2.5">
                    <h2 className="text-sm font-bold text-white font-mono uppercase">
                      {wl.name}
                    </h2>
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase ${
                        wl.priority === 'HIGH'
                          ? 'bg-red-600 text-white'
                          : 'bg-amber-600 text-white'
                      }`}
                    >
                      {wl.priority} PRIORITY
                    </span>
                  </div>
                  <p className="text-xs text-command-muted mt-1">{wl.description}</p>
                </div>

                <div className="text-right text-xs font-mono text-command-muted">
                  Created by: <span className="text-slate-300 font-semibold">{wl.created_by}</span>
                </div>
              </div>

              {/* Vehicles in this watchlist */}
              <div className="space-y-2">
                <div className="text-xs font-mono text-command-muted uppercase font-semibold">
                  Flagged Vehicles ({wl.vehicles?.length || 0})
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {wl.vehicles?.map((v: any) => (
                    <div
                      key={v.id}
                      className="p-3 rounded-lg bg-command-card border border-command-border text-xs flex items-center justify-between gap-3 font-mono"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/vehicles/${v.plate_number}`}
                            className="text-sm font-black text-white hover:text-command-cyan hover:underline"
                          >
                            {v.plate_number}
                          </Link>
                          {v.case_number && (
                            <span className="text-[10px] bg-black/40 text-slate-300 px-1.5 py-0.2 rounded border border-command-border">
                              {v.case_number}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-command-muted mt-1">{v.reason}</p>
                      </div>

                      <Link
                        href={`/vehicles/${v.plate_number}`}
                        className="bg-command-accent hover:bg-blue-600 text-white text-[11px] font-bold px-2.5 py-1.5 rounded transition-colors flex items-center gap-1 flex-shrink-0"
                      >
                        <span>Journey</span>
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
