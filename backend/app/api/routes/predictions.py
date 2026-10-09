from fastapi import APIRouter, Query
from app.schemas.prediction import PredictionsResponse
from app.services.prediction_service import prediction_service

router = APIRouter(tags=["Predictions"])

@router.get("/predictions", response_model=PredictionsResponse)
def get_predictions(node_id: str = Query("NODE-01")):
    """
    Probabilistic forward event predictions (e.g. threshold breaches, inversion risks).
    """
    return prediction_service.get_predictions(node_id=node_id)
