from typing import List, Dict, Any
from datetime import datetime, timezone
from app.services.simulation_service import sim_state
from app.ai.inference import edge_infer
from app.schemas.node import (
    NodesResponse,
    NodeDetailItem,
    LocalMapResponse,
    MapGridCell,
    SensorSummarySimple
)

class NodeService:
    @classmethod
    def get_nodes(cls) -> NodesResponse:
        items: List[NodeDetailItem] = []
        online_count = 0
        offline_count = 0

        for nid, ndata in sim_state.nodes_data.items():
            aqi_info = edge_infer.evaluate_overall_aqi(ndata["sensors"])
            status = ndata["status"]
            if not sim_state.is_internet_connected and nid == "NODE-01":
                status = "OFFLINE_STANDALONE"
            
            if "ONLINE" in status:
                online_count += 1
            else:
                offline_count += 1

            sensors_summary = [
                SensorSummarySimple(
                    sensor_type="PM2.5",
                    value=round(ndata["sensors"]["PM2.5"], 1),
                    unit="µg/m³",
                    status="HIGH" if ndata["sensors"]["PM2.5"] > 60 else "NORMAL"
                ),
                SensorSummarySimple(
                    sensor_type="PM10",
                    value=round(ndata["sensors"]["PM10"], 1),
                    unit="µg/m³",
                    status="HIGH" if ndata["sensors"]["PM10"] > 100 else "NORMAL"
                ),
                SensorSummarySimple(
                    sensor_type="CO",
                    value=round(ndata["sensors"]["CO"], 1),
                    unit="ppm",
                    status="NORMAL"
                ),
            ]

            sync_desc = "Synced < 5s ago" if sim_state.is_internet_connected else "Buffered locally (42 unpushed)"

            items.append(
                NodeDetailItem(
                    id=ndata["id"],
                    name=ndata["name"],
                    location=ndata["location"],
                    status=status,
                    current_aqi=aqi_info["aqi"],
                    aqi_category=aqi_info["status"],
                    battery_level=ndata["battery_level"],
                    ip_address=ndata["ip_address"],
                    hardware_model=ndata["hardware_model"],
                    grid_x=ndata["grid_x"],
                    grid_y=ndata["grid_y"],
                    last_seen="Just now",
                    last_sync_desc=sync_desc,
                    sensors_operational=8,
                    sensors_total=8,
                    key_pollutants=sensors_summary
                )
            )

        return NodesResponse(
            total_nodes=len(items),
            online_count=online_count,
            offline_count=offline_count,
            nodes=items
        )

    @classmethod
    def get_local_map(cls) -> LocalMapResponse:
        cells = [
            MapGridCell(
                grid_x=0, grid_y=0,
                zone_name="North Perimeter / Main Gate",
                intensity_aqi=edge_infer.evaluate_overall_aqi(sim_state.nodes_data["NODE-01"]["sensors"])["aqi"],
                category=edge_infer.evaluate_overall_aqi(sim_state.nodes_data["NODE-01"]["sensors"])["status"],
                assigned_node_id="NODE-01",
                node_name="Main Gate (UNO-Q)",
                status="ACTIVE"
            ),
            MapGridCell(
                grid_x=1, grid_y=0,
                zone_name="Central Plaza & Canteen",
                intensity_aqi=edge_infer.evaluate_overall_aqi(sim_state.nodes_data["NODE-02"]["sensors"])["aqi"],
                category=edge_infer.evaluate_overall_aqi(sim_state.nodes_data["NODE-02"]["sensors"])["status"],
                assigned_node_id="NODE-02",
                node_name="Dining Court",
                status="ACTIVE"
            ),
            MapGridCell(
                grid_x=2, grid_y=0,
                zone_name="East Transit Drop-off",
                intensity_aqi=110,
                category="POOR",
                assigned_node_id=None,
                node_name="Interpolated Spatial Cell",
                status="ESTIMATED"
            ),
            MapGridCell(
                grid_x=0, grid_y=1,
                zone_name="Engineering Tech Workshop",
                intensity_aqi=edge_infer.evaluate_overall_aqi(sim_state.nodes_data["NODE-03"]["sensors"])["aqi"],
                category=edge_infer.evaluate_overall_aqi(sim_state.nodes_data["NODE-03"]["sensors"])["status"],
                assigned_node_id="NODE-03",
                node_name="Workshop Lab",
                status="ACTIVE"
            ),
            MapGridCell(
                grid_x=1, grid_y=1,
                zone_name="Central Library Courtyard",
                intensity_aqi=edge_infer.evaluate_overall_aqi(sim_state.nodes_data["NODE-04"]["sensors"])["aqi"],
                category=edge_infer.evaluate_overall_aqi(sim_state.nodes_data["NODE-04"]["sensors"])["status"],
                assigned_node_id="NODE-04",
                node_name="Botanical Buffer",
                status="ACTIVE"
            ),
            MapGridCell(
                grid_x=2, grid_y=1,
                zone_name="East Sports Field",
                intensity_aqi=52,
                category="MODERATE",
                assigned_node_id=None,
                node_name="Interpolated Spatial Cell",
                status="ESTIMATED"
            ),
            MapGridCell(
                grid_x=0, grid_y=2,
                zone_name="South Parking Structure",
                intensity_aqi=88,
                category="MODERATE",
                assigned_node_id=None,
                node_name="Interpolated Spatial Cell",
                status="ESTIMATED"
            ),
            MapGridCell(
                grid_x=1, grid_y=2,
                zone_name="Student Residences",
                intensity_aqi=42,
                category="GOOD",
                assigned_node_id=None,
                node_name="Interpolated Spatial Cell",
                status="ESTIMATED"
            ),
            MapGridCell(
                grid_x=2, grid_y=2,
                zone_name="South-East Woodland Grove",
                intensity_aqi=26,
                category="GOOD",
                assigned_node_id=None,
                node_name="Interpolated Spatial Cell",
                status="ESTIMATED"
            ),
        ]

        # Find highest zone
        highest_cell = max(cells, key=lambda c: c.intensity_aqi)

        return LocalMapResponse(
            area_name="Innovation Campus & Surrounding Transit Corridor",
            grid_dimensions={"rows": 3, "cols": 3},
            cells=cells,
            highest_polluted_zone=f"{highest_cell.zone_name} (AQI {highest_cell.intensity_aqi})",
            spread_direction="North-to-South Eastward Dispersion along prevailing wind vector",
            dispersion_assessment="Localized particulate concentration at northern boundary; buffer courtyard provides clean sanctuary."
        )

node_service = NodeService()
