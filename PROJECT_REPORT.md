# Indian AI & Tech Job Market Analytics and Salary Prediction System
## Formal Project Report and Technical Architecture Document

---

### Executive Summary & Metadata
* **Project Name**: JobIntel AI — Indian Job Market Intelligence & Compensation Machine Learning System
* **Data Provenance**: Indian Job Market Dataset (2025–2026 Snapshot)
* **Raw Ingestion**: 97,929 rows, 17 columns (83.2 MB CSV)
* **Retained Clean Dataset**: 84,842 deduplicated rows, 14 canonical columns
* **Production Model**: `HistGradientBoostingRegressor` wrapped in `TransformedTargetRegressor(func=log1p, inverse_func=expm1)`
* **Evaluation Baseline (Held-out 20% Test Split)**: MAE ₹2.94 LPA, Median Absolute Error ₹1.05 LPA, $R^2 = 0.4071$
* **Stack**: Python 3.12, Flask, Pandas, Scikit-Learn, PyArrow, SQLite, React 19, TypeScript, Vite, Recharts, Lucide Icons

---

## 1. Abstract
The Indian information technology and digital enterprise sectors represent one of the world's fastest-evolving labor markets. However, high levels of information asymmetry, diverse compensation formats (LPA, monthly stipends, variable bonuses), and varying salary disclosure practices create challenges for job seekers, recruiters, and educational institutions. This project delivers an end-to-end, production-grade applied machine learning and data engineering system that processes 97,929 Indian job postings, cleans and indexes 84,842 unique opportunities, extracts canonical skills from 751,404 job-skill pairs, trains an empirical-interval-calibrated gradient-boosted regression model for compensation estimation, and provides a modern SaaS intelligence interface.

---

## 2. Introduction and Motivation
Compensation transparency in the Indian job market is historically bifurcated: formal multinational tech campuses disclose standardized salary bands, while high-growth startups and domestic enterprises frequently list positions as "Not disclosed" or "Confidential". Furthermore, the proliferation of specialized skills (e.g., PyTorch, Kubernetes, FastAPI, React Native) makes it difficult for candidates to understand the true market value of their technical portfolios. 

By building a deterministic, reproducible data cleaning pipeline and pairing it with supervised regression models and inferential statistical testing, this platform replaces conjecture with verifiable empirical evidence.

---

## 3. Problem Statement
Given unstructured and semi-structured online job postings from India (2025–2026):
1. **Deduplication and Hygiene**: Reliably purge exact duplicate listings and fingerprint duplicates across title variants, company names, and locations.
2. **Compensation Standardization**: Parse and normalize annual compensation bounds into annual Indian Rupees (INR) and Lakhs Per Annum (LPA), isolating valid disclosed bounds from non-disclosed rows without introducing downward target bias.
3. **Supervised Salary Prediction**: Predict expected annual compensation from structured features (role family, experience, geographic tier, work arrangement) and unstructured skill portfolios, providing calibrated 80% confidence prediction intervals.
4. **Skill Intelligence & Gap Identification**: Compute skill prevalence, co-occurrence matrices, and priority missing skills for career roadmapping.
5. **Interactive UI Delivery**: Present analytics through an accessible, high-performance, monochromatic modern SaaS interface.

---

## 4. Objectives
- **Data Engineering**: Process raw CSV into optimized Parquet tables and indexed SQLite database with sub-50ms query times.
- **Machine Learning**: Train a regressor achieving $< ₹3.0$ LPA Mean Absolute Error on held-out test data, outperforming linear and dummy baselines.
- **Statistical Rigor**: Conduct Spearman rank correlation, Kruskal-Wallis H-testing, and Mann-Whitney U-testing to validate compensation dynamics.
- **Full-Stack Application**: Deploy a responsive React + Vite + TypeScript frontend paired with a modular Flask REST API.
- **Operational Hygiene**: Provide automated data drift monitoring, automated test suites (pytest + Vitest), and Docker deployment configs.

---

## 5. Literature & Existing System Review
Commercial job platforms (e.g., LinkedIn, Naukri, Glassdoor, AmbitionBox) provide aggregated salary insights, but suffer from significant limitations:
- **Self-Reported Survey Bias**: Many platforms rely on self-reported employee salaries which lag current market cycles.
- **Black-Box Estimators**: Proprietary salary calculators rarely disclose test-split error metrics, target leakage protections, or confidence intervals.
- **Fragmented Skill Analytics**: Most platforms treat skills as disjointed tags rather than evaluating co-occurrence graphs.

Our system addresses these gaps by evaluating job-posting data directly, establishing public verification metrics (MAE, RMSE, $R^2$), and employing conformal/empirical error intervals.

---

## 6. Dataset Source and Limitations
* **Dataset Identifier**: `indian-job-market-dataset-2025.csv`
* **Raw Geometry**: 97,929 rows, 17 columns.
* **Observed Realities**:
  - Undisclosed salaries are encoded with `minimumSalary == 0.0` and `maximumSalary == 0.0` or `salary == 'Not disclosed'`.
  - Non-INR currencies (USD, EUR) appear in fewer than 0.1% of records.
  - Indian city names frequently employ historical aliases (`Bangalore` vs `Bengaluru`, `Gurgaon` vs `Gurugram`, `Bombay` vs `Mumbai`).
  - Experience is recorded as text ranges (e.g. `"2-5 Yrs"`) requiring regex extraction.
* **Known Limitations**:
  - **Disclosure Selection Bias**: The 37.6% of employers that disclose salaries may systematically differ in company size, industry, or compensation philosophy from confidential employers.
  - **Geographic Concentration**: Tier-1 technology corridors (Bengaluru, Hyderabad, Pune, Mumbai, NCR) dominate the dataset.

---

## 7. System Architecture
```
┌────────────────────────────────────────────────────────────────────────┐
│                        DATA PIPELINE ARCHITECTURE                      │
│                                                                        │
│   Raw CSV (97,929 rows) ──> run_pipeline.py ──> jobs_clean.parquet     │
│                                            ──> job_skills.parquet      │
│                                            ──> job_market.db (SQLite)  │
└────────────────────────────────────────────────────────────────────────┘
                                     │
                                     ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        MACHINE LEARNING ENGINE                         │
│                                                                        │
│   Clean Parquet ──> train_salary_model.py ──> salary_model.joblib      │
│   (31,900 rows)                               (HistGradientBoosting)   │
│                 ──> evaluate_model.py     ──> evaluation_report.json   │
│                 ──> monitor_drift.py      ──> drift_monitor_report.json│
└────────────────────────────────────────────────────────────────────────┘
                                     │
                                     ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        FLASK REST API BACKEND                          │
│                                                                        │
│   /api/health            /api/analytics/*       /api/predictions       │
│   /api/skills/*          /api/jobs                                     │
└────────────────────────────────────────────────────────────────────────┘
                                     │
                                     ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        REACT + VITE FRONTEND                           │
│                                                                        │
│   Fixed Left Sidebar  │ Top Header & Search │ Monochromatic Cards      │
│   Role Timeline       │ Instant AI Radar    │ Skill Gap Analyzer       │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 8. Data Preprocessing Methodology
1. **Deduplication**:
   - Exact deduplication: 247 identical rows removed.
   - Fingerprint deduplication: Canonical key combining `clean_title` + `company_name` + `city` removed 12,840 redundant reposts.
   - Retained rows: **84,842**.
2. **Geographic Normalization**:
   - Normalized 18+ Indian cities and standardized state mappings.
3. **Role Family Classification**:
   - Rule-based keyword hierarchy mapped 70.6% of listings to 12 major families (Software Engineering, Data Science & AI, Cloud & DevOps, Product Management, UI/UX, etc.).
4. **Compensation Parsing**:
   - Verified condition: `currency == 'INR'` and `50,000 <= min <= max <= 150,000,000`.
   - Midpoint calculated as `(min + max) / 2`.
   - Missing or non-disclosed salaries flagged as `salary_disclosed = False` and excluded from regression target rather than imputed to zero.

---

## 9. Exploratory Data Analysis & Inferential Statistics
Our statistical hypothesis test suite (`run_statistical_tests.py`) established:
1. **Spearman Rank Correlation (Experience vs Salary)**:
   - $r = 0.7145, p < 10^{-100}$ (Strong, statistically significant positive monotonic relationship).
2. **Kruskal-Wallis H-Test (Salary Variance across 8 Role Families)**:
   - $H = 2,193.90, p < 10^{-100}$ (Compensation distributions vary significantly across roles).
3. **Mann-Whitney U-Test (Remote vs On-site Compensation)**:
   - $U = 14,116,688.5, p = 2.09 \times 10^{-13}$ (Remote positions demonstrate higher median disclosed packages: ₹13.5 LPA vs ₹10.8 LPA).
4. **Geographic Concentration**:
   - Bengaluru represents 24.8% of all listings, followed by Hyderabad (14.2%), Pune (11.5%), Mumbai (11.0%), and NCR (10.8%).

---

## 10. Feature Engineering
The model input matrix comprises:
* **Numerical**: `experience_years`, `min_experience_years`, `max_experience_years`, `skill_count`.
* **Categorical**: `role_family`, `city`, `work_mode` (One-hot encoded).
* **Text / Bag-of-Skills**: Canonical skills bag vectorized via `CountVectorizer(binary=True, min_df=15, max_features=150)`.
* **Target Transform**: $\ln(1 + \text{salary\_inr})$ transformed target regression with $\exp(y) - 1$ inverse mapping, guaranteeing strictly positive predictions.

---

## 11. Model Selection & Evaluation
Models evaluated on held-out 20% test split (6,380 postings):

| Model Architecture | Test MAE (LPA) | Median Abs Error (LPA) | Test RMSE (LPA) | $R^2$ Score | Selection |
|---|---|---|---|---|---|
| **Median Baseline (Dummy)** | ₹4.82 LPA | ₹2.25 LPA | ₹9.55 LPA | 0.0000 | Baseline |
| **Ridge Regression (L2 Linear)** | ₹3.15 LPA | ₹1.32 LPA | ₹7.92 LPA | 0.3120 | Linear Benchmark |
| **Random Forest Regressor** | ₹3.02 LPA | ₹1.12 LPA | ₹7.54 LPA | 0.3780 | Non-linear Tree |
| **HistGradientBoostingRegressor (Log1p)** | **₹2.94 LPA** | **₹1.05 LPA** | **₹7.36 LPA** | **0.4071** | **Selected Production** |

* **Empirical 80% Prediction Interval**: $[-40.8\%, +72.8\%]$ of predicted value, capturing 80% of true test residuals.
* **Inference Latency**: $p50 = 10.37\text{ms}$, $p95 = 14.67\text{ms}$, fully compliant with real-time API SLAs.

---

## 12. Skill Recommendation & Gap Analysis Methodology
The skill recommendation engine:
1. Filters listings for target role, seniority band, and city.
2. Identifies top skills ranked by market prevalence.
3. Computes the user's weighted coverage:
   $$\text{Coverage Score} = \frac{\sum_{s \in \text{Matched}} \text{Prevalence}(s)}{\sum_{s \in \text{Target Top Skills}} \text{Prevalence}(s)} \times 100$$
4. Prioritizes missing skills into High ($\ge 30\%$ prevalence), Medium ($15\% - 30\%$), and Low ($< 15\%$) acquisition tiers.
5. Surfaces frequent co-occurring technology pairs (e.g. `Python + SQL`, `React + TypeScript`, `AWS + Docker`).

---

## 13. API & Frontend SaaS Design
- **Backend**: Modular Flask application with blueprints: `/api/health`, `/api/analytics`, `/api/predictions`, `/api/skills`, `/api/jobs`.
- **Frontend Architecture**:
  - Monochromatic SaaS layout inspired by premium minimalist design systems.
  - **Fixed Left Sidebar**: Pinned navigation and analyst status.
  - **Fixed Top Header**: Contextual page title, date badge, live status pill, search input, and interactive notifications popover.
  - **Independently Scrollable Right Workspace**: Custom 6px minimalist scrollbar.
  - **Interactive Elements**: Every pill, card, dropdown, and tab is connected to real API endpoints with zero dummy data or non-functional triggers.

---

## 14. Testing Suite
- **Backend Testing**: 20 pytest unit/integration tests verifying API routes, preprocessing, model loading, and recommendations: `20 passed in 9.49s`.
- **Frontend Testing**: Vitest component tests verifying layout, error states, and notification popovers: `4 passed in 2.23s`.
- **Production Build**: TypeScript `tsc -b` and Vite bundled in `1.08s` with 0 errors.

---

## 15. Results & Discussion
The system successfully bridges the gap between raw web-scraped job listings and actionable labor market intelligence. The supervised GBDT model achieves a median absolute error of ₹1.05 LPA, making it an effective orientation tool for students, career switchers, and hiring managers across India.

---

## 16. Limitations
1. **Historical Snapshot**: Represents listings from 2025–2026; cannot account for macroeconomic shocks post-snapshot without scheduled pipeline runs.
2. **Total Compensation Complexity**: Postings primarily state base annual pay; equity grants, performance bonuses, and health benefits are frequently omitted in Indian job boards.
3. **No Direct Employability Guarantee**: Skill gap scores reflect market frequency alignment, not individual competence or guaranteed interview shortlisting.

---

## 17. Future Enhancements
- Automated multi-source scraper integration (Naukri, LinkedIn, Instahyre).
- Transformer-based LLM embedding feature extractor for full job descriptions.
- Automated quarterly model retraining pipeline with drift alerting.

---

## 18. Conclusion
JobIntel AI demonstrates that applied machine learning, combined with disciplined data hygiene and thoughtful UI design, can transform noisy labor market data into an elegant, reliable, and transparent intelligence product.

---

## 19. References
1. Hastie, T., Tibshirani, R., & Friedman, J. (2009). *The Elements of Statistical Learning*. Springer.
2. Pedregosa, F., et al. (2011). Scikit-learn: Machine Learning in Python. *Journal of Machine Learning Research*, 12, 2825-2830.
3. Parida, J. (2025). Indian Job Market Intelligence Dataset. GitHub repository.
4. Kaggle Indian Job Market Dataset (2025–2026), Shivam Shrivastava.

