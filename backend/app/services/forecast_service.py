from typing import Dict, Any
from app.services.simulation_service import sim_state
from app.ai.forecasting import forecaster
from app.ai.inference import edge_infer
from app.schemas.forecast import ForecastDetailResponse, ForecastTrajectoryPoint

class ForecastService:
    @classmethod
    def get_forecast_detail(cls, node_id: str = "NODE-01") -> ForecastDetailResponse:
        node = sim_state.nodes_data.get(node_id, sim_state.nodes_data["NODE-01"])
        sensors = node["sensors"]
        rate = node.get("rate_of_change_15m", 12.0)
        
        aqi_info = edge_infer.evaluate_overall_aqi(sensors)
        fc_raw = forecaster.generate_forecast(
            current_aqi=aqi_info["aqi"],
            current_pm25=sensors.get("PM2.5", 25.0),
            rate_of_change_pct=rate,
            source_category="road_dust"
        )

        traj_points = [
            ForecastTrajectoryPoint(
                timestamp=p["timestamp"],
                relative_time=p["relative_time"],
                is_historical=p["is_historical"],
                actual_value=p["actual_value"],
                predicted_value=p["predicted_value"],
                lower_bound=p["lower_bound"],
                upper_bound=p["upper_bound"]
            )
            for p in fc_raw["trajectory"]
        ]

        return ForecastDetailResponse(
            node_id=node["id"],
            target_pollutant=f"Air Quality Index (driven by {aqi_info['dominant_pollutant']})",
            current_value=float(aqi_info["dominant_val"]),
            current_aqi=aqi_info["aqi"],
            forecast_horizon=fc_raw["forecast_horizon"],
            trend_summary=fc_raw["trend_summary"],
            expected_peak_time=fc_raw["expected_peak_time"],
            expected_peak_value=fc_raw["expected_peak_value"],
            confidence_score=fc_raw["confidence_score"],
            model_name=fc_raw["model_name"],
            model_version=fc_raw["model_version"],
            model_status=fc_raw["model_status"],
            is_demonstration_data=fc_raw["is_demonstration_data"],
            trajectory=traj_points,
            drivers=fc_raw["drivers"]
        )

forecast_service = ForecastService()
