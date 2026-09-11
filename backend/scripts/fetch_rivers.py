"""
Day 1-2 task: Pull river/waterway network for the Wayanad basin from
OpenStreetMap via the Overpass API (free, no key needed).

Run this on YOUR machine (needs internet):
    pip install requests
    python fetch_rivers.py

Output: data/wayanad_rivers.geojson
"""

import requests
import json

# Same bounding box as the DEM (south, west, north, east - Overpass order)
BBOX = "11.55,76.05,11.70,76.20"

# Primary + backup mirror (Overpass sometimes rate-limits/rejects requests -
# if the first one fails, the script tries the second automatically)
OVERPASS_URLS = [
    "https://overpass-api.de/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter",
]

query = f"""
[out:json][timeout:60];
(
  way["waterway"~"river|stream"]({BBOX});
);
out body geom;
"""

headers = {
    "User-Agent": "SIH26192-FlashFloodPrediction/1.0",
    "Content-Type": "text/plain; charset=utf-8",
}

data = None
last_error = None
for url in OVERPASS_URLS:
    try:
        response = requests.post(url, data=query.encode("utf-8"), headers=headers, timeout=60)
        response.raise_for_status()
        data = response.json()
        print(f"Success using {url}")
        break
    except requests.exceptions.RequestException as e:
        print(f"Failed on {url}: {e}")
        last_error = e

if data is None:
    raise last_error

# Convert to a simple GeoJSON FeatureCollection
features = []
for element in data.get("elements", []):
    if element["type"] == "way" and "geometry" in element:
        coords = [[pt["lon"], pt["lat"]] for pt in element["geometry"]]
        features.append({
            "type": "Feature",
            "properties": {"id": element["id"], "name": element.get("tags", {}).get("name", "unnamed")},
            "geometry": {"type": "LineString", "coordinates": coords},
        })

geojson = {"type": "FeatureCollection", "features": features}

with open("../data/wayanad_rivers.geojson", "w") as f:
    json.dump(geojson, f)

print(f"Saved {len(features)} river/stream segments to data/wayanad_rivers.geojson")