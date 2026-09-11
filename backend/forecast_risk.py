
"""
Forecast-based future V4 risk + prototype ML layer for SIH26192.

V4 remains the authority for future 6h/12h/24h risk because it can consume
the actual ECMWF rainfall forecast.

The Random Forest is deliberately separate: it predicts hazard from the
CURRENT observed state only. Its output is a prototype hazard score, not a
calibrated real-world probability.
"""

import math
from datetime import datetime

from risk_model import compute_all_zone_risks
from ml_predictor import predict_prototype_score


HORIZONS = (6, 12, 24)
WINDOWS = (1, 3, 6, 12, 24, 48)


def _safe_float(value, default=0.0):
    try:
        value = float(value)
        if math.isnan(value):
            return default
        return value
    except (TypeError, ValueError):
        return default


def _parse_time(value):
    return datetime.fromisoformat(str(value).replace("Z", "+00:00"))


def _rolling_windows(history, target_time):
    result = {f"rain_{h}h": 0.0 for h in WINDOWS}

    for timestamp, rainfall in history:
        try:
            hours_old = (target_time - timestamp).total_seconds() / 3600.0
        except Exception:
            continue

        for hours in WINDOWS:
            if 0 <= hours_old < hours:
                result[f"rain_{hours}h"] += _safe_float(rainfall)

    return {key: round(value, 2) for key, value in result.items()}


def _future_windows(weather_data, horizon):
    forecast = weather_data.get("forecast", [])
    if not forecast:
        return None

    selected = forecast[:horizon]
    if not selected:
        return None

    history = []

    for item in weather_data.get("_history", []):
        try:
            history.append(
                (
                    _parse_time(item["timestamp"]),
                    _safe_float(item["rainfall_mm"]),
                )
            )
        except Exception:
            pass

    forecast_history = []

    for item in selected:
        try:
            forecast_history.append(
                (
                    _parse_time(item["timestamp"]),
                    _safe_float(item["rainfall_mm"]),
                )
            )
        except Exception:
            pass

    if not forecast_history:
        return None

    target_time = forecast_history[-1][0]
    return _rolling_windows(history + forecast_history, target_time)


def compute_forecast_risks(weather):
    output = []

    for location_id, weather_data in weather.items():
        if not isinstance(weather_data, dict):
            continue

        zone_output = {
            "id": int(location_id),
            "name": None,
            "current": {
                "rainfall_mm": round(
                    _safe_float(weather_data.get("rainfall_mm")), 2
                ),
                "timestamp": weather_data.get("timestamp"),
            },
            "forecast": {},
        }

        # ------------------------------------------------------------
        # ML FEATURES = CURRENT OBSERVED STATE ONLY
        # ------------------------------------------------------------
        # This keeps training and live inference on the same feature space.
        soil = weather_data.get("soil", {})
        current_features = {
            "rainfall_mm": _safe_float(weather_data.get("rainfall_mm")),
            "rain_1h": _safe_float(weather_data.get("rain_1h")),
            "rain_3h": _safe_float(weather_data.get("rain_3h")),
            "rain_6h": _safe_float(weather_data.get("rain_6h")),
            "rain_12h": _safe_float(weather_data.get("rain_12h")),
            "rain_24h": _safe_float(weather_data.get("rain_24h")),
            "rain_48h": _safe_float(weather_data.get("rain_48h")),
            "soil_moisture_0_7cm": _safe_float(
                soil.get("soil_moisture_0_7cm")
            ),
            "soil_moisture_7_28cm": _safe_float(
                soil.get("soil_moisture_7_28cm")
            ),
            "soil_moisture_28_100cm": _safe_float(
                soil.get("soil_moisture_28_100cm")
            ),
            "soil_moisture_100_255cm": _safe_float(
                soil.get("soil_moisture_100_255cm")
            ),
        }

        ml_features = None

        for horizon in HORIZONS:
            windows = _future_windows(weather_data, horizon)

            if not windows:
                continue

            state = {
                int(location_id): {
                    **windows,
                    "soil": soil,
                }
            }

            zones = compute_all_zone_risks(live_state=state)

            zone = next(
                (
                    item for item in zones
                    if int(item.get("id", -1)) == int(location_id)
                ),
                None,
            )

            if zone is None:
                continue

            if zone_output["name"] is None:
                zone_output["name"] = zone.get("name")

            # Static terrain is part of the same V4 zone record.
            # Keep one source of truth for ML inference.
            current_features.update({
                "elevation_m": _safe_float(zone.get("elevation_m")),
                "slope_deg": _safe_float(zone.get("slope_deg")),
                "distance_to_river_m": _safe_float(
                    zone.get("distance_to_river_m")
                ),
            })

            forecast_items = weather_data.get("forecast", [])
            forecast_timestamp = None

            if len(forecast_items) >= horizon:
                forecast_timestamp = forecast_items[horizon - 1].get(
                    "timestamp"
                )

            zone_output["forecast"][f"{horizon}h"] = {
                "target_timestamp": forecast_timestamp,
                "risk": zone.get("risk"),
                "risk_score": zone.get("risk_score"),
                "rainfall_mm": zone.get("rainfall_mm"),
                "rainfall_windows": windows,
                "soil_component": zone.get("soil_component", 0),
                "terrain_component": zone.get("terrain_component", 0),
                "rainfall_component": zone.get("rainfall_component", 0),
            }

        if zone_output["name"] is not None:
            ml_scores = predict_prototype_score(current_features)

            for horizon_key, ml_data in ml_scores.items():
                if horizon_key in zone_output["forecast"]:
                    zone_output["forecast"][horizon_key][
                        "ml_prediction"
                    ] = ml_data

            zone_output["ml_status"] = {
                "model_type": "Random Forest",
                "prototype_only": True,
                "probability_calibrated": False,
                "feature_policy": (
                    "ML uses current observed rainfall, soil moisture, "
                    "and terrain. ECMWF future forecast is used by V4."
                ),
                "label_warning": (
                    "Prototype hazard score; not a calibrated "
                    "real-world probability."
                ),
            }

            output.append(zone_output)

    return output
