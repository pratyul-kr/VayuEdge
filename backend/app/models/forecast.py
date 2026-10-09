from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from datetime import datetime, timezone
from app.db.database import Base

class Forecast(Base):
    __tablename__ = "forecasts"

    id = Column(Integer, primary_key=True, autoincrement=True)
    node_id = Column(String(50), ForeignKey("sensor_nodes.id"), index=True)
    pollutant = Column(String(20), default="AQI") # AQI, PM2.5, PM10
    forecast_horizon_minutes = Column(Integer, nullable=False) # 15, 30, 45, 60, 120
    target_time = Column(DateTime, nullable=False)
    predicted_value = Column(Float, nullable=False)
    lower_bound = Column(Float, nullable=False) # 90% confidence lower bound
    upper_bound = Column(Float, nullable=False) # 90% confidence upper bound
    confidence = Column(Float, default=0.82) # e.g. 0.82 (82%)
    trend = Column(String(20), default="RISING") # RISING, FALLING, STABLE
    model_type = Column(String(50), default="Edge-HoltWinters-ARIMA") # Edge model type
    is_demo = Column(Integer, default=0) # 1 if simulated scenario
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
