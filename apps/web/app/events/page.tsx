'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Activity, Clock, Camera, Radio, Search, Filter } from 'lucide-react';
import { api } from '@/lib/api';

export default function EventsStreamPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadEvents() {
      try {
        setLoading(true);
        const res = await api.getGISEvents();
        setEvents(res?.features || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadEvents();
  }, []);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl bg-command-surface border border-command-border shadow-xs">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-command-cyan">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-base font-extrabold text-slate-900 dark:text-white tracking-wide uppercase">
              Live ANPR & CCTV Detection Event Stream
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              Normalized Detections Ingested from Heterogeneous CCTV Cameras Across Gujarat
            </p>
          </div>
        </div>

        <div className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
          <span>REALTIME INGEST: 12,482 EVENTS TODAY</span>
        </div>
      </div>

      {/* Events Table */}
      <div className="bg-command-surface border border-command-border rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-command-card border-b border-command-border text-[11px] text-slate-700 dark:text-slate-300 font-bold uppercase">
              <tr>
                <th className="py-3 px-4">Time</th>
                <th className="py-3 px-4">Plate Number</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Camera ID</th>
                <th className="py-3 px-4">Camera Location</th>
                <th className="py-3 px-4">Vehicle Specs</th>
                <th className="py-3 px-4">Speed</th>
                <th className="py-3 px-4 text-right">Confidence</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-command-border/40 text-slate-800 dark:text-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    Loading live events stream...
                  </td>
                </tr>
              ) : events.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    No detection events logged.
                  </td>
                </tr>
              ) : (
                events.map((evt: any) => {
                  const p = evt.properties;
                  const isFlagged = p.is_flagged || p.plate_number === 'GJ01AB1234';
                  return (
                    <tr
                      key={p.id}
                      className={`hover:bg-command-card/50 transition-colors ${
                        isFlagged
                          ? 'bg-rose-50/60 dark:bg-rose-950/20 border-l-4 border-l-rose-500'
                          : 'border-l-4 border-l-transparent'
                      }`}
                    >
                      <td className="py-3 px-4 text-slate-500 dark:text-slate-400">
                        {new Date(p.timestamp).toLocaleTimeString()}
                      </td>
                      <td className="py-3 px-4">
                        <Link
                          href={`/vehicles/${p.plate_number}`}
                          className="font-black text-slate-900 dark:text-white hover:text-command-cyan hover:underline tracking-wider"
                        >
                          {p.plate_number}
                        </Link>
                      </td>
                      <td className="py-3 px-4">
                        {isFlagged ? (
                          <span className="text-[10px] bg-rose-600 text-white font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                            WATCHLIST
                          </span>
                        ) : (
                          <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-bold px-2 py-0.5 rounded uppercase">
                            CLEAR
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-bold text-command-cyan">{p.camera_code}</td>
                      <td className="py-3 px-4 text-slate-700 dark:text-slate-300 max-w-xs truncate">
                        {p.camera_name}
                      </td>
                      <td className="py-3 px-4 text-slate-500 dark:text-slate-400">
                        {p.vehicle_color} {p.vehicle_type}
                      </td>
                      <td className="py-3 px-4 font-medium">{p.speed_kmh} km/h</td>
                      <td className="py-3 px-4 text-right">
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                          {Math.round(p.confidence * 100)}%
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
