from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class CurrentAirQuality(BaseModel):
    aqi: int
    status: str # GOOD, MODERATE, POOR, UNHEALTHY, CRITICAL
    dominant_pollutant: str
    dominant_pollutant_val: float
    dominant_pollutant_unit: str
    trend: str # RISING, FALLING, STABLE
    trend_rate_pct: float
    last_updated: str
    is_online: bool
    is_demo: bool
    data_freshness_desc: str

class QuickSensorItem(BaseModel):
    sensor_type: str
    name: str
    value: float
    unit: str
    status: str # HEALTHY, ELEVATED, HIGH, CRITICAL
    trend: str # RISING, FALLING, STABLE

class SourceSnippet(BaseModel):
    likely_source: str
    confidence: float
    summary: str
    evidence_highlights: List[str]
    is_estimated: bool = True

class ForecastPoint(BaseModel):
    time_label: str # "Now", "+15m", "+30m", "+60m", "+120m"
    predicted_aqi: int
    lower_bound: int
    upper_bound: int
    trend: str

class ForecastSnippet(BaseModel):
    summary: str
    expected_trend: str
    points: List[ForecastPoint]
    confidence_pct: int
    is_demo_forecast: bool = True

class DecisionSnippet(BaseModel):
    advisory: str
    recommendation: str
    suggested_duration: str
    alternative_action: Optional[str]
    rationale: str
    actuator_action: Optional[str] = None
    actuator_state: Optional[str] = None

class MapNodeSnippet(BaseModel):
    node_id: str
    name: str
    location: str
    aqi: int
    status: str
    dominant_pm25: float
    grid_x: int
    grid_y: int

class RecentEventSnippet(BaseModel):
    id: str
    time_str: str
    title: str
    severity: str
    peak_aqi: int
    suspected_source: str
    duration_str: str

class OverviewResponse(BaseModel):
    node_id: str
    node_name: str
    location: str
    air_quality: CurrentAirQuality
    quick_sensors: List[QuickSensorItem]
    why_happening: SourceSnippet
    what_happens_next: ForecastSnippet
    what_should_i_do: DecisionSnippet
    local_map: List[MapNodeSnippet]
    recent_events: List[RecentEventSnippet]
    sensors_operational_ratio: str
    system_latency_ms: float
