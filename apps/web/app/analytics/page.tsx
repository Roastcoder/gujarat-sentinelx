'use client';

import React, { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import {
  BarChart3,
  Activity,
  Layers,
  Car,
  Camera,
  Cpu,
  TrendingUp,
  Shield,
  Zap,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { api } from '@/lib/api';

const COLORS = ['#0284C7', '#00E5FF', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];

export default function AnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAnalytics() {
      try {
        setLoading(true);
        const res = await api.getAnalytics();
        setData(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadAnalytics();
  }, []);

  const pieData = data?.vehicle_types_breakdown
    ? Object.entries(data.vehicle_types_breakdown).map(([name, value]) => ({
        name,
        value,
      }))
    : [
        { name: 'SUV', value: 42 },
        { name: 'Sedan', value: 28 },
        { name: 'Hatchback', value: 18 },
        { name: 'Truck', value: 7 },
        { name: 'Bus', value: 3 },
        { name: 'Motorcycle', value: 2 },
      ];

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl bg-command-surface border border-command-border shadow-xs">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-command-cyan">
            <BarChart3 className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-wide uppercase">
              CCTV Surveillance Analytics & Intelligence Trends
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              Aggregated ANPR Detections · Hourly Traffic Trends · District Ingest Volumes · Model Telemetry
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
          <span className="text-slate-600 dark:text-slate-300 font-bold">STATE TELEMETRY:</span>
          <span className="text-command-cyan font-bold">REAL-TIME INGEST</span>
        </div>
      </div>

      {/* Analytics KPI Ribbon */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="p-3.5 rounded-xl bg-command-surface border border-command-border shadow-xs">
          <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase font-bold">
            Total Scanned Today
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white font-mono mt-1">2.42M</div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono mt-1 flex items-center gap-1 font-bold">
            <TrendingUp className="h-3 w-3" /> +14.2% vs yesterday
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-command-surface border border-command-border shadow-xs">
          <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase font-bold">
            OCR Inference Latency
          </div>
          <div className="text-2xl font-black text-command-cyan font-mono mt-1">16.4 ms</div>
          <div className="text-[11px] text-slate-500 font-mono mt-1">TensorRT GPU Cluster</div>
        </div>

        <div className="p-3.5 rounded-xl bg-command-surface border border-command-border shadow-xs">
          <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase font-bold">
            Peak Surveillance Hour
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white font-mono mt-1">18:00 - 19:00</div>
          <div className="text-[11px] text-blue-600 dark:text-cyan-400 font-mono mt-1 font-bold">2,420 detections/hr</div>
        </div>

        <div className="p-3.5 rounded-xl bg-command-surface border border-command-border shadow-xs">
          <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase font-bold">
            Watchlist Correlation
          </div>
          <div className="text-2xl font-black text-rose-600 dark:text-rose-400 font-mono mt-1">99.8%</div>
          <div className="text-[11px] text-slate-500 font-mono mt-1">Instant Flagging SLA</div>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hourly Trend Line Chart */}
        <div className="bg-command-surface border border-command-border rounded-xl p-5 space-y-3 shadow-xs">
          <div className="flex items-center justify-between border-b border-command-border/60 pb-3">
            <div className="text-xs font-bold text-slate-900 dark:text-white uppercase font-mono tracking-wide">
              Hourly Vehicle Detection Volume (24h Trend)
            </div>
            <span className="text-[10px] text-command-cyan font-mono font-bold">Statewide Curve</span>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data?.hourly_trends || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.25} />
                <XAxis dataKey="hour" stroke="#64748B" fontSize={10} />
                <YAxis stroke="#64748B" fontSize={10} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderColor: '#334155',
                    color: '#F8FAFC',
                    borderRadius: '8px',
                    fontSize: '11px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="detections"
                  stroke="#0284C7"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: '#00E5FF' }}
                  activeDot={{ r: 6, fill: '#00E5FF' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* District Camera Count Bar Chart */}
        <div className="bg-command-surface border border-command-border rounded-xl p-5 space-y-3 shadow-xs">
          <div className="flex items-center justify-between border-b border-command-border/60 pb-3">
            <div className="text-xs font-bold text-slate-900 dark:text-white uppercase font-mono tracking-wide">
              Surveillance Load by District Jurisdiction
            </div>
            <span className="text-[10px] text-slate-500 font-mono">Active Nodes</span>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.districts || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.25} />
                <XAxis dataKey="district_name" stroke="#64748B" fontSize={10} />
                <YAxis stroke="#64748B" fontSize={10} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderColor: '#334155',
                    color: '#F8FAFC',
                    borderRadius: '8px',
                    fontSize: '11px',
                  }}
                />
                <Bar dataKey="camera_count" fill="#0284C7" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Vehicle Classification Breakdown Pie Chart */}
        <div className="bg-command-surface border border-command-border rounded-xl p-5 space-y-3 shadow-xs">
          <div className="flex items-center justify-between border-b border-command-border/60 pb-3">
            <div className="text-xs font-bold text-slate-900 dark:text-white uppercase font-mono tracking-wide">
              Vehicle Type Classification Distribution
            </div>
            <span className="text-[10px] text-slate-500 font-mono">YOLOv8 Detection Classes</span>
          </div>

          <div className="h-64 w-full flex items-center justify-center pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderColor: '#334155',
                    color: '#F8FAFC',
                    borderRadius: '8px',
                    fontSize: '11px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Active ANPR Cameras Table */}
        <div className="bg-command-surface border border-command-border rounded-xl p-5 space-y-3 shadow-xs">
          <div className="flex items-center justify-between border-b border-command-border/60 pb-3">
            <div className="text-xs font-bold text-slate-900 dark:text-white uppercase font-mono tracking-wide">
              Top Active Surveillance Checkpoints
            </div>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-bold">High Ingest Rate</span>
          </div>

          <div className="space-y-2 pt-1">
            {data?.top_cameras?.map((c: any) => (
              <div
                key={c.camera_code}
                className="p-3 rounded-lg bg-command-card border border-command-border flex items-center justify-between text-xs font-mono shadow-2xs"
              >
                <div>
                  <div className="text-slate-900 dark:text-white font-black">{c.camera_code}</div>
                  <div className="text-[11px] text-slate-500 truncate max-w-xs">{c.camera_name}</div>
                </div>
                <div className="text-right">
                  <div className="text-command-cyan font-bold">{c.event_count} events/hr</div>
                  <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">{c.status}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
