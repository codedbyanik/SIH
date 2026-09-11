"""
Build the first unified historical feature dataset for the
Wayanad flash-flood prediction system.

Input files:
    data/historical_rainfall.csv
    data/historical_forecast_rainfall.csv
    data/historical_soil_moisture.csv
    data/static_location_features.csv

Output:
    data/unified_training_features.csv

Each row represents:
    one location at one hourly timestamp.

IMPORTANT:
    This creates a FEATURE dataset.
    Flood/event labels are NOT created here.
"""

import os
import pandas as pd


# ============================================================
# Paths
# ============================================================

BASE_DIR = os.path.dirname(os.path.dirname(__file__))

DATA_DIR = os.path.join(BASE_DIR, "data")

RAINFALL_FILE = os.path.join(
    DATA_DIR,
    "historical_rainfall.csv"
)

FORECAST_FILE = os.path.join(
    DATA_DIR,
    "historical_forecast_rainfall.csv"
)

SOIL_FILE = os.path.join(
    DATA_DIR,
    "historical_soil_moisture.csv"
)

STATIC_FILE = os.path.join(
    DATA_DIR,
    "static_location_features.csv"
)

OUTPUT_FILE = os.path.join(
    DATA_DIR,
    "unified_training_features.csv"
)


# ============================================================
# Load datasets
# ============================================================

print("==============================================")
print("Building Unified Wayanad Feature Dataset")
print("==============================================")

print("\nLoading historical rainfall...")
rainfall = pd.read_csv(RAINFALL_FILE)

print("Loading historical forecast rainfall...")
forecast = pd.read_csv(FORECAST_FILE)

print("Loading historical soil moisture...")
soil = pd.read_csv(SOIL_FILE)

print("Loading static terrain features...")
static = pd.read_csv(STATIC_FILE)


# ============================================================
# Convert timestamps
# ============================================================

rainfall["timestamp"] = pd.to_datetime(
    rainfall["timestamp"]
)

forecast["timestamp"] = pd.to_datetime(
    forecast["timestamp"]
)

soil["timestamp"] = pd.to_datetime(
    soil["timestamp"]
)


# ============================================================
# Check dataset sizes
# ============================================================

print("\nDataset sizes:")
print(f"Historical rainfall:          {len(rainfall)} rows")
print(f"Historical forecast rainfall: {len(forecast)} rows")
print(f"Historical soil moisture:     {len(soil)} rows")
print(f"Static features:              {len(static)} rows")


# ============================================================
# Validate location IDs
# ============================================================

expected_locations = {1, 2, 3, 4, 5}

rainfall_locations = set(
    rainfall["location_id"].unique()
)

forecast_locations = set(
    forecast["location_id"].unique()
)

soil_locations = set(
    soil["location_id"].unique()
)

static_locations = set(
    static["location_id"].unique()
)

if rainfall_locations != expected_locations:
    raise ValueError(
        f"Unexpected rainfall locations: "
        f"{rainfall_locations}"
    )

if forecast_locations != expected_locations:
    raise ValueError(
        f"Unexpected forecast locations: "
        f"{forecast_locations}"
    )

if soil_locations != expected_locations:
    raise ValueError(
        f"Unexpected soil locations: "
        f"{soil_locations}"
    )

if static_locations != expected_locations:
    raise ValueError(
        f"Unexpected static locations: "
        f"{static_locations}"
    )

print("\nAll 5 Wayanad locations verified.")


# ============================================================
# Select required columns
# ============================================================

rainfall = rainfall[
    [
        "timestamp",
        "location_id",
        "location_name",
        "rainfall_mm"
    ]
].copy()

forecast = forecast[
    [
        "timestamp",
        "location_id",
        "forecast_rainfall_mm"
    ]
].copy()

soil = soil[
    [
        "timestamp",
        "location_id",
        "soil_moisture_0_7cm",
        "soil_moisture_7_28cm",
        "soil_moisture_28_100cm",
        "soil_moisture_100_255cm"
    ]
].copy()

static = static[
    [
        "location_id",
        "location_name",
        "latitude",
        "longitude",
        "elevation_m",
        "slope_deg",
        "distance_to_river_m"
    ]
].copy()


# ============================================================
# Check duplicate rows
# ============================================================

def check_duplicates(df, name):

    duplicates = df.duplicated(
        subset=["timestamp", "location_id"]
    ).sum()

    if duplicates > 0:
        raise ValueError(
            f"{name} contains {duplicates} duplicate "
            f"timestamp/location rows."
        )


check_duplicates(
    rainfall,
    "Historical rainfall"
)

check_duplicates(
    forecast,
    "Historical forecast rainfall"
)

check_duplicates(
    soil,
    "Historical soil moisture"
)

print("No duplicate timestamp/location records found.")


# ============================================================
# Merge rainfall + forecast
# ============================================================

print("\nMerging rainfall and forecast data...")

df = pd.merge(
    rainfall,
    forecast,
    on=[
        "timestamp",
        "location_id"
    ],
    how="inner"
)


# ============================================================
# Merge soil moisture
# ============================================================

print("Merging soil moisture...")

df = pd.merge(
    df,
    soil,
    on=[
        "timestamp",
        "location_id"
    ],
    how="inner"
)


# ============================================================
# Merge static terrain features
# ============================================================

print("Merging terrain features...")

df = pd.merge(
    df,
    static,
    on="location_id",
    how="left",
    suffixes=("", "_static")
)


# ============================================================
# Check location name
# ============================================================

# Keep the name from rainfall.
# Verify it agrees with the static dataset.

if "location_name_static" in df.columns:

    mismatch = (
        df["location_name"]
        != df["location_name_static"]
    ).sum()

    if mismatch > 0:

        raise ValueError(
            f"Location name mismatch in {mismatch} rows."
        )

    df.drop(
        columns=["location_name_static"],
        inplace=True
    )


# ============================================================
# Sort data
# ============================================================

df = df.sort_values(
    [
        "location_id",
        "timestamp"
    ]
).reset_index(drop=True)


# ============================================================
# Rainfall accumulation features
# ============================================================

print("\nCalculating rainfall accumulation features...")

grouped_rain = df.groupby(
    "location_id"
)["rainfall_mm"]

# Current hourly rainfall
df["rain_1h"] = df["rainfall_mm"]

# Previous + current 3-hour rainfall
df["rain_3h"] = grouped_rain.transform(
    lambda x: x.rolling(
        window=3,
        min_periods=1
    ).sum()
)

# 6-hour rainfall
df["rain_6h"] = grouped_rain.transform(
    lambda x: x.rolling(
        window=6,
        min_periods=1
    ).sum()
)

# 12-hour rainfall
df["rain_12h"] = grouped_rain.transform(
    lambda x: x.rolling(
        window=12,
        min_periods=1
    ).sum()
)

# 24-hour rainfall
df["rain_24h"] = grouped_rain.transform(
    lambda x: x.rolling(
        window=24,
        min_periods=1
    ).sum()
)

# 48-hour rainfall
df["rain_48h"] = grouped_rain.transform(
    lambda x: x.rolling(
        window=48,
        min_periods=1
    ).sum()
)


# ============================================================
# Forecast rainfall accumulation features
# ============================================================

print("Calculating forecast rainfall features...")

grouped_forecast = df.groupby(
    "location_id"
)["forecast_rainfall_mm"]

df["forecast_rain_1h"] = (
    df["forecast_rainfall_mm"]
)

df["forecast_rain_3h"] = grouped_forecast.transform(
    lambda x: x.rolling(
        window=3,
        min_periods=1
    ).sum()
)

df["forecast_rain_6h"] = grouped_forecast.transform(
    lambda x: x.rolling(
        window=6,
        min_periods=1
    ).sum()
)


# ============================================================
# Restore chronological ordering
# ============================================================

df = df.sort_values(
    [
        "timestamp",
        "location_id"
    ]
).reset_index(drop=True)


# ============================================================
# Reorder columns
# ============================================================

columns = [
    # Time / location
    "timestamp",
    "location_id",
    "location_name",
    "latitude",
    "longitude",

    # Historical rainfall
    "rainfall_mm",
    "rain_1h",
    "rain_3h",
    "rain_6h",
    "rain_12h",
    "rain_24h",
    "rain_48h",

    # Historical forecast rainfall
    "forecast_rainfall_mm",
    "forecast_rain_1h",
    "forecast_rain_3h",
    "forecast_rain_6h",

    # Historical soil moisture
    "soil_moisture_0_7cm",
    "soil_moisture_7_28cm",
    "soil_moisture_28_100cm",
    "soil_moisture_100_255cm",

    # Static terrain / hydrology
    "elevation_m",
    "slope_deg",
    "distance_to_river_m"
]

df = df[columns]


# ============================================================
# Missing-value check
# ============================================================

print("\nChecking missing values...")

missing = df.isnull().sum()

missing = missing[
    missing > 0
]

if len(missing) > 0:

    print("\nWARNING: Missing values found:")

    print(missing)

else:

    print("No missing values found.")


# ============================================================
# Final validation
# ============================================================

print("\n==============================================")
print("Final Dataset Validation")
print("==============================================")

print(
    f"Rows:    {len(df)}"
)

print(
    f"Columns: {len(df.columns)}"
)

print(
    f"Locations: {df['location_id'].nunique()}"
)

print(
    f"Time range: "
    f"{df['timestamp'].min()} "
    f"to "
    f"{df['timestamp'].max()}"
)


# ============================================================
# Save
# ============================================================

df.to_csv(
    OUTPUT_FILE,
    index=False
)

print("\n==============================================")
print("Unified dataset created successfully!")
print("==============================================")

print(
    f"\nSaved to:\n{OUTPUT_FILE}"
)

print("\nColumns:")

for column in df.columns:
    print(f"  - {column}")

print("\nFirst 10 rows:")

print(
    df.head(10).to_string(index=False)
)