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

url = "https://historical-forecast-api.open-meteo.com/v1/forecast"


# =========================================================
# HISTORICAL PERIOD
# =========================================================

START_DATE = "2022-01-01"
END_DATE = "2024-08-05"


# =========================================================
# WAYANAD LOCATIONS
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
# OUTPUT DIRECTORY
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
# FETCH FORECAST DATA FOR ONE LOCATION
# =========================================================

def fetch_location(location):

    print("\n" + "-" * 60)

    print(
        f"Fetching historical forecast rainfall "
        f"for {location['name']}"
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

        # Forecast rainfall
        "hourly": "rain",

        # Indian Standard Time
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
        # Get hourly forecast data
        # -------------------------------------------------

        hourly = response.Hourly()

        forecast_rainfall = (
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

            "forecast_rainfall_mm": forecast_rainfall
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

        df["forecast_rainfall_mm"] = pd.to_numeric(
            df["forecast_rainfall_mm"],
            errors="coerce"
        ).fillna(0)

        # -------------------------------------------------
        # Convert timestamp to Indian time
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
                "forecast_rainfall_mm"
            ]
        ]

        print(
            f"Downloaded {len(df)} hourly records."
        )

        print(
            f"Maximum forecast rainfall: "
            f"{df['forecast_rainfall_mm'].max():.2f} mm"
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

    print(
        "WAYANAD HISTORICAL FORECAST RAINFALL"
    )

    print("=" * 60)

    print(
        f"\nDate range: "
        f"{START_DATE} → {END_DATE}"
    )

    print(
        "\nLocations:"
    )

    print(
        "Mundakkai, Chooralmala, Meppadi, "
        "Vythiri, Kalpetta"
    )

    print(
        "\nSource: "
        "Open-Meteo Historical Forecast API"
    )

    all_data = []

    # -----------------------------------------------------
    # Fetch all locations
    # -----------------------------------------------------

    for location in locations:

        df = fetch_location(location)

        if df is not None:

            all_data.append(df)

        # Avoid sending requests too quickly
        time.sleep(1)

    # -----------------------------------------------------
    # Check whether data was downloaded
    # -----------------------------------------------------

    if len(all_data) == 0:

        print(
            "\nERROR: No forecast data was downloaded."
        )

        return

    # -----------------------------------------------------
    # Combine locations
    # -----------------------------------------------------

    final_df = pd.concat(
        all_data,
        ignore_index=True
    )

    # -----------------------------------------------------
    # Sort
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
        "historical_forecast_rainfall.csv"
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

    print(
        "DOWNLOAD COMPLETE"
    )

    print("=" * 60)

    print(
        f"\nTotal records: "
        f"{len(final_df)}"
    )

    print(
        f"\nFile saved at:"
    )

    print(output_file)

    print(
        "\nRecords per location:"
    )

    print(
        final_df
        .groupby("location_name")
        .size()
        .to_string()
    )

    print(
        "\nForecast rainfall statistics:"
    )

    print(
        final_df[
            "forecast_rainfall_mm"
        ]
        .describe()
        .to_string()
    )

    print(
        "\nFirst 10 records:"
    )

    print(
        final_df
        .head(10)
        .to_string(index=False)
    )

    print(
        "\nSUCCESS: "
        "Historical forecast rainfall dataset created!"
    )


# =========================================================
# RUN PROGRAM
# =========================================================

if __name__ == "__main__":
    main()