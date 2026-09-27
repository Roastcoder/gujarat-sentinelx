'use client';

import React, { useEffect, useState } from 'react';
import {
  ShieldAlert,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  Activity,
} from 'lucide-react';
import { api } from '@/lib/api';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLogs() {
      try {
        setLoading(true);
        const data = await api.getAuditLogs();
        setLogs(data.items || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadLogs();
  }, []);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl bg-command-surface border border-command-border">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-command-accent/20 border border-command-accent/40 flex items-center justify-center text-command-cyan">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-base font-extrabold text-white tracking-wide uppercase">
              Immutable Security & Access Audit Trail
            </h1>
            <p className="text-xs text-command-muted font-mono">
              Cryptographic Officer Query Logs · Sensitive Evidence Access · Compliance Registry
            </p>
          </div>
        </div>

        <div className="text-xs font-mono text-command-cyan font-bold">
          {logs.length} AUDIT RECORDS RECORDED
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-command-surface border border-command-border rounded-xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-command-card border-b border-command-border text-[11px] text-slate-700 dark:text-slate-300 font-bold uppercase">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Officer / User</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Resource</th>
                <th className="py-3 px-4">Target ID</th>
                <th className="py-3 px-4">Client IP</th>
                <th className="py-3 px-4 text-right">Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-command-border/40 text-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-command-muted">
                    Loading audit trail...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-command-muted">
                    No audit records logged.
                  </td>
                </tr>
              ) : (
                logs.map((l) => (
                  <tr key={l.id} className="hover:bg-command-card/50 transition-colors">
                    <td className="py-3 px-4 text-command-muted">
                      {new Date(l.timestamp).toLocaleTimeString()} · {new Date(l.timestamp).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 font-bold text-white">{l.username}</td>
                    <td className="py-3 px-4">
                      <span className="text-[10px] font-bold bg-command-card text-command-cyan px-2 py-0.5 rounded border border-command-border">
                        {l.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-300">{l.resource || '—'}</td>
                    <td className="py-3 px-4 font-black text-white font-mono">
                      {l.resource_id || '—'}
                    </td>
                    <td className="py-3 px-4 text-command-muted">{l.ip_address}</td>
                    <td className="py-3 px-4 text-right">
                      {l.result === 'SUCCESS' ? (
                        <span className="text-command-green font-bold flex items-center justify-end gap-1 text-[11px]">
                          <CheckCircle2 className="h-3 w-3" /> SUCCESS
                        </span>
                      ) : (
                        <span className="text-command-red font-bold flex items-center justify-end gap-1 text-[11px]">
                          <XCircle className="h-3 w-3" /> {l.result}
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
