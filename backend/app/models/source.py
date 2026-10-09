from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from datetime import datetime, timezone
from app.db.database import Base

class SourceAttribution(Base):
    __tablename__ = "source_attributions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    node_id = Column(String(50), ForeignKey("sensor_nodes.id"), index=True)
    source_type = Column(String(100), nullable=False) # e.g. "Road dust / traffic activity", "Biomass / open burning", "Combustion / vehicle exhaust", "Industrial emission"
    confidence = Column(Float, nullable=False) # 0.0 - 1.0 (e.g. 0.78 = 78%)
    category = Column(String(50), default="traffic_dust")
    explanation = Column(Text, nullable=False)
    evidence_json = Column(Text, nullable=False) # JSON string with sensor contributing factors
    is_demo = Column(Integer, default=0)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
