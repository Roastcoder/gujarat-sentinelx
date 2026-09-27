'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Camera, MapPin, Video, Activity, CheckCircle2, ArrowLeft } from 'lucide-react';
import { api } from '@/lib/api';
import CameraFeedPlayer from '@/components/camera/CameraFeedPlayer';

export default function CameraDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [camera, setCamera] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCamera() {
      try {
        setLoading(true);
        const data = await api.getCamera(id);
        setCamera(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    if (id) loadCamera();
  }, [id]);

  if (loading) {
    return <div className="p-8 text-center text-xs text-command-muted">Loading camera details...</div>;
  }

  if (!camera) {
    return <div className="p-8 text-center text-xs text-command-muted">Camera not found.</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <Link
        href="/cameras"
        className="inline-flex items-center gap-1.5 text-xs text-command-cyan hover:underline font-mono"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        <span>Back to Camera Registry</span>
      </Link>

      {/* Live Video Feed Player */}
      <div className="rounded-xl overflow-hidden shadow-lg border border-command-border">
        <CameraFeedPlayer
          camera={camera}
          showAiOverlayDefault={Boolean(camera.anpr_enabled)}
        />
      </div>

      <div className="p-5 rounded-xl bg-command-surface border border-command-border space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-command-border">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold font-mono text-white">{camera.camera_code}</h1>
              <span className="bg-command-green/20 text-command-green font-mono font-bold text-xs px-2 py-0.5 rounded">
                {camera.status}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1">{camera.name}</p>
          </div>

          <Link
            href="/live"
            className="bg-command-accent hover:bg-blue-600 text-white font-mono font-bold text-xs px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <Video className="h-3.5 w-3.5" />
            <span>Open Live Wall</span>
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4 text-xs font-mono text-slate-300">
          <div><strong className="text-command-muted">District:</strong> {camera.district_name}</div>
          <div><strong className="text-command-muted">Vendor:</strong> {camera.vendor} ({camera.model || 'HD'})</div>
          <div><strong className="text-command-muted">VMS Platform:</strong> {camera.vms}</div>
          <div><strong className="text-command-muted">Protocol:</strong> {camera.protocol}</div>
          <div><strong className="text-command-muted">Resolution:</strong> {camera.resolution} @ {camera.fps} FPS</div>
          <div><strong className="text-command-muted">ANPR Capabilities:</strong> {camera.anpr_enabled ? 'Enabled' : 'Disabled'}</div>
          <div><strong className="text-command-muted">Coordinates:</strong> {camera.latitude.toFixed(4)}, {camera.longitude.toFixed(4)}</div>
          <div><strong className="text-command-muted">Retention Period:</strong> {camera.retention_period} Days</div>
        </div>
      </div>
    </div>
  );
}
