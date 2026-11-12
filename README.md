# AI Job Market Analytics & Salary Prediction System

An end-to-end data science and machine learning application that converts Indian job-posting data into labour-market intelligence and compensation estimates.

Built with **Python + Flask**, **scikit-learn**, **React + Vite + TypeScript**, and **Recharts**.

---

## Architecture Overview

```
Indian job postings CSV (97,929 rows)
        │
        ▼
Data Ingestion & Schema Audit (inspect_dataset.py)
        │
        ▼
Validation & Data Quality Report (data_quality_report.json)
        │
        ▼
Cleaning & Normalization (run_pipeline.py)
        ├──► jobs_clean.parquet (84,842 retained records)
        ├──► job_skills.parquet (751,404 relations, 43,465 canonical skills)
        └──► job_market.db (SQLite database with indexed relations)
        │
        ├──────────────────────────────┬──────────────────────────────┐
        ▼                              ▼                              ▼
Analytics Service              Offline ML Training            Skill Gap Engine
(Aggregations & Filters)      (HistGradientBoosting)       (Prevalence & Co-occurrence)
        │                              │                              │
        └──────────────────────────────┴──────────────────────────────┘
                                       │
                                       ▼
                              Flask REST API (Port 5000)
                                       │
                                       ▼ HTTP/JSON
                              React + Vite Frontend (Port 5173)
```

---

## Key Features

1. **Market Intelligence Dashboard**:
   - 84,842 clean, deduplicated job postings from the Indian job market snapshot.
   - Dynamic cross-filtering by role family, city, and experience level.
   - Visual distribution of disclosed annual salary brackets (LPA) and experience bands.
   - Geographic demand ranking across Indian metro hubs (Bengaluru, Delhi-NCR, Mumbai, Pune, Hyderabad, etc.).
2. **Salary Prediction Engine**:
   - Supervised regression using `HistGradientBoostingRegressor` wrapped with `TransformedTargetRegressor(func=log1p)`.
   - Input profile: Role family, experience in years, location, work arrangement, and canonical skills.
   - Outputs annual INR compensation, LPA breakdown, and an empirical **80% prediction interval** (`[lower, upper]`).
   - Contextual comparison with role and city median benchmarks.
3. **Skill Intelligence & Gap Analyzer**:
   - Extraction of 43,465 canonical skill entities across roles.
   - Frequency-based skill recommendation ranking.
   - Weighted Skill Coverage Score (%) benchmarking user skills against market demand.
   - High, Medium, and Low priority skill acquisition suggestions.
   - Skill co-occurrence discovery pairs.
4. **Live Job Explorer**:
   - Full-text search across job titles and employers.
   - Paginated listings with parsed salary bounds, required experience, work mode, and ratings.
   - Multi-parameter sorting and filtering.
5. **Methodology & Model Card**:
   - Transparent evaluation report detailing held-out test performance and bias disclosures.

---

## Model Performance Benchmark (Held-out 20% Test Set)

| Model Architecture | Test MAE (LPA) | Median Abs Error (LPA) | RMSE (LPA) | R² Score | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Median Baseline (Dummy)** | ₹4.82 LPA | ₹2.25 LPA | ₹9.55 LPA | 0.0000 | Baseline |
| **Ridge Regression (Linear + L2)** | ₹3.15 LPA | ₹1.32 LPA | ₹7.92 LPA | 0.3120 | Linear Model |
| **HistGradientBoostingRegressor** | **₹2.94 LPA** | **₹1.05 LPA** | **₹7.36 LPA** | **0.4071** | **Selected Production Model** |

- **Empirical 80% Residual Interval**: `[-40.8%, +72.8%]`
- **Target Variable**: `salary_midpoint_inr_annual = (salary_min + salary_max) / 2.0`
- **Target Leakage Prevention**: Salary bounds, currency, and raw compensation text are strictly isolated from model training features.

---

## Repository Structure

```
├── README.md
├── docker-compose.yml
├── .gitignore
├── .env.example
├── backend/
│   ├── config.py
│   ├── run.py
│   ├── requirements.txt
│   ├── pytest.ini
│   ├── Dockerfile
│   ├── data/
│   │   ├── raw/
│   │   │   └── indian_job_market.csv
│   │   └── processed/
│   │       ├── jobs_clean.parquet
│   │       ├── job_skills.parquet
│   │       ├── job_market.db
│   │       └── data_quality_report.json
│   ├── artifacts/
│   │   ├── salary_model.joblib
│   │   ├── model_metadata.json
│   │   └── evaluation_report.json
│   ├── scripts/
│   │   ├── inspect_dataset.py
│   │   ├── run_pipeline.py
│   │   ├── train_salary_model.py
│   │   └── evaluate_model.py
│   ├── notebooks/
│   │   ├── 01_data_audit.ipynb
│   │   ├── 02_cleaning_and_eda.ipynb
│   │   ├── 03_salary_modeling.ipynb
│   │   └── 04_skill_analysis.ipynb
│   ├── app/
│   │   ├── __init__.py
│   │   ├── extensions.py
│   │   ├── api/ (health, analytics, predictions, skills, jobs)
│   │   ├── services/ (analytics_service, prediction_service, recommendation_service, job_service)
│   │   ├── models/ (database_models)
│   │   └── utils/ (errors, pagination)
│   └── tests/ (test_data_pipeline, test_prediction_service, test_recommendations, test_api)
└── frontend/
    ├── package.json
    ├── vite.config.ts
    ├── Dockerfile
    └── src/
        ├── App.tsx
        ├── main.tsx
        ├── index.css
        ├── api/ (analytics, predictions, skills, jobs, client)
        ├── components/ (layout, cards, common)
        └── pages/ (DashboardPage, SalaryPredictorPage, SkillsPage, SkillGapPage, JobExplorerPage, AboutPage)
```

---

## Quickstart Guide (Local Windows Environment)

### Prerequisites
- Python 3.11+
- Node.js LTS (v20+) & npm

### 1. Backend Setup & Pipeline Execution

```powershell
cd backend

# Create and activate virtual environment
python -m venv .venv
.\.venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt

# Inspect raw dataset
python scripts/inspect_dataset.py

# Run cleaning & normalization pipeline
python scripts/run_pipeline.py

# Train the ML salary regression model
python scripts/train_salary_model.py

# Run evaluation & test suite
python scripts/evaluate_model.py
pytest
```

### 2. Start the Backend API

```powershell
python run.py
```
*API will start on `http://127.0.0.1:5000/api`*

### 3. Start the React Frontend

In a new terminal window:
```powershell
cd frontend
npm install
npm run dev
```
*Frontend will be live at `http://localhost:5173`*

---

## API Documentation

- `GET /api/health` - Service and model health status
- `GET /api/analytics/summary` - Aggregate metrics (postings, salary median, disclosure rate)
- `GET /api/analytics/roles` - Role demand breakdown and volume
- `GET /api/analytics/locations` - City and state distribution
- `GET /api/analytics/salaries` - Disclosed salary brackets (LPA)
- `GET /api/analytics/experience` - Seniority band breakdown
- `GET /api/analytics/skills` - Top canonical skills and prevalence
- `GET /api/analytics/filter-options` - Filter dropdown options
- `POST /api/predictions/salary` - Predict salary for candidate profile
- `GET /api/predictions/metadata` - Active model metadata & metrics
- `POST /api/skills/recommend` - Skill-gap analysis and prioritized missing skills
- `GET /api/jobs` - Paginated job listings with multi-filter queries
- `GET /api/jobs/<job_id>` - Single job posting details

---

## Responsible Use & Limitations

1. **Statistical Estimate**: Predictions reflect patterns in the salary-disclosed subset (~37.6% of records) of the Indian job market snapshot. They are intended for career exploration and are not guaranteed salary benchmarks.
2. **Disclosure Selection Bias**: Companies that disclose pay ranges publicly on job portals may differ in compensation strategy from organizations that negotiate privately.
3. **Skill Overlap Score**: Coverage metrics measure alignment with observed posting mentions; they do not evaluate personal proficiency or guarantee interview shortlisting.

