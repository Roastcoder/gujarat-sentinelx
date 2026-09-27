'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  Camera,
  Maximize2,
  Minimize2,
  Terminal,
  Scan,
  Download,
  Radio,
  Sparkles,
  ZoomIn,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Square,
  Volume2,
  VolumeX,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import { getApiBase } from '@/lib/api';


// Simulated ANPR detections per camera (rotates to show "live" detections)
const DETECTION_POOL = [
  { plate: 'GJ01AB1234', conf: 98.4, type: 'SUV', color: 'Silver', watchlist: true },
  { plate: 'GJ01KY4521', conf: 97.1, type: 'Sedan', color: 'White', watchlist: false },
  { plate: 'GJ05CH8823', conf: 96.8, type: 'Hatchback', color: 'Red', watchlist: false },
  { plate: 'GJ03KL5544', conf: 99.2, type: 'Truck', color: 'Blue', watchlist: false },
  { plate: 'GJ18BX7712', conf: 95.6, type: 'SUV', color: 'Black', watchlist: false },
  { plate: 'GJ06MN2290', conf: 97.4, type: 'Sedan', color: 'White', watchlist: false },
  { plate: 'GJ11PQ3317', conf: 98.9, type: 'Bus', color: 'Yellow', watchlist: false },
  { plate: 'MH04AB9981', conf: 94.2, type: 'Car', color: 'Grey', watchlist: false },
  { plate: 'RJ14CD5567', conf: 96.1, type: 'SUV', color: 'White', watchlist: false },
];

export interface ANPRDetection {
  plate: string;
  conf: number;
  type: string;
  color: string;
  watchlist: boolean;
  cameraCode: string;
  cameraName: string;
  timestamp: Date;
  bbox: { x: number; y: number; w: number; h: number };
}

interface CameraFeedPlayerProps {
  camera: {
    id: string;
    code?: string;
    camera_code?: string;
    name: string;
    district?: string;
    district_name?: string;
    fps?: number;
    resolution?: string;
    latency?: number;
    anpr_enabled?: boolean;
  };
  index?: number;
  onOpenGuide?: () => void;
  onCaptureSnapshot?: (name: string) => void;
  onANPRDetection?: (detection: ANPRDetection) => void;
  showAiOverlayDefault?: boolean;
}

export default function CameraFeedPlayer({
  camera,
  index = 0,
  onOpenGuide,
  onCaptureSnapshot,
  onANPRDetection,
  showAiOverlayDefault = false,
}: CameraFeedPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [streamState, setStreamState] = useState<'connecting' | 'live' | 'snapshot_live'>('connecting');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showAiOverlay, setShowAiOverlay] = useState(showAiOverlayDefault || index === 0);
  const [timeString, setTimeString] = useState('');
  const [snapshotTimestamp, setSnapshotTimestamp] = useState(Date.now());
  const [isCapturing, setIsCapturing] = useState(false);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [isHdrEnhanced, setIsHdrEnhanced] = useState(true);
  const [isMuted, setIsMuted] = useState(true);

  // Playback controls
  const [isPlaying, setIsPlaying] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [currentDetection, setCurrentDetection] = useState<ANPRDetection | null>(null);
  const [detectionVisible, setDetectionVisible] = useState(false);
  const [detectionHistory, setDetectionHistory] = useState<ANPRDetection[]>([]);
  const [totalDetections, setTotalDetections] = useState(0);
  const [savedFlash, setSavedFlash] = useState<{ plate: string; url: string | null } | null>(null);

  // Derive standardized camera identifiers
  const cleanId = (camera.code || camera.camera_code || camera.id || 'cam01')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
  const match = cleanId.match(/(\d+)/);
  const rawNum = match ? parseInt(match[1], 10) : index + 1;
  const camNum = ((rawNum - 1) % 16) + 1;
  const camId = `cam${String(camNum).padStart(2, '0')}`;
  const cameraCode = camera.code || camera.camera_code || `CAM-SENT-${String(camNum).padStart(3, '0')}`;
  const cameraName = camera.name || `Camera ${camId.toUpperCase()}`;
  const districtName = camera.district || camera.district_name || 'Ahmedabad';

  const apiBase = getApiBase();
  const snapshotUrl = `/camera_snapshots/${camId}.jpg`;
  const whepUrl = `${apiBase}/streams/${camId}/whep`;


  // Real-time HUD Clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const pad = (n: number, w = 2) => String(n).padStart(w, '0');
      const datePart = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
      const timePart = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}.${pad(now.getMilliseconds(), 3)}`;
      setTimeString(`${datePart} ${timePart}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 100);
    return () => clearInterval(interval);
  }, []);

  // ── Canvas frame capture + backend save ───────────────────────────────
  const captureFrameAndSave = useCallback(async (detection: ANPRDetection, containerEl: HTMLDivElement | null) => {
    try {
      // Build an offscreen canvas sized to the player container
      const W = containerEl?.clientWidth || 1280;
      const H = containerEl?.clientHeight || 720;
      const canvas = document.createElement('canvas');
      canvas.width = W;
      canvas.height = H;
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;

      // Draw current frame — video if live, else the snapshot image
      const videoEl = videoRef.current;
      const imgEl = containerEl?.querySelector('img') as HTMLImageElement | null;

      if (videoEl && !videoEl.paused && videoEl.readyState >= 2) {
        ctx.drawImage(videoEl, 0, 0, W, H);
      } else if (imgEl && imgEl.complete) {
        ctx.drawImage(imgEl, 0, 0, W, H);
      } else {
        // fallback: dark background
        ctx.fillStyle = '#0B1528';
        ctx.fillRect(0, 0, W, H);
      }

      // ── Draw vehicle body bounding box ───────────────────────
      const vbLeft   = ((detection.bbox.x - 2) / 100) * W;
      const vbTop    = ((detection.bbox.y - 28) / 100) * H;
      const vbWidth  = ((detection.bbox.w + 4) / 100) * W;
      const vbHeight = ((detection.bbox.h + 32) / 100) * H;

      const boxColor = detection.watchlist ? '#F43F5E' : '#22D3EE';
      ctx.strokeStyle = boxColor;
      ctx.lineWidth = 3;
      ctx.strokeRect(vbLeft, vbTop, vbWidth, vbHeight);

      // Corner L-brackets on vehicle box
      const bLen = 18;
      ctx.lineWidth = 4;
      [[vbLeft, vbTop], [vbLeft + vbWidth, vbTop], [vbLeft, vbTop + vbHeight], [vbLeft + vbWidth, vbTop + vbHeight]].forEach(([cx, cy], i) => {
        ctx.beginPath();
        ctx.moveTo(cx + (i % 2 === 0 ? bLen : -bLen), cy);
        ctx.lineTo(cx, cy);
        ctx.lineTo(cx, cy + (i < 2 ? bLen : -bLen));
        ctx.stroke();
      });

      // ── Draw inner plate sub-box ──────────────────────────────
      const plLeft   = vbLeft   + vbWidth  * 0.20;
      const plTop    = vbTop    + vbHeight * 0.76;
      const plWidth  = vbWidth  * 0.60;
      const plHeight = vbHeight * 0.22;
      ctx.strokeStyle = '#FCD34D';
      ctx.lineWidth = 2;
      ctx.strokeRect(plLeft, plTop, plWidth, plHeight);

      // ── Vehicle label chip above box ─────────────────────────
      const labelText = `${detection.type} · ${detection.color}  ${detection.conf.toFixed(1)}%`;
      ctx.font = 'bold 14px monospace';
      ctx.fillStyle = detection.watchlist ? '#F43F5E' : '#22D3EE';
      ctx.fillText(labelText, vbLeft + 2, vbTop - 8);

      // ── Plate number below inner box ─────────────────────────
      const plateText = detection.plate;
      ctx.font = 'bold 16px monospace';
      const tw = ctx.measureText(plateText).width;
      const ptx = plLeft + plWidth / 2 - tw / 2;
      const pty = plTop + plHeight + 22;
      // Badge
      ctx.fillStyle = detection.watchlist ? '#9F1239' : '#0C1A2E';
      ctx.fillRect(ptx - 8, pty - 16, tw + 16, 22);
      ctx.strokeStyle = detection.watchlist ? '#F43F5E' : '#FCD34D';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(ptx - 8, pty - 16, tw + 16, 22);
      ctx.fillStyle = detection.watchlist ? '#FFF' : '#FDE68A';
      ctx.fillText(plateText, ptx, pty);

      // ── SentinelX watermark ───────────────────────────────────
      ctx.font = '11px monospace';
      ctx.fillStyle = 'rgba(255,255,255,0.55)';
      ctx.fillText(`SentinelX · ${cameraCode} · ${new Date().toISOString()}`, 8, H - 8);

      // Export base64 JPEG
      const b64 = canvas.toDataURL('image/jpeg', 0.88);

      // POST to backend ANPR ingest API
      const payload = {
        camera_code: cameraCode,
        camera_name: cameraName,
        plate_number: detection.plate,
        plate_confidence: detection.conf,
        vehicle_type: detection.type,
        vehicle_color: detection.color,
        vehicle_confidence: detection.conf - 1.2,
        latitude: 23.0225 + (Math.random() - 0.5) * 0.5,
        longitude: 72.5714 + (Math.random() - 0.5) * 0.5,
        speed_kmh: 30 + Math.random() * 60,
        heading: ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'][Math.floor(Math.random() * 8)],
        bbox_x: detection.bbox.x,
        bbox_y: detection.bbox.y,
        bbox_w: detection.bbox.w,
        bbox_h: detection.bbox.h,
        snapshot_b64: b64,
        timestamp: detection.timestamp.toISOString(),
      };

      const res = await fetch(`${apiBase}/anpr/ingest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        setSavedFlash({ plate: detection.plate, url: data.snapshot_url || null });
        setTimeout(() => setSavedFlash(null), 3000);
        return data.snapshot_url;
      }
    } catch (err) {
      // Silently fail — detection still shows in UI
      console.warn('[ANPR Ingest] Backend not reachable:', err);
    }
    return null;
  }, [cameraCode, cameraName]);

  // Simulated ANPR detection engine — fires every 5-12 seconds per camera
  useEffect(() => {
    if (!isPlaying) return;

    const detectionInterval = setInterval(() => {
      // Each camera randomly detects a vehicle from the pool
      const poolIdx = Math.floor(Math.random() * DETECTION_POOL.length);
      const pool = DETECTION_POOL[poolIdx];

      // Generate pseudo-random bounding box in lower half of frame
      const bboxX = 15 + Math.random() * 50;
      const bboxY = 45 + Math.random() * 30;
      const bboxW = 15 + Math.random() * 20;
      const bboxH = 8  + Math.random() * 10;

      const detection: ANPRDetection = {
        ...pool,
        cameraCode,
        cameraName,
        timestamp: new Date(),
        bbox: { x: bboxX, y: bboxY, w: bboxW, h: bboxH },
      };

      setCurrentDetection(detection);
      setDetectionVisible(true);
      setTotalDetections((t) => t + 1);
      setDetectionHistory((prev) => [detection, ...prev].slice(0, 5));

      // Notify parent (Live page ANPR sidebar)
      if (onANPRDetection) onANPRDetection(detection);

      // 📸 Capture frame + save to DB after 400ms (let overlay render first)
      setTimeout(() => {
        captureFrameAndSave(detection, containerRef.current);
      }, 400);

      // Hide overlay after 3.5 seconds
      setTimeout(() => setDetectionVisible(false), 3500);
    }, 5000 + Math.random() * 7000 + index * 1200);

    return () => clearInterval(detectionInterval);
  }, [isPlaying, cameraCode, cameraName, onANPRDetection, index, captureFrameAndSave]);

  // WebRTC WHEP with fallback
  useEffect(() => {
    let isMounted = true;
    let fallbackTimer: NodeJS.Timeout | null = null;

    async function initWebRTC() {
      try {
        setStreamState('connecting');
        if (pcRef.current) { pcRef.current.close(); pcRef.current = null; }

        const pc = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });
        pcRef.current = pc;
        pc.addTransceiver('video', { direction: 'recvonly' });

        pc.ontrack = (event) => {
          if (!isMounted) return;
          if (videoRef.current && event.streams?.[0]) {
            videoRef.current.srcObject = event.streams[0];
            videoRef.current.play().catch(() => {});
            setStreamState('live');
            if (fallbackTimer) clearTimeout(fallbackTimer);
          }
        };

        pc.oniceconnectionstatechange = () => {
          if (pc.iceConnectionState === 'failed' || pc.iceConnectionState === 'disconnected') {
            if (isMounted) setStreamState('snapshot_live');
          }
        };

        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        await new Promise<void>((resolve) => {
          if (pc.iceGatheringState === 'complete') { resolve(); return; }
          const check = () => { if (pc.iceGatheringState === 'complete') { pc.removeEventListener('icegatheringstatechange', check); resolve(); } };
          pc.addEventListener('icegatheringstatechange', check);
          setTimeout(resolve, 800);
        });

        const res = await fetch(whepUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/sdp', Authorization: 'Basic ' + btoa('cybersachinyadav@gmail.com:A2ZV-8SLH-T9NF') },
          body: pc.localDescription?.sdp || offer.sdp,
        });

        if (!res.ok) throw new Error(`WHEP ${res.status}`);
        if (isMounted) await pc.setRemoteDescription({ type: 'answer', sdp: await res.text() });
      } catch {
        if (isMounted) setStreamState('snapshot_live');
      }
    }

    fallbackTimer = setTimeout(() => {
      if (isMounted && streamState === 'connecting') setStreamState('snapshot_live');
    }, 2500);

    initWebRTC();
    return () => {
      isMounted = false;
      if (fallbackTimer) clearTimeout(fallbackTimer);
      if (pcRef.current) { pcRef.current.close(); pcRef.current = null; }
    };
  }, [camId, whepUrl]);

  // Snapshot refresher
  useEffect(() => {
    if (streamState === 'snapshot_live' && isPlaying) {
      const interval = setInterval(() => setSnapshotTimestamp(Date.now()), 5000);
      return () => clearInterval(interval);
    }
  }, [streamState, isPlaying]);

  // Playback speed effect on video element
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackSpeed;
      if (isPlaying) { videoRef.current.play().catch(() => {}); }
      else { videoRef.current.pause(); }
    }
  }, [isPlaying, playbackSpeed]);

  // Fullscreen
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  // Zoom
  const cycleZoom = () => {
    setZoomLevel((prev) => (prev === 1 ? 1.5 : prev === 1.5 ? 2 : prev === 2 ? 2.5 : 1));
  };

  // Playback speed cycle
  const cycleSpeed = () => {
    setPlaybackSpeed((prev) => (prev === 1 ? 1.5 : prev === 1.5 ? 2 : prev === 2 ? 4 : 1));
  };

  // Skip forward 5s
  const skipForward = () => {
    if (videoRef.current) videoRef.current.currentTime += 5;
  };
  const skipBack = () => {
    if (videoRef.current) videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 5);
  };

  // Snapshot download
  const handleDownloadSnapshot = () => {
    setIsCapturing(true);
    if (onCaptureSnapshot) onCaptureSnapshot(cameraName);
    const link = document.createElement('a');
    link.href = snapshotUrl;
    link.download = `sentinelx-${camId}-${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => setIsCapturing(false), 800);
  };

  const visualStyle: React.CSSProperties = {
    transform: `scale(${zoomLevel})`,
    transformOrigin: 'center center',
    transition: 'transform 0.3s ease-out, filter 0.3s ease-out',
    filter: isHdrEnhanced ? 'contrast(1.10) saturate(1.18) brightness(1.03)' : 'none',
    imageRendering: '-webkit-optimize-contrast' as any,
  };

  return (
    <div
      ref={containerRef}
      className={`group relative bg-slate-950 rounded-xl border border-command-border overflow-hidden flex flex-col shadow-md hover:border-command-accent/80 transition-all ${
        isFullscreen ? 'w-screen h-screen rounded-none fixed inset-0 z-[9999]' : 'aspect-video'
      }`}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={isMuted}
        style={visualStyle}
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 z-0 ${
          streamState === 'live' ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Snapshot / Fallback Feed */}
      <div
        className={`absolute inset-0 w-full h-full bg-slate-950 overflow-hidden transition-opacity duration-500 z-0 ${
          streamState === 'live' ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
      >
        {isPlaying ? (
          <img
            src={`${snapshotUrl}?t=${snapshotTimestamp}`}
            alt={cameraName}
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = `${apiBase}/streams/${camId}/snapshot`;
            }}
            style={visualStyle}
            className="w-full h-full object-cover"
          />
        ) : (
          /* PAUSED overlay */
          <div className="w-full h-full relative">
            <img
              src={`${snapshotUrl}?t=${snapshotTimestamp}`}
              alt={cameraName}
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = `${apiBase}/streams/${camId}/snapshot`;
              }}
              style={visualStyle}
              className="w-full h-full object-cover opacity-60"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-black/80 rounded-xl px-6 py-3 flex items-center gap-3 border border-slate-700">
                <Pause className="h-6 w-6 text-slate-300" />
                <span className="text-white font-mono font-bold text-sm">PAUSED</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ─── DUAL ANPR OVERLAY: Vehicle Body Box + Plate Sub-box ─── */}
      {showAiOverlay && detectionVisible && currentDetection && (
        <div className="absolute inset-0 z-20 pointer-events-none select-none">

          {/* ── OUTER: Full Vehicle Body Box ── */}
          <div
            className={`absolute bbox-appear ${
              currentDetection.watchlist
                ? 'border-2 border-rose-400 shadow-[0_0_24px_rgba(244,63,94,0.55)]'
                : 'border-2 border-cyan-400 shadow-[0_0_16px_rgba(0,229,255,0.45)]'
            }`}
            style={{
              // Vehicle body is taller & wider than just the plate zone
              left: `${currentDetection.bbox.x - 2}%`,
              top: `${currentDetection.bbox.y - 28}%`,
              width: `${currentDetection.bbox.w + 4}%`,
              height: `${currentDetection.bbox.h + 32}%`,
            }}
          >
            {/* Bracket corners — thick L-shapes */}
            {(['tl','tr','bl','br'] as const).map((pos) => (
              <span
                key={pos}
                className={`absolute w-4 h-4 ${
                  currentDetection.watchlist ? 'border-rose-400' : 'border-cyan-400'
                } ${pos === 'tl' ? '-top-0.5 -left-0.5 border-t-[3px] border-l-[3px]'
                  : pos === 'tr' ? '-top-0.5 -right-0.5 border-t-[3px] border-r-[3px]'
                  : pos === 'bl' ? '-bottom-0.5 -left-0.5 border-b-[3px] border-l-[3px]'
                  : '-bottom-0.5 -right-0.5 border-b-[3px] border-r-[3px]'
                }`}
              />
            ))}

            {/* Subtle fill tint over the vehicle */}
            <div className={`absolute inset-0 ${
              currentDetection.watchlist ? 'bg-rose-500/5' : 'bg-cyan-400/5'
            }`} />

            {/* ── Vehicle label chip (top-left of body box) ── */}
            <div
              className={`absolute -top-7 left-0 flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-black tracking-wider shadow-xl ${
                currentDetection.watchlist
                  ? 'bg-rose-600 text-white border border-rose-400'
                  : 'bg-[#020D1A]/95 text-cyan-300 border border-cyan-500/70'
              }`}
            >
              {/* Vehicle type icon string */}
              <span className="text-[11px]">
                {currentDetection.type === 'Bus' ? '🚌'
                  : currentDetection.type === 'Truck' ? '🚚'
                  : currentDetection.type === 'Hatchback' ? '🚗'
                  : currentDetection.type === 'Motorcycle' ? '🏍️'
                  : '🚙'}
              </span>
              <span className="uppercase tracking-widest">{currentDetection.type}</span>
              <span className="opacity-60">·</span>
              <span className="opacity-80">{currentDetection.color}</span>
              {currentDetection.watchlist && (
                <span className="ml-1 text-[9px] bg-white/25 px-1.5 rounded-sm font-black tracking-wider">⚠ WATCHLIST</span>
              )}
            </div>

            {/* ── Class confidence (top-right of body box) ── */}
            <div className={`absolute -top-7 right-0 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold ${
              currentDetection.watchlist ? 'text-rose-300 bg-rose-950/80 border border-rose-500/40' : 'text-emerald-400 bg-slate-950/80 border border-emerald-500/30'
            }`}>
              YOLOv8 {(currentDetection.conf - 1.2).toFixed(1)}%
            </div>

            {/* ── INNER: License Plate Sub-box (bottom of vehicle) ── */}
            <div
              className={`absolute border rounded-sm ${
                currentDetection.watchlist
                  ? 'border-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.6)]'
                  : 'border-yellow-300 shadow-[0_0_8px_rgba(253,224,71,0.5)]'
              }`}
              style={{
                left: '20%',
                bottom: '8%',
                width: '60%',
                height: '22%',
              }}
            >
              {/* Plate corners */}
              {(['tl','tr','bl','br'] as const).map((pos) => (
                <span
                  key={pos}
                  className={`absolute w-2.5 h-2.5 border-amber-400 ${
                    pos === 'tl' ? '-top-px -left-px border-t border-l'
                    : pos === 'tr' ? '-top-px -right-px border-t border-r'
                    : pos === 'bl' ? '-bottom-px -left-px border-b border-l'
                    : '-bottom-px -right-px border-b border-r'
                  }`}
                />
              ))}

              {/* Plate number label — below the inner box */}
              <div
                className={`absolute -bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap px-2.5 py-0.5 rounded-md text-[11px] font-mono font-black tracking-[0.18em] shadow-2xl flex items-center gap-1.5 ${
                  currentDetection.watchlist
                    ? 'bg-rose-600 text-white border border-rose-300'
                    : 'bg-slate-950/95 text-yellow-300 border border-yellow-400/70'
                }`}
              >
                <Scan className="h-3 w-3 flex-shrink-0" />
                {currentDetection.plate}
                <span className={`text-[9px] font-bold px-1 py-0.5 rounded ${
                  currentDetection.watchlist ? 'bg-white/20 text-white' : 'bg-yellow-400/20 text-yellow-200'
                }`}>
                  {currentDetection.conf.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>

          {/* ── Horizontal scan sweep line ── */}
          <div
            className={`absolute left-[${Math.max(0, currentDetection.bbox.x - 4)}%] h-px opacity-50 animate-[scan_2.5s_ease-in-out_infinite] ${
              currentDetection.watchlist ? 'bg-rose-400' : 'bg-cyan-300'
            }`}
            style={{
              left: `${Math.max(0, currentDetection.bbox.x - 4)}%`,
              width: `${Math.min(100, currentDetection.bbox.w + 10)}%`,
            }}
          />

          {/* ── Crosshair centre dot ── */}
          <div
            className={`absolute h-2 w-2 rounded-full -translate-x-1 -translate-y-1 ${
              currentDetection.watchlist ? 'bg-rose-400' : 'bg-cyan-400'
            } opacity-80`}
            style={{
              left: `${currentDetection.bbox.x + currentDetection.bbox.w / 2}%`,
              top: `${currentDetection.bbox.y + currentDetection.bbox.h / 2 - 12}%`,
            }}
          />
        </div>
      )}

      {/* AI-OFF detection counter badge (always visible top-right corner) */}
      {totalDetections > 0 && (
        <div className="absolute top-8 right-2 z-20 bg-slate-900/80 border border-cyan-500/40 rounded-full px-2 py-0.5 text-[10px] font-mono font-bold text-cyan-400 flex items-center gap-1">
          <span>{totalDetections}</span>
          <span className="text-slate-400">scans</span>
        </div>
      )}

      {/* 📸 "Saved to DB" flash badge — appears for 3s after each save */}
      {savedFlash && (
        <div className="absolute top-14 right-2 z-30 animate-bounce">
          <div className="bg-emerald-600 border border-emerald-400 rounded-lg px-2.5 py-1.5 text-[10px] font-mono font-black text-white shadow-xl flex flex-col items-end gap-0.5">
            <div className="flex items-center gap-1.5">
              <span>📸</span>
              <span className="tracking-wider">SAVED TO DB</span>
            </div>
            <span className="text-emerald-200 font-bold tracking-widest text-[11px]">{savedFlash.plate}</span>
            {savedFlash.url && (
              <a
                href={savedFlash.url}
                target="_blank"
                rel="noreferrer"
                className="text-[9px] text-emerald-300 underline hover:text-white"
              >
                View snapshot →
              </a>
            )}
          </div>
        </div>
      )}


      {/* ─── HUD HEADER ─── */}
      <div className="absolute top-0 inset-x-0 z-20 bg-gradient-to-b from-black/90 via-black/50 to-transparent p-2 flex items-center justify-between text-xs font-mono select-none">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isPlaying ? 'bg-emerald-400' : 'bg-amber-400'}`} />
            <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isPlaying ? 'bg-emerald-500' : 'bg-amber-500'}`} />
          </span>
          <span className="font-bold text-white tracking-wider text-xs">{cameraCode}</span>
          <span className="text-[11px] text-slate-200 hidden sm:inline truncate max-w-[140px]">{cameraName}</span>
        </div>

        <div className="flex items-center gap-1.5 text-[10px]">
          <span className={`px-2 py-0.5 rounded border font-bold tracking-wider ${
            isPlaying
              ? 'bg-command-accent/20 text-command-cyan border-command-accent/40'
              : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
          }`}>
            {isPlaying ? (streamState === 'live' ? 'LIVE · WHEP' : 'LIVE · 1080p') : 'PAUSED'}
            {playbackSpeed > 1 && ` · ${playbackSpeed}x`}
          </span>

          <button
            onClick={() => setIsHdrEnhanced(!isHdrEnhanced)}
            className={`px-1.5 py-0.5 rounded font-mono font-bold transition-colors flex items-center gap-1 ${
              isHdrEnhanced
                ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
                : 'bg-command-surface text-slate-400 border border-command-border'
            }`}
            title="Toggle HDR Clarity Filter"
          >
            <Sparkles className="h-3 w-3" />
            <span className="hidden md:inline">HDR</span>
          </button>
        </div>
      </div>

      {/* ─── PLAYBACK CONTROLS FOOTER ─── */}
      <div className="absolute bottom-0 inset-x-0 z-20 bg-gradient-to-t from-black/95 via-black/70 to-transparent px-2 py-2 flex flex-col gap-1.5 select-none">
        {/* Detection strip — last detected plate */}
        {showAiOverlay && currentDetection && (
          <div className={`flex items-center justify-between px-2 py-1 rounded-lg text-[10px] font-mono font-bold transition-all ${
            currentDetection.watchlist
              ? 'bg-rose-950/80 border border-rose-500/60 text-rose-300'
              : 'bg-slate-900/80 border border-cyan-500/40 text-cyan-300'
          }`}>
            <div className="flex items-center gap-1.5">
              <Scan className="h-3 w-3" />
              <span className="tracking-widest">{currentDetection.plate}</span>
              <span className="text-slate-400">·</span>
              <span className="text-slate-300">{currentDetection.type} · {currentDetection.color}</span>
            </div>
            <div className="flex items-center gap-1.5">
              {currentDetection.watchlist && (
                <span className="bg-rose-600 text-white text-[9px] px-1.5 py-0.2 rounded font-black">ALERT</span>
              )}
              <Link
                href={`/vehicles/${currentDetection.plate}`}
                className="bg-command-accent/80 hover:bg-command-accent text-white text-[9px] px-2 py-0.5 rounded font-bold transition-colors"
              >
                Investigate →
              </Link>
            </div>
          </div>
        )}

        {/* Main control row */}
        <div className="flex items-center justify-between text-[11px] font-mono text-slate-300">
          {/* Left: Timestamps */}
          <div className="flex items-center gap-2">
            <span className="text-command-cyan font-semibold">{districtName}</span>
            <span className="text-slate-500 hidden sm:inline">|</span>
            <span className="text-slate-200 hidden sm:inline text-[10px] tracking-tight">{timeString}</span>
            <span className="text-emerald-400 text-[10px] font-bold">{camera.fps || 30}FPS</span>
          </div>

          {/* Center: Playback controls */}
          <div className="flex items-center gap-1">
            {/* Skip Back */}
            <button
              onClick={skipBack}
              className="p-1.5 rounded hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
              title="Skip Back 5s"
            >
              <SkipBack className="h-3.5 w-3.5" />
            </button>

            {/* Play / Pause */}
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`p-1.5 rounded-full transition-colors font-bold ${
                isPlaying
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
              }`}
              title={isPlaying ? 'Pause Feed' : 'Resume Feed'}
            >
              {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5 fill-current" />}
            </button>

            {/* Skip Forward */}
            <button
              onClick={skipForward}
              className="p-1.5 rounded hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
              title="Skip Forward 5s"
            >
              <SkipForward className="h-3.5 w-3.5" />
            </button>

            {/* Speed */}
            <button
              onClick={cycleSpeed}
              className={`px-1.5 py-1 rounded text-[10px] font-bold transition-colors ${
                playbackSpeed > 1
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                  : 'text-slate-400 hover:text-white hover:bg-white/10'
              }`}
              title={`Playback Speed: ${playbackSpeed}x`}
            >
              {playbackSpeed}x
            </button>
          </div>

          {/* Right: Utility controls */}
          <div className="flex items-center gap-1">
            {/* Mute / Unmute */}
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-1.5 rounded hover:bg-white/20 text-slate-400 hover:text-white transition-colors"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
            </button>

            {/* Digital Zoom */}
            <button
              onClick={cycleZoom}
              className={`p-1.5 rounded transition-colors text-[10px] font-bold flex items-center gap-1 ${
                zoomLevel > 1
                  ? 'bg-command-cyan/20 text-command-cyan border border-command-cyan/40'
                  : 'text-slate-400 hover:text-white hover:bg-white/10'
              }`}
              title={`Zoom: ${zoomLevel}x`}
            >
              <ZoomIn className="h-3.5 w-3.5" />
              {zoomLevel > 1 && <span>{zoomLevel}x</span>}
            </button>

            {/* AI ANPR Toggle */}
            <button
              onClick={() => setShowAiOverlay(!showAiOverlay)}
              className={`p-1.5 rounded transition-colors text-[10px] font-bold flex items-center gap-1 ${
                showAiOverlay
                  ? 'bg-command-cyan/20 text-command-cyan border border-command-cyan/40'
                  : 'text-slate-400 hover:text-white hover:bg-white/10'
              }`}
              title="Toggle AI ANPR Bounding Box"
            >
              <Scan className="h-3.5 w-3.5" />
              <span className="hidden xl:inline">ANPR</span>
            </button>

            {/* Snapshot */}
            <button
              onClick={handleDownloadSnapshot}
              disabled={isCapturing}
              className="p-1.5 rounded hover:bg-white/20 text-white transition-colors disabled:opacity-50"
              title="Download Forensic Snapshot"
            >
              <Download className={`h-3.5 w-3.5 ${isCapturing ? 'animate-bounce' : ''}`} />
            </button>

            {/* Integrator Guide */}
            {onOpenGuide && (
              <button
                onClick={onOpenGuide}
                className="p-1.5 rounded hover:bg-command-cyan/20 text-command-cyan transition-colors"
                title="RTSP & WHEP Integration Snippets"
              >
                <Terminal className="h-3.5 w-3.5" />
              </button>
            )}

            {/* Camera Details */}
            <Link
              href={`/cameras/${camera.camera_code || camera.code || camera.id}`}
              className="p-1.5 rounded hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
              title="Camera Registry Details"
            >
              <Radio className="h-3.5 w-3.5" />
            </Link>

            {/* Fullscreen */}
            <button
              onClick={toggleFullscreen}
              className="p-1.5 rounded hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
