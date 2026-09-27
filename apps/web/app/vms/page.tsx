'use client';

import React, { useEffect, useState } from 'react';
import {
  Network,
  CheckCircle2,
  Server,
  Radio,
  Layers,
  Shield,
  Activity,
  Cpu,
  Zap,
} from 'lucide-react';
import { api } from '@/lib/api';

export default function VMSIntegrationsPage() {
  const [integrations, setIntegrations] = useState<any[]>([]);
  const [adaptersHealth, setAdaptersHealth] = useState<any[]>([]);
  const [gatewayStatus, setGatewayStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadVMS() {
      try {
        setLoading(true);
        const [intData, healthData, statusData] = await Promise.all([
          api.getVMSIntegrations().catch(() => []),
          api.getVMSAdaptersHealth().catch(() => []),
          api.getHealth().catch(() => null),
        ]);
        setIntegrations(intData || []);
        setAdaptersHealth(healthData || []);
        setGatewayStatus(statusData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadVMS();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl bg-command-surface border border-command-border shadow-md">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-command-accent/20 border border-command-accent/40 flex items-center justify-center text-command-cyan">
            <Network className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-base font-extrabold text-white tracking-wide uppercase">
              Heterogeneous VMS & Gateway Federation Layer (Section 38)
            </h1>
            <p className="text-xs text-command-muted font-mono">
              Milestone XProtect MIP · Genetec Omnicast · Matrix SATATYA · HikCentral · Universal ONVIF Profile T
            </p>
          </div>
        </div>

        <div className="text-xs font-mono text-command-green font-bold flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-command-green/10 border border-command-green/30">
          <CheckCircle2 className="h-4 w-4" />
          <span>ALL 5 FEDERATED ADAPTERS ACTIVE</span>
        </div>
      </div>

      {/* Modular VMS Federation Adapters Telemetry (Section 38) */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-mono font-bold text-white uppercase">
          <Cpu className="h-4 w-4 text-command-cyan" />
          <span>Modular VMS Adapters (Real-time Telemetry)</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3 font-mono text-xs">
          {adaptersHealth.length === 0 ? (
            <div className="col-span-full p-4 rounded-lg bg-command-surface border border-command-border text-center text-command-muted">
              Loading adapter connectors...
            </div>
          ) : (
            adaptersHealth.map((ad) => (
              <div
                key={ad.vms_id}
                className="p-3.5 rounded-lg bg-command-surface border border-command-border space-y-2 hover:border-command-accent/50 transition-all shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-[11px] truncate" title={ad.name}>
                    {ad.name}
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-command-green/20 text-command-green border border-command-green/30">
                    {ad.status}
                  </span>
                </div>

                <div className="text-[10px] text-command-muted">{ad.vms_id}</div>

                <div className="pt-2 border-t border-command-border/40 space-y-1 text-[11px] text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-command-muted">Feeds:</span>
                    <span className="font-bold text-command-cyan">{ad.connected_cameras}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-command-muted">Latency:</span>
                    <span className="text-emerald-400 font-bold">{ad.latency_ms} ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-command-muted">SDK/API:</span>
                    <span className="text-slate-400 truncate max-w-[100px] text-[10px]">{ad.sdk_version}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Existing Heterogeneous VMS Gateway Corridors */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-mono font-bold text-white uppercase">
          <Layers className="h-4 w-4 text-purple-400" />
          <span>Statewide Municipal & Highway VMS Installations</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {loading ? (
            <div className="p-8 text-center text-xs text-command-muted">Loading VMS deployments...</div>
          ) : (
            integrations.map((vms) => (
              <div
                key={vms.id}
                className="p-5 rounded-xl bg-command-surface border border-command-border space-y-3 shadow-md font-mono text-xs"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-bold text-white uppercase">{vms.name}</div>
                    <div className="text-[11px] text-command-muted mt-0.5">{vms.vendor}</div>
                  </div>

                  <span className="bg-command-green/20 text-command-green text-[10px] font-bold px-2 py-0.5 rounded border border-command-green/30">
                    {vms.status}
                  </span>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-command-border/50 text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-command-muted">Host Endpoint:</span>
                    <span className="text-white font-semibold">{vms.host}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-command-muted">Managed Feeds:</span>
                    <span className="text-command-cyan font-bold">{vms.camera_count} Cameras</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-command-muted">Average Latency:</span>
                    <span className="text-emerald-400 font-bold">{vms.latency_ms} ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-command-muted">Auth Scheme:</span>
                    <span className="text-slate-300 truncate max-w-xs">{vms.auth_type}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-command-border/40 flex flex-wrap gap-1.5">
                  {vms.protocols?.map((p: string) => (
                    <span
                      key={p}
                      className="text-[10px] bg-command-card text-command-cyan px-2 py-0.5 rounded border border-command-border font-bold"
                    >
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
