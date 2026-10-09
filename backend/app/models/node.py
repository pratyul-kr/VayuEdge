from sqlalchemy import Column, String, Float, DateTime, Integer
from datetime import datetime, timezone
from app.db.database import Base

class SensorNode(Base):
    __tablename__ = "sensor_nodes"

    id = Column(String(50), primary_key=True, index=True) # e.g. NODE-01
    name = Column(String(100), nullable=False)
    location = Column(String(150), nullable=False)
    status = Column(String(30), default="ONLINE") # ONLINE, OFFLINE, DEGRADED, MAINTENANCE
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    grid_x = Column(Integer, default=0)
    grid_y = Column(Integer, default=0)
    battery_level = Column(Float, default=100.0)
    ip_address = Column(String(45), default="127.0.0.1")
    hardware_model = Column(String(100), default="Arduino UNO Q")
    current_aqi = Column(Integer, default=50)
    last_seen = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
