"""
Build static terrain and hydrology features for the 5 Wayanad locations.

Input:
    data/wayanad_dem.tif
    data/wayanad_rivers.geojson

Output:
    data/static_location_features.csv

Features:
    elevation_m
    slope_deg
    distance_to_river_m
"""

import os

import rasterio
import numpy as np
import pandas as pd
import geopandas as gpd
from shapely.geometry import Point


# --------------------------------------------------
# Wayanad locations
# --------------------------------------------------

LOCATIONS = [
    {
        "id": 1,
        "name": "Mundakkai",
        "lat": 11.6480,
        "lng": 76.1230
    },
    {
        "id": 2,
        "name": "Chooralmala",
        "lat": 11.6510,
        "lng": 76.1260
    },
    {
        "id": 3,
        "name": "Meppadi",
        "lat": 11.6560,
        "lng": 76.1370
    },
    {
        "id": 4,
        "name": "Vythiri",
        "lat": 11.5850,
        "lng": 76.0850
    },
    {
        "id": 5,
        "name": "Kalpetta",
        "lat": 11.6090,
        "lng": 76.0820
    }
]


# --------------------------------------------------
# Paths
# --------------------------------------------------

BASE_DIR = os.path.dirname(os.path.dirname(__file__))

DEM_PATH = os.path.join(
    BASE_DIR,
    "data",
    "wayanad_dem.tif"
)

RIVERS_PATH = os.path.join(
    BASE_DIR,
    "data",
    "wayanad_rivers.geojson"
)

OUTPUT_PATH = os.path.join(
    BASE_DIR,
    "data",
    "static_location_features.csv"
)


# --------------------------------------------------
# Read elevation
# --------------------------------------------------

def get_elevation(dem, lat, lng):

    row, col = dem.index(lng, lat)

    band = dem.read(1)

    elevation = band[row, col]

    return float(elevation)


# --------------------------------------------------
# Calculate slope from surrounding DEM cells
# --------------------------------------------------

def get_slope(dem, lat, lng):

    band = dem.read(1)

    row, col = dem.index(lng, lat)

    # Need neighboring pixels
    if (
        row <= 0
        or row >= band.shape[0] - 1
        or col <= 0
        or col >= band.shape[1] - 1
    ):
        return None

    center = float(band[row, col])

    north = float(band[row - 1, col])
    south = float(band[row + 1, col])

    east = float(band[row, col + 1])
    west = float(band[row, col - 1])

    # Pixel dimensions in meters
    pixel_width = abs(dem.transform.a)
    pixel_height = abs(dem.transform.e)

    # Approximate conversion if DEM is geographic CRS
    if dem.crs and dem.crs.is_geographic:

        lat_rad = np.radians(lat)

        meters_per_degree_lat = 111320

        meters_per_degree_lon = (
            111320 * np.cos(lat_rad)
        )

        dx = pixel_width * meters_per_degree_lon
        dy = pixel_height * meters_per_degree_lat

    else:

        dx = pixel_width
        dy = pixel_height

    dz_dx = (east - west) / (2 * dx)
    dz_dy = (north - south) / (2 * dy)

    slope_radians = np.arctan(
        np.sqrt(
            dz_dx ** 2 +
            dz_dy ** 2
        )
    )

    slope_degrees = np.degrees(
        slope_radians
    )

    return float(slope_degrees)


# --------------------------------------------------
# Distance to nearest river
# --------------------------------------------------

def get_distance_to_river(
    rivers_gdf,
    lat,
    lng
):

    point = gpd.GeoDataFrame(
        geometry=[Point(lng, lat)],
        crs="EPSG:4326"
    )

    # Convert to a metric CRS before measuring distance
    rivers_projected = rivers_gdf.to_crs(
        "EPSG:32643"
    )

    point_projected = point.to_crs(
        "EPSG:32643"
    )

    distances = rivers_projected.geometry.distance(
        point_projected.geometry.iloc[0]
    )

    return float(distances.min())


# --------------------------------------------------
# Main
# --------------------------------------------------

def main():

    print("======================================")
    print("Building Wayanad static features")
    print("======================================")

    # ----------------------------------------------
    # Load DEM
    # ----------------------------------------------

    print("\nLoading DEM...")

    dem = rasterio.open(
        DEM_PATH
    )

    print(
        f"DEM CRS: {dem.crs}"
    )

    print(
        f"DEM resolution: {dem.res}"
    )

    print(
        f"DEM size: {dem.width} x {dem.height}"
    )

    # ----------------------------------------------
    # Load rivers
    # ----------------------------------------------

    print("\nLoading river network...")

    rivers = gpd.read_file(
        RIVERS_PATH
    )

    print(
        f"River features: {len(rivers)}"
    )

    # ----------------------------------------------
    # Calculate features
    # ----------------------------------------------

    rows = []

    print("\nCalculating features...\n")

    for location in LOCATIONS:

        elevation = get_elevation(
            dem,
            location["lat"],
            location["lng"]
        )

        slope = get_slope(
            dem,
            location["lat"],
            location["lng"]
        )

        distance_to_river = get_distance_to_river(
            rivers,
            location["lat"],
            location["lng"]
        )

        row = {
            "location_id": location["id"],
            "location_name": location["name"],
            "latitude": location["lat"],
            "longitude": location["lng"],
            "elevation_m": round(
                elevation,
                2
            ),
            "slope_deg": round(
                slope,
                2
            ) if slope is not None else None,
            "distance_to_river_m": round(
                distance_to_river,
                2
            )
        }

        rows.append(row)

        print(
            f"{location['name']}: "
            f"elevation={elevation:.2f} m, "
            f"slope={slope:.2f}°, "
            f"river_distance={distance_to_river:.2f} m"
        )

    # ----------------------------------------------
    # Save
    # ----------------------------------------------

    df = pd.DataFrame(rows)

    df.to_csv(
        OUTPUT_PATH,
        index=False
    )

    print("\n======================================")
    print("Static feature dataset created!")
    print("======================================")

    print(
        f"\nSaved to:\n{OUTPUT_PATH}"
    )

    print(
        f"\nRows: {len(df)}"
    )

    print("\nDataset:")
    print(df.to_string(index=False))


if __name__ == "__main__":
    main()