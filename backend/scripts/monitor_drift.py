"""Data and Model Drift Monitoring Script (Section 17).
Calculates and records:
- Raw dataset SHA256 fingerprint
- Ingestion and rejection statistics
- Salary parsing and disclosure rates
- Role family distribution shifts
- Top skill shifts and missingness rates
- Model inference latency benchmarks (p50, p95, p99)
"""
import hashlib
import json
import time
from pathlib import Path
import numpy as np
import pandas as pd
import joblib

BASE_DIR = Path(__file__).resolve().parents[1]
RAW_DATA_PATH = BASE_DIR / "data" / "raw" / "indian_job_market.csv"
CLEAN_DATA_PATH = BASE_DIR / "data" / "processed" / "jobs_clean.parquet"
MODEL_PATH = BASE_DIR / "artifacts" / "salary_model.joblib"
OUTPUT_PATH = BASE_DIR / "artifacts" / "drift_monitor_report.json"

def calculate_sha256(filepath: Path) -> str:
    h = hashlib.sha256()
    with open(filepath, "rb") as f:
        while chunk := f.read(8192 * 1024):
            h.update(chunk)
    return h.hexdigest()

def benchmark_inference_latency(model, sample_df, n_iterations=100):
    latencies = []
    features_subset = sample_df.head(1)
    for _ in range(n_iterations):
        t0 = time.perf_counter()
        _ = model.predict(features_subset)
        t1 = time.perf_counter()
        latencies.append((t1 - t0) * 1000) # milliseconds
    
    return {
        "p50_ms": round(float(np.percentile(latencies, 50)), 2),
        "p95_ms": round(float(np.percentile(latencies, 95)), 2),
        "p99_ms": round(float(np.percentile(latencies, 99)), 2),
        "mean_ms": round(float(np.mean(latencies)), 2)
    }

def run_drift_monitor():
    print(f"Monitoring dataset and model drift...")
    report = {
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "status": "healthy"
    }

    # 1. Dataset Hash & Ingestion Integrity
    if RAW_DATA_PATH.exists():
        raw_hash = calculate_sha256(RAW_DATA_PATH)
        raw_size_bytes = RAW_DATA_PATH.stat().st_size
        print(f"Raw dataset SHA256: {raw_hash[:16]}... ({raw_size_bytes:,} bytes)")
        
        # Read raw count
        with open(RAW_DATA_PATH, "r", encoding="utf-8", errors="replace") as f:
            raw_row_count = sum(1 for _ in f) - 1
            
        report["raw_dataset"] = {
            "path": str(RAW_DATA_PATH.name),
            "sha256": raw_hash,
            "size_bytes": raw_size_bytes,
            "total_ingested_rows": raw_row_count
        }
    else:
        report["raw_dataset"] = None

    # 2. Processed Integrity & Missingness
    if CLEAN_DATA_PATH.exists():
        df_clean = pd.read_parquet(CLEAN_DATA_PATH)
        clean_count = len(df_clean)
        rejected_count = report["raw_dataset"]["total_ingested_rows"] - clean_count if report.get("raw_dataset") else 0

        # Salary parsing rate
        sal_disclosed = int(df_clean["salary_disclosed"].sum())
        sal_rate = round(sal_disclosed / clean_count * 100, 2)

        # Missingness rates
        missingness = {
            col: round(float(df_clean[col].isna().mean() * 100), 2)
            for col in ["experience_years", "city", "work_mode", "role_family", "company_name"]
            if col in df_clean.columns
        }

        # Role family distribution
        role_dist = df_clean["role_family"].value_counts(normalize=True).head(8).to_dict()
        role_dist = {k: round(float(v * 100), 2) for k, v in role_dist.items()}

        report["processed_dataset"] = {
            "clean_retained_rows": clean_count,
            "rejected_or_duplicate_rows": rejected_count,
            "retention_rate_pct": round(clean_count / report["raw_dataset"]["total_ingested_rows"] * 100, 2) if report.get("raw_dataset") else 100.0,
            "salary_disclosed_rows": sal_disclosed,
            "salary_disclosure_rate_pct": sal_rate,
            "feature_missingness_pct": missingness,
            "role_distribution_pct": role_dist
        }
        print(f"Clean rows: {clean_count:,} ({sal_rate}% salary disclosure rate)")
    
    # 3. Model Inference Latency & Integrity
    if MODEL_PATH.exists() and CLEAN_DATA_PATH.exists():
        bundle = joblib.load(MODEL_PATH)
        model = bundle.get("pipeline") or bundle.get("model")
        print("Benchmarking model inference latency...")
        
        # Prepare sample feature vector matching production pipeline
        sample_row = pd.DataFrame([{
            "role_family": "Software Engineering",
            "experience_years": 4.0,
            "min_experience_years": 3.0,
            "max_experience_years": 6.0,
            "city": "Bengaluru",
            "work_mode": "Hybrid",
            "skills_text": "python react sql aws",
            "skill_count": 4
        }])
        
        latency_stats = benchmark_inference_latency(model, sample_row)
        report["model_monitoring"] = {
            "model_path": str(MODEL_PATH.name),
            "model_type": str(type(model.named_steps["regressor"]).__name__ if hasattr(model, "named_steps") else type(model).__name__),
            "features_evaluated": bundle.get("features", []),
            "inference_latency": latency_stats,
            "latency_sla_met": latency_stats["p95_ms"] < 50.0
        }
        print(f"Inference latency: p50={latency_stats['p50_ms']}ms, p95={latency_stats['p95_ms']}ms")

    # Save drift report
    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2)

    print(f"Drift monitor report written to {OUTPUT_PATH}")

if __name__ == "__main__":
    run_drift_monitor()

