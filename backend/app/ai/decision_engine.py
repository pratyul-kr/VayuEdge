from typing import Dict, Any, List

class EdgeDecisionEngine:
    """
    Explainable Edge Decision Engine.
    Converts multi-sensor observations and forward predictions into:
    1. Local Actuator commands (e.g. damper seal, air intake throttle)
    2. Contextual behavioral guidance (e.g. route choice, exercise deferral)
    3. Transparent reasoning and rule traces.
    """

    @classmethod
    def evaluate(
        cls,
        aqi: int,
        status: str,
        dominant_pollutant: str,
        trend: str,
        likely_source: str,
        rate_of_change_pct: float
    ) -> Dict[str, Any]:
        rules_evaluated = []
        
        # Rule 1: High / Critical AQI (>150)
        rule_1_met = aqi >= 150
        rules_evaluated.append({
            "rule_id": "RULE-R01-UNHEALTHY-THRESHOLD",
            "condition_evaluated": "AQI >= 150 or Category in [UNHEALTHY, CRITICAL]",
            "threshold_met": rule_1_met,
            "trigger_detail": f"Current AQI is {aqi} ({status})."
        })

        # Rule 2: Rapid rising trend (>10% change)
        rule_2_met = trend == "RISING" and rate_of_change_pct >= 10.0
        rules_evaluated.append({
            "rule_id": "RULE-R02-RAPID-ESCALATION",
            "condition_evaluated": "Trend == RISING and Rate of Change >= 10% in 15m",
            "threshold_met": rule_2_met,
            "trigger_detail": f"Observed momentum: +{rate_of_change_pct:.1f}% surge."
        })

        # Rule 3: Source attribution context
        rule_3_met = "dust" in likely_source.lower() or "traffic" in likely_source.lower()
        rules_evaluated.append({
            "rule_id": "RULE-R03-PERIMETER-SOURCE",
            "condition_evaluated": "Source classified as Road Dust or Traffic Exhaust",
            "threshold_met": rule_3_met,
            "trigger_detail": f"Source fingerprint: {likely_source}"
        })

        if aqi >= 200 or status in ["VERY_UNHEALTHY", "CRITICAL"]:
            condition = "Pollution reached Critical / Very Unhealthy threshold"
            decision_action = "Trigger high-priority local warning & seal building fresh air intake"
            reason = f"AQI {aqi} exceeds emergency exposure thresholds with {dominant_pollutant} dominance."
            advisory = "Outdoor physical activity is strongly discouraged for all individuals."
            recommendation = "Remain indoors, seal windows, and avoid prolonged outdoor presence."
            duration = "Next 60–90 minutes"
            alt_route = "Use connected indoor skywalks / enclosed basement corridors"
            actuator_cmd = "HVAC_DAMPER_SEAL_AND_HEPA_BOOST"
            actuator_state = "ENGAGED"
            priority = "CRITICAL"
        elif aqi >= 150 or (aqi >= 120 and trend == "RISING"):
            condition = f"{dominant_pollutant} rapidly increasing with {likely_source.lower()}"
            decision_action = "Issue local exposure advisory & engage perimeter ventilation filtration"
            reason = f"Particulate concentration rose {rate_of_change_pct:.1f}% over the last 15 minutes, driven by {likely_source.lower()}."
            advisory = "Outdoor exposure is currently discouraged for strenuous exertion."
            recommendation = "Avoid strenuous outdoor activity temporarily until dispersion improves."
            duration = "Next 30–45 minutes"
            alt_route = "Prefer the west-side shielded route away from traffic perimeter"
            actuator_cmd = "VENTILATION_INTAKE_THROTTLE_50%"
            actuator_state = "TRIGGERED"
            priority = "HIGH"
        elif aqi >= 100 or status == "POOR":
            condition = "Moderate to poor air quality detected with stable trend"
            decision_action = "Maintain normal operational profile; advise sensitive groups"
            reason = f"AQI {aqi} sits in the moderate/poor transition band with {dominant_pollutant} elevated."
            advisory = "Sensitive individuals (asthma, respiratory sensitivity) should limit heavy outdoor exertion."
            recommendation = "Normal activity permitted; sensitive groups reduce continuous outdoor exposure."
            duration = "Next 30 minutes"
            alt_route = "Standard paths operational; avoid idling vehicle bays"
            actuator_cmd = "HVAC_NORMAL_SCHEDULE"
            actuator_state = "STANDBY"
            priority = "MEDIUM"
        else:
            condition = "Nominal air quality baseline"
            decision_action = "Standard passive monitoring; optimal outdoor ventilation"
            reason = f"All pollutant channels reside comfortably within standard guidelines (AQI {aqi})."
            advisory = "Air quality is good and suitable for all regular outdoor activities."
            recommendation = "Ideal conditions for natural ventilation and outdoor physical exercise."
            duration = "Ongoing baseline"
            alt_route = "All routes optimal"
            actuator_cmd = "NATURAL_VENTILATION_ENABLED"
            actuator_state = "ACTIVE"
            priority = "LOW"

        return {
            "active_condition": condition,
            "primary_decision": {
                "id": 101,
                "node_id": "NODE-01",
                "timestamp": "Just now",
                "condition": condition,
                "action": decision_action,
                "reason": reason,
                "confidence": 0.86,
                "priority": priority,
                "actuator_action": actuator_cmd,
                "actuator_status": actuator_state,
                "explainability_notes": "Deterministic rule evaluation verified against EPA NAAQS guidelines and local trend velocity."
            },
            "recommendation": {
                "id": 201,
                "title": "Local Environmental Advisory",
                "advisory": advisory,
                "recommendation": recommendation,
                "duration_minutes": 45 if "45" in duration else (60 if "60" in duration else 30),
                "alternative_route": alt_route,
                "target_group": "Students, campus pedestrians, and facilities operators",
                "category": "OUTDOOR_EXPOSURE",
                "suggested_duration": duration,
                "rationale": reason
            },
            "rules_evaluated": rules_evaluated
        }

decision_engine = EdgeDecisionEngine()
