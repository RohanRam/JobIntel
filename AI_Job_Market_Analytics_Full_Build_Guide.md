# AI Job Market Analytics & Salary Prediction System

## Complete Project Build Specification

**Project type:** Full-stack data science and machine-learning
application\
**Market focus:** Indian job postings\
**Frontend:** React + Vite\
**Backend:** Python + Flask\
**ML stack:** Pandas, NumPy, scikit-learn, XGBoost (optional), Joblib\
**Database:** PostgreSQL recommended; SQLite acceptable for local
development\
**Charts:** Recharts\
**Target platform:** Windows development environment

------------------------------------------------------------------------

# 1. Project Overview

## 1.1 Purpose

Build an end-to-end application that converts Indian job-posting data
into useful labour-market intelligence. The system should allow users
to:

1.  Explore job demand by role, skill, city, experience level, and
    company.
2.  Understand salary ranges and compensation patterns in India.
3.  Predict an estimated salary from a job profile.
4.  Identify skills commonly requested for a target role.
5.  Compare a user's current skills with the skills appearing in
    relevant job postings.
6.  Explore hiring trends and market segments through an interactive
    dashboard.
7.  Filter and inspect individual job postings from the dataset.

This is an analytics and career-support tool. It is not a recruitment
platform, does not guarantee that a job exists today, and should not be
presented as an official salary benchmark for all Indian employers.

## 1.2 Main modules

  -----------------------------------------------------------------------
  Module                              Responsibility
  ----------------------------------- -----------------------------------
  Data ingestion                      Load the original Indian
                                      job-postings CSV and record its
                                      provenance

  Data validation                     Check columns, types, missing
                                      values, duplicates, and invalid
                                      salary records

  Data preprocessing                  Normalize roles, cities,
                                      experience, skills, salary units,
                                      and posting dates

  Exploratory analytics               Produce demand, salary, geography,
                                      employer, and skills analysis

  Salary prediction                   Estimate salary from role,
                                      experience, location, skills, and
                                      other valid features

  Skill intelligence                  Identify common skills,
                                      co-occurrence, and role-specific
                                      skill demand

  Skill-gap analysis                  Compare user-entered skills with a
                                      target role's market skill profile

  Flask API                           Serve validated analytics,
                                      predictions, recommendations, and
                                      job listings

  React frontend                      Present the system through
                                      responsive dashboards and
                                      interactive forms

  Model monitoring                    Track model version, data drift
                                      indicators, and prediction quality
  -----------------------------------------------------------------------

## 1.3 Intended users

-   Students and fresh graduates exploring entry-level opportunities.
-   Professionals comparing roles, cities, and experience bands.
-   Career counsellors analysing skill demand.
-   Recruiters or analysts exploring aggregated hiring patterns.
-   Academic evaluators reviewing an end-to-end applied ML project.

## 1.4 Success criteria

The project is complete when:

-   A user can load and validate the Indian job dataset.
-   The cleaning pipeline is reproducible and produces documented
    outputs.
-   Dashboard metrics are calculated from the processed data rather than
    hardcoded.
-   Salary predictions work through a versioned model artifact and API.
-   The UI displays an uncertainty or confidence explanation, not just a
    single number.
-   Skill recommendations are traceable to observed job-posting
    frequency.
-   Invalid inputs and missing data are handled gracefully.
-   The application can be started locally on Windows using documented
    commands.
-   Tests cover the critical data, ML, API, and frontend behaviour.

------------------------------------------------------------------------

# 2. Scope and Important Data Assumptions

## 2.1 Recommended starting dataset

Starting source:

**Indian Job Market Dataset 2025--2026**\
Kaggle:
https://www.kaggle.com/datasets/shivamshrivastava21/indian-job-market-dataset-2025-2026

The source documentation associated with this dataset describes
approximately 97,929 raw postings, 17 columns, and salary disclosure for
roughly one-third of records. The documentation also describes fields
such as job title, employer, location, skills, experience, salary
bounds, currency, posting age, company rating, and review count.

These are source-reported details, not a substitute for inspecting the
exact CSV downloaded. The project must inspect the real file and adapt
to its actual schema. Do not assume all documented columns are present
or named exactly as expected.

## 2.2 Dataset limitations

Treat the dataset as a snapshot, not a complete census of Indian
employment.

Potential limitations include:

-   A single job portal may not represent the entire Indian market.
-   Salary disclosure is not random. Employers that disclose salary may
    differ from employers that do not.
-   A posting may contain multiple cities or locations in one field.
-   Salary strings may use different units or formats.
-   Posting age may be relative text such as "3 Days Ago", not a
    reliable calendar timestamp.
-   Skills may be noisy, abbreviated, duplicated, or embedded in free
    text.
-   Duplicate and reposted listings may remain.
-   Some fields may be missing or inconsistently formatted.
-   Company ratings and review counts may be sparse or biased.
-   The dataset may contain stale, scraped, or malformed listings.

Do not describe results as representative of every Indian employer.
State the dataset source, collection period if known, number of records
retained, and key limitations in the UI or project report.

## 2.3 Salary prediction target

For records with valid, comparable annual INR salary bounds:

`salary_midpoint_inr = (minimum_salary_inr + maximum_salary_inr) / 2`

Use the midpoint only when both bounds are valid and use the same
currency and time period. If the data provides only one valid bound,
decide on a separate documented policy rather than silently treating it
as a range midpoint.

Normalize monthly, daily, hourly, and annual amounts to a common annual
INR basis only when the pay period is known and conversion is
defensible. Do not guess the period from a number alone.

For model training:

-   Exclude undisclosed or unparseable salaries from the supervised
    salary target.
-   Keep those records for job-demand and skill-demand analytics.
-   Retain a flag indicating salary disclosure for market-transparency
    analysis.
-   Do not convert missing salary to zero.
-   Do not mix INR and USD without an explicit, date-aware currency
    conversion process. Prefer excluding non-INR rows from the initial
    INR model if reliable conversion metadata is unavailable.

## 2.4 Avoid target leakage

Do not use any feature that directly reveals the salary target. For
example:

-   `salary`, `minimumSalary`, `maximumSalary`, or a salary midpoint
    must not be model input features when predicting that same salary.
-   Any field derived from salary must be excluded from model inputs.
-   Do not use a transformed copy of the target as a feature.
-   Do not calculate category-level salary statistics from the full
    dataset before splitting the data. Fit all learned transformations
    on training data only.

------------------------------------------------------------------------

# 3. Technology Stack

## 3.1 Frontend

-   React
-   Vite
-   JavaScript or TypeScript (TypeScript recommended)
-   React Router
-   Axios
-   Recharts
-   React Hook Form (optional)
-   Zod (optional input validation)
-   CSS Modules, Tailwind CSS, or a consistent component system

## 3.2 Backend

-   Python 3.11 or a compatible supported version
-   Flask
-   Flask-CORS
-   Flask-SQLAlchemy or SQLAlchemy
-   Marshmallow or Pydantic for request validation
-   Pandas
-   NumPy
-   scikit-learn
-   XGBoost (optional after baseline evaluation)
-   Joblib
-   pytest

## 3.3 Data and storage

-   CSV for raw source input
-   Parquet for processed analytical datasets
-   PostgreSQL for a persistent multi-user deployment
-   SQLite for a simple local prototype
-   Alembic for schema migrations if using SQLAlchemy

## 3.4 Development tools

-   VS Code
-   Git
-   Python virtual environment
-   Node.js LTS
-   npm
-   JupyterLab or Jupyter Notebook
-   Postman or Bruno
-   PowerShell on Windows

------------------------------------------------------------------------

# 4. System Architecture

## 4.1 High-level flow

``` text
Indian job postings CSV
        |
        v
Data ingestion and schema audit
        |
        v
Validation and data-quality report
        |
        v
Cleaning and feature engineering
        |
        +-----------------------------+
        |                             |
        v                             v
Processed job table             Job-skill relation
        |                             |
        +---------------+-------------+
                        |
                        v
              Analytics data layer
                        |
             +----------+-----------+
             |                      |
             v                      v
      Dashboard queries       ML training pipeline
                                    |
                                    v
                           Model evaluation
                                    |
                                    v
                           Versioned model bundle
                                    |
                                    v
React UI <---- HTTP/JSON ----> Flask API
             |                      |
             v                      v
     Dashboard and forms      Analytics, prediction,
                              recommendations, jobs
```

## 4.2 Architectural principles

-   Keep raw source files immutable.
-   Keep data cleaning separate from API request handling.
-   Train models offline; do not retrain on every API request.
-   Version the model and preprocessing pipeline together.
-   Validate API input before running transformations.
-   Return consistent JSON response shapes.
-   Use pagination for job-listing endpoints.
-   Keep secrets and database credentials in environment variables.
-   Separate analytics from prediction logic.
-   Make all charts derive from backend data, not static sample values.

------------------------------------------------------------------------

# 5. Repository Structure

Use the following structure as the target project layout:

``` text
ai-job-market/
│
├── README.md
├── .gitignore
├── .env.example
├── docker-compose.yml
│
├── backend/
│   ├── requirements.txt
│   ├── run.py
│   ├── config.py
│   │
│   ├── data/
│   │   ├── raw/
│   │   │   └── indian_job_market.csv
│   │   ├── interim/
│   │   ├── processed/
│   │   │   ├── jobs_clean.parquet
│   │   │   ├── job_skills.parquet
│   │   │   └── data_quality_report.json
│   │   └── README.md
│   │
│   ├── artifacts/
│   │   ├── salary_model.joblib
│   │   ├── model_metadata.json
│   │   └── evaluation_report.json
│   │
│   ├── scripts/
│   │   ├── inspect_dataset.py
│   │   ├── run_pipeline.py
│   │   ├── train_salary_model.py
│   │   └── evaluate_model.py
│   │
│   ├── notebooks/
│   │   ├── 01_data_audit.ipynb
│   │   ├── 02_cleaning_and_eda.ipynb
│   │   ├── 03_salary_modeling.ipynb
│   │   └── 04_skill_analysis.ipynb
│   │
│   ├── app/
│   │   ├── __init__.py
│   │   ├── extensions.py
│   │   ├── api/
│   │   │   ├── __init__.py
│   │   │   ├── health.py
│   │   │   ├── analytics.py
│   │   │   ├── predictions.py
│   │   │   ├── skills.py
│   │   │   └── jobs.py
│   │   ├── services/
│   │   │   ├── analytics_service.py
│   │   │   ├── prediction_service.py
│   │   │   ├── recommendation_service.py
│   │   │   └── job_service.py
│   │   ├── schemas/
│   │   │   ├── prediction_schema.py
│   │   │   └── job_schema.py
│   │   ├── models/
│   │   │   └── database_models.py
│   │   └── utils/
│   │       ├── errors.py
│   │       └── pagination.py
│   │
│   └── tests/
│       ├── test_data_pipeline.py
│       ├── test_prediction_service.py
│       ├── test_api.py
│       └── test_recommendations.py
│
└── frontend/
    ├── package.json
    ├── vite.config.ts
    ├── index.html
    └── src/
        ├── main.tsx
        ├── App.tsx
        ├── api/
        │   ├── client.ts
        │   ├── analytics.ts
        │   ├── predictions.ts
        │   ├── skills.ts
        │   └── jobs.ts
        ├── components/
        │   ├── layout/
        │   ├── charts/
        │   ├── filters/
        │   ├── cards/
        │   └── common/
        ├── pages/
        │   ├── DashboardPage.tsx
        │   ├── SalaryPredictorPage.tsx
        │   ├── SkillsPage.tsx
        │   ├── JobExplorerPage.tsx
        │   └── AboutPage.tsx
        ├── hooks/
        ├── types/
        ├── utils/
        └── styles/
```

Do not commit the raw dataset, `.env`, database credentials, or large
model artifacts to a public repository unless licensing and repository
policy permit it. Document where the user must obtain the source
dataset.

------------------------------------------------------------------------

# 6. Windows Environment Setup

## 6.1 Prerequisites

Install:

-   Python 3.11+
-   Node.js LTS
-   Git
-   VS Code
-   PostgreSQL if using PostgreSQL

Verify installations in PowerShell:

``` powershell
python --version
node --version
npm --version
git --version
```

## 6.2 Create the project

``` powershell
mkdir ai-job-market
cd ai-job-market

mkdir backend
mkdir frontend
```

## 6.3 Create Python virtual environment

``` powershell
cd backend
py -3.11 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
```

If PowerShell blocks activation for the current session:

``` powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\.venv\Scripts\Activate.ps1
```

Create `backend/requirements.txt`:

``` text
Flask
Flask-Cors
Flask-SQLAlchemy
SQLAlchemy
python-dotenv
pandas
numpy
scikit-learn
joblib
pyarrow
matplotlib
seaborn
scipy
pytest
gunicorn
```

Install:

``` powershell
pip install -r requirements.txt
```

Install XGBoost only if it is selected after baseline experiments:

``` powershell
pip install xgboost
```

## 6.4 Create React application

From the repository root:

``` powershell
npm create vite@latest frontend -- --template react-ts
cd frontend
npm install
npm install axios react-router-dom recharts
npm install zod react-hook-form
npm run dev
```

------------------------------------------------------------------------

# 7. Dataset Acquisition and Audit

## 7.1 Download

Download the CSV from the Kaggle dataset page:

https://www.kaggle.com/datasets/shivamshrivastava21/indian-job-market-dataset-2025-2026

Place the extracted CSV under:

``` text
backend/data/raw/
```

Use a stable filename such as:

``` text
indian_job_market.csv
```

If using the Kaggle CLI, configure the Kaggle API token according to
Kaggle's current instructions, then run:

``` powershell
pip install kaggle
kaggle datasets download -d shivamshrivastava21/indian-job-market-dataset-2025-2026 -p data/raw --unzip
```

Run this from the backend directory. Do not commit the Kaggle token.

## 7.2 Inspect the real file first

Create `backend/scripts/inspect_dataset.py`:

``` python
from pathlib import Path
import pandas as pd

DATA_PATH = Path(__file__).resolve().parents[1] / "data" / "raw" / "indian_job_market.csv"

def main():
    if not DATA_PATH.exists():
        raise FileNotFoundError(f"Dataset not found: {DATA_PATH}")

    df = pd.read_csv(DATA_PATH, low_memory=False)

    print("\\nShape:")
    print(df.shape)

    print("\\nColumns:")
    print(df.columns.tolist())

    print("\\nDtypes:")
    print(df.dtypes)

    print("\\nFirst five rows:")
    print(df.head().to_string())

    print("\\nMissing values:")
    print(df.isna().sum().sort_values(ascending=False))

    print("\\nDuplicate rows:")
    print(df.duplicated().sum())

    print("\\nUnique counts:")
    print(df.nunique(dropna=True).sort_values(ascending=False))

if __name__ == "__main__":
    main()
```

Run:

``` powershell
python scripts/inspect_dataset.py
```

Save the audit output. If the filename or column names differ, update
the configuration rather than silently renaming fields in multiple
unrelated scripts.

## 7.3 Canonical internal schema

Map source columns to a stable internal schema after inspecting the
file.

  ------------------------------------------------------------------------------
  Canonical field                Meaning                 Expected type
  ------------------------------ ----------------------- -----------------------
  `job_id`                       Stable internal posting string
                                 identifier              

  `job_title`                    Original job title      string

  `company_name`                 Employer name           string

  `location_raw`                 Original location       string
                                 string                  

  `skills_raw`                   Original skill/tag      string
                                 string                  

  `experience_raw`               Original experience     string
                                 description             

  `min_experience_years`         Minimum requested       numeric
                                 experience              

  `max_experience_years`         Maximum requested       numeric
                                 experience              

  `salary_raw`                   Original salary text    string

  `salary_min`                   Parsed lower salary     numeric
                                 bound                   

  `salary_max`                   Parsed upper salary     numeric
                                 bound                   

  `salary_currency`              Salary currency         category

  `salary_period`                Annual, monthly, daily, category
                                 hourly, unknown         

  `salary_midpoint_inr_annual`   Normalized annual INR   numeric
                                 target                  

  `posted_age_raw`               Original posting-age    string
                                 field                   

  `company_rating`               Employer rating, if     numeric
                                 present                 

  `company_reviews_count`        Employer review count,  numeric
                                 if present              

  `city`                         Normalized city, if     string
                                 resolvable              

  `state`                        Normalized state, if    string
                                 resolvable              

  `work_mode`                    On-site, hybrid,        category
                                 remote, unknown         

  `salary_disclosed`             Whether usable salary   boolean
                                 data exists             
  ------------------------------------------------------------------------------

This is a target schema, not a claim that the CSV already contains all
these fields. Derived fields must be clearly labelled as derived.

## 7.4 Data-quality checks

At minimum, measure:

-   Total rows and columns.
-   Exact duplicate rows.
-   Duplicate postings by normalized title + company + location.
-   Missing values per source column.
-   Unique title, employer, location, and skill counts.
-   Salary parse success rate.
-   Salary disclosure rate.
-   Invalid salary ranges where minimum exceeds maximum.
-   Negative or implausible experience values.
-   Invalid company ratings.
-   Currency distribution.
-   Salary period distribution.
-   Number of records with ambiguous multi-city locations.

Write the results to `data/processed/data_quality_report.json`.

------------------------------------------------------------------------

# 8. Data Cleaning and Feature Engineering

## 8.1 Cleaning pipeline stages

Implement cleaning as a deterministic pipeline:

1.  Load raw CSV.
2.  Normalize column names.
3.  Map source fields to canonical names.
4.  Preserve original raw values.
5.  Trim whitespace and normalize empty strings.
6.  Remove exact duplicate rows.
7.  Parse experience.
8.  Parse salary text and numeric salary fields.
9.  Normalize currency and salary period.
10. Normalize title, company, city, state, and work mode where possible.
11. Parse and normalize skills.
12. Validate ranges and impossible values.
13. Generate stable job identifiers.
14. Export clean job table and skill relation.
15. Generate a quality report.

Never overwrite the raw CSV.

## 8.2 Column-name normalization

``` python
import re

def normalize_column_name(name: str) -> str:
    name = str(name).strip()
    name = re.sub(r"([a-z0-9])([A-Z])", r"\\1_\\2", name)
    name = re.sub(r"[^a-zA-Z0-9]+", "_", name)
    return name.strip("_").lower()
```

## 8.3 Experience parsing

Experience fields may appear as:

-   `2-4 Yrs`
-   `3 Years`
-   `Fresher`
-   `0-1 years`
-   Missing or unknown

Store minimum and maximum years separately. For a range such as 2--4,
the midpoint may be used as an additional modelling feature, but
preserve the bounds too.

Rules:

-   `Fresher` can map to 0 years if the dataset meaning is clear.
-   Unknown experience must remain missing or explicitly categorized as
    unknown.
-   Do not turn unknown into zero.
-   Reject negative values.
-   Cap or flag implausible values for review; do not silently clip them
    without recording the rule.

## 8.4 Salary parsing and normalization

Salary fields can include text such as:

-   `3-5 Lacs PA`
-   `₹8,00,000 - ₹12,00,000 a year`
-   `₹30,000 a month`
-   `Not disclosed`
-   `From 5 LPA`

A robust salary parser should return structured values:

``` python
{
    "salary_min": 300000,
    "salary_max": 500000,
    "currency": "INR",
    "period": "annual",
    "parse_status": "success",
    "source_text": "3-5 Lacs PA"
}
```

Recommended salary parsing approach:

-   Prefer reliable numeric minimum and maximum columns if they are
    confirmed to have consistent units.
-   Use the original salary string to validate the numeric fields.
-   Normalize Indian number formats, commas, lakh/lac, LPA, per annum,
    monthly, and hourly expressions.
-   Store currency and period explicitly.
-   Keep `parse_status` values such as `success`, `missing`,
    `ambiguous`, and `invalid`.
-   Do not infer an annual amount when the period is unknown.
-   Do not treat "from" salary as a two-sided range.
-   Do not mix stipend and full-time salary without an employment-type
    distinction.

For known periods:

``` text
annual salary  -> annual amount
monthly salary -> monthly amount * 12
daily salary   -> daily amount * documented workdays per year
hourly salary  -> hourly amount * documented hours per year
```

Daily and hourly annualization requires an explicit assumption. If the
source does not provide working days or hours, either exclude those
records from annual salary modelling or document the chosen convention
and run a sensitivity analysis.

## 8.5 Skill normalization

Create a skill dictionary that maps spelling variants and aliases to a
canonical skill.

Examples:

  Raw variants                         Canonical skill
  ------------------------------------ ------------------
  `js`, `javascript`                   JavaScript
  `py`, `python3`                      Python
  `ml`, `machine learning`             Machine Learning
  `react.js`, `reactjs`                React
  `aws cloud`, `amazon web services`   AWS

Important rules:

-   Do not use naive substring matching. For example, `R` should not
    match every word containing the letter r.
-   Normalize case and whitespace.
-   Remove empty tokens and duplicates.
-   Preserve the original raw skills string.
-   Keep a versioned skill dictionary.
-   Allow a manually reviewed alias list to evolve over time.

Suggested output relation:

  job_id   skill
  -------- ------------------
  J00001   Python
  J00001   SQL
  J00001   Machine Learning
  J00002   React
  J00002   JavaScript

This one-to-many relation supports skill frequency and co-occurrence
analysis.

## 8.6 Location normalization

Standardize city and state names where the source provides enough
evidence.

Examples of alias handling:

-   Bangalore → Bengaluru
-   Gurgaon → Gurugram
-   Bombay → Mumbai

Do not infer a city from a company name. Do not assume every posting
mentioning multiple cities is a separate posting. Keep the raw location
string and, if necessary, create a separate location relation for
multi-location listings.

## 8.7 Job title normalization

Keep:

-   `job_title_raw`
-   `job_title_normalized`
-   `role_family`

A role-family mapping may include:

-   Software Engineering
-   Data Analytics
-   Data Science
-   Artificial Intelligence / Machine Learning
-   Product Management
-   Business Analysis
-   Sales
-   Marketing
-   Human Resources
-   Finance
-   Operations
-   Customer Support
-   Design
-   Other / Unclassified

Use deterministic rules or a reviewed mapping for the first version. If
an NLP classifier is introduced later, evaluate it separately and retain
the original title.

------------------------------------------------------------------------

# 9. Exploratory Data Analysis

Perform EDA before training a model. Every analysis should include a
count and a clear denominator.

## 9.1 Overall market overview

Calculate:

-   Total postings.
-   Unique companies.
-   Unique job titles.
-   Unique cities and states.
-   Salary-disclosed postings.
-   Salary disclosure percentage.
-   Median and interquartile salary for valid annual INR salaries.
-   Experience distribution.
-   Work-mode distribution, if available.

## 9.2 Role demand

Questions:

-   Which job titles appear most often?
-   Which role families have the most postings?
-   What proportion of postings are entry-level?
-   Which roles have the highest disclosed salary median?
-   Which roles have the widest salary spread?

Visuals:

-   Top 10--20 roles bar chart.
-   Role family distribution.
-   Role family by experience heatmap.
-   Salary distribution by role family.

## 9.3 Location analysis

Questions:

-   Which cities have the most postings?
-   Which states have the most postings?
-   How do salary distributions differ by city?
-   Which cities have more entry-level opportunities?
-   How does remote work appear across role families?

Visuals:

-   Top cities bar chart.
-   State-level posting counts.
-   City versus median salary chart.
-   City × role family heatmap.

Avoid comparing a city with a very small sample to one with thousands of
listings without displaying sample counts.

## 9.4 Skill demand

Calculate:

-   Most frequently requested skills.
-   Skill frequency by role family.
-   Skill frequency by experience band.
-   Skill co-occurrence pairs.
-   Skill demand in entry-level postings.
-   Skills associated with higher observed salary, with sample-size
    caveats.

Visuals:

-   Top skills bar chart.
-   Skill demand by role heatmap.
-   Skill co-occurrence matrix.
-   Demand versus salary-premium scatter plot.

## 9.5 Salary analysis

Calculate:

-   Salary distribution.
-   Median and quartiles by role.
-   Median and quartiles by city.
-   Salary by experience band.
-   Salary disclosure rate by role and location.
-   Salary range width.
-   Outlier rates.

Use median and quantiles as primary summary statistics because salary
distributions are often skewed. Always show sample size.

## 9.6 Statistical tests

Possible analyses:

-   Spearman correlation between experience and salary.
-   Kruskal--Wallis test for salary differences across multiple role
    groups.
-   Mann--Whitney U for two-group comparisons.
-   Chi-square test for categorical relationships where assumptions are
    met.
-   Bootstrap confidence intervals for median salary differences.

Statistical significance does not automatically imply practical
importance. Report effect sizes and sample sizes where possible.

------------------------------------------------------------------------

# 10. Salary Prediction Model

## 10.1 Problem definition

This is a supervised regression task.

**Target:** annualized INR salary midpoint for postings with valid
salary data.

Potential input features:

-   Normalized role title or role family.
-   Minimum experience.
-   Maximum experience.
-   Experience midpoint.
-   City or state.
-   Work mode, if available.
-   Canonical skills.
-   Employment type, if available and reliable.
-   Company rating only if its coverage and validity justify using it.

Avoid company name in the first model unless there is a strong reason.
Company identity can cause memorization and poor generalization to
unseen employers.

## 10.2 Split strategy

Do not randomly split near-duplicate postings into train and test sets.

Recommended:

-   Deduplicate before splitting.
-   Group by company or normalized job fingerprint where practical.
-   Use a temporal split if a reliable posting date exists.
-   Otherwise use GroupShuffleSplit or GroupKFold by employer or posting
    group.
-   Keep a final untouched test set.
-   Fit encoders and preprocessing only on training folds.

## 10.3 Baseline models

Train and compare:

1.  Median salary baseline.
2.  Linear Regression with suitable preprocessing.
3.  Ridge Regression.
4.  Random Forest Regressor.
5.  HistGradientBoostingRegressor.
6.  XGBoost Regressor, optional.

Start with interpretable baselines. Do not select a complex model solely
because it produces a higher training score.

## 10.4 Preprocessing pipeline

Use scikit-learn `Pipeline` and `ColumnTransformer`.

Suggested approach:

-   Numeric features: median imputation; optionally add missingness
    indicators.
-   Low-cardinality categorical features: OneHotEncoder with
    `handle_unknown="ignore"`.
-   High-cardinality titles: consolidate into role families or use
    carefully validated text features.
-   Skills: MultiLabelBinarizer or a custom transformer that emits a
    sparse multi-hot matrix.
-   Text: TF-IDF for job title only if it improves validation
    performance and is tested for leakage.

The preprocessing object must be saved with the estimator. The API
should not independently reimplement training transformations.

## 10.5 Evaluation metrics

Report:

-   MAE (Mean Absolute Error) in INR.
-   Median Absolute Error.
-   RMSE.
-   R².
-   Error by role family.
-   Error by experience band.
-   Error by city.
-   Error by salary range.
-   Prediction coverage and out-of-distribution rate.

MAE is especially useful because it is expressed in the same unit as
salary. R² alone is not sufficient.

## 10.6 Log transformation

Salary is often right-skewed. Experiment with predicting:

`log1p(salary_midpoint_inr_annual)`

If using a transformed target, invert predictions with `expm1`. Evaluate
final metrics in INR, not only on the transformed scale.

## 10.7 Prediction intervals

A single prediction can create false precision. Prefer a prediction
range.

Possible approaches:

-   Quantile regression.
-   Conformal prediction using a held-out calibration set.
-   Empirical residual intervals by role or experience group, if
    adequately supported.

Do not label an arbitrary percentage band as a statistically valid
confidence interval. Explain the method and its limitations.

## 10.8 Model selection

Choose the model based on:

-   Test-set MAE.
-   Error consistency across segments.
-   Performance on unseen companies or groups.
-   Robustness to missing and uncommon categories.
-   Inference latency.
-   Ease of explaining limitations.

Store the model version, feature list, training date, dataset
fingerprint, split method, and evaluation metrics.

## 10.9 Model artifact

Save a single bundle containing:

-   Preprocessing pipeline.
-   Regressor.
-   Feature metadata.
-   Model version.
-   Target definition.
-   Training metadata.

Example metadata:

``` json
{
  "model_name": "salary_regressor",
  "model_version": "1.0.0",
  "target": "salary_midpoint_inr_annual",
  "currency": "INR",
  "period": "annual",
  "training_dataset": "Indian Job Market Dataset 2025-2026",
  "training_date": "YYYY-MM-DD",
  "metrics": {
    "mae_inr": null,
    "median_absolute_error_inr": null,
    "rmse_inr": null,
    "r2": null
  }
}
```

Replace null values with actual evaluation results after training. Never
invent model performance.

------------------------------------------------------------------------

# 11. Skill Recommendation and Skill-Gap Engine

## 11.1 Recommendation objective

Given a target role and a user's current skills, identify:

-   Skills commonly requested for that role.
-   Skills the user already has.
-   Skills missing from the user's profile.
-   Skills with strong demand in the selected market segment.
-   Related skills frequently appearing with the target role.

The first implementation should be a transparent frequency-based
recommender, not an unexplained generative AI system.

## 11.2 Role skill profile

For a selected role family:

1.  Filter relevant job postings.
2.  Count each canonical skill.
3.  Divide by the number of postings in that role group.
4.  Rank by prevalence.
5.  Optionally calculate a city- or experience-specific profile.

Example:

`skill_prevalence = postings_with_skill / postings_in_selected_role_group`

Use postings as the denominator, not total token count.

## 11.3 Skill-gap score

A simple weighted coverage score:

`coverage_score = sum(weights of user's matched skills) / sum(weights of all selected role skills)`

Possible weight:

`weight(skill) = skill_prevalence`

Convert to a percentage for display.

This score measures overlap with skills in the dataset. It is not a
probability of getting hired or a measure of actual proficiency.

## 11.4 Recommendation ranking

A useful initial ranking can combine:

-   Role-specific prevalence.
-   Entry-level prevalence if the user selects fresher.
-   City-specific prevalence if a city is selected.
-   Co-occurrence with skills the user already has.
-   Recency only if reliable dates are available.

Keep the ranking formula documented and versioned.

## 11.5 Example response

``` json
{
  "role_family": "Data Analyst",
  "market_sample_size": 420,
  "user_skills": ["Excel", "Python"],
  "matched_skills": ["Excel", "Python"],
  "missing_skills": [
    {
      "skill": "SQL",
      "prevalence": 0.68,
      "priority": "high"
    },
    {
      "skill": "Power BI",
      "prevalence": 0.41,
      "priority": "medium"
    }
  ],
  "coverage_score": 0.52,
  "interpretation": "Coverage is based on observed skill mentions in the selected job-posting sample."
}
```

The values above are illustrative only. The application must calculate
them from the processed dataset.

------------------------------------------------------------------------

# 12. Database Design

For a production-oriented implementation, use PostgreSQL. For an initial
local build, processed Parquet files can serve analytics while SQLite
stores application metadata.

## 12.1 Suggested tables

### `jobs`

  Column                       Type             Notes
  ---------------------------- ---------------- ----------------------
  job_id                       VARCHAR / UUID   Primary key
  job_title_raw                TEXT             Original title
  job_title_normalized         TEXT             Normalized title
  role_family                  TEXT             Derived role group
  company_name                 TEXT             Employer
  location_raw                 TEXT             Original location
  city                         TEXT             Normalized city
  state                        TEXT             Normalized state
  min_experience_years         NUMERIC          Nullable
  max_experience_years         NUMERIC          Nullable
  salary_min_inr_annual        NUMERIC          Nullable
  salary_max_inr_annual        NUMERIC          Nullable
  salary_midpoint_inr_annual   NUMERIC          Nullable
  salary_disclosed             BOOLEAN          Disclosure indicator
  work_mode                    TEXT             Nullable
  posted_age_raw               TEXT             Original age string
  source_name                  TEXT             Dataset source

### `skills`

  Column           Type        Notes
  ---------------- ----------- ------------------------
  skill_id         BIGSERIAL   Primary key
  canonical_name   TEXT        Unique canonical skill

### `job_skills`

  Column     Type             Notes
  ---------- ---------------- -------------
  job_id     VARCHAR / UUID   Foreign key
  skill_id   BIGINT           Foreign key

Composite primary key: `(job_id, skill_id)`.

### `model_registry`

  Column          Type
  --------------- -----------
  model_id        BIGSERIAL
  model_name      TEXT
  model_version   TEXT
  artifact_path   TEXT
  trained_at      TIMESTAMP
  metrics_json    JSONB
  active          BOOLEAN

### `data_pipeline_runs`

Store run ID, start/end time, source file hash, rows read, rows
retained, errors, and output locations.

## 12.2 Indexes

Consider indexes on:

-   `jobs(role_family)`
-   `jobs(city)`
-   `jobs(state)`
-   `jobs(salary_midpoint_inr_annual)`
-   `jobs(min_experience_years)`
-   `job_skills(skill_id)`
-   `job_skills(job_id)`

Add indexes based on query patterns and query plans rather than indexing
every column.

------------------------------------------------------------------------

# 13. Flask Backend

## 13.1 Application factory

Use Flask blueprints and an application factory. Keep routes thin; put
business logic in services.

Example `backend/app/__init__.py`:

``` python
from flask import Flask
from flask_cors import CORS
from .api.health import health_bp
from .api.analytics import analytics_bp
from .api.predictions import predictions_bp
from .api.skills import skills_bp
from .api.jobs import jobs_bp

def create_app(config_object=None):
    app = Flask(__name__)

    if config_object:
        app.config.from_object(config_object)

    CORS(
        app,
        resources={r"/api/*": {"origins": app.config.get("FRONTEND_ORIGIN", "http://localhost:5173")}}
    )

    app.register_blueprint(health_bp, url_prefix="/api")
    app.register_blueprint(analytics_bp, url_prefix="/api/analytics")
    app.register_blueprint(predictions_bp, url_prefix="/api/predictions")
    app.register_blueprint(skills_bp, url_prefix="/api/skills")
    app.register_blueprint(jobs_bp, url_prefix="/api/jobs")

    return app
```

Example `backend/run.py`:

``` python
from app import create_app

app = create_app()

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)
```

Disable debug mode in production.

## 13.2 API conventions

Base URL:

`http://localhost:5000/api`

Use:

-   JSON request and response bodies.
-   Consistent error objects.
-   HTTP status codes.
-   Pagination.
-   Input validation.
-   API versioning if the interface evolves.

Example error:

``` json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "experience_years must be between 0 and 50"
  }
}
```

## 13.3 Endpoint catalogue

### Health

`GET /api/health`

Response:

``` json
{
  "status": "ok",
  "service": "ai-job-market-api",
  "model_loaded": true,
  "dataset_loaded": true
}
```

### Dashboard summary

`GET /api/analytics/summary`

Response fields:

-   total postings
-   unique companies
-   unique locations
-   salary-disclosed postings
-   salary disclosure rate
-   median disclosed annual salary
-   dataset snapshot or ingestion date

### Demand by role

`GET /api/analytics/roles?limit=15`

Returns role name, posting count, share, and salary sample count where
available.

### Demand by location

`GET /api/analytics/locations?level=city&limit=15`

Allowed levels should be validated, such as `city` or `state`.

### Salary analytics

`GET /api/analytics/salaries?group_by=role_family`

Supported grouping fields should be allow-listed. Return median,
quartiles, count, and disclosure rate.

### Skill demand

`GET /api/analytics/skills?role_family=Data%20Analyst&limit=20`

Returns canonical skill, posting count, prevalence, and sample size.

### Salary prediction

`POST /api/predictions/salary`

Request:

``` json
{
  "job_title": "Data Analyst",
  "role_family": "Data Analytics",
  "experience_years": 2,
  "city": "Bengaluru",
  "state": "Karnataka",
  "skills": ["Python", "SQL", "Excel"],
  "work_mode": "Hybrid"
}
```

Response:

``` json
{
  "predicted_salary_inr_annual": 850000,
  "prediction_interval": {
    "lower": 650000,
    "upper": 1050000,
    "method": "conformal_or_validated_interval_method"
  },
  "currency": "INR",
  "period": "annual",
  "model_version": "1.0.0",
  "limitations": [
    "Estimate is based on the salary-disclosed subset of the selected dataset.",
    "Actual offers vary by employer, role scope, and negotiation."
  ]
}
```

The example numbers are placeholders. The live API must return the
trained model output.

### Skill recommendations

`POST /api/skills/recommend`

Request:

``` json
{
  "target_role": "Data Analyst",
  "current_skills": ["Excel", "Python"],
  "city": "Bengaluru",
  "experience_band": "entry"
}
```

Response includes matched skills, missing skills, prevalence, ranking
explanation, and sample size.

### Job explorer

`GET /api/jobs?page=1&page_size=20&role_family=Data%20Analytics&city=Bengaluru`

Support validated filters:

-   role family
-   city
-   state
-   minimum experience
-   maximum experience
-   salary disclosed
-   salary range
-   skill
-   work mode

Return pagination metadata and only fields needed by the UI.

## 13.4 Prediction service responsibilities

The prediction service should:

1.  Load the model bundle once at application startup.
2.  Validate required fields and allowed ranges.
3.  Normalize input into the canonical feature schema.
4.  Apply the saved preprocessing pipeline.
5.  Predict salary.
6.  Generate a range if a validated interval method is available.
7.  Return model version and limitations.
8.  Log non-sensitive operational metadata.

Do not load the model from disk on every request.

## 13.5 API security and reliability

-   Restrict CORS to the frontend origin.
-   Validate all inputs.
-   Limit request body size.
-   Add rate limiting before public deployment.
-   Do not expose filesystem paths or stack traces.
-   Do not accept arbitrary SQL fragments or sort expressions.
-   Keep environment secrets outside source control.
-   Use HTTPS in deployment.
-   Log errors without storing unnecessary personal information.

------------------------------------------------------------------------

# 14. React Frontend

## 14.1 Pages

### A. Dashboard

Purpose: provide a high-level view of the Indian job market dataset.

Components:

-   KPI cards.
-   Top job roles.
-   Top hiring cities.
-   Salary distribution.
-   Experience distribution.
-   Most requested skills.
-   Salary disclosure indicator.
-   Filter bar for role, city, and experience.

All values must come from the Flask API.

### B. Salary Predictor

Inputs:

-   Job title or role family.
-   Experience in years.
-   City and state.
-   Skills.
-   Work mode, if supported by the model.

Output:

-   Predicted annual INR salary.
-   Estimated lower and upper range, if supported.
-   Model version.
-   Key limitations.
-   Short explanation of which input fields were used.

Add validation and loading/error states.

### C. Skill Intelligence

Features:

-   Search or select a target role.
-   Display top skills for that role.
-   Filter by city and experience band.
-   Display skill prevalence.
-   Display co-occurring skills.
-   Show sample size and dataset context.

### D. Skill Gap Analyzer

Inputs:

-   Target role.
-   Current skills.
-   Optional city and experience band.

Outputs:

-   Skill coverage score.
-   Matched skills.
-   Missing high-prevalence skills.
-   Ranked recommendations.
-   Explanation that the score is market overlap, not employability
    probability.

### E. Job Explorer

Features:

-   Search job title/company.
-   Filter by role, city, state, experience, salary disclosure, and
    skill.
-   Pagination.
-   Sort by supported fields.
-   Show salary only when disclosed and parsed.
-   Display original location/title where useful.

### F. About and Methodology

Explain:

-   Dataset source.
-   Data snapshot date, if known.
-   Cleaning steps.
-   Salary target definition.
-   Model type and version.
-   Evaluation metrics.
-   Limitations and responsible-use notes.

## 14.2 Suggested routes

``` text
/
  DashboardPage
/salary-predictor
  SalaryPredictorPage
/skills
  SkillsPage
/skill-gap
  SkillGapPage
/jobs
  JobExplorerPage
/about
  AboutPage
```

## 14.3 Frontend API client

Example `src/api/client.ts`:

``` typescript
import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5000/api",
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});
```

Example `src/api/predictions.ts`:

``` typescript
import { api } from "./client";

export type SalaryPredictionRequest = {
  job_title: string;
  role_family?: string;
  experience_years: number;
  city?: string;
  state?: string;
  skills: string[];
  work_mode?: string;
};

export async function predictSalary(payload: SalaryPredictionRequest) {
  const response = await api.post("/predictions/salary", payload);
  return response.data;
}
```

## 14.4 UI states

Every data-driven page must implement:

-   Loading state.
-   Empty state.
-   Error state.
-   Retry action.
-   Data freshness or snapshot label.
-   Responsive layout.
-   Accessible labels and keyboard navigation.

Do not use hardcoded chart arrays as if they were real analytics.

## 14.5 Visual design guidance

Recommended design direction:

-   Clean analytics dashboard.
-   Neutral background.
-   Strong typography hierarchy.
-   Consistent spacing and chart legends.
-   Limited use of accent colours.
-   Clear labels for INR, LPA, annual salary, and sample size.
-   Mobile-friendly cards and filters.
-   Avoid overloading the dashboard with too many charts.

Use one consistent salary convention in the UI. If showing LPA, convert
annual INR to lakhs per annum:

`salary_lpa = salary_inr_annual / 100000`

Label it clearly as LPA.

------------------------------------------------------------------------

# 15. Analytics Definitions

Use consistent definitions across API, UI, and documentation.

  -----------------------------------------------------------------------
  Metric                              Definition
  ----------------------------------- -----------------------------------
  Total postings                      Number of retained job records
                                      after documented deduplication

  Unique employers                    Distinct normalized employer names

  Unique cities                       Distinct non-null normalized city
                                      values

  Salary disclosure rate              Valid salary records divided by
                                      total retained postings

  Median salary                       Median of valid normalized annual
                                      INR salary targets

  Skill prevalence                    Postings containing skill divided
                                      by postings in selected group

  Role demand share                   Postings in role group divided by
                                      all postings

  Skill coverage                      Weighted matched-skill prevalence
                                      divided by total target-role skill
                                      weight
  -----------------------------------------------------------------------

Every chart should state the denominator or sample size where it
materially affects interpretation.

------------------------------------------------------------------------

# 16. Testing Strategy

## 16.1 Data pipeline tests

Test:

-   Missing input file.
-   Unexpected columns.
-   Duplicate removal.
-   Salary parser with annual, monthly, and missing salary examples.
-   Salary min greater than max.
-   Unknown currency.
-   Experience parser.
-   Skill alias normalization.
-   Empty skill strings.
-   Multi-city locations.
-   Stable output schema.

Use small synthetic fixtures for parser tests. Do not make unit tests
depend on downloading the full Kaggle dataset.

## 16.2 ML tests

Test:

-   Model bundle loads.
-   Required features are present.
-   Unknown categories are handled.
-   Missing optional values do not crash inference.
-   Predictions are finite and non-negative.
-   Prediction interval lower bound does not exceed upper bound.
-   Model metadata matches the deployed artifact.

Add a regression test for a small fixed set of synthetic inputs, with
tolerances appropriate to the model.

## 16.3 API tests

Test:

-   Health endpoint.
-   Summary endpoint.
-   Invalid query parameters.
-   Pagination boundaries.
-   Missing prediction fields.
-   Invalid experience values.
-   Unknown role categories.
-   Empty recommendation input.
-   Model-not-loaded behaviour.
-   Consistent error response structure.

## 16.4 Frontend tests

Recommended:

-   Vitest.
-   React Testing Library.
-   Playwright for end-to-end workflows.

Test the main user journey:

1.  Open dashboard.
2.  Load summary metrics.
3.  Navigate to salary predictor.
4.  Enter a valid profile.
5.  Submit prediction.
6.  View prediction and limitations.
7.  Open skill-gap page.
8.  Submit skills and target role.
9.  Review recommendations.
10. Filter job listings.

------------------------------------------------------------------------

# 17. Model and Data Monitoring

Even for a student or portfolio project, document how the system would
be monitored.

Track:

-   Dataset file hash.
-   Number of rows ingested.
-   Number of rows rejected.
-   Salary parsing success rate.
-   Missingness changes.
-   New or unseen role categories.
-   New skill terms.
-   Prediction latency.
-   API error rate.
-   Model version in each prediction response.

If new labelled data becomes available, evaluate the current model on it
before replacing the deployed model.

Do not automatically retrain on unreviewed data. Check licensing,
provenance, duplicates, and schema changes first.

------------------------------------------------------------------------

# 18. Reproducibility and Configuration

Create `.env.example`:

``` dotenv
FLASK_ENV=development
FLASK_DEBUG=1
API_HOST=127.0.0.1
API_PORT=5000
FRONTEND_ORIGIN=http://localhost:5173
DATABASE_URL=sqlite:///job_market.db
DATASET_PATH=data/raw/indian_job_market.csv
MODEL_PATH=artifacts/salary_model.joblib
```

Load actual values from `.env` using `python-dotenv`. Never commit the
real `.env`.

For repeatable experiments, record:

-   Python version.
-   Package versions.
-   Random seeds.
-   Dataset fingerprint.
-   Feature list.
-   Train/test split strategy.
-   Model hyperparameters.
-   Evaluation metrics.

Pin dependency versions in a production lock or fully pinned
requirements file after the environment is stable.

------------------------------------------------------------------------

# 19. Local Runbook

## 19.1 Run the data pipeline

From `backend` with the virtual environment active:

``` powershell
python scripts/inspect_dataset.py
python scripts/run_pipeline.py
```

The pipeline should create processed files under `data/processed/`.

## 19.2 Train the model

``` powershell
python scripts/train_salary_model.py
python scripts/evaluate_model.py
```

Training must fail with a clear message if there are too few valid
salary-labelled rows or required features are absent.

## 19.3 Start Flask

``` powershell
python run.py
```

Expected local API:

`http://localhost:5000/api/health`

## 19.4 Start React

Open another PowerShell terminal:

``` powershell
cd frontend
npm run dev
```

Expected local frontend:

`http://localhost:5173`

------------------------------------------------------------------------

# 20. Deployment Plan

## 20.1 Frontend

Build:

``` powershell
npm run build
```

Deploy the generated static assets to a static hosting provider.

Set:

`VITE_API_BASE_URL=https://your-api-domain.example/api`

## 20.2 Backend

Deploy Flask behind a production WSGI server such as Gunicorn on a Linux
host or a suitable managed Python platform.

Production checklist:

-   Debug disabled.
-   HTTPS enabled.
-   CORS restricted.
-   Environment variables configured.
-   Model artifact present.
-   Dataset or database available.
-   Health checks enabled.
-   Logs configured.
-   Backups configured if persistent data is stored.

## 20.3 Database

Use managed PostgreSQL for a public multi-user application. Run
migrations as part of deployment. Do not expose database credentials to
the browser.

------------------------------------------------------------------------

# 21. Development Milestones

## Phase 1 --- Project foundation

Deliverables:

-   Repository structure.
-   Python environment.
-   React application.
-   Flask application.
-   Health endpoint.
-   Environment configuration.

Acceptance criteria: frontend and backend start independently on
Windows.

## Phase 2 --- Dataset audit

Deliverables:

-   Raw dataset in the correct directory.
-   Schema audit script.
-   Data-quality report.
-   Canonical field mapping.

Acceptance criteria: actual CSV columns, types, nulls, and duplicates
are documented.

## Phase 3 --- Data engineering

Deliverables:

-   Cleaning pipeline.
-   Salary normalization.
-   Experience parsing.
-   Skill normalization.
-   Location normalization.
-   Processed Parquet files.
-   Job-to-skill relation.

Acceptance criteria: pipeline is repeatable and reports rejected or
ambiguous records.

## Phase 4 --- EDA and analytics

Deliverables:

-   EDA notebook.
-   Analytics service.
-   Summary and breakdown endpoints.
-   Chart-ready API responses.

Acceptance criteria: dashboard values are derived from processed data
and show sample sizes.

## Phase 5 --- Salary modelling

Deliverables:

-   Baseline model.
-   Candidate regression models.
-   Group-aware or temporal evaluation.
-   Model comparison report.
-   Saved model bundle.
-   Prediction service.

Acceptance criteria: held-out metrics are reported in INR and model
limitations are documented.

## Phase 6 --- Skill intelligence

Deliverables:

-   Canonical skill dictionary.
-   Skill frequency tables.
-   Role-specific skill profiles.
-   Co-occurrence analysis.
-   Skill-gap API.

Acceptance criteria: recommendations can be traced to observed posting
counts and prevalence.

## Phase 7 --- React application

Deliverables:

-   Dashboard.
-   Salary predictor.
-   Skill intelligence page.
-   Skill-gap analyzer.
-   Job explorer.
-   Methodology page.

Acceptance criteria: all pages use live API data and include loading,
empty, and error states.

## Phase 8 --- Testing and hardening

Deliverables:

-   Python unit and API tests.
-   Frontend tests.
-   End-to-end test.
-   Input validation.
-   Error handling.
-   Security review.

Acceptance criteria: critical workflows pass and invalid inputs do not
crash the application.

## Phase 9 --- Deployment and documentation

Deliverables:

-   Production configuration.
-   Deployment guide.
-   Model card.
-   Dataset provenance note.
-   Screenshots and project report.

Acceptance criteria: another developer can reproduce the application
using the documentation and permitted dataset access.

------------------------------------------------------------------------

# 22. Project Report and Demonstration

A strong final project submission should include:

1.  Abstract.
2.  Introduction and motivation.
3.  Problem statement.
4.  Objectives.
5.  Literature or existing-system review.
6.  Dataset source and limitations.
7.  System architecture.
8.  Data preprocessing methodology.
9.  Exploratory data analysis.
10. Feature engineering.
11. Model selection and evaluation.
12. Skill recommendation methodology.
13. API and frontend design.
14. Testing.
15. Results and discussion.
16. Limitations.
17. Future enhancements.
18. Conclusion.
19. References.

Demonstration sequence:

1.  Show dataset audit and quality report.
2.  Open the market dashboard.
3.  Filter by a role and city.
4.  Show salary distribution and salary disclosure.
5.  Submit a salary prediction.
6.  Explain that the prediction is an estimate, not an offer.
7.  Run a skill-gap analysis.
8.  Explore job listings.
9.  Show model evaluation metrics and limitations.

------------------------------------------------------------------------

# 23. Responsible Use and Limitations

-   Salary prediction is an estimate based on the observed
    salary-disclosed subset.
-   The dataset may underrepresent employers that do not disclose pay.
-   A role or city with few salary records should display a low-sample
    warning.
-   Do not infer a person's employability or hiring probability from
    skill overlap.
-   Do not use company ratings as a proxy for job quality without
    validation.
-   Do not expose personal data or scraped contact information.
-   Respect the dataset licence and Kaggle terms.
-   Keep source attribution in the application and report.
-   Do not claim real-time job availability unless the data pipeline is
    genuinely refreshed and validated.
-   Do not describe correlation as causation.

------------------------------------------------------------------------

# 24. Future Enhancements

After the core system is stable, consider:

-   Additional Indian job sources with compatible licensing.
-   Scheduled ingestion and dataset snapshots.
-   Time-series hiring trend analysis if reliable dates become
    available.
-   NLP-based job-title and skill extraction.
-   Semantic job search.
-   Explainable ML with SHAP, used carefully and correctly.
-   Role-specific salary models where sample sizes justify them.
-   Salary prediction by employment type.
-   State and city cost-of-living context from trustworthy public
    sources.
-   User accounts and saved searches.
-   Exportable PDF market reports.
-   Admin data-quality dashboard.
-   Model registry and controlled retraining workflow.

Do not add advanced features before the data pipeline and evaluation are
trustworthy.

------------------------------------------------------------------------

# 25. Final Definition of Done

The project can be considered complete when all of the following are
true:

-   [ ] Indian job dataset downloaded and source/licence recorded.
-   [ ] Actual CSV schema audited.
-   [ ] Raw data preserved unchanged.
-   [ ] Data cleaning pipeline runs reproducibly.
-   [ ] Salary normalization rules documented and tested.
-   [ ] Skills normalized into a job-skill relation.
-   [ ] Location and role-family normalization documented.
-   [ ] EDA outputs include counts and sample sizes.
-   [ ] Analytics API returns real processed-data metrics.
-   [ ] Salary model evaluated on a held-out group-aware or temporal
    split.
-   [ ] MAE, median absolute error, RMSE, and R² reported.
-   [ ] Model artifact includes preprocessing and metadata.
-   [ ] Prediction endpoint validates inputs and returns model version.
-   [ ] Skill recommendation logic is transparent and data-backed.
-   [ ] React dashboard consumes backend APIs.
-   [ ] Salary predictor works end-to-end.
-   [ ] Skill-gap analyzer works end-to-end.
-   [ ] Job explorer supports filters and pagination.
-   [ ] Loading, empty, and error states are implemented.
-   [ ] Backend and frontend tests pass.
-   [ ] Security and configuration checklist completed.
-   [ ] Setup, run, and deployment instructions are documented.
-   [ ] Dataset limitations are visible in the product and report.

------------------------------------------------------------------------

# 26. Reference Links

-   Kaggle dataset:
    https://www.kaggle.com/datasets/shivamshrivastava21/indian-job-market-dataset-2025-2026
-   Dataset analysis and documented schema:
    https://github.com/JasobantaParida/Indian-Job-Market-Intelligence
-   React documentation: https://react.dev/
-   Vite documentation: https://vite.dev/
-   Flask documentation: https://flask.palletsprojects.com/
-   Pandas documentation: https://pandas.pydata.org/docs/
-   scikit-learn documentation: https://scikit-learn.org/stable/
-   Recharts documentation: https://recharts.org/
-   PostgreSQL documentation: https://www.postgresql.org/docs/

------------------------------------------------------------------------

## Implementation rule

Build in the order described above. The most important dependency is the
actual dataset schema. Do not write final salary parsing, feature
mapping, or model training assumptions until `inspect_dataset.py` has
been run against the downloaded CSV. The data pipeline is the foundation
of the entire application; a polished frontend cannot compensate for
incorrect salary units, inconsistent categories, or invalid training
labels.
