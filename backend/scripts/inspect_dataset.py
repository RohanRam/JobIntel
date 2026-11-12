"""Dataset inspection and audit script.
Reads raw Indian job market dataset and outputs shape, columns, missing values, duplicates, and unique counts.
"""
from pathlib import Path
import json
import pandas as pd

DATA_PATH = Path(__file__).resolve().parents[1] / "data" / "raw" / "indian_job_market.csv"
OUTPUT_REPORT_PATH = Path(__file__).resolve().parents[1] / "data" / "processed" / "data_quality_report.json"

def main():
    if not DATA_PATH.exists():
        raise FileNotFoundError(f"Dataset not found: {DATA_PATH}")

    print(f"Reading dataset from {DATA_PATH}...")
    df = pd.read_csv(DATA_PATH, low_memory=False)

    print("\n=== DATASET SHAPE ===")
    print(f"Rows: {df.shape[0]}, Columns: {df.shape[1]}")

    print("\n=== COLUMNS ===")
    for idx, col in enumerate(df.columns, 1):
        print(f" {idx}. {col} ({df[col].dtype})")

    print("\n=== FIRST FIVE ROWS ===")
    print(df.head(3).to_string())

    print("\n=== MISSING VALUES ===")
    missing_series = df.isna().sum().sort_values(ascending=False)
    for col, count in missing_series.items():
        pct = (count / len(df)) * 100
        print(f" {col}: {count} ({pct:.2f}%)")

    print("\n=== DUPLICATE ROWS ===")
    exact_duplicates = int(df.duplicated().sum())
    print(f"Exact full-row duplicates: {exact_duplicates}")

    subset_dup_cols = [c for c in ["title", "companyName", "location"] if c in df.columns]
    if len(subset_dup_cols) == 3:
        subset_duplicates = int(df.duplicated(subset=subset_dup_cols).sum())
        print(f"Title + Company + Location duplicates: {subset_duplicates}")
    else:
        subset_duplicates = 0

    print("\n=== UNIQUE COUNTS ===")
    unique_series = df.nunique(dropna=True).sort_values(ascending=False)
    for col, count in unique_series.items():
        print(f" {col}: {count}")

    # Generate initial data quality report
    OUTPUT_REPORT_PATH.parent.mkdir(parents=True, exist_ok=True)
    report = {
        "raw_rows": int(df.shape[0]),
        "raw_columns": int(df.shape[1]),
        "columns": df.columns.tolist(),
        "exact_duplicates": exact_duplicates,
        "title_company_location_duplicates": subset_duplicates,
        "missing_counts": {k: int(v) for k, v in missing_series.items()},
        "unique_counts": {k: int(v) for k, v in unique_series.items()},
    }

    if "minimumSalary" in df.columns and "maximumSalary" in df.columns:
        sal_disclosed = df["minimumSalary"].notna() & df["maximumSalary"].notna()
        report["salary_disclosed_count"] = int(sal_disclosed.sum())
        report["salary_disclosed_pct"] = round(float(sal_disclosed.mean() * 100), 2)
        print(f"\nSalary disclosed rows: {report['salary_disclosed_count']} ({report['salary_disclosed_pct']}%)")

    with open(OUTPUT_REPORT_PATH, "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2)

    print(f"\nQuality summary saved to {OUTPUT_REPORT_PATH}")

if __name__ == "__main__":
    main()

