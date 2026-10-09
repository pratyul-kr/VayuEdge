from pydantic import BaseModel
from typing import List

class PredictionCardItem(BaseModel):
    id: str
    title: str # e.g. "Pollution Spike Event", "AQI Threshold Crossing", "Wind Stagnation Risk"
    probability_pct: int
    severity: str # LOW, MODERATE, HIGH, CRITICAL
    time_horizon: str # "Within 20–30 minutes"
    evidence_summary: str
    expected_impact: str
    confidence_level: str # "High", "Moderate", "Tentative"

class PredictionsResponse(BaseModel):
    node_id: str
    timestamp: str
    active_predictions: List[PredictionCardItem]
    risk_index_score: int # 0 - 100
    peak_risk_window: str # e.g. "14:45 – 15:30"
    model_inference_status: str
