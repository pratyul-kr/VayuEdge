from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from datetime import datetime, timezone
from app.db.database import Base

class PollutionEvent(Base):
    __tablename__ = "pollution_events"

    id = Column(String(50), primary_key=True, index=True) # e.g. EVT-20261007-001
    node_id = Column(String(50), ForeignKey("sensor_nodes.id"), index=True)
    title = Column(String(150), nullable=False)
    severity = Column(String(30), nullable=False) # CRITICAL, WARNING, MODERATE, LOW
    suspected_source = Column(String(100), nullable=False)
    confidence = Column(Float, default=0.75)
    peak_aqi = Column(Integer, nullable=False)
    peak_pm25 = Column(Float, nullable=False)
    peak_pm10 = Column(Float, nullable=True)
    duration_minutes = Column(Integer, default=15)
    is_active = Column(Integer, default=0) # 1 if currently occurring
    start_time = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    end_time = Column(DateTime, nullable=True)
    description = Column(Text, nullable=True)
