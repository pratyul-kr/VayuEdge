import {
  OverviewData,
  SensorDetail,
  SensorFusionData,
  ForecastDetailData,
  SourceAttributionData,
  PredictionsData,
  DecisionsPageData,
  EventsData,
  NodesData,
  LocalMapData,
  SystemStatusData
} from '../types';

const API_BASE = '/api/v1';

// Offline fallback local cache helper
function getCached<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(`aether_cache_${key}`);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Cache read error:', e);
  }
  return null;
}

function setCached<T>(key: string, data: T): void {
  try {
    localStorage.setItem(`aether_cache_${key}`, JSON.stringify(data));
  } catch (e) {
    console.warn('Cache write error:', e);
  }
}

async function request<T>(endpoint: string, fallbackKey: string): Promise<T> {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`);
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }
    const data: T = await res.json();
    setCached(fallbackKey, data);
    return data;
  } catch (err) {
    const cached = getCached<T>(fallbackKey);
    if (cached) {
      return cached;
    }
    throw err;
  }
}

export const api = {
  getOverview: (nodeId = 'NODE-01') => request<OverviewData>(`/overview?node_id=${nodeId}`, 'overview'),
  getSensors: (nodeId = 'NODE-01') => request<SensorDetail[]>(`/sensors?node_id=${nodeId}`, 'sensors'),
  getHardwareStatus: async (nodeId = 'NODE-01') => {
    const res = await fetch(`${API_BASE}/hardware/status?node_id=${nodeId}`);
    if (!res.ok) throw new Error(`Hardware status unavailable: ${res.status}`);
    return res.json() as Promise<{ node_id: string; connected: boolean; source: string; last_telemetry_at: string | null; age_seconds: number | null }>;
  },
  getSensorFusion: (nodeId = 'NODE-01') => request<SensorFusionData>(`/sensor-fusion?node_id=${nodeId}`, 'sensor_fusion'),
  getForecast: (nodeId = 'NODE-01') => request<ForecastDetailData>(`/forecast?node_id=${nodeId}`, 'forecast'),
  getSources: (nodeId = 'NODE-01') => request<SourceAttributionData>(`/sources?node_id=${nodeId}`, 'sources'),
  getPredictions: (nodeId = 'NODE-01') => request<PredictionsData>(`/predictions?node_id=${nodeId}`, 'predictions'),
  getDecisions: (nodeId = 'NODE-01') => request<DecisionsPageData>(`/decisions?node_id=${nodeId}`, 'decisions'),
  getEvents: () => request<EventsData>('/events', 'events'),
  getNodes: () => request<NodesData>('/nodes', 'nodes'),
  getLocalMap: () => request<LocalMapData>('/map', 'local_map'),
  getSystemStatus: () => request<SystemStatusData>('/system/status', 'system_status'),

  // Demo Scenarios & Offline Synchronization
  activateScenario: async (scenarioId: string) => {
    const res = await fetch(`${API_BASE}/system/demo-scenario`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scenario_id: scenarioId })
    });
    return res.json();
  },

  toggleOffline: async () => {
    const res = await fetch(`${API_BASE}/system/toggle-offline`, {
      method: 'POST'
    });
    return res.json();
  },

  triggerSync: async () => {
    const res = await fetch(`${API_BASE}/system/sync`, {
      method: 'POST'
    });
    return res.json();
  }
};
