from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Index
from datetime import datetime, timezone
from app.db.database import Base

class Sensor(Base):
    __tablename__ = "sensors"

    id = Column(String(60), primary_key=True, index=True) # e.g. NODE-01_PM25
    node_id = Column(String(50), ForeignKey("sensor_nodes.id"), index=True)
    sensor_type = Column(String(50), nullable=False) # PM2.5, PM10, CO, CO2, NO2, VOC, Temperature, Humidity, Pressure
    unit = Column(String(20), nullable=False)
    status = Column(String(30), default="OPERATIONAL") # OPERATIONAL, DEGRADED, CALIBRATING, FAULT
    min_range = Column(Float, default=0.0)
    max_range = Column(Float, default=1000.0)
    last_reading_value = Column(Float, default=0.0)
    trend = Column(String(20), default="STABLE") # RISING, FALLING, STABLE
    rate_of_change_15m = Column(Float, default=0.0) # Percentage change over last 15 min
    last_reading_time = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class SensorReading(Base):
    __tablename__ = "sensor_readings"

    id = Column(Integer, primary_key=True, autoincrement=True)
    node_id = Column(String(50), ForeignKey("sensor_nodes.id"), index=True)
    sensor_type = Column(String(50), nullable=False, index=True)
    value = Column(Float, nullable=False)
    unit = Column(String(20), nullable=False)
    raw_voltage = Column(Float, nullable=True) # For MCU calibration verification
    is_anomaly = Column(Integer, default=0)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)

    __table_args__ = (
        Index("ix_node_sensor_time", "node_id", "sensor_type", "timestamp"),
    )
