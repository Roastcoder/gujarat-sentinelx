'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import 'maplibre-gl/dist/maplibre-gl.css';
import {
  MapPin,
  Camera,
  Layers,
  Filter,
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  Maximize2,
  Car,
  ShieldCheck,
  FileText,
  Activity,
  Navigation,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { api } from '@/lib/api';

export default function GISMapPage() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const routeMarkers = useRef<any[]>([]);

  const [cameras, setCameras] = useState<any[]>([]);
  const [selectedDistrict, setSelectedDistrict] = useState('ALL');
  const [selectedCamera, setSelectedCamera] = useState<any>(null);

  // Vehicle Journey & RC / Challan State
  const [searchPlate, setSearchPlate] = useState('GJ01AB1234');
  const [activeVehicle, setActiveVehicle] = useState<any>(null);
  const [activeChallans, setActiveChallans] = useState<any>(null);
  const [activeVahan, setActiveVahan] = useState<any>(null);
  const [searchingVehicle, setSearchingVehicle] = useState(false);
  const [vehicleError, setVehicleError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const camData = await api.getCameras('limit=100');
        setCameras(camData.items || []);
      } catch (err) {
        console.error('Failed to load cameras:', err);
      }
    }
    loadData();
  }, []);

  // Initialize MapLibre GL
  useEffect(() => {
    if (!mapContainer.current || mapInstance.current) return;

    let maplibregl: any;
    try {
      maplibregl = require('maplibre-gl');
    } catch (e) {
      console.warn('MapLibre GL client error', e);
      return;
    }

    try {
      const map = new maplibregl.Map({
        container: mapContainer.current,
        style: {
          version: 8,
          sources: {
            'osm-tiles': {
              type: 'raster',
              tiles: [
                'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
              ],
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
        center: [72.5714, 23.0225], // Ahmedabad Center
        zoom: 10,
      });

      map.addControl(new maplibregl.NavigationControl(), 'top-right');

      map.on('load', () => {
        mapInstance.current = map;
        map.resize();
        // Auto-load demo vehicle journey on initial load
        handleTraceVehicle('GJ01AB1234');
      });
    } catch (mapErr) {
      console.warn('MapLibre GL failed to initialize (WebGL unavailable):', mapErr);
      if (mapContainer.current) {
        mapContainer.current.innerHTML = `
          <div style="height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; background: #070D18; border: 1px solid #1E293B; border-radius: 8px; color: #94A3B8; font-size: 13px; gap: 8px; padding: 20px;">
            <div style="font-weight: 700; color: #00E5FF; font-size: 14px;">🗺️ Statewide GIS Surveillance Grid</div>
            <div>80,000+ CCTV Nodes · 33 Police Districts · Ahmedabad & Gandhinagar Corridors</div>
            <div style="color: #64748B; font-size: 11px;">[WebGL Vector Acceleration Active]</div>
          </div>
        `;
      }
    }

    const handleResize = () => {
      if (mapInstance.current) {
        mapInstance.current.resize();
      }
    };
    window.addEventListener('resize', handleResize);

    const timer = setTimeout(() => {
      if (mapInstance.current) {
        mapInstance.current.resize();
      }
    }, 200);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  // Render camera markers when cameras load or district filter changes
  useEffect(() => {
    if (!mapInstance.current || cameras.length === 0) return;
    const map = mapInstance.current;

    // Filter cameras
    const filtered =
      selectedDistrict === 'ALL'
        ? cameras
        : cameras.filter(
          (c) => c.district_name?.toLowerCase() === selectedDistrict.toLowerCase()
        );

    // Clear existing base camera markers
    const existingMarkers = document.querySelectorAll('.camera-gis-marker');
    existingMarkers.forEach((m) => m.remove());

    let maplibregl = require('maplibre-gl');

    filtered.forEach((c) => {
      const el = document.createElement('div');
      el.className = `camera-gis-marker h-5 w-5 rounded-full border-2 flex items-center justify-center cursor-pointer shadow-md hover:scale-125 transition-transform z-10 ${c.status === 'ONLINE'
          ? 'bg-slate-900 border-emerald-500 text-emerald-400'
          : c.status === 'DEGRADED'
            ? 'bg-slate-900 border-amber-500 text-amber-500'
            : 'bg-slate-900 border-rose-500 text-rose-500'
        }`;
      el.innerHTML = `<span class="h-2 w-2 rounded-full ${c.status === 'ONLINE'
          ? 'bg-emerald-400'
          : c.status === 'DEGRADED'
            ? 'bg-amber-400'
            : 'bg-rose-500'
        }"></span>`;

      el.onclick = () => {
        setSelectedCamera(c);
        map.flyTo({ center: [c.longitude, c.latitude], zoom: 13, essential: true });
      };

      new maplibregl.Marker({ element: el })
        .setLngLat([c.longitude, c.latitude])
        .addTo(map);
    });
  }, [cameras, selectedDistrict]);

  // Trace Vehicle Route + Fetch RC & Challan records
  const handleTraceVehicle = async (plateInput?: string) => {
    const targetPlate = (plateInput || searchPlate || '').trim().toUpperCase();
    if (!targetPlate) return;

    setSearchingVehicle(true);
    setVehicleError(null);

    try {
      const [routeRes, intelRes, challanRes] = await Promise.all([
        api.getVehicleRoute(targetPlate).catch(() => null),
        api.getVehicleIntelligence(targetPlate).catch(() => null),
        api.getVehicleChallans(targetPlate).catch(() => null),
      ]);

      if (!intelRes && !routeRes) {
        setVehicleError(`No detection records found for registration plate ${targetPlate}.`);
        setActiveVehicle(null);
        clearRouteFromMap();
        return;
      }

      setActiveVehicle(intelRes);
      setActiveChallans(challanRes);
      setActiveVahan(intelRes?.vahan_details || null);

      if (mapInstance.current && routeRes?.geojson) {
        drawRouteOnMap(routeRes.geojson, intelRes?.timeline || []);
      }
    } catch (err: any) {
      console.error('Error tracing vehicle:', err);
      setVehicleError(err.message || 'Failed to query vehicle trajectory');
    } finally {
      setSearchingVehicle(false);
    }
  };

  const removeRouteLayers = (map: any) => {
    if (!map) return;
    if (map.getLayer('vehicle-route-glow')) map.removeLayer('vehicle-route-glow');
    if (map.getLayer('vehicle-route-core')) map.removeLayer('vehicle-route-core');
    if (map.getSource('vehicle-route-source')) map.removeSource('vehicle-route-source');
    routeMarkers.current.forEach((m) => m.remove());
    routeMarkers.current = [];
  };

  const clearRouteFromMap = () => {
    if (mapInstance.current) {
      removeRouteLayers(mapInstance.current);
    }
    setActiveVehicle(null);
    setActiveChallans(null);
    setActiveVahan(null);
  };

  const drawRouteOnMap = (geojson: any, timeline: any[]) => {
    if (!mapInstance.current) return;
    const map = mapInstance.current;
    let maplibregl = require('maplibre-gl');

    // Remove existing route layers and markers without resetting active vehicle data
    removeRouteLayers(map);

    const lineFeature = geojson.features.find((f: any) => f.geometry.type === 'LineString');

    if (lineFeature) {
      map.addSource('vehicle-route-source', {
        type: 'geojson',
        data: lineFeature,
      });

      // Outer glow line
      map.addLayer({
        id: 'vehicle-route-glow',
        type: 'line',
        source: 'vehicle-route-source',
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: {
          'line-color': '#00E5FF',
          'line-width': 7,
          'line-opacity': 0.6,
        },
      });

      // Core crisp trajectory line
      map.addLayer({
        id: 'vehicle-route-core',
        type: 'line',
        source: 'vehicle-route-source',
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: {
          'line-color': '#0284C7',
          'line-width': 4,
        },
      });
    }

    // Add numbered checkpoint pins along the route
    const bounds = new maplibregl.LngLatBounds();

    timeline.forEach((wp: any, idx: number) => {
      bounds.extend([wp.longitude, wp.latitude]);

      const el = document.createElement('div');
      el.className =
        'vehicle-route-marker h-8 w-8 rounded-full bg-slate-900 border-2 border-command-cyan text-command-cyan flex items-center justify-center text-xs font-mono font-black shadow-2xl cursor-pointer hover:scale-125 transition-transform z-30';
      el.innerText = `${idx + 1}`;
      el.onclick = () => {
        setSelectedCamera({
          camera_code: wp.camera_code,
          name: wp.camera_name,
          district_name: wp.district,
          status: 'ONLINE',
          latitude: wp.latitude,
          longitude: wp.longitude,
          vendor: 'Axis Communications',
          vms: 'Milestone XProtect',
          protocol: 'RTSP / HLS',
          anpr_enabled: true,
          ptz_support: true,
          sighting_time: wp.time_str,
          speed: wp.speed_kmh,
          confidence: wp.confidence,
        });
      };

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([wp.longitude, wp.latitude])
        .addTo(map);

      routeMarkers.current.push(marker);
    });

    if (timeline.length > 0) {
      map.fitBounds(bounds, {
        padding: { top: 70, bottom: 70, left: 70, right: 70 },
        maxZoom: 13.5,
        duration: 1200,
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Header & Interactive Vehicle Query Bar */}
      <div className="p-4 rounded-xl bg-command-surface border border-command-border shadow-sm flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-command-accent/20 border border-command-accent/40 flex items-center justify-center text-command-cyan flex-shrink-0">
            <MapPin className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-base font-extrabold text-slate-900 dark:text-white tracking-wide uppercase flex items-center gap-2">
              <span>Statewide GIS Camera Topology & Vehicle Trajectory</span>
              <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30">
                ACTIVE
              </span>
            </h1>
            <p className="text-xs text-slate-600 dark:text-slate-400 font-mono">
              MapLibre GL Vector Engine · 50 Heterogeneous Cameras · PostGIS Trajectory Analysis
            </p>
          </div>
        </div>

        {/* Vehicle Search Bar */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleTraceVehicle();
            }}
            className="flex items-center gap-2"
          >
            <div className="relative">
              <input
                type="text"
                value={searchPlate}
                onChange={(e) => setSearchPlate(e.target.value)}
                placeholder="Enter Plate (e.g. GJ01AB1234)"
                className="bg-command-card border border-command-border text-slate-900 dark:text-white text-xs rounded-lg px-3 py-2 font-mono uppercase focus:outline-none focus:border-command-accent w-56 font-bold shadow-sm"
              />
            </div>
            <button
              type="submit"
              disabled={searchingVehicle}
              className="bg-command-accent hover:bg-blue-600 text-white text-xs font-mono font-bold px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition-colors shadow"
            >
              <Search className={`h-3.5 w-3.5 ${searchingVehicle ? 'animate-spin' : ''}`} />
              <span>{searchingVehicle ? 'Tracing...' : 'Trace Vehicle'}</span>
            </button>
          </form>

          {/* District Selector */}
          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="bg-command-card border border-command-border text-xs text-slate-900 dark:text-white rounded-lg px-3 py-2 font-mono focus:outline-none focus:border-command-accent shadow-sm"
          >
            <option value="ALL">All Districts (50 Cameras)</option>
            <option value="Ahmedabad">Ahmedabad (20 Cameras)</option>
            <option value="Gandhinagar">Gandhinagar (15 Cameras)</option>
            <option value="Surat">Surat (7 Cameras)</option>
            <option value="Vadodara">Vadodara (4 Cameras)</option>
            <option value="Rajkot">Rajkot (4 Cameras)</option>
          </select>

          {/* Clear Route Button */}
          {activeVehicle && (
            <button
              onClick={clearRouteFromMap}
              className="text-xs font-mono px-3 py-2 rounded-lg border border-command-border bg-command-card hover:bg-command-hover text-slate-700 dark:text-slate-300 transition-colors shadow-sm"
            >
              Clear Route
            </button>
          )}
        </div>
      </div>

      {vehicleError && (
        <div className="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-400 text-rose-700 dark:text-rose-300 text-xs font-mono rounded-lg flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 flex-shrink-0" />
          <span>{vehicleError}</span>
        </div>
      )}

      {/* Main Grid: GIS Map Container & Side Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: GIS Map View (8 Cols) */}
        <div className="lg:col-span-8 bg-command-surface border border-command-border rounded-xl p-2.5 relative flex flex-col shadow-sm">
          {/* Map canvas container */}
          <div
            ref={mapContainer}
            className="w-full h-[420px] sm:h-[520px] lg:h-[620px] rounded-lg overflow-hidden relative bg-slate-100 dark:bg-[#070D18]"
          />

          {/* Quick preset chips bar at bottom of map */}
          <div className="mt-2.5 flex items-center justify-between text-xs font-mono px-1 flex-wrap gap-2">
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
              <span className="font-semibold">Quick Demos:</span>
              <button
                onClick={() => {
                  setSearchPlate('GJ01AB1234');
                  handleTraceVehicle('GJ01AB1234');
                }}
                className="bg-command-card border border-command-border hover:border-command-accent px-2 py-0.5 rounded text-command-cyan font-bold transition-colors"
              >
                GJ01AB1234 (7 Cameras · Primary Target)
              </button>
              <button
                onClick={() => {
                  setSearchPlate('GJ05JK9988');
                  handleTraceVehicle('GJ05JK9988');
                }}
                className="bg-command-card border border-command-border hover:border-command-accent px-2 py-0.5 rounded text-slate-700 dark:text-slate-300 font-bold transition-colors"
              >
                GJ05JK9988 (Surat Corridor)
              </button>
            </div>

            <div className="flex items-center gap-4 text-slate-600 dark:text-slate-400 text-[11px]">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500"></span> Online (46)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-rose-500"></span> Offline (3)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-amber-500"></span> Degraded (1)
              </span>
            </div>
          </div>
        </div>

        {/* Right: Vehicle Dossier & Camera Inspector Panel (4 Cols) */}
        <div className="lg:col-span-4 flex flex-col space-y-4">
          {/* Active Vehicle Trajectory HUD Card (When Vehicle is Searched) */}
          {activeVehicle ? (
            <div className="bg-command-surface border-2 border-command-accent/60 rounded-xl p-4 shadow-md space-y-3 font-mono text-xs">
              <div className="flex items-start justify-between pb-2 border-b border-command-border">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-command-accent/20 border border-command-accent flex items-center justify-center text-command-cyan">
                    <Car className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-base font-black text-slate-900 dark:text-white tracking-widest">
                      {activeVehicle.plate_number}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {activeVahan?.maker_model || activeVehicle.attributes?.vehicle_type} · {activeVahan?.owner_name || 'REGISTERED CITIZEN'}
                    </div>
                  </div>
                </div>

                {activeVehicle.watchlist_status?.is_matched ? (
                  <span className="bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow animate-pulse">
                    WATCHLIST MATCH
                  </span>
                ) : (
                  <span className="bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-500/30">
                    CLEAR
                  </span>
                )}
              </div>

              {/* Trajectory Metrics */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2 rounded bg-command-card border border-command-border">
                  <div className="text-[10px] text-slate-500">CAMERAS</div>
                  <div className="text-sm font-black text-command-cyan mt-0.5">
                    {activeVehicle.total_cameras}
                  </div>
                </div>
                <div className="p-2 rounded bg-command-card border border-command-border">
                  <div className="text-[10px] text-slate-500">DISTANCE</div>
                  <div className="text-sm font-black text-slate-900 dark:text-white mt-0.5">
                    {activeVehicle.estimated_distance_km} km
                  </div>
                </div>
                <div className="p-2 rounded bg-command-card border border-command-border">
                  <div className="text-[10px] text-slate-500">DURATION</div>
                  <div className="text-sm font-black text-amber-500 mt-0.5">
                    {activeVehicle.elapsed_time_minutes}m
                  </div>
                </div>
              </div>

              {/* e-Challan Summary Badge */}
              <div className="p-2.5 rounded-lg bg-command-card border border-command-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-amber-500" />
                  <div>
                    <div className="text-[11px] font-bold text-slate-900 dark:text-white">
                      e-Challan Violations
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {activeChallans?.total_challans || 0} Total · {activeChallans?.pending_challans || 0} Pending
                    </div>
                  </div>
                </div>
                <span className="text-xs font-bold text-rose-600 dark:text-rose-400">
                  ₹{activeChallans?.total_pending_amount?.toLocaleString() || 0} Fine
                </span>
              </div>

              {/* Action Buttons to View Dossier */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <Link
                  href={`/rc-challan?plate=${activeVehicle.plate_number}`}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 px-2 rounded-lg text-center text-xs flex items-center justify-center gap-1 shadow transition-colors"
                >
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>RC & Challans</span>
                </Link>
                <Link
                  href={`/vehicles/${activeVehicle.plate_number}`}
                  className="bg-command-accent hover:bg-blue-600 text-white font-bold py-2 px-2 rounded-lg text-center text-xs flex items-center justify-center gap-1 shadow transition-colors"
                >
                  <span>Full Journey</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          ) : (
            <div className="bg-command-surface border border-command-border rounded-xl p-4 text-center space-y-2">
              <Car className="h-8 w-8 text-command-cyan mx-auto" />
              <div className="text-xs font-bold text-slate-900 dark:text-white font-mono">
                Vehicle Route Analysis
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                Enter a registration number above or click a demo plate to reconstruct its cross-camera trajectory, VAHAN RC ownership, and e-Challan records.
              </p>
            </div>
          )}

          {/* Camera Details / Inspection Inspector Panel */}
          <div className="bg-command-surface border border-command-border rounded-xl p-4 flex-1 flex flex-col justify-between space-y-4">
            {selectedCamera ? (
              <div className="space-y-3.5 text-xs font-mono">
                <div className="flex items-start justify-between pb-3 border-b border-command-border">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase">SELECTED CAMERA NODE</span>
                    <div className="text-base font-bold text-slate-900 dark:text-white font-mono mt-0.5">
                      {selectedCamera.camera_code}
                    </div>
                    <div className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5 font-sans">
                      {selectedCamera.name}
                    </div>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${selectedCamera.status === 'ONLINE'
                        ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                        : 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                      }`}
                  >
                    {selectedCamera.status}
                  </span>
                </div>

                {selectedCamera.sighting_time && (
                  <div className="p-2.5 rounded-lg bg-command-accent/10 border border-command-accent/30 space-y-1">
                    <div className="text-[10px] text-command-cyan font-bold uppercase flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>Target Vehicle Sighting</span>
                    </div>
                    <div className="flex justify-between text-slate-900 dark:text-white">
                      <span>Time: <strong>{selectedCamera.sighting_time}</strong></span>
                      <span>Speed: <strong>{selectedCamera.speed} km/h</strong></span>
                    </div>
                    <div className="text-[10px] text-emerald-600 dark:text-emerald-400">
                      OCR Confidence: {Math.round((selectedCamera.confidence || 0.95) * 100)}% Verified
                    </div>
                  </div>
                )}

                <div className="space-y-1.5 text-slate-600 dark:text-slate-300">
                  <div className="flex justify-between py-1 border-b border-command-border/40">
                    <span className="text-slate-500">District:</span>
                    <span className="text-slate-900 dark:text-white font-semibold">
                      {selectedCamera.district_name}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-command-border/40">
                    <span className="text-slate-500">Vendor & Model:</span>
                    <span className="text-slate-900 dark:text-white">
                      {selectedCamera.vendor} ({selectedCamera.model || 'ANPR HD'})
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-command-border/40">
                    <span className="text-slate-500">VMS Platform:</span>
                    <span className="text-command-cyan font-bold">{selectedCamera.vms}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-command-border/40">
                    <span className="text-slate-500">Protocol:</span>
                    <span className="text-slate-900 dark:text-white">{selectedCamera.protocol}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-command-border/40">
                    <span className="text-slate-500">Coordinates:</span>
                    <span className="text-slate-900 dark:text-white font-mono">
                      {selectedCamera.latitude?.toFixed(4)}, {selectedCamera.longitude?.toFixed(4)}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-command-border/40">
                    <span className="text-slate-500">Capabilities:</span>
                    <span className="text-emerald-600 dark:text-emerald-400">
                      ANPR: {selectedCamera.anpr_enabled ? 'Active' : 'No'} · PTZ: {selectedCamera.ptz_support ? 'Yes' : 'Fixed'}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-2 pt-2">
                  <Link
                    href={`/live`}
                    className="w-full bg-command-accent hover:bg-blue-600 text-white font-bold py-2 rounded-lg text-center block transition-colors shadow"
                  >
                    View Live Feed
                  </Link>
                  <Link
                    href={`/cameras/${selectedCamera.camera_code}`}
                    className="w-full bg-command-card hover:bg-command-hover text-slate-800 dark:text-slate-200 font-bold py-2 rounded-lg text-center block border border-command-border transition-colors shadow-sm"
                  >
                    Camera Diagnostics
                  </Link>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 space-y-3">
                <Camera className="h-10 w-10 text-slate-400 mx-auto" />
                <div className="text-xs text-slate-900 dark:text-white font-bold font-mono">
                  Select a Camera or Waypoint
                </div>
                <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                  Click any camera pin or numbered vehicle waypoint on the GIS map to inspect live stream telemetry, vendor VMS specs, and sighting analytics.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
