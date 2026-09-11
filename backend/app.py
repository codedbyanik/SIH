"""
SIH26192 - Flash Flood Prediction Backend
=========================================

Basin:
    Wayanad, Kerala

Reference event:
    30 July 2024

Architecture:
    - V4 escalation-aware risk engine
    - Current Open-Meteo ECMWF live weather
    - Current hourly rainfall history
    - Current soil moisture
    - Historical sensor replay
    - Automated historical replay
    - Existing frontend response structure

IMPORTANT MODES
---------------

LIVE:
    /api/risk-map?source=live

    Uses current Open-Meteo ECMWF weather data.

REPLAY:
    /api/risk-map?source=replay

    Uses data injected through replay.py.

    replay.py can now be started automatically through:

        POST /api/replay/start

SIMULATION:
    /api/simulate?rainfall_mm=50

    Uses hypothetical rainfall.
"""


# ============================================================
# IMPORTS
# ============================================================

import time
import os
import sys
import subprocess
import threading

from datetime import datetime, timezone
from collections import defaultdict, deque

import requests
import pandas as pd
import numpy as np

from flask import Flask, jsonify, request
from flask_cors import CORS

from risk_model import (
    compute_all_zone_risks,
    load_latest_current_soil_moisture,
)
from forecast_risk import compute_forecast_risks

try:
    import joblib
except Exception:
    joblib = None


# ============================================================
# PROTOTYPE ML PREDICTOR
# ============================================================
#
# The trained Random Forest models live in:
#     backend/models/
#
# Simulation uses the same 14 features used during training.
# The simulation rainfall value is treated as the current
# hourly rainfall scenario. Because /api/simulate receives
# one scalar rainfall value, the rainfall window features are
# populated consistently for the scenario rather than silently
# omitting them.
# ============================================================

ML_FEATURES = [
    "rainfall_mm",
    "rain_1h",
    "rain_3h",
    "rain_6h",
    "rain_12h",
    "rain_24h",
    "rain_48h",
    "soil_moisture_0_7cm",
    "soil_moisture_7_28cm",
    "soil_moisture_28_100cm",
    "soil_moisture_100_255cm",
    "elevation_m",
    "slope_deg",
    "distance_to_river_m",
]

ML_MODEL_PATHS = {
    6: os.path.join(
        os.path.dirname(os.path.abspath(__file__)),
        "models",
        "flash_flood_rf_6h.joblib",
    ),
    12: os.path.join(
        os.path.dirname(os.path.abspath(__file__)),
        "models",
        "flash_flood_rf_12h.joblib",
    ),
    24: os.path.join(
        os.path.dirname(os.path.abspath(__file__)),
        "models",
        "flash_flood_rf_24h.joblib",
    ),
}

ML_MODELS = {}
ML_MODEL_LOAD_ERROR = None
STATIC_ML_FEATURES = {}


def load_ml_resources():
    """Load trained ML models and static elevation features."""
    global ML_MODELS
    global ML_MODEL_LOAD_ERROR
    global STATIC_ML_FEATURES

    if joblib is None:
        ML_MODEL_LOAD_ERROR = "joblib is not installed."
        return

    for horizon, path in ML_MODEL_PATHS.items():
        try:
            if os.path.exists(path):
                loaded = joblib.load(path)
                if isinstance(loaded, dict) and "model" in loaded:
                    ML_MODELS[horizon] = loaded["model"]
                else:
                    ML_MODELS[horizon] = loaded
            else:
                print(
                    f"WARNING: ML model not found for {horizon}h: {path}"
                )
        except Exception as error:
            print(
                f"WARNING: Could not load {horizon}h ML model: {error}"
            )

    try:
        static_path = os.path.join(
            os.path.dirname(os.path.abspath(__file__)),
            "data",
            "static_location_features.csv",
        )

        if os.path.exists(static_path):
            static_df = pd.read_csv(static_path)

            for _, row in static_df.iterrows():
                location_id = int(row["location_id"])

                STATIC_ML_FEATURES[location_id] = {
                    "elevation_m": safe_float(
                        row.get("elevation_m", 0)
                    ),
                    "slope_deg": safe_float(
                        row.get("slope_deg", 0)
                    ),
                    "distance_to_river_m": safe_float(
                        row.get("distance_to_river_m", 0)
                    ),
                }

    except Exception as error:
        print(
            f"WARNING: Could not load static ML features: {error}"
        )

    if not ML_MODELS:
        ML_MODEL_LOAD_ERROR = "No trained ML models are available."


def _model_score(model, feature_row):
    """
    Return the model's positive-class score.

    This is intentionally named a prototype score rather than a
    calibrated probability because the current training dataset
    is a prototype dataset with sparse positive event labels.
    """

    X = pd.DataFrame(
        [[
            safe_float(feature_row.get(column, 0))
            for column in ML_FEATURES
        ]],
        columns=ML_FEATURES,
    )

    try:
        if hasattr(model, "predict_proba"):
            probabilities = model.predict_proba(X)

            if probabilities.ndim == 2 and probabilities.shape[1] >= 2:
                classes = getattr(model, "classes_", None)

                if classes is not None:
                    positive_indices = [
                        i
                        for i, value in enumerate(classes)
                        if safe_float(value, -999) == 1
                    ]

                    if positive_indices:
                        return float(
                            np.clip(
                                probabilities[0][positive_indices[-1]],
                                0.0,
                                1.0,
                            )
                        )

                return float(
                    np.clip(
                        probabilities[0][-1],
                        0.0,
                        1.0,
                    )
                )

        prediction = model.predict(X)

        return float(
            np.clip(
                safe_float(prediction[0], 0),
                0.0,
                1.0,
            )
        )

    except Exception as error:
        print(f"ML prediction error: {error}")
        return None


def build_simulation_rainfall_windows(rainfall_mm):
    """
    Build the rainfall-window profile used by the ML simulation.

    IMPORTANT:
        The V4 risk engine still receives the raw slider value.

        The ML prototype was trained on observed hourly rainfall values
        that are much smaller than the UI's 0-250 mm demonstration range.
        Feeding 25-250 mm directly into the Random Forest therefore pushes
        the model far outside its training distribution and causes the
        output to saturate.

        For the ML branch only, the 0-250 mm UI slider is mapped to a
        realistic prototype 1-hour rainfall range of 0-4.5 mm. The
        rolling windows are then derived from the same empirical event
        ratios used previously.

    This is a DEMO scenario mapping, not a calibrated meteorological
    conversion.
    """

    rainfall_mm = max(0.0, min(250.0, safe_float(rainfall_mm)))

    # Map the UI demonstration range (0-250 mm) into the observed
    # 1-hour rainfall range used by the prototype ML training data.
    #
    # 0 mm   -> 0.00 mm effective ML 1h rainfall
    # 50 mm  -> 0.90 mm
    # 100 mm -> 1.80 mm
    # 150 mm -> 2.70 mm
    # 200 mm -> 3.60 mm
    # 250 mm -> 4.50 mm
    effective_1h = (rainfall_mm / 250.0) * 4.5

    # Ratios approximate the positive-event training distribution:
    # 1h=2.81, 3h=9.83, 6h=19.21, 12h=25.92,
    # 24h=28.21, 48h=35.93 mm.
    profile = {
        "rain_1h": 1.00,
        "rain_3h": 9.83 / 2.81,
        "rain_6h": 19.21 / 2.81,
        "rain_12h": 25.92 / 2.81,
        "rain_24h": 28.21 / 2.81,
        "rain_48h": 35.93 / 2.81,
    }

    windows = {
        key: round(effective_1h * multiplier, 2)
        for key, multiplier in profile.items()
    }

    return windows


def get_ml_simulation_effective_rainfall(rainfall_mm):
    """
    Return the effective 1-hour rainfall supplied to the prototype ML
    model for a 0-250 mm UI simulation.

    The returned value is intentionally kept inside the approximate
    training range of the prototype model.
    """

    rainfall_mm = max(0.0, min(250.0, safe_float(rainfall_mm)))
    return round((rainfall_mm / 250.0) * 4.5, 4)


def predict_simulation_ml(zone, rainfall_mm):
    """
    Run the trained ML models against a simulated rainfall scenario.

    The V4 engine uses the raw UI rainfall value. The ML prototype uses
    a normalized effective rainfall scenario so the 0-250 mm demo slider
    remains inside the approximate feature distribution seen during
    training.

    This output is a prototype hazard signal, NOT a calibrated
    probability.
    """

    static = STATIC_ML_FEATURES.get(
        int(zone.get("id", 0)),
        {},
    )

    try:
        soil_map = load_latest_current_soil_moisture()
    except Exception:
        soil_map = {}

    soil = (
        soil_map.get(
            int(zone.get("id", 0)),
            {},
        )
        if isinstance(soil_map, dict)
        else {}
    )

    rainfall_windows = build_simulation_rainfall_windows(
        rainfall_mm
    )

    effective_1h = get_ml_simulation_effective_rainfall(
        rainfall_mm
    )

    feature_row = {
        # Keep the two rainfall fields consistent with the normalized
        # scenario used for the ML model. The raw UI value is still
        # preserved by the V4 risk engine and frontend response.
        "rainfall_mm": effective_1h,
        "rain_1h": rainfall_windows["rain_1h"],
        "rain_3h": rainfall_windows["rain_3h"],
        "rain_6h": rainfall_windows["rain_6h"],
        "rain_12h": rainfall_windows["rain_12h"],
        "rain_24h": rainfall_windows["rain_24h"],
        "rain_48h": rainfall_windows["rain_48h"],
        "soil_moisture_0_7cm": safe_float(
            soil.get("soil_moisture_0_7cm", 0)
        ),
        "soil_moisture_7_28cm": safe_float(
            soil.get("soil_moisture_7_28cm", 0)
        ),
        "soil_moisture_28_100cm": safe_float(
            soil.get("soil_moisture_28_100cm", 0)
        ),
        "soil_moisture_100_255cm": safe_float(
            soil.get("soil_moisture_100_255cm", 0)
        ),
        "elevation_m": safe_float(
            static.get("elevation_m", 0)
        ),
        "slope_deg": safe_float(
            zone.get(
                "slope_deg",
                static.get("slope_deg", 0),
            )
        ),
        "distance_to_river_m": safe_float(
            zone.get(
                "distance_to_river_m",
                static.get("distance_to_river_m", 0),
            )
        ),
    }

    scores = {}

    for horizon, model in ML_MODELS.items():
        score = _model_score(
            model,
            feature_row,
        )

        if score is not None:
            scores[f"{horizon}h"] = round(
                score,
                4,
            )

    if not scores:
        return {
            "available": False,
            "prototype_probability": None,
            "ml_hazard_score": None,
            "horizon_scores": {},
            "feature_source": "simulation",
            "simulation_rainfall_mm": round(
                safe_float(rainfall_mm),
                2,
            ),
            "ml_effective_1h_rainfall_mm": effective_1h,
            "error": (
                ML_MODEL_LOAD_ERROR
                or "ML prediction unavailable."
            ),
        }

    ml_hazard_score = max(
        scores.values()
    )

    return {
        "available": True,
        "prototype_probability": round(
            ml_hazard_score,
            4,
        ),
        "ml_hazard_score": round(
            ml_hazard_score,
            4,
        ),
        "horizon_scores": scores,
        "feature_source": "simulation",
        "simulation_rainfall_mm": round(
            safe_float(rainfall_mm),
            2,
        ),
        "ml_effective_1h_rainfall_mm": effective_1h,
    }


# ============================================================
# APP
# ============================================================

app = Flask(__name__)

CORS(app)


# ============================================================
# BASIN CONFIG
# ============================================================

BASIN = {
    "name": "Wayanad",
    "state": "Kerala",
    "district": "Wayanad",
    "center_lat": 11.62,
    "center_lng": 76.11,
    "reference_event_date": "2024-07-30",
}


# ============================================================
# MONITORED LOCATIONS
# ============================================================

LOCATIONS = {
    1: {
        "name": "Mundakkai",
        "lat": 11.648,
        "lng": 76.123,
    },

    2: {
        "name": "Chooralmala",
        "lat": 11.651,
        "lng": 76.126,
    },

    3: {
        "name": "Meppadi",
        "lat": 11.656,
        "lng": 76.137,
    },

    4: {
        "name": "Vythiri",
        "lat": 11.585,
        "lng": 76.085,
    },

    5: {
        "name": "Kalpetta",
        "lat": 11.609,
        "lng": 76.082,
    },
}


# ============================================================
# REPLAY / SENSOR STATE
# ============================================================
#
# This state is ONLY used for:
#
#     source=replay
#
# It is NOT used by:
#
#     source=live
#
# Live mode always obtains fresh Open-Meteo data.
# ============================================================

CURRENT_LIVE_RAINFALL = {}

CURRENT_LIVE_TIMESTAMP = None

RAINFALL_HISTORY = defaultdict(
    lambda: deque(maxlen=48)
)

CURRENT_LIVE_SOIL = {}

SENSOR_LOG = []


# ============================================================
# AUTOMATED REPLAY PROCESS
# ============================================================

REPLAY_PROCESS = None

REPLAY_LOCK = threading.Lock()


def get_replay_script_path():
    """
    Return the absolute path to replay.py.

    Expected project structure:

        backend/
            app.py
            risk_model.py
            scripts/
                replay.py
    """

    return os.path.join(
        os.path.dirname(
            os.path.abspath(__file__)
        ),
        "scripts",
        "replay.py",
    )


def is_replay_running():
    """
    Check whether the automated replay process
    is currently running.
    """

    global REPLAY_PROCESS

    if REPLAY_PROCESS is None:
        return False

    return (
        REPLAY_PROCESS.poll() is None
    )


# ============================================================
# CURRENT OPEN-METEO CACHE
# ============================================================

CURRENT_WEATHER_CACHE = {
    "timestamp": None,
    "expires_at": 0,
    "locations": {},
}


CURRENT_WEATHER_CACHE_SECONDS = 60


# ============================================================
# OPEN-METEO
# ============================================================

OPEN_METEO_ECMWF_URL = (
    "https://api.open-meteo.com/v1/ecmwf"
)


# ============================================================
# SAFE HELPERS
# ============================================================

def parse_timestamp(value):
    """
    Convert an ISO timestamp into a datetime.
    """

    if not value:
        return datetime.now()

    try:

        return datetime.fromisoformat(
            str(value).replace(
                "Z",
                "+00:00",
            )
        )

    except Exception:

        return datetime.now()


def safe_float(
    value,
    default=0.0,
):

    try:

        value = float(value)

        if value != value:
            return default

        return value

    except (
        TypeError,
        ValueError,
    ):

        return default


# Load trained ML resources after safe_float is defined.
load_ml_resources()


# ============================================================
# REPLAY SENSOR HELPERS
# ============================================================

def add_rainfall_reading(
    location_id,
    timestamp,
    rainfall_mm,
):
    """
    Store a replay/sensor rainfall reading.
    """

    try:

        location_id = int(
            location_id
        )

        rainfall_mm = float(
            rainfall_mm
        )

    except (
        TypeError,
        ValueError,
    ):

        return


    event_time = parse_timestamp(
        timestamp
    )


    history = RAINFALL_HISTORY[
        location_id
    ]


    # --------------------------------------------------------
    # Avoid duplicate timestamps.
    # --------------------------------------------------------

    updated = False


    for index, (
        old_timestamp,
        _,
    ) in enumerate(history):

        if old_timestamp == event_time:

            history[index] = (
                event_time,
                rainfall_mm,
            )

            updated = True

            break


    if not updated:

        history.append(
            (
                event_time,
                rainfall_mm,
            )
        )


    CURRENT_LIVE_RAINFALL[
        location_id
    ] = rainfall_mm


# ============================================================
# REPLAY RAINFALL WINDOWS
# ============================================================

def get_rainfall_windows(
    location_id,
):
    """
    Calculate rolling rainfall totals for
    replay/sensor data.

    Returns:

        rain_1h
        rain_3h
        rain_6h
        rain_12h
        rain_24h
        rain_48h
    """

    history = list(
        RAINFALL_HISTORY.get(
            int(location_id),
            [],
        )
    )


    if not history:

        current = (
            CURRENT_LIVE_RAINFALL.get(
                int(location_id),
                0.0,
            )
        )


        return {

            "rain_1h":
                current,

            "rain_3h":
                current,

            "rain_6h":
                current,

            "rain_12h":
                current,

            "rain_24h":
                current,

            "rain_48h":
                current,
        }


    history.sort(
        key=lambda item: item[0]
    )


    latest_time = history[-1][0]


    windows = {

        1: 0.0,
        3: 0.0,
        6: 0.0,
        12: 0.0,
        24: 0.0,
        48: 0.0,
    }


    for timestamp, rainfall in history:

        hours_old = (
            latest_time - timestamp
        ).total_seconds() / 3600.0


        for hours in windows:

            if hours_old < hours:

                windows[hours] += (
                    rainfall
                )


    return {

        "rain_1h":
            round(
                windows[1],
                2,
            ),

        "rain_3h":
            round(
                windows[3],
                2,
            ),

        "rain_6h":
            round(
                windows[6],
                2,
            ),

        "rain_12h":
            round(
                windows[12],
                2,
            ),

        "rain_24h":
            round(
                windows[24],
                2,
            ),

        "rain_48h":
            round(
                windows[48],
                2,
            ),
    }


# ============================================================
# REPLAY LIVE STATE
# ============================================================

def get_replay_live_state():

    locations = set(
        CURRENT_LIVE_RAINFALL.keys()
    )


    locations.update(
        CURRENT_LIVE_SOIL.keys()
    )


    state = {}


    for location_id in locations:

        rainfall = (
            get_rainfall_windows(
                location_id
            )
        )


        state[
            location_id
        ] = {

            **rainfall,

            "soil":
                CURRENT_LIVE_SOIL.get(
                    location_id,
                    {},
                ),
        }


    return state


# ============================================================
# CURRENT OPEN-METEO FETCH
# ============================================================

def fetch_current_weather():
    """
    Fetch current + past 48 hours from
    Open-Meteo ECMWF.

    Soil layers:

        0-7cm
        7-28cm
        28-100cm
        100-255cm
    """

    global CURRENT_WEATHER_CACHE


    now = time.time()


    # --------------------------------------------------------
    # Cache for 5 minutes.
    #
    # This prevents frontend polling every few seconds
    # from generating a new Open-Meteo request every time.
    # --------------------------------------------------------

    if (
        CURRENT_WEATHER_CACHE["locations"]
        and
        now <
        CURRENT_WEATHER_CACHE["expires_at"]
    ):

        return CURRENT_WEATHER_CACHE[
            "locations"
        ]


    latitude = ",".join(

        str(
            location["lat"]
        )

        for location in LOCATIONS.values()
    )


    longitude = ",".join(

        str(
            location["lng"]
        )

        for location in LOCATIONS.values()
    )


    params = {

        "latitude":
            latitude,

        "longitude":
            longitude,

        "hourly":
            ",".join([

                "rain",

                "soil_moisture_0_to_7cm",

                "soil_moisture_7_to_28cm",

                "soil_moisture_28_to_100cm",

                "soil_moisture_100_to_255cm",
            ]),

        "past_hours":
            48,

        "forecast_hours":
            24,

        "timezone":
            "Asia/Kolkata",

        "temperature_unit":
            "celsius",

        "precipitation_unit":
            "mm",
    }


    response = requests.get(

        OPEN_METEO_ECMWF_URL,

        params=params,

        timeout=20,
    )


    response.raise_for_status()


    data = response.json()


    # --------------------------------------------------------
    # Multiple coordinates return a list.
    # Single coordinate returns an object.
    # --------------------------------------------------------

    if isinstance(
        data,
        list,
    ):

        location_data = data

    else:

        location_data = [
            data
        ]


    result = {}


    for index, item in enumerate(
        location_data,
        start=1,
    ):

        hourly = (
            item.get(
                "hourly",
                {},
            )
        )


        timestamps = (
            hourly.get(
                "time",
                [],
            )
        )


        rain_values = (
            hourly.get(
                "rain",
                [],
            )
        )


        if not timestamps:

            continue


        # ----------------------------------------------------
        # Select the latest OBSERVED/current hour.
        # Open-Meteo also returns future forecast hours, so
        # using the last array element would incorrectly label
        # a future forecast as the current observation.
        # ----------------------------------------------------

        now_local = datetime.now()

        observed_indices = []

        for i, timestamp_value in enumerate(timestamps):

            try:
                parsed = parse_timestamp(timestamp_value)

                if parsed.tzinfo is not None:
                    parsed = parsed.replace(tzinfo=None)

                if parsed <= now_local:
                    observed_indices.append(i)

            except Exception:
                pass

        if observed_indices:
            latest_index = observed_indices[-1]
        else:
            latest_index = len(timestamps) - 1

        latest_timestamp = timestamps[latest_index]


        # ----------------------------------------------------
        # Soil moisture
        # ----------------------------------------------------

        soil = {}


        soil_mapping = {

            "soil_moisture_0_7cm":
                "soil_moisture_0_to_7cm",

            "soil_moisture_7_28cm":
                "soil_moisture_7_to_28cm",

            "soil_moisture_28_100cm":
                "soil_moisture_28_to_100cm",

            "soil_moisture_100_255cm":
                "soil_moisture_100_to_255cm",
        }


        for (
            model_column,
            api_column,
        ) in soil_mapping.items():

            values = hourly.get(
                api_column,
                [],
            )


            if (
                values
                and
                latest_index <
                len(values)
            ):

                value = values[
                    latest_index
                ]


                if value is not None:

                    soil[
                        model_column
                    ] = safe_float(
                        value
                    )


        # ----------------------------------------------------
        # Build rainfall history.
        # ----------------------------------------------------

        history = []


        for (
            timestamp,
            rain,
        ) in zip(
            timestamps,
            rain_values,
        ):

            if rain is None:
                continue


            history.append(

                (
                    parse_timestamp(
                        timestamp
                    ),

                    safe_float(
                        rain
                    ),
                )
            )


        # ----------------------------------------------------
        # Rolling rainfall windows.
        # ----------------------------------------------------

        windows = (
            calculate_external_rainfall_windows(
                history
            )
        )


        # ----------------------------------------------------
        # Current 1-hour rainfall.
        # ----------------------------------------------------

        current_rainfall = 0.0


        if (
            latest_index <
            len(rain_values)
        ):

            current_rainfall = (
                safe_float(
                    rain_values[
                        latest_index
                    ]
                )
            )


        # ----------------------------------------------------
        # Future rainfall forecast (next 24 hours).
        # Keep it in the cache so the prediction layer can
        # calculate 6h / 12h / 24h future risk.
        # ----------------------------------------------------

        forecast = []

        for i in range(
            latest_index + 1,
            min(
                len(timestamps),
                latest_index + 25,
            ),
        ):

            rain = (
                rain_values[i]
                if i < len(rain_values)
                else None
            )

            if rain is None:
                continue

            forecast.append({
                "timestamp": timestamps[i],
                "rainfall_mm": safe_float(rain),
            })

        result[
            index
        ] = {

            "timestamp":
                latest_timestamp,

            "rainfall_mm":
                current_rainfall,

            **windows,

            "soil":
                soil,

            "forecast":
                forecast,

            "forecast_hours":
                len(forecast),

            # Internal observed hourly history used by the
            # forecast-risk layer. Kept separate from the
            # frontend-facing rainfall windows.
            "_history": [
                {
                    "timestamp": item[0].isoformat(),
                    "rainfall_mm": item[1],
                }
                for item in history
            ],
        }


    CURRENT_WEATHER_CACHE = {

        "timestamp":
            datetime.now(
                timezone.utc
            ).isoformat(),

        "expires_at":
            now +
            CURRENT_WEATHER_CACHE_SECONDS,

        "locations":
            result,
    }


    return CURRENT_WEATHER_CACHE[
        "locations"
    ]


# ============================================================
# EXTERNAL RAINFALL WINDOWS
# ============================================================

def calculate_external_rainfall_windows(
    history,
):
    """
    Calculate rolling totals from Open-Meteo
    hourly data.
    """

    if not history:

        return {

            "rain_1h":
                0.0,

            "rain_3h":
                0.0,

            "rain_6h":
                0.0,

            "rain_12h":
                0.0,

            "rain_24h":
                0.0,

            "rain_48h":
                0.0,
        }


    history = sorted(
        history,
        key=lambda item: item[0],
    )


    latest_time = history[-1][0]


    windows = {

        1: 0.0,
        3: 0.0,
        6: 0.0,
        12: 0.0,
        24: 0.0,
        48: 0.0,
    }


    for timestamp, rainfall in history:

        hours_old = (
            latest_time - timestamp
        ).total_seconds() / 3600.0


        for hours in windows:

            if hours_old < hours:

                windows[hours] += (
                    rainfall
                )


    return {

        "rain_1h":
            round(
                windows[1],
                2,
            ),

        "rain_3h":
            round(
                windows[3],
                2,
            ),

        "rain_6h":
            round(
                windows[6],
                2,
            ),

        "rain_12h":
            round(
                windows[12],
                2,
            ),

        "rain_24h":
            round(
                windows[24],
                2,
            ),

        "rain_48h":
            round(
                windows[48],
                2,
            ),
    }


# ============================================================
# FRONTEND FORMATTER
# ============================================================

def to_frontend_zone(
    zone,
    rainfall_windows=None,
    soil=None,
    timestamp=None,
    ml_prediction=None,
):
    """
    Convert V4 output into the frontend structure.
    """

    risk = zone.get(
        "risk",
        "Advisory",
    )


    result = {

        "id":
            zone["id"],

        "name":
            zone["name"],

        "district":
            BASIN["district"],

        "state":
            BASIN["state"],

        "risk":
            risk,

        "type":
            (
                "Landslide"
                if risk in (
                    "High",
                    "Critical",
                )
                else "Weather"
            ),

        "rainfall":
            f"{zone.get('rainfall_mm', 0)} mm",

        "description":
            (
                f"{risk} risk — "
                f"slope "
                f"{zone.get('slope_deg', 0):.1f}°, "
                f"{zone.get('distance_to_river_m', 0):.0f}m "
                f"from nearest river."
            ),

        "lat":
            zone["lat"],

        "lng":
            zone["lng"],

        "risk_score":
            zone["risk_score"],

        # ----------------------------------------------------
        # Raw values required by the Selected Area panel.
        # These were present in the risk model but were not being
        # forwarded by the Flask frontend formatter.
        # ----------------------------------------------------
        "rainfall_mm":
            zone.get("rainfall_mm", 0),

        "slope_deg":
            zone.get("slope_deg", 0),

        "distance_to_river_m":
            zone.get("distance_to_river_m", 0),

        # ----------------------------------------------------
        # V4 model components
        # ----------------------------------------------------

        "rainfall_component":
            zone.get(
                "rainfall_component",
                0,
            ),

        "short_term_rainfall_component":
            zone.get(
                "short_term_rainfall_component",
                0,
            ),

        "antecedent_rainfall_component":
            zone.get(
                "antecedent_rainfall_component",
                0,
            ),

        "rainfall_trend_component":
            zone.get(
                "rainfall_trend_component",
                0,
            ),

        "soil_component":
            zone.get(
                "soil_component",
                0,
            ),

        "slope_component":
            zone.get(
                "slope_component",
                0,
            ),

        "river_component":
            zone.get(
                "river_component",
                0,
            ),

        "terrain_component":
            zone.get(
                "terrain_component",
                0,
            ),


        # ----------------------------------------------------
        # ML prediction
        # ----------------------------------------------------

        "ml_prediction":
            ml_prediction
            if ml_prediction
            else {},


        # ----------------------------------------------------
        # Rolling rainfall
        # ----------------------------------------------------

        "rainfall_windows":
            rainfall_windows
            if rainfall_windows
            else {},


        # ----------------------------------------------------
        # Soil
        # ----------------------------------------------------

        "soil_moisture":
            soil
            if soil
            else {},


        # ----------------------------------------------------
        # Useful for frontend
        # ----------------------------------------------------

        "live_timestamp":
            timestamp,
    }


    # --------------------------------------------------------
    # Backward-compatible soil field.
    # --------------------------------------------------------

    result[
        "soil"
    ] = (
        soil
        if soil
        else {}
    )


    return result


# ============================================================
# CURRENT LIVE DATA BUILDER
# ============================================================

def get_current_live_state():
    """
    Convert current Open-Meteo data into the
    state expected by V4 risk_model.py.
    """

    weather = (
        fetch_current_weather()
    )


    state = {}


    for location_id in LOCATIONS:

        weather_data = weather.get(
            location_id,
            {},
        )


        if not weather_data:

            continue


        state[
            location_id
        ] = {

            "rain_1h":
                weather_data.get(
                    "rain_1h",
                    0.0,
                ),

            "rain_3h":
                weather_data.get(
                    "rain_3h",
                    0.0,
                ),

            "rain_6h":
                weather_data.get(
                    "rain_6h",
                    0.0,
                ),

            "rain_12h":
                weather_data.get(
                    "rain_12h",
                    0.0,
                ),

            "rain_24h":
                weather_data.get(
                    "rain_24h",
                    0.0,
                ),

            "rain_48h":
                weather_data.get(
                    "rain_48h",
                    0.0,
                ),

            "soil":
                weather_data.get(
                    "soil",
                    {},
                ),
        }


    return state


# ============================================================
# FORECAST RISK
# ============================================================

@app.route(
    "/api/forecast-risk",
    methods=["GET"],
)
def forecast_risk():
    """
    Return predicted risk for the next 6, 12 and 24 hours
    using the live Open-Meteo rainfall forecast together
    with the current soil and terrain state.
    """

    try:

        weather = fetch_current_weather()

        forecast = compute_forecast_risks(
            weather
        )

        return jsonify({
            "source": "forecast",
            "provider": "Open-Meteo ECMWF",
            "generated_at": datetime.now(
                timezone.utc
            ).isoformat(),
            "current_data_timestamp": (
                CURRENT_WEATHER_CACHE.get(
                    "timestamp"
                )
            ),
            "horizons": [6, 12, 24],
            "zones": forecast,
        })

    except Exception as error:

        print(
            "FORECAST RISK ERROR:",
            error,
        )

        return jsonify({
            "source": "forecast",
            "error": "Unable to calculate forecast risk.",
            "details": str(error),
            "zones": [],
        }), 503


# ============================================================
# 1. RISK MAP
# ============================================================

@app.route(
    "/api/risk-map",
    methods=["GET"],
)
def risk_map():

    source = request.args.get(
        "source",
        "live",
    )


    date = request.args.get(
        "date",
        BASIN[
            "reference_event_date"
        ],
    )


    # ========================================================
    # CURRENT LIVE MODE
    # ========================================================
    #
    # ALWAYS uses current Open-Meteo.
    #
    # It does NOT use replay.py state.
    # ========================================================

    if source == "live":

        try:

            live_state = (
                get_current_live_state()
            )


            zones = (
                compute_all_zone_risks(
                    live_state=
                        live_state,
                )
            )


            current_timestamp = (
                CURRENT_WEATHER_CACHE.get(
                    "timestamp"
                )
            )


            frontend_zones = []


            for zone in zones:

                weather_data = (
                    CURRENT_WEATHER_CACHE[
                        "locations"
                    ].get(
                        zone["id"],
                        {},
                    )
                )


                frontend_zones.append(

                    to_frontend_zone(

                        zone,

                        rainfall_windows={

                            key:
                                weather_data.get(
                                    key,
                                    0,
                                )

                            for key in [

                                "rain_1h",

                                "rain_3h",

                                "rain_6h",

                                "rain_12h",

                                "rain_24h",

                                "rain_48h",
                            ]
                        },

                        soil=
                            weather_data.get(
                                "soil",
                                {},
                            ),

                        timestamp=
                            weather_data.get(
                                "timestamp"
                            ),
                    )
                )


            return jsonify({

                "date":
                    datetime.now().strftime(
                        "%Y-%m-%d"
                    ),

                "source":
                    "live",

                "provider":
                    "Open-Meteo ECMWF",

                "live_timestamp":
                    current_timestamp,

                "zones":
                    frontend_zones,
            })


        except Exception as error:

            print(
                "LIVE WEATHER ERROR:",
                error,
            )


            return jsonify({

                "date":
                    date,

                "source":
                    "live",

                "error":
                    "Unable to fetch current Open-Meteo data.",

                "details":
                    str(error),

                "zones":
                    [],
            }), 503


    # ========================================================
    # HISTORICAL REPLAY MODE
    # ========================================================

    if source == "replay":

        if CURRENT_LIVE_RAINFALL:

            replay_state = (
                get_replay_live_state()
            )


            zones = (
                compute_all_zone_risks(
                    live_state=
                        replay_state,
                )
            )


            frontend_zones = []


            for zone in zones:

                location_id = (
                    zone["id"]
                )


                frontend_zones.append(

                    to_frontend_zone(

                        zone,

                        rainfall_windows=
                            get_rainfall_windows(
                                location_id
                            ),

                        soil=
                            CURRENT_LIVE_SOIL.get(
                                location_id,
                                {},
                            ),

                        timestamp=
                            CURRENT_LIVE_TIMESTAMP,
                    )
                )


            return jsonify({

                "date":
                    date,

                "source":
                    "replay",

                "live_timestamp":
                    CURRENT_LIVE_TIMESTAMP,

                "zones":
                    frontend_zones,
            })


        # ----------------------------------------------------
        # No replay data yet.
        # ----------------------------------------------------

        zones = (
            compute_all_zone_risks()
        )


        return jsonify({

            "date":
                date,

            "source":
                "replay",

            "live_timestamp":
                None,

            "zones": [

                to_frontend_zone(
                    z
                )

                for z in zones
            ],
        })


    # ========================================================
    # IMD VALIDATION MODE
    # ========================================================

    if source == "imd":

        zones = (
            compute_all_zone_risks(
                rainfall_override_mm=
                    140.0
            )
        )


        return jsonify({

            "date":
                date,

            "source":
                "imd",

            "live_timestamp":
                CURRENT_LIVE_TIMESTAMP,

            "zones": [

                to_frontend_zone(
                    z
                )

                for z in zones
            ],
        })


    # ========================================================
    # DEFAULT
    # ========================================================

    zones = (
        compute_all_zone_risks()
    )


    return jsonify({

        "date":
            date,

        "source":
            source,

        "live_timestamp":
            CURRENT_LIVE_TIMESTAMP,

        "zones": [

            to_frontend_zone(
                z
            )

            for z in zones
        ],
    })


# ============================================================
# 2. SIMULATE
# ============================================================

@app.route(
    "/api/simulate",
    methods=["GET"],
)
def simulate():

    try:

        rainfall_mm = float(
            request.args.get(
                "rainfall_mm",
                50,
            )
        )


    except ValueError:

        return jsonify({

            "error":
                "rainfall_mm must be numeric"

        }), 400


    zones = (
        compute_all_zone_risks(
            rainfall_override_mm=
                rainfall_mm
        )
    )

    # --------------------------------------------------------
    # ML INTEGRATION
    #
    # The simulation now feeds the trained Random Forest models.
    # No automatic alert decision is made here yet; this step
    # exposes the ML prediction so it can be verified first.
    # --------------------------------------------------------

    frontend_zones = []

    for zone in zones:
        ml_prediction = predict_simulation_ml(
            zone,
            rainfall_mm,
        )

        frontend_zones.append(
            to_frontend_zone(
                zone,
                rainfall_windows=build_simulation_rainfall_windows(
                    rainfall_mm
                ),
                soil={},
                timestamp=None,
                ml_prediction=ml_prediction,
            )
        )

    return jsonify({

        "rainfall_mm":
            rainfall_mm,

        "source":
            "simulation",

        "ml_enabled":
            bool(ML_MODELS),

        "zones":
            frontend_zones,
    })


# ============================================================
# 3. DISTRICTS
# ============================================================

@app.route(
    "/api/districts",
    methods=["GET"],
)
def districts():

    zones = (
        compute_all_zone_risks()
    )


    worst = max(

        zones,

        key=lambda z:
            z["risk_score"],
    )


    return jsonify([

        {

            "id":
                1,

            "nameEn":
                BASIN["name"],

            "nameHi":
                "वायनाड",

            "state":
                BASIN["state"],

            "risk":
                worst["risk"],

            "rainfall":
                f"{worst['rainfall_mm']} mm",

            "riverLevel":
                (
                    "Rising"

                    if worst["risk"]
                    in (
                        "High",
                        "Critical",
                    )

                    else "Steady"
                ),

            "population":
                "0.4M",

            "lat":
                BASIN["center_lat"],

            "lng":
                BASIN["center_lng"],
        }

    ])


# ============================================================
# 4. ALERTS
# ============================================================

@app.route(
    "/api/alerts",
    methods=["GET"],
)
def alerts():

    # --------------------------------------------------------
    # Alerts reflect current live conditions.
    # --------------------------------------------------------

    try:

        live_state = (
            get_current_live_state()
        )


        zones = (
            compute_all_zone_risks(
                live_state=
                    live_state,
            )
        )


    except Exception:

        zones = (
            compute_all_zone_risks()
        )


    worst = max(

        zones,

        key=lambda z:
            z["risk_score"],
    )


    alert_id = (

        f"FFEW-{worst['id']}"

        f"{datetime.now().strftime('%H%M')}"
    )


    return jsonify([

        {

            "id":
                alert_id,

            "locationEn":
                f"{BASIN['state']} · "
                f"{worst['name']}",

            "locationHi":
                f"केरल · "
                f"{worst['name']}",

            "severity":
                worst["risk"],

            "issued":
                datetime.now().strftime(
                    "%H:%M"
                ),

            "status":
                "Active",

            "district":
                BASIN["district"],

            "state":
                BASIN["state"],

            "type":
                (
                    "Flash Flood Warning"

                    if worst["risk"]
                    == "Critical"

                    else "Flash Flood Watch"
                ),

            "rainfall":
                f"{worst['rainfall_mm']} mm",

            "waterLevel":
                (
                    "Rising rapidly"

                    if worst["risk"]
                    == "Critical"

                    else "Rising"
                ),
        }

    ])


# ============================================================
# 5. SENSOR INGESTION
# ============================================================

@app.route(
    "/api/sensor-data",
    methods=["POST"],
)
def sensor_data():

    global CURRENT_LIVE_TIMESTAMP


    reading = request.get_json(
        silent=True
    )


    if not reading:

        return jsonify({

            "error":
                "JSON body required"

        }), 400


    reading["received_at"] = (
        datetime.now().isoformat()
    )


    SENSOR_LOG.append(
        reading
    )


    sensor_type = reading.get(
        "sensor_type"
    )


    location_id = reading.get(
        "location_id"
    )


    timestamp = reading.get(
        "timestamp"
    )


    # ========================================================
    # RAINFALL
    # ========================================================

    if (

        sensor_type

        in (
            "rainfall_cumulative",
            "rainfall",
        )

        and

        location_id is not None
    ):

        value = reading.get(

            "value",

            reading.get(
                "rainfall_mm",
                0,
            )
        )


        add_rainfall_reading(

            location_id,

            timestamp,

            value,
        )


        CURRENT_LIVE_TIMESTAMP = (
            timestamp
        )


    # ========================================================
    # SOIL
    # ========================================================

    elif (

        sensor_type

        in (

            "soil_moisture",

            "soil_moisture_0_7cm",

            "soil_moisture_7_28cm",

            "soil_moisture_28_100cm",

            "soil_moisture_100_255cm",
        )

        and

        location_id is not None
    ):

        location_id = int(
            location_id
        )


        CURRENT_LIVE_SOIL.setdefault(

            location_id,

            {},
        )


        depth = reading.get(
            "depth"
        )


        if depth:

            column = (
                f"soil_moisture_{depth}"
            )

        else:

            column = sensor_type


        if not column.startswith(
            "soil_moisture_"
        ):

            column = (
                "soil_moisture_"
                + column
            )


        value = reading.get(
            "value"
        )


        try:

            value = float(
                value
            )


            CURRENT_LIVE_SOIL[
                location_id
            ][column] = value


        except (

            TypeError,

            ValueError,

        ):

            pass


        CURRENT_LIVE_TIMESTAMP = (
            timestamp
        )


    return jsonify({

        "status":
            "ok",

        "stored":
            reading,

        "live_state":
            get_replay_live_state(),
    })


# ============================================================
# 6. SENSOR HISTORY
# ============================================================

@app.route(
    "/api/sensor-data",
    methods=["GET"],
)
def sensor_data_latest():

    return jsonify(
        SENSOR_LOG[-20:]
    )


# ============================================================
# 7. LIVE STATE
# ============================================================

@app.route(
    "/api/live-state",
    methods=["GET"],
)
def live_state():

    # --------------------------------------------------------
    # This endpoint remains the sensor/replay state.
    #
    # Current weather has its own endpoint.
    # --------------------------------------------------------

    return jsonify({

        "timestamp":
            CURRENT_LIVE_TIMESTAMP,

        "locations":
            get_replay_live_state(),
    })


# ============================================================
# 8. CURRENT WEATHER
# ============================================================

@app.route(
    "/api/current-weather",
    methods=["GET"],
)
def current_weather():

    try:

        weather = (
            fetch_current_weather()
        )


        return jsonify({

            "source":
                "Open-Meteo ECMWF",

            "timestamp":
                CURRENT_WEATHER_CACHE.get(
                    "timestamp"
                ),

            "locations":
                weather,
        })


    except Exception as error:

        print(
            "CURRENT WEATHER ERROR:",
            error,
        )


        return jsonify({

            "error":
                "Unable to fetch current Open-Meteo weather.",

            "details":
                str(error),

        }), 503


# ============================================================
# 9. AUTOMATED REPLAY START
# ============================================================

@app.route(
    "/api/replay/start",
    methods=["POST"],
)
def replay_start():

    global REPLAY_PROCESS
    global CURRENT_LIVE_TIMESTAMP


    with REPLAY_LOCK:

        # ----------------------------------------------------
        # Don't allow two replay processes at once.
        # ----------------------------------------------------

        if is_replay_running():

            return jsonify({

                "status":
                    "already_running",

                "message":
                    "Historical replay is already running.",

                "pid":
                    REPLAY_PROCESS.pid,
            })


        # ----------------------------------------------------
        # Reset previous replay state.
        # ----------------------------------------------------

        CURRENT_LIVE_RAINFALL.clear()

        CURRENT_LIVE_SOIL.clear()

        RAINFALL_HISTORY.clear()

        SENSOR_LOG.clear()

        CURRENT_LIVE_TIMESTAMP = None


        # ----------------------------------------------------
        # Locate replay.py.
        # ----------------------------------------------------

        replay_script = (
            get_replay_script_path()
        )


        if not os.path.exists(
            replay_script
        ):

            return jsonify({

                "status":
                    "error",

                "message":
                    "replay.py not found.",

                "path":
                    replay_script,

            }), 500


        # ----------------------------------------------------
        # Start replay automatically.
        #
        # sys.executable means the same Python environment
        # running Flask will be used.
        # ----------------------------------------------------

        try:

            REPLAY_PROCESS = (
                subprocess.Popen(

                    [
                        sys.executable,

                        replay_script,
                    ],

                    cwd=os.path.dirname(
                        replay_script
                    ),

                    stdout=None,

                    stderr=None,
                )
            )


        except Exception as error:

            REPLAY_PROCESS = None


            return jsonify({

                "status":
                    "error",

                "message":
                    "Unable to start historical replay.",

                "details":
                    str(error),

            }), 500


        return jsonify({

            "status":
                "started",

            "message":
                "Historical replay started.",

            "pid":
                REPLAY_PROCESS.pid,

        })


# ============================================================
# 10. AUTOMATED REPLAY STOP
# ============================================================

@app.route(
    "/api/replay/stop",
    methods=["POST"],
)
def replay_stop():

    global REPLAY_PROCESS


    with REPLAY_LOCK:

        if not is_replay_running():

            REPLAY_PROCESS = None


            return jsonify({

                "status":
                    "not_running",

                "message":
                    "Historical replay is not running.",

            })


        try:

            REPLAY_PROCESS.terminate()


            try:

                REPLAY_PROCESS.wait(
                    timeout=5
                )


            except subprocess.TimeoutExpired:

                REPLAY_PROCESS.kill()

                REPLAY_PROCESS.wait(
                    timeout=2
                )


            REPLAY_PROCESS = None


            return jsonify({

                "status":
                    "stopped",

                "message":
                    "Historical replay stopped.",

            })


        except Exception as error:

            return jsonify({

                "status":
                    "error",

                "message":
                    "Unable to stop historical replay.",

                "details":
                    str(error),

            }), 500


# ============================================================
# 11. AUTOMATED REPLAY STATUS
# ============================================================

@app.route(
    "/api/replay/status",
    methods=["GET"],
)
def replay_status():

    running = (
        is_replay_running()
    )


    return jsonify({

        "running":
            running,

        "timestamp":
            CURRENT_LIVE_TIMESTAMP,

        "locations":
            len(
                CURRENT_LIVE_RAINFALL
            ),

        "soil_locations":
            len(
                CURRENT_LIVE_SOIL
            ),

        "process_id":
            (
                REPLAY_PROCESS.pid

                if running

                else None
            ),

    })


# ============================================================
# 12. RESET REPLAY
# ============================================================

@app.route(
    "/api/replay/reset",
    methods=["POST"],
)
def replay_reset():

    global CURRENT_LIVE_TIMESTAMP
    global REPLAY_PROCESS


    # --------------------------------------------------------
    # Stop replay process if running.
    # --------------------------------------------------------

    with REPLAY_LOCK:

        if is_replay_running():

            try:

                REPLAY_PROCESS.terminate()


                try:

                    REPLAY_PROCESS.wait(
                        timeout=5
                    )

                except subprocess.TimeoutExpired:

                    REPLAY_PROCESS.kill()

                    REPLAY_PROCESS.wait(
                        timeout=2
                    )


            except Exception:

                try:

                    REPLAY_PROCESS.kill()

                except Exception:

                    pass


            REPLAY_PROCESS = None


    # --------------------------------------------------------
    # Clear replay state.
    # --------------------------------------------------------

    CURRENT_LIVE_RAINFALL.clear()

    CURRENT_LIVE_SOIL.clear()

    RAINFALL_HISTORY.clear()

    CURRENT_LIVE_TIMESTAMP = None

    SENSOR_LOG.clear()


    return jsonify({

        "status":
            "replay state reset",

    })


# ============================================================
# 13. LEAD TIME
# ============================================================

@app.route(
    "/api/lead-time",
    methods=["GET"],
)
def lead_time():

    return jsonify({

        "event_date":
            BASIN[
                "reference_event_date"
            ],

        "predicted_alert_time":
            "2024-07-29T18:00:00",

        "actual_event_time":
            "2024-07-30T01:15:00",

        "lead_time_hours":
            7.25,

        "population_protected_estimate":
            1200,
    })


# ============================================================
# 14. HEALTH
# ============================================================

@app.route(
    "/api/health",
    methods=["GET"],
)
def health():

    try:

        weather_cached = bool(

            CURRENT_WEATHER_CACHE[
                "locations"
            ]

        )


    except Exception:

        weather_cached = False


    replay_running = (
        is_replay_running()
    )


    return jsonify({

        "status":
            "running",

        "basin":
            BASIN["name"],

        "live_weather_cached":
            weather_cached,

        "replay_running":
            replay_running,

        "replay_process_id":
            (
                REPLAY_PROCESS.pid

                if replay_running

                else None
            ),

        "replay_locations":
            len(
                CURRENT_LIVE_RAINFALL
            ),

        "replay_soil_locations":
            len(
                CURRENT_LIVE_SOIL
            ),

        "replay_timestamp":
            CURRENT_LIVE_TIMESTAMP,

        "weather_provider":
            "Open-Meteo ECMWF",
    })


# ============================================================
# RUN
# ============================================================

if __name__ == "__main__":

    app.run(

        host="127.0.0.1",

        port=5000,

        debug=False,

        threaded=True,

        use_reloader=False,
    )