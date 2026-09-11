import openmeteo_requests

import pandas as pd
import requests_cache
from retry_requests import retry

# --------------------------------------------------
# Setup Open-Meteo API client
# --------------------------------------------------

cache_session = requests_cache.CachedSession(
    ".cache",
    expire_after=3600
)

retry_session = retry(
    cache_session,
    retries=5,
    backoff_factor=0.2
)

openmeteo = openmeteo_requests.Client(
    session=retry_session
)

# --------------------------------------------------
# Wayanad locations
# --------------------------------------------------

locations = [
    {
        "id": 1,
        "name": "Mundakkai",
        "lat": 11.648,
        "lng": 76.123
    },
    {
        "id": 2,
        "name": "Chooralmala",
        "lat": 11.651,
        "lng": 76.126
    },
    {
        "id": 3,
        "name": "Meppadi",
        "lat": 11.656,
        "lng": 76.137
    },
    {
        "id": 4,
        "name": "Vythiri",
        "lat": 11.585,
        "lng": 76.085
    },
    {
        "id": 5,
        "name": "Kalpetta",
        "lat": 11.609,
        "lng": 76.082
    }
]

url = "https://api.open-meteo.com/v1/forecast"

all_data = []

# --------------------------------------------------
# Fetch soil moisture for each location
# --------------------------------------------------

for location in locations:

    print(f"\nFetching data for {location['name']}...")

    params = {
        "latitude": location["lat"],
        "longitude": location["lng"],

        "hourly": [
            "soil_moisture_0_to_1cm",
            "soil_moisture_1_to_3cm",
            "soil_moisture_3_to_9cm",
            "soil_moisture_9_to_27cm",
            "soil_moisture_27_to_81cm"
        ],

        "timezone": "Asia/Kolkata"
    }

    responses = openmeteo.weather_api(
        url,
        params=params
    )

    response = responses[0]

    print(
        f"Coordinates: "
        f"{response.Latitude()}°N "
        f"{response.Longitude()}°E"
    )

    print(
        f"Elevation: {response.Elevation()} m"
    )

    # --------------------------------------------------
    # Process hourly data
    # --------------------------------------------------

    hourly = response.Hourly()

    soil_0_1 = hourly.Variables(0).ValuesAsNumpy()
    soil_1_3 = hourly.Variables(1).ValuesAsNumpy()
    soil_3_9 = hourly.Variables(2).ValuesAsNumpy()
    soil_9_27 = hourly.Variables(3).ValuesAsNumpy()
    soil_27_81 = hourly.Variables(4).ValuesAsNumpy()

    # Create timestamps
    timestamps = pd.date_range(
        start=pd.to_datetime(
            hourly.Time(),
            unit="s",
            utc=True
        ),
        end=pd.to_datetime(
            hourly.TimeEnd(),
            unit="s",
            utc=True
        ),
        freq=pd.Timedelta(
            seconds=hourly.Interval()
        ),
        inclusive="left"
    )

    # --------------------------------------------------
    # Create dataframe
    # --------------------------------------------------

    location_data = pd.DataFrame({
        "time": timestamps,

        "location_id": location["id"],

        "location_name": location["name"],

        "latitude": location["lat"],

        "longitude": location["lng"],

        "soil_moisture_0_to_1cm": soil_0_1,

        "soil_moisture_1_to_3cm": soil_1_3,

        "soil_moisture_3_to_9cm": soil_3_9,

        "soil_moisture_9_to_27cm": soil_9_27,

        "soil_moisture_27_to_81cm": soil_27_81
    })

    all_data.append(location_data)

    print(
        f"Fetched {len(location_data)} hourly records "
        f"for {location['name']}"
    )

# --------------------------------------------------
# Combine all locations
# --------------------------------------------------

final_dataframe = pd.concat(
    all_data,
    ignore_index=True
)

# --------------------------------------------------
# Save CSV
# --------------------------------------------------

output_file = "data/current_soil_moisture.csv"

final_dataframe.to_csv(
    output_file,
    index=False
)

print("\n======================================")
print("Current soil moisture data fetched!")
print("======================================")

print(f"Saved to: {output_file}")
print(f"Total rows: {len(final_dataframe)}")

print("\nLatest reading for each location:")

latest = (
    final_dataframe
    .sort_values("time")
    .groupby("location_name")
    .tail(1)
)

print(
    latest[
        [
            "time",
            "location_name",
            "soil_moisture_0_to_1cm",
            "soil_moisture_1_to_3cm",
            "soil_moisture_3_to_9cm",
            "soil_moisture_9_to_27cm",
            "soil_moisture_27_to_81cm"
        ]
    ].to_string(index=False)
)