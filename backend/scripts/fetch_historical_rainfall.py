import openmeteo_requests
import pandas as pd
import requests_cache
from retry_requests import retry
import os
import time

# =========================================================
# OPEN-METEO CLIENT
# =========================================================

cache_session = requests_cache.CachedSession(
    ".cache",
    expire_after=-1
)

retry_session = retry(
    cache_session,
    retries=5,
    backoff_factor=0.2
)

openmeteo = openmeteo_requests.Client(
    session=retry_session
)


# =========================================================
# API
# =========================================================

url = "https://archive-api.open-meteo.com/v1/archive"


# =========================================================
# HISTORICAL PERIOD
# =========================================================
# We are collecting data around the July 2024
# Wayanad disaster.

START_DATE = "2022-01-01"
END_DATE = "2024-08-05"

# =========================================================
# WAYANAD LOCATIONS
# These coordinates match your existing basin_features.csv
# =========================================================

locations = [
    {
        "id": 1,
        "name": "Mundakkai",
        "latitude": 11.648,
        "longitude": 76.123
    },
    {
        "id": 2,
        "name": "Chooralmala",
        "latitude": 11.651,
        "longitude": 76.126
    },
    {
        "id": 3,
        "name": "Meppadi",
        "latitude": 11.656,
        "longitude": 76.137
    },
    {
        "id": 4,
        "name": "Vythiri",
        "latitude": 11.585,
        "longitude": 76.085
    },
    {
        "id": 5,
        "name": "Kalpetta",
        "latitude": 11.609,
        "longitude": 76.082
    }
]


# =========================================================
# OUTPUT LOCATION
# =========================================================

script_dir = os.path.dirname(
    os.path.abspath(__file__)
)

backend_dir = os.path.dirname(script_dir)

data_dir = os.path.join(
    backend_dir,
    "data"
)

os.makedirs(data_dir, exist_ok=True)


# =========================================================
# FETCH DATA FOR ONE LOCATION
# =========================================================

def fetch_location(location):

    print("\n" + "-" * 60)

    print(
        f"Fetching rainfall for {location['name']}"
    )

    print(
        f"Coordinates: "
        f"{location['latitude']}, "
        f"{location['longitude']}"
    )

    params = {
        "latitude": location["latitude"],
        "longitude": location["longitude"],
        "start_date": START_DATE,
        "end_date": END_DATE,

        # IMPORTANT:
        # We need rainfall, NOT temperature.
        "hourly": "rain",

        # India time
        "timezone": "Asia/Kolkata"
    }

    try:

        responses = openmeteo.weather_api(
            url,
            params=params
        )

        response = responses[0]

        print(
            f"Actual coordinates returned: "
            f"{response.Latitude()}°N "
            f"{response.Longitude()}°E"
        )

        print(
            f"Elevation: "
            f"{response.Elevation()} m"
        )

        # -------------------------------------------------
        # Get hourly data
        # -------------------------------------------------

        hourly = response.Hourly()

        rainfall = (
            hourly
            .Variables(0)
            .ValuesAsNumpy()
        )

        # -------------------------------------------------
        # Create dataframe
        # -------------------------------------------------

        hourly_data = {
            "timestamp": pd.date_range(
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
            ),

            "rainfall_mm": rainfall
        }

        df = pd.DataFrame(
            data=hourly_data
        )

        # -------------------------------------------------
        # Add location information
        # -------------------------------------------------

        df["location_id"] = location["id"]

        df["location_name"] = location["name"]

        # -------------------------------------------------
        # Clean rainfall values
        # -------------------------------------------------

        df["rainfall_mm"] = pd.to_numeric(
            df["rainfall_mm"],
            errors="coerce"
        ).fillna(0)

        # -------------------------------------------------
        # Convert timestamp to India time
        # -------------------------------------------------

        df["timestamp"] = (
            df["timestamp"]
            .dt.tz_convert("Asia/Kolkata")
            .dt.tz_localize(None)
        )

        # -------------------------------------------------
        # Arrange columns
        # -------------------------------------------------

        df = df[
            [
                "timestamp",
                "location_id",
                "location_name",
                "rainfall_mm"
            ]
        ]

        print(
            f"Downloaded {len(df)} hourly records."
        )

        print(
            f"Maximum hourly rainfall: "
            f"{df['rainfall_mm'].max():.2f} mm"
        )

        return df

    except Exception as e:

        print(
            f"ERROR while fetching "
            f"{location['name']}:"
        )

        print(e)

        return None


# =========================================================
# MAIN
# =========================================================

def main():

    print("=" * 60)
    print("WAYANAD HISTORICAL RAINFALL DATA COLLECTION")
    print("=" * 60)

    print(
        f"\nDate range: "
        f"{START_DATE} → {END_DATE}"
    )

    print(
        "Locations: "
        "Mundakkai, Chooralmala, Meppadi, "
        "Vythiri, Kalpetta"
    )

    print(
        "\nSource: Open-Meteo Historical Weather API"
    )

    all_data = []

    # -----------------------------------------------------
    # Fetch all five locations
    # -----------------------------------------------------

    for location in locations:

        df = fetch_location(location)

        if df is not None:

            all_data.append(df)

        # Small delay between API requests
        time.sleep(1)

    # -----------------------------------------------------
    # Check result
    # -----------------------------------------------------

    if len(all_data) == 0:

        print(
            "\nNo data was downloaded."
        )

        return

    # -----------------------------------------------------
    # Combine all locations
    # -----------------------------------------------------

    final_df = pd.concat(
        all_data,
        ignore_index=True
    )

    # -----------------------------------------------------
    # Sort data
    # -----------------------------------------------------

    final_df = final_df.sort_values(
        by=[
            "location_id",
            "timestamp"
        ]
    )

    final_df = final_df.reset_index(
        drop=True
    )

    # -----------------------------------------------------
    # Save CSV
    # -----------------------------------------------------

    output_file = os.path.join(
        data_dir,
        "historical_rainfall.csv"
    )

    final_df.to_csv(
        output_file,
        index=False
    )

    # =====================================================
    # SUMMARY
    # =====================================================

    print("\n")
    print("=" * 60)
    print("DOWNLOAD COMPLETE")
    print("=" * 60)

    print(
        f"\nTotal records: {len(final_df)}"
    )

    print(
        f"\nFile saved at:\n{output_file}"
    )

    print("\nRecords per location:")

    print(
        final_df
        .groupby("location_name")
        .size()
        .to_string()
    )

    print("\nRainfall statistics:")

    print(
        final_df["rainfall_mm"]
        .describe()
        .to_string()
    )

    print("\nFirst 10 records:")

    print(
        final_df
        .head(10)
        .to_string(index=False)
    )

    print("\n")
    print(
        "SUCCESS: Historical rainfall dataset created!"
    )


# =========================================================
# RUN
# =========================================================

if __name__ == "__main__":
    main()