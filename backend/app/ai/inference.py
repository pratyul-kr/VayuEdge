from typing import Dict, Any, Tuple
from datetime import datetime

class EdgeInferenceEngine:
    """
    Lightweight Edge AI Inference Engine designed for Arduino UNO Q Linux core.
    Performs EPA-standard AQI computation, dominant pollutant attribution,
    and pollution severity classification completely offline.
    """

    # EPA breakpoints for PM2.5 (ug/m3) -> AQI
    PM25_BREAKPOINTS = [
        (0.0, 12.0, 0, 50, "GOOD"),
        (12.1, 35.4, 51, 100, "MODERATE"),
        (35.5, 55.4, 101, 150, "POOR"),
        (55.5, 150.4, 151, 200, "UNHEALTHY"),
        (150.5, 250.4, 201, 300, "VERY_UNHEALTHY"),
        (250.5, 500.4, 301, 500, "CRITICAL"),
    ]

    # EPA breakpoints for PM10 (ug/m3) -> AQI
    PM10_BREAKPOINTS = [
        (0, 54, 0, 50, "GOOD"),
        (55, 154, 51, 100, "MODERATE"),
        (155, 254, 101, 150, "POOR"),
        (255, 354, 151, 200, "UNHEALTHY"),
        (355, 424, 201, 300, "VERY_UNHEALTHY"),
        (425, 604, 301, 500, "CRITICAL"),
    ]

    @classmethod
    def calculate_aqi_pm25(cls, pm25: float) -> Tuple[int, str]:
        for c_low, c_high, i_low, i_high, cat in cls.PM25_BREAKPOINTS:
            if c_low <= pm25 <= c_high:
                aqi = int(((i_high - i_low) / (c_high - c_low)) * (pm25 - c_low) + i_low)
                return max(0, min(500, aqi)), cat
        if pm25 > 500.4:
            return 500, "CRITICAL"
        return 0, "GOOD"

    @classmethod
    def calculate_aqi_pm10(cls, pm10: float) -> Tuple[int, str]:
        for c_low, c_high, i_low, i_high, cat in cls.PM10_BREAKPOINTS:
            if c_low <= pm10 <= c_high:
                aqi = int(((i_high - i_low) / (c_high - c_low)) * (pm10 - c_low) + i_low)
                return max(0, min(500, aqi)), cat
        if pm10 > 604:
            return 500, "CRITICAL"
        return 0, "GOOD"

    @classmethod
    def evaluate_overall_aqi(cls, sensor_data: Dict[str, float]) -> Dict[str, Any]:
        pm25 = sensor_data.get("PM2.5", 25.0)
        pm10 = sensor_data.get("PM10", 45.0)
        co = sensor_data.get("CO", 1.2) # ppm
        co2 = sensor_data.get("CO2", 450.0) # ppm
        voc = sensor_data.get("VOC", 120.0) # ppb

        aqi_pm25, cat_pm25 = cls.calculate_aqi_pm25(pm25)
        aqi_pm10, cat_pm10 = cls.calculate_aqi_pm10(pm10)

        # Dominant pollutant calculation
        if aqi_pm25 >= aqi_pm10:
            dominant_aqi = aqi_pm25
            dominant_pollutant = "PM2.5"
            dominant_val = pm25
            dominant_unit = "µg/m³"
            status = cat_pm25
        else:
            dominant_aqi = aqi_pm10
            dominant_pollutant = "PM10"
            dominant_val = pm10
            dominant_unit = "µg/m³"
            status = cat_pm10

        return {
            "aqi": dominant_aqi,
            "status": status,
            "dominant_pollutant": dominant_pollutant,
            "dominant_val": round(dominant_val, 1),
            "dominant_unit": dominant_unit,
            "pm25_aqi": aqi_pm25,
            "pm10_aqi": aqi_pm10,
        }

edge_infer = EdgeInferenceEngine()
