from typing import List, Dict, Any
from datetime import datetime, timezone, timedelta
import math
from app.services.simulation_service import sim_state
from app.schemas.sensor import SensorDetail, SensorReadingItem, SensorFusionResponse, SensorFusionPipelineStage

class SensorService:
    @staticmethod
    def get_node(node_id: str) -> Dict[str, Any]:
        node = sim_state.nodes_data.get(node_id)
        if node is None:
            raise KeyError(node_id)
        return node

    @classmethod
    def ingest_hardware_telemetry(cls, node_id: str, readings: Dict[str, float], timestamp: datetime | None = None) -> dict:
        """Replace configured sensor values with a hardware sample and mark the node live."""
        node = sim_state.nodes_data.get(node_id)
        if node is None:
            raise KeyError(node_id)

        canonical = {key.casefold(): key for key in node["sensors"]}
        unknown = [key for key in readings if key.casefold() not in canonical]
        if unknown:
            raise ValueError(f"Unsupported sensor name(s): {', '.join(unknown)}")

        previous = dict(node["sensors"])
        received_at = datetime.now(timezone.utc)
        sample_at = (timestamp or received_at).astimezone(timezone.utc)
        history = node.setdefault("hardware_history", [])
        for key, value in readings.items():
            sensor_type = canonical[key.casefold()]
            numeric_value = float(value)
            node["sensors"][sensor_type] = numeric_value
            history.append({"sensor_type": sensor_type, "timestamp": sample_at.isoformat(), "value": numeric_value})
        node["hardware_sensor_types"] = sorted(set(node.get("hardware_sensor_types", [])) | {canonical[key.casefold()] for key in readings})
        node["telemetry_source"] = "hardware"
        node["last_telemetry_at"] = sample_at.isoformat()
        node["last_telemetry_received_at"] = received_at.isoformat()
        del history[:-500]
        node["status"] = "ONLINE"

        pm25_old = previous.get("PM2.5", 0.0)
        pm25_new = node["sensors"].get("PM2.5", pm25_old)
        node["rate_of_change_15m"] = round(((pm25_new - pm25_old) / pm25_old) * 100, 1) if pm25_old else 0.0
        return {"node_id": node_id, "accepted": len(readings), "timestamp": node["last_telemetry_at"], "source": "hardware"}

    @classmethod
    def get_sensors_list(cls, node_id: str = "NODE-01") -> List[SensorDetail]:
        sim_state.refresh_demo_readings(node_id)
        node = sim_state.nodes_data.get(node_id, sim_state.nodes_data["NODE-01"])
        sensors = node["sensors"]
        now = datetime.now(timezone.utc)

        sensor_configs = [
            {"type": "PM2.5", "name": "Fine Particulate Matter (PM2.5)", "unit": "µg/m³", "min": 0, "max": 500},
            {"type": "PM10", "name": "Coarse Particulate Matter (PM10)", "unit": "µg/m³", "min": 0, "max": 600},
            {"type": "CO", "name": "Carbon Monoxide (CO)", "unit": "ppm", "min": 0, "max": 50},
            {"type": "CO2", "name": "Carbon Dioxide (CO2)", "unit": "ppm", "min": 350, "max": 5000},
            {"type": "NO2", "name": "Nitrogen Dioxide (NO2)", "unit": "ppb", "min": 0, "max": 200},
            {"type": "VOC", "name": "Volatile Organic Compounds (VOC)", "unit": "ppb", "min": 0, "max": 2000},
            {"type": "Temperature", "name": "Ambient Temperature", "unit": "°C", "min": -10, "max": 60},
            {"type": "Humidity", "name": "Relative Humidity", "unit": "%", "min": 0, "max": 100},
            {"type": "Pressure", "name": "Barometric Pressure", "unit": "hPa", "min": 900, "max": 1100},
            {"type": "MQ7", "name": "MQ-7 Raw Signal", "unit": "ADC counts", "min": 0, "max": 16383},
            {"type": "MQ135", "name": "MQ-135 Raw Signal", "unit": "ADC counts", "min": 0, "max": 16383},
        ]

        results = []
        for cfg in sensor_configs:
            stype = cfg["type"]
            val = sensors.get(stype, 0.0)

            # Generate realistic stable rolling history buffer for live graphs
            actual_history = [item for item in node.get("hardware_history", []) if item["sensor_type"] == stype][-14:]
            if actual_history:
                history_items = [SensorReadingItem(
                    timestamp=datetime.fromisoformat(item["timestamp"]).astimezone(timezone.utc).strftime("%H:%M:%S"),
                    value=round(item["value"], 2)
                ) for item in actual_history]
            else:
                demo_histories = node.setdefault("demo_history", {})
                buffer = demo_histories.setdefault(stype, [])
                now_epoch = now.timestamp()

                if not buffer:
                    # Seed with initial 14 points ending at now
                    for i in range(13, 0, -1):
                        t_pt = now - timedelta(seconds=i * 3)
                        base = val - (node.get("rate_of_change_15m", 10.0) * 0.01 * val * (i / 13.0))
                        pt_val = max(cfg["min"], round(base + math.sin(i * 0.6) * (val * 0.03), 1))
                        buffer.append({"timestamp": t_pt.strftime("%H:%M:%S"), "value": pt_val, "epoch": t_pt.timestamp()})
                    buffer.append({"timestamp": now.strftime("%H:%M:%S"), "value": round(val, 1), "epoch": now_epoch})
                else:
                    last_epoch = buffer[-1].get("epoch", 0)
                    if now_epoch - last_epoch >= 2.0:
                        buffer.append({"timestamp": now.strftime("%H:%M:%S"), "value": round(val, 1), "epoch": now_epoch})
                        if len(buffer) > 16:
                            del buffer[:-16]
                    else:
                        buffer[-1]["value"] = round(val, 1)
                        buffer[-1]["timestamp"] = now.strftime("%H:%M:%S")

                history_items = [SensorReadingItem(timestamp=item["timestamp"], value=item["value"]) for item in buffer]

            status = "OPERATIONAL"
            if node.get("telemetry_source") == "hardware" and stype not in node.get("hardware_sensor_types", []):
                status = "SIMULATED"
            elif stype == "PM2.5" and val > 150:
                status = "CRITICAL_THRESHOLD"
            elif stype == "PM10" and val > 250:
                status = "CRITICAL_THRESHOLD"

            results.append(SensorDetail(
                id=f"{node['id']}_{stype}",
                node_id=node["id"],
                sensor_type=stype,
                display_name=cfg["name"],
                unit=cfg["unit"],
                status=status,
                current_value=round(val, 1),
                min_threshold=cfg["min"],
                max_threshold=cfg["max"],
                trend="RISING" if node.get("rate_of_change_15m", 0) > 4 else ("FALLING" if node.get("rate_of_change_15m", 0) < -4 else "STABLE"),
                rate_of_change_15m=round(node.get("rate_of_change_15m", 0), 1),
                last_reading_time=(datetime.fromisoformat(actual_history[-1]["timestamp"]).astimezone(timezone.utc).strftime("%H:%M:%S") if actual_history else now.strftime("%H:%M:%S")),
                history=history_items
            ))

        return results

    @classmethod
    def get_fusion_pipeline(cls, node_id: str = "NODE-01") -> SensorFusionResponse:
        node = sim_state.nodes_data.get(node_id, sim_state.nodes_data["NODE-01"])
        sensors = node["sensors"]
        now = datetime.now(timezone.utc)

        pm25 = sensors.get("PM2.5", 82.0)
        pm10 = sensors.get("PM10", 126.0)
        co = sensors.get("CO", 2.1)
        temp = sensors.get("Temperature", 27.2)
        rh = sensors.get("Humidity", 71.0)
        ratio = round(pm10 / pm25, 2) if pm25 > 0 else 1.0

        pipeline = [
            SensorFusionPipelineStage(
                stage_number=1,
                name="Hardware Signal Acquisition",
                description="Low-level ADC/I2C/UART sampling orchestrated by STM32 coprocessor at 1 Hz with oversampling.",
                input_signals=["Laser Particulate (PMS5003)", "Electrochemical CO", "NDIR CO2", "BME280 T/RH/P"],
                output_result="Raw millivolts & frequency pulse stream",
                status="PASS"
            ),
            SensorFusionPipelineStage(
                stage_number=2,
                name="Thermal & Cross-Sensitivity Calibration",
                description="Polynomial calibration curves applied to correct electrochemical zero-drift and hygroscopic particulate swelling.",
                input_signals=["Raw sensor voltages", "Ambient Temp (27.2°C)", "Rel Humidity (71%)"],
                output_result=f"RH-corrected particle mass (swelling factor k=0.88 applied)",
                status="PASS"
            ),
            SensorFusionPipelineStage(
                stage_number=3,
                name="Dynamic Moving-Window Filtering",
                description="Edge Kalman filter (process noise Q=0.04, measurement noise R=0.18) cleans high-frequency transient spikes.",
                input_signals=["Continuous time-series stream"],
                output_result="Stabilized 5-minute moving variance vector",
                status="PASS"
            ),
            SensorFusionPipelineStage(
                stage_number=4,
                name="Multi-Channel Feature Extraction",
                description="Extracts particle size distribution ratios (PM10/PM2.5), gas oxidation ratio (CO/CO2), and rate of change (dC/dt).",
                input_signals=["Filtered sensor states"],
                output_result=f"PM-Ratio: {ratio} | CO/CO2: {(co/sensors.get('CO2', 600))*1000:.2f} ‰ | Momentum: +14.2%/15m",
                status="PASS"
            ),
            SensorFusionPipelineStage(
                stage_number=5,
                name="Edge Pollution Fingerprinting & Fusion Matrix",
                description="Multivariate cosine distance evaluated against embedded pollution fingerprint clusters.",
                input_signals=["Extracted feature vector"],
                output_result="Road dust / traffic abrasion cluster match (Cosine sim: 0.88)",
                status="PASS"
            ),
            SensorFusionPipelineStage(
                stage_number=6,
                name="Edge AI Inference & Recommendation Trigger",
                description="Generates AQI, predictive horizon, and actuator dispatch commands on Linux SoC.",
                input_signals=["Cluster match + Local weather vectors"],
                output_result="AQI 168 (Unhealthy) | Advisory dispatched | Damper throttle triggered",
                status="ACTIVE"
            ),
        ]

        return SensorFusionResponse(
            node_id=node["id"],
            timestamp=now.strftime("%Y-%m-%d %H:%M:%S UTC"),
            pipeline=pipeline,
            fingerprint_vector={
                "pm10_to_pm25_ratio": ratio,
                "co_ppm": co,
                "voc_ppb": sensors.get("VOC", 140.0),
                "hygroscopic_factor": 0.88,
                "kalman_variance_score": 0.032
            },
            signature_type="Coarse Particulate Dominance (Mechanical Dust / Turbulence)",
            confidence=0.82,
            environmental_context={
                "boundary_layer_stagnation": "Moderate",
                "inversion_risk": "Low",
                "ventilation_index": "Fair"
            }
        )

sensor_service = SensorService()
