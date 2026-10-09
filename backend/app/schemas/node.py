from pydantic import BaseModel
from typing import List, Optional

class SensorSummarySimple(BaseModel):
    sensor_type: str
    value: float
    unit: str
    status: str

class NodeDetailItem(BaseModel):
    id: str
    name: str
    location: str
    status: str # ONLINE, OFFLINE, DEGRADED, MAINTENANCE
    current_aqi: int
    aqi_category: str
    battery_level: float
    ip_address: str
    hardware_model: str
    grid_x: int
    grid_y: int
    last_seen: str
    last_sync_desc: str
    sensors_operational: int
    sensors_total: int
    key_pollutants: List[SensorSummarySimple] = []

class NodesResponse(BaseModel):
    total_nodes: int
    online_count: int
    offline_count: int
    nodes: List[NodeDetailItem]

class MapGridCell(BaseModel):
    grid_x: int
    grid_y: int
    zone_name: str
    intensity_aqi: int
    category: str
    assigned_node_id: Optional[str] = None
    node_name: Optional[str] = None
    status: str

class LocalMapResponse(BaseModel):
    area_name: str
    grid_dimensions: dict # {"rows": 3, "cols": 3}
    cells: List[MapGridCell]
    highest_polluted_zone: str
    spread_direction: str
    dispersion_assessment: str
