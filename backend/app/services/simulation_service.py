from typing import Dict, Any, List
import copy
import math
import time
from datetime import datetime, timezone, timedelta
from app.ai.inference import edge_infer
from app.ai.source_attribution import source_engine
from app.ai.forecasting import forecaster
from app.ai.decision_engine import decision_engine

class SystemSimulationState:
    """
    State manager for Edge AI Environmental Intelligence.
    Can operate in Live Edge Hardware acquisition mode or Controlled Demo Scenarios.
    Supports offline mode, sync queues, and multi-node topology.
    """

    def __init__(self):
        self.current_scenario_id = "road_dust"
        self.is_internet_connected = True
        self.is_syncing = False
        self.last_sync_time = datetime.now(timezone.utc) - timedelta(minutes=4)
        self.unsynced_records_count = 0
        self.offline_since = None

        # Multi-node states
        self.nodes_data: Dict[str, Dict[str, Any]] = {
            "NODE-01": {
                "id": "NODE-01",
                "name": "Main Gate & Perimeter",
                "location": "North Campus Quad (UNO-Q Primary)",
                "status": "ONLINE",
                "grid_x": 0,
                "grid_y": 0,
                "battery_level": 94.0,
                "ip_address": "192.168.4.101",
                "hardware_model": "Arduino UNO Q (Linux + STM32)",
                "sensors": {
                    "PM2.5": 82.0,
                    "PM10": 126.0,
                    "CO": 2.1,
                    "CO2": 612.0,
                    "NO2": 28.5,
                    "VOC": 140.0,
                    "Temperature": 27.2,
                    "Humidity": 71.0,
                    "Pressure": 1013.2,
                    "MQ7": 105.0,
                    "MQ135": 167.0
                },
                "rate_of_change_15m": 14.2
            },
            "NODE-02": {
                "id": "NODE-02",
                "name": "Canteen & Dining Court",
                "location": "Central Dining Complex",
                "status": "ONLINE",
                "grid_x": 1,
                "grid_y": 0,
                "battery_level": 88.0,
                "ip_address": "192.168.4.102",
                "hardware_model": "Arduino UNO Q Node B",
                "sensors": {
                    "PM2.5": 54.0,
                    "PM10": 72.0,
                    "CO": 1.6,
                    "CO2": 720.0,
                    "NO2": 22.0,
                    "VOC": 210.0,
                    "Temperature": 28.5,
                    "Humidity": 68.0,
                    "Pressure": 1013.1
                },
                "rate_of_change_15m": 4.1
            },
            "NODE-03": {
                "id": "NODE-03",
                "name": "Engineering Workshop",
                "location": "Heavy Machinery & Fabrication Lab",
                "status": "ONLINE",
                "grid_x": 0,
                "grid_y": 1,
                "battery_level": 98.0,
                "ip_address": "192.168.4.103",
                "hardware_model": "Arduino UNO Q Node C",
                "sensors": {
                    "PM2.5": 94.0,
                    "PM10": 160.0,
                    "CO": 2.8,
                    "CO2": 650.0,
                    "NO2": 32.0,
                    "VOC": 280.0,
                    "Temperature": 29.1,
                    "Humidity": 64.0,
                    "Pressure": 1013.0
                },
                "rate_of_change_15m": 18.5
            },
            "NODE-04": {
                "id": "NODE-04",
                "name": "Library Botanical Courtyard",
                "location": "West Green Buffer",
                "status": "ONLINE",
                "grid_x": 1,
                "grid_y": 1,
                "battery_level": 91.0,
                "ip_address": "192.168.4.104",
                "hardware_model": "Arduino UNO Q Node D",
                "sensors": {
                    "PM2.5": 24.0,
                    "PM10": 38.0,
                    "CO": 0.8,
                    "CO2": 440.0,
                    "NO2": 12.0,
                    "VOC": 70.0,
                    "Temperature": 25.8,
                    "Humidity": 62.0,
                    "Pressure": 1013.4
                },
                "rate_of_change_15m": -2.1
            }
        }

        # Stable baselines let the demo readings move smoothly without
        # accumulating error from one dashboard refresh to the next.
        self.demo_baselines = {
            node_id: copy.deepcopy(node["sensors"])
            for node_id, node in self.nodes_data.items()
        }

        # Scenario definitions
        self.scenarios = {
            "road_dust": {
                "name": "Road Dust / Traffic Activity Event",
                "description": "High coarse particulate spike (PM10: 126, PM2.5: 82, ratio 1.54) with moderate CO from surface road abrasion.",
                "sensors": {
                    "PM2.5": 82.0,
                    "PM10": 126.0,
                    "CO": 2.1,
                    "CO2": 612.0,
                    "NO2": 28.5,
                    "VOC": 140.0,
                    "Temperature": 27.2,
                    "Humidity": 71.0,
                    "Pressure": 1013.2
                },
                "rate_of_change_15m": 14.2,
                "is_offline": False
            },
            "normal": {
                "name": "Clean / Nominal Baseline",
                "description": "Clear atmosphere across all quadrants. All parameters safely below national advisory limits.",
                "sensors": {
                    "PM2.5": 14.0,
                    "PM10": 26.0,
                    "CO": 0.6,
                    "CO2": 430.0,
                    "NO2": 11.0,
                    "VOC": 65.0,
                    "Temperature": 25.0,
                    "Humidity": 58.0,
                    "Pressure": 1014.0
                },
                "rate_of_change_15m": -1.5,
                "is_offline": False
            },
            "traffic": {
                "name": "Heavy Combustion & Traffic Plume",
                "description": "Vehicle exhaust surge with high carbon monoxide (4.8 ppm), elevated fine particulates (PM2.5: 98), and volatile hydrocarbons.",
                "sensors": {
                    "PM2.5": 98.0,
                    "PM10": 118.0,
                    "CO": 4.8,
                    "CO2": 890.0,
                    "NO2": 52.0,
                    "VOC": 340.0,
                    "Temperature": 28.4,
                    "Humidity": 69.0,
                    "Pressure": 1012.8
                },
                "rate_of_change_15m": 22.0,
                "is_offline": False
            },
            "spike": {
                "name": "Critical Pollution Spike Event",
                "description": "Rapid escalation exceeding emergency thresholds (PM2.5: 165, PM10: 245), triggering urgent HVAC isolation and local alert.",
                "sensors": {
                    "PM2.5": 165.0,
                    "PM10": 245.0,
                    "CO": 5.4,
                    "CO2": 1020.0,
                    "NO2": 68.0,
                    "VOC": 420.0,
                    "Temperature": 29.5,
                    "Humidity": 74.0,
                    "Pressure": 1011.9
                },
                "rate_of_change_15m": 38.5,
                "is_offline": False
            },
            "forecast_worsening": {
                "name": "Forecasted Stagnation & Worsening",
                "description": "Boundary-layer inversion trapping particulates with steady accumulation forecast over the next 60-90 minutes.",
                "sensors": {
                    "PM2.5": 68.0,
                    "PM10": 98.0,
                    "CO": 2.4,
                    "CO2": 680.0,
                    "NO2": 34.0,
                    "VOC": 190.0,
                    "Temperature": 24.2,
                    "Humidity": 85.0,
                    "Pressure": 1015.1
                },
                "rate_of_change_15m": 12.0,
                "is_offline": False
            },
            "offline": {
                "name": "Internet Disconnected (Edge Standalone Mode)",
                "description": "Simulates complete loss of upstream network connectivity. Edge intelligence, local buffering, and decision actuation remain fully functional.",
                "sensors": {
                    "PM2.5": 82.0,
                    "PM10": 126.0,
                    "CO": 2.1,
                    "CO2": 612.0,
                    "NO2": 28.5,
                    "VOC": 140.0,
                    "Temperature": 27.2,
                    "Humidity": 71.0,
                    "Pressure": 1013.2
                },
                "rate_of_change_15m": 14.2,
                "is_offline": True
            }
        }

    def refresh_demo_readings(self, node_id: str = "NODE-01") -> None:
        """Advance simulated readings slightly whenever a live view is read."""
        node = self.nodes_data.get(node_id)
        if node is None:
            return

        # Keep fresh hardware data intact, then resume demo values when it goes stale.
        received = node.get("last_telemetry_received_at")
        hardware_age = None
        if received:
            hardware_age = (datetime.now(timezone.utc) - datetime.fromisoformat(received)).total_seconds()
        if node.get("telemetry_source") == "hardware" and hardware_age is not None and hardware_age <= 30:
            return

        baseline = self.demo_baselines.get(node_id, node["sensors"])
        elapsed = time.monotonic()
        phase_offsets = {
            "PM2.5": 0.0, "PM10": 0.7, "CO": 1.4, "CO2": 2.1,
            "NO2": 2.8, "VOC": 3.5, "Temperature": 4.2,
            "Humidity": 4.9, "Pressure": 5.6, "MQ7": 6.3, "MQ135": 7.0,
        }
        for index, (sensor_type, base_value) in enumerate(baseline.items()):
            amplitude = 0.008 if sensor_type in {"Temperature", "Humidity", "Pressure"} else 0.022
            # Dual-harmonic wave gives an organic, continuous, realistic sensor drift
            wave1 = math.sin(elapsed * 0.65 + phase_offsets.get(sensor_type, index * 0.6))
            wave2 = 0.3 * math.sin(elapsed * 1.8 + phase_offsets.get(sensor_type, index * 0.4))
            combined_wave = (wave1 + wave2) / 1.3
            node["sensors"][sensor_type] = round(base_value * (1.0 + amplitude * combined_wave), 2)

        node["telemetry_source"] = "demo"
        node["hardware_sensor_types"] = []

    def set_scenario(self, scenario_id: str) -> Dict[str, Any]:
        if scenario_id not in self.scenarios:
            raise ValueError(f"Unknown scenario: {scenario_id}")
        
        self.current_scenario_id = scenario_id
        sc = self.scenarios[scenario_id]

        # Apply sensors to NODE-01
        self.nodes_data["NODE-01"]["sensors"] = copy.deepcopy(sc["sensors"])
        self.nodes_data["NODE-01"]["sensors"].update({"MQ7": 105.0, "MQ135": 167.0})
        self.demo_baselines["NODE-01"] = copy.deepcopy(self.nodes_data["NODE-01"]["sensors"])
        self.nodes_data["NODE-01"]["rate_of_change_15m"] = sc["rate_of_change_15m"]

        if sc["is_offline"]:
            self.is_internet_connected = False
            self.offline_since = datetime.now(timezone.utc) - timedelta(minutes=14)
            self.unsynced_records_count = 42
        else:
            self.is_internet_connected = True
            self.offline_since = None

        return {
            "scenario_id": scenario_id,
            "name": sc["name"],
            "description": sc["description"],
            "is_offline": not self.is_internet_connected,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }

    def toggle_offline_state(self, force_offline: bool | None = None) -> bool:
        if force_offline is not None:
            self.is_internet_connected = not force_offline
        else:
            self.is_internet_connected = not self.is_internet_connected

        if not self.is_internet_connected:
            self.offline_since = datetime.now(timezone.utc)
            self.unsynced_records_count += 6
        else:
            self.offline_since = None

        return self.is_internet_connected

    def trigger_sync(self) -> Dict[str, Any]:
        count = self.unsynced_records_count
        self.is_syncing = True
        self.last_sync_time = datetime.now(timezone.utc)
        self.unsynced_records_count = 0
        self.is_syncing = False
        return {
            "success": True,
            "message": f"Successfully synchronized {count} edge telemetry records to upstream store.",
            "synced_records": count,
            "sync_status": "COMPLETED"
        }

sim_state = SystemSimulationState()
