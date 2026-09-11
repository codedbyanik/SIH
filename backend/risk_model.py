"""
Wayanad Flash Flood / Landslide Risk Model - V4
================================================

Explainable escalation-aware hazard risk engine.

Supports:

1. Historical calibration
2. Hypothetical rainfall simulation
3. Live/replay rainfall with rolling windows
4. Live/replay soil moisture
5. Static terrain and river-proximity features
6. Rainfall escalation / accumulation logic
7. Critical-alert gating to reduce prolonged false alarms

Flask API compatibility is preserved:

    compute_all_zone_risks()

    compute_all_zone_risks(
        rainfall_override_mm=20
    )

    compute_all_zone_risks(
        live_state=live_state
    )
"""

import os
import numpy as np
import pandas as pd


# ============================================================
# PATHS
# ============================================================

BASE_DIR = os.path.dirname(__file__)

DATA_DIR = os.path.join(
    BASE_DIR,
    "data"
)

STATIC_FEATURES_PATH = os.path.join(
    DATA_DIR,
    "static_location_features.csv"
)

HISTORICAL_FEATURES_PATH = os.path.join(
    DATA_DIR,
    "unified_training_features.csv"
)

CURRENT_SOIL_MOISTURE_PATH = os.path.join(
    DATA_DIR,
    "current_soil_moisture.csv"
)


# ============================================================
# V4 MODEL WEIGHTS
# ============================================================
#
# The model gives much more importance to rainfall behaviour
# than static terrain.
#
# Short-term rainfall:
#   1h / 3h / 6h
#
# Antecedent rainfall:
#   12h / 24h / 48h
#
# Terrain and river proximity are susceptibility factors,
# not primary triggers.
# ============================================================

SHORT_TERM_WEIGHT = 0.40
ANTECEDENT_WEIGHT = 0.25
SOIL_WEIGHT = 0.15
TERRAIN_WEIGHT = 0.10
RIVER_WEIGHT = 0.05
TREND_WEIGHT = 0.05


SHORT_TERM_RAINFALL_WEIGHTS = {
    "rain_1h": 0.30,
    "rain_3h": 0.35,
    "rain_6h": 0.35,
}


ANTECEDENT_RAINFALL_WEIGHTS = {
    "rain_12h": 0.30,
    "rain_24h": 0.45,
    "rain_48h": 0.25,
}


SOIL_WEIGHTS = {
    "soil_moisture_0_7cm": 0.35,
    "soil_moisture_7_28cm": 0.30,
    "soil_moisture_28_100cm": 0.20,
    "soil_moisture_100_255cm": 0.15,
}


# ============================================================
# ESCALATION / GATING PARAMETERS
# ============================================================

# Percentile below this level contributes almost no hazard.
WETNESS_FLOOR = 0.70

# Percentile above this level is considered extreme.
EXTREME_PERCENTILE = 0.90

# Soil percentile above this level indicates unusually wet soil.
SOIL_WETNESS_FLOOR = 0.75


# Critical requires both strong rainfall signal and
# sufficient accumulated rainfall.
CRITICAL_RAINFALL_SCORE = 0.72
CRITICAL_ANTECEDENT_SCORE = 0.65

# High requires meaningful rainfall evidence.
HIGH_TRIGGER_SCORE = 0.48


# ============================================================
# RISK LEVELS
# ============================================================

def score_to_risk_level(
    score,
    rainfall_component=0.0,
    antecedent_component=0.0
):
    """
    Convert model score into a hazard level.

    V4 intentionally separates:
        overall susceptibility
    from:
        actual rainfall triggering conditions.

    This prevents terrain alone from creating a Critical alert.

    Levels:

        < 0.30       Advisory
        0.30-0.50    Moderate
        0.50-0.70    High
        >= 0.70      Critical (with rainfall gate)
    """

    if pd.isna(score):
        return "Unknown"

    score = float(score)

    # --------------------------------------------------------
    # Critical gate
    # --------------------------------------------------------
    #
    # A Critical alert requires:
    #
    #   1. high short-term / overall rainfall signal
    #   2. meaningful antecedent accumulation
    #
    # This prevents static terrain or soil alone from producing
    # Critical alerts.
    # --------------------------------------------------------

    if (
        score >= 0.70
        and
        rainfall_component >= CRITICAL_RAINFALL_SCORE
        and
        antecedent_component >= CRITICAL_ANTECEDENT_SCORE
    ):
        return "Critical"

    # --------------------------------------------------------
    # High
    # --------------------------------------------------------

    if (
        score >= 0.50
        and
        rainfall_component >= HIGH_TRIGGER_SCORE
    ):
        return "High"

    # --------------------------------------------------------
    # Moderate
    # --------------------------------------------------------

    if score >= 0.30:
        return "Moderate"

    return "Advisory"


# ============================================================
# SAFE NUMERIC
# ============================================================

def safe_float(
    value,
    default=0.0
):

    try:

        value = float(value)

        if np.isnan(value):
            return default

        return value

    except (
        TypeError,
        ValueError
    ):

        return default


# ============================================================
# EMPIRICAL PERCENTILE
# ============================================================

def percentile_score(
    history,
    value
):

    history = pd.to_numeric(
        history,
        errors="coerce"
    ).dropna()

    value = safe_float(
        value
    )

    if history.empty:
        return 0.0

    return float(
        (history <= value).mean()
    )


# ============================================================
# ESCALATION TRANSFORMATION
# ============================================================

def escalation_score(
    percentile,
    floor=WETNESS_FLOOR
):
    """
    Convert a raw percentile into an escalation score.

    Example:

        percentile = 0.50
            -> 0.00

        percentile = 0.70
            -> 0.00

        percentile = 0.80
            -> 0.33

        percentile = 0.90
            -> 0.67

        percentile = 1.00
            -> 1.00

    This is intentionally different from using the raw
    percentile directly.

    The model therefore focuses on unusually wet conditions
    rather than treating ordinary rainfall as high risk.
    """

    percentile = safe_float(
        percentile
    )

    if percentile <= floor:
        return 0.0

    denominator = (
        1.0 - floor
    )

    if denominator <= 0:
        return 0.0

    return float(
        np.clip(
            (
                percentile - floor
            )
            /
            denominator,
            0.0,
            1.0
        )
    )


# ============================================================
# MIN-MAX
# ============================================================

def min_max(
    value,
    min_value,
    max_value
):

    value = safe_float(
        value
    )

    min_value = safe_float(
        min_value
    )

    max_value = safe_float(
        max_value
    )

    if max_value == min_value:
        return 0.5

    return float(
        np.clip(
            (
                value - min_value
            )
            /
            (
                max_value - min_value
            ),
            0.0,
            1.0
        )
    )


# ============================================================
# LOAD STATIC FEATURES
# ============================================================

def load_static_features():

    if not os.path.exists(
        STATIC_FEATURES_PATH
    ):
        raise FileNotFoundError(
            "Missing static feature file:\n"
            f"{STATIC_FEATURES_PATH}"
        )

    df = pd.read_csv(
        STATIC_FEATURES_PATH
    )

    required = [
        "location_id",
        "location_name",
        "latitude",
        "longitude",
        "elevation_m",
        "slope_deg",
        "distance_to_river_m",
    ]

    missing = [
        column
        for column in required
        if column not in df.columns
    ]

    if missing:
        raise ValueError(
            "Static feature file is missing:\n"
            +
            "\n".join(missing)
        )

    return df


# ============================================================
# LOAD HISTORICAL DATA
# ============================================================

def load_historical_features():

    if not os.path.exists(
        HISTORICAL_FEATURES_PATH
    ):
        raise FileNotFoundError(
            "Missing historical feature file:\n"
            f"{HISTORICAL_FEATURES_PATH}"
        )

    df = pd.read_csv(
        HISTORICAL_FEATURES_PATH
    )

    df["timestamp"] = pd.to_datetime(
        df["timestamp"],
        errors="coerce"
    )

    return df


# ============================================================
# BUILD HISTORICAL BASELINES
# ============================================================

def build_historical_baselines(
    historical_df
):

    rainfall_baselines = {}
    soil_baselines = {}

    for location_id, group in historical_df.groupby(
        "location_id"
    ):

        location_id = int(
            location_id
        )

        rainfall_baselines[
            location_id
        ] = {}

        for column in (
            list(
                SHORT_TERM_RAINFALL_WEIGHTS.keys()
            )
            +
            list(
                ANTECEDENT_RAINFALL_WEIGHTS.keys()
            )
        ):

            if column in group.columns:

                rainfall_baselines[
                    location_id
                ][column] = (
                    pd.to_numeric(
                        group[column],
                        errors="coerce"
                    )
                    .dropna()
                )

        soil_baselines[
            location_id
        ] = {}

        for column in SOIL_WEIGHTS:

            if column in group.columns:

                soil_baselines[
                    location_id
                ][column] = (
                    pd.to_numeric(
                        group[column],
                        errors="coerce"
                    )
                    .dropna()
                )

    return (
        rainfall_baselines,
        soil_baselines
    )


# ============================================================
# INITIALIZE MODEL DATA
# ============================================================

try:

    STATIC_DF = load_static_features()

    HISTORICAL_DF = load_historical_features()

    (
        RAINFALL_BASELINES,
        SOIL_BASELINES
    ) = build_historical_baselines(
        HISTORICAL_DF
    )

except Exception as e:

    print(
        "WARNING: Risk model initialization failed:"
    )

    print(e)

    STATIC_DF = pd.DataFrame()

    HISTORICAL_DF = pd.DataFrame()

    RAINFALL_BASELINES = {}

    SOIL_BASELINES = {}


# ============================================================
# CURRENT SOIL-MOISTURE CSV FALLBACK
# ============================================================

def load_latest_current_soil_moisture():

    if not os.path.exists(
        CURRENT_SOIL_MOISTURE_PATH
    ):
        return {}

    try:

        df = pd.read_csv(
            CURRENT_SOIL_MOISTURE_PATH
        )

        # ----------------------------------------------------
        # Support either "time" or "timestamp"
        # ----------------------------------------------------

        if "time" in df.columns:

            time_column = "time"

        elif "timestamp" in df.columns:

            time_column = "timestamp"

        else:

            print(
                "WARNING: Current soil-moisture CSV "
                "has no time/timestamp column."
            )

            return {}

        df[time_column] = pd.to_datetime(
            df[time_column],
            errors="coerce"
        )

        df = df.dropna(
            subset=[time_column]
        )

        if df.empty:
            return {}

        df = df.sort_values(
            time_column
        )

        if "location_id" not in df.columns:

            print(
                "WARNING: Current soil-moisture CSV "
                "has no location_id column."
            )

            return {}

        latest = (
            df.groupby(
                "location_id"
            )
            .tail(1)
        )

        result = {}

        # ----------------------------------------------------
        # Accept both historical and newer depth naming.
        #
        # New API-style depth names are mapped into the
        # historical model's four depth buckets.
        # ----------------------------------------------------

        aliases = {

            "soil_moisture_0_7cm": [
                "soil_moisture_0_7cm",
                "soil_moisture_0_to_7cm",
                "soil_moisture_0_to_1cm",
                "soil_moisture_0_1cm",
            ],

            "soil_moisture_7_28cm": [
                "soil_moisture_7_28cm",
                "soil_moisture_7_to_28cm",
                "soil_moisture_1_to_3cm",
            ],

            "soil_moisture_28_100cm": [
                "soil_moisture_28_100cm",
                "soil_moisture_28_to_100cm",
                "soil_moisture_3_to_9cm",
                "soil_moisture_9_to_27cm",
            ],

            "soil_moisture_100_255cm": [
                "soil_moisture_100_255cm",
                "soil_moisture_100_to_255cm",
                "soil_moisture_27_to_81cm",
            ],
        }

        for _, row in latest.iterrows():

            location_id = int(
                row["location_id"]
            )

            result[
                location_id
            ] = {}

            for target_column, possible_columns in aliases.items():

                value_found = False

                for source_column in possible_columns:

                    if source_column not in row.index:
                        continue

                    value = row[source_column]

                    if pd.notna(value):

                        result[
                            location_id
                        ][target_column] = safe_float(
                            value
                        )

                        value_found = True

                        break

                if not value_found:
                    continue

        return result

    except Exception as e:

        print(
            "WARNING: Could not load current "
            f"soil moisture: {e}"
        )

        return {}


# ============================================================
# STATIC COMPONENTS
# ============================================================

def calculate_static_components(
    static_df
):

    static_df = static_df.copy()

    slope_min = static_df[
        "slope_deg"
    ].min()

    slope_max = static_df[
        "slope_deg"
    ].max()

    river_min = static_df[
        "distance_to_river_m"
    ].min()

    river_max = static_df[
        "distance_to_river_m"
    ].max()

    # --------------------------------------------------------
    # Slope susceptibility
    # --------------------------------------------------------

    static_df[
        "slope_component"
    ] = static_df[
        "slope_deg"
    ].apply(
        lambda value:
        min_max(
            safe_float(value),
            slope_min,
            slope_max
        )
    )

    # --------------------------------------------------------
    # River susceptibility
    #
    # Closer to river = higher risk
    # --------------------------------------------------------

    static_df[
        "river_component"
    ] = static_df[
        "distance_to_river_m"
    ].apply(
        lambda value:
        1.0
        -
        min_max(
            safe_float(value),
            river_min,
            river_max
        )
    )

    return static_df


# ============================================================
# RAINFALL COMPONENTS
# ============================================================

def calculate_rainfall_components(
    location_id,
    rainfall_windows=None,
    rainfall_override_mm=None
):
    """
    Returns:

        {
            "short_term": ...,
            "antecedent": ...,
            "overall": ...,
            "trend": ...,
        }

    LIVE / REPLAY:
        Uses actual rolling windows.

    SIMULATION:
        Uses the supplied hourly rainfall value.

    FALLBACK:
        Uses historical latest hourly rainfall.
    """

    location_id = int(
        location_id
    )

    baselines = RAINFALL_BASELINES.get(
        location_id,
        {}
    )

    # ========================================================
    # LIVE / REPLAY
    # ========================================================

    if rainfall_windows:

        short_term_score = 0.0
        short_total_weight = 0.0

        antecedent_score = 0.0
        antecedent_total_weight = 0.0

        # ----------------------------------------------------
        # Short-term rainfall
        # ----------------------------------------------------

        for column, weight in (
            SHORT_TERM_RAINFALL_WEIGHTS.items()
        ):

            if column not in rainfall_windows:
                continue

            if column not in baselines:
                continue

            value = safe_float(
                rainfall_windows[column]
            )

            percentile = percentile_score(
                baselines[column],
                value
            )

            escalation = escalation_score(
                percentile
            )

            short_term_score += (
                escalation
                *
                weight
            )

            short_total_weight += weight

        if short_total_weight > 0:

            short_term_score /= (
                short_total_weight
            )

        # ----------------------------------------------------
        # Antecedent rainfall
        # ----------------------------------------------------

        for column, weight in (
            ANTECEDENT_RAINFALL_WEIGHTS.items()
        ):

            if column not in rainfall_windows:
                continue

            if column not in baselines:
                continue

            value = safe_float(
                rainfall_windows[column]
            )

            percentile = percentile_score(
                baselines[column],
                value
            )

            escalation = escalation_score(
                percentile
            )

            antecedent_score += (
                escalation
                *
                weight
            )

            antecedent_total_weight += weight

        if antecedent_total_weight > 0:

            antecedent_score /= (
                antecedent_total_weight
            )

        # ----------------------------------------------------
        # Trend
        #
        # The Flask replay layer may supply:
        #
        #   rainfall_trend
        #
        # Positive values mean recent rainfall is increasing.
        #
        # We intentionally clip this signal.
        # ----------------------------------------------------

        trend_value = safe_float(
            rainfall_windows.get(
                "rainfall_trend",
                0.0
            )
        )

        # Convert:
        #
        # <= 0.0 -> 0
        #  0.5    -> 0.5
        # >= 1.0  -> 1
        #
        # This is only an auxiliary signal.
        trend_score = float(
            np.clip(
                trend_value,
                0.0,
                1.0
            )
        )

        overall = (
            SHORT_TERM_WEIGHT
            *
            short_term_score

            +

            ANTECEDENT_WEIGHT
            *
            antecedent_score
        )

        return {
            "short_term":
                float(
                    np.clip(
                        short_term_score,
                        0.0,
                        1.0
                    )
                ),

            "antecedent":
                float(
                    np.clip(
                        antecedent_score,
                        0.0,
                        1.0
                    )
                ),

            "overall":
                float(
                    np.clip(
                        overall,
                        0.0,
                        1.0
                    )
                ),

            "trend":
                trend_score,
        }

    # ========================================================
    # SINGLE-VALUE SIMULATION
    # ========================================================

    rainfall = safe_float(
        rainfall_override_mm
    )

    hourly_history = baselines.get(
        "rain_1h",
        pd.Series(dtype=float)
    )

    if not hourly_history.empty:

        percentile = percentile_score(
            hourly_history,
            rainfall
        )

        escalation = escalation_score(
            percentile
        )

        # Simulation represents a short-term intensity event.
        return {
            "short_term":
                escalation,

            "antecedent":
                0.0,

            "overall":
                escalation,

            "trend":
                0.0,
        }

    fallback = float(
        np.clip(
            rainfall / 25.0,
            0.0,
            1.0
        )
    )

    return {
        "short_term":
            fallback,

        "antecedent":
            0.0,

        "overall":
            fallback,

        "trend":
            0.0,
    }


# ============================================================
# SOIL COMPONENT
# ============================================================

def calculate_soil_component(
    location_id,
    soil_values
):

    location_id = int(
        location_id
    )

    baselines = SOIL_BASELINES.get(
        location_id,
        {}
    )

    if not baselines:
        return 0.0

    if not soil_values:
        return 0.0

    weighted_score = 0.0
    total_weight = 0.0

    for column, weight in SOIL_WEIGHTS.items():

        if column not in soil_values:
            continue

        if column not in baselines:
            continue

        value = safe_float(
            soil_values[column]
        )

        percentile = percentile_score(
            baselines[column],
            value
        )

        # Soil is treated as a susceptibility amplifier.
        # Ordinary soil moisture does not create strong risk.

        escalation = escalation_score(
            percentile,
            floor=SOIL_WETNESS_FLOOR
        )

        weighted_score += (
            escalation
            *
            weight
        )

        total_weight += weight

    if total_weight == 0:
        return 0.0

    return float(
        np.clip(
            weighted_score
            /
            total_weight,
            0.0,
            1.0
        )
    )


# ============================================================
# MAIN RISK FUNCTION
# ============================================================

def compute_all_zone_risks(
    rainfall_override_mm=None,
    live_state=None
):
    """
    Compute risk for all Wayanad locations.

    Parameters
    ----------
    rainfall_override_mm:
        Used by /api/simulate.

    live_state:
        Dictionary from Flask live-state layer.

    Returns
    -------
    list
        Risk information for every zone.
    """

    if STATIC_DF.empty:

        raise RuntimeError(
            "Static risk-model data is unavailable."
        )

    static_df = calculate_static_components(
        STATIC_DF
    )

    # --------------------------------------------------------
    # CSV fallback for current soil moisture
    # --------------------------------------------------------

    csv_soil = (
        load_latest_current_soil_moisture()
    )

    if live_state is None:
        live_state = {}

    results = []

    # ========================================================
    # LOCATION LOOP
    # ========================================================

    for _, row in static_df.iterrows():

        location_id = int(
            row["location_id"]
        )

        location_name = (
            row["location_name"]
        )

        # ----------------------------------------------------
        # LIVE LOCATION STATE
        # ----------------------------------------------------

        location_state = (
            live_state.get(
                location_id,
                {}
            )
        )

        # JSON keys can become strings.
        if not location_state:

            location_state = (
                live_state.get(
                    str(location_id),
                    {}
                )
            )

        # ----------------------------------------------------
        # RAINFALL WINDOWS
        # ----------------------------------------------------

        rainfall_windows = (
            location_state.get(
                "rainfall_windows"
            )
        )

        # Support direct shape:
        #
        # {
        #   "rain_1h": ...,
        #   "rain_3h": ...
        # }

        if not rainfall_windows:

            candidate = {
                key:
                    location_state[key]

                for key in (
                    list(
                        SHORT_TERM_RAINFALL_WEIGHTS.keys()
                    )
                    +
                    list(
                        ANTECEDENT_RAINFALL_WEIGHTS.keys()
                    )
                )

                if key in location_state
            }

            # Also preserve trend if present.
            if "rainfall_trend" in location_state:

                candidate[
                    "rainfall_trend"
                ] = location_state[
                    "rainfall_trend"
                ]

            if candidate:

                rainfall_windows = candidate

        # ----------------------------------------------------
        # CURRENT RAINFALL
        # ----------------------------------------------------

        latest_rainfall = 0.0

        if rainfall_windows:

            latest_rainfall = safe_float(
                rainfall_windows.get(
                    "rain_1h",
                    0.0
                )
            )

        # ====================================================
        # RAINFALL CALCULATION
        # ====================================================

        # ----------------------------------------------------
        # SIMULATION
        # ----------------------------------------------------

        if rainfall_override_mm is not None:

            rainfall = safe_float(
                rainfall_override_mm
            )

            rainfall_parts = (
                calculate_rainfall_components(
                    location_id=location_id,
                    rainfall_override_mm=rainfall
                )
            )

        # ----------------------------------------------------
        # LIVE / REPLAY
        # ----------------------------------------------------

        elif rainfall_windows:

            rainfall = safe_float(
                latest_rainfall
            )

            rainfall_parts = (
                calculate_rainfall_components(
                    location_id=location_id,
                    rainfall_windows=rainfall_windows
                )
            )

        # ----------------------------------------------------
        # HISTORICAL FALLBACK
        # ----------------------------------------------------

        else:

            rainfall = 0.0

            if not HISTORICAL_DF.empty:

                history = (
                    HISTORICAL_DF[
                        HISTORICAL_DF[
                            "location_id"
                        ]
                        ==
                        location_id
                    ]
                    .sort_values(
                        "timestamp"
                    )
                )

                if not history.empty:

                    rainfall = safe_float(
                        history[
                            "rainfall_mm"
                        ].iloc[-1]
                    )

            rainfall_parts = (
                calculate_rainfall_components(
                    location_id=location_id,
                    rainfall_override_mm=rainfall
                )
            )

        # ----------------------------------------------------
        # Rainfall components
        # ----------------------------------------------------

        short_term_component = safe_float(
            rainfall_parts[
                "short_term"
            ]
        )

        antecedent_component = safe_float(
            rainfall_parts[
                "antecedent"
            ]
        )

        rainfall_component = safe_float(
            rainfall_parts[
                "overall"
            ]
        )

        trend_component = safe_float(
            rainfall_parts[
                "trend"
            ]
        )

        # ====================================================
        # SOIL MOISTURE
        # ====================================================

        live_soil = (
            location_state.get(
                "soil",
                {}
            )
        )

        if live_soil:

            soil_values = live_soil

        else:

            soil_values = (
                csv_soil.get(
                    location_id,
                    {}
                )
            )

        soil_component = (
            calculate_soil_component(
                location_id,
                soil_values
            )
        )

        # ====================================================
        # STATIC TERRAIN
        # ====================================================

        slope_component = safe_float(
            row[
                "slope_component"
            ]
        )

        river_component = safe_float(
            row[
                "river_component"
            ]
        )

        # Combined terrain susceptibility.
        terrain_component = (
            0.60
            *
            slope_component
            +
            0.40
            *
            river_component
        )

        # ====================================================
        # FINAL V4 SCORE
        # ====================================================
        #
        # Main risk signal:
        #
        #     short-term rainfall
        #     antecedent accumulation
        #
        # Supporting signals:
        #
        #     soil
        #     terrain
        #     river
        #     rainfall trend
        #
        # ====================================================

        risk_score = (

            SHORT_TERM_WEIGHT
            *
            short_term_component

            +

            ANTECEDENT_WEIGHT
            *
            antecedent_component

            +

            SOIL_WEIGHT
            *
            soil_component

            +

            TERRAIN_WEIGHT
            *
            terrain_component

            +

            RIVER_WEIGHT
            *
            river_component

            +

            TREND_WEIGHT
            *
            trend_component
        )

        risk_score = float(
            np.clip(
                risk_score,
                0.0,
                1.0
            )
        )

        # ----------------------------------------------------
        # Alert level with rainfall gate
        # ----------------------------------------------------

        risk_level = (
            score_to_risk_level(
                risk_score,
                rainfall_component=(
                    short_term_component
                ),
                antecedent_component=(
                    antecedent_component
                )
            )
        )

        # ====================================================
        # OUTPUT
        # ====================================================

        result = {

            "id":
                location_id,

            "name":
                location_name,

            "lat":
                safe_float(
                    row[
                        "latitude"
                    ]
                ),

            "lng":
                safe_float(
                    row[
                        "longitude"
                    ]
                ),

            "rainfall_mm":
                round(
                    rainfall,
                    1
                ),

            "slope_deg":
                round(
                    safe_float(
                        row[
                            "slope_deg"
                        ]
                    ),
                    2
                ),

            "distance_to_river_m":
                round(
                    safe_float(
                        row[
                            "distance_to_river_m"
                        ]
                    ),
                    1
                ),

            # ------------------------------------------------
            # Rainfall components
            # ------------------------------------------------

            "rainfall_component":
                round(
                    rainfall_component,
                    3
                ),

            "short_term_rainfall_component":
                round(
                    short_term_component,
                    3
                ),

            "antecedent_rainfall_component":
                round(
                    antecedent_component,
                    3
                ),

            "rainfall_trend_component":
                round(
                    trend_component,
                    3
                ),

            # ------------------------------------------------
            # Other components
            # ------------------------------------------------

            "soil_component":
                round(
                    soil_component,
                    3
                ),

            "slope_component":
                round(
                    slope_component,
                    3
                ),

            "river_component":
                round(
                    river_component,
                    3
                ),

            "terrain_component":
                round(
                    terrain_component,
                    3
                ),

            # ------------------------------------------------
            # Final
            # ------------------------------------------------

            "risk_score":
                round(
                    risk_score,
                    3
                ),

            "risk":
                risk_level,
        }

        # ----------------------------------------------------
        # Preserve rainfall windows when available.
        #
        # This is useful for the frontend and replay debugging.
        # ----------------------------------------------------

        if rainfall_windows:

            result[
                "rainfall_windows"
            ] = {
                key:
                    round(
                        safe_float(
                            value
                        ),
                        2
                    )

                for key, value
                in rainfall_windows.items()

                if key in (
                    "rain_1h",
                    "rain_3h",
                    "rain_6h",
                    "rain_12h",
                    "rain_24h",
                    "rain_48h",
                    "rainfall_trend",
                )
            }

        # ----------------------------------------------------
        # Preserve soil values when available.
        # ----------------------------------------------------

        if soil_values:

            result[
                "soil"
            ] = {
                key:
                    round(
                        safe_float(
                            value
                        ),
                        4
                    )

                for key, value
                in soil_values.items()
            }

        results.append(
            result
        )

    return results


# ============================================================
# STANDALONE TEST
# ============================================================

if __name__ == "__main__":

    print(
        "\nWAYANAD V4 ESCALATION-AWARE RISK MODEL"
    )

    print(
        "======================================="
    )

    # --------------------------------------------------------
    # Current / fallback
    # --------------------------------------------------------

    print(
        "\nCurrent/fallback risk:\n"
    )

    zones = compute_all_zone_risks()

    for zone in zones:

        print(
            f"{zone['name']:15s} "
            f"rain={zone['rainfall_mm']:6.1f} mm "
            f"short={zone['short_term_rainfall_component']:.3f} "
            f"antecedent={zone['antecedent_rainfall_component']:.3f} "
            f"soil={zone['soil_component']:.3f} "
            f"score={zone['risk_score']:.3f} "
            f"risk={zone['risk']}"
        )

    # --------------------------------------------------------
    # Simulation
    # --------------------------------------------------------

    print(
        "\nSimulation at 20 mm/hour:\n"
    )

    zones = compute_all_zone_risks(
        rainfall_override_mm=20.0
    )

    for zone in zones:

        print(
            f"{zone['name']:15s} "
            f"score="
            f"{zone['risk_score']:.3f} "
            f"risk="
            f"{zone['risk']}"
        )

    # --------------------------------------------------------
    # Live-state test for Mundakkai
    # --------------------------------------------------------

    print(
        "\nLive-state test for Mundakkai:\n"
    )

    test_live_state = {

        1: {

            "rain_1h": 8.6,

            "rain_3h": 30.7,

            "rain_6h": 41.9,

            "rain_12h": 41.9,

            "rain_24h": 41.9,

            "rain_48h": 41.9,

            "rainfall_trend":
                1.0,

            "soil": {

                "soil_moisture_0_7cm":
                    0.506,

                "soil_moisture_7_28cm":
                    0.520,

                "soil_moisture_28_100cm":
                    0.502,

                "soil_moisture_100_255cm":
                    0.510,
            }
        }
    }

    zones = compute_all_zone_risks(
        live_state=test_live_state
    )

    for zone in zones:

        if zone["id"] == 1:

            print(
                f"{zone['name']:15s} "
                f"short="
                f"{zone['short_term_rainfall_component']:.3f} "
                f"antecedent="
                f"{zone['antecedent_rainfall_component']:.3f} "
                f"soil="
                f"{zone['soil_component']:.3f} "
                f"score="
                f"{zone['risk_score']:.3f} "
                f"risk="
                f"{zone['risk']}"
            )