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
# HISTORICAL API
# =========================================================

url = "https://archive-api.open-meteo.com/v1/archive"


# =========================================================
# DATE RANGE
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
# FETCH ONE LOCATION
# =========================================================

def fetch_location(location):

    print("\n" + "=" * 60)

    print(
        f"Fetching historical soil moisture "
        f"for {location['name']}"
    )

    params = {
        "latitude": location["latitude"],
        "longitude": location["longitude"],

        "start_date": START_DATE,
        "end_date": END_DATE,

        # Historical soil moisture variables
        "hourly": [
            "soil_moisture_0_to_7cm",
            "soil_moisture_7_to_28cm",
            "soil_moisture_28_to_100cm",
            "soil_moisture_100_to_255cm"
        ],

        "timezone": "Asia/Kolkata"
    }

    try:

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
            f"Elevation: "
            f"{response.Elevation()} m"
        )

        # =================================================
        # HOURLY DATA
        # =================================================

        hourly = response.Hourly()

        soil_0_7 = (
            hourly
            .Variables(0)
            .ValuesAsNumpy()
        )

        soil_7_28 = (
            hourly
            .Variables(1)
            .ValuesAsNumpy()
        )

        soil_28_100 = (
            hourly
            .Variables(2)
            .ValuesAsNumpy()
        )

        soil_100_255 = (
            hourly
            .Variables(3)
            .ValuesAsNumpy()
        )

        # =================================================
        # TIMESTAMP
        # =================================================

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

        # =================================================
        # DATAFRAME
        # =================================================

        df = pd.DataFrame({
            "timestamp": timestamps,

            "soil_moisture_0_7cm": soil_0_7,

            "soil_moisture_7_28cm": soil_7_28,

            "soil_moisture_28_100cm": soil_28_100,

            "soil_moisture_100_255cm": soil_100_255
        })

        # =================================================
        # INDIA TIME
        # =================================================

        df["timestamp"] = (
            df["timestamp"]
            .dt.tz_convert("Asia/Kolkata")
            .dt.tz_localize(None)
        )

        # =================================================
        # LOCATION
        # =================================================

        df["location_id"] = location["id"]

        df["location_name"] = location["name"]

        # =================================================
        # COLUMN ORDER
        # =================================================

        df = df[
            [
                "timestamp",
                "location_id",
                "location_name",
                "soil_moisture_0_7cm",
                "soil_moisture_7_28cm",
                "soil_moisture_28_100cm",
                "soil_moisture_100_255cm"
            ]
        ]

        # =================================================
        # CLEAN DATA
        # =================================================

        soil_columns = [
            "soil_moisture_0_7cm",
            "soil_moisture_7_28cm",
            "soil_moisture_28_100cm",
            "soil_moisture_100_255cm"
        ]

        for column in soil_columns:

            df[column] = pd.to_numeric(
                df[column],
                errors="coerce"
            )

        print(
            f"Downloaded {len(df)} records."
        )

        print("\nAverage soil moisture:")

        print(
            df[soil_columns]
            .mean()
            .to_string()
        )

        return df

    except Exception as e:

        print(
            f"\nERROR for {location['name']}:"
        )

        print(e)

        return None


# =========================================================
# MAIN
# =========================================================

def main():

    print("=" * 60)

    print(
        "WAYANAD HISTORICAL SOIL MOISTURE"
    )

    print("=" * 60)

    print(
        f"\nDate range: "
        f"{START_DATE} → {END_DATE}"
    )

    print(
        "\nSource:"
        " Open-Meteo Historical Weather API"
    )

    all_data = []

    # =====================================================
    # FETCH ALL FIVE LOCATIONS
    # =====================================================

    for location in locations:

        df = fetch_location(location)

        if df is not None:

            all_data.append(df)

        time.sleep(1)

    # =====================================================
    # CHECK
    # =====================================================

    if not all_data:

        print(
            "\nERROR: No data downloaded."
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
        "historical_soil_moisture.csv"
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
        f"\nSaved to:"
    )

    print(output_file)

    print("\nRecords per location:")

    print(
        final_df
        .groupby("location_name")
        .size()
        .to_string()
    )

    print("\nFirst 10 records:")

    print(
        final_df
        .head(10)
        .to_string(index=False)
    )

    print(
        "\nSUCCESS: "
        "Historical soil moisture dataset created!"
    )


# =========================================================
# RUN
# =========================================================

if __name__ == "__main__":
    main()