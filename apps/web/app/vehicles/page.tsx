'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Car, Search, ArrowRight, ShieldAlert, Sparkles, Clock, MapPin } from 'lucide-react';

const FEATURED_VEHICLES = [
  {
    plate: 'GJ01AB1234',
    status: 'WATCHLIST MATCH',
    priority: 'HIGH',
    type: 'SUV (White Tata Safari)',
    cams: '7 Cameras',
    route: 'Ahmedabad SG Hwy → Gandhinagar Sachivalaya',
    time: '08:42:17 – 09:36:12',
    reason: 'Wanted: Getaway SUV in C.G. Road Jewellery Heist (FIR #402/2026)',
    highlight: true,
  },
  {
    plate: 'GJ05XY9182',
    status: 'WATCHLIST MATCH',
    priority: 'MEDIUM',
    type: 'SUV (Black Bolero Pickup)',
    cams: '3 Cameras',
    route: 'Surat Ring Road → Varachha',
    time: '09:00:15 – 09:16:30',
    reason: 'Stolen Commercial Fleet Vehicle - Surat Case #118',
    highlight: false,
  },
  {
    plate: 'GJ18AA7721',
    status: 'WATCHLIST MATCH',
    priority: 'LOW',
    type: 'Hatchback (Red Hyundai Creta)',
    cams: '3 Cameras',
    route: 'Gandhinagar Infocity → Sector 11',
    time: '09:15:20 – 09:31:00',
    reason: 'Repeated Over-speeding Violations (>110 km/h)',
    highlight: false,
  },
  {
    plate: 'GJ01CD4521',
    status: 'NORMAL',
    priority: 'NORMAL',
    type: 'Sedan (Silver Honda City)',
    cams: '3 Cameras',
    route: 'Ahmedabad Karnavati → Rajpath Club',
    time: '08:55:00 – 09:11:00',
    reason: 'Regular commuter transit',
    highlight: false,
  },
];

export default function VehiclesDirectoryPage() {
  const router = useRouter();
  const [queryPlate, setQueryPlate] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (queryPlate.trim()) {
      router.push(`/vehicles/${queryPlate.trim().toUpperCase()}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-4 rounded-xl bg-command-surface border border-command-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-command-accent/20 border border-command-accent/40 flex items-center justify-center text-command-cyan">
            <Car className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-base font-extrabold text-white tracking-wide uppercase">
              Vehicle Intelligence & ANPR Directory
            </h1>
            <p className="text-xs text-command-muted font-mono">
              Cross-Camera Target Correlation & Historical Registration Search
            </p>
          </div>
        </div>
      </div>

      {/* Main Search Panel */}
      <div className="bg-command-surface border border-command-border rounded-xl p-6 shadow-sm max-w-2xl mx-auto space-y-4">
        <div className="text-center space-y-1">
          <h2 className="text-base font-bold text-slate-900 dark:text-white font-mono uppercase">
            Search Vehicle by Registration Plate
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Enter full or partial Indian registration number (e.g., GJ01AB1234)
          </p>
        </div>

        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={queryPlate}
              onChange={(e) => setQueryPlate(e.target.value)}
              placeholder="e.g. GJ01AB1234..."
              className="w-full bg-command-card border border-command-border text-slate-900 dark:text-white text-base rounded-lg pl-10 pr-4 py-3 font-mono uppercase focus:border-command-accent focus:outline-none tracking-widest font-black shadow-sm"
            />
            <Search className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
          </div>
          <button
            type="submit"
            className="bg-command-accent hover:bg-blue-600 text-white font-mono font-bold px-6 py-3 rounded-lg text-xs uppercase transition-colors shadow"
          >
            Investigate
          </button>
        </form>

        <div className="text-center pt-1">
          <Link
            href="/rc-challan"
            className="text-xs font-mono font-bold text-command-cyan hover:underline inline-flex items-center gap-1.5"
          >
            <span>Or look up official VAHAN 4.0 RC & e-Challan status directly →</span>
          </Link>
        </div>
      </div>

      {/* Featured / Active Investigation Targets */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-mono text-command-muted uppercase font-semibold">
          <Sparkles className="h-4 w-4 text-command-cyan" />
          <span>Active Investigation Vehicles (Gujarat State Surveillance)</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {FEATURED_VEHICLES.map((v) => (
            <div
              key={v.plate}
              className={`p-4 rounded-xl border transition-all ${
                v.highlight
                  ? 'bg-gradient-to-r from-red-950/40 to-command-surface border-command-red/50 shadow-md'
                  : 'bg-command-surface border-command-border'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-lg font-black text-white tracking-wider">
                    {v.plate}
                  </span>
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase ${
                      v.priority === 'HIGH'
                        ? 'bg-red-600 text-white'
                        : v.priority === 'MEDIUM'
                        ? 'bg-amber-600 text-white'
                        : 'bg-command-card text-slate-300'
                    }`}
                  >
                    {v.status}
                  </span>
                </div>

                <Link
                  href={`/vehicles/${v.plate}`}
                  className="bg-command-accent hover:bg-blue-600 text-white text-xs font-mono font-bold px-3 py-1.5 rounded transition-colors flex items-center gap-1"
                >
                  <span>Reconstruct Journey</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              <div className="mt-2 text-xs text-slate-300 font-medium">{v.type}</div>
              <p className="text-[11px] text-command-muted mt-1">{v.reason}</p>

              <div className="mt-3 pt-2.5 border-t border-command-border/50 flex items-center justify-between text-[11px] font-mono text-command-cyan">
                <span>{v.cams} · {v.route}</span>
                <span className="text-slate-400">{v.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
