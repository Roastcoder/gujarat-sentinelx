'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Camera,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Radio,
  Plus,
  ArrowRight,
  Maximize2,
} from 'lucide-react';
import { api } from '@/lib/api';

export default function CameraRegistryPage() {
  const [cameras, setCameras] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [districtFilter, setDistrictFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCameras() {
      try {
        setLoading(true);
        const data = await api.getCameras('limit=100');
        setCameras(data.items || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadCameras();
  }, []);

  const filteredCameras = cameras.filter((c) => {
    const matchSearch =
      search === '' ||
      c.camera_code.toLowerCase().includes(search.toLowerCase()) ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.vendor.toLowerCase().includes(search.toLowerCase());
    const matchDistrict =
      districtFilter === 'ALL' ||
      c.district_name?.toLowerCase() === districtFilter.toLowerCase();
    const matchStatus =
      statusFilter === 'ALL' || c.status.toUpperCase() === statusFilter.toUpperCase();
    return matchSearch && matchDistrict && matchStatus;
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl bg-command-surface border border-command-border">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-command-accent/20 border border-command-accent/40 flex items-center justify-center text-command-cyan">
            <Camera className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-base font-extrabold text-white tracking-wide uppercase">
              Unified Camera Registry & Device Topology
            </h1>
            <p className="text-xs text-command-muted font-mono">
              Centralized Index of 50 Heterogeneous Feeds across Gujarat Police Jurisdictions
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-command-green font-bold">
            {cameras.filter((c) => c.status === 'ONLINE').length} ONLINE
          </span>
          <span className="text-slate-500">·</span>
          <span className="text-command-red font-bold">
            {cameras.filter((c) => c.status === 'OFFLINE').length} OFFLINE
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Camera Code, Junction, or Vendor..."
            className="w-full bg-command-surface border border-command-border text-white text-xs rounded-lg pl-9 pr-3 py-2 font-mono focus:outline-none focus:border-command-accent"
          />
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-command-muted" />
        </div>

        <select
          value={districtFilter}
          onChange={(e) => setDistrictFilter(e.target.value)}
          className="bg-command-surface border border-command-border text-white text-xs rounded-lg px-3 py-2 font-mono focus:outline-none focus:border-command-accent"
        >
          <option value="ALL">All Districts</option>
          <option value="Ahmedabad">Ahmedabad</option>
          <option value="Gandhinagar">Gandhinagar</option>
          <option value="Surat">Surat</option>
          <option value="Vadodara">Vadodara</option>
          <option value="Rajkot">Rajkot</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-command-surface border border-command-border text-white text-xs rounded-lg px-3 py-2 font-mono focus:outline-none focus:border-command-accent"
        >
          <option value="ALL">All Operational Statuses</option>
          <option value="ONLINE">Online</option>
          <option value="OFFLINE">Offline</option>
          <option value="DEGRADED">Degraded</option>
        </select>
      </div>

      {/* Camera Data Table */}
      <div className="bg-command-surface border border-command-border rounded-xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-command-card border-b border-command-border text-[11px] text-slate-700 dark:text-slate-300 font-bold uppercase">
              <tr>
                <th className="py-3 px-4">Camera ID</th>
                <th className="py-3 px-4">Junction & Name</th>
                <th className="py-3 px-4">District</th>
                <th className="py-3 px-4">Vendor & Model</th>
                <th className="py-3 px-4">VMS Platform</th>
                <th className="py-3 px-4">ANPR</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-command-border/40 text-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-command-muted">
                    Loading Camera Registry...
                  </td>
                </tr>
              ) : filteredCameras.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-command-muted">
                    No cameras matching search criteria.
                  </td>
                </tr>
              ) : (
                filteredCameras.map((cam) => (
                  <tr key={cam.id} className="hover:bg-command-card/50 transition-colors">
                    <td className="py-3 px-4 font-bold text-command-cyan">
                      {cam.camera_code}
                    </td>
                    <td className="py-3 px-4 font-medium text-white max-w-xs truncate">
                      {cam.name}
                    </td>
                    <td className="py-3 px-4 text-slate-300">{cam.district_name}</td>
                    <td className="py-3 px-4 text-slate-400">
                      {cam.vendor} · {cam.model || 'HD'}
                    </td>
                    <td className="py-3 px-4 text-command-muted">{cam.vms}</td>
                    <td className="py-3 px-4">
                      {cam.anpr_enabled ? (
                        <span className="text-[10px] bg-command-green/10 text-command-green font-bold px-1.5 py-0.5 rounded border border-command-green/30">
                          ANPR
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-500">FIXED</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 w-max ${
                          cam.status === 'ONLINE'
                            ? 'bg-command-green/20 text-command-green'
                            : cam.status === 'DEGRADED'
                            ? 'bg-amber-500/20 text-amber-400'
                            : 'bg-command-red/20 text-command-red'
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            cam.status === 'ONLINE' ? 'bg-command-green' : 'bg-command-red'
                          }`}
                        />
                        {cam.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        href={`/live`}
                        className="text-command-cyan hover:underline inline-flex items-center gap-1"
                      >
                        <span>Live Feed</span>
                        <ArrowRight className="h-3 w-3" />
                      </Link>
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
