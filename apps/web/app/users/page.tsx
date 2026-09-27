'use client';

import React from 'react';
import { Users, Shield, UserCheck, CheckCircle2, Lock } from 'lucide-react';

const SEED_USERS = [
  { username: 'admin', name: 'Director General (Tech)', role: 'Super Admin', dept: 'Gujarat Police State Command Center', badge: 'GJ-POL-001', status: 'ACTIVE' },
  { username: 'investigator', name: 'Inspector V. K. Patel', role: 'Investigator', dept: 'CID Crime · Ahmedabad Jurisdiction', badge: 'GJ-INV-402', status: 'ACTIVE' },
  { username: 'operator', name: 'Head Operator Rathod', role: 'Operator', dept: 'State CCTV Control Room', badge: 'GJ-OP-112', status: 'ACTIVE' },
  { username: 'auditor', name: 'Auditor S. K. Joshi', role: 'Auditor', dept: 'State Vigilance Commission', badge: 'GJ-AUD-009', status: 'ACTIVE' },
];

export default function UsersPage() {
  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl bg-command-surface border border-command-border">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-command-accent/20 border border-command-accent/40 flex items-center justify-center text-command-cyan">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-base font-extrabold text-white tracking-wide uppercase">
              Users & Role-Based Access Control (RBAC)
            </h1>
            <p className="text-xs text-command-muted font-mono">
              Cryptographic Officer Credentials · Least-Privilege Role Separation
            </p>
          </div>
        </div>
      </div>

      <div className="bg-command-surface border border-command-border rounded-xl overflow-hidden shadow-lg">
        <table className="w-full text-left text-xs font-mono">
          <thead className="bg-command-card border-b border-command-border text-[11px] text-slate-700 dark:text-slate-300 font-bold uppercase">
            <tr>
              <th className="py-3 px-4">Badge Number</th>
              <th className="py-3 px-4">Officer Name</th>
              <th className="py-3 px-4">Username</th>
              <th className="py-3 px-4">Assigned Role</th>
              <th className="py-3 px-4">Department</th>
              <th className="py-3 px-4 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-command-border/40 text-slate-200">
            {SEED_USERS.map((u) => (
              <tr key={u.username} className="hover:bg-command-card/50 transition-colors">
                <td className="py-3 px-4 font-bold text-command-cyan">{u.badge}</td>
                <td className="py-3 px-4 font-bold text-white">{u.name}</td>
                <td className="py-3 px-4 text-slate-400">{u.username}</td>
                <td className="py-3 px-4">
                  <span className="text-[10px] bg-command-card text-white font-bold px-2 py-0.5 rounded border border-command-border">
                    {u.role}
                  </span>
                </td>
                <td className="py-3 px-4 text-slate-300">{u.dept}</td>
                <td className="py-3 px-4 text-right">
                  <span className="text-command-green font-bold text-[11px] flex items-center justify-end gap-1">
                    <CheckCircle2 className="h-3 w-3" /> {u.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
