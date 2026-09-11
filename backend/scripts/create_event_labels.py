"""
Create future-hazard labels for the Wayanad prediction dataset.

For each documented event, rows whose timestamp falls within
the 3 hours BEFORE the documented event start are labelled:

    target_hazard_3h = 1

Meaning:

    1 = documented hazard starts within the next 3 hours
    0 = no documented hazard starts within the next 3 hours

IMPORTANT:
This is a prototype event-window label based on documented
event timing. It is not a complete flood/landslide inventory.
"""

import os
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

FEATURE_FILE = os.path.join(
    DATA_DIR,
    "unified_training_features.csv"
)

EVENT_FILE = os.path.join(
    DATA_DIR,
    "historical_events.csv"
)

OUTPUT_FILE = os.path.join(
    DATA_DIR,
    "unified_training_dataset.csv"
)


# ============================================================
# SETTINGS
# ============================================================

PREDICTION_HORIZON_HOURS = 3


# ============================================================
# LOAD
# ============================================================

print("=" * 60)
print("CREATING FUTURE HAZARD LABELS")
print("=" * 60)

features = pd.read_csv(
    FEATURE_FILE,
    parse_dates=["timestamp"]
)

events = pd.read_csv(
    EVENT_FILE
)

events["start_time"] = pd.to_datetime(
    events["start_time"]
)

events["end_time"] = pd.to_datetime(
    events["end_time"]
)


# ============================================================
# INITIAL TARGET
# ============================================================

features["target_hazard_3h"] = 0


# ============================================================
# APPLY EVENT LABELS
# ============================================================

for _, event in events.iterrows():

    event_start = event["start_time"]

    # We want conditions BEFORE the event.
    prediction_window_start = (
        event_start
        - pd.Timedelta(
            hours=PREDICTION_HORIZON_HOURS
        )
    )

    prediction_window_end = event_start

    mask = (
        (features["location_id"] == event["location_id"])
        &
        (features["timestamp"] >= prediction_window_start)
        &
        (features["timestamp"] < prediction_window_end)
    )

    features.loc[
        mask,
        "target_hazard_3h"
    ] = 1

    print("\nEvent:")
    print(
        f"  ID: {event['event_id']}"
    )
    print(
        f"  Type: {event['event_type']}"
    )
    print(
        f"  Location: {event['location_name']}"
    )
    print(
        f"  Documented start: {event_start}"
    )
    print(
        f"  Prediction window: "
        f"{prediction_window_start} → "
        f"{prediction_window_end}"
    )
    print(
        f"  Positive rows: {mask.sum()}"
    )


# ============================================================
# CLASS BALANCE
# ============================================================

positive = (
    features["target_hazard_3h"] == 1
).sum()

negative = (
    features["target_hazard_3h"] == 0
).sum()

total = len(features)

print("\n" + "=" * 60)
print("LABEL SUMMARY")
print("=" * 60)

print(
    f"Total rows:       {total}"
)

print(
    f"Positive rows:    {positive}"
)

print(
    f"Negative rows:    {negative}"
)

print(
    f"Positive rate:    {positive / total:.6%}"
)


# ============================================================
# SHOW POSITIVE ROWS
# ============================================================

print("\nPositive samples:")

positive_rows = features[
    features["target_hazard_3h"] == 1
]

columns_to_show = [
    "timestamp",
    "location_id",
    "location_name",
    "rainfall_mm",
    "rain_3h",
    "rain_6h",
    "rain_12h",
    "rain_24h",
    "rain_48h",
    "forecast_rainfall_mm",
    "soil_moisture_0_7cm",
    "soil_moisture_7_28cm",
    "elevation_m",
    "slope_deg",
    "distance_to_river_m",
    "target_hazard_3h"
]

print(
    positive_rows[
        columns_to_show
    ].to_string(index=False)
)


# ============================================================
# SAVE
# ============================================================

features.to_csv(
    OUTPUT_FILE,
    index=False
)

print("\n" + "=" * 60)
print("SUCCESS")
print("=" * 60)

print(
    f"\nSaved to:\n{OUTPUT_FILE}"
)