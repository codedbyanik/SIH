# SIH26192 Backend — Wayanad Flash Flood Prediction

Day 1-2 deliverable: working Flask API, tested and running, returning
data in the EXACT shape your frontend already expects (verified
against `riskZones` / `districts` / `alerts` in the actual repo).

## Setup (do this first, today)

```bash
cd backend
pip install -r requirements.txt
python app.py
```

Server runs at `http://localhost:5000`. Test it:
```bash
curl http://localhost:5000/api/risk-map
curl http://localhost:5000/api/districts
curl http://localhost:5000/api/alerts
```

## Endpoints (all working now, with dummy/random data)

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/risk-map?date=YYYY-MM-DD` | GET | Zone-level risk data — matches `RiskMap.jsx` shape |
| `/api/simulate?rainfall_mm=X` | GET | Powers the rainfall slider (add this to frontend) |
| `/api/districts` | GET | District-level summary — matches Official Portal shape |
| `/api/alerts` | GET | Active alerts — matches Official Portal `alerts` shape |
| `/api/sensor-data` | POST | IoT ingestion endpoint (Stage 4B) |
| `/api/sensor-data` | GET | Last 20 sensor readings (for a live sensor panel) |
| `/api/lead-time` | GET | The "alert issued X hours before event" stat for your pitch |
| `/api/health` | GET | Quick check the server is alive |

## What's real vs. placeholder right now

- **Placeholder (Day 1-2):** `compute_risk_score()` in `app.py` is a
  simple rainfall threshold. Random rainfall values are generated per
  request just so the frontend has something live to render today.
- **Real (once you run the scripts below):** actual historical
  rainfall for the 30 July 2024 Wayanad event, pulled from Open-Meteo.

## Day 1-2 data collection — run these ON YOUR OWN MACHINE (need internet)

```bash
cd scripts
python fetch_rainfall.py   # pulls real Open-Meteo rainfall for the event window
python fetch_dem.py        # needs a free OpenTopography API key — sign up first
python fetch_rivers.py     # pulls river network from OpenStreetMap
```

These save into `data/`. Nothing else in `app.py` needs to change —
Day 3-4 you'll replace `compute_risk_score()` with a real model reading
from these files instead of using random numbers.

## Demo replay (Stage 6B) — once rainfall data is fetched

Run the server (`python app.py`) in one terminal, then in another:
```bash
cd scripts
python replay.py
```

This streams the real 30 July 2024 rainfall data into `/api/sensor-data`
at compressed speed (1 real hour = 30 seconds), so your frontend's
sensor panel updates live during the demo — this is your "watch the
system flag the risk before the real event happened" moment.

## What your friend needs to do on the frontend

Replace the hardcoded `riskZones` array in `RiskMap.jsx` and
`districts`/`alerts` in `officialMockData.js` with `fetch()` calls to
these endpoints. The field names match exactly, so it should be a
near drop-in swap — no restructuring needed.

## Next steps (Day 3+)

1. Replace `compute_risk_score()` with your real model (rainfall +
   slope + drainage proximity + soil moisture).
2. Wire DEM slope/drainage computation from `wayanad_dem.tif`.
3. Add soil moisture data (Zenodo India dataset) into the model.
4. Validate against the real 30 July 2024 event timeline.
