from typing import Dict, Any, List
from datetime import datetime, timezone, timedelta
from app.services.simulation_service import sim_state
from app.ai.inference import edge_infer
from app.ai.source_attribution import source_engine
from app.ai.forecasting import forecaster
from app.ai.decision_engine import decision_engine
from app.schemas.overview import (
    OverviewResponse,
    CurrentAirQuality,
    QuickSensorItem,
    SourceSnippet,
    ForecastSnippet,
    ForecastPoint,
    DecisionSnippet,
    MapNodeSnippet,
    RecentEventSnippet
)

class OverviewService:
    @classmethod
    def get_overview_data(cls, node_id: str = "NODE-01") -> OverviewResponse:
        sim_state.refresh_demo_readings(node_id)
        node = sim_state.nodes_data.get(node_id, sim_state.nodes_data["NODE-01"])
        sensors = node["sensors"]
        rate_of_change = node.get("rate_of_change_15m", 12.0)

        # 1. WHAT IS HAPPENING?
        aqi_info = edge_infer.evaluate_overall_aqi(sensors)
        trend_label = "RISING" if rate_of_change > 5.0 else ("FALLING" if rate_of_change < -5.0 else "STABLE")
        
        # 2. WHY IS IT HAPPENING?
        source_info = source_engine.attribute_source(sensors)
        
        # 3. WHAT HAPPENS NEXT?
        fc_info = forecaster.generate_forecast(
            current_aqi=aqi_info["aqi"],
            current_pm25=sensors.get("PM2.5", 25.0),
            rate_of_change_pct=rate_of_change,
            source_category=source_info["category_id"]
        )

        # 4. WHAT SHOULD I DO?
        dec_info = decision_engine.evaluate(
            aqi=aqi_info["aqi"],
            status=aqi_info["status"],
            dominant_pollutant=aqi_info["dominant_pollutant"],
            trend=trend_label,
            likely_source=source_info["most_likely_source"],
            rate_of_change_pct=rate_of_change
        )

        now = datetime.now(timezone.utc)
        hardware_sample_at = node.get("last_telemetry_received_at")
        hardware_age = (now - datetime.fromisoformat(hardware_sample_at)).total_seconds() if hardware_sample_at else None
        hardware_live = hardware_age is not None and hardware_age <= 30
        if hardware_live:
            freshness_str = f"Arduino UNO Q telemetry ({int(hardware_age)}s ago)"
        elif node.get("telemetry_source") == "hardware":
            freshness_str = "Arduino UNO Q telemetry is stale"
        elif not sim_state.is_internet_connected and sim_state.offline_since:
            mins_ago = max(1, int((now - sim_state.offline_since).total_seconds() / 60))
            freshness_str = f"Last synchronized {mins_ago} min ago (Edge Standalone)"
        else:
            freshness_str = "Live edge telemetry (Updated < 2s ago)"

        # Quick sensors
        quick_sensors = [
            QuickSensorItem(
                sensor_type="PM2.5",
                name="Fine Particles",
                value=round(sensors["PM2.5"], 1),
                unit="µg/m³",
                status="CRITICAL" if sensors["PM2.5"] > 150 else ("HIGH" if sensors["PM2.5"] > 55 else "HEALTHY"),
                trend=trend_label
            ),
            QuickSensorItem(
                sensor_type="PM10",
                name="Coarse Dust",
                value=round(sensors["PM10"], 1),
                unit="µg/m³",
                status="CRITICAL" if sensors["PM10"] > 250 else ("HIGH" if sensors["PM10"] > 100 else "HEALTHY"),
                trend=trend_label
            ),
            QuickSensorItem(
                sensor_type="CO",
                name="Carbon Monoxide",
                value=round(sensors["CO"], 1),
                unit="ppm",
                status="ELEVATED" if sensors["CO"] > 3.0 else "HEALTHY",
                trend="STABLE"
            ),
            QuickSensorItem(
                sensor_type="CO2",
                name="Carbon Dioxide",
                value=round(sensors["CO2"], 0),
                unit="ppm",
                status="ELEVATED" if sensors["CO2"] > 800 else "HEALTHY",
                trend="STABLE"
            ),
            QuickSensorItem(
                sensor_type="Temperature",
                name="Temperature",
                value=round(sensors["Temperature"], 1),
                unit="°C",
                status="HEALTHY",
                trend="STABLE"
            ),
            QuickSensorItem(
                sensor_type="Humidity",
                name="Rel. Humidity",
                value=round(sensors["Humidity"], 0),
                unit="%",
                status="HEALTHY",
                trend="STABLE"
            ),
        ]

        # Forecast Points for Overview
        fc_points = [
            ForecastPoint(
                time_label=p["time_label"],
                predicted_aqi=p["predicted_aqi"],
                lower_bound=p["lower_bound"],
                upper_bound=p["upper_bound"],
                trend=p["trend"]
            )
            for p in fc_info["simple_points"][:4]
        ]

        # Local map nodes
        local_map_nodes = []
        for nid, ndata in sim_state.nodes_data.items():
            naqi_info = edge_infer.evaluate_overall_aqi(ndata["sensors"])
            local_map_nodes.append(
                MapNodeSnippet(
                    node_id=nid,
                    name=ndata["name"],
                    location=ndata["location"],
                    aqi=naqi_info["aqi"],
                    status=ndata["status"],
                    dominant_pm25=round(ndata["sensors"]["PM2.5"], 1),
                    grid_x=ndata["grid_x"],
                    grid_y=ndata["grid_y"]
                )
            )

        # Recent events
        recent_events = [
            RecentEventSnippet(
                id="EVT-1029",
                time_str="14:17",
                title="Particulate concentration surge detected",
                severity="WARNING" if aqi_info["aqi"] < 200 else "CRITICAL",
                peak_aqi=max(aqi_info["aqi"], 168),
                suspected_source=source_info["most_likely_source"],
                duration_str="Active (18 min)"
            ),
            RecentEventSnippet(
                id="EVT-1028",
                time_str="12:42",
                title="Transient PM2.5 spike from delivery vehicle idling",
                severity="MODERATE",
                peak_aqi=118,
                suspected_source="Vehicle exhaust / combustion",
                duration_str="Resolved (8 min)"
            ),
            RecentEventSnippet(
                id="EVT-1027",
                time_str="09:12",
                title="Air quality stabilized across northern perimeter",
                severity="LOW",
                peak_aqi=64,
                suspected_source="Ambient baseline dispersion",
                duration_str="Resolved"
            )
        ]

        # Evidence highlights
        ev_highlights = [
            f"{item['sensor_name']}: {item['observed_level']} ({item['impact_description']})"
            for item in source_info["supporting_evidence"][:3]
        ]

        return OverviewResponse(
            node_id=node["id"],
            node_name=node["name"],
            location=node["location"],
            air_quality=CurrentAirQuality(
                aqi=aqi_info["aqi"],
                status=aqi_info["status"],
                dominant_pollutant=aqi_info["dominant_pollutant"],
                dominant_pollutant_val=aqi_info["dominant_val"],
                dominant_pollutant_unit=aqi_info["dominant_unit"],
                trend=trend_label,
                trend_rate_pct=round(rate_of_change, 1),
                last_updated=now.strftime("%H:%M:%S"),
                is_online=hardware_live or sim_state.is_internet_connected,
                is_demo=(node.get("telemetry_source") != "hardware" or not {"PM2.5", "PM10", "CO", "CO2"}.issubset(set(node.get("hardware_sensor_types", [])))),
                data_freshness_desc=freshness_str
            ),
            quick_sensors=quick_sensors,
            why_happening=SourceSnippet(
                likely_source=source_info["most_likely_source"],
                confidence=source_info["confidence"],
                summary=source_info["explanation"],
                evidence_highlights=ev_highlights,
                is_estimated=True
            ),
            what_happens_next=ForecastSnippet(
                summary=fc_info["trend_summary"],
                expected_trend=fc_info["expected_trend"],
                points=fc_points,
                confidence_pct=int(fc_info["confidence_score"] * 100),
                is_demo_forecast=True
            ),
            what_should_i_do=DecisionSnippet(
                advisory=dec_info["recommendation"]["advisory"],
                recommendation=dec_info["recommendation"]["recommendation"],
                suggested_duration=dec_info["recommendation"]["suggested_duration"],
                alternative_action=dec_info["recommendation"]["alternative_route"],
                rationale=dec_info["recommendation"]["rationale"],
                actuator_action=dec_info["primary_decision"]["actuator_action"],
                actuator_state=dec_info["primary_decision"]["actuator_status"]
            ),
            local_map=local_map_nodes,
            recent_events=recent_events,
            sensors_operational_ratio="8 / 8",
            system_latency_ms=12.4
        )

overview_service = OverviewService()
