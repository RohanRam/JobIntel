"""Evaluation script for the deployed salary model.
Loads the model bundle and test metadata, runs sanity checks on synthetic test inputs,
and outputs performance metrics.
"""
from pathlib import Path
import json
import joblib
import pandas as pd
import numpy as np

BASE_DIR = Path(__file__).resolve().parents[1]
MODEL_PATH = BASE_DIR / "artifacts" / "salary_model.joblib"
METADATA_PATH = BASE_DIR / "artifacts" / "model_metadata.json"

def main():
    print(f"Loading model bundle from {MODEL_PATH}...")
    if not MODEL_PATH.exists():
        raise FileNotFoundError(f"Model artifact not found at {MODEL_PATH}")

    bundle = joblib.load(MODEL_PATH)
    pipeline = bundle["pipeline"]
    model_version = bundle.get("model_version", "unknown")
    print(f"Loaded model version: {model_version}")

    if METADATA_PATH.exists():
        with open(METADATA_PATH, "r", encoding="utf-8") as f:
            metadata = json.load(f)
        print("\n=== SAVED EVALUATION METRICS ===")
        metrics = metadata.get("metrics", {})
        print(f" MAE: ₹{metrics.get('mae_inr', 0):,.2f} ({metrics.get('mae_lpa', 0):.2f} LPA)")
        print(f" Median Absolute Error: ₹{metrics.get('median_absolute_error_inr', 0):,.2f} ({metrics.get('median_absolute_error_lpa', 0):.2f} LPA)")
        print(f" RMSE: ₹{metrics.get('rmse_inr', 0):,.2f} ({metrics.get('rmse_lpa', 0):.2f} LPA)")
        print(f" R²: {metrics.get('r2', 0):.4f}")

    # Sanity checks on synthetic inputs
    test_cases = [
        {
            "role_family": "Software Engineering",
            "city": "Bengaluru",
            "work_mode": "Hybrid",
            "experience_years": 4.0,
            "min_experience_years": 3.0,
            "max_experience_years": 5.0,
            "skills_text": "python react docker aws sql",
        },
        {
            "role_family": "Data Science",
            "city": "Bengaluru",
            "work_mode": "Hybrid",
            "experience_years": 5.0,
            "min_experience_years": 4.0,
            "max_experience_years": 6.0,
            "skills_text": "python machinelearning deeplearning pytorch sql",
        },
        {
            "role_family": "Data Analytics",
            "city": "Mumbai",
            "work_mode": "On-site",
            "experience_years": 2.0,
            "min_experience_years": 1.0,
            "max_experience_years": 3.0,
            "skills_text": "excel sql powerbi tableau",
        },
        {
            "role_family": "Sales & Business Development",
            "city": "Delhi-NCR",
            "work_mode": "On-site",
            "experience_years": 1.0,
            "min_experience_years": 0.0,
            "max_experience_years": 2.0,
            "skills_text": "sales communication b2bsales",
        }
    ]

    df_test = pd.DataFrame(test_cases)
    preds = pipeline.predict(df_test)

    print("\n=== SANITY PREDICTION CHECKS ===")
    for tc, pred in zip(test_cases, preds):
        print(f"Role: {tc['role_family']}, Exp: {tc['experience_years']} yrs, City: {tc['city']}")
        print(f" -> Predicted Salary: ₹{pred:,.0f} ({pred/100000.0:.2f} LPA)\n")
        assert pred > 50000, "Prediction must be above minimum plausible threshold"
        assert pred < 50000000, "Prediction must be under reasonable upper bound"

    print("All sanity checks passed successfully!")

if __name__ == "__main__":
    main()

