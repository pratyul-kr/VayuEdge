from fastapi import APIRouter
from app.schemas.event import EventsResponse
from app.services.event_service import event_service

router = APIRouter(tags=["Pollution Events"])

@router.get("/events", response_model=EventsResponse)
def get_pollution_events():
    """
    List historical and active pollution events with detected anomalies,
    suspected source tags, peak severity, and duration.
    """
    return event_service.get_events()
