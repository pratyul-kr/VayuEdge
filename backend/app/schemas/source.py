from pydantic import BaseModel
from typing import List

class SourceFactor(BaseModel):
    sensor_name: str
    observed_level: str # "Very High", "High", "Moderate", "Low", "Stable"
    weight_contribution: float # percentage e.g. 0.45
    impact_description: str

class SourceCandidate(BaseModel):
    category_id: str
    name: str # e.g. "Road Dust / Construction Activity"
    probability: float # 0.0 - 1.0
    is_primary: bool
    evidence_match: str

class SourceAttributionResponse(BaseModel):
    node_id: str
    timestamp: str
    most_likely_source: str
    category_id: str
    confidence: float
    is_estimated: bool
    explanation: str
    supporting_evidence: List[SourceFactor]
    competing_candidates: List[SourceCandidate]
    fingerprint_notes: str
