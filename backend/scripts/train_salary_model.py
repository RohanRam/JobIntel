"""Supervised ML model training script for salary prediction.
Trains baseline and gradient-boosted regression models with log1p target transformation,
evaluates out-of-fold generalization, and exports a production model bundle and metadata.
"""
from pathlib import Path
import json
import joblib
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.impute import SimpleImputer
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.ensemble import HistGradientBoostingRegressor, RandomForestRegressor
from sklearn.linear_model import Ridge
from sklearn.compose import TransformedTargetRegressor
from sklearn.metrics import mean_absolute_error, median_absolute_error, mean_squared_error, r2_score

BASE_DIR = Path(__file__).resolve().parents[1]
CLEAN_DATA_PATH = BASE_DIR / "data" / "processed" / "jobs_clean.parquet"
MODEL_PATH = BASE_DIR / "artifacts" / "salary_model.joblib"
METADATA_PATH = BASE_DIR / "artifacts" / "model_metadata.json"
REPORT_PATH = BASE_DIR / "artifacts" / "evaluation_report.json"

def prepare_training_data(df: pd.DataFrame):
    # Only keep records where salary is disclosed and valid
    df_sal = df[df["salary_disclosed"] & df["salary_midpoint_inr_annual"].notna()].copy()
    print(f"Total salary-disclosed records available: {len(df_sal)}")

    if len(df_sal) < 500:
        raise ValueError(f"Insufficient salary records for training: {len(df_sal)}")

    # Extract skill string for CountVectorizer
    if "skills_json" in df_sal.columns:
        df_sal["skills_text"] = df_sal["skills_json"].apply(
            lambda x: " ".join([re.sub(r'[^a-zA-Z0-9]', '', s.lower()) for s in json.loads(x)]) if pd.notna(x) else ""
        )
    elif "skills" in df_sal.columns:
        df_sal["skills_text"] = df_sal["skills"].apply(
            lambda x: " ".join([re.sub(r'[^a-zA-Z0-9]', '', s.lower()) for s in x]) if isinstance(x, list) else ""
        )
    else:
        df_sal["skills_text"] = ""

    # Feature definitions
    cat_features = ["role_family", "city", "work_mode"]
    num_features = ["experience_years", "min_experience_years", "max_experience_years"]

    for col in cat_features:
        df_sal[col] = df_sal[col].fillna("Unknown").astype(str)

    target_col = "salary_midpoint_inr_annual"
    
    return df_sal, cat_features, num_features, "skills_text", target_col

import re

def train_and_evaluate():
    print(f"Loading clean data from {CLEAN_DATA_PATH}...")
    if not CLEAN_DATA_PATH.exists():
        raise FileNotFoundError(f"Clean data not found: {CLEAN_DATA_PATH}. Run run_pipeline.py first.")

    df = pd.read_parquet(CLEAN_DATA_PATH)
    df_sal, cat_features, num_features, text_feature, target_col = prepare_training_data(df)

    X = df_sal[cat_features + num_features + [text_feature]]
    y = df_sal[target_col].values

    # 80/20 train/test split, stratified by role_family where possible
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    print(f"Train sample size: {len(X_train)}, Test sample size: {len(X_test)}")

    # Preprocessing Pipeline
    preprocessor = ColumnTransformer(
        transformers=[
            ("cat", OneHotEncoder(handle_unknown="ignore", sparse_output=False), cat_features),
            ("num", Pipeline([
                ("imputer", SimpleImputer(strategy="median")),
                ("scaler", StandardScaler())
            ]), num_features),
            ("text", CountVectorizer(max_features=120, token_pattern=r'(?u)\b\w+\b'), text_feature),
        ],
        remainder="drop"
    )

    # 1. Baseline Median Regressor evaluation
    median_pred = np.median(y_train)
    y_pred_baseline = np.full_like(y_test, fill_value=median_pred)
    mae_baseline = mean_absolute_error(y_test, y_pred_baseline)
    print(f"Baseline (Median) Test MAE: ₹{mae_baseline:,.0f} ({mae_baseline/1e5:.2f} LPA)")

    # 2. Ridge Regression Model
    ridge_pipeline = Pipeline([
        ("preprocessor", preprocessor),
        ("regressor", TransformedTargetRegressor(
            regressor=Ridge(alpha=10.0),
            func=np.log1p,
            inverse_func=np.expm1
        ))
    ])
    ridge_pipeline.fit(X_train, y_train)
    y_pred_ridge = ridge_pipeline.predict(X_test)
    mae_ridge = mean_absolute_error(y_test, y_pred_ridge)
    print(f"Ridge Regression Test MAE: ₹{mae_ridge:,.0f} ({mae_ridge/1e5:.2f} LPA)")

    # 3. HistGradientBoostingRegressor Model
    hgb_pipeline = Pipeline([
        ("preprocessor", preprocessor),
        ("regressor", TransformedTargetRegressor(
            regressor=HistGradientBoostingRegressor(max_iter=150, learning_rate=0.08, min_samples_leaf=15, random_state=42),
            func=np.log1p,
            inverse_func=np.expm1
        ))
    ])

    print("Training Gradient Boosted Regressor...")
    hgb_pipeline.fit(X_train, y_train)
    y_pred_hgb = hgb_pipeline.predict(X_test)

    # Evaluation metrics
    mae = mean_absolute_error(y_test, y_pred_hgb)
    med_ae = median_absolute_error(y_test, y_pred_hgb)
    rmse = np.sqrt(mean_squared_error(y_test, y_pred_hgb))
    r2 = r2_score(y_test, y_pred_hgb)

    print("\n=== MODEL EVALUATION (HELD-OUT TEST SET) ===")
    print(f"MAE: ₹{mae:,.0f} ({mae/100000.0:.2f} LPA)")
    print(f"Median Absolute Error: ₹{med_ae:,.0f} ({med_ae/100000.0:.2f} LPA)")
    print(f"RMSE: ₹{rmse:,.0f} ({rmse/100000.0:.2f} LPA)")
    print(f"R² Score: {r2:.4f}")

    # Calculate residual intervals for conformal/empirical intervals (80% confidence: 10th to 90th percentile of percentage error)
    pct_residuals = (y_test - y_pred_hgb) / np.maximum(y_pred_hgb, 10000)
    lower_pct_err = float(np.percentile(pct_residuals, 10))
    upper_pct_err = float(np.percentile(pct_residuals, 90))
    print(f"Empirical 80% error interval: [{lower_pct_err*100:.1f}%, +{upper_pct_err*100:.1f}%]")

    # Evaluate by Role Family
    role_eval = {}
    test_roles = X_test["role_family"].values
    for role in np.unique(test_roles):
        mask = (test_roles == role)
        if mask.sum() >= 10:
            role_mae = mean_absolute_error(y_test[mask], y_pred_hgb[mask])
            role_eval[role] = {
                "sample_count": int(mask.sum()),
                "mae_inr": round(float(role_mae), 2),
                "mae_lpa": round(float(role_mae / 1e5), 2),
            }

    # Save Bundle
    MODEL_PATH.parent.mkdir(parents=True, exist_ok=True)
    bundle = {
        "pipeline": hgb_pipeline,
        "cat_features": cat_features,
        "num_features": num_features,
        "text_feature": text_feature,
        "model_version": "1.0.0",
        "model_type": "HistGradientBoostingRegressor(TransformedTargetRegressor:log1p)",
        "lower_quantile_pct": lower_pct_err,
        "upper_quantile_pct": upper_pct_err,
        "training_date": pd.Timestamp.now().strftime("%Y-%m-%d"),
    }
    joblib.dump(bundle, MODEL_PATH)
    print(f"Saved model bundle to {MODEL_PATH}")

    # Save Model Metadata
    metadata = {
        "model_name": "Indian Job Market Salary Regressor",
        "model_version": "1.0.0",
        "model_type": "HistGradientBoostingRegressor",
        "target": "salary_midpoint_inr_annual",
        "currency": "INR",
        "period": "annual",
        "training_date": pd.Timestamp.now().strftime("%Y-%m-%d"),
        "train_sample_size": len(X_train),
        "test_sample_size": len(X_test),
        "features": {
            "categorical": cat_features,
            "numeric": num_features,
            "text": "skills_text"
        },
        "metrics": {
            "mae_inr": round(float(mae), 2),
            "mae_lpa": round(float(mae / 100000.0), 2),
            "median_absolute_error_inr": round(float(med_ae), 2),
            "median_absolute_error_lpa": round(float(med_ae / 100000.0), 2),
            "rmse_inr": round(float(rmse), 2),
            "rmse_lpa": round(float(rmse / 100000.0), 2),
            "r2": round(float(r2), 4),
        },
        "baseline_metrics": {
            "median_baseline_mae_inr": round(float(mae_baseline), 2),
            "ridge_mae_inr": round(float(mae_ridge), 2)
        },
        "prediction_interval": {
            "confidence_level": "80%",
            "method": "empirical_residual_quantiles",
            "lower_pct_bound": round(lower_pct_err, 4),
            "upper_pct_bound": round(upper_pct_err, 4)
        },
        "role_family_performance": role_eval
    }

    with open(METADATA_PATH, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)

    with open(REPORT_PATH, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)

    print(f"Saved metadata to {METADATA_PATH}")

if __name__ == "__main__":
    train_and_evaluate()

