import pytest
from fastapi.testclient import TestClient
import sys
import os

# Ensure backend folder is in python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.main import app

client = TestClient(app)

def test_health():
    res = client.get("/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"

def test_overview_answers_four_questions():
    res = client.get("/api/v1/overview")
    assert res.status_code == 200
    data = res.json()
    # 1. WHAT IS HAPPENING?
    assert "air_quality" in data
    assert "aqi" in data["air_quality"]
    assert "status" in data["air_quality"]
    assert "dominant_pollutant" in data["air_quality"]
    # 2. WHY IS IT HAPPENING?
    assert "why_happening" in data
    assert "likely_source" in data["why_happening"]
    assert "confidence" in data["why_happening"]
    # 3. WHAT HAPPENS NEXT?
    assert "what_happens_next" in data
    assert len(data["what_happens_next"]["points"]) > 0
    # 4. WHAT SHOULD I DO?
    assert "what_should_i_do" in data
    assert "recommendation" in data["what_should_i_do"]
    # Local map & live sensors
    assert "local_map" in data
    assert "quick_sensors" in data

def test_sensors_and_fusion():
    res = client.get("/api/v1/sensors")
    assert res.status_code == 200
    assert len(res.json()) >= 8

    res_fusion = client.get("/api/v1/sensor-fusion")
    assert res_fusion.status_code == 200
    fusion_data = res_fusion.json()
    assert len(fusion_data["pipeline"]) == 6

def test_forecast_and_sources():
    res_fc = client.get("/api/v1/forecast")
    assert res_fc.status_code == 200
    assert "trajectory" in res_fc.json()

    res_src = client.get("/api/v1/sources")
    assert res_src.status_code == 200
    assert "most_likely_source" in res_src.json()

def test_decisions_and_events():
    res_dec = client.get("/api/v1/decisions")
    assert res_dec.status_code == 200
    assert "primary_decision" in res_dec.json()

    res_evt = client.get("/api/v1/events")
    assert res_evt.status_code == 200
    assert "events" in res_evt.json()

def test_demo_scenario_switch():
    res = client.post("/api/v1/system/demo-scenario", json={"scenario_id": "traffic"})
    assert res.status_code == 200
    data = res.json()
    assert "traffic" in data["scenario_id"].lower()
    
    # Check that overview reflects the traffic scenario
    res_ov = client.get("/api/v1/overview")
    assert res_ov.status_code == 200
    assert "traffic" in res_ov.json()["why_happening"]["likely_source"].lower() or "combustion" in res_ov.json()["why_happening"]["likely_source"].lower()
