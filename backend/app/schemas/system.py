from pydantic import BaseModel
from typing import List, Optional

class SystemStatusResponse(BaseModel):
    node_id: str
    hardware_platform: str # "Arduino UNO Q (Linux Core + STM32 Coprocessor)"
    firmware_version: str
    edge_mode: str # "STANDALONE_OFFLINE", "CONNECTED_GATEWAY", "SYNCING"
    is_internet_connected: bool
    is_syncing: bool
    last_sync_timestamp: str
    unsynced_readings_queued: int
    cpu_usage_pct: float
    memory_usage_mb: float
    temperature_c: float
    mcu_comm_status: str # "RPC_HEALTHY_UART"
    inference_latency_ms: float
    storage_free_mb: float
    sensors_operational: int
    sensors_total: int
    architecture_overview: dict

class DemoScenarioRequest(BaseModel):
    scenario_id: str # "normal", "traffic", "road_dust", "spike", "forecast_worsening", "offline"

class DemoScenarioResponse(BaseModel):
    scenario_id: str
    name: str
    description: str
    active_aqi: int
    status: str
    likely_source: str
    decision_action: str
    timestamp: str

class SyncQueueItem(BaseModel):
    id: int
    type: str
    count: int
    timestamp: str

class SyncTriggerResponse(BaseModel):
    success: bool
    message: str
    synced_records: int
    sync_status: str
