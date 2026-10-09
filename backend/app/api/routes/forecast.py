from fastapi import APIRouter, Query
from app.schemas.forecast import ForecastDetailResponse
from app.services.forecast_service import forecast_service

router = APIRouter(tags=["Forecasting"])

@router.get("/forecast", response_model=ForecastDetailResponse)
def get_forecast(node_id: str = Query("NODE-01")):
    """
    Detailed time-series forecasting with historical ground-truth vs predictive trajectory,
    uncertainty intervals (90% confidence), and physical driver attributions.
    """
    return forecast_service.get_forecast_detail(node_id=node_id)
