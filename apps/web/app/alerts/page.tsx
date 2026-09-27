'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  ShieldAlert,
  Search,
  Filter,
  Car,
  Camera,
} from 'lucide-react';
import { api } from '@/lib/api';

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [ackingId, setAckingId] = useState<string | null>(null);

  const loadAlerts = async () => {
    try {
      setLoading(true);
      const data = await api.getAlerts();
      setAlerts(data.items || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
  }, []);

  const handleAcknowledge = async (id: string) => {
    try {
      setAckingId(id);
      await api.acknowledgeAlert(id, 'Acknowledged by Control Room Officer');
      await loadAlerts();
    } catch (e) {
      console.error(e);
    } finally {
      setAckingId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl bg-command-surface border border-command-border shadow-xs">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-600 dark:text-rose-400">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-base font-extrabold text-slate-900 dark:text-white tracking-wide uppercase">
              Real-Time Security & Watchlist Alert Console
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              Live ANPR Watchlist Evaluation · Priority Alert Dispatch & Officer Acknowledgment
            </p>
          </div>
        </div>

        <div className="text-xs font-mono text-rose-600 dark:text-rose-400 font-bold flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping"></span>
          <span>{alerts.filter((a) => a.status === 'NEW').length} UNACKNOWLEDGED ALERTS</span>
        </div>
      </div>

      {/* Alerts Table */}
      <div className="bg-command-surface border border-command-border rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-command-card border-b border-command-border text-[11px] text-slate-700 dark:text-slate-300 font-bold uppercase">
              <tr>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Alert Type</th>
                <th className="py-3 px-4">Flagged Vehicle</th>
                <th className="py-3 px-4">Camera ID & District</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-command-border/40 text-slate-800 dark:text-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    Loading security alerts...
                  </td>
                </tr>
              ) : alerts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    No active alerts. All camera feeds normal.
                  </td>
                </tr>
              ) : (
                alerts.map((a) => (
                  <tr
                    key={a.id}
                    className={`transition-colors ${
                      a.status === 'NEW'
                        ? 'bg-rose-50/70 dark:bg-rose-950/25 border-l-4 border-l-rose-500'
                        : 'border-l-4 border-l-transparent hover:bg-command-card/50'
                    }`}
                  >
                    <td className="py-3 px-4">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                          a.priority === 'CRITICAL'
                            ? 'bg-rose-600 text-white'
                            : a.priority === 'HIGH'
                            ? 'bg-amber-600 text-white'
                            : 'bg-blue-600 text-white'
                        }`}
                      >
                        {a.priority}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">{a.alert_type}</td>
                    <td className="py-3 px-4">
                      {a.plate_number ? (
                        <Link
                          href={`/vehicles/${a.plate_number}`}
                          className="font-mono font-black text-blue-600 dark:text-cyan-400 hover:underline tracking-wider"
                        >
                          {a.plate_number}
                        </Link>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                      {a.camera_code} ({a.district_name || 'Gujarat'})
                    </td>
                    <td className="py-3 px-4 text-slate-500 dark:text-slate-400">
                      {new Date(a.created_at).toLocaleTimeString()} · {new Date(a.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      {a.status === 'NEW' ? (
                        <span className="text-rose-600 dark:text-rose-400 font-bold flex items-center gap-1">
                          <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping" />
                          NEW
                        </span>
                      ) : (
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          ACKNOWLEDGED
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {a.status === 'NEW' ? (
                        <button
                          onClick={() => handleAcknowledge(a.id)}
                          disabled={ackingId === a.id}
                          className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-3 py-1 rounded text-[11px] transition-colors shadow-xs"
                        >
                          {ackingId === a.id ? 'Saving...' : 'Acknowledge'}
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-500">
                          by {a.acknowledged_by}
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
