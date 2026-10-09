from pydantic import BaseModel
from typing import List

class ForecastTrajectoryPoint(BaseModel):
    timestamp: str
    relative_time: str # "-30m", "-15m", "Now", "+15m", "+30m", "+45m", "+60m", "+120m"
    is_historical: bool
    actual_value: float | None = None
    predicted_value: float | None = None
    lower_bound: float | None = None
    upper_bound: float | None = None

class ForecastDetailResponse(BaseModel):
    node_id: str
    target_pollutant: str
    current_value: float
    current_aqi: int
    forecast_horizon: str # "2 Hours"
    trend_summary: str
    expected_peak_time: str
    expected_peak_value: float
    confidence_score: float # 0.0 - 1.0
    model_name: str # "Edge Holt-Winters + Multivariate ARIMA (Simulated Demo)"
    model_version: str
    model_status: str # "INFERENCE_HEALTHY"
    is_demonstration_data: bool
    trajectory: List[ForecastTrajectoryPoint]
    drivers: List[str] # List of primary contributing factors
