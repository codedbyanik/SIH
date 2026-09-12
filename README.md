# 🌧️ FFEPS --- Flash Flood Early Prediction System

### SIH26192 · Flash Flood Prediction System for Hilly Regions using Multi-Source Data

FFEPS is an end-to-end **flash-flood prediction, risk assessment and
early-prediction prototype** designed for vulnerable hilly regions.

The system is demonstrated in **Wayanad, Kerala**, using five monitored
locations:

-   Mundakkai
-   Chooralmala
-   Meppadi
-   Vythiri
-   Kalpetta

Instead of treating rainfall as the only indicator, FFEPS combines
**short-term and antecedent rainfall, multi-depth soil moisture,
elevation, slope, river proximity, historical information and forecast
rainfall**. A trained machine-learning layer provides a prototype hazard
signal, while an explainable **V4 risk engine** converts environmental
conditions into operational risk levels.

The resulting risk is presented through an interactive map and connected
to an **Official Portal + Citizen Portal** workflow for alerts,
preparedness, shelters and emergency response.

> **Project type:** End-to-end disaster-management and early-prediction
> prototype\
> **Demonstration region:** Wayanad, Kerala\
> **Problem Statement:** Flash Flood Prediction System for Hilly Regions
> using Multi-Source Data

------------------------------------------------------------------------

## 🎯 The Core Idea

``` text
MULTI-SOURCE ENVIRONMENTAL DATA
            │
            ▼
     FEATURE ENGINEERING
            │
      ┌─────┴─────┐
      ▼           ▼
   ML HAZARD    V4 RISK
    SIGNAL       ENGINE
      │           │
      └─────┬─────┘
            ▼
      RISK / HAZARD
         OUTPUT
            │
            ▼
   MAP + FORECAST + ALERT
            │
      ┌─────┴─────┐
      ▼           ▼
 OFFICIAL      CITIZEN
  ACTION        WARNING
```

**System story:**

> **Data → Prediction → Risk Map → Risk Assessment → Response**

The project is intentionally more than a standalone ML model: it
connects environmental data processing and prediction to a practical
disaster-management workflow.

------------------------------------------------------------------------

# 🚨 Problem

Flash floods in hilly regions can develop rapidly when intense rainfall
interacts with:

-   steep terrain,
-   saturated soil,
-   rivers and streams,
-   accumulated rainfall,
-   and local geographic susceptibility.

A single rainfall value does not adequately describe this situation.

FFEPS therefore uses multiple environmental indicators to produce
**location-aware risk information** and demonstrate how that information
can move from prediction to an actionable warning.

------------------------------------------------------------------------

# 💡 Solution

FFEPS has two connected user-facing sides.

## 👥 Citizen Portal

Designed to give citizens quick access to understandable and actionable
information.

### Features

-   📍 Local risk information
-   🚨 Current alerts and warnings
-   🗺️ Interactive Citizen Risk Map
-   🔮 Future 6h / 12h / 24h risk information
-   🏠 Relief shelter information
-   🎒 Preparedness guidance
-   📞 Emergency contacts
-   🌐 English / Hindi support
-   ♿ Accessibility controls
-   🔊 High/Critical alert siren in the prototype

------------------------------------------------------------------------

## 🏛️ Official Portal

Designed as a disaster-management decision-support interface.

### Features

-   📊 Situation dashboard
-   🗺️ Official Risk Map
-   🌧️ Rainfall simulation
-   ⏪ Historical event replay
-   🔮 Forecast risk
-   🚨 Alert management
-   🏠 Shelter management
-   🚑 Emergency / incident management
-   📈 Reports
-   👥 User management
-   ⚙️ Settings
-   🔐 Protected official routes

------------------------------------------------------------------------

# 🧠 Multi-Source Risk Assessment

The backend combines several categories of information.

  -----------------------------------------------------------------------
  Input                   Examples                Role
  ----------------------- ----------------------- -----------------------
  Rainfall                Current rainfall, 1h,   Main trigger /
                          3h, 6h, 12h, 24h, 48h   accumulation signal

  Soil moisture           0--7 cm, 7--28 cm,      Soil wetness /
                          28--100 cm, 100--255 cm saturation context

  Terrain                 Elevation, slope        Spatial susceptibility

  River proximity         Distance to river       Hydrological
                                                  susceptibility

  Historical data         Historical rainfall and Baselines, replay and
                          event information       training

  Forecast                Open-Meteo / ECMWF      Future-risk estimation
                          rainfall forecast       
  -----------------------------------------------------------------------

### What is antecedent rainfall?

Antecedent rainfall is rainfall that occurred **before the current
rainfall event**.

For example, the same current rainfall becomes more concerning when the
previous 6, 24 and 48 hours have already been unusually wet. FFEPS
represents this through rolling rainfall windows.

------------------------------------------------------------------------

# 🤖 Machine Learning

The ML component provides a **prototype learned hazard signal** for
three horizons:

-   **6 hours**
-   **12 hours**
-   **24 hours**

### ML Features

The training/inference feature set contains 14 environmental variables:

``` text
rainfall_mm
rain_1h
rain_3h
rain_6h
rain_12h
rain_24h
rain_48h
soil_moisture_0_7cm
soil_moisture_7_28cm
soil_moisture_28_100cm
soil_moisture_100_255cm
elevation_m
slope_deg
distance_to_river_m
```

### Model

The trained prototype uses **scikit-learn
HistGradientBoostingClassifier** models with monotonic constraints on
rainfall-related features.

The saved model files use the existing project naming convention:

``` text
backend/models/
├── flash_flood_rf_6h.joblib
├── flash_flood_rf_12h.joblib
└── flash_flood_rf_24h.joblib
```

Rainfall features are constrained to have an increasing relationship
with the learned hazard signal, while soil and terrain features remain
unconstrained.

### Training data

The expanded training dataset contains approximately **289,080 rows**,
covering **2018-01-01 through 2024-08-05 23:00**.

Because genuine positive flood-event labels are sparse, the prototype
uses controlled synthetic positive augmentation around real
event-positive observations.

This distinction is important:

> **Synthetic training rows are augmentation, not additional observed
> flood events.**

------------------------------------------------------------------------

# ⚖️ ML + Explainable V4 Risk Engine

FFEPS deliberately uses **two complementary layers**.

### ML layer

Learns patterns from environmental training data and provides a
prototype hazard signal.

### V4 risk engine

Explicitly combines:

-   short-term rainfall,
-   antecedent rainfall,
-   soil moisture,
-   terrain susceptibility,
-   river proximity,
-   rainfall trend / escalation.

The V4 engine produces an explainable risk score and maps it to:

``` text
Advisory
Moderate
High
Critical
```

### V4 weighting

The current risk engine gives the following conceptual weights:

  Component               Weight
  --------------------- --------
  Short-term rainfall        40%
  Antecedent rainfall        25%
  Soil moisture              15%
  Terrain                    10%
  River proximity             5%
  Rainfall trend              5%

The system also uses rainfall gates for **High** and **Critical** levels
so that terrain or soil conditions alone do not create a Critical alert.

------------------------------------------------------------------------

# 🔮 Forecast Risk

Forecast risk is calculated separately from the current-condition ML
signal.

The backend uses **Open-Meteo ECMWF forecast rainfall** and passes
future rainfall information through the V4 risk engine.

``` text
ECMWF forecast rainfall
          │
          ▼
Future rainfall windows
          │
          ▼
     V4 risk engine
          │
    ┌─────┼─────┐
    ▼     ▼     ▼
   6h    12h    24h
```

This separation is intentional:

-   **ML:** current observed state → prototype learned hazard signal
-   **Forecast V4:** future forecast rainfall + current environmental
    state → future operational risk

------------------------------------------------------------------------

# 🗺️ Geospatial Risk Mapping

The application uses **Leaflet + OpenStreetMap** for interactive
geographical visualization.

The five monitored locations are represented as geographical risk zones.

### Risk visualization

``` text
Advisory  → Low-level monitoring
Moderate  → Increased monitoring
High      → High-risk warning
Critical  → Immediate high-priority warning
```

The backend also contains:

-   `wayanad_dem.tif` --- Digital Elevation Model
-   `wayanad_rivers.geojson` --- river/stream geometry

These support terrain and river-proximity features.

------------------------------------------------------------------------

# 🔄 Operating Modes

## 1. Live Mode

The backend retrieves current weather information and calculates current
zone risk.

``` text
Open-Meteo current weather
          ↓
Current rainfall + soil state
          ↓
V4 risk engine
          ↓
Zone risk
          ↓
Frontend map
```

------------------------------------------------------------------------

## 2. Rainfall Simulation

Officials can test a hypothetical rainfall scenario.

Example:

``` text
"What happens if rainfall reaches 150 mm?"
```

The simulation:

1.  accepts a rainfall value,
2.  calculates V4 risk,
3.  runs the prototype ML models,
4.  generates zone-level results,
5.  updates the Risk Map,
6.  classifies the operational severity,
7.  can generate a citizen-facing alert.

The simulation API is:

``` text
GET /api/simulate?rainfall_mm=<value>
```

------------------------------------------------------------------------

## 3. Historical Replay

FFEPS can replay historical environmental conditions around the **30
July 2024 Wayanad event**.

The prototype replay window is:

``` text
27 July 2024 00:00
        ↓
31 July 2024 00:00
```

The replay streams historical rainfall and soil-moisture observations
through the backend so the risk can evolve over time.

Conceptually:

``` text
Historical timestamp
        ↓
Historical rainfall + soil + terrain
        ↓
V4 risk calculation
        ↓
Risk map update
        ↓
Next timestamp
```

This makes it possible to demonstrate a progression such as:

``` text
Advisory → Moderate → High → Critical
```

rather than showing only a static risk value.

------------------------------------------------------------------------

# 🚨 Alert Architecture

The Official Risk Map can generate an automatic system alert from a
simulated rainfall scenario.

``` text
Official Risk Map
       ↓
Rainfall Simulation
       ↓
Severity Classification
       ↓
System Alert Event
       ↓
Citizen Alerts
       ↓
Full-Screen Warning
       ↓
High / Critical → Warning Siren
```

The prototype uses browser storage and browser events for cross-page
communication.

Important prototype storage/event keys include:

``` text
sih_citizen_alert_event
sih_system_alerts
sih_shelters
sih_shelters_deleted
```

### 🔊 Warning siren

High and Critical prototype alerts can trigger a browser-generated
alert siren using the **Web Audio API**.

-   High → 3 cycles
-   Critical → 5 cycles
-   Advisory / Moderate → visual notification without emergency siren

The siren is intentionally handled on the **Citizen Alerts** side rather
than the Official Portal.

------------------------------------------------------------------------

# 🏠 Shelters & Emergency Response

The prototype includes a shelter-management workflow.

### Citizen side

Citizens can view shelter information such as:

-   location,
-   capacity,
-   water availability,
-   medical facilities,
-   accessibility,
-   contact information.

### Official side

Officials can:

-   add shelters,
-   delete shelters,
-   view shelter information,
-   manage available capacity information.

Prototype cross-page shelter state is synchronized through browser
storage.

------------------------------------------------------------------------

# 📞 Emergency Information

The emergency module provides key emergency contacts used in the Wayanad
demonstration:

  Service                                          Number
  ---------------------------------------------- --------
  National Emergency                                  112
  Emergency Medical                                   108
  Fire & Rescue                                       101
  Wayanad District Emergency Operations Centre       1077

The Official Emergency page can also record system disaster incidents as
part of the prototype workflow.

------------------------------------------------------------------------

# 🏗️ System Architecture

``` text
                           ┌───────────────────────┐
                           │ Multi-Source Data     │
                           │                       │
                           │ • Rainfall            │
                           │ • Soil Moisture       │
                           │ • DEM / Terrain       │
                           │ • River Geometry      │
                           │ • Historical Events   │
                           │ • Forecast Rainfall   │
                           └───────────┬───────────┘
                                       │
                                       ▼
                           ┌───────────────────────┐
                           │ Feature Engineering   │
                           │                       │
                           │ 1h–48h rainfall       │
                           │ Soil-depth features   │
                           │ Terrain features      │
                           └───────────┬───────────┘
                                       │
                     ┌─────────────────┴─────────────────┐
                     │                                   │
                     ▼                                   ▼
            ┌─────────────────┐                 ┌─────────────────┐
            │ ML Predictor    │                 │ V4 Risk Engine  │
            │                 │                 │                 │
            │ 6h / 12h / 24h │                 │ Explainable     │
            │ hazard signal   │                 │ risk score      │
            └────────┬────────┘                 └────────┬────────┘
                     │                                   │
                     └─────────────────┬─────────────────┘
                                       ▼
                           ┌───────────────────────┐
                           │ Risk / Hazard Output  │
                           └───────────┬───────────┘
                                       │
                    ┌──────────────────┼──────────────────┐
                    ▼                  ▼                  ▼
              Risk Map             Forecast            Alerts
                    │                  │                  │
                    └──────────────────┼──────────────────┘
                                       ▼
                         ┌─────────────────────────┐
                         │ Official + Citizen      │
                         │ Disaster Response       │
                         └─────────────────────────┘
```

------------------------------------------------------------------------

# 🔌 Frontend ↔ Backend Architecture

``` text
Browser
   │
   ▼
React + Vite
   │
   │ HTTP / REST
   ▼
Python + Flask
   │
   ├── Data Processing
   ├── V4 Risk Engine
   ├── ML Inference
   ├── Forecast Risk
   └── Historical Replay
   │
   ▼
JSON Response
   │
   ▼
React Visualization
   │
   ├── Risk Map
   ├── Forecast
   ├── Alerts
   ├── Dashboard
   └── Citizen Alert
```

------------------------------------------------------------------------

# 🛠️ Technology Stack

  Layer                Technology
  -------------------- ---------------------------------------
  Frontend             React 19
  Frontend tooling     Vite
  UI                   JavaScript / JSX / CSS
  Routing              React Router
  Maps                 Leaflet + React-Leaflet
  Map data             OpenStreetMap
  Backend              Python + Flask
  API                  REST-style HTTP/JSON
  Data processing      Pandas + NumPy
  Machine Learning     Scikit-learn
  Model persistence    Joblib
  Terrain              GeoTIFF / DEM
  River data           GeoJSON
  Weather / forecast   Open-Meteo / ECMWF
  Prototype state      Browser localStorage + browser events
  Version control      Git + GitHub

------------------------------------------------------------------------

# 📁 Project Structure

``` text
SIH/
│
├── backend/
│   ├── app.py
│   ├── risk_model.py
│   ├── ml_predictor.py
│   ├── forecast_risk.py
│   ├── requirements.txt
│   │
│   ├── data/
│   │   ├── historical_rainfall.csv
│   │   ├── historical_soil_moisture.csv
│   │   ├── historical_forecast_rainfall.csv
│   │   ├── historical_events.csv
│   │   ├── historical_risk_scores.csv
│   │   ├── historical_risk_scores_v2.csv
│   │   ├── ml_training_dataset.csv
│   │   ├── unified_training_dataset.csv
│   │   ├── unified_training_features.csv
│   │   ├── unified_training_features_extended.csv
│   │   ├── current_forecast_rainfall.csv
│   │   ├── rainfall_by_location.csv
│   │   ├── static_location_features.csv
│   │   ├── wayanad_dem.tif
│   │   └── wayanad_rivers.geojson
│   │
│   ├── models/
│   │   ├── flash_flood_rf_6h.joblib
│   │   ├── flash_flood_rf_12h.joblib
│   │   ├── flash_flood_rf_24h.joblib
│   │   └── training_summary.json
│   │
│   └── scripts/
│       ├── build_risk_model.py
│       ├── build_static_features.py
│       ├── build_unified_dataset.py
│       ├── calibrate_risk_thresholds.py
│       ├── create_event_labels.py
│       ├── extend_historical_dataset.py
│       ├── fetch_current_forecast_rainfall.py
│       ├── fetch_current_soil_moisture.py
│       ├── fetch_dem.py
│       ├── fetch_historical_forecast.py
│       ├── fetch_historical_rainfall.py
│       ├── fetch_historical_soil_moisture.py
│       ├── fetch_rainfall.py
│       ├── fetch_rivers.py
│       ├── preprocess_dem.py
│       ├── replay.py
│       └── train_ml_model.py
│
├── public/
│   └── assets/
│       └── images/
│
├── src/
│   ├── components/
│   │   ├── layout/
│   │   └── official/
│   │
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── RiskMap.jsx
│   │   ├── Alerts.jsx
│   │   ├── Shelters.jsx
│   │   ├── Preparedness.jsx
│   │   └── Emergency.jsx
│   │
│   ├── official/
│   │   ├── context/
│   │   ├── data/
│   │   ├── i18n/
│   │   ├── pages/
│   │   └── styles/
│   │
│   ├── App.jsx
│   ├── LanguageContext.jsx
│   ├── main.jsx
│   └── index.css
│
├── index.html
├── package.json
├── package-lock.json
├── vite.config.js
└── README.md
```

------------------------------------------------------------------------

# 🔌 Backend API

The Flask backend exposes the following main endpoints.

  Endpoint                          Method   Purpose
  --------------------------------- -------- ----------------------------------------
  `/api/health`                     GET      Backend health check
  `/api/risk-map`                   GET      Current / replay / validation risk map
  `/api/risk-map?source=live`       GET      Current live risk
  `/api/risk-map?source=replay`     GET      Historical replay risk
  `/api/risk-map?source=imd`        GET      Prototype validation scenario
  `/api/simulate?rainfall_mm=150`   GET      Rainfall scenario simulation
  `/api/forecast-risk`              GET      Future 6h / 12h / 24h risk
  `/api/districts`                  GET      District-level risk summary
  `/api/alerts`                     GET      Current alert information
  `/api/sensor-data`                POST     Sensor data ingestion
  `/api/sensor-data`                GET      Recent sensor readings
  `/api/live-state`                 GET      Current replay/sensor state
  `/api/current-weather`            GET      Current Open-Meteo weather
  `/api/replay/start`               POST     Start automated historical replay
  `/api/replay/stop`                POST     Stop replay
  `/api/replay/status`              GET      Replay status
  `/api/replay/reset`               POST     Reset replay state
  `/api/lead-time`                  GET      Prototype lead-time demonstration

------------------------------------------------------------------------

# 📡 Sensor Ingestion

The backend includes a sensor-ingestion API for prototype live-state
updates.

Example request:

``` http
POST /api/sensor-data
Content-Type: application/json
```

The backend supports rainfall and soil-moisture sensor readings
associated with a monitored location.

Supported soil-depth concepts include:

``` text
0–7 cm
7–28 cm
28–100 cm
100–255 cm
```

The ingested state can then contribute to the risk calculation.

------------------------------------------------------------------------

# 🌦️ Data Acquisition

The repository contains scripts for collecting and preparing
environmental data.

### Historical rainfall

Historical rainfall is fetched from the Open-Meteo archive service for
the monitored Wayanad locations.

### Current / forecast rainfall

Current and forecast rainfall is obtained through Open-Meteo.

### Soil moisture

The project uses multiple soil-moisture depths from Open-Meteo for
current and historical processing.

### DEM

The project includes an SRTM-based Digital Elevation Model for Wayanad.
The repository contains a script for downloading approximately 30 m DEM
data through OpenTopography.

### Rivers

River and stream geometry is collected from OpenStreetMap through
Overpass and stored as GeoJSON.

------------------------------------------------------------------------

# 🚀 Getting Started

## Prerequisites

Install:

-   **Node.js**
-   **npm**
-   **Python 3**
-   **pip**

For data-download scripts, an internet connection is required.

------------------------------------------------------------------------

## 1. Clone the repository

``` bash
git clone https://github.com/codedbyanik/SIH.git
cd SIH
```

------------------------------------------------------------------------

## 2. Install frontend dependencies

``` bash
npm install
```

Start the frontend:

``` bash
npm run dev
```

The Vite development server normally starts at:

``` text
http://localhost:5173
```

------------------------------------------------------------------------

## 3. Install backend dependencies

Open another terminal:

``` bash
cd backend
pip install -r requirements.txt
```

Start Flask:

``` bash
python app.py
```

The backend runs at:

``` text
http://127.0.0.1:5000
```

------------------------------------------------------------------------

## 4. Verify the backend

Open:

``` text
http://127.0.0.1:5000/api/health
```

You can also test:

``` text
http://127.0.0.1:5000/api/risk-map
```

``` text
http://127.0.0.1:5000/api/forecast-risk
```

``` text
http://127.0.0.1:5000/api/alerts
```

------------------------------------------------------------------------

# 🔐 Official Portal Demo Login

The Official Portal currently uses **frontend-only demonstration
authentication**.

``` text
Official Portal:
 /official/login

Demo ID:
 admin@ffews.gov.in

Demo Password:
 Admin@123
```

> ⚠️ These credentials are intentionally part of the hackathon
> prototype. The authentication/session mechanism uses browser storage
> and is **not production-grade security**.

------------------------------------------------------------------------

# 🧪 Running the Historical Replay

The Official Risk Map can start the replay through:

``` text
POST /api/replay/start
```

The Flask backend launches:

``` text
backend/scripts/replay.py
```

The replay sends historical rainfall and soil-moisture readings to:

``` text
/api/sensor-data
```

The backend then recalculates rolling windows and risk.

The replay is intended as a demonstration of how risk can evolve around
the 2024 Wayanad event rather than as a claim that the prototype is an
operational historical alert service.

------------------------------------------------------------------------

# 🧰 Data / Model Preparation Scripts

The backend contains scripts for the complete data workflow.

### Data acquisition

``` text
fetch_rainfall.py
fetch_historical_rainfall.py
fetch_historical_soil_moisture.py
fetch_historical_forecast.py
fetch_current_forecast_rainfall.py
fetch_current_soil_moisture.py
fetch_dem.py
fetch_rivers.py
```

### Data processing

``` text
preprocess_dem.py
build_static_features.py
build_unified_dataset.py
extend_historical_dataset.py
create_event_labels.py
```

### Risk / model development

``` text
build_risk_model.py
calibrate_risk_thresholds.py
train_ml_model.py
analyze_event_data.py
```

### Demonstration

``` text
replay.py
```

The repository already contains the processed datasets and trained
prototype model artifacts used by the application.

------------------------------------------------------------------------

# 📊 Prototype Alert Bands

For rainfall simulation, the current demonstration uses the following
operational bands:

    Simulated rainfall Prototype severity
  -------------------- --------------------
             `< 50 mm` Advisory
            `50–79 mm` Moderate
           `80–139 mm` High
            `≥ 140 mm` Critical

> **Important:** These are prototype/demo operational rules. They are
> **not scientifically calibrated national alert standards** and must
> not replace official IMD/KSDMA warning criteria.

------------------------------------------------------------------------

# 📈 Prototype Lead-Time Demonstration

The backend includes a demonstration lead-time endpoint based on the
reference Wayanad event.

The current prototype data represents:

``` text
Reference event:       30 July 2024
Prototype alert time:  29 July 2024, 18:00
Reference event time:  30 July 2024, 01:15
Demonstrated lead time: 7.25 hours
```

This should be understood as a **prototype replay/lead-time
demonstration**, not an independently validated historical operational
warning result.

------------------------------------------------------------------------

# 🧭 Complete User Journey

## Citizen

``` text
Open FFEPS
    ↓
Check local risk
    ↓
View risk map
    ↓
View alerts / forecast
    ↓
Find shelter
    ↓
Follow preparedness guidance
    ↓
Use emergency contacts
```

## Official

``` text
Official Login
    ↓
Dashboard
    ↓
Risk Map
    ↓
Monitor live / forecast risk
    ↓
Simulate rainfall OR replay historical conditions
    ↓
Review severity
    ↓
Generate / receive alert
    ↓
Manage shelters / incidents
    ↓
Citizen warning
```

------------------------------------------------------------------------

# ⭐ What Makes FFEPS Different?

A conventional ML prototype might look like:

``` text
Dataset → Train → Predict
```

FFEPS expands this into:

``` text
Environmental Data
       ↓
Feature Engineering
       ↓
ML Hazard Signal
       +
Explainable Risk Engine
       ↓
Spatial Risk Map
       ↓
Forecast / Historical Replay
       ↓
Official Decision Support
       ↓
Citizen Alert
       ↓
Preparedness / Emergency Action
```

The focus is therefore not only on prediction accuracy, but on
connecting prediction to a **usable early-prediction and
disaster-management workflow**.

------------------------------------------------------------------------

# ⚠️ Limitations

FFEPS is a **hackathon prototype** and has important limitations.

### ML limitations

-   Genuine positive flood-event labels are sparse.
-   Synthetic positive examples are used for prototype augmentation.
-   The trained models are not independently validated.
-   Model outputs are not probability-calibrated for real-world flood
    probability.
-   A prototype ML score should not be interpreted as "X% probability of
    a flood."

### Operational limitations

-   The demonstration is focused on Wayanad and five monitored
    locations.
-   Prototype rainfall severity thresholds are not official warning
    standards.
-   Some alert/shelter synchronization uses browser `localStorage` and
    browser events.
-   The current live-data architecture should be strengthened with
    authoritative operational feeds and robust missing-data handling.
-   The current system is not a replacement for official disaster
    warnings or emergency services.

------------------------------------------------------------------------

# 🔮 Future Scope

## 🌐 Real-Time Multi-Source Integration

Integrate authoritative real-time:

-   rain gauges,
-   automatic weather stations,
-   river-level sensors,
-   satellite precipitation,
-   soil-moisture products,
-   weather forecasts,
-   disaster-management feeds.

## 🤖 Improved ML

-   More independent flood and near-miss events
-   Better spatial and temporal event labeling
-   Event/time-based train-validation-test splits
-   Probability calibration
-   Precision / recall / F1 / PR-AUC evaluation
-   Lead-time evaluation
-   Location-specific calibration

## 🗄️ Production Data Layer

A production system could move from prototype files/browser storage to:

``` text
PostgreSQL / PostGIS
        +
Time-series storage
        +
Real-time messaging
        +
Server-side alert persistence
```

## 📡 Multi-Channel Warnings

Future versions could support:

-   SMS
-   push notifications
-   IVR / voice alerts
-   location-based notifications
-   official communication channels

## 🌍 Wider Deployment

Expand from Wayanad to other vulnerable hilly districts and calibrate
risk thresholds with hydrological and disaster-management experts.

------------------------------------------------------------------------

# 🔒 Production Considerations

Before real-world deployment, the prototype would require:

-   secure backend authentication,
-   role-based authorization,
-   server-side session management,
-   persistent database storage,
-   real-time messaging infrastructure,
-   HTTPS,
-   audit logging,
-   monitoring and observability,
-   data-quality validation,
-   model calibration,
-   independent scientific validation,
-   integration with authorized warning authorities.

------------------------------------------------------------------------

# 🏆 Smart India Hackathon

**Problem Statement ID:** SIH26192

**Problem Statement:**

> **Flash Flood Prediction System for Hilly Regions using Multi-Source
> Data**

**Demonstration Region:** Wayanad, Kerala

**Project Category:** Disaster Management

------------------------------------------------------------------------

# 📚 Project Documentation

The repository contains additional backend and map documentation:

-   `backend/README.md` --- backend/API notes
-   `README-real-map.md` --- map implementation notes

For the complete technical explanation, ML methodology, architecture,
limitations and viva preparation, refer to the project's supporting
documentation.

------------------------------------------------------------------------

# 👥 Team

Developed as a **Smart India Hackathon prototype** focused on improving
flash-flood preparedness and disaster-response coordination in
vulnerable hilly regions.

------------------------------------------------------------------------

# ⚠️ Disclaimer

FFEPS is a **student/hackathon prototype** intended to demonstrate an
end-to-end flash-flood prediction and disaster-management workflow.

It is **not a certified operational flood-prediction or public-alert
system**.

The ML models, risk thresholds and lead-time demonstrations are
prototype components and should not be used as substitutes for official
warnings, emergency services, or professionally validated hydrological
and disaster-management systems.

------------------------------------------------------------------------

## 🌊 FFEPS

**Sense → Understand → Visualize → Decide → Act**

> Turning multi-source environmental information into location-aware
> risk and actionable early-prediction workflows.
