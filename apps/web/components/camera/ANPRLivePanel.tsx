'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Scan, AlertTriangle, Clock, TrendingUp, X, ExternalLink, ChevronRight } from 'lucide-react';
import type { ANPRDetection } from '@/components/camera/CameraFeedPlayer';

interface ANPRLivePanelProps {
  detections: ANPRDetection[];
  onClear?: () => void;
}

export default function ANPRLivePanel({ detections, onClear }: ANPRLivePanelProps) {
  const [highlighted, setHighlighted] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Flash-highlight latest entry and auto-scroll to top
  useEffect(() => {
    if (detections.length === 0) return;
    const latest = detections[0].plate + detections[0].timestamp.getTime();
    setHighlighted(latest);
    listRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    const t = setTimeout(() => setHighlighted(null), 1000);
    return () => clearTimeout(t);
  }, [detections.length]);

  const watchlistCount = detections.filter((d) => d.watchlist).length;
  const uniquePlates = new Set(detections.map((d) => d.plate)).size;

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden font-mono shadow-sm">
      
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-3 py-2 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-2">
          <span className="h-6 w-6 rounded-md bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center">
            <Scan className="h-3 w-3 text-cyan-600 dark:text-cyan-400" />
          </span>
          <div>
            <p className="text-[11px] font-bold text-slate-800 dark:text-white tracking-wider uppercase">ANPR Feed</p>
            <p className="text-[9px] text-slate-400 leading-none">Live plate detections</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
          </span>
          <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-bold">LIVE</span>
          {onClear && detections.length > 0 && (
            <button
              onClick={onClear}
              className="ml-1 p-0.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 transition-colors"
              title="Clear log"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>

      {/* ── Stats row ── */}
      <div className="grid grid-cols-3 divide-x divide-slate-200 dark:divide-slate-700 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
        <div className="py-1.5 text-center">
          <p className="text-sm font-black text-slate-800 dark:text-white leading-none">{detections.length}</p>
          <p className="text-[9px] text-slate-400 uppercase tracking-wider mt-0.5">Total</p>
        </div>
        <div className="py-1.5 text-center">
          <p className="text-sm font-black text-cyan-600 dark:text-cyan-400 leading-none">{uniquePlates}</p>
          <p className="text-[9px] text-slate-400 uppercase tracking-wider mt-0.5">Unique</p>
        </div>
        <div className="py-1.5 text-center">
          <p className={`text-sm font-black leading-none ${watchlistCount > 0 ? 'text-rose-500' : 'text-emerald-600 dark:text-emerald-400'}`}>
            {watchlistCount}
          </p>
          <p className="text-[9px] text-slate-400 uppercase tracking-wider mt-0.5">Alerts</p>
        </div>
      </div>

      {/* ── Scrollable detection list (fixed height) ── */}
      <div
        ref={listRef}
        className="flex-1 overflow-y-auto min-h-0"
        style={{ maxHeight: 380 }}
      >
        {detections.length === 0 ? (
          <div className="py-8 text-center">
            <Scan className="h-6 w-6 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <p className="text-slate-400 text-[10px]">Awaiting detections…</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {detections.map((d, i) => {
              const key = d.plate + d.timestamp.getTime();
              const isNew = highlighted === key;
              const timeStr = d.timestamp.toLocaleTimeString('en-IN', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              });

              return (
                <div
                  key={key}
                  className={`flex items-center gap-2 px-3 py-1.5 transition-colors duration-300 ${
                    isNew
                      ? 'bg-cyan-50 dark:bg-cyan-950/30'
                      : d.watchlist
                      ? 'bg-rose-50 dark:bg-rose-950/20'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                  }`}
                >
                  {/* Left accent bar */}
                  <div className={`w-0.5 self-stretch rounded-full flex-shrink-0 ${
                    d.watchlist ? 'bg-rose-500' : isNew ? 'bg-cyan-400' : 'bg-slate-200 dark:bg-slate-700'
                  }`} />

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {/* Row 1: plate + badge + confidence */}
                    <div className="flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1 min-w-0">
                        <span className={`text-[11px] font-black tracking-widest truncate ${
                          d.watchlist ? 'text-rose-600 dark:text-rose-400' : 'text-slate-800 dark:text-white'
                        }`}>
                          {d.plate}
                        </span>
                        {d.watchlist && (
                          <span className="flex-shrink-0 text-[8px] bg-rose-500 text-white px-1 py-px rounded font-black">
                            ⚠
                          </span>
                        )}
                      </div>
                      <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 flex-shrink-0">
                        {d.conf.toFixed(1)}%
                      </span>
                    </div>

                    {/* Row 2: type · color · camera · time */}
                    <div className="flex items-center justify-between mt-0.5">
                      <span className="text-[9px] text-slate-400 truncate">
                        {d.type} · {d.color} ·{' '}
                        <span className="text-cyan-600 dark:text-cyan-500 font-semibold">{d.cameraCode}</span>
                      </span>
                      <div className="flex items-center gap-1 flex-shrink-0 ml-1">
                        <span className="text-[9px] text-slate-400">{timeStr}</span>
                        <Link
                          href={`/vehicles/${d.plate}`}
                          className="text-slate-400 hover:text-cyan-600 transition-colors"
                          title={`Trace ${d.plate}`}
                        >
                          <ChevronRight className="h-3 w-3" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Footer ── */}
      <div className="px-3 py-1.5 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex items-center justify-between">
        <span className="flex items-center gap-1 text-[9px] text-slate-400">
          <TrendingUp className="h-2.5 w-2.5" />
          Updates as cameras scan
        </span>
        <Link href="/events" className="text-[9px] text-cyan-600 dark:text-cyan-400 hover:underline font-semibold">
          Full log →
        </Link>
      </div>
    </div>
  );
}
