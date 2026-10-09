from fastapi import APIRouter, Query
from app.schemas.decision import DecisionsPageResponse
from app.services.decision_service import decision_service

router = APIRouter(tags=["Decisions & Actuators"])

@router.get("/decisions", response_model=DecisionsPageResponse)
def get_decisions(node_id: str = Query("NODE-01")):
    """
    Explainable decision engine responses with evaluated rule traces,
    recommended actions, alternate corridors, and local actuator signals.
    """
    return decision_service.get_decisions(node_id=node_id)
