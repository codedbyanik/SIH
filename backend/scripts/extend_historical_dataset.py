"""
Extend SIH Wayanad ML training features backward from 2022 to 2018.
Run from backend directory:
    python scripts/extend_historical_dataset.py

It fetches Open-Meteo historical rainfall + four soil-moisture depths for
2018-01-01 through 2021-12-31 for the five monitored Wayanad zones, creates
1h/3h/6h/12h/24h/48h rainfall windows, merges the existing 2022-2024 feature
file, and regenerates ml_training_dataset.csv from historical_events.csv.
"""
from pathlib import Path
import time
import requests
import pandas as pd

BASE = Path(__file__).resolve().parents[1]
DATA = BASE / "data"
START = "2018-01-01"
END = "2021-12-31"
ARCHIVE = "https://archive-api.open-meteo.com/v1/archive"

LOCATIONS = [
    (1, "Mundakkai", 11.648, 76.123, 738.0, 3.97, 18.98),
    (2, "Chooralmala", 11.651, 76.126, 756.0, 9.21, 252.89),
    (3, "Meppadi", 11.656, 76.137, 757.0, 14.07, 168.95),
    (4, "Vythiri", 11.585, 76.085, 789.0, 11.12, 226.30),
    (5, "Kalpetta", 11.609, 76.082, 753.0, 5.95, 383.84),
]

HOURLY = ",".join([
    "rain",
    "soil_moisture_0_to_7cm",
    "soil_moisture_7_to_28cm",
    "soil_moisture_28_to_100cm",
    "soil_moisture_100_to_255cm",
])


def fetch_one(location):
    lid, name, lat, lon, elev, slope, river = location
    params = {
        "latitude": lat,
        "longitude": lon,
        "start_date": START,
        "end_date": END,
        "hourly": HOURLY,
        "timezone": "Asia/Kolkata",
    }
    print(f"Fetching {name} ...")
    r = requests.get(ARCHIVE, params=params, timeout=120)
    r.raise_for_status()
    j = r.json()
    h = j["hourly"]
    out = pd.DataFrame({
        "timestamp": pd.to_datetime(h["time"]),
        "location_id": lid,
        "location_name": name,
        "latitude": lat,
        "longitude": lon,
        "rainfall_mm": h["rain"],
        "soil_moisture_0_7cm": h["soil_moisture_0_to_7cm"],
        "soil_moisture_7_28cm": h["soil_moisture_7_to_28cm"],
        "soil_moisture_28_100cm": h["soil_moisture_28_to_100cm"],
        "soil_moisture_100_255cm": h["soil_moisture_100_to_255cm"],
        "elevation_m": elev,
        "slope_deg": slope,
        "distance_to_river_m": river,
    })
    out["rainfall_mm"] = out["rainfall_mm"].fillna(0).clip(lower=0)
    for c in ["soil_moisture_0_7cm", "soil_moisture_7_28cm", "soil_moisture_28_100cm", "soil_moisture_100_255cm"]:
        out[c] = out[c].interpolate(limit_direction="both")
    out = out.sort_values("timestamp")
    for hours in [1, 3, 6, 12, 24, 48]:
        out[f"rain_{hours}h"] = out["rainfall_mm"].rolling(hours, min_periods=1).sum()
    out["forecast_rainfall_mm"] = 0.0
    out["forecast_rain_1h"] = 0.0
    out["forecast_rain_3h"] = 0.0
    out["forecast_rain_6h"] = 0.0
    return out


def main():
    pieces = []
    for loc in LOCATIONS:
        pieces.append(fetch_one(loc))
        time.sleep(1)
    old_path = DATA / "unified_training_features.csv"
    old = pd.read_csv(old_path, parse_dates=["timestamp"])
    old = old[old["timestamp"] >= pd.Timestamp("2022-01-01")].copy()
    new = pd.concat(pieces, ignore_index=True)
    cols = list(old.columns)
    new = new[cols]
    combined = pd.concat([new, old], ignore_index=True).sort_values(["timestamp", "location_id"])
    combined = combined.drop_duplicates(["timestamp", "location_id"], keep="last")
    combined.to_csv(DATA / "unified_training_features_extended.csv", index=False)

    ev_path = DATA / "historical_events.csv"
    ev = pd.read_csv(ev_path, parse_dates=["start_time", "end_time"])

    # Older historical_events.csv files in this project do not have the
    # label_horizons_usable column.  Derive safe defaults from time_precision.
    if "label_horizons_usable" not in ev.columns:
        ev["label_horizons_usable"] = ""
        for i, e in ev.iterrows():
            precision = str(e.get("time_precision", "")).lower()
            if precision == "date_only":
                # A date-only event time is not precise enough for a 6h/12h
                # label. Keep only the 24h target.
                ev.at[i, "label_horizons_usable"] = "24"
            else:
                ev.at[i, "label_horizons_usable"] = "6|12|24"

    for c in ["target_hazard_6h", "target_hazard_12h", "target_hazard_24h"]:
        combined[c] = 0

    for _, e in ev.iterrows():
        usable = {
            x.strip() for x in str(e["label_horizons_usable"]).split("|")
            if x.strip()
        }

        for h in [6, 12, 24]:
            if str(h) not in usable:
                continue

            delta = e["start_time"] - combined["timestamp"]
            mask = (
                (combined["location_id"] == int(e["location_id"]))
                & (delta >= pd.Timedelta(0))
                & (delta <= pd.Timedelta(hours=h))
            )
            combined.loc[mask, f"target_hazard_{h}h"] = 1
    target_cols = ["target_hazard_6h", "target_hazard_12h", "target_hazard_24h"]
    base = [c for c in combined.columns if c not in target_cols]
    ml = combined[base + target_cols]
    ml.to_csv(DATA / "ml_training_dataset.csv", index=False)
    print("\nDONE")
    print("Extended features:", DATA / "unified_training_features_extended.csv")
    print("ML dataset:", DATA / "ml_training_dataset.csv")
    print("Shape:", ml.shape)
    print("Positive labels:", ml[target_cols].sum().to_dict())


if __name__ == "__main__":
    main()
