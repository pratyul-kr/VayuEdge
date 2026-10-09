from fastapi import APIRouter, Query
from app.schemas.overview import OverviewResponse
from app.services.overview_service import overview_service

router = APIRouter(tags=["Overview"])

@router.get("/overview", response_model=OverviewResponse)
def get_overview(node_id: str = Query("NODE-01", description="ID of the sensor node to inspect")):
    """
    Core Overview endpoint answering the 4 foundational questions:
    1. WHAT IS HAPPENING? (AQI, Category, Dominant Pollutant, Trend)
    2. WHY IS IT HAPPENING? (Likely Source, Confidence, Evidence)
    3. WHAT HAPPENS NEXT? (Forecast Trajectory, +15m/+30m/+60m)
    4. WHAT SHOULD I DO? (Decision Engine Guidance & Local Actuator Action)
    """
    return overview_service.get_overview_data(node_id=node_id)
