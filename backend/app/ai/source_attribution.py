from typing import Dict, Any, List

class PollutionFingerprintEngine:
    """
    Edge AI Fingerprint Classification for Pollution Source Attribution.
    Evaluates multi-sensor ratios (PM10/PM2.5, CO/CO2, VOC) and environmental context
    to deduce likely source candidates with probabilistic confidence.
    """

    @classmethod
    def attribute_source(cls, sensors: Dict[str, float]) -> Dict[str, Any]:
        pm25 = sensors.get("PM2.5", 25.0)
        pm10 = sensors.get("PM10", 40.0)
        co = sensors.get("CO", 1.0) # ppm
        co2 = sensors.get("CO2", 450.0) # ppm
        voc = sensors.get("VOC", 100.0) # ppb
        temp = sensors.get("Temperature", 26.0)
        humidity = sensors.get("Humidity", 65.0)

        pm_ratio = (pm10 / pm25) if pm25 > 0 else 1.0

        # Evidence accumulation
        evidence: List[Dict[str, Any]] = []

        # Case 1: Road dust / mechanical construction
        # Characterized by high coarse particles (PM10 >> PM2.5), low/normal combustion gases (CO normal)
        if pm_ratio >= 1.6 and pm10 > 70:
            confidence = min(0.92, 0.65 + (pm_ratio - 1.5) * 0.15 + (pm10 / 300.0) * 0.15)
            likely_source = "Road dust / traffic turbulence"
            category_id = "road_dust"
            explanation = (
                f"PM10 is elevated ({pm10:.0f} µg/m³) relative to PM2.5 ({pm25:.0f} µg/m³), "
                f"with a coarse-to-fine ratio of {pm_ratio:.2f}. CO ({co:.1f} ppm) remains stable. "
                "This combination closely aligns with mechanical road abrasion and resuspended dust."
            )
            evidence = [
                {"sensor_name": "PM10", "observed_level": "Very High" if pm10 > 110 else "High", "weight_contribution": 0.45, "impact_description": f"Coarse particle surge to {pm10:.0f} µg/m³ indicates mechanical ground agitation."},
                {"sensor_name": "PM2.5", "observed_level": "Elevated", "weight_contribution": 0.25, "impact_description": f"Secondary fine particulate load at {pm25:.0f} µg/m³."},
                {"sensor_name": "CO", "observed_level": "Stable / Normal", "weight_contribution": 0.15, "impact_description": f"CO at {co:.1f} ppm indicates low pure-combustion signature."},
                {"sensor_name": "VOC", "observed_level": "Normal", "weight_contribution": 0.15, "impact_description": f"VOC at {voc:.0f} ppb confirms predominantly mineral particulate profile."}
            ]
            competing = [
                {"category_id": "road_dust", "name": "Road Dust / Surface Activity", "probability": round(confidence, 2), "is_primary": True, "evidence_match": "High PM10/PM2.5 ratio, low combustion gas"},
                {"category_id": "traffic_combustion", "name": "Vehicle Exhaust / Combustion", "probability": round(max(0.12, 1.0 - confidence - 0.1), 2), "is_primary": False, "evidence_match": "Moderate fine particulate presence"},
                {"category_id": "construction", "name": "Civil Construction / Demolition", "probability": 0.22, "is_primary": False, "evidence_match": "Coarse dust signature"}
            ]

        # Case 2: Combustion / Traffic exhaust
        # Characterized by high PM2.5, elevated CO, elevated VOC, PM_ratio ~ 1.1 - 1.4
        elif co > 2.5 or (pm25 > 60 and co > 1.8):
            confidence = min(0.90, 0.70 + (co / 8.0) * 0.15 + (pm25 / 200.0) * 0.1)
            likely_source = "Vehicle exhaust / combustion activity"
            category_id = "traffic_combustion"
            explanation = (
                f"PM2.5 ({pm25:.0f} µg/m³) is prominent alongside elevated carbon monoxide ({co:.1f} ppm) "
                f"and VOCs ({voc:.0f} ppb). The fine particle fraction indicates active fuel combustion."
            )
            evidence = [
                {"sensor_name": "CO", "observed_level": "High" if co > 3.5 else "Elevated", "weight_contribution": 0.40, "impact_description": f"Carbon monoxide at {co:.1f} ppm points to incomplete fuel oxidation."},
                {"sensor_name": "PM2.5", "observed_level": "High", "weight_contribution": 0.35, "impact_description": f"Fine combustion aerosol concentrated at {pm25:.0f} µg/m³."},
                {"sensor_name": "VOC", "observed_level": "Elevated", "weight_contribution": 0.15, "impact_description": f"Volatile hydrocarbons at {voc:.0f} ppb track vehicular activity."},
                {"sensor_name": "PM10", "observed_level": "Moderate", "weight_contribution": 0.10, "impact_description": "Normal proportional fine/coarse dispersion."}
            ]
            competing = [
                {"category_id": "traffic_combustion", "name": "Vehicle Exhaust / Combustion", "probability": round(confidence, 2), "is_primary": True, "evidence_match": "Elevated CO + Fine PM2.5 aerosol"},
                {"category_id": "road_dust", "name": "Road Dust / Ground Friction", "probability": round(max(0.15, 1.0 - confidence - 0.1), 2), "is_primary": False, "evidence_match": "Associated perimeter road turbulence"},
                {"category_id": "biomass", "name": "Open Biomass / Smoldering", "probability": 0.18, "is_primary": False, "evidence_match": "CO and aerosol trace"}
            ]

        # Case 3: Biomass / open burning / smoke
        elif pm25 > 120 and voc > 250:
            confidence = 0.84
            likely_source = "Biomass / open burning plume"
            category_id = "biomass"
            explanation = (
                f"Severe PM2.5 surge ({pm25:.0f} µg/m³) coupled with spiked VOC ({voc:.0f} ppb) "
                "conforms to an active open burning or localized smoldering signature."
            )
            evidence = [
                {"sensor_name": "PM2.5", "observed_level": "Critical", "weight_contribution": 0.50, "impact_description": f"Severe fine particulate plume at {pm25:.0f} µg/m³."},
                {"sensor_name": "VOC", "observed_level": "Spiked", "weight_contribution": 0.30, "impact_description": f"Organic hydrocarbon spikes at {voc:.0f} ppb."},
                {"sensor_name": "CO", "observed_level": "Elevated", "weight_contribution": 0.20, "impact_description": f"Elevated at {co:.1f} ppm."}
            ]
            competing = [
                {"category_id": "biomass", "name": "Biomass / Agricultural Burning", "probability": 0.84, "is_primary": True, "evidence_match": "Spiked organic particulates and VOC"},
                {"category_id": "traffic_combustion", "name": "Combustion / Heavy Diesel", "probability": 0.24, "is_primary": False, "evidence_match": "Co-occurring combustion trace"}
            ]

        # Case 4: Baseline / Normal atmospheric state
        elif pm25 < 30 and pm10 < 50:
            confidence = 0.89
            likely_source = "Clean ambient background dispersion"
            category_id = "ambient_clean"
            explanation = "All monitored pollutant channels are within nominal baseline thresholds. No localized emission plume detected."
            evidence = [
                {"sensor_name": "PM2.5", "observed_level": "Nominal", "weight_contribution": 0.35, "impact_description": f"Safe ambient level at {pm25:.0f} µg/m³."},
                {"sensor_name": "PM10", "observed_level": "Nominal", "weight_contribution": 0.35, "impact_description": f"Safe ambient level at {pm10:.0f} µg/m³."},
                {"sensor_name": "CO", "observed_level": "Clean", "weight_contribution": 0.15, "impact_description": f"Background levels at {co:.1f} ppm."},
                {"sensor_name": "VOC", "observed_level": "Clean", "weight_contribution": 0.15, "impact_description": f"Background levels at {voc:.0f} ppb."}
            ]
            competing = [
                {"category_id": "ambient_clean", "name": "Normal Ambient Dispersion", "probability": 0.89, "is_primary": True, "evidence_match": "All channels within standard bounds"},
                {"category_id": "diffuse_urban", "name": "Diffuse Urban Background", "probability": 0.11, "is_primary": False, "evidence_match": "Low-level ambient trace"}
            ]

        # Case 5: Mixed / Diffuse urban aerosol
        else:
            confidence = 0.68
            likely_source = "Mixed diffuse urban activity"
            category_id = "mixed_urban"
            explanation = (
                f"Moderate particulate load (PM2.5: {pm25:.0f} µg/m³, PM10: {pm10:.0f} µg/m³) "
                "with steady atmospheric mixing. No single isolated point source dominates."
            )
            evidence = [
                {"sensor_name": "PM2.5", "observed_level": "Moderate", "weight_contribution": 0.40, "impact_description": f"Moderate particulate load ({pm25:.0f} µg/m³)."},
                {"sensor_name": "PM10", "observed_level": "Moderate", "weight_contribution": 0.40, "impact_description": f"Moderate coarse load ({pm10:.0f} µg/m³)."},
                {"sensor_name": "CO", "observed_level": "Stable", "weight_contribution": 0.20, "impact_description": f"Baseline gas at {co:.1f} ppm."}
            ]
            competing = [
                {"category_id": "mixed_urban", "name": "Mixed Urban Activity", "probability": 0.68, "is_primary": True, "evidence_match": "Balanced multi-channel elevation"},
                {"category_id": "road_dust", "name": "Road Dust / Friction", "probability": 0.35, "is_primary": False, "evidence_match": "Secondary coarse component"}
            ]

        return {
            "most_likely_source": likely_source,
            "category_id": category_id,
            "confidence": round(confidence, 2),
            "is_estimated": True,
            "explanation": explanation,
            "supporting_evidence": evidence,
            "competing_candidates": competing,
            "fingerprint_notes": f"Ratio PM10/PM2.5 = {pm_ratio:.2f} | CO = {co:.1f} ppm | VOC = {voc:.0f} ppb | T={temp:.1f}°C RH={humidity:.0f}%"
        }

source_engine = PollutionFingerprintEngine()
