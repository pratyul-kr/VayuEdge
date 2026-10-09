from typing import Dict, Any, List, Optional
from datetime import datetime, timezone

class EdgeAnomalyDetector:
    """
    Lightweight rule and statistical anomaly detector.
    Evaluates sensor delta velocity (dC/dt) to detect sudden pollution events,
    sensor drift, and hardware signal anomalies.
    """

    @classmethod
    def analyze_stream(
        cls,
        sensor_type: str,
        current_val: float,
        prev_val: float,
        delta_minutes: float = 5.0
    ) -> Dict[str, Any]:
        if delta_minutes <= 0:
            delta_minutes = 1.0

        diff = current_val - prev_val
        pct_change = (diff / prev_val * 100.0) if prev_val > 0 else 0.0
        rate_per_min = diff / delta_minutes

        is_event = False
        event_severity = "LOW"
        description = "Normal environmental baseline."

        # Significant PM2.5 spike check
        if sensor_type == "PM2.5":
            if pct_change >= 20.0 and current_val >= 55.0:
                is_event = True
                event_severity = "CRITICAL" if current_val > 150 else "WARNING"
                description = f"Rapid PM2.5 surge of +{pct_change:.1f}% detected over {delta_minutes:.0f} minutes."
            elif pct_change >= 12.0 and current_val >= 35.0:
                is_event = True
                event_severity = "MODERATE"
                description = f"Moderate PM2.5 acceleration (+{pct_change:.1f}%) observed."

        # Significant PM10 spike check (dust / construction)
        elif sensor_type == "PM10":
            if pct_change >= 25.0 and current_val >= 80.0:
                is_event = True
                event_severity = "WARNING"
                description = f"Coarse particulate (PM10) spike (+{pct_change:.1f}%) indicates mechanical disturbance."

        return {
            "sensor_type": sensor_type,
            "rate_of_change_pct": round(pct_change, 1),
            "rate_per_min": round(rate_per_min, 2),
            "is_event": is_event,
            "severity": event_severity,
            "description": description
        }

anomaly_detector = EdgeAnomalyDetector()
