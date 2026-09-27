# 23 — FRONTEND ARCHITECTURE & DESIGN SYSTEM
**Platform:** Gujarat SentinelX Command Center  
**Engine:** Next.js 14 (App Router) + React 18 + TypeScript + Tailwind CSS  

---

## 1. Visual Aesthetics & Design System
SentinelX adopts a **high-density, professional police command-center aesthetic**:
- **Primary Navy:** `#070D18` (Command BG), `#0B1528` (Surface), `#0F1E36` (Cards).
- **Gujarat Blue & Cyan:** `#0284C7` (Primary Accent), `#00E5FF` (Realtime Telemetry).
- **Status Indicators:** `#10B981` (Online Green), `#EF4444` (Alert Red), `#F59E0B` (Warning Amber).
- **Official Emblem:** Integrated SVG/PNG crest of Gujarat Police Home Department.
- **Typography:** High-legibility monospaced indicators and clean sans-serif data layouts.

---

## 2. Component Hierarchy & Layout
- **Root Layout:** Sticky command navbar with global investigation search (`GJ01AB1234`), 15-route persistent sidebar, real-time alert bell badge, and collapsible alert drawer.
- **MapLibre GL GIS Layer:** WebGL vector tile integration rendering camera pins and vehicle journey LineStrings.
- **Recharts Analytics Engine:** Responsive vector charts visualising time-series detection curves and district surveillance loads.
