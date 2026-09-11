"""
Download SRTM 30m elevation data for the Wayanad region
from OpenTopography.

Output:
    backend/data/wayanad_dem.tif
"""

import os
import requests
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

API_KEY = os.getenv("OPENTOPOGRAPHY_API_KEY")

if not API_KEY:
    raise ValueError(
        "OPENTOPOGRAPHY_API_KEY not found. "
        "Add it to backend/.env"
    )

# --------------------------------------------------
# Wayanad bounding box
# south, north, west, east
# --------------------------------------------------

SOUTH = 11.55
NORTH = 11.70
WEST = 76.05
EAST = 76.20

# OpenTopography Global DEM API
URL = "https://portal.opentopography.org/API/globaldem"

params = {
    "demtype": "SRTMGL1",
    "south": SOUTH,
    "north": NORTH,
    "west": WEST,
    "east": EAST,
    "outputFormat": "GTiff",
    "API_Key": API_KEY,
}

print("Downloading Wayanad SRTM 30m DEM...")
print(f"Bounding box: {SOUTH}, {NORTH}, {WEST}, {EAST}")

response = requests.get(
    URL,
    params=params,
    timeout=120
)

response.raise_for_status()

# Save to backend/data
output_file = os.path.join(
    os.path.dirname(os.path.dirname(__file__)),
    "data",
    "wayanad_dem.tif"
)

with open(output_file, "wb") as f:
    f.write(response.content)

print("\n===================================")
print("DEM downloaded successfully!")
print("===================================")
print(f"Saved to: {output_file}")
print("Resolution: ~30 m")
print("Dataset: SRTMGL1")