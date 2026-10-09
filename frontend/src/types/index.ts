export type AirQualityStatus = 'GOOD' | 'MODERATE' | 'POOR' | 'UNHEALTHY' | 'VERY_UNHEALTHY' | 'CRITICAL';

export interface CurrentAirQuality {
  aqi: number;
  status: AirQualityStatus;
  dominant_pollutant: string;
  dominant_pollutant_val: number;
  dominant_pollutant_unit: string;
  trend: 'RISING' | 'FALLING' | 'STABLE';
  trend_rate_pct: number;
  last_updated: string;
  is_online: boolean;
  is_demo: boolean;
  data_freshness_desc: string;
}

export interface QuickSensorItem {
  sensor_type: string;
  name: string;
  value: number;
  unit: string;
  status: string;
  trend: string;
}

export interface SourceSnippet {
  likely_source: string;
  confidence: number;
  summary: string;
  evidence_highlights: string[];
  is_estimated: boolean;
}

export interface ForecastPoint {
  time_label: string;
  predicted_aqi: number;
  lower_bound: number;
  upper_bound: number;
  trend: string;
}

export interface ForecastSnippet {
  summary: string;
  expected_trend: string;
  points: ForecastPoint[];
  confidence_pct: number;
  is_demo_forecast: boolean;
}

export interface DecisionSnippet {
  advisory: string;
  recommendation: string;
  suggested_duration: string;
  alternative_action: string | null;
  rationale: string;
  actuator_action?: string;
  actuator_state?: string;
}

export interface MapNodeSnippet {
  node_id: string;
  name: string;
  location: string;
  aqi: number;
  status: string;
  dominant_pm25: number;
  grid_x: number;
  grid_y: number;
}

export interface RecentEventSnippet {
  id: string;
  time_str: string;
  title: string;
  severity: string;
  peak_aqi: number;
  suspected_source: string;
  duration_str: string;
}

export interface OverviewData {
  node_id: string;
  node_name: string;
  location: string;
  air_quality: CurrentAirQuality;
  quick_sensors: QuickSensorItem[];
  why_happening: SourceSnippet;
  what_happens_next: ForecastSnippet;
  what_should_i_do: DecisionSnippet;
  local_map: MapNodeSnippet[];
  recent_events: RecentEventSnippet[];
  sensors_operational_ratio: string;
  system_latency_ms: number;
}

export interface SensorReadingHistory {
  timestamp: string;
  value: number;
}

export interface SensorDetail {
  id: string;
  node_id: string;
  sensor_type: string;
  display_name: string;
  unit: string;
  status: string;
  current_value: number;
  min_threshold: number;
  max_threshold: number;
  trend: string;
  rate_of_change_15m: number;
  last_reading_time: string;
  history: SensorReadingHistory[];
}

export interface SensorFusionStage {
  stage_number: number;
  name: string;
  description: string;
  input_signals: string[];
  output_result: string;
  status: string;
}

export interface SensorFusionData {
  node_id: string;
  timestamp: string;
  pipeline: SensorFusionStage[];
  fingerprint_vector: Record<string, number | string>;
  signature_type: string;
  confidence: number;
  environmental_context: Record<string, string>;
}

export interface ForecastTrajectoryPoint {
  timestamp: string;
  relative_time: string;
  is_historical: boolean;
  actual_value: number | null;
  predicted_value: number | null;
  lower_bound: number | null;
  upper_bound: number | null;
}

export interface ForecastDetailData {
  node_id: string;
  target_pollutant: string;
  current_value: number;
  current_aqi: number;
  forecast_horizon: string;
  trend_summary: string;
  expected_peak_time: string;
  expected_peak_value: number;
  confidence_score: number;
  model_name: string;
  model_version: string;
  model_status: string;
  is_demonstration_data: boolean;
  trajectory: ForecastTrajectoryPoint[];
  drivers: string[];
}

export interface SourceFactor {
  sensor_name: string;
  observed_level: string;
  weight_contribution: number;
  impact_description: string;
}

export interface SourceCandidate {
  category_id: string;
  name: string;
  probability: number;
  is_primary: boolean;
  evidence_match: string;
}

export interface SourceAttributionData {
  node_id: string;
  timestamp: string;
  most_likely_source: string;
  category_id: string;
  confidence: number;
  is_estimated: boolean;
  explanation: string;
  supporting_evidence: SourceFactor[];
  competing_candidates: SourceCandidate[];
  fingerprint_notes: string;
}

export interface PredictionCard {
  id: string;
  title: string;
  probability_pct: number;
  severity: string;
  time_horizon: string;
  evidence_summary: string;
  expected_impact: string;
  confidence_level: string;
}

export interface PredictionsData {
  node_id: string;
  timestamp: string;
  active_predictions: PredictionCard[];
  risk_index_score: number;
  peak_risk_window: string;
  model_inference_status: string;
}

export interface DecisionDetail {
  id: number;
  node_id: string;
  timestamp: string;
  condition: string;
  action: string;
  reason: string;
  confidence: number;
  priority: string;
  actuator_action: string;
  actuator_status: string;
  explainability_notes: string;
}

export interface RecommendationDetail {
  id: number;
  title: string;
  target_group: string;
  advisory: string;
  duration_minutes: number;
  alternative_route: string | null;
  category: string;
  medical_disclaimer: string;
}

export interface DecisionRuleTrace {
  rule_id: string;
  condition_evaluated: string;
  threshold_met: boolean;
  trigger_detail: string;
}

export interface DecisionsPageData {
  node_id: string;
  active_condition: string;
  primary_decision: DecisionDetail;
  active_recommendations: RecommendationDetail[];
  rule_evaluation_traces: DecisionRuleTrace[];
  recent_decision_history: DecisionDetail[];
}

export interface EventDetailItem {
  id: string;
  node_id: string;
  node_name: string;
  title: string;
  severity: string;
  suspected_source: string;
  confidence: number;
  peak_aqi: number;
  peak_pm25: number;
  peak_pm10: number | null;
  duration_minutes: number;
  is_active: boolean;
  start_time: string;
  end_time: string | null;
  description: string;
}

export interface EventsData {
  total_count: number;
  active_count: number;
  events: EventDetailItem[];
}

export interface NodeDetailItem {
  id: string;
  name: string;
  location: string;
  status: string;
  current_aqi: number;
  aqi_category: string;
  battery_level: number;
  ip_address: string;
  hardware_model: string;
  grid_x: number;
  grid_y: number;
  last_seen: string;
  last_sync_desc: string;
  sensors_operational: number;
  sensors_total: number;
  key_pollutants: Array<{
    sensor_type: string;
    value: number;
    unit: string;
    status: string;
  }>;
}

export interface NodesData {
  total_nodes: number;
  online_count: number;
  offline_count: number;
  nodes: NodeDetailItem[];
}

export interface MapGridCell {
  grid_x: number;
  grid_y: number;
  zone_name: string;
  intensity_aqi: number;
  category: string;
  assigned_node_id: string | null;
  node_name: string | null;
  status: string;
}

export interface LocalMapData {
  area_name: string;
  grid_dimensions: { rows: number; cols: number };
  cells: MapGridCell[];
  highest_polluted_zone: string;
  spread_direction: string;
  dispersion_assessment: string;
}

export interface SystemStatusData {
  node_id: string;
  hardware_platform: string;
  firmware_version: string;
  edge_mode: string;
  is_internet_connected: boolean;
  is_syncing: boolean;
  last_sync_timestamp: string;
  unsynced_readings_queued: number;
  cpu_usage_pct: number;
  memory_usage_mb: number;
  temperature_c: number;
  mcu_comm_status: string;
  inference_latency_ms: number;
  storage_free_mb: number;
  sensors_operational: number;
  sensors_total: number;
  architecture_overview: {
    microcontroller_coprocessor: Record<string, string>;
    linux_application_processor: Record<string, string>;
  };
}

export type NavigationTab = 
  | 'overview'
  | 'monitor'
  | 'forecast'
  | 'sources'
  | 'predictions'
  | 'decisions'
  | 'sensors'
  | 'map'
  | 'events'
  | 'nodes'
  | 'system';
