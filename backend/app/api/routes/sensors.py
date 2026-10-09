from fastapi import APIRouter, Query, HTTPException
from datetime import datetime, timezone
import math
from typing import List
from app.schemas.sensor import SensorDetail, SensorFusionResponse, HardwareTelemetry
from app.services.sensor_service import sensor_service

router = APIRouter(tags=["Sensors & Fusion"])

@router.post("/hardware/telemetry")
def ingest_hardware_telemetry(payload: HardwareTelemetry):
    """Accept a sensor sample forwarded by the UNO Q Linux app or another gateway."""
    for name, value in payload.sensors.items():
        if not math.isfinite(value):
            raise HTTPException(status_code=422, detail=f"Sensor '{name}' must be a finite number")
    try:
        return sensor_service.ingest_hardware_telemetry(payload.node_id, payload.sensors, payload.timestamp)
    except KeyError:
        raise HTTPException(status_code=404, detail=f"Unknown node '{payload.node_id}'")
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc))

@router.get("/hardware/status")
def get_hardware_status(node_id: str = Query("NODE-01")):
    try:
        node = sensor_service.get_node(node_id)
    except KeyError:
        raise HTTPException(status_code=404, detail=f"Unknown node '{node_id}'")
    last = node.get("last_telemetry_at")
    received = node.get("last_telemetry_received_at")
    age_seconds = None
    if received:
        age_seconds = max(0, (datetime.now(timezone.utc) - datetime.fromisoformat(received)).total_seconds())
    return {
        "node_id": node_id,
        "connected": age_seconds is not None and age_seconds <= 30,
        "source": node.get("telemetry_source", "demo"),
        "last_telemetry_at": last,
        "age_seconds": age_seconds,
        "stale_after_seconds": 30,
    }

@router.get("/sensors", response_model=List[SensorDetail])
def get_all_sensors(node_id: str = Query("NODE-01", description="ID of sensor node")):
    """
    Get all active hardware and calibrated environmental sensors with real-time readings and trend history.
    """
    return sensor_service.get_sensors_list(node_id=node_id)

@router.get("/sensors/{sensor_type}", response_model=SensorDetail)
def get_single_sensor(sensor_type: str, node_id: str = Query("NODE-01")):
    """
    Get detailed metrics, calibration curve, and historical buffer for a specific sensor channel.
    """
    sensors = sensor_service.get_sensors_list(node_id=node_id)
    for s in sensors:
        if s.sensor_type.lower() == sensor_type.lower():
            return s
    raise HTTPException(status_code=404, detail=f"Sensor '{sensor_type}' not found on node {node_id}")

@router.get("/sensor-fusion", response_model=SensorFusionResponse)
def get_sensor_fusion_pipeline(node_id: str = Query("NODE-01")):
    """
    Detailed technical pipeline inspection explaining how multi-sensor telemetry transitions
    through raw acquisition, calibration, Kalman filtering, feature extraction, and fusion matrix.
    """
    return sensor_service.get_fusion_pipeline(node_id=node_id)
