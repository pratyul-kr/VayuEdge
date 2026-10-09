from typing import List, Dict, Any
from datetime import datetime, timezone
from app.services.simulation_service import sim_state
from app.ai.inference import edge_infer
from app.ai.source_attribution import source_engine
from app.ai.decision_engine import decision_engine
from app.schemas.decision import (
    DecisionsPageResponse,
    DecisionDetail,
    RecommendationDetail,
    DecisionRuleTrace
)

class DecisionService:
    @classmethod
    def get_decisions(cls, node_id: str = "NODE-01") -> DecisionsPageResponse:
        node = sim_state.nodes_data.get(node_id, sim_state.nodes_data["NODE-01"])
        sensors = node["sensors"]
        rate = node.get("rate_of_change_15m", 12.0)
        aqi_info = edge_infer.evaluate_overall_aqi(sensors)
        source_info = source_engine.attribute_source(sensors)
        trend = "RISING" if rate > 4 else ("FALLING" if rate < -4 else "STABLE")

        eval_res = decision_engine.evaluate(
            aqi=aqi_info["aqi"],
            status=aqi_info["status"],
            dominant_pollutant=aqi_info["dominant_pollutant"],
            trend=trend,
            likely_source=source_info["most_likely_source"],
            rate_of_change_pct=rate
        )

        pdec = eval_res["primary_decision"]
        rec = eval_res["recommendation"]

        primary_decision = DecisionDetail(
            id=pdec["id"],
            node_id=node["id"],
            timestamp=datetime.now(timezone.utc).strftime("%H:%M:%S UTC"),
            condition=pdec["condition"],
            action=pdec["action"],
            reason=pdec["reason"],
            confidence=pdec["confidence"],
            priority=pdec["priority"],
            actuator_action=pdec["actuator_action"],
            actuator_status=pdec["actuator_status"],
            explainability_notes=pdec["explainability_notes"]
        )

        active_recs = [
            RecommendationDetail(
                id=rec["id"],
                title=rec["title"],
                target_group=rec["target_group"],
                advisory=rec["advisory"],
                duration_minutes=rec["duration_minutes"],
                alternative_route=rec["alternative_route"],
                category=rec["category"]
            ),
            RecommendationDetail(
                id=202,
                title="HVAC Mitigation & Building Envelope",
                target_group="Facilities Engineering & Building Automation",
                advisory="Throttle outdoor fresh air damper to 20% to prevent particulate ingress into main hall.",
                duration_minutes=60,
                alternative_route="Activate secondary HEPA positive-pressure recirculator",
                category="BUILDING_AUTOMATION"
            )
        ]

        rules = [
            DecisionRuleTrace(
                rule_id=r["rule_id"],
                condition_evaluated=r["condition_evaluated"],
                threshold_met=r["threshold_met"],
                trigger_detail=r["trigger_detail"]
            )
            for r in eval_res["rules_evaluated"]
        ]

        recent_history = [
            DecisionDetail(
                id=99,
                node_id=node["id"],
                timestamp="12:45 UTC",
                condition="Transient fine PM2.5 spike from idling trucks",
                action="Temporary perimeter advisory issued",
                reason="Idling delivery trucks near loading dock bay 3",
                confidence=0.82,
                priority="MEDIUM",
                actuator_action="PERIMETER_FAN_EXHAUST",
                actuator_status="RESTORED",
                explainability_notes="Resolved within 12 minutes as vehicles departed."
            ),
            DecisionDetail(
                id=98,
                node_id=node["id"],
                timestamp="08:15 UTC",
                condition="Morning baseline transition",
                action="Standard passive monitoring",
                reason="Nominal traffic dispersion",
                confidence=0.91,
                priority="LOW",
                actuator_action="NATURAL_VENTILATION",
                actuator_status="COMPLETED",
                explainability_notes="Baseline inspection confirmed all clear."
            )
        ]

        return DecisionsPageResponse(
            node_id=node["id"],
            active_condition=eval_res["active_condition"],
            primary_decision=primary_decision,
            active_recommendations=active_recs,
            rule_evaluation_traces=rules,
            recent_decision_history=recent_history
        )

decision_service = DecisionService()
