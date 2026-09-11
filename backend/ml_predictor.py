
"""
Prototype ML prediction layer for SIH26192.

The Random Forest models use ONLY current/observed rainfall, soil moisture,
and static terrain features. Future ECMWF forecast rainfall is intentionally
not passed to this ML model because the historical training dataset does not
contain trustworthy issue-time forecast features.

The V4 forecast engine remains responsible for 6h/12h/24h future risk.
"""

from pathlib import Path
import joblib
import pandas as pd

BASE = Path(__file__).resolve().parent
MODEL_DIR = BASE / "models"

HORIZONS = (6, 12, 24)

MODEL_FILES = {
    6: MODEL_DIR / "flash_flood_rf_6h.joblib",
    12: MODEL_DIR / "flash_flood_rf_12h.joblib",
    24: MODEL_DIR / "flash_flood_rf_24h.joblib",
}

_models = {}


def _load_models():
    global _models

    if _models:
        return _models

    for horizon, path in MODEL_FILES.items():
        try:
            if path.exists():
                bundle = joblib.load(path)
                if isinstance(bundle, dict) and "model" in bundle:
                    _models[horizon] = bundle
        except Exception as exc:
            print(f"ML MODEL LOAD ERROR ({horizon}h): {exc}")

    return _models


def ml_models_status():
    models = _load_models()

    return {
        f"{h}h": {
            "available": h in models,
            "path": str(MODEL_FILES[h]),
            "prototype_only": True,
            "probability_calibrated": False,
        }
        for h in HORIZONS
    }


def predict_prototype_score(features):
    """
    Predict current-condition prototype hazard scores for 6h/12h/24h.

    `features` is one dictionary containing the observed/current feature set.
    """
    models = _load_models()
    result = {}

    for horizon in HORIZONS:
        key = f"{horizon}h"
        bundle = models.get(horizon)

        if bundle is None:
            result[key] = {
                "available": False,
                "prototype_probability": None,
                "ml_hazard_score": None,
            }
            continue

        model = bundle["model"]
        feature_columns = bundle.get("feature_columns", [])

        values = {
            col: float(features.get(col, 0.0) or 0.0)
            for col in feature_columns
        }

        X = pd.DataFrame([values], columns=feature_columns)

        try:
            probability = float(model.predict_proba(X)[0][1])
        except Exception as exc:
            print(f"ML PREDICTION ERROR ({horizon}h): {exc}")
            result[key] = {
                "available": False,
                "prototype_probability": None,
                "ml_hazard_score": None,
                "error": str(exc),
            }
            continue

        probability = max(0.0, min(1.0, probability))

        result[key] = {
            "available": True,
            "prototype_probability": round(probability, 4),
            "ml_hazard_score": round(probability * 100, 1),
        }

    return result
