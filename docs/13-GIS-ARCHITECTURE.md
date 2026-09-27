# 13 — GIS & SPATIAL TOPOLOGY ARCHITECTURE
**Platform:** Gujarat SentinelX  

---

## 1. Spatial Technology Stack
- **Client Engine:** MapLibre GL JS — Open-source WebGL vector map rendering without proprietary API keys or external billing locks.
- **Server Spatial Engine:** PostGIS (Spatial indexing `GIST`, `ST_Point`, `ST_MakeLine`) with Haversine distance fallback on SQLite.
- **Data Exchange Format:** GeoJSON FeatureCollections conforming to RFC 7946.

---

## 2. Dynamic Trajectory Generation Algorithm
Given ordered detections $D_1, D_2, \dots, D_n$:
1. Points $P_i = (\text{lon}_i, \text{lat}_i)$ are extracted.
2. Geodesic distance is computed via the Haversine equation:
   $$d = 2R \arcsin\left(\sqrt{\sin^2\left(\frac{\Delta \text{lat}}{2}\right) + \cos(\text{lat}_1)\cos(\text{lat}_2)\sin^2\left(\frac{\Delta \text{lon}}{2}\right)}\right)$$
3. Transit velocities $v_i = \frac{d_i}{\Delta t_i}$ are calculated between adjacent camera posts.
4. A connected `LineString` feature is generated and overlaid above the vector tile base layer with dynamic directional arrows and speed annotations.
