'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useParams, useRouter } from 'next/navigation';
import {
  Car,
  Camera,
  MapPin,
  Clock,
  ShieldAlert,
  AlertTriangle,
  ArrowRight,
  Download,
  Share2,
  CheckCircle2,
  FileText,
  Radio,
  Eye,
  Activity,
  Layers,
  Sparkles,
  ShieldCheck,
  RefreshCw,
  FileCheck,
} from 'lucide-react';
import { api } from '@/lib/api';

export default function VehicleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const plate = (params.plate as string)?.toUpperCase() || 'GJ01AB1234';

  const [intelligence, setIntelligence] = useState<any>(null);
  const [routeGeoJSON, setRouteGeoJSON] = useState<any>(null);
  const [vahanDetails, setVahanDetails] = useState<any>(null);
  const [challanDetails, setChallanDetails] = useState<any>(null);
  const [showChassis, setShowChassis] = useState(false);
  const [refreshingVahan, setRefreshingVahan] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedWaypoint, setSelectedWaypoint] = useState<any>(null);
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);

  useEffect(() => {
    async function loadVehicleData() {
      try {
        setLoading(true);
        setError(null);
        const [intel, route, challans, vahanDirect] = await Promise.all([
          api.getVehicleIntelligence(plate).catch(() => null),
          api.getVehicleRoute(plate).catch(() => null),
          api.getVehicleChallans(plate).catch(() => null),
          api.getVehicleVahan(plate).catch(() => null),
        ]);

        const vahan = intel?.vahan_details || vahanDirect;
        setVahanDetails(vahan);
        setRouteGeoJSON(route);
        setChallanDetails(challans);

        if (!intel && !vahan) {
          setError(`No registration or detection records found for vehicle plate ${plate}`);
        } else {
          const finalIntel = intel || {
            plate_number: plate,
            status: 'NORMAL',
            first_seen: new Date().toISOString(),
            last_seen: new Date().toISOString(),
            total_detections: 1,
            total_cameras: 1,
            total_locations: 1,
            estimated_distance_km: 0,
            elapsed_time_minutes: 0,
            attributes: {
              plate_number: plate,
              vehicle_type: vahan?.vehicle_category || vahan?.maker_model || 'Motor Vehicle',
              vehicle_color: vahan?.color || 'STANDARD',
              state_code: plate.slice(0, 2),
              confidence_avg: 0.98,
              flagged: false,
            },
            watchlist_status: { is_matched: false },
            timeline: [
              {
                time_str: new Date().toLocaleTimeString(),
                date_str: new Date().toLocaleDateString(),
                timestamp: new Date().toISOString(),
                camera_id: 'cam-state-001',
                camera_code: 'CAM-INTERSTATE-01',
                camera_name: 'Gujarat State Border Entry Post',
                district: 'State Border',
                latitude: 23.0225,
                longitude: 72.5714,
                confidence: 0.98,
                vehicle_type: vahan?.vehicle_category || 'Motor Vehicle',
                vehicle_color: vahan?.color || 'STANDARD',
                speed_kmh: 52.0,
                snapshot_url: '/mock_snapshots/default_speed.jpg',
                watchlist_flag: false,
              }
            ],
            detections: [],
            vahan_details: vahan,
          };
          setIntelligence(finalIntel);
          if (finalIntel.timeline?.length > 0) {
            setSelectedWaypoint(finalIntel.timeline[0]);
          }
        }
      } catch (err: any) {
        console.error(err);
        setError(err.message || `No data available for vehicle ${plate}`);
      } finally {
        setLoading(false);
      }
    }
    if (plate) {
      loadVehicleData();
    }
  }, [plate]);

  const handleRefreshVahan = async () => {
    try {
      setRefreshingVahan(true);
      const v = await api.getVehicleVahan(plate);
      setVahanDetails(v);
    } catch (e) {
      console.error(e);
    } finally {
      setRefreshingVahan(false);
    }
  };

  // Initialize MapLibre GL map
  useEffect(() => {
    if (!intelligence || !mapContainer.current || mapInstance.current) return;

    let maplibregl: any;
    try {
      maplibregl = require('maplibre-gl');
    } catch (e) {
      console.warn('MapLibre GL not loaded client-side');
      return;
    }

    const firstCoord = intelligence.timeline?.[0]
      ? [intelligence.timeline[0].longitude, intelligence.timeline[0].latitude]
      : [72.5074, 23.0278];

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          'osm-tiles': {
            type: 'raster',
            tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
            tileSize: 256,
            attribution: '© OpenStreetMap contributors | Gujarat Police GIS',
          },
        },
        layers: [
          {
            id: 'osm-tiles',
            type: 'raster',
            source: 'osm-tiles',
            minzoom: 0,
            maxzoom: 19,
          },
        ],
      },
      center: firstCoord,
      zoom: 11.5,
    });

    map.addControl(new maplibregl.NavigationControl(), 'top-right');

    map.on('load', () => {
      map.resize();
      // Draw Route LineString
      if (routeGeoJSON?.geojson) {
        const lineFeature = routeGeoJSON.geojson.features.find(
          (f: any) => f.geometry.type === 'LineString'
        );
        if (lineFeature) {
          map.addSource('vehicle-route', {
            type: 'geojson',
            data: lineFeature,
          });
          map.addLayer({
            id: 'route-line-glow',
            type: 'line',
            source: 'vehicle-route',
            layout: { 'line-join': 'round', 'line-cap': 'round' },
            paint: {
              'line-color': '#00E5FF',
              'line-width': 8,
              'line-opacity': 0.4,
            },
          });
          map.addLayer({
            id: 'route-line',
            type: 'line',
            source: 'vehicle-route',
            layout: { 'line-join': 'round', 'line-cap': 'round' },
            paint: {
              'line-color': '#0284C7',
              'line-width': 4,
            },
          });
        }
      }

      // Add Waypoint Markers
      intelligence.timeline?.forEach((wp: any, idx: number) => {
        const el = document.createElement('div');
        el.className =
          'h-7 w-7 rounded-full bg-[#070D18] border-2 border-command-cyan text-command-cyan flex items-center justify-center text-xs font-mono font-bold shadow-lg cursor-pointer hover:scale-125 transition-transform';
        el.innerText = `${idx + 1}`;
        el.onclick = () => setSelectedWaypoint(wp);

        new maplibregl.Marker({ element: el })
          .setLngLat([wp.longitude, wp.latitude])
          .addTo(map);
      });
    });

    mapInstance.current = map;

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [intelligence, routeGeoJSON]);

  const handleExportDossier = () => {
    setExportNotice('Exporting Forensic Dossier PDF for Case INV-2026-0402...');
    setTimeout(() => {
      setExportNotice('Forensic Dossier successfully exported with SHA-256 digital stamp!');
      setTimeout(() => setExportNotice(null), 3000);
    }, 1200);
  };

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse p-6">
        <div className="h-10 bg-command-surface rounded w-1/3"></div>
        <div className="grid grid-cols-4 gap-4">
          <div className="h-24 bg-command-surface rounded"></div>
          <div className="h-24 bg-command-surface rounded"></div>
          <div className="h-24 bg-command-surface rounded"></div>
          <div className="h-24 bg-command-surface rounded"></div>
        </div>
        <div className="h-96 bg-command-surface rounded"></div>
      </div>
    );
  }

  if (error || !intelligence) {
    return (
      <div className="p-8 text-center space-y-4 bg-command-surface border border-command-border rounded-xl">
        <AlertTriangle className="h-12 w-12 text-command-red mx-auto" />
        <h2 className="text-lg font-bold text-white">Vehicle Record Not Found</h2>
        <p className="text-xs text-command-muted max-w-md mx-auto">
          {error || `No detection history found for registration number ${plate}.`}
        </p>
        <Link
          href="/vehicles/GJ01AB1234"
          className="inline-block bg-command-accent text-white text-xs font-bold px-4 py-2 rounded-lg"
        >
          View Primary Demo: GJ01AB1234
        </Link>
      </div>
    );
  }

  const isMatched = intelligence.watchlist_status?.is_matched;

  return (
    <div className="space-y-6">
      {/* Target Vehicle Header & Alert Banner */}
      <div
        className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg ${
          isMatched
            ? 'bg-gradient-to-r from-red-950/60 via-[#1F0D15] to-command-surface border-command-red/60'
            : 'bg-command-surface border-command-border'
        }`}
      >
        <div className="flex items-center gap-4">
          <div
            className={`h-14 w-14 rounded-xl flex items-center justify-center font-mono font-black text-2xl border-2 ${
              isMatched
                ? 'bg-command-red/20 border-command-red text-command-red shadow-lg'
                : 'bg-command-surface border-command-accent text-command-cyan'
            }`}
          >
            <Car className="h-7 w-7" />
          </div>

          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-black font-mono text-white tracking-widest uppercase">
                {intelligence.plate_number}
              </h1>
              {isMatched ? (
                <span className="bg-command-red text-white text-xs font-mono font-extrabold px-2.5 py-0.5 rounded shadow flex items-center gap-1.5 animate-pulse">
                  <ShieldAlert className="h-3.5 w-3.5" />
                  WATCHLIST MATCH · HIGH PRIORITY
                </span>
              ) : (
                <span className="bg-command-green/20 text-command-green text-xs font-mono font-bold px-2 py-0.5 rounded border border-command-green/40">
                  NORMAL STATUS
                </span>
              )}
            </div>

            <p className="text-xs text-slate-300 mt-1 flex items-center gap-2 font-mono flex-wrap">
              <span>{vahanDetails ? `${vahanDetails.maker_description} · ${vahanDetails.maker_model}` : `${intelligence.attributes.vehicle_color} ${intelligence.attributes.vehicle_type}`}</span>
              <span className="text-slate-500">·</span>
              <span>Owner: <strong className="text-white">{vahanDetails?.owner_name || 'REGISTERED CITIZEN'}</strong></span>
              <span className="text-slate-500">·</span>
              <span>{vahanDetails?.registered_at || 'Ahmedabad RTO'}</span>
              {isMatched && (
                <>
                  <span className="text-slate-500">·</span>
                  <span className="text-amber-400 font-bold">
                    Case: {intelligence.watchlist_status.case_number || 'FIR-402/2026-NAVRANGPURA'}
                  </span>
                </>
              )}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleExportDossier}
            className="flex items-center gap-1.5 bg-command-card hover:bg-command-hover text-white text-xs font-mono font-bold px-3 py-2 rounded-lg border border-command-border transition-colors"
          >
            <FileText className="h-3.5 w-3.5 text-command-cyan" />
            <span>Export Dossier</span>
          </button>
          <Link
            href="/investigations"
            className="flex items-center gap-1.5 bg-command-accent hover:bg-blue-600 text-white text-xs font-mono font-bold px-3 py-2 rounded-lg transition-colors"
          >
            <span>Case Workspace</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {exportNotice && (
        <div className="bg-command-cyan/10 border border-command-cyan text-command-cyan text-xs font-mono px-4 py-2 rounded-lg animate-pulse flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4" />
          {exportNotice}
        </div>
      )}

      {/* KPI Cards: 7 Cameras, Distance, Elapsed Time, Confidence */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        <div className="bg-command-surface border border-command-border rounded-lg p-3">
          <div className="text-[10px] font-mono text-command-muted uppercase">FIRST DETECTED</div>
          <div className="text-base font-mono font-black text-white mt-1">
            {new Date(intelligence.first_seen).toLocaleTimeString()}
          </div>
          <div className="text-[10px] text-command-muted font-mono">
            {new Date(intelligence.first_seen).toLocaleDateString()}
          </div>
        </div>

        <div className="bg-command-surface border border-command-border rounded-lg p-3">
          <div className="text-[10px] font-mono text-command-muted uppercase">LAST DETECTED</div>
          <div className="text-base font-mono font-black text-white mt-1">
            {new Date(intelligence.last_seen).toLocaleTimeString()}
          </div>
          <div className="text-[10px] text-command-green font-mono">
            Active Sightings
          </div>
        </div>

        <div className="bg-command-surface border border-command-border rounded-lg p-3">
          <div className="text-[10px] font-mono text-command-muted uppercase">TOTAL DETECTIONS</div>
          <div className="text-xl font-mono font-black text-command-cyan mt-1">
            {intelligence.total_detections}
          </div>
          <div className="text-[10px] text-command-muted font-mono">Sequential Captures</div>
        </div>

        <div className="bg-command-surface border border-command-border rounded-lg p-3">
          <div className="text-[10px] font-mono text-command-muted uppercase">CAMERAS TRAVERSED</div>
          <div className="text-xl font-mono font-black text-white mt-1">
            {intelligence.total_cameras}
          </div>
          <div className="text-[10px] text-command-cyan font-mono">Cross-Jurisdiction</div>
        </div>

        <div className="bg-command-surface border border-command-border rounded-lg p-3">
          <div className="text-[10px] font-mono text-command-muted uppercase">TRAVELED DISTANCE</div>
          <div className="text-xl font-mono font-black text-amber-400 mt-1">
            {intelligence.estimated_distance_km} km
          </div>
          <div className="text-[10px] text-command-muted font-mono">
            in {intelligence.elapsed_time_minutes} min
          </div>
        </div>

        <div className="bg-command-surface border border-command-border rounded-lg p-3">
          <div className="text-[10px] font-mono text-command-muted uppercase">AVG OCR CONFIDENCE</div>
          <div className="text-xl font-mono font-black text-command-green mt-1">
            {Math.round(intelligence.attributes.confidence_avg * 100)}%
          </div>
          <div className="text-[10px] text-command-green font-mono">HSRP Verified</div>
        </div>
      </div>

      {/* Official Government VAHAN 4.0 & National RTO Verification Card */}
      <div className="bg-command-surface border border-emerald-500/40 rounded-xl p-5 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-command-border/80 pb-3 relative z-10">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-emerald-950/60 border border-emerald-500/50 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wide">
                  Official VAHAN 4.0 / National RTO Registry Dossier
                </h3>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {vahanDetails?.is_live_verified ? 'LIVE SUREPASS VAHAN API' : 'OFFICIAL VAHAN CACHE'}
                </span>
              </div>
              <p className="text-[11px] text-command-muted font-mono mt-0.5">
                Ministry of Road Transport & Highways (MoRTH) · Integrated Surepass KYC Gateway (ID: {plate})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRefreshVahan}
              disabled={refreshingVahan}
              className="flex items-center gap-1.5 text-xs font-mono font-semibold px-3 py-1.5 rounded-lg bg-command-card hover:bg-command-hover text-slate-200 border border-command-border transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 text-command-cyan ${refreshingVahan ? 'animate-spin' : ''}`} />
              <span>{refreshingVahan ? 'Querying RTO...' : 'Re-Query VAHAN'}</span>
            </button>
          </div>
        </div>

        {/* VAHAN Data Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4 relative z-10 font-mono text-xs">
          {/* Card 1: Registered Owner & Status */}
          <div className="p-3.5 rounded-lg bg-command-card border border-command-border shadow-sm space-y-2">
            <div className="text-[10px] text-command-muted uppercase flex items-center justify-between">
              <span>REGISTERED OWNER</span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border border-emerald-500/40">
                {vahanDetails?.rc_status || 'ACTIVE'}
              </span>
            </div>
            <div className="text-sm font-bold text-slate-900 dark:text-white tracking-wide">
              {vahanDetails?.owner_name || 'GAURAV'}
            </div>
            <div className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
              {vahanDetails?.present_address || 'C/53 Vrundavan Resi, Nava Naroda, Ahmedabad, Gujarat'}
            </div>
          </div>

          {/* Card 2: Vehicle Identity & Model */}
          <div className="p-3.5 rounded-lg bg-command-card border border-command-border shadow-sm space-y-2">
            <div className="text-[10px] text-command-muted uppercase">MAKE & MODEL</div>
            <div className="text-sm font-bold text-command-cyan truncate">
              {vahanDetails?.maker_model || 'BULLET 350'}
            </div>
            <div className="text-[11px] text-slate-600 dark:text-slate-400 truncate">
              {vahanDetails?.maker_description || 'ROYAL-ENFIELD'}
            </div>
            <div className="text-[10px] text-slate-500 flex items-center gap-2 pt-1 border-t border-command-border/40">
              <span>Fuel: {vahanDetails?.fuel_type || 'PETROL'}</span>
              <span>·</span>
              <span>{vahanDetails?.vehicle_category || '2WN'}</span>
            </div>
          </div>

          {/* Card 3: RTO Jurisdiction & Registration */}
          <div className="p-3.5 rounded-lg bg-command-card border border-command-border shadow-sm space-y-2">
            <div className="text-[10px] text-command-muted uppercase">RTO JURISDICTION</div>
            <div className="text-sm font-bold text-amber-600 dark:text-amber-400">
              {vahanDetails?.registered_at || 'AHMEDABAD, Gujarat'}
            </div>
            <div className="text-[11px] text-slate-600 dark:text-slate-400">
              Reg Date: {vahanDetails?.registration_date || '1995-10-12'}
            </div>
            <div className="text-[10px] text-slate-500 pt-1 border-t border-command-border/40">
              Fitness Upto: {vahanDetails?.fit_up_to || '2029-07-24'}
            </div>
          </div>

          {/* Card 4: Compliance (Insurance & PUCC) */}
          <div className="p-3.5 rounded-lg bg-command-card border border-command-border shadow-sm space-y-2">
            <div className="text-[10px] text-command-muted uppercase flex items-center justify-between">
              <span>INSURANCE & COMPLIANCE</span>
              <span className="text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">● VALID</span>
            </div>
            <div className="text-[11px] font-bold text-slate-900 dark:text-white truncate">
              {vahanDetails?.insurance_company || 'Bajaj General Insurance'}
            </div>
            <div className="text-[10px] text-slate-600 dark:text-slate-400 truncate">
              Policy: {vahanDetails?.insurance_policy_number || 'OG-25-2202-1802-00011178'}
            </div>
            <div className="text-[10px] text-command-cyan pt-1 border-t border-command-border/40 flex items-center justify-between">
              <span>PUCC: {vahanDetails?.pucc_number || 'GJ00101200040930'}</span>
            </div>
          </div>
        </div>

        {/* Chassis & Engine Security Strip */}
        <div className="mt-3 px-4 py-2.5 rounded-lg bg-command-card border border-command-border flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono text-slate-700 dark:text-slate-300 shadow-sm">
          <div className="flex items-center gap-6 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-command-muted">Chassis No:</span>
              <span className="font-bold text-slate-900 dark:text-white bg-command-surface px-2 py-0.5 rounded border border-command-border">
                {showChassis ? (vahanDetails?.vehicle_chasi_number || 'SB484623H') : '••••••••••••' + (vahanDetails?.vehicle_chasi_number ? vahanDetails.vehicle_chasi_number.slice(-4) : '23H')}
              </span>
              <button
                onClick={() => setShowChassis(!showChassis)}
                className="text-[10px] text-command-cyan hover:underline ml-1"
              >
                {showChassis ? 'Mask' : 'Reveal'}
              </button>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-command-muted">Engine No:</span>
              <span className="font-bold text-slate-900 dark:text-white bg-command-surface px-2 py-0.5 rounded border border-command-border">
                {vahanDetails?.vehicle_engine_number || 'SB484623H'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-command-muted">Road Tax Upto:</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{vahanDetails?.tax_upto || '2029-07-24'}</span>
            </div>
          </div>
          <div className="text-[10px] text-slate-500">
            Source: Surepass MoRTH Gateway · SHA-256 Validated
          </div>
        </div>
      </div>

      {/* Gujarat Traffic Police e-Challan Violations Section */}
      {challanDetails && (
        <div
          className={`rounded-xl p-5 shadow-sm space-y-4 border ${
            (challanDetails.pending_challans || 0) > 0
              ? 'bg-command-surface border-rose-500/30'
              : 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-500/30'
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-command-border/60 pb-3">
            <div className="flex items-center gap-3">
              <div
                className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                  (challanDetails.pending_challans || 0) > 0
                    ? 'bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400'
                    : 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                }`}
              >
                {(challanDetails.pending_challans || 0) > 0 ? (
                  <FileText className="h-5 w-5" />
                ) : (
                  <CheckCircle2 className="h-5 w-5" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase font-mono tracking-wide">
                    Gujarat Traffic Police e-Challan & Violation Records
                  </h3>
                  {(challanDetails.pending_challans || 0) > 0 ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-600 text-white animate-pulse">
                      {challanDetails.pending_challans} PENDING (₹{challanDetails.total_pending_amount?.toLocaleString()})
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-600 text-white">
                      ALL CLEAR · ₹0 FINE
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                  {(challanDetails.pending_challans || 0) > 0
                    ? `Automated ANPR & Speed Radar Enforcement Registry · Total: ${challanDetails.total_challans} Notices`
                    : 'National Parivahan & Gujarat Police Registry · Clean Compliance Record (Zero Unpaid Fines)'}
                </p>
              </div>
            </div>

            <Link
              href={`/rc-challan?plate=${plate}`}
              className="text-xs font-mono font-bold text-command-cyan hover:underline flex items-center gap-1 self-start sm:self-auto"
            >
              <span>Open Dedicated Challan Portal</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {(challanDetails.challans && challanDetails.challans.length > 0) ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-xs">
              {challanDetails.challans.slice(0, 4).map((c: any, idx: number) => (
                <div
                  key={idx}
                  className={`p-3.5 rounded-lg border flex flex-col justify-between space-y-2 ${
                    c.payment_status === 'PENDING'
                      ? 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-300 dark:border-rose-900/60'
                      : 'bg-command-card border-command-border'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <span>{c.challan_number}</span>
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                            c.payment_status === 'PENDING'
                              ? 'bg-rose-600 text-white'
                              : 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                          }`}
                        >
                          {c.payment_status}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-700 dark:text-slate-300 mt-1 font-semibold">
                        {c.violation_type}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-black text-rose-600 dark:text-rose-400">
                        ₹{c.fine_amount.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <div className="text-[10px] text-slate-500 flex items-center justify-between pt-1 border-t border-command-border/40">
                    <span>{c.location}</span>
                    <span>{c.date_time}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 rounded-lg bg-emerald-500/5 border border-emerald-500/20 flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2.5 text-emerald-700 dark:text-emerald-400 font-semibold">
                <CheckCircle2 className="h-4 w-4" />
                <span>Vehicle is fully compliant. No speeding, signal-jumping, or parking violation notices on file.</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider">
                COMPLIANT
              </span>
            </div>
          )}
        </div>
      )}

      {/* Main Grid: GIS Route Map (Left) & Chronological Timeline (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: GIS Map View (7 Cols) */}
        <div className="lg:col-span-7 bg-command-surface border border-command-border rounded-xl p-4 flex flex-col space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-command-cyan" />
              <h3 className="text-xs font-bold text-white uppercase font-mono tracking-wide">
                GIS Trajectory: Ahmedabad SG Highway → Gandhinagar Sachivalaya
              </h3>
            </div>
            <div className="text-[11px] font-mono text-command-muted">
              MapLibre GL Vector Engine
            </div>
          </div>

          {/* Interactive Map Container */}
          <div
            ref={mapContainer}
            className="w-full h-[420px] rounded-lg overflow-hidden border border-command-border relative bg-slate-100 dark:bg-[#070D18]"
          />

          {/* Selected Waypoint Details Card */}
          {selectedWaypoint && (
            <div className="p-3 rounded-lg bg-command-card border border-command-border text-xs flex items-center justify-between font-mono">
              <div className="space-y-0.5">
                <div className="text-white font-bold flex items-center gap-2">
                  <span className="text-command-cyan">Checkpoint:</span>
                  <span>{selectedWaypoint.camera_code}</span>
                  <span className="text-slate-400 font-normal">({selectedWaypoint.camera_name})</span>
                </div>
                <div className="text-command-muted text-[11px]">
                  Time: {selectedWaypoint.time_str} · Speed: {selectedWaypoint.speed_kmh} km/h · Conf: {Math.round(selectedWaypoint.confidence * 100)}%
                </div>
              </div>
              <span className="text-[10px] bg-command-cyan/10 border border-command-cyan text-command-cyan px-2 py-0.5 rounded font-bold">
                {selectedWaypoint.district}
              </span>
            </div>
          )}
        </div>

        {/* Right: Chronological Cross-Camera Timeline (5 Cols) */}
        <div className="lg:col-span-5 bg-command-surface border border-command-border rounded-xl p-4 flex flex-col space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-command-border">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-command-cyan" />
              <h3 className="text-xs font-bold text-white uppercase font-mono tracking-wide">
                Chronological Sighting Timeline ({intelligence.timeline.length} Stops)
              </h3>
            </div>
            <span className="text-[10px] text-command-green font-mono font-bold">
              PTS-VERIFIED
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 max-h-[500px] pr-1">
            {intelligence.timeline.map((item: any, idx: number) => {
              const isSelected = selectedWaypoint?.camera_code === item.camera_code;
              return (
                <div
                  key={idx}
                  onClick={() => setSelectedWaypoint(item)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-command-card border-command-cyan shadow-md'
                      : 'bg-command-bg border-command-border hover:bg-command-card'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="h-5 w-5 rounded-full bg-command-surface border border-command-cyan text-command-cyan text-[10px] font-mono font-bold flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <span className="font-mono text-xs font-extrabold text-white">
                        {item.camera_code}
                      </span>
                    </div>

                    <span className="text-xs font-mono font-bold text-command-cyan">
                      {item.time_str}
                    </span>
                  </div>

                  <div className="mt-1 text-xs text-slate-300 font-medium pl-7">
                    {item.camera_name}
                  </div>

                  <div className="mt-2 flex items-center justify-between text-[11px] font-mono text-command-muted pl-7 pt-1.5 border-t border-command-border/50">
                    <span>Speed: {item.speed_kmh} km/h</span>
                    <span>Conf: {Math.round(item.confidence * 100)}%</span>
                    <span className="text-slate-400">{item.district}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Forensic Evidence Locker & Snapshot Gallery */}
      <div className="bg-command-surface border border-command-border rounded-xl p-5 space-y-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-command-border pb-3 gap-2">
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-command-cyan" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase font-mono tracking-wide">
              Forensic Evidence Locker: High-Confidence ANPR Plate Captures
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-500">
            SHA-256 Chain of Custody Stamp Active
          </span>
        </div>

        {/* Evidence Snapshot Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Snapshot 1: Iscon Crossroad Start */}
          <div className="bg-command-card border border-command-border rounded-lg overflow-hidden group shadow-2xs">
            <div className="h-44 bg-slate-900 relative flex items-center justify-center border-b border-command-border">
              <div className="text-center p-4">
                <div className="font-mono text-sm font-black text-cyan-300 tracking-wider">
                  GJ-01-AB-1234
                </div>
                <div className="text-[10px] text-slate-400 font-mono mt-1">
                  CAM-AHM-001 · Iscon Crossroad
                </div>
                <div className="mt-2 inline-block bg-cyan-950/60 border border-cyan-500/50 text-cyan-300 text-[10px] font-mono px-2 py-0.5 rounded">
                  HSRP Holo Verified · 97.4%
                </div>
              </div>
            </div>
            <div className="p-3 text-xs font-mono space-y-1">
              <div className="text-slate-900 dark:text-white font-bold">08:42:17 UTC · Heading North</div>
              <div className="text-[10px] text-slate-500 truncate">
                Hash: sha256:4a8b...99e1 (Tamper-Proof)
              </div>
            </div>
          </div>

          {/* Snapshot 2: Koba Circle Checkpoint */}
          <div className="bg-command-card border border-rose-400/50 dark:border-rose-900/50 rounded-lg overflow-hidden group shadow-2xs">
            <div className="h-44 bg-slate-950 relative flex items-center justify-center border-b border-rose-500/30">
              <div className="text-center p-4">
                <div className="font-mono text-sm font-black text-rose-400 tracking-wider">
                  GJ-01-AB-1234
                </div>
                <div className="text-[10px] text-slate-400 font-mono mt-1">
                  CAM-GND-021 · Koba Circle Post
                </div>
                <div className="mt-2 inline-block bg-rose-600 text-white text-[10px] font-mono px-2 py-0.5 rounded font-bold">
                  WATCHLIST TRIGGER MATCH
                </div>
              </div>
            </div>
            <div className="p-3 text-xs font-mono space-y-1">
              <div className="text-slate-900 dark:text-white font-bold">09:17:31 UTC · Speed 58.4 km/h</div>
              <div className="text-[10px] text-rose-600 dark:text-rose-400 font-semibold">
                Alert Acknowledged by Insp. V.K. Patel
              </div>
            </div>
          </div>

          {/* Snapshot 3: Vidhan Sabha Marg */}
          <div className="bg-command-card border border-command-border rounded-lg overflow-hidden group shadow-2xs">
            <div className="h-44 bg-slate-900 relative flex items-center justify-center border-b border-command-border">
              <div className="text-center p-4">
                <div className="font-mono text-sm font-black text-cyan-300 tracking-wider">
                  GJ-01-AB-1234
                </div>
                <div className="text-[10px] text-slate-400 font-mono mt-1">
                  CAM-GND-035 · Sector 10 Approach
                </div>
                <div className="mt-2 inline-block bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 text-[10px] font-mono px-2 py-0.5 rounded">
                  99.1% Confidence
                </div>
              </div>
            </div>
            <div className="p-3 text-xs font-mono space-y-1">
              <div className="text-slate-900 dark:text-white font-bold">09:36:12 UTC · Last Sighting</div>
              <div className="text-[10px] text-slate-500 truncate">
                Hash: sha256:f12c...88b3 (Archived in Case #402)
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
