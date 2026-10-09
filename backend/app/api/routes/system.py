from fastapi import APIRouter
from app.schemas.system import (
    SystemStatusResponse,
    DemoScenarioRequest,
    DemoScenarioResponse,
    SyncTriggerResponse
)
from app.services.system_service import system_service

router = APIRouter(tags=["System & Edge Runtime"])

@router.get("/system/status", response_model=SystemStatusResponse)
def get_system_status():
    """
    Get hardware metrics (CPU, RAM, temp, latency), offline buffer queue size,
    and Arduino UNO Q dual-core architecture health.
    """
    return system_service.get_system_status()

@router.post("/system/demo-scenario", response_model=DemoScenarioResponse)
def activate_demo_scenario(req: DemoScenarioRequest):
    """
    Switch controlled demo scenario (normal, traffic, road_dust, spike, forecast_worsening, offline).
    Visually updates all sensors, source attributions, predictions, and recommendations.
    """
    return system_service.activate_scenario(req.scenario_id)

@router.post("/system/toggle-offline")
def toggle_offline():
    """
    Toggle simulated network connection on/off to demonstrate edge resilience.
    """
    return system_service.toggle_offline()

@router.post("/system/sync", response_model=SyncTriggerResponse)
def trigger_local_sync():
    """
    Trigger synchronization of locally buffered readings into persistent storage.
    """
    return system_service.perform_sync()
