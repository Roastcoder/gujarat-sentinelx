'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { X, AlertTriangle, CheckCircle2, ShieldAlert, Clock, Camera } from 'lucide-react';
import { api } from '@/lib/api';

interface AlertDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onAlertAcknowledged?: () => void;
}

export default function AlertDrawer({ isOpen, onClose, onAlertAcknowledged }: AlertDrawerProps) {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [ackingId, setAckingId] = useState<string | null>(null);

  const loadAlerts = async () => {
    try {
      setLoading(true);
      const data = await api.getAlerts();
      setAlerts(data.items || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadAlerts();
    }
  }, [isOpen]);

  const handleAcknowledge = async (id: string) => {
    try {
      setAckingId(id);
      await api.acknowledgeAlert(id, 'Acknowledged by Control Room Operator');
      await loadAlerts();
      if (onAlertAcknowledged) onAlertAcknowledged();
    } catch (e) {
      console.error(e);
    } finally {
      setAckingId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-96 bg-command-bg border-l border-command-border shadow-2xl flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-command-border flex items-center justify-between bg-command-surface">
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-5 w-5 text-command-red" />
          <h2 className="text-sm font-bold text-white tracking-wide uppercase">
            Live Alert Center
          </h2>
        </div>
        <button
          onClick={onClose}
          className="text-command-muted hover:text-white p-1 rounded hover:bg-command-hover transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Alert List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {loading && <div className="text-xs text-command-muted p-4 text-center">Loading alerts...</div>}
        {!loading && alerts.length === 0 && (
          <div className="text-xs text-command-muted p-4 text-center">No active alerts.</div>
        )}
        {!loading &&
          alerts.map((a) => (
            <div
              key={a.id}
              className={`p-3 rounded-lg border text-xs transition-all ${
                a.status === 'NEW'
                  ? 'bg-red-950/30 border-command-red/50 shadow-sm'
                  : 'bg-command-surface border-command-border opacity-75'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold uppercase ${
                    a.priority === 'CRITICAL'
                      ? 'bg-red-600 text-white'
                      : a.priority === 'HIGH'
                      ? 'bg-amber-600 text-white'
                      : 'bg-blue-600 text-white'
                  }`}
                >
                  {a.priority} PRIORITY
                </span>
                <span className="text-[10px] text-command-muted font-mono flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {new Date(a.created_at).toLocaleTimeString()}
                </span>
              </div>

              <div className="mt-2 font-bold text-white text-xs">{a.title}</div>
              <p className="text-[11px] text-slate-300 mt-1">{a.description}</p>

              {a.plate_number && (
                <div className="mt-2.5 flex items-center justify-between gap-2 pt-2 border-t border-command-border/50">
                  <Link
                    href={`/vehicles/${a.plate_number}`}
                    className="font-mono text-command-cyan hover:underline text-xs font-bold"
                  >
                    Plate: {a.plate_number} →
                  </Link>

                  {a.status === 'NEW' ? (
                    <button
                      onClick={() => handleAcknowledge(a.id)}
                      disabled={ackingId === a.id}
                      className="bg-command-red hover:bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded transition-colors"
                    >
                      {ackingId === a.id ? 'Saving...' : 'Acknowledge'}
                    </button>
                  ) : (
                    <span className="text-[10px] text-command-green flex items-center gap-1 font-semibold">
                      <CheckCircle2 className="h-3 w-3" /> Acknowledged
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}
      </div>
    </div>
  );
}
