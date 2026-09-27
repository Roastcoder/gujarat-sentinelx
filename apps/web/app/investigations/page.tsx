'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Briefcase,
  FileText,
  Clock,
  Car,
  UserCheck,
  Shield,
  ArrowRight,
  Plus,
  Eye,
} from 'lucide-react';
import { api } from '@/lib/api';

export default function InvestigationsPage() {
  const [cases, setCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCases() {
      try {
        setLoading(true);
        const data = await api.getInvestigations();
        setCases(data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadCases();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl bg-command-surface border border-command-border">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-command-accent/20 border border-command-accent/40 flex items-center justify-center text-command-cyan">
            <Briefcase className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-base font-extrabold text-white tracking-wide uppercase">
              Investigation Workspace & Digital Case Dossiers
            </h1>
            <p className="text-xs text-command-muted font-mono">
              Chain of Custody · Cross-Camera Forensics · Officer Case Files
            </p>
          </div>
        </div>

        <div className="text-xs font-mono text-command-cyan font-bold">
          {cases.length} ACTIVE CASE FILES
        </div>
      </div>

      {/* Case Dossiers Grid */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-8 text-center text-xs text-command-muted">Loading cases...</div>
        ) : (
          cases.map((c) => (
            <div
              key={c.id}
              className="bg-command-surface border border-command-border rounded-xl p-5 space-y-4 shadow-md"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-command-border">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm font-black text-command-cyan">
                      {c.case_number}
                    </span>
                    <span className="bg-amber-500/20 text-amber-400 text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-amber-500/30 uppercase">
                      {c.status}
                    </span>
                    <span className="bg-red-600 text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase">
                      {c.priority} PRIORITY
                    </span>
                  </div>

                  <h2 className="text-base font-bold text-white mt-1.5">{c.title}</h2>
                  <p className="text-xs text-slate-300 mt-1 max-w-3xl">{c.description}</p>
                </div>

                <div className="text-right text-xs font-mono text-command-muted space-y-1">
                  <div>Lead Investigator: <span className="text-white font-bold">{c.officer_name}</span></div>
                  <div>Opened: {new Date(c.created_at).toLocaleDateString()}</div>
                </div>
              </div>

              {/* Target Vehicles */}
              {c.target_plates && (
                <div className="flex items-center gap-3 text-xs font-mono">
                  <span className="text-command-muted">Target Vehicle:</span>
                  <Link
                    href={`/vehicles/${c.target_plates}`}
                    className="font-bold text-white bg-command-card px-2.5 py-1 rounded border border-command-border hover:border-command-accent text-command-cyan flex items-center gap-1.5"
                  >
                    <Car className="h-3.5 w-3.5" />
                    <span>{c.target_plates}</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              )}

              {/* Case Notes */}
              {c.notes && c.notes.length > 0 && (
                <div className="p-3 rounded-lg bg-command-card border border-command-border text-xs space-y-1.5">
                  <div className="text-[11px] font-mono text-command-muted uppercase font-bold flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5 text-command-cyan" />
                    <span>Officer Forensic Field Notes</span>
                  </div>
                  {c.notes.map((n: any) => (
                    <div key={n.id} className="text-slate-200 text-xs pl-5">
                      <span className="font-semibold text-command-cyan">{n.author_name}:</span> {n.note}
                    </div>
                  ))}
                </div>
              )}

              {/* Case Evidence Snapshots */}
              {c.evidence && c.evidence.length > 0 && (
                <div className="space-y-2">
                  <div className="text-[11px] font-mono text-command-muted uppercase font-bold flex items-center gap-1.5">
                    <Eye className="h-3.5 w-3.5 text-command-green" />
                    <span>Attached Forensic Evidence ({c.evidence.length} items)</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {c.evidence.map((ev: any) => (
                      <div
                        key={ev.id}
                        className="p-3 rounded-lg bg-command-card border border-command-border text-xs font-mono space-y-1"
                      >
                        <div className="text-white font-bold">{ev.title}</div>
                        <p className="text-[11px] text-slate-300">{ev.description}</p>
                        <div className="text-[10px] text-command-muted truncate pt-1 border-t border-command-border/40">
                          {ev.chain_of_custody}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
