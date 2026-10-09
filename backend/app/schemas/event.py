from pydantic import BaseModel
from typing import List, Optional

class EventDetailItem(BaseModel):
    id: str
    node_id: str
    node_name: str
    title: str
    severity: str # CRITICAL, WARNING, MODERATE, LOW
    suspected_source: str
    confidence: float
    peak_aqi: int
    peak_pm25: float
    peak_pm10: Optional[float] = None
    duration_minutes: int
    is_active: bool
    start_time: str
    end_time: Optional[str] = None
    description: str

class EventsResponse(BaseModel):
    total_count: int
    active_count: int
    events: List[EventDetailItem]
