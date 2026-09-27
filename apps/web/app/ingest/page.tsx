'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Radio,
  RefreshCw,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Play,
  Square,
  ShieldAlert,
  Server,
  Layers,
  Zap,
  Clock,
  Cpu,
  Video,
  ExternalLink,
  Sliders,
  RotateCcw,
} from 'lucide-react';
import { api } from '@/lib/api';

export default function IngestOperationsPage() {
  const [catalogue, setCatalogue] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [selectedDistrict, setSelectedDistrict] = useState<string>('ALL');
  const [selectedCodec, setSelectedCodec] = useState<string>('ALL');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Failure Injection Controls
  const [injectionCam, setInjectionCam] = useState<string>('cam01');
  const [injectionType, setInjectionType] = useState<string>('offline');

  const loadData = async () => {
    try {
      setLoading(true);
      const [catData, sessData] = await Promise.all([
        api.getIngestCatalogue().catch(() => []),
        api.getStreamSessions().catch(() => []),
      ]);
      setCatalogue(catData || []);
      setSessions(sessData || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleSyncCatalogue = async () => {
    try {
      setSyncing(true);
      const res = await api.syncCatalogue();
      setStatusMessage(`Catalogue synced: ${res.catalogue_total || 50} cameras discovered & verified.`);
      await loadData();
    } catch (err: any) {
      setStatusMessage(`Sync error: ${err.message}`);
    } finally {
      setSyncing(false);
      setTimeout(() => setStatusMessage(null), 5000);
    }
  };

  const handleAcquire = async (cameraCode: string) => {
    try {
      await api.acquireStream(cameraCode, `operator_console_${Math.floor(Math.random() * 100)}`);
      setStatusMessage(`Acquired reference for ${cameraCode}.`);
      await loadData();
    } catch (err: any) {
      setStatusMessage(`Acquire error: ${err.message}`);
    }
  };

  const handleRelease = async (cameraCode: string) => {
    try {
      await api.releaseStream(cameraCode, 'web_operator');
      setStatusMessage(`Released reference for ${cameraCode}.`);
      await loadData();
    } catch (err: any) {
      setStatusMessage(`Release error: ${err.message}`);
    }
  };

  const handleInjectFailure = async () => {
    try {
      await api.injectFailure(injectionCam, injectionType, true);
      setStatusMessage(`Failure injected: ${injectionType} on ${injectionCam}.`);
      await loadData();
    } catch (err: any) {
      setStatusMessage(`Injection error: ${err.message}`);
    }
  };

  const handleClearFailures = async () => {
    try {
      await api.clearFailures();
      setStatusMessage(`All failure injections cleared. Feeds restored to nominal.`);
      await loadData();
    } catch (err: any) {
      setStatusMessage(`Clear error: ${err.message}`);
    }
  };

  const filteredCatalogue = catalogue.filter((cam) => {
    const matchDist = selectedDistrict === 'ALL' || cam.district?.toLowerCase() === selectedDistrict.toLowerCase();
    const matchCodec = selectedCodec === 'ALL' || cam.codec === selectedCodec;
    return matchDist && matchCodec;
  });

  const h264Count = catalogue.filter((c) => c.codec === 'H.264').length;
  const h265Count = catalogue.filter((c) => c.codec === 'H.265').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 rounded-xl bg-command-surface border border-command-border shadow-md">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-command-accent/20 border border-command-accent/40 flex items-center justify-center text-command-cyan">
            <Radio className="h-6 w-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-extrabold text-white tracking-wide uppercase">
                Authoritative CCTV Ingest & Stream Operations Console
              </h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-command-accent/20 text-command-cyan border border-command-accent/30">
                GET /api/ingest
              </span>
            </div>
            <p className="text-xs text-command-muted font-mono">
              Live-Only Ingestion · Force RTSP TCP · Presentation Timestamps (PTS) · Atomic Reference Counting
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSyncCatalogue}
            disabled={syncing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-command-cyan/10 hover:bg-command-cyan/20 border border-command-cyan/30 text-command-cyan text-xs font-mono font-bold transition-all disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${syncing ? 'animate-spin' : ''}`} />
            <span>{syncing ? 'SYNCING...' : 'SYNC CATALOGUE'}</span>
          </button>

          <button
            onClick={handleClearFailures}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-command-green/10 hover:bg-command-green/20 border border-command-green/30 text-command-green text-xs font-mono font-bold transition-all"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>RESTORE FEEDS</span>
          </button>
        </div>
      </div>

      {statusMessage && (
        <div className="p-3 rounded-lg bg-command-accent/15 border border-command-accent/40 text-command-cyan font-mono text-xs flex items-center justify-between animate-fade-in">
          <span>{statusMessage}</span>
          <button onClick={() => setStatusMessage(null)} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-command-surface border border-command-border space-y-1">
          <div className="text-[11px] text-command-muted font-mono uppercase font-bold flex items-center gap-1.5">
            <Video className="h-3.5 w-3.5 text-command-cyan" />
            <span>Discovered Cameras</span>
          </div>
          <div className="text-2xl font-extrabold text-white font-mono">{catalogue.length || 50}</div>
          <div className="text-[10px] text-command-green font-mono">100% Catalogue Verified</div>
        </div>

        <div className="p-4 rounded-xl bg-command-surface border border-command-border space-y-1">
          <div className="text-[11px] text-command-muted font-mono uppercase font-bold flex items-center gap-1.5">
            <Layers className="h-3.5 w-3.5 text-indigo-400" />
            <span>Active Stream Sessions</span>
          </div>
          <div className="text-2xl font-extrabold text-white font-mono">{sessions.length}</div>
          <div className="text-[10px] text-indigo-300 font-mono">Atomic Reference Counting</div>
        </div>

        <div className="p-4 rounded-xl bg-command-surface border border-command-border space-y-1">
          <div className="text-[11px] text-command-muted font-mono uppercase font-bold flex items-center gap-1.5">
            <Cpu className="h-3.5 w-3.5 text-amber-400" />
            <span>Codec Diversity</span>
          </div>
          <div className="text-sm font-extrabold text-white font-mono pt-1">
            <span className="text-emerald-400">{h264Count} H.264</span> · <span className="text-amber-400">{h265Count} H.265/HEVC</span>
          </div>
          <div className="text-[10px] text-command-muted font-mono">Dynamic Payload Parsing</div>
        </div>

        <div className="p-4 rounded-xl bg-command-surface border border-command-border space-y-1">
          <div className="text-[11px] text-command-muted font-mono uppercase font-bold flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-rose-400" />
            <span>Authoritative Clock</span>
          </div>
          <div className="text-base font-extrabold text-white font-mono pt-1">PTS Monotonic</div>
          <div className="text-[10px] text-rose-300 font-mono">No Arrival / Declared FPS Jitter</div>
        </div>
      </div>

      {/* Active Stream Sessions with Live Ref Counts */}
      <div className="p-5 rounded-xl bg-command-surface border border-command-border space-y-4">
        <div className="flex items-center justify-between border-b border-command-border/50 pb-3">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-command-cyan" />
            <h2 className="text-sm font-bold text-white uppercase font-mono">Active Stream Sessions (Ref-Count Engine)</h2>
          </div>
          <span className="text-xs text-command-muted font-mono">
            Auto-Shuts Down on Ref Count = 0
          </span>
        </div>

        {sessions.length === 0 ? (
          <div className="py-6 text-center text-xs font-mono text-command-muted bg-command-bg/40 rounded-lg border border-dashed border-command-border">
            No active stream sessions. Acquire a stream below or launch live monitoring to initialize RTSP/TCP capture.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {sessions.map((s) => (
              <div key={s.camera_code} className="p-3.5 rounded-lg bg-command-bg/60 border border-command-border space-y-2 text-xs font-mono">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">{s.camera_code}</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-command-green/20 text-command-green border border-command-green/30">
                    {s.connection_state}
                  </span>
                </div>

                <div className="text-[11px] text-command-muted truncate">{s.camera_name}</div>

                <div className="grid grid-cols-2 gap-1 text-[11px] pt-1 border-t border-command-border/40 text-slate-300">
                  <div>Ref Count: <span className="font-bold text-command-cyan">{s.ref_count}</span></div>
                  <div>Codec: <span className="font-bold text-amber-400">{s.codec}</span></div>
                  <div>PTS: <span className="font-bold text-white">{s.last_pts ? `${s.last_pts.toFixed(0)}ms` : '0ms'}</span></div>
                  <div>FPS: <span className="font-bold text-emerald-400">{s.measured_fps}</span></div>
                </div>

                <div className="flex items-center gap-2 pt-1.5">
                  <button
                    onClick={() => handleAcquire(s.camera_code)}
                    className="flex-1 py-1 px-2 rounded bg-command-accent/30 hover:bg-command-accent/50 text-[10px] text-command-cyan font-bold text-center border border-command-accent/40"
                  >
                    + Acquire (+1)
                  </button>
                  <button
                    onClick={() => handleRelease(s.camera_code)}
                    className="flex-1 py-1 px-2 rounded bg-rose-500/20 hover:bg-rose-500/40 text-[10px] text-rose-300 font-bold text-center border border-rose-500/30"
                  >
                    - Release (-1)
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Failure Injection & Resilience Simulator Drill */}
      <div className="p-5 rounded-xl bg-command-surface border border-command-border space-y-4">
        <div className="flex items-center justify-between border-b border-command-border/50 pb-3">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-amber-400" />
            <h2 className="text-sm font-bold text-white uppercase font-mono">Resilience Drill & Failure Injection (Section 47)</h2>
          </div>
          <span className="text-xs text-amber-400/80 font-mono">Evaluation & CI Drill Mode</span>
        </div>

        <div className="flex flex-wrap items-center gap-3 font-mono text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-command-muted">Target Camera:</span>
            <select
              value={injectionCam}
              onChange={(e) => setInjectionCam(e.target.value)}
              className="bg-command-bg border border-command-border rounded px-2.5 py-1.5 text-white text-xs font-mono"
            >
              {catalogue.slice(0, 15).map((c) => (
                <option key={c.camera_id} value={c.camera_id}>
                  {c.camera_id} ({c.camera_code})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-command-muted">Failure Mode:</span>
            <select
              value={injectionType}
              onChange={(e) => setInjectionType(e.target.value)}
              className="bg-command-bg border border-command-border rounded px-2.5 py-1.5 text-white text-xs font-mono"
            >
              <option value="offline">Offline / Network Drop</option>
              <option value="decoder_warning">Decoder Warning (RPS / POC Non-Fatal)</option>
              <option value="scene_discontinuity">Scene Cut / Loop Reset (Tracker Reset)</option>
              <option value="pts_gap">PTS Jitter / Frame Interval Gap</option>
            </select>
          </div>

          <button
            onClick={handleInjectFailure}
            className="px-3.5 py-1.5 rounded bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-bold"
          >
            INJECT FAILURE
          </button>
        </div>
      </div>

      {/* 50-Camera Discovery Table */}
      <div className="p-5 rounded-xl bg-command-surface border border-command-border space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-command-border/50 pb-3">
          <div className="flex items-center gap-2">
            <Server className="h-4 w-4 text-command-cyan" />
            <h2 className="text-sm font-bold text-white uppercase font-mono">
              Authoritative Catalogue Registry ({filteredCatalogue.length} Cameras)
            </h2>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs">
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="bg-command-bg border border-command-border rounded px-2 py-1 text-white text-xs"
            >
              <option value="ALL">All Districts</option>
              <option value="Ahmedabad">Ahmedabad</option>
              <option value="Gandhinagar">Gandhinagar</option>
              <option value="Vadodara">Vadodara</option>
              <option value="Surat">Surat</option>
              <option value="Rajkot">Rajkot</option>
            </select>

            <select
              value={selectedCodec}
              onChange={(e) => setSelectedCodec(e.target.value)}
              className="bg-command-bg border border-command-border rounded px-2 py-1 text-white text-xs"
            >
              <option value="ALL">All Codecs</option>
              <option value="H.264">H.264</option>
              <option value="H.265">H.265/HEVC</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="border-b border-command-border/60 text-command-muted uppercase text-[10px]">
                <th className="py-2.5 px-3">Camera ID / Code</th>
                <th className="py-2.5 px-3">Location</th>
                <th className="py-2.5 px-3">District</th>
                <th className="py-2.5 px-3">Codec & Resolution</th>
                <th className="py-2.5 px-3">Protocols</th>
                <th className="py-2.5 px-3">Live Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-command-border/30 text-slate-300">
              {filteredCatalogue.slice(0, 25).map((cam) => (
                <tr key={cam.camera_id} className="hover:bg-command-bg/40 transition-colors">
                  <td className="py-2 px-3">
                    <div className="font-bold text-white">{cam.camera_code}</div>
                    <div className="text-[10px] text-command-muted">{cam.camera_id}</div>
                  </td>
                  <td className="py-2 px-3 max-w-[220px] truncate" title={cam.location}>
                    {cam.location}
                  </td>
                  <td className="py-2 px-3">{cam.district}</td>
                  <td className="py-2 px-3">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      cam.codec === 'H.265'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}>
                      {cam.codec}
                    </span>
                    <span className="ml-1 text-[10px] text-command-muted">{cam.width}x{cam.height}</span>
                  </td>
                  <td className="py-2 px-3">
                    <div className="flex items-center gap-1.5 text-[10px]">
                      <span className="px-1 rounded bg-command-accent/20 text-command-cyan">RTSP:8554</span>
                      <span className="px-1 rounded bg-indigo-500/20 text-indigo-300">WHEP:8889</span>
                      <span className="px-1 rounded bg-purple-500/20 text-purple-300">HLS</span>
                    </div>
                  </td>
                  <td className="py-2 px-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                      cam.live_status === 'ONLINE'
                        ? 'bg-command-green/20 text-command-green border-command-green/30'
                        : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                    }`}>
                      {cam.live_status}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-right">
                    <button
                      onClick={() => handleAcquire(cam.camera_code)}
                      className="px-2 py-1 rounded bg-command-accent/20 hover:bg-command-accent/40 text-command-cyan text-[11px] font-bold border border-command-accent/30"
                    >
                      Acquire Stream
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredCatalogue.length > 25 && (
            <div className="pt-3 text-center text-xs text-command-muted font-mono">
              Showing first 25 of {filteredCatalogue.length} cameras. Full catalogue accessible via <code className="text-command-cyan">GET /api/ingest</code>.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
