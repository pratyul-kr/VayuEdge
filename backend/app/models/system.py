from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from datetime import datetime, timezone
from app.db.database import Base

class SystemStatus(Base):
    __tablename__ = "system_status"

    id = Column(Integer, primary_key=True, autoincrement=True)
    node_id = Column(String(50), ForeignKey("sensor_nodes.id"), index=True)
    cpu_usage_pct = Column(Float, default=18.5)
    memory_usage_mb = Column(Float, default=245.0)
    temperature_c = Column(Float, default=42.1)
    mcu_comm_status = Column(String(30), default="CONNECTED_UART") # CONNECTED_UART, RPC_HEALTHY, DISCONNECTED
    edge_mode = Column(String(30), default="STANDALONE_OFFLINE") # STANDALONE_OFFLINE, LOCAL_STORAGE, MESH_GATEWAY
    inference_latency_ms = Column(Float, default=14.2)
    storage_free_mb = Column(Float, default=1840.0)
    sensors_operational = Column(Integer, default=8)
    sensors_total = Column(Integer, default=8)
    firmware_version = Column(String(50), default="v1.2.0-unoq-edge")
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)

class SyncRecord(Base):
    __tablename__ = "sync_records"

    id = Column(Integer, primary_key=True, autoincrement=True)
    node_id = Column(String(50), ForeignKey("sensor_nodes.id"), index=True)
    sync_type = Column(String(50), default="INCREMENTAL_BATCH")
    records_count = Column(Integer, default=0)
    status = Column(String(30), default="PENDING") # PENDING, SYNCING, COMPLETED, FAILED
    error_message = Column(Text, nullable=True)
    synced_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
