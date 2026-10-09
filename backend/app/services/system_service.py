from typing import Dict, Any
from datetime import datetime, timezone
from app.services.simulation_service import sim_state
from app.schemas.system import SystemStatusResponse, DemoScenarioResponse, SyncTriggerResponse

class SystemService:
    @classmethod
    def get_system_status(cls) -> SystemStatusResponse:
        now = datetime.now(timezone.utc)
        edge_mode = "STANDALONE_OFFLINE" if not sim_state.is_internet_connected else "LOCAL_NETWORK_ACTIVE"
        if sim_state.is_syncing:
            edge_mode = "LOCAL_STORAGE_SYNC"

        arch = {
            "microcontroller_coprocessor": {
                "core": "STM32 MCU (Arduino UNO Q low-level)",
                "responsibility": "Real-time ADC acquisition, hardware oversampling, I2C/UART polling, actuator relays",
                "status": "HEALTHY_100HZ_POLLING"
            },
            "linux_application_processor": {
                "core": "Linux ARM Cortex (Arduino UNO Q SoC)",
                "responsibility": "Kalman filtering, Feature extraction, Edge AI inference, Source fingerprinting, Local SQLite DB, FastAPI Web Server",
                "status": "ONLINE_STANDALONE"
            }
        }

        return SystemStatusResponse(
            node_id="NODE-01",
            hardware_platform="Arduino UNO Q (Linux Core + STM32 Coprocessor)",
            firmware_version="v1.2.0-unoq-edge",
            edge_mode=edge_mode,
            is_internet_connected=sim_state.is_internet_connected,
            is_syncing=sim_state.is_syncing,
            last_sync_timestamp=sim_state.last_sync_time.strftime("%H:%M:%S UTC"),
            unsynced_readings_queued=sim_state.unsynced_records_count,
            cpu_usage_pct=18.4,
            memory_usage_mb=246.2,
            temperature_c=42.1,
            mcu_comm_status="RPC_HEALTHY_UART",
            inference_latency_ms=12.4,
            storage_free_mb=1840.0,
            sensors_operational=8,
            sensors_total=8,
            architecture_overview=arch
        )

    @classmethod
    def activate_scenario(cls, scenario_id: str) -> DemoScenarioResponse:
        res = sim_state.set_scenario(scenario_id)
        from app.services.overview_service import overview_service
        ov = overview_service.get_overview_data("NODE-01")

        return DemoScenarioResponse(
            scenario_id=scenario_id,
            name=res["name"],
            description=res["description"],
            active_aqi=ov.air_quality.aqi,
            status=ov.air_quality.status,
            likely_source=ov.why_happening.likely_source,
            decision_action=ov.what_should_i_do.action if hasattr(ov.what_should_i_do, "action") else ov.what_should_i_do.recommendation,
            timestamp=res["timestamp"]
        )

    @classmethod
    def toggle_offline(cls) -> Dict[str, Any]:
        is_online = sim_state.toggle_offline_state()
        return {
            "is_internet_connected": is_online,
            "edge_mode": "LOCAL_NETWORK_ACTIVE" if is_online else "STANDALONE_OFFLINE",
            "unsynced_records_queued": sim_state.unsynced_records_count
        }

    @classmethod
    def perform_sync(cls) -> SyncTriggerResponse:
        res = sim_state.trigger_sync()
        return SyncTriggerResponse(
            success=res["success"],
            message=f"Flushed {res['synced_records']} records to local storage.",
            synced_records=res["synced_records"],
            sync_status="COMPLETED"
        )

system_service = SystemService()
