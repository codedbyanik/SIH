"""
WAYANAD RISK MODEL V2

Percentile-based, explainable hazard-risk model.

Input:
    data/unified_training_features.csv

Output:
    data/historical_risk_scores_v2.csv

This is NOT supervised ML.
It is an explainable historical-percentile risk model.

Risk inputs:
    - rainfall intensity and accumulation
    - soil moisture
    - slope
    - distance to river
"""

import os
import numpy as np
import pandas as pd


# ============================================================
# PATHS
# ============================================================

BASE_DIR = os.path.dirname(
    os.path.dirname(__file__)
)

DATA_DIR = os.path.join(
    BASE_DIR,
    "data"
)

INPUT_FILE = os.path.join(
    DATA_DIR,
    "unified_training_features.csv"
)

OUTPUT_FILE = os.path.join(
    DATA_DIR,
    "historical_risk_scores_v2.csv"
)


# ============================================================
# MODEL WEIGHTS
# ============================================================

RAINFALL_WEIGHT = 0.55
SOIL_WEIGHT = 0.25
SLOPE_WEIGHT = 0.10
RIVER_WEIGHT = 0.10


RAINFALL_WINDOW_WEIGHTS = {
    "rain_1h": 0.15,
    "rain_3h": 0.20,
    "rain_6h": 0.20,
    "rain_12h": 0.20,
    "rain_24h": 0.15,
    "rain_48h": 0.10
}


SOIL_WEIGHTS = {
    "soil_moisture_0_7cm": 0.35,
    "soil_moisture_7_28cm": 0.30,
    "soil_moisture_28_100cm": 0.20,
    "soil_moisture_100_255cm": 0.15
}


# ============================================================
# RISK LEVELS
# ============================================================

def score_to_risk(score):

    if score < 0.30:
        return "Advisory"

    elif score < 0.55:
        return "Moderate"

    elif score < 0.75:
        return "High"

    else:
        return "Critical"


# ============================================================
# PERCENTILE FUNCTION
# ============================================================

def percentile_score(history, value):
    """
    Return the empirical percentile of value within history.

    Output:
        0.0 - 1.0
    """

    history = history.dropna()

    if len(history) == 0:
        return 0.0

    return float(
        (history <= value).mean()
    )


# ============================================================
# LOAD DATA
# ============================================================

print("=" * 70)
print("WAYANAD RISK MODEL V2")
print("PERCENTILE-BASED RISK ENGINE")
print("=" * 70)

df = pd.read_csv(
    INPUT_FILE,
    parse_dates=["timestamp"]
)

print(
    f"\nLoaded rows: {len(df)}"
)


# ============================================================
# REQUIRED COLUMNS
# ============================================================

required = [
    "timestamp",
    "location_id",
    "location_name",

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

    "slope_deg",
    "distance_to_river_m"
]

missing = [
    column
    for column in required
    if column not in df.columns
]

if missing:
    raise ValueError(
        "Missing columns:\n"
        + "\n".join(missing)
    )


# ============================================================
# EVENT VALIDATION PERIOD
# ============================================================

EVENT_TIME = pd.Timestamp(
    "2024-07-30 01:15:00"
)

VALIDATION_START = (
    EVENT_TIME -
    pd.Timedelta(hours=12)
)

VALIDATION_END = (
    EVENT_TIME +
    pd.Timedelta(hours=1)
)

EVENT_LOCATIONS = [
    "Mundakkai",
    "Chooralmala"
]


# ============================================================
# CREATE COMPONENTS
# ============================================================

print("\nCalculating percentile-based components...")


# ------------------------------------------------------------
# Process one location at a time
# ------------------------------------------------------------

results = []

for location_id, location_df in df.groupby(
    "location_id",
    sort=False
):

    location_df = location_df.sort_values(
        "timestamp"
    ).copy()

    location_name = (
        location_df["location_name"]
        .iloc[0]
    )

    # --------------------------------------------------------
    # RAINFALL COMPONENT
    # --------------------------------------------------------

    rainfall_scores = pd.DataFrame(
        index=location_df.index
    )

    for column in RAINFALL_WINDOW_WEIGHTS:

        history = location_df[column]

        rainfall_scores[column] = [
            percentile_score(
                history,
                value
            )
            for value in location_df[column]
        ]

    location_df["rainfall_component"] = 0.0

    for column, weight in RAINFALL_WINDOW_WEIGHTS.items():

        location_df["rainfall_component"] += (
            rainfall_scores[column]
            * weight
        )


    # --------------------------------------------------------
    # SOIL COMPONENT
    # --------------------------------------------------------

    soil_scores = pd.DataFrame(
        index=location_df.index
    )

    for column in SOIL_WEIGHTS:

        history = location_df[column]

        soil_scores[column] = [
            percentile_score(
                history,
                value
            )
            for value in location_df[column]
        ]

    location_df["soil_component"] = 0.0

    for column, weight in SOIL_WEIGHTS.items():

        location_df["soil_component"] += (
            soil_scores[column]
            * weight
        )


    # --------------------------------------------------------
    # STATIC SLOPE COMPONENT
    # --------------------------------------------------------

    slope_min = location_df["slope_deg"].min()
    slope_max = location_df["slope_deg"].max()

    # Since slope is static for a location,
    # calculate risk relative to the five model locations later.
    location_df["_slope"] = (
        location_df["slope_deg"]
    )


    # --------------------------------------------------------
    # RIVER COMPONENT
    # --------------------------------------------------------

    location_df["_river"] = (
        location_df["distance_to_river_m"]
    )

    results.append(
        location_df
    )


# ============================================================
# COMBINE
# ============================================================

df = pd.concat(
    results,
    ignore_index=True
)


# ============================================================
# STATIC FEATURE NORMALIZATION ACROSS LOCATIONS
# ============================================================

slope_min = df["slope_deg"].min()
slope_max = df["slope_deg"].max()

if slope_max > slope_min:

    df["slope_component"] = (
        df["slope_deg"] - slope_min
    ) / (
        slope_max - slope_min
    )

else:

    df["slope_component"] = 0.0


# Smaller river distance = higher risk

river_min = df["distance_to_river_m"].min()
river_max = df["distance_to_river_m"].max()

if river_max > river_min:

    df["river_component"] = (
        river_max - df["distance_to_river_m"]
    ) / (
        river_max - river_min
    )

else:

    df["river_component"] = 0.0


# ============================================================
# FINAL RISK SCORE
# ============================================================

df["risk_score"] = (

    RAINFALL_WEIGHT
    * df["rainfall_component"]

    +

    SOIL_WEIGHT
    * df["soil_component"]

    +

    SLOPE_WEIGHT
    * df["slope_component"]

    +

    RIVER_WEIGHT
    * df["river_component"]
)


df["risk_score"] = (
    df["risk_score"]
    .clip(0.0, 1.0)
)


# ============================================================
# RISK LEVEL
# ============================================================

df["risk_level"] = (
    df["risk_score"]
    .apply(score_to_risk)
)


# ============================================================
# VALIDATION TARGET
# ============================================================

df["documented_event_target"] = 0

event_mask = (
    df["location_name"].isin(
        EVENT_LOCATIONS
    )
    &
    (
        df["timestamp"]
        >= EVENT_TIME - pd.Timedelta(hours=3)
    )
    &
    (
        df["timestamp"]
        < EVENT_TIME
    )
)

df.loc[
    event_mask,
    "documented_event_target"
] = 1


# ============================================================
# SAVE
# ============================================================

output_columns = [
    "timestamp",
    "location_id",
    "location_name",
    "latitude",
    "longitude",

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

    "rainfall_component",
    "soil_component",
    "slope_component",
    "river_component",

    "risk_score",
    "risk_level",

    "documented_event_target"
]


result = df[
    output_columns
].copy()

result.to_csv(
    OUTPUT_FILE,
    index=False
)


# ============================================================
# SUMMARY
# ============================================================

print("\n" + "=" * 70)
print("RISK MODEL V2 COMPLETE")
print("=" * 70)

print(
    f"\nRows: {len(result)}"
)

print(
    f"Locations: "
    f"{result['location_id'].nunique()}"
)

print(
    f"\nOutput:\n{OUTPUT_FILE}"
)

print("\nRisk-level distribution:")

print(
    result[
        "risk_level"
    ]
    .value_counts()
    .to_string()
)


# ============================================================
# 2024 EVENT VALIDATION
# ============================================================

print("\n" + "=" * 70)
print("2024 EVENT VALIDATION")
print("=" * 70)

validation = result[
    (
        result["location_name"]
        .isin(EVENT_LOCATIONS)
    )
    &
    (
        result["timestamp"]
        >= VALIDATION_START
    )
    &
    (
        result["timestamp"]
        <= VALIDATION_END
    )
].copy()

validation = validation.sort_values(
    [
        "location_name",
        "timestamp"
    ]
)

print(
    validation[
        [
            "timestamp",
            "location_name",
            "rain_3h",
            "rain_6h",
            "rain_12h",
            "rain_24h",
            "rain_48h",
            "rainfall_component",
            "soil_component",
            "slope_component",
            "river_component",
            "risk_score",
            "risk_level"
        ]
    ].to_string(index=False)
)


# ============================================================
# HIGHEST RISK BEFORE EVENT
# ============================================================

if not validation.empty:

    highest = validation.loc[
        validation["risk_score"].idxmax()
    ]

    print("\nHighest risk in validation window:")

    print(
        f"Location: {highest['location_name']}"
    )

    print(
        f"Time: {highest['timestamp']}"
    )

    print(
        f"Score: {highest['risk_score']:.3f}"
    )

    print(
        f"Risk: {highest['risk_level']}"
    )


print("\nSUCCESS.")