from pydantic import BaseModel, Field
from typing import Dict, List, Optional
from datetime import datetime

class SensorReadingItem(BaseModel):
    timestamp: str
    value: float

class SensorDetail(BaseModel):
    id: str
    node_id: str
    sensor_type: str
    display_name: str
    unit: str
    status: str # OPERATIONAL, DEGRADED, FAULT
    current_value: float
    min_threshold: float
    max_threshold: float
    trend: str # RISING, FALLING, STABLE
    rate_of_change_15m: float
    last_reading_time: str
    history: List[SensorReadingItem] = []

class SensorFusionPipelineStage(BaseModel):
    stage_number: int
    name: str # e.g. "Raw Acquisition", "Hardware Calibration", "Cross-Sensitivity Filtering", "Feature Extraction", "Sensor Fusion Matrix", "Edge AI Inference"
    description: str
    input_signals: List[str]
    output_result: str
    status: str # ACTIVE, PASS

class SensorFusionResponse(BaseModel):
    node_id: str
    timestamp: str
    pipeline: List[SensorFusionPipelineStage]
    fingerprint_vector: dict
    signature_type: str # e.g. "Coarse Particulate Dominance (Dust/Mechanical)"
    confidence: float
    environmental_context: dict

class SensorCreateReading(BaseModel):
    node_id: str
    sensor_type: str
    value: float
    unit: str
    raw_voltage: Optional[float] = None

class HardwareTelemetry(BaseModel):
    """Latest readings forwarded by a physical sensor node."""
    node_id: str = Field(default="NODE-01", min_length=1, max_length=64)
    sensors: Dict[str, float] = Field(min_length=1)
    timestamp: Optional[datetime] = None
