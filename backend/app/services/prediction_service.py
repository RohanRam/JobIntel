from pathlib import Path
import re
import json
import joblib
import pandas as pd
import numpy as np
from config import Config
from app.utils.errors import APIError

class PredictionService:
    def __init__(self):
        self._bundle = None
        self._pipeline = None
        self._metadata = None
        self._load_model()

    def _load_model(self):
        if Config.MODEL_PATH.exists():
            try:
                self._bundle = joblib.load(Config.MODEL_PATH)
                self._pipeline = self._bundle["pipeline"]
            except Exception as e:
                print(f"Error loading model bundle: {e}")
                self._bundle = None
                self._pipeline = None

        if Config.METADATA_PATH.exists():
            try:
                with open(Config.METADATA_PATH, "r", encoding="utf-8") as f:
                    self._metadata = json.load(f)
            except Exception as e:
                print(f"Error loading metadata: {e}")
                self._metadata = None

    def is_loaded(self) -> bool:
        return self._pipeline is not None

    def get_metadata(self):
        if self._metadata:
            return self._metadata
        return {
            "model_name": "Indian Job Market Salary Regressor",
            "model_version": "1.0.0",
            "status": "loaded" if self.is_loaded() else "not_loaded"
        }

    def predict(self, payload: dict) -> dict:
        if not self.is_loaded():
            raise APIError("Salary prediction model is not currently loaded", code="MODEL_UNAVAILABLE", status_code=503)

        role_family = payload.get("role_family", "Software Engineering")
        city = payload.get("city", "Bengaluru")
        work_mode = payload.get("work_mode", "Hybrid")
        
        try:
            exp = float(payload.get("experience_years", 2.0))
        except (ValueError, TypeError):
            raise APIError("experience_years must be a valid number", code="VALIDATION_ERROR", status_code=400)

        if exp < 0 or exp > 50:
            raise APIError("experience_years must be between 0 and 50", code="VALIDATION_ERROR", status_code=400)

        skills = payload.get("skills", [])
        if not isinstance(skills, list):
            skills = [str(skills)]

        # Prepare normalized skills text for CountVectorizer
        cleaned_tokens = [re.sub(r'[^a-zA-Z0-9]', '', s.lower()) for s in skills if s]
        skills_text = " ".join(cleaned_tokens)

        # Estimate min/max experience bounds around the requested experience
        min_exp = max(0.0, exp - 1.0)
        max_exp = exp + 1.0

        # Construct single-row DataFrame
        input_df = pd.DataFrame([{
            "role_family": str(role_family),
            "city": str(city),
            "work_mode": str(work_mode),
            "experience_years": exp,
            "min_experience_years": min_exp,
            "max_experience_years": max_exp,
            "skills_text": skills_text,
        }])

        pred_array = self._pipeline.predict(input_df)
        pred_inr = float(pred_array[0])
        pred_lpa = round(pred_inr / 100000.0, 2)

        # Retrieve empirical calibration quantiles
        lower_pct = float(self._bundle.get("lower_quantile_pct", -0.40))
        upper_pct = float(self._bundle.get("upper_quantile_pct", 0.70))

        lower_inr = max(50000.0, pred_inr * (1.0 + lower_pct))
        upper_inr = pred_inr * (1.0 + upper_pct)

        lower_lpa = round(lower_inr / 100000.0, 2)
        upper_lpa = round(upper_inr / 100000.0, 2)

        return {
            "predicted_salary_inr_annual": round(pred_inr),
            "predicted_salary_lpa": pred_lpa,
            "prediction_interval": {
                "lower_inr": round(lower_inr),
                "upper_inr": round(upper_inr),
                "lower_lpa": lower_lpa,
                "upper_lpa": upper_lpa,
                "confidence_level": "80%",
                "method": "empirical_residual_quantiles",
            },
            "currency": "INR",
            "period": "annual",
            "model_version": self._bundle.get("model_version", "1.0.0"),
            "input_summary": {
                "role_family": role_family,
                "experience_years": exp,
                "city": city,
                "work_mode": work_mode,
                "skills_count": len(skills),
            },
            "limitations": [
                "Estimate is based on the salary-disclosed subset of the 2025-2026 Indian job market dataset.",
                "Actual compensation offers vary according to employer budget, equity/bonuses, candidate negotiation, and specific technical scope.",
                "Prediction interval reflects the observed empirical 80% error distribution on unseen test postings."
            ]
        }

prediction_service = PredictionService()

