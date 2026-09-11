"""
SIH26192 - Automatic Historical Sensor Replay
---------------------------------------------

This file is normally NOT run manually.

app.py starts it automatically through:

    POST /api/replay/start

The replay sends historical rainfall + soil moisture to:

    /api/sensor-data

The backend then calculates rolling rainfall windows and
passes them to the V4 risk engine.

Historical window:
    27 July 2024 00:00
    ->
    31 July 2024 00:00

Speed:
    1 historical hour = 2 real seconds

Therefore the complete 97-hour demonstration takes about
3.2 minutes.

Important:
    This script does NOT call /api/replay/reset.
    app.py resets the state BEFORE launching this process.
"""

import os
import time
import requests
import pandas as pd


# ============================================================
# CONFIGURATION
# ============================================================

API_BASE = "http://127.0.0.1:5000"

# 1800:
# 3600 / 1800 = 2 seconds per historical hour.
SPEED_FACTOR = 1800

REPLAY_START = pd.Timestamp(
    "2024-07-27 00:00:00"
)

REPLAY_END = pd.Timestamp(
    "2024-07-31 00:00:00"
)

EVENT_TIME = pd.Timestamp(
    "2024-07-30 01:15:00"
)


# ============================================================
# FIVE LOCATIONS
# ============================================================

LOCATIONS = [
    {
        "id": 1,
        "name": "Mundakkai",
    },
    {
        "id": 2,
        "name": "Chooralmala",
    },
    {
        "id": 3,
        "name": "Meppadi",
    },
    {
        "id": 4,
        "name": "Vythiri",
    },
    {
        "id": 5,
        "name": "Kalpetta",
    },
]


# ============================================================
# PATHS
# ============================================================

SCRIPT_DIR = os.path.dirname(
    os.path.abspath(__file__)
)

BACKEND_DIR = os.path.dirname(
    SCRIPT_DIR
)

DATA_DIR = os.path.join(
    BACKEND_DIR,
    "data"
)

RAINFALL_FILE = os.path.join(
    DATA_DIR,
    "historical_rainfall.csv"
)

SOIL_FILE = os.path.join(
    DATA_DIR,
    "historical_soil_moisture.csv"
)


# ============================================================
# LOAD DATA
# ============================================================

print("=" * 70)
print("WAYANAD HISTORICAL SENSOR REPLAY")
print("=" * 70)

print(
    "\nLoading historical rainfall..."
)

rainfall = pd.read_csv(
    RAINFALL_FILE
)

rainfall["timestamp"] = pd.to_datetime(
    rainfall["timestamp"]
)

print(
    "Loading historical soil moisture..."
)

soil = pd.read_csv(
    SOIL_FILE
)

soil["timestamp"] = pd.to_datetime(
    soil["timestamp"]
)


# ============================================================
# FILTER DEMO WINDOW
# ============================================================

rainfall = rainfall[
    (
        rainfall["timestamp"]
        >= REPLAY_START
    )
    &
    (
        rainfall["timestamp"]
        <= REPLAY_END
    )
].copy()

soil = soil[
    (
        soil["timestamp"]
        >= REPLAY_START
    )
    &
    (
        soil["timestamp"]
        <= REPLAY_END
    )
].copy()


# ============================================================
# SORT
# ============================================================

rainfall = rainfall.sort_values(
    [
        "timestamp",
        "location_id",
    ]
).reset_index(
    drop=True
)

soil = soil.sort_values(
    [
        "timestamp",
        "location_id",
    ]
).reset_index(
    drop=True
)


print(
    f"\nRainfall rows: {len(rainfall)}"
)

print(
    f"Soil rows: {len(soil)}"
)


# ============================================================
# VALIDATE LOCATIONS
# ============================================================

expected_locations = {
    1,
    2,
    3,
    4,
    5,
}

rain_locations = set(
    rainfall["location_id"].unique()
)

soil_locations = set(
    soil["location_id"].unique()
)

if rain_locations != expected_locations:
    raise ValueError(
        "Rainfall dataset does not contain all five "
        f"locations: {rain_locations}"
    )

if soil_locations != expected_locations:
    raise ValueError(
        "Soil dataset does not contain all five "
        f"locations: {soil_locations}"
    )


# ============================================================
# LOOKUPS
# ============================================================

rainfall_lookup = {}

for _, row in rainfall.iterrows():
    key = (
        row["timestamp"],
        int(row["location_id"])
    )

    rainfall_lookup[key] = float(
        row["rainfall_mm"]
    )


soil_lookup = {}

required_soil_columns = [
    "soil_moisture_0_7cm",
    "soil_moisture_7_28cm",
    "soil_moisture_28_100cm",
    "soil_moisture_100_255cm",
]

missing_soil_columns = [
    column
    for column in required_soil_columns
    if column not in soil.columns
]

if missing_soil_columns:
    raise ValueError(
        "Historical soil dataset is missing: "
        + ", ".join(
            missing_soil_columns
        )
    )


for _, row in soil.iterrows():
    key = (
        row["timestamp"],
        int(row["location_id"])
    )

    soil_lookup[key] = {
        "soil_moisture_0_7cm":
            float(
                row[
                    "soil_moisture_0_7cm"
                ]
            ),

        "soil_moisture_7_28cm":
            float(
                row[
                    "soil_moisture_7_28cm"
                ]
            ),

        "soil_moisture_28_100cm":
            float(
                row[
                    "soil_moisture_28_100cm"
                ]
            ),

        "soil_moisture_100_255cm":
            float(
                row[
                    "soil_moisture_100_255cm"
                ]
            ),
    }


# ============================================================
# COMMON TIMESTAMPS
# ============================================================

rainfall_timestamps = set(
    rainfall["timestamp"].unique()
)

soil_timestamps = set(
    soil["timestamp"].unique()
)

timestamps = sorted(
    rainfall_timestamps
    &
    soil_timestamps
)

if not timestamps:
    raise ValueError(
        "No common timestamps between rainfall and soil data."
    )


print(
    f"\nCommon hourly timestamps: "
    f"{len(timestamps)}"
)


# ============================================================
# BACKEND CHECK
# ============================================================

print(
    "\nChecking backend..."
)

try:
    response = requests.get(
        f"{API_BASE}/api/health",
        timeout=5
    )

    response.raise_for_status()

    print(
        "Backend is running."
    )

except requests.exceptions.RequestException as error:
    print(
        "\nERROR: Could not reach Flask backend."
    )

    print(
        "Start app.py first."
    )

    print(error)

    raise SystemExit(1)


# ============================================================
# REPLAY INFO
# ============================================================

seconds_per_hour = (
    3600 / SPEED_FACTOR
)

estimated_seconds = (
    len(timestamps)
    *
    seconds_per_hour
)

print(
    f"\nReplaying {len(timestamps)} hours."
)

print(
    f"Replay speed: "
    f"1 historical hour = "
    f"{seconds_per_hour:.1f} seconds"
)

print(
    f"Estimated runtime: "
    f"{estimated_seconds / 60:.1f} minutes"
)

print(
    "\nEvent reference:"
)

print(
    f"  {EVENT_TIME}"
)


# ============================================================
# FIRST ALERT TRACKING
# ============================================================

first_high_time = None
first_high_location = None

first_critical_time = None
first_critical_location = None


# ============================================================
# POST HELPERS
# ============================================================

def post_json(
    endpoint,
    payload
):
    response = requests.post(
        f"{API_BASE}{endpoint}",
        json=payload,
        timeout=5
    )

    response.raise_for_status()

    return response.json()


# ============================================================
# MAIN LOOP
# ============================================================

for index, timestamp in enumerate(
    timestamps
):

    timestamp_string = (
        timestamp.isoformat()
    )

    # --------------------------------------------------------
    # Send all five rainfall + soil readings.
    # --------------------------------------------------------

    for location in LOCATIONS:

        location_id = location["id"]

        key = (
            timestamp,
            location_id
        )

        # ====================================================
        # RAINFALL
        # ====================================================

        if key in rainfall_lookup:

            rainfall_value = (
                rainfall_lookup[key]
            )

            rainfall_payload = {
                "timestamp":
                    timestamp_string,

                "sensor_id":
                    f"RAIN-WAYANAD-{location_id:02d}",

                "sensor_type":
                    "rainfall",

                "location_id":
                    location_id,

                "value":
                    round(
                        rainfall_value,
                        2
                    ),

                "location":
                    f"{location['name']}, Wayanad",
            }

            try:
                post_json(
                    "/api/sensor-data",
                    rainfall_payload
                )

            except requests.exceptions.RequestException as error:
                print(
                    f"\nRainfall POST failed for "
                    f"{location['name']} "
                    f"at {timestamp}:"
                )

                print(error)

                raise SystemExit(1)

        # ====================================================
        # SOIL
        # ====================================================

        if key in soil_lookup:

            soil_values = (
                soil_lookup[key]
            )

            for depth, value in soil_values.items():

                depth_name = (
                    depth.replace(
                        "soil_moisture_",
                        ""
                    )
                )

                soil_payload = {
                    "timestamp":
                        timestamp_string,

                    "sensor_id":
                        f"SOIL-WAYANAD-{location_id:02d}",

                    "sensor_type":
                        "soil_moisture",

                    "location_id":
                        location_id,

                    "depth":
                        depth_name,

                    "value":
                        round(
                            value,
                            4
                        ),

                    "location":
                        f"{location['name']}, Wayanad",
                }

                try:
                    post_json(
                        "/api/sensor-data",
                        soil_payload
                    )

                except requests.exceptions.RequestException as error:
                    print(
                        f"\nSoil POST failed for "
                        f"{location['name']} "
                        f"at {timestamp}:"
                    )

                    print(error)

                    raise SystemExit(1)

    # ========================================================
    # CHECK CURRENT REPLAY RISK
    # ========================================================

    try:

        response = requests.get(
            f"{API_BASE}/api/risk-map"
            "?source=replay",
            timeout=5
        )

        response.raise_for_status()

        risk_data = response.json()

    except requests.exceptions.RequestException as error:

        print(
            "\nRisk-map request failed:"
        )

        print(error)

        raise SystemExit(1)

    zones = risk_data.get(
        "zones",
        []
    )

    # --------------------------------------------------------
    # Track first High / Critical.
    # --------------------------------------------------------

    for zone in zones:

        risk = zone.get(
            "risk",
            "Advisory"
        )

        if (
            risk in (
                "High",
                "Critical"
            )
            and
            first_high_time is None
        ):
            first_high_time = timestamp
            first_high_location = zone.get(
                "name"
            )

        if (
            risk == "Critical"
            and
            first_critical_time is None
        ):
            first_critical_time = timestamp
            first_critical_location = zone.get(
                "name"
            )

    # --------------------------------------------------------
    # Print summary.
    # --------------------------------------------------------

    if zones:

        worst = max(
            zones,
            key=lambda zone:
                float(
                    zone.get(
                        "risk_score",
                        0
                    )
                )
        )

        summary = []

        for zone in zones:

            short_name = {
                "Mundakkai": "Mund",
                "Chooralmala": "Choo",
                "Meppadi": "Mepp",
                "Vythiri": "Vyth",
                "Kalpetta": "Kalp",
            }.get(
                zone.get("name"),
                zone.get("name", "")[:4]
            )

            summary.append(
                f"{short_name}:"
                f"{zone.get('risk', 'Advisory')[:3]}"
            )

        print(
            f"{timestamp} | "
            f"Worst: "
            f"{worst.get('name')} "
            f"{worst.get('risk')} "
            f"({float(worst.get('risk_score', 0)):.3f}) | "
            +
            "  ".join(summary)
        )

    # --------------------------------------------------------
    # 2 real seconds per historical hour.
    # --------------------------------------------------------

    if index < len(timestamps) - 1:
        time.sleep(
            seconds_per_hour
        )


# ============================================================
# FINAL RESULTS
# ============================================================

print(
    "\n" + "=" * 70
)

print(
    "REPLAY COMPLETE"
)

print(
    "=" * 70
)

if first_high_time is not None:

    lead_time = (
        EVENT_TIME - first_high_time
    ).total_seconds() / 3600.0

    print(
        "\nFirst High risk:"
    )

    print(
        f"  Location: "
        f"{first_high_location}"
    )

    print(
        f"  Time: "
        f"{first_high_time}"
    )

    print(
        f"  Lead time: "
        f"{lead_time:.2f} hours"
    )

else:

    print(
        "\nFirst High risk:"
    )

    print(
        "  Not reached during replay."
    )


if first_critical_time is not None:

    lead_time = (
        EVENT_TIME - first_critical_time
    ).total_seconds() / 3600.0

    print(
        "\nFirst Critical risk:"
    )

    print(
        f"  Location: "
        f"{first_critical_location}"
    )

    print(
        f"  Time: "
        f"{first_critical_time}"
    )

    print(
        f"  Lead time: "
        f"{lead_time:.2f} hours"
    )

else:

    print(
        "\nFirst Critical risk:"
    )

    print(
        "  Not reached during replay."
    )


print(
    "\nHistorical sensor replay finished."
)
