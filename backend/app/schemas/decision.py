from pydantic import BaseModel
from typing import List, Optional

class DecisionRuleTrace(BaseModel):
    rule_id: str
    condition_evaluated: str
    threshold_met: bool
    trigger_detail: str

class DecisionDetail(BaseModel):
    id: int
    node_id: str
    timestamp: str
    condition: str
    action: str
    reason: str
    confidence: float
    priority: str # CRITICAL, HIGH, MEDIUM, LOW
    actuator_action: str
    actuator_status: str
    explainability_notes: str

class RecommendationDetail(BaseModel):
    id: int
    title: str
    target_group: str
    advisory: str
    duration_minutes: int
    alternative_route: Optional[str]
    category: str
    medical_disclaimer: str = "Environmental guidance based on edge sensor inference; not medical advice."

class DecisionsPageResponse(BaseModel):
    node_id: str
    active_condition: str
    primary_decision: DecisionDetail
    active_recommendations: List[RecommendationDetail]
    rule_evaluation_traces: List[DecisionRuleTrace]
    recent_decision_history: List[DecisionDetail]
