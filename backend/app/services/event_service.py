from typing import List
from datetime import datetime, timezone
from app.schemas.event import EventsResponse, EventDetailItem
from app.services.simulation_service import sim_state
from app.ai.inference import edge_infer

class EventService:
    @classmethod
    def get_events(cls) -> EventsResponse:
        node = sim_state.nodes_data["NODE-01"]
        aqi_info = edge_infer.evaluate_overall_aqi(node["sensors"])
        now = datetime.now(timezone.utc)

        is_current_critical = aqi_info["aqi"] >= 150
        events = [
            EventDetailItem(
                id="EVT-20261007-001",
                node_id="NODE-01",
                node_name="Main Gate & Perimeter (UNO-Q)",
                title="Particulate Concentration Surge",
                severity="CRITICAL" if aqi_info["aqi"] >= 200 else ("WARNING" if aqi_info["aqi"] >= 140 else "MODERATE"),
                suspected_source="Road Dust / Traffic Activity",
                confidence=0.82,
                peak_aqi=max(aqi_info["aqi"], 168),
                peak_pm25=max(node["sensors"]["PM2.5"], 82.0),
                peak_pm10=max(node["sensors"]["PM10"], 126.0),
                duration_minutes=24,
                is_active=is_current_critical,
                start_time="14:17 UTC",
                end_time=None if is_current_critical else "14:41 UTC",
                description="Coarse particulate spike with elevated PM10/PM2.5 ratio following perimeter road sweep and vehicular turbulence."
            ),
            EventDetailItem(
                id="EVT-20261007-002",
                node_id="NODE-03",
                node_name="Engineering Workshop Lab",
                title="Metal Grinding & Mechanical Particulate Spike",
                severity="WARNING",
                suspected_source="Mechanical Construction / Machining",
                confidence=0.88,
                peak_aqi=148,
                peak_pm25=72.0,
                peak_pm10=154.0,
                duration_minutes=16,
                is_active=False,
                start_time="12:30 UTC",
                end_time="12:46 UTC",
                description="Localized particulate surge inside fabrication bay. Resolved following localized extraction hood activation."
            ),
            EventDetailItem(
                id="EVT-20261007-003",
                node_id="NODE-01",
                node_name="Main Gate & Perimeter",
                title="Combustion & Vehicle Exhaust Concentration",
                severity="MODERATE",
                suspected_source="Vehicle Exhaust / Diesel Idling",
                confidence=0.79,
                peak_aqi=122,
                peak_pm25=58.0,
                peak_pm10=64.0,
                duration_minutes=11,
                is_active=False,
                start_time="09:14 UTC",
                end_time="09:25 UTC",
                description="Carbon monoxide and fine particle surge during supply truck delivery window."
            ),
            EventDetailItem(
                id="EVT-20261007-004",
                node_id="NODE-02",
                node_name="Canteen & Dining Court",
                title="Cooking Oil Aerosol & VOC Elevation",
                severity="MODERATE",
                suspected_source="Indoor Cooking Aerosol",
                confidence=0.84,
                peak_aqi=108,
                peak_pm25=49.0,
                peak_pm10=55.0,
                duration_minutes=35,
                is_active=False,
                start_time="07:45 UTC",
                end_time="08:20 UTC",
                description="Breakfast preparation aerosol load. Kitchen exhaust damper successfully cleared plume."
            )
        ]

        active_count = sum(1 for e in events if e.is_active)
        return EventsResponse(
            total_count=len(events),
            active_count=active_count,
            events=events
        )

event_service = EventService()
