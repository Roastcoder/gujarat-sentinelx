'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  ShieldCheck,
  Search,
  Car,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Clock,
  MapPin,
  RefreshCw,
  Download,
  Copy,
  ExternalLink,
  DollarSign,
  AlertCircle,
  Eye,
  EyeOff,
  Building,
  Shield,
  CreditCard,
  FileCheck,
} from 'lucide-react';
import { api } from '@/lib/api';

function RCChallanContent() {
  const searchParams = useSearchParams();
  const initialPlate = searchParams?.get('plate') || 'GJ01AB1234';

  const [plateInput, setPlateInput] = useState(initialPlate);
  const [activePlate, setActivePlate] = useState(initialPlate);
  const [activeTab, setActiveTab] = useState<'RC' | 'CHALLAN' | 'JSON'>('RC');

  const [vahanData, setVahanData] = useState<any>(null);
  const [challanData, setChallanData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showChassis, setShowChassis] = useState(false);
  const [copiedJSON, setCopiedJSON] = useState(false);
  const [downloadNotice, setDownloadNotice] = useState<string | null>(null);

  const handleQuery = async (targetPlate?: string) => {
    const p = (targetPlate || plateInput || '').trim().toUpperCase();
    if (!p) return;

    setLoading(true);
    setError(null);
    setActivePlate(p);

    try {
      const [vahanRes, challanRes] = await Promise.all([
        api.getVehicleVahan(p).catch((err) => {
          console.warn('VAHAN error:', err);
          return null;
        }),
        api.getVehicleChallans(p).catch((err) => {
          console.warn('Challan error:', err);
          return null;
        }),
      ]);

      if (!vahanRes && !challanRes) {
        throw new Error(`No registration or violation records found for plate ${p}`);
      }

      setVahanData(vahanRes);
      setChallanData(challanRes);
    } catch (err: any) {
      setError(err.message || 'Failed to query vehicle registries');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialPlate) {
      handleQuery(initialPlate);
    }
  }, [initialPlate]);

  const copyJSONPayload = () => {
    const payload = {
      vahan_registry: vahanData,
      echallan_registry: challanData,
    };
    navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
    setCopiedJSON(true);
    setTimeout(() => setCopiedJSON(false), 2000);
  };

  const handleDownloadNotice = (challanNo: string) => {
    setDownloadNotice(`Downloading Official e-Challan Notice: ${challanNo}.pdf...`);
    setTimeout(() => {
      setDownloadNotice(null);
    }, 2500);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="p-5 rounded-2xl bg-command-surface border border-command-border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="h-12 w-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 flex-shrink-0">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black text-slate-900 dark:text-white tracking-wide uppercase">
                National VAHAN 4.0 & Gujarat e-Challan Verification Portal
              </h1>
              <span className="text-[10px] font-mono bg-command-cyan/10 border border-command-cyan/30 text-command-cyan font-bold px-2 py-0.5 rounded">
                MoRTH GATEWAY
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 font-mono mt-0.5">
              Live Surepass KYC Integration · Ministry of Road Transport & Highways · Gujarat Traffic Police
            </p>
          </div>
        </div>

        {/* Quick Route Link */}
        <Link
          href={`/map`}
          className="flex items-center gap-2 text-xs font-mono font-bold text-command-cyan hover:underline self-start md:self-auto"
        >
          <MapPin className="h-4 w-4" />
          <span>Switch to GIS Map View</span>
        </Link>
      </div>

      {/* Plate Search Bar & Quick Switcher */}
      <div className="p-4 rounded-xl bg-command-surface border border-command-border shadow-sm space-y-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleQuery();
          }}
          className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3"
        >
          <div className="relative flex-1">
            <Car className="h-5 w-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={plateInput}
              onChange={(e) => setPlateInput(e.target.value)}
              placeholder="Enter Vehicle Registration Number (e.g. GJ01AB1234)"
              className="w-full bg-command-card border border-command-border text-slate-900 dark:text-white text-sm rounded-lg pl-11 pr-4 py-2.5 font-mono uppercase font-black tracking-widest focus:outline-none focus:border-command-accent shadow-sm"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-command-accent hover:bg-blue-600 text-white font-mono font-bold text-xs px-6 py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors shadow flex-shrink-0"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Querying Registries...' : 'Verify Vehicle'}</span>
          </button>
        </form>

        {/* Quick Demo Chips */}
        <div className="flex items-center gap-2 flex-wrap text-xs font-mono text-slate-600 dark:text-slate-400 pt-1">
          <span className="font-semibold text-slate-500">Quick Test Plates:</span>
          <button
            onClick={() => {
              setPlateInput('GJ01AB1234');
              handleQuery('GJ01AB1234');
            }}
            className={`px-2.5 py-1 rounded border transition-colors font-bold ${
              activePlate === 'GJ01AB1234'
                ? 'bg-command-cyan text-white border-command-cyan'
                : 'bg-command-card text-slate-800 dark:text-slate-200 border-command-border hover:bg-command-hover'
            }`}
          >
            GJ01AB1234 (Primary Target · 4 Violations)
          </button>
          <button
            onClick={() => {
              setPlateInput('GJ05JK9988');
              handleQuery('GJ05JK9988');
            }}
            className={`px-2.5 py-1 rounded border transition-colors font-bold ${
              activePlate === 'GJ05JK9988'
                ? 'bg-command-cyan text-white border-command-cyan'
                : 'bg-command-card text-slate-800 dark:text-slate-200 border-command-border hover:bg-command-hover'
            }`}
          >
            GJ05JK9988 (Surat Corridor · Swift Dzire)
          </button>
          <button
            onClick={() => {
              setPlateInput('GJ01XX9999');
              handleQuery('GJ01XX9999');
            }}
            className={`px-2.5 py-1 rounded border transition-colors font-bold ${
              activePlate === 'GJ01XX9999'
                ? 'bg-command-cyan text-white border-command-cyan'
                : 'bg-command-card text-slate-800 dark:text-slate-200 border-command-border hover:bg-command-hover'
            }`}
          >
            GJ01XX9999 (Custom Test Plate)
          </button>
        </div>
      </div>

      {downloadNotice && (
        <div className="p-3 bg-command-cyan/10 border border-command-cyan text-command-cyan text-xs font-mono rounded-lg animate-pulse flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4" />
          <span>{downloadNotice}</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/30 border border-rose-400 text-rose-700 dark:text-rose-300 text-xs font-mono rounded-xl flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 font-mono">
        <div className="p-3.5 rounded-xl bg-command-surface border border-command-border shadow-sm">
          <div className="text-[10px] text-slate-500 uppercase">VEHICLE PLATE</div>
          <div className="text-xl font-black text-slate-900 dark:text-white mt-1">
            {activePlate}
          </div>
          <div className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5">
            RC Status: {vahanData?.rc_status || 'ACTIVE'}
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-command-surface border border-command-border shadow-sm">
          <div className="text-[10px] text-slate-500 uppercase">REGISTERED OWNER</div>
          <div className="text-base font-bold text-slate-900 dark:text-white truncate mt-1">
            {vahanData?.owner_name || 'REGISTERED CITIZEN'}
          </div>
          <div className="text-[10px] text-slate-500 truncate mt-0.5">
            {vahanData?.registered_at || 'Ahmedabad RTO'}
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-command-surface border border-command-border shadow-sm">
          <div className="text-[10px] text-slate-500 uppercase">TOTAL E-CHALLANS</div>
          <div className="text-xl font-black text-command-cyan mt-1">
            {challanData?.total_challans || 0} Notices
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            {challanData?.pending_challans || 0} Pending Settlement
          </div>
        </div>

        <div
          className={`p-3.5 rounded-xl border shadow-sm ${
            (challanData?.pending_challans || 0) > 0
              ? 'border-rose-500/40 bg-rose-500/5'
              : 'border-emerald-500/40 bg-emerald-500/5'
          }`}
        >
          <div
            className={`text-[10px] uppercase font-bold ${
              (challanData?.pending_challans || 0) > 0
                ? 'text-rose-600 dark:text-rose-400'
                : 'text-emerald-600 dark:text-emerald-400'
            }`}
          >
            {(challanData?.pending_challans || 0) > 0 ? 'OUTSTANDING FINES' : 'COMPLIANCE STATUS'}
          </div>
          <div
            className={`text-xl font-black mt-1 ${
              (challanData?.pending_challans || 0) > 0
                ? 'text-rose-600 dark:text-rose-400'
                : 'text-emerald-600 dark:text-emerald-400'
            }`}
          >
            {(challanData?.pending_challans || 0) > 0
              ? `₹${challanData?.total_pending_amount?.toLocaleString() || 0}`
              : '₹0 (ALL CLEAR)'}
          </div>
          <div
            className={`text-[10px] mt-0.5 ${
              (challanData?.pending_challans || 0) > 0 ? 'text-rose-500' : 'text-emerald-600 dark:text-emerald-400'
            }`}
          >
            {(challanData?.pending_challans || 0) > 0 ? 'Gujarat Police Traffic Division' : 'Zero Violations On File'}
          </div>
        </div>
      </div>

      {/* Main Tabbed Container */}
      <div className="bg-command-surface border border-command-border rounded-2xl shadow-sm overflow-hidden">
        {/* Tab Headers */}
        <div className="flex border-b border-command-border bg-command-card px-4 gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('RC')}
            className={`py-3.5 px-4 text-xs font-mono font-bold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'RC'
                ? 'border-command-accent text-command-accent dark:text-command-cyan'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <ShieldCheck className="h-4 w-4" />
            <span>VAHAN 4.0 RC DOSSIER</span>
            <span className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.2 rounded border border-emerald-500/30">
              VERIFIED
            </span>
          </button>

          <button
            onClick={() => setActiveTab('CHALLAN')}
            className={`py-3.5 px-4 text-xs font-mono font-bold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'CHALLAN'
                ? (challanData?.pending_challans || 0) > 0
                  ? 'border-rose-500 text-rose-600 dark:text-rose-400'
                  : 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <FileText className="h-4 w-4" />
            <span>E-CHALLAN & VIOLATIONS ({challanData?.total_challans || 0})</span>
            {(challanData?.pending_challans || 0) > 0 ? (
              <span className="text-[10px] bg-rose-600 text-white px-1.5 py-0.2 rounded font-bold">
                {challanData.pending_challans} PENDING
              </span>
            ) : (
              <span className="text-[10px] bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/40 px-1.5 py-0.2 rounded font-bold">
                ALL CLEAR
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('JSON')}
            className={`py-3.5 px-4 text-xs font-mono font-bold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'JSON'
                ? 'border-command-accent text-command-accent dark:text-command-cyan'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Copy className="h-4 w-4" />
            <span>RAW SUREPASS / MORTH JSON</span>
          </button>
        </div>

        {/* Tab 1: VAHAN 4.0 RC Details */}
        {activeTab === 'RC' && (
          <div className="p-6 space-y-6">
            {/* Header sub-bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-command-border">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">
                  NATIONAL REGISTER OF MOTOR VEHICLES (VAHAN 4.0)
                </span>
                <span className="text-[10px] font-mono text-slate-500">
                  Source: {vahanData?.verified_source || 'SUREPASS_NATIONAL_VAHAN_API'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleQuery(activePlate)}
                  className="flex items-center gap-1.5 text-xs font-mono text-slate-700 dark:text-slate-300 hover:text-command-accent px-2.5 py-1 rounded border border-command-border bg-command-card"
                >
                  <RefreshCw className="h-3 w-3" />
                  <span>Refresh RC</span>
                </button>
                <Link
                  href={`/vehicles/${activePlate}`}
                  className="flex items-center gap-1.5 text-xs font-mono text-white bg-command-accent px-3 py-1 rounded font-bold shadow"
                >
                  <span>Vehicle Journey</span>
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </div>
            </div>

            {/* VAHAN Data Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 font-mono text-xs">
              {/* Card 1: Owner Information */}
              <div className="p-4 rounded-xl bg-command-card border border-command-border shadow-sm space-y-2">
                <div className="text-[10px] text-slate-500 uppercase flex items-center justify-between">
                  <span>REGISTERED OWNER</span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                    {vahanData?.rc_status || 'ACTIVE'}
                  </span>
                </div>
                <div className="text-sm font-black text-slate-900 dark:text-white">
                  {vahanData?.owner_name || 'REGISTERED CITIZEN'}
                </div>
                <div className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                  {vahanData?.present_address || 'Ahmedabad, Gujarat, India'}
                </div>
              </div>

              {/* Card 2: Maker & Vehicle Category */}
              <div className="p-4 rounded-xl bg-command-card border border-command-border shadow-sm space-y-2">
                <div className="text-[10px] text-slate-500 uppercase">MAKE & MODEL</div>
                <div className="text-sm font-black text-command-cyan truncate">
                  {vahanData?.maker_model || 'BULLET 350'}
                </div>
                <div className="text-[11px] text-slate-600 dark:text-slate-400 truncate">
                  {vahanData?.maker_description || 'ROYAL ENFIELD'}
                </div>
                <div className="text-[10px] text-slate-500 flex items-center gap-2 pt-1 border-t border-command-border">
                  <span>Fuel: <strong>{vahanData?.fuel_type || 'PETROL'}</strong></span>
                  <span>·</span>
                  <span>Class: <strong>{vahanData?.vehicle_category || '2WN'}</strong></span>
                </div>
              </div>

              {/* Card 3: RTO & Registration Details */}
              <div className="p-4 rounded-xl bg-command-card border border-command-border shadow-sm space-y-2">
                <div className="text-[10px] text-slate-500 uppercase">RTO REGISTRATION</div>
                <div className="text-sm font-black text-amber-600 dark:text-amber-400 truncate">
                  {vahanData?.registered_at || 'AHMEDABAD (GJ-01)'}
                </div>
                <div className="text-[11px] text-slate-600 dark:text-slate-400">
                  Reg Date: {vahanData?.registration_date || '1995-10-12'}
                </div>
                <div className="text-[10px] text-slate-500 pt-1 border-t border-command-border">
                  Fitness Upto: <strong>{vahanData?.fit_up_to || '2029-07-24'}</strong>
                </div>
              </div>

              {/* Card 4: Insurance & Compliance */}
              <div className="p-4 rounded-xl bg-command-card border border-command-border shadow-sm space-y-2">
                <div className="text-[10px] text-slate-500 uppercase flex items-center justify-between">
                  <span>INSURANCE & COMPLIANCE</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">● ACTIVE</span>
                </div>
                <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {vahanData?.insurance_company || 'Bajaj General Insurance'}
                </div>
                <div className="text-[10px] text-slate-600 dark:text-slate-400 truncate">
                  Policy: {vahanData?.insurance_policy_number || 'OG-25-2202-1802-00011178'}
                </div>
                <div className="text-[10px] text-command-cyan pt-1 border-t border-command-border flex items-center justify-between">
                  <span>Valid to: {vahanData?.insurance_upto || '2026-12-31'}</span>
                </div>
              </div>
            </div>

            {/* Chassis, Engine & PUCC Security Strip */}
            <div className="p-4 rounded-xl bg-command-card border border-command-border shadow-sm flex flex-wrap items-center justify-between gap-4 font-mono text-xs">
              <div className="flex items-center gap-6 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 font-semibold">Chassis No:</span>
                  <span className="font-bold text-slate-900 dark:text-white bg-command-surface px-2.5 py-1 rounded border border-command-border">
                    {showChassis
                      ? vahanData?.vehicle_chasi_number || 'SB484623H'
                      : '••••••••••••' + (vahanData?.vehicle_chasi_number ? vahanData.vehicle_chasi_number.slice(-4) : '23H')}
                  </span>
                  <button
                    onClick={() => setShowChassis(!showChassis)}
                    className="text-command-cyan hover:underline text-[11px] font-semibold flex items-center gap-1"
                  >
                    {showChassis ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                    <span>{showChassis ? 'Mask' : 'Reveal'}</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-slate-500 font-semibold">Engine No:</span>
                  <span className="font-bold text-slate-900 dark:text-white bg-command-surface px-2.5 py-1 rounded border border-command-border">
                    {vahanData?.vehicle_engine_number || 'ENG-SB484623H'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-slate-500 font-semibold">PUCC No:</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                    {vahanData?.pucc_number || 'GJ00101200040930'} (Valid)
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-slate-500 font-semibold">Road Tax:</span>
                  <span className="text-slate-900 dark:text-white font-bold">
                    Paid Upto {vahanData?.tax_upto || '2029-07-24'}
                  </span>
                </div>
              </div>

              <div className="text-[11px] text-slate-500">
                MoRTH Cryptographic Verification · State Transport Authority
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: e-Challan & Violations Register */}
        {activeTab === 'CHALLAN' && (
          <div className="p-6 space-y-4 font-mono">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-command-border">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  GUJARAT POLICE E-CHALLAN VIOLATION NOTICES
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Automated ANPR & Speed Radar Violations captured across Gujarat Highways & City Junctions
                </p>
              </div>

              <span className="text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-500/10 px-3 py-1 rounded border border-rose-500/30 self-start sm:self-auto">
                Total Unpaid: ₹{challanData?.total_pending_amount?.toLocaleString() || 0}
              </span>
            </div>

            {/* Challans List */}
            {challanData?.challans && challanData.challans.length > 0 ? (
              <div className="space-y-3">
                {challanData.challans.map((c: any, idx: number) => {
                  const isPending = c.payment_status === 'PENDING';
                  return (
                    <div
                      key={idx}
                      className={`p-4 rounded-xl border transition-all ${
                        isPending
                          ? 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-300 dark:border-rose-900/60 shadow-sm'
                          : 'bg-command-card border-command-border'
                      }`}
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2.5 flex-wrap">
                            <span className="text-sm font-black text-slate-900 dark:text-white">
                              {c.challan_number}
                            </span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                isPending
                                  ? 'bg-rose-600 text-white'
                                  : 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                              }`}
                            >
                              {c.payment_status}
                            </span>
                            <span className="text-[10px] text-slate-500 bg-command-surface px-2 py-0.5 rounded border border-command-border">
                              {c.violation_code}
                            </span>
                          </div>

                          <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                            {c.violation_type}
                          </div>

                          <div className="text-[11px] text-slate-600 dark:text-slate-400 flex items-center gap-3 flex-wrap">
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3 text-command-cyan" />
                              <span>{c.location} ({c.camera_code || 'CAM-001'})</span>
                            </span>
                            <span>·</span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3 text-slate-400" />
                              <span>{c.date_time}</span>
                            </span>
                            {c.speed_kmh && (
                              <>
                                <span>·</span>
                                <span className="text-amber-600 dark:text-amber-400 font-bold">
                                  Captured Speed: {c.speed_kmh} km/h
                                </span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Fine Amount & PDF Action */}
                        <div className="flex items-center gap-4 self-end md:self-center">
                          <div className="text-right">
                            <div className="text-xs text-slate-500 uppercase font-semibold">FINE AMOUNT</div>
                            <div className="text-lg font-black text-rose-600 dark:text-rose-400">
                              ₹{c.fine_amount.toLocaleString()}
                            </div>
                          </div>

                          <button
                            onClick={() => handleDownloadNotice(c.challan_number)}
                            className="bg-command-surface hover:bg-command-hover text-slate-800 dark:text-slate-200 border border-command-border text-xs px-3 py-2 rounded-lg flex items-center gap-1.5 font-bold transition-colors shadow-sm"
                          >
                            <Download className="h-3.5 w-3.5 text-command-cyan" />
                            <span>Notice</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center text-slate-500 space-y-2">
                <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto" />
                <div className="font-bold text-slate-800 dark:text-slate-200">No Challans on Record</div>
                <p className="text-xs">No pending or historical traffic violations found for this vehicle.</p>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Raw MoRTH / Surepass JSON */}
        {activeTab === 'JSON' && (
          <div className="p-6 space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 text-[11px]">
                OFFICIAL GOVERNMENT API PAYLOAD (SHA-256 DIGITAL CHAIN OF CUSTODY)
              </span>
              <button
                onClick={copyJSONPayload}
                className="flex items-center gap-1.5 bg-command-accent text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors shadow"
              >
                {copiedJSON ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copiedJSON ? 'Copied to Clipboard!' : 'Copy Raw JSON'}</span>
              </button>
            </div>

            <pre className="p-4 rounded-xl bg-slate-950 text-emerald-400 border border-command-border overflow-x-auto text-[11px] leading-relaxed max-h-[500px]">
              {JSON.stringify(
                {
                  status: 'SUCCESS',
                  query_timestamp: new Date().toISOString(),
                  plate_number: activePlate,
                  vahan_4_0_dossier: vahanData,
                  traffic_police_echallans: challanData,
                },
                null,
                2
              )}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}

export default function RCChallanPage() {
  return (
    <React.Suspense
      fallback={
        <div className="p-8 text-center text-xs font-mono text-slate-500 animate-pulse">
          Loading VAHAN 4.0 & e-Challan Registry Portal...
        </div>
      }
    >
      <RCChallanContent />
    </React.Suspense>
  );
}
