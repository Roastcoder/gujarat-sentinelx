export function getApiBase(): string {
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host.includes('sentinelx.')) {
      return `${window.location.protocol}//${host.replace('sentinelx.', 'sentinelx-api.')}/api/v1`;
    }
    if (process.env.NEXT_PUBLIC_API_URL && !process.env.NEXT_PUBLIC_API_URL.includes('localhost')) {
      return process.env.NEXT_PUBLIC_API_URL;
    }
    return '/api/v1';
  }
  return process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || 'https://sentinelx-api.187.77.187.120.sslip.io/api/v1';
}

export async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const base = getApiBase();
  const url = endpoint.startsWith('http') ? endpoint : `${base}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
      cache: 'no-store',
    });
    if (!res.ok) {
      const errorJson = await res.json().catch(() => ({}));
      throw new Error(errorJson?.error?.message || `API Error: ${res.statusText}`);
    }
    return await res.json();
  } catch (error: any) {
    console.error(`Fetch error at ${endpoint}:`, error);
    throw error;
  }
}

export const api = {
  // Auth
  login: (credentials: { username: string; password: string }) =>
    fetchAPI('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),

  // Health & Analytics
  getHealth: () => fetchAPI('/system/health'),
  getAnalytics: () => fetchAPI('/analytics/overview'),

  // Cameras
  getCameras: (params: string = '') => fetchAPI(`/cameras${params ? `?${params}` : ''}`),
  getCamera: (id: string) => fetchAPI(`/cameras/${id}`),
  getSentinelCatalogue: () => fetchAPI('/cameras/sentinel-grid/catalogue'),

  // GIS
  getGISCameras: (params: string = '') => fetchAPI(`/gis/cameras${params ? `?${params}` : ''}`),
  getGISEvents: () => fetchAPI('/gis/events'),
  getVehicleRoute: (plate: string) => fetchAPI(`/gis/routes/${plate}`),

  // Vehicles & ANPR & VAHAN & Challans
  getVehicleIntelligence: (plate: string) => fetchAPI(`/vehicles/${plate}`),
  getVehicleVahan: (plate: string) => fetchAPI(`/vehicles/${plate}/vahan`),
  getVehicleChallans: (plate: string) => fetchAPI(`/vehicles/${plate}/challans`),
  searchVehicles: (query: string = '') => fetchAPI(`/vehicles${query ? `?${query}` : ''}`),

  // Alerts & Watchlists
  getAlerts: () => fetchAPI('/alerts'),
  acknowledgeAlert: (id: string, notes: string) =>
    fetchAPI(`/alerts/${id}/acknowledge`, {
      method: 'POST',
      body: JSON.stringify({ notes }),
    }),
  getWatchlists: () => fetchAPI('/watchlists'),

  // Investigations
  getInvestigations: () => fetchAPI('/investigations'),
  getInvestigation: (id: string) => fetchAPI(`/investigations/${id}`),

  // Ingest & Stream Session Operations (Sections 4, 5, 6, 17, 19)
  getIngestCatalogue: () => fetchAPI('/ingest'),
  syncCatalogue: () =>
    fetchAPI('/streams/catalogue/sync', {
      method: 'POST',
    }),
  getCatalogueStatus: () => fetchAPI('/streams/catalogue/status'),
  getStreamSessions: () => fetchAPI('/streams/sessions'),
  acquireStream: (cameraCode: string, consumerId: string = 'web_operator') =>
    fetchAPI(`/streams/${cameraCode}/acquire`, {
      method: 'POST',
      body: JSON.stringify({ consumer_id: consumerId, purpose: 'live_preview' }),
    }),
  releaseStream: (cameraCode: string, consumerId: string = 'web_operator') =>
    fetchAPI(`/streams/${cameraCode}/release`, {
      method: 'POST',
      body: JSON.stringify({ consumer_id: consumerId }),
    }),
  getStreamHealth: (cameraCode: string) => fetchAPI(`/streams/${cameraCode}/health`),

  // VMS Federation & Adapters (Section 38)
  getVMSIntegrations: () => fetchAPI('/vms/integrations'),
  getVMSAdapters: () => fetchAPI('/vms/adapters'),
  getVMSAdaptersHealth: () => fetchAPI('/vms/adapters/health'),

  // Simulator & Failure Injection (Section 47 & 51)
  injectFailure: (cameraId: string, failureType: string, enabled: boolean = true) =>
    fetchAPI('/simulator/failure-injection', {
      method: 'POST',
      body: JSON.stringify({ camera_id: cameraId, failure_type: failureType, enabled }),
    }),
  clearFailures: () =>
    fetchAPI('/simulator/failure-injection/clear', {
      method: 'POST',
    }),
  getSimulatorStatus: () => fetchAPI('/simulator/status'),

  // Audit
  getAuditLogs: () => fetchAPI('/audit/logs'),

  // Demo
  triggerDemo: () =>
    fetchAPI('/demo/trigger', {
      method: 'POST',
    }),
};

