import openmeteo_requests

import pandas as pd
import requests_cache
from retry_requests import retry
import os


# =========================================================
# OPEN-METEO CLIENT
# =========================================================

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


# =========================================================
# API
# =========================================================

url = "https://api.open-meteo.com/v1/forecast"


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
# FETCH DATA FOR ONE LOCATION
# =========================================================

def fetch_location(location):

    print("\n" + "=" * 60)

    print(
        f"Fetching current + forecast rainfall "
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

        # Current rainfall
        "current": "rain,precipitation",

        # Hourly forecast
        "hourly": (
            "rain,"
            "precipitation_probability,"
            "precipitation"
        ),

        # Forecast for next 3 days
        "forecast_days": 3,

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

        # =================================================
        # CURRENT DATA
        # =================================================

        current = response.Current()

        current_rain = (
            current
            .Variables(0)
            .Value()
        )

        current_precipitation = (
            current
            .Variables(1)
            .Value()
        )

        current_time = pd.to_datetime(
            current.Time(),
            unit="s",
            utc=True
        ).tz_convert(
            "Asia/Kolkata"
        ).tz_localize(None)

        print(
            f"Current rainfall: "
            f"{current_rain:.2f} mm"
        )

        print(
            f"Current precipitation: "
            f"{current_precipitation:.2f} mm"
        )

        # =================================================
        # HOURLY FORECAST
        # =================================================

        hourly = response.Hourly()

        hourly_rain = (
            hourly
            .Variables(0)
            .ValuesAsNumpy()
        )

        hourly_probability = (
            hourly
            .Variables(1)
            .ValuesAsNumpy()
        )

        hourly_precipitation = (
            hourly
            .Variables(2)
            .ValuesAsNumpy()
        )

        # =================================================
        # CREATE DATAFRAME
        # =================================================

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

            "rainfall_forecast_mm": hourly_rain,

            "precipitation_forecast_mm": (
                hourly_precipitation
            ),

            "precipitation_probability": (
                hourly_probability
            )
        }

        df = pd.DataFrame(
            data=hourly_data
        )

        # =================================================
        # CONVERT TIME TO INDIA TIME
        # =================================================

        df["timestamp"] = (
            df["timestamp"]
            .dt.tz_convert("Asia/Kolkata")
            .dt.tz_localize(None)
        )

        # =================================================
        # ADD LOCATION
        # =================================================

        df["location_id"] = location["id"]

        df["location_name"] = location["name"]

        # =================================================
        # ADD CURRENT CONDITIONS
        # =================================================

        df["current_rainfall_mm"] = current_rain

        df["current_precipitation_mm"] = (
            current_precipitation
        )

        # =================================================
        # REORDER COLUMNS
        # =================================================

        df = df[
            [
                "timestamp",
                "location_id",
                "location_name",

                "current_rainfall_mm",
                "current_precipitation_mm",

                "rainfall_forecast_mm",
                "precipitation_forecast_mm",
                "precipitation_probability"
            ]
        ]

        # =================================================
        # CLEAN NUMBERS
        # =================================================

        numeric_columns = [
            "current_rainfall_mm",
            "current_precipitation_mm",
            "rainfall_forecast_mm",
            "precipitation_forecast_mm",
            "precipitation_probability"
        ]

        for column in numeric_columns:

            df[column] = pd.to_numeric(
                df[column],
                errors="coerce"
            ).fillna(0)

        print(
            f"Forecast records: {len(df)}"
        )

        print(
            f"Maximum forecast rainfall: "
            f"{df['rainfall_forecast_mm'].max():.2f} mm"
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
        "WAYANAD CURRENT + FORECAST RAINFALL"
    )

    print("=" * 60)

    print(
        "\nSource: Open-Meteo Forecast API"
    )

    print(
        "Forecast period: Next 3 days"
    )

    all_data = []

    # =====================================================
    # FETCH ALL FIVE LOCATIONS
    # =====================================================

    for location in locations:

        df = fetch_location(location)

        if df is not None:

            all_data.append(df)

    # =====================================================
    # CHECK DATA
    # =====================================================

    if len(all_data) == 0:

        print(
            "\nERROR: No data was downloaded."
        )

        return

    # =====================================================
    # COMBINE
    # =====================================================

    final_df = pd.concat(
        all_data,
        ignore_index=True
    )

    # =====================================================
    # SORT
    # =====================================================

    final_df = final_df.sort_values(
        by=[
            "location_id",
            "timestamp"
        ]
    ).reset_index(
        drop=True
    )

    # =====================================================
    # SAVE
    # =====================================================

    output_file = os.path.join(
        data_dir,
        "current_forecast_rainfall.csv"
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
        "\nCurrent rainfall by location:"
    )

    current_summary = (
        final_df
        .groupby(
            [
                "location_id",
                "location_name"
            ]
        )
        .first()
    )

    print(
        current_summary[
            [
                "current_rainfall_mm",
                "current_precipitation_mm"
            ]
        ].to_string()
    )

    print("\nFirst 10 forecast records:")

    print(
        final_df
        .head(10)
        .to_string(index=False)
    )

    print(
        "\nSUCCESS: "
        "Current + forecast rainfall dataset created!"
    )


# =========================================================
# RUN
# =========================================================

if __name__ == "__main__":
    main()