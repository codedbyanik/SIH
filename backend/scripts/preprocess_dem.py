"""
Day 2 task: Combine the three raw datasets (DEM, river network, rainfall)
into ONE clean table - elevation, slope, distance-to-river, and rainfall
per location. This table is what your Day 3-4 risk model will read.

Run this on YOUR machine, from inside backend/scripts:
    pip install rasterio geopandas shapely numpy pandas
    python preprocess_dem.py

Output: data/basin_features.csv
"""

import rasterio
import numpy as np
import pandas as pd
import geopandas as gpd
from shapely.geometry import Point, LineString
import json

# ---------------------------------------------------------------------
# Same locations as in app.py - keep these in sync
# ---------------------------------------------------------------------
LOCATIONS = [
    {"id": 1, "name": "Mundakkai", "lat": 11.6480, "lng": 76.1230},
    {"id": 2, "name": "Chooralmala", "lat": 11.6510, "lng": 76.1260},
    {"id": 3, "name": "Meppadi", "lat": 11.6560, "lng": 76.1370},
    {"id": 4, "name": "Vythiri", "lat": 11.5850, "lng": 76.0850},
    {"id": 5, "name": "Kalpetta", "lat": 11.6090, "lng": 76.0820},
]

DEM_PATH = "../data/wayanad_dem.tif"
RIVERS_PATH = "../data/wayanad_rivers.geojson"
RAINFALL_PATH = "../data/rainfall_by_location.csv"
OUTPUT_PATH = "../data/basin_features.csv"


def get_elevation(dem, lat, lng):
    """Read raw elevation (meters) at a lat/lng point from the DEM."""
    row, col = dem.index(lng, lat)
    band = dem.read(1)
    return float(band[row, col])


def get_slope(dem, lat, lng, step_m=0.001):
    """
    Approximate slope (degrees) at a point by sampling elevation a small
    step away in each direction and computing the steepest gradient.
    step_m is in degrees (~100m at this latitude) - good enough for a
    hackathon-scale approximation.
    """
    band = dem.read(1)
    center_row, center_col = dem.index(lng, lat)
    try:
        e_center = float(band[center_row, center_col])
        e_east = float(band[center_row, center_col + 1])
        e_north = float(band[center_row - 1, center_col])
        dx = dem.res[0] * 111320  # degrees -> meters, rough conversion
        dy = dem.res[1] * 111320
        dz_dx = (e_east - e_center) / dx
        dz_dy = (e_north - e_center) / dy
        slope_rad = np.arctan(np.sqrt(dz_dx**2 + dz_dy**2))
        return float(np.degrees(slope_rad))
    except IndexError:
        return None  # point too close to raster edge


def get_distance_to_river(rivers_gdf, lat, lng):
    """Distance in meters from a point to the nearest river line."""
    point = Point(lng, lat)
    # rough degrees->meters conversion at this latitude, fine for a demo
    distances_deg = rivers_gdf.geometry.distance(point)
    min_dist_deg = distances_deg.min()
    return float(min_dist_deg * 111320)


def main():
    print("Loading DEM...")
    dem = rasterio.open(DEM_PATH)

    print("Loading river network...")
    rivers_gdf = gpd.read_file(RIVERS_PATH)
    if rivers_gdf.empty:
        print("WARNING: no river features found - distance_to_river will be skipped")

    print("Loading per-location rainfall data...")
    rainfall_df = pd.read_csv(RAINFALL_PATH)
    rainfall_df["time"] = pd.to_datetime(rainfall_df["time"])

    # Same pre-event window as before, but now computed SEPARATELY for
    # each location, since each has its own real rainfall time series.
    event_date = pd.Timestamp("2024-07-30")
    window_start = event_date - pd.Timedelta(days=3)

    def rainfall_for_location(location_id):
        rows = rainfall_df[
            (rainfall_df["location_id"] == location_id)
            & (rainfall_df["time"] >= window_start)
            & (rainfall_df["time"] < event_date)
        ]
        return rows["rainfall_mm"].max(), rows["rainfall_mm"].sum()

    print(f"Pre-event window: {window_start} to {event_date}")

    rows = []
    for loc in LOCATIONS:
        elevation = get_elevation(dem, loc["lat"], loc["lng"])
        slope = get_slope(dem, loc["lat"], loc["lng"])
        dist_river = get_distance_to_river(rivers_gdf, loc["lat"], loc["lng"]) if not rivers_gdf.empty else None
        peak_rainfall, total_3day_rainfall = rainfall_for_location(loc["id"])

        rows.append({
            "id": loc["id"],
            "name": loc["name"],
            "lat": loc["lat"],
            "lng": loc["lng"],
            "elevation_m": round(elevation, 1),
            "slope_deg": round(slope, 2) if slope is not None else None,
            "distance_to_river_m": round(dist_river, 1) if dist_river is not None else None,
            "peak_rainfall_mm": round(float(peak_rainfall), 1),
            "rainfall_3day_total_mm": round(float(total_3day_rainfall), 1),
        })
        print(f"  {loc['name']}: elevation={elevation:.1f}m, slope={slope:.2f}°, "
              f"dist_to_river={dist_river:.0f}m, peak_rainfall={peak_rainfall:.1f}mm"
              if slope is not None and dist_river is not None
              else f"  {loc['name']}: elevation={elevation:.1f}m (slope/river calc skipped)")

    out_df = pd.DataFrame(rows)
    out_df.to_csv(OUTPUT_PATH, index=False)
    print(f"\nSaved combined feature table to {OUTPUT_PATH}")
    print(out_df)


if __name__ == "__main__":
    main()