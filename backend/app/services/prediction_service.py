from typing import List, Dict, Any
from datetime import datetime, timezone
from app.services.simulation_service import sim_state
from app.ai.inference import edge_infer
from app.schemas.prediction import PredictionsResponse, PredictionCardItem

class PredictionService:
    @classmethod
    def get_predictions(cls, node_id: str = "NODE-01") -> PredictionsResponse:
        node = sim_state.nodes_data.get(node_id, sim_state.nodes_data["NODE-01"])
        sensors = node["sensors"]
        rate = node.get("rate_of_change_15m", 12.0)
        aqi_info = edge_infer.evaluate_overall_aqi(sensors)
        now = datetime.now(timezone.utc)

        # Build probabilistic predictions
        preds: List[PredictionCardItem] = []

        if aqi_info["aqi"] >= 140:
            preds.append(
                PredictionCardItem(
                    id="PRED-001",
                    title="Sustained High-Pollution Event",
                    probability_pct=84,
                    severity="HIGH" if aqi_info["aqi"] < 200 else "CRITICAL",
                    time_horizon="Next 30–45 minutes",
                    evidence_summary=f"Current AQI {aqi_info['aqi']} with {aqi_info['dominant_pollutant']} concentration rising at +{rate:.1f}%/15m.",
                    expected_impact="Elevated particulate inhalation risk along campus perimeter.",
                    confidence_level="High (Edge Ensembles)"
                )
            )
            preds.append(
                PredictionCardItem(
                    id="PRED-002",
                    title="Threshold Breach Probability (AQI > 180)",
                    probability_pct=76,
                    severity="WARNING",
                    time_horizon="Within 20–30 minutes",
                    evidence_summary="Coarse fraction ratio PM10/PM2.5 indicates mechanical dust accumulation.",
                    expected_impact="Automatic triggering of mechanical HVAC damper isolation.",
                    confidence_level="High"
                )
            )
            preds.append(
                PredictionCardItem(
                    id="PRED-003",
                    title="Evening Boundary-Layer Dispersion Decline",
                    probability_pct=68,
                    severity="MODERATE",
                    time_horizon="17:30 – 19:00",
                    evidence_summary="Historical diurnal memory indicates evening temperature inversion stalls vertical dispersal.",
                    expected_impact="Second localized wave of particulate stagnation during campus departure peak.",
                    confidence_level="Moderate"
                )
            )
        else:
            preds.append(
                PredictionCardItem(
                    id="PRED-004",
                    title="Atmospheric Dispersion Stability",
                    probability_pct=91,
                    severity="LOW",
                    time_horizon="Next 2 Hours",
                    evidence_summary="Wind ventilation vectors and nominal particulate indices maintain safe parameters.",
                    expected_impact="Air quality expected to remain within standard Good/Moderate boundaries.",
                    confidence_level="High"
                )
            )

        risk_score = min(98, max(12, int(aqi_info["aqi"] * 0.45 + rate * 1.2)))

        return PredictionsResponse(
            node_id=node["id"],
            timestamp=now.strftime("%Y-%m-%d %H:%M:%S UTC"),
            active_predictions=preds,
            risk_index_score=risk_score,
            peak_risk_window="14:45 – 15:30" if aqi_info["aqi"] > 100 else "Nominal Baseline",
            model_inference_status="EDGE_INFERENCE_SYNCHRONIZED"
        )

prediction_service = PredictionService()
