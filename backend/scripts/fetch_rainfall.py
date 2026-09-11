"""
Day 1 task (updated): Pull real historical rainfall for EACH of your
5 Wayanad locations SEPARATELY, not one shared basin-wide value.
Open-Meteo is free and has no rate limit issue for 5 quick calls.

Run this on YOUR machine (needs internet):
    pip install requests pandas
    python fetch_rainfall.py

Output: data/rainfall_by_location.csv
  columns: time, location_id, location_name, rainfall_mm
"""

import requests
import pandas as pd
import time

# Same 5 locations used everywhere else in the project - keep in sync
# with app.py / risk_model.py / preprocess_dem.py
LOCATIONS = [
    {"id": 1, "name": "Mundakkai", "lat": 11.6480, "lng": 76.1230},
    {"id": 2, "name": "Chooralmala", "lat": 11.6510, "lng": 76.1260},
    {"id": 3, "name": "Meppadi", "lat": 11.6560, "lng": 76.1370},
    {"id": 4, "name": "Vythiri", "lat": 11.5850, "lng": 76.0850},
    {"id": 5, "name": "Kalpetta", "lat": 11.6090, "lng": 76.0820},
]

START_DATE = "2024-07-20"
END_DATE = "2024-08-02"

URL = "https://archive-api.open-meteo.com/v1/archive"

all_rows = []

for loc in LOCATIONS:
    print(f"Fetching rainfall for {loc['name']}...")
    params = {
        "latitude": loc["lat"],
        "longitude": loc["lng"],
        "start_date": START_DATE,
        "end_date": END_DATE,
        "hourly": "precipitation",
        "timezone": "Asia/Kolkata",
    }
    response = requests.get(URL, params=params)
    response.raise_for_status()
    data = response.json()

    for t, val in zip(data["hourly"]["time"], data["hourly"]["precipitation"]):
        all_rows.append({
            "time": t,
            "location_id": loc["id"],
            "location_name": loc["name"],
            "rainfall_mm": val,
        })

    time.sleep(1)  # be polite to the free API between calls

df = pd.DataFrame(all_rows)
df.to_csv("../data/rainfall_by_location.csv", index=False)
print(f"\nSaved {len(df)} rows ({len(LOCATIONS)} locations x hourly readings) "
      f"to data/rainfall_by_location.csv")

# Quick sanity check: show the peak rainfall per location so you can
# immediately see they're genuinely different, not identical
print("\nPeak hourly rainfall per location (whole fetched window):")
print(df.groupby("location_name")["rainfall_mm"].max().sort_values(ascending=False))