import os
import pandas as pd


# ============================================================
# PATH
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


# ============================================================
# LOAD FULL DATASET
# ============================================================

df = pd.read_csv(
    INPUT_FILE,
    parse_dates=["timestamp"]
)

locations = [
    "Mundakkai",
    "Chooralmala"
]

event_time = pd.Timestamp(
    "2024-07-30 01:15:00"
)


# ============================================================
# RAINFALL FEATURES
# ============================================================

rainfall_features = [
    "rain_1h",
    "rain_3h",
    "rain_6h",
    "rain_12h",
    "rain_24h",
    "rain_48h"
]


# ============================================================
# FULL HISTORICAL PERCENTILES
# ============================================================

print("=" * 75)
print("FULL HISTORICAL RAINFALL ANALYSIS")
print("=" * 75)

print(
    f"\nDataset period: "
    f"{df['timestamp'].min()} → "
    f"{df['timestamp'].max()}"
)

print(
    f"Total rows: {len(df)}"
)


for location in locations:

    print("\n" + "=" * 75)
    print(f"{location} — FULL 2022–2024 DISTRIBUTION")
    print("=" * 75)

    location_df = df[
        df["location_name"] == location
    ].copy()

    # --------------------------------------------
    # Event row
    # --------------------------------------------

    event_rows = location_df[
        location_df["timestamp"]
        == pd.Timestamp("2024-07-30 01:00:00")
    ]

    if event_rows.empty:

        print(
            "\nWARNING: Event timestamp not found."
        )

        continue

    event_row = event_rows.iloc[0]

    # --------------------------------------------
    # Percentile across ENTIRE historical period
    # --------------------------------------------

    print("\nEvent rainfall percentiles:")
    print(
        "(calculated against the complete 2022–2024 "
        "history for this location)"
    )

    for feature in rainfall_features:

        event_value = event_row[feature]

        percentile = (
            location_df[feature]
            <= event_value
        ).mean() * 100

        maximum = (
            location_df[feature]
            .max()
        )

        print(
            f"{feature:12s}: "
            f"value={event_value:8.2f} mm | "
            f"percentile={percentile:7.2f}% | "
            f"historical_max={maximum:8.2f} mm"
        )


    # ========================================================
    # EVENT LEAD-UP
    # ========================================================

    print("\n" + "-" * 75)
    print("EVENT LEAD-UP")
    print("-" * 75)

    lead_up_start = (
        event_time
        - pd.Timedelta(hours=12)
    )

    lead_up_end = (
        event_time
        + pd.Timedelta(hours=1)
    )

    lead_up = location_df[
        (location_df["timestamp"] >= lead_up_start)
        &
        (location_df["timestamp"] <= lead_up_end)
    ]

    print(
        lead_up[
            [
                "timestamp",
                "rainfall_mm",
                "rain_3h",
                "rain_6h",
                "rain_12h",
                "rain_24h",
                "rain_48h",
                "soil_moisture_0_7cm",
                "soil_moisture_7_28cm",
                "soil_moisture_28_100cm",
                "soil_moisture_100_255cm"
            ]
        ].to_string(index=False)
    )


# ============================================================
# EVENT COMPARISON BETWEEN LOCATIONS
# ============================================================

print("\n" + "=" * 75)
print("EVENT COMPARISON")
print("=" * 75)

event_rows = df[
    (
        df["location_name"].isin(locations)
    )
    &
    (
        df["timestamp"]
        == pd.Timestamp("2024-07-30 01:00:00")
    )
].copy()

print(
    event_rows[
        [
            "location_name",
            "rainfall_mm",
            "rain_3h",
            "rain_6h",
            "rain_12h",
            "rain_24h",
            "rain_48h",
            "soil_moisture_0_7cm",
            "soil_moisture_7_28cm",
            "slope_deg",
            "distance_to_river_m"
        ]
    ].to_string(index=False)
)


# ============================================================
# FULL DATASET MAXIMUMS
# ============================================================

print("\n" + "=" * 75)
print("FULL DATASET MAXIMUMS BY LOCATION")
print("=" * 75)

for location in locations:

    location_df = df[
        df["location_name"] == location
    ]

    print(f"\n{location}")

    for feature in rainfall_features:

        print(
            f"{feature:12s}: "
            f"{location_df[feature].max():.2f} mm"
        )


# ============================================================
# TOP HISTORICAL EVENTS / RAINFALL EPISODES
# ============================================================

print("\n" + "=" * 75)
print("TOP 10 HISTORICAL 24-HOUR RAINFALL VALUES")
print("=" * 75)

for location in locations:

    location_df = df[
        df["location_name"] == location
    ]

    top10 = (
        location_df[
            [
                "timestamp",
                "rain_24h"
            ]
        ]
        .sort_values(
            "rain_24h",
            ascending=False
        )
        .head(10)
    )

    print(f"\n{location}")

    print(
        top10.to_string(
            index=False
        )
    )


print("\n")
print("=" * 75)
print("ANALYSIS COMPLETE")
print("=" * 75)