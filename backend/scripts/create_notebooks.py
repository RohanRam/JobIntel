import json
from pathlib import Path

nb_dir = Path(__file__).resolve().parents[1] / "notebooks"
nb_dir.mkdir(parents=True, exist_ok=True)

def make_nb(cells):
    return {
        "cells": cells,
        "metadata": {
            "language_info": {"name": "python", "version": "3.12"},
            "orig_nbformat": 4
        },
        "nbformat": 4,
        "nbformat_minor": 5
    }

def md(source):
    return {
        "cell_type": "markdown",
        "metadata": {},
        "source": [line + "\n" for line in source.split("\n")]
    }

def code(source):
    return {
        "cell_type": "code",
        "execution_count": None,
        "metadata": {},
        "outputs": [],
        "source": [line + "\n" for line in source.split("\n")]
    }

# 01_data_audit.ipynb
nb1 = make_nb([
    md("# 01. Raw Dataset Audit & Schema Inspection\nThis notebook inspects the raw Indian Job Market Dataset 2025-2026."),
    code('import pandas as pd\nimport numpy as np\n\ndf = pd.read_csv("../data/raw/indian_job_market.csv", low_memory=False)\nprint("Shape:", df.shape)\ndf.head(3)'),
    code('print("=== Missing Values ===")\nprint(df.isna().sum().sort_values(ascending=False))\n\nprint("\\nExact duplicates:", df.duplicated().sum())'),
    code('sal_disclosed = (df["minimumSalary"] > 0) & (df["maximumSalary"] > 0)\nprint(f"Salary disclosed: {sal_disclosed.sum()} ({sal_disclosed.mean()*100:.2f}%)")')
])
with open(nb_dir / "01_data_audit.ipynb", "w", encoding="utf-8") as f:
    json.dump(nb1, f, indent=2)

# 02_cleaning_and_eda.ipynb
nb2 = make_nb([
    md("# 02. Cleaning & Exploratory Data Analysis\nAnalyzes cleaned job postings, demand across roles, locations, and salary distributions."),
    code('import pandas as pd\nimport matplotlib.pyplot as plt\n\ndf = pd.read_parquet("../data/processed/jobs_clean.parquet")\nprint("Clean Postings:", len(df))\ndf.head(3)'),
    code('# Top Role Families\ndf["role_family"].value_counts().plot(kind="barh", figsize=(10, 5), title="Demand by Role Family")\nplt.xlabel("Posting Count")\nplt.show()'),
    code('# Disclosed Salary Distribution (LPA)\nsal_lpa = df[df["salary_disclosed"]]["salary_midpoint_lpa"]\nplt.figure(figsize=(9, 4))\nsal_lpa.plot(kind="hist", bins=30, xlim=(0, 35), title="Salary Distribution (LPA)")\nplt.xlabel("LPA (Lakhs per Annum)")\nplt.show()')
])
with open(nb_dir / "02_cleaning_and_eda.ipynb", "w", encoding="utf-8") as f:
    json.dump(nb2, f, indent=2)

# 03_salary_modeling.ipynb
nb3 = make_nb([
    md("# 03. Supervised Salary Modeling\nTrains and evaluates baseline vs gradient-boosted regression for salary estimation."),
    code('import joblib, json\nimport numpy as np, pandas as pd\n\nwith open("../artifacts/model_metadata.json") as f:\n    meta = json.load(f)\nprint("Model:", meta["model_type"])\nprint("Metrics:", json.dumps(meta["metrics"], indent=2))'),
    code('bundle = joblib.load("../artifacts/salary_model.joblib")\npipeline = bundle["pipeline"]\nprint("Pipeline Steps:", pipeline.named_steps)')
])
with open(nb_dir / "03_salary_modeling.ipynb", "w", encoding="utf-8") as f:
    json.dump(nb3, f, indent=2)

# 04_skill_analysis.ipynb
nb4 = make_nb([
    md("# 04. Skill Intelligence & Co-occurrence Analysis\nExtracts canonical skill prevalence and frequent skill pairs per role."),
    code('import pandas as pd\nskills_df = pd.read_parquet("../data/processed/job_skills.parquet")\nprint("Total associations:", len(skills_df))\nskills_df["skill"].value_counts().head(20).plot(kind="barh", figsize=(10, 6), title="Top 20 In-Demand Skills")')
])
with open(nb_dir / "04_skill_analysis.ipynb", "w", encoding="utf-8") as f:
    json.dump(nb4, f, indent=2)

print("Created all 4 analytical notebooks successfully!")

