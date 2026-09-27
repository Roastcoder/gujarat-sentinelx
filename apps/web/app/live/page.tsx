'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Video,
  Grid,
  Maximize2,
  Camera,
  Search,
  Activity,
  Layers,
  Shield,
  Volume2,
  VolumeX,
  RefreshCw,
  Sliders,
  CheckCircle2,
  Terminal,
  Copy,
  ExternalLink,
  Code2,
  Check,
  X,
  Info,
  Radio,
  Scan,
  PanelRightClose,
  PanelRightOpen,
} from 'lucide-react';
import { api } from '@/lib/api';
import CameraFeedPlayer, { type ANPRDetection } from '@/components/camera/CameraFeedPlayer';
import ANPRLivePanel from '@/components/camera/ANPRLivePanel';

const DEFAULT_SENTINEL_CAMERAS = [
  { id: 'cam01', code: 'CAM-AHM-001', name: '01 Chiman bhai Bridge', district: 'Ahmedabad', fps: 30, latency: 28, status: 'ONLINE', res: '1080p' },
  { id: 'cam02', code: 'CAM-AHM-002', name: '02 Janpath', district: 'Ahmedabad', fps: 25, latency: 32, status: 'ONLINE', res: '1080p' },
  { id: 'cam03', code: 'CAM-AHM-003', name: '03 O.N.G.C. Office', district: 'Ahmedabad', fps: 25, latency: 35, status: 'ONLINE', res: '1080p' },
  { id: 'cam04', code: 'CAM-AHM-004', name: '04 Paldi Circle', district: 'Ahmedabad', fps: 30, latency: 26, status: 'ONLINE', res: '1080p' },
  { id: 'cam05', code: 'CAM-AHM-005', name: '05 Visat teen Rasta', district: 'Ahmedabad', fps: 25, latency: 40, status: 'ONLINE', res: '1080p' },
  { id: 'cam06', code: 'CAM-JND-006', name: '06 Timbavadi gate-Junagadh', district: 'Junagadh', fps: 25, latency: 45, status: 'ONLINE', res: '1080p' },
  { id: 'cam07', code: 'CAM-GIR-007', name: '07 hero-showroom-gir-somnath', district: 'Gir Somnath', fps: 20, latency: 52, status: 'ONLINE', res: '720p' },
  { id: 'cam08', code: 'CAM-JND-008', name: '08 majewadi-gate-junagadh', district: 'Junagadh', fps: 25, latency: 44, status: 'ONLINE', res: '1080p' },
  { id: 'cam09', code: 'CAM-JND-009', name: '09 new-bypass-near-by-circle-junagadh-2', district: 'Junagadh', fps: 25, latency: 46, status: 'ONLINE', res: '1080p' },
  { id: 'cam10', code: 'CAM-JND-010', name: '10 char-chowk-road-2-junagadh', district: 'Junagadh', fps: 25, latency: 42, status: 'ONLINE', res: '1080p' },
  { id: 'cam11', code: 'CAM-JND-011', name: '11 dolatpara-junagadh', district: 'Junagadh', fps: 25, latency: 47, status: 'ONLINE', res: '1080p' },
  { id: 'cam12', code: 'CAM-GND-012', name: '12 Tri Mandir Adalaj Tollnaka', district: 'Gandhinagar', fps: 30, latency: 22, status: 'ONLINE', res: '1080p' },
  { id: 'cam13', code: 'CAM-AHM-013', name: '13 CN Vidhyalaya', district: 'Ahmedabad', fps: 25, latency: 30, status: 'ONLINE', res: '1080p' },
  { id: 'cam14', code: 'CAM-AHM-014', name: '14 Delight RLVD', district: 'Ahmedabad', fps: 25, latency: 34, status: 'ONLINE', res: '1080p' },
  { id: 'cam15', code: 'CAM-AHM-015', name: '15 Suvidha park', district: 'Ahmedabad', fps: 25, latency: 38, status: 'ONLINE', res: '1080p' },
  { id: 'cam16', code: 'CAM-AHM-016', name: '16 Visat P2', district: 'Ahmedabad', fps: 25, latency: 39, status: 'ONLINE', res: '1080p' },
  { id: 'cam17', code: 'CAM-RJK-017', name: '17 Rajkot Bus Port CCTV', district: 'Rajkot', fps: 25, latency: 42, status: 'ONLINE', res: '1080p' },
  { id: 'cam18', code: 'CAM-RJK-018', name: '18 Rajkot CCTV', district: 'Rajkot', fps: 25, latency: 41, status: 'ONLINE', res: '1080p' },
  { id: 'cam19', code: 'CAM-NAV-019', name: '19 KHAPARIA GRAM PANCHAYAT GANDEVI', district: 'Navsari', fps: 25, latency: 48, status: 'ONLINE', res: '1080p' },
  { id: 'cam20', code: 'CAM-GND-020', name: '20 Mohanpura', district: 'Gandhinagar', fps: 25, latency: 25, status: 'ONLINE', res: '1080p' },
  { id: 'cam21', code: 'CAM-PAT-021', name: '23 Patan Dethali Char Rasta', district: 'Patan', fps: 25, latency: 48, status: 'ONLINE', res: '1080p' },
  { id: 'cam22', code: 'CAM-BK-022', name: '28 BK Mervada tran Rasta', district: 'Banaskantha', fps: 25, latency: 50, status: 'ONLINE', res: '1080p' },
  { id: 'cam23', code: 'CAM-MEH-023', name: '30 kheram', district: 'Mehsana', fps: 25, latency: 44, status: 'ONLINE', res: '1080p' },
  { id: 'cam24', code: 'CAM-GND-024', name: '33 dehgam', district: 'Gandhinagar', fps: 25, latency: 36, status: 'ONLINE', res: '1080p' },
  { id: 'cam25', code: 'CAM-NAV-025', name: '34 dhanori', district: 'Navsari', fps: 25, latency: 46, status: 'ONLINE', res: '1080p' },
  { id: 'cam26', code: 'CAM-NAV-026', name: '35 TANKAL', district: 'Navsari', fps: 25, latency: 47, status: 'ONLINE', res: '1080p' },
  { id: 'cam27', code: 'CAM-NAV-027', name: '36 bilimora', district: 'Navsari', fps: 25, latency: 49, status: 'ONLINE', res: '1080p' },
  { id: 'cam28', code: 'CAM-NAV-028', name: '37 bilimora', district: 'Navsari', fps: 25, latency: 51, status: 'ONLINE', res: '1080p' },
  { id: 'cam29', code: 'CAM-NAV-029', name: '38 bilimora', district: 'Navsari', fps: 25, latency: 50, status: 'ONLINE', res: '1080p' },
  { id: 'cam30', code: 'CAM-KTC-030', name: 'Gandhidham Rambaugh p2', district: 'Kutch', fps: 25, latency: 55, status: 'ONLINE', res: '1080p' },
];

export default function LiveMonitoringPage() {
  const [layout, setLayout] = useState<1 | 4 | 9 | 16>(4);
  const [allCameras, setAllCameras] = useState<any[]>(DEFAULT_SENTINEL_CAMERAS);
  const [activeCameras, setActiveCameras] = useState<any[]>(DEFAULT_SENTINEL_CAMERAS.slice(0, 4));
  const [snapshotMsg, setSnapshotMsg] = useState<string | null>(null);

  // ANPR Detection log (global across all cameras)
  const [anprDetections, setAnprDetections] = useState<ANPRDetection[]>([]);
  const [showAnprPanel, setShowAnprPanel] = useState(true);

  const handleANPRDetection = useCallback((det: ANPRDetection) => {
    setAnprDetections((prev) => [det, ...prev].slice(0, 80));
  }, []);

  // Integrator Guide Modal State
  const [guideModalOpen, setGuideModalOpen] = useState(false);
  const [selectedGuideCam, setSelectedGuideCam] = useState<any>(DEFAULT_SENTINEL_CAMERAS[3]); // cam04 by default
  const [activeCodeTab, setActiveCodeTab] = useState<'python' | 'gstreamer' | 'ffmpeg' | 'urls'>('python');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Load dynamic catalogue from backend if available
  useEffect(() => {
    async function loadDynamicCatalogue() {
      try {
        const cat = await api.getSentinelCatalogue();
        if (Array.isArray(cat) && cat.length > 0) {
          setAllCameras(cat);
          setActiveCameras(cat.slice(0, layout));
          setSelectedGuideCam(cat[3] || cat[0]);
        }
      } catch (e) {
        // Fallback to DEFAULT_SENTINEL_CAMERAS
      }
    }
    loadDynamicCatalogue();
  }, []);

  useEffect(() => {
    setActiveCameras(allCameras.slice(0, layout));
  }, [layout, allCameras]);

  const handleCaptureSnapshot = (camName: string) => {
    setSnapshotMsg(`Captured high-resolution evidence snapshot from ${camName}`);
    setTimeout(() => setSnapshotMsg(null), 3000);
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const getGridColsClass = () => {
    switch (layout) {
      case 1:
        return 'grid-cols-1';
      case 4:
        return 'grid-cols-1 md:grid-cols-2';
      case 9:
        return 'grid-cols-1 md:grid-cols-3';
      case 16:
        return 'grid-cols-2 md:grid-cols-4';
      default:
        return 'grid-cols-2';
    }
  };

  // Helper strings for current selected camera
  const camId = selectedGuideCam?.id || 'cam04';
  const hlsUrl = `https://cctv.corp8.cloud/${camId}/index.m3u8`;
  const rtspUrl = `rtsp://cybersachinyadav%40gmail.com:A2ZV-8SLH-T9NF@103.250.160.189:8554/stream/${camId}`;
  const whepUrl = `http://cybersachinyadav%40gmail.com:A2ZV-8SLH-T9NF@103.250.160.189:8889/stream/${camId}/whep`;

  const pythonOpenCVSnippet = `import os, cv2

# Force TCP transport (required for reliable streaming without UDP packet drops):
os.environ["OPENCV_FFMPEG_CAPTURE_OPTIONS"] = "rtsp_transport;tcp"

# Stream URL with percent-encoded email (cybersachinyadav%40gmail.com):
url = "${rtspUrl}"
cap = cv2.VideoCapture(url, cv2.CAP_FFMPEG)

while True:
    ok, frame = cap.read()
    if not ok:
        print("Reconnecting to stream ${camId}...")
        break
    
    # Precise presentation timestamp (PTS in ms):
    pts_ms = cap.get(cv2.CAP_PROP_POS_MSEC)
    # Run YOLOv8 / Vehicle ANPR inference on frame here...`;

  const gstreamerSnippet = `gst-launch-1.0 rtspsrc location=${rtspUrl} protocols=tcp latency=200 \\
  ! rtph264depay ! h264parse ! avdec_h264 ! videoconvert ! fakesink`;

  const ffmpegRTSPSnippet = `ffplay -rtsp_transport tcp ${rtspUrl}`;
  const ffmpegHLSSnippet = `ffplay ${hlsUrl}`;

  return (
    <div className="space-y-4">
      {/* Top Controls Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl bg-command-surface border border-command-border">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-command-accent/20 border border-command-accent/40 flex items-center justify-center text-command-cyan">
            <Video className="h-5 w-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-base font-extrabold text-slate-900 dark:text-white tracking-wide uppercase">
                Live CCTV Video Wall & Stream Gateway
              </h1>
              <span className="text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30">
                GATEWAY 103.250.160.189 ONLINE
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
              Sentinel Camera Grid (cctv.corp8.cloud) · 30 Active Nodes · HLS / RTSP TCP:8554 / WHEP:8889
            </p>
          </div>
        </div>

        {/* Action Controls & Layout Switcher */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* ANPR Panel toggle */}
          <button
            onClick={() => setShowAnprPanel(!showAnprPanel)}
            className={`flex items-center gap-1.5 text-xs font-mono font-bold px-3 py-1.5 rounded-lg border transition-colors shadow ${
              showAnprPanel
                ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/40 hover:bg-cyan-500/20'
                : 'bg-command-card text-slate-400 border-command-border hover:bg-command-hover'
            }`}
          >
            <Scan className="h-3.5 w-3.5" />
            <span className="hidden md:inline">ANPR Panel</span>
            {anprDetections.filter(d => d.watchlist).length > 0 && (
              <span className="bg-rose-600 text-white text-[9px] px-1.5 rounded-full font-black">
                {anprDetections.filter(d => d.watchlist).length}
              </span>
            )}
          </button>

          <button
            onClick={() => setGuideModalOpen(true)}
            className="flex items-center gap-1.5 text-xs font-mono font-bold px-3 py-1.5 rounded-lg bg-command-cyan/10 hover:bg-command-cyan/20 text-command-cyan border border-command-cyan/40 transition-colors shadow"
          >
            <Terminal className="h-3.5 w-3.5" />
            <span className="hidden lg:inline">AI Integrator's Guide</span>
          </button>

          <div className="flex items-center gap-1 border-l border-command-border pl-2.5">
            <span className="text-xs font-mono text-command-muted hidden sm:inline mr-1">GRID:</span>
            {([1, 4, 9, 16] as const).map((l) => (
              <button
                key={l}
                onClick={() => setLayout(l)}
                className={`text-xs font-mono font-bold px-2.5 py-1.5 rounded-lg border transition-all ${
                  layout === l
                    ? 'bg-command-accent border-command-accent text-white shadow'
                    : 'bg-command-card border-command-border text-slate-300 hover:bg-command-hover'
                }`}
              >
                {l === 1 ? '1×1' : l === 4 ? '2×2' : l === 9 ? '3×3' : '4×4'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {snapshotMsg && (
        <div className="p-2.5 rounded-lg bg-command-green/10 border border-command-green text-command-green text-xs font-mono flex items-center gap-2 animate-pulse">
          <CheckCircle2 className="h-4 w-4" />
          {snapshotMsg}
        </div>
      )}

      {/* Main layout: Camera Grid + ANPR Panel */}
      <div className={`flex gap-3.5 items-start ${showAnprPanel ? 'flex-col xl:flex-row' : ''}`}>
        {/* Camera Grid */}
        <div className={`${showAnprPanel ? 'flex-1 min-w-0' : 'w-full'}`}>
          <div className={`grid ${getGridColsClass()} gap-3.5`}>
            {activeCameras.map((cam, idx) => (
              <CameraFeedPlayer
                key={cam.id || cam.code || idx}
                camera={cam}
                index={idx}
                onOpenGuide={() => {
                  setSelectedGuideCam(cam);
                  setGuideModalOpen(true);
                }}
                onCaptureSnapshot={handleCaptureSnapshot}
                onANPRDetection={handleANPRDetection}
              />
            ))}
          </div>
        </div>

        {/* ANPR Detection Panel */}
        {showAnprPanel && (
          <div className="w-full xl:w-80 xl:flex-shrink-0 h-[500px] xl:h-auto xl:sticky xl:top-4">
            <ANPRLivePanel
              detections={anprDetections}
              onClear={() => setAnprDetections([])}
            />
          </div>
        )}
      </div>

      {/* Integrator Stream & AI Pipeline Guide Modal */}
      {guideModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0B1528] border border-command-cyan/50 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col font-mono text-xs">
            {/* Modal Header */}
            <div className="p-4 border-b border-command-border flex items-center justify-between bg-[#070D18]">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-command-cyan/10 border border-command-cyan/30 flex items-center justify-center text-command-cyan">
                  <Terminal className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                    Consuming Sentinel Camera Grid — Integrator's Guide
                  </h2>
                  <p className="text-[10px] text-command-muted">
                    Direct RTSP, HLS, and WebRTC streaming for AI inference and dashboards
                  </p>
                </div>
              </div>
              <button
                onClick={() => setGuideModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-command-surface text-slate-400 hover:text-white transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-slate-200">
              {/* Access Architecture Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3 rounded-lg bg-[#070D18] border border-command-border space-y-1">
                  <div className="text-[10px] text-command-cyan font-bold uppercase">HLS Protocol</div>
                  <div className="text-white font-bold">Public CDN (Session)</div>
                  <p className="text-[10px] text-command-muted leading-tight">
                    For dashboards, mobile web, and restricted networks. Served via <code className="text-command-cyan">cctv.corp8.cloud</code>.
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-[#070D18] border border-command-border space-y-1">
                  <div className="text-[10px] text-amber-400 font-bold uppercase">RTSP (TCP Port 8554)</div>
                  <div className="text-white font-bold">Public Static IP (Direct)</div>
                  <p className="text-[10px] text-command-muted leading-tight">
                    For AI inference (OpenCV, GStreamer, FFmpeg). Must force TCP transport (<code className="text-amber-400">rtsp_transport;tcp</code>).
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-[#070D18] border border-command-border space-y-1">
                  <div className="text-[10px] text-emerald-400 font-bold uppercase">WebRTC (WHEP Port 8889)</div>
                  <div className="text-white font-bold">Sub-Second Preview</div>
                  <p className="text-[10px] text-command-muted leading-tight">
                    Ultra low-latency HTTP WHEP stream for live command-center video monitoring.
                  </p>
                </div>
              </div>

              {/* Target Camera Selector */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg bg-[#070D18] border border-command-border">
                <div className="flex items-center gap-2">
                  <span className="text-command-muted">Target Camera:</span>
                  <select
                    value={selectedGuideCam?.id || 'cam04'}
                    onChange={(e) => {
                      const found = allCameras.find((c) => c.id === e.target.value);
                      if (found) setSelectedGuideCam(found);
                    }}
                    className="bg-command-surface border border-command-border rounded px-2.5 py-1 text-white font-bold text-xs focus:outline-none focus:border-command-cyan"
                  >
                    {allCameras.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.id} — {c.name} ({c.district || 'Gujarat'})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="text-[10px] text-slate-400">
                  Authentication: Email encoded as <code className="text-command-cyan">cybersachinyadav%40gmail.com</code>
                </div>
              </div>

              {/* Snippet Code Tabs */}
              <div className="border border-command-border rounded-xl overflow-hidden bg-[#050A14]">
                <div className="flex items-center border-b border-command-border bg-[#070D18] px-3 gap-2 overflow-x-auto">
                  <button
                    onClick={() => setActiveCodeTab('python')}
                    className={`px-3 py-2 border-b-2 font-bold text-xs transition-colors flex items-center gap-1.5 ${
                      activeCodeTab === 'python'
                        ? 'border-command-cyan text-command-cyan'
                        : 'border-transparent text-slate-400 hover:text-white'
                    }`}
                  >
                    <span>OpenCV (Python)</span>
                  </button>
                  <button
                    onClick={() => setActiveCodeTab('gstreamer')}
                    className={`px-3 py-2 border-b-2 font-bold text-xs transition-colors flex items-center gap-1.5 ${
                      activeCodeTab === 'gstreamer'
                        ? 'border-command-cyan text-command-cyan'
                        : 'border-transparent text-slate-400 hover:text-white'
                    }`}
                  >
                    <span>GStreamer (RTSP)</span>
                  </button>
                  <button
                    onClick={() => setActiveCodeTab('ffmpeg')}
                    className={`px-3 py-2 border-b-2 font-bold text-xs transition-colors flex items-center gap-1.5 ${
                      activeCodeTab === 'ffmpeg'
                        ? 'border-command-cyan text-command-cyan'
                        : 'border-transparent text-slate-400 hover:text-white'
                    }`}
                  >
                    <span>FFmpeg / ffplay</span>
                  </button>
                  <button
                    onClick={() => setActiveCodeTab('urls')}
                    className={`px-3 py-2 border-b-2 font-bold text-xs transition-colors flex items-center gap-1.5 ${
                      activeCodeTab === 'urls'
                        ? 'border-command-cyan text-command-cyan'
                        : 'border-transparent text-slate-400 hover:text-white'
                    }`}
                  >
                    <span>Raw Stream URLs</span>
                  </button>
                </div>

                <div className="p-4 relative">
                  {activeCodeTab === 'python' && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span>Python 3 with OpenCV (cv2) & PTS Monotonic Tracking:</span>
                        <button
                          onClick={() => copyToClipboard(pythonOpenCVSnippet, 'py')}
                          className="flex items-center gap-1 text-command-cyan hover:underline"
                        >
                          {copiedKey === 'py' ? <Check className="h-3.5 w-3.5 text-command-green" /> : <Copy className="h-3.5 w-3.5" />}
                          <span>{copiedKey === 'py' ? 'Copied!' : 'Copy Code'}</span>
                        </button>
                      </div>
                      <pre className="p-3 bg-[#03060C] border border-command-border/60 rounded-lg text-slate-200 overflow-x-auto text-[11px] leading-relaxed">
                        {pythonOpenCVSnippet}
                      </pre>
                    </div>
                  )}

                  {activeCodeTab === 'gstreamer' && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span>GStreamer CLI (RTSP over TCP with 200ms Jitter Buffer):</span>
                        <button
                          onClick={() => copyToClipboard(gstreamerSnippet, 'gst')}
                          className="flex items-center gap-1 text-command-cyan hover:underline"
                        >
                          {copiedKey === 'gst' ? <Check className="h-3.5 w-3.5 text-command-green" /> : <Copy className="h-3.5 w-3.5" />}
                          <span>{copiedKey === 'gst' ? 'Copied!' : 'Copy Command'}</span>
                        </button>
                      </div>
                      <pre className="p-3 bg-[#03060C] border border-command-border/60 rounded-lg text-slate-200 overflow-x-auto text-[11px] leading-relaxed">
                        {gstreamerSnippet}
                      </pre>
                    </div>
                  )}

                  {activeCodeTab === 'ffmpeg' && (
                    <div className="space-y-3">
                      <div>
                        <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                          <span>FFplay RTSP (Direct IP, Port 8554):</span>
                          <button
                            onClick={() => copyToClipboard(ffmpegRTSPSnippet, 'ff-rtsp')}
                            className="flex items-center gap-1 text-command-cyan hover:underline"
                          >
                            {copiedKey === 'ff-rtsp' ? <Check className="h-3.5 w-3.5 text-command-green" /> : <Copy className="h-3.5 w-3.5" />}
                            <span>{copiedKey === 'ff-rtsp' ? 'Copied!' : 'Copy'}</span>
                          </button>
                        </div>
                        <pre className="p-2.5 bg-[#03060C] border border-command-border/60 rounded-lg text-slate-200 overflow-x-auto text-[11px]">
                          {ffmpegRTSPSnippet}
                        </pre>
                      </div>

                      <div>
                        <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                          <span>FFplay HLS (Public CDN):</span>
                          <button
                            onClick={() => copyToClipboard(ffmpegHLSSnippet, 'ff-hls')}
                            className="flex items-center gap-1 text-command-cyan hover:underline"
                          >
                            {copiedKey === 'ff-hls' ? <Check className="h-3.5 w-3.5 text-command-green" /> : <Copy className="h-3.5 w-3.5" />}
                            <span>{copiedKey === 'ff-hls' ? 'Copied!' : 'Copy'}</span>
                          </button>
                        </div>
                        <pre className="p-2.5 bg-[#03060C] border border-command-border/60 rounded-lg text-slate-200 overflow-x-auto text-[11px]">
                          {ffmpegHLSSnippet}
                        </pre>
                      </div>
                    </div>
                  )}

                  {activeCodeTab === 'urls' && (
                    <div className="space-y-3">
                      <div>
                        <div className="text-[10px] text-command-muted uppercase mb-1">HLS Live Stream URL:</div>
                        <div className="p-2 bg-[#03060C] border border-command-border/60 rounded flex items-center justify-between gap-2">
                          <code className="text-command-cyan truncate text-[11px]">{hlsUrl}</code>
                          <button
                            onClick={() => copyToClipboard(hlsUrl, 'u-hls')}
                            className="text-[10px] text-slate-300 hover:text-white"
                          >
                            {copiedKey === 'u-hls' ? 'Copied' : 'Copy'}
                          </button>
                        </div>
                      </div>

                      <div>
                        <div className="text-[10px] text-command-muted uppercase mb-1">RTSP Stream URL (TCP 8554):</div>
                        <div className="p-2 bg-[#03060C] border border-command-border/60 rounded flex items-center justify-between gap-2">
                          <code className="text-amber-400 truncate text-[11px]">{rtspUrl}</code>
                          <button
                            onClick={() => copyToClipboard(rtspUrl, 'u-rtsp')}
                            className="text-[10px] text-slate-300 hover:text-white"
                          >
                            {copiedKey === 'u-rtsp' ? 'Copied' : 'Copy'}
                          </button>
                        </div>
                      </div>

                      <div>
                        <div className="text-[10px] text-command-muted uppercase mb-1">WebRTC WHEP URL (Port 8889):</div>
                        <div className="p-2 bg-[#03060C] border border-command-border/60 rounded flex items-center justify-between gap-2">
                          <code className="text-emerald-400 truncate text-[11px]">{whepUrl}</code>
                          <button
                            onClick={() => copyToClipboard(whepUrl, 'u-whep')}
                            className="text-[10px] text-slate-300 hover:text-white"
                          >
                            {copiedKey === 'u-whep' ? 'Copied' : 'Copy'}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="p-3 border-t border-command-border bg-[#070D18] flex items-center justify-between text-[11px] text-slate-400">
              <span>Sentinel Camera Grid Node ID: <strong className="text-white">{camId}</strong></span>
              <button
                onClick={() => setGuideModalOpen(false)}
                className="px-3 py-1 bg-command-card hover:bg-command-hover text-white rounded border border-command-border"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
