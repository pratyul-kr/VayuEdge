from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from datetime import datetime, timezone
from app.db.database import Base

class Decision(Base):
    __tablename__ = "decisions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    node_id = Column(String(50), ForeignKey("sensor_nodes.id"), index=True)
    condition = Column(String(200), nullable=False) # e.g. "PM2.5 rapidly increasing (>15% in 5 min)"
    action = Column(String(200), nullable=False) # e.g. "Trigger local health warning & throttle outdoor intake"
    reason = Column(Text, nullable=False) # e.g. "Rapid increase sustained over 5 minutes with particulate signature"
    confidence = Column(Float, default=0.85)
    priority = Column(String(20), default="HIGH") # CRITICAL, HIGH, MEDIUM, LOW
    actuator_action = Column(String(100), default="VENTILATION_DAMPER_SEAL") # Actuator command for UNO-Q
    actuator_status = Column(String(30), default="TRIGGERED") # TRIGGERED, IDLE, MANUAL_OVERRIDE
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)

class Recommendation(Base):
    __tablename__ = "recommendations"

    id = Column(Integer, primary_key=True, autoincrement=True)
    node_id = Column(String(50), ForeignKey("sensor_nodes.id"), index=True)
    title = Column(String(150), nullable=False)
    advisory = Column(Text, nullable=False)
    duration_minutes = Column(Integer, default=45)
    alternative_route = Column(String(150), nullable=True) # e.g. "Prefer west-side indoor corridor / west perimeter"
    target_group = Column(String(100), default="All Individuals & Sensitive Groups")
    category = Column(String(50), default="OUTDOOR_ACTIVITY") # OUTDOOR_ACTIVITY, VENTILATION, ROUTE_CHOICE
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
