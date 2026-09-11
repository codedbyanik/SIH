"""
Calibrate risk thresholds using historical V2 risk scores.

Input:
    data/historical_risk_scores_v2.csv

Output:
    Console analysis only.

Purpose:
    Determine how frequently the current score would classify
    historical conditions as Advisory / Moderate / High / Critical
    and find sensible thresholds before connecting the model
    to the live backend.
"""

import os
import pandas as pd
import numpy as np


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
    "historical_risk_scores_v2.csv"
)


# ============================================================
# LOAD
# ============================================================

print("=" * 75)
print("RISK THRESHOLD CALIBRATION")
print("=" * 75)

df = pd.read_csv(
    INPUT_FILE,
    parse_dates=["timestamp"]
)

print(f"\nRows: {len(df)}")
print(
    f"Period: {df['timestamp'].min()} → "
    f"{df['timestamp'].max()}"
)


# ============================================================
# BASIC SCORE STATISTICS
# ============================================================

print("\n" + "=" * 75)
print("RISK SCORE DISTRIBUTION")
print("=" * 75)

print(
    df["risk_score"].describe(
        percentiles=[
            0.50,
            0.75,
            0.90,
            0.95,
            0.97,
            0.98,
            0.99
        ]
    ).to_string()
)


# ============================================================
# CURRENT V2 THRESHOLDS
# ============================================================

print("\n" + "=" * 75)
print("CURRENT V2 THRESHOLDS")
print("=" * 75)

current_thresholds = {
    "Advisory": (0.00, 0.30),
    "Moderate": (0.30, 0.55),
    "High": (0.55, 0.75),
    "Critical": (0.75, 1.01)
}

for level, (lower, upper) in current_thresholds.items():

    mask = (
        (df["risk_score"] >= lower)
        &
        (df["risk_score"] < upper)
    )

    count = mask.sum()

    percentage = (
        count / len(df)
    ) * 100

    print(
        f"{level:10s}: "
        f"{count:7d} rows "
        f"({percentage:6.2f}%)"
    )


# ============================================================
# CANDIDATE THRESHOLDS
# ============================================================

print("\n" + "=" * 75)
print("CANDIDATE THRESHOLD ANALYSIS")
print("=" * 75)

candidate_thresholds = [
    0.50,
    0.55,
    0.60,
    0.65,
    0.70,
    0.75,
    0.80,
    0.85,
    0.90,
    0.92,
    0.95
]

print(
    "\nThreshold = percentage of all historical hours "
    "classified at or above that threshold."
)

for threshold in candidate_thresholds:

    count = (
        df["risk_score"] >= threshold
    ).sum()

    percentage = (
        count / len(df)
    ) * 100

    print(
        f"Score >= {threshold:.2f}: "
        f"{count:7d} rows "
        f"({percentage:6.2f}%)"
    )


# ============================================================
# DAILY FREQUENCY OF HIGH / CRITICAL CONDITIONS
# ============================================================

print("\n" + "=" * 75)
print("DAILY HIGH / CRITICAL FREQUENCY")
print("=" * 75)

df["date"] = (
    df["timestamp"]
    .dt.date
)

daily = (
    df.groupby("date")
    .agg(
        max_risk_score=(
            "risk_score",
            "max"
        ),
        mean_risk_score=(
            "risk_score",
            "mean"
        )
    )
    .reset_index()
)

for threshold in [
    0.75,
    0.80,
    0.85,
    0.90,
    0.95
]:

    days = (
        daily["max_risk_score"]
        >= threshold
    ).sum()

    print(
        f"Days with max score >= "
        f"{threshold:.2f}: {days}"
    )


# ============================================================
# TOP 30 RISK PERIODS
# ============================================================

print("\n" + "=" * 75)
print("TOP 30 HISTORICAL RISK RECORDS")
print("=" * 75)

top = (
    df[
        [
            "timestamp",
            "location_name",
            "rain_24h",
            "rain_48h",
            "soil_component",
            "risk_score",
            "risk_level"
        ]
    ]
    .sort_values(
        "risk_score",
        ascending=False
    )
    .head(30)
)

print(
    top.to_string(index=False)
)


# ============================================================
# 2024 EVENT
# ============================================================

print("\n" + "=" * 75)
print("2024 EVENT COMPARISON")
print("=" * 75)

event_time = pd.Timestamp(
    "2024-07-30 01:15:00"
)

event_start = (
    event_time
    - pd.Timedelta(hours=12)
)

event_end = (
    event_time
    + pd.Timedelta(hours=1)
)

event_locations = [
    "Mundakkai",
    "Chooralmala"
]

event_df = df[
    (
        df["location_name"]
        .isin(event_locations)
    )
    &
    (
        df["timestamp"] >= event_start
    )
    &
    (
        df["timestamp"] <= event_end
    )
].copy()

event_df = event_df.sort_values(
    "risk_score",
    ascending=False
)

print(
    event_df[
        [
            "timestamp",
            "location_name",
            "rain_24h",
            "rain_48h",
            "soil_component",
            "risk_score",
            "risk_level"
        ]
    ].head(20).to_string(index=False)
)


# ============================================================
# EVENT LEAD TIME FOR CANDIDATE THRESHOLDS
# ============================================================

print("\n" + "=" * 75)
print("EVENT LEAD-TIME ANALYSIS")
print("=" * 75)

for threshold in [
    0.70,
    0.75,
    0.80,
    0.85,
    0.90,
    0.95
]:

    qualifying = event_df[
        event_df["risk_score"] >= threshold
    ]

    if qualifying.empty:

        print(
            f"Threshold {threshold:.2f}: "
            "not reached"
        )

        continue

    earliest = qualifying[
        "timestamp"
    ].min()

    lead_time = (
        event_time - earliest
    ).total_seconds() / 3600

    print(
        f"Threshold {threshold:.2f}: "
        f"first reached {earliest} | "
        f"lead time ≈ {lead_time:.2f} hours"
    )


# ============================================================
# LOCATION COMPARISON
# ============================================================

print("\n" + "=" * 75)
print("LOCATION RISK STATISTICS")
print("=" * 75)

location_stats = (
    df.groupby("location_name")
    .agg(
        mean_score=("risk_score", "mean"),
        p90=("risk_score", lambda x: x.quantile(0.90)),
        p95=("risk_score", lambda x: x.quantile(0.95)),
        p99=("risk_score", lambda x: x.quantile(0.99)),
        max_score=("risk_score", "max")
    )
    .sort_values(
        "max_score",
        ascending=False
    )
)

print(
    location_stats.to_string()
)


print("\n" + "=" * 75)
print("CALIBRATION COMPLETE")
print("=" * 75)