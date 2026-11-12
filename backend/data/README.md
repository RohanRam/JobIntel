# Dataset Provenance and Data Organization

This directory stores data across the ingestion and transformation lifecycle.

## Subdirectories

- **`raw/`**: Contains the original, immutable source CSV downloaded from the [Indian Job Market Dataset 2025–2026](https://www.kaggle.com/datasets/shivamshrivastava21/indian-job-market-dataset-2025-2026).
  - Target file: `indian_job_market.csv`
  - Total raw records: 97,929 rows, 17 columns.

- **`interim/`**: Temporary stage for scratch dumps or intermediate staging during pipeline runs.

- **`processed/`**: Holds deterministic analytical Parquet datasets and SQLite metadata:
  - `jobs_clean.parquet`: 84,842 clean, deduplicated job postings with normalized titles, role families, parsed salary bounds, experience levels, and canonical skills.
  - `job_skills.parquet`: 751,404 normalized job-to-skill relation pairs mapping to 43,465 canonical skills.
  - `job_market.db`: SQLite database indexing jobs, skills, and relational tables for SQL querying.
  - `data_quality_report.json`: Comprehensive audit report logging duplicate counts, missingness rates, salary disclosure percentages, and distribution stats.

## Reproducibility

To re-run the end-to-end cleaning and feature extraction pipeline:
```powershell
python scripts/inspect_dataset.py
python scripts/run_pipeline.py
```

