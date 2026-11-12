from pathlib import Path
import json
import numpy as np
import pandas as pd
from config import Config

class AnalyticsService:
    def __init__(self):
        self._df = None
        self._df_skills = None
        self._quality_report = None
        self._load_data()

    def _load_data(self):
        if Config.PROCESSED_DATA_PATH.exists():
            self._df = pd.read_parquet(Config.PROCESSED_DATA_PATH)
            # Reconstruct skills list if needed
            if "skills_json" in self._df.columns and "skills" not in self._df.columns:
                self._df["skills"] = self._df["skills_json"].apply(
                    lambda x: json.loads(x) if pd.notna(x) else []
                )
        else:
            self._df = pd.DataFrame()

        if Config.JOB_SKILLS_PATH.exists():
            self._df_skills = pd.read_parquet(Config.JOB_SKILLS_PATH)
        else:
            self._df_skills = pd.DataFrame()

        if Config.DATA_QUALITY_REPORT_PATH.exists():
            with open(Config.DATA_QUALITY_REPORT_PATH, "r", encoding="utf-8") as f:
                self._quality_report = json.load(f)
        else:
            self._quality_report = {}

    def _filter_df(self, role_family=None, city=None, experience_band=None):
        if self._df is None or self._df.empty:
            return pd.DataFrame()

        df_filtered = self._df
        if role_family and role_family != "All":
            df_filtered = df_filtered[df_filtered["role_family"] == role_family]
        if city and city != "All":
            df_filtered = df_filtered[df_filtered["city"] == city]
        if experience_band and experience_band != "All":
            df_filtered = df_filtered[df_filtered["experience_band"] == experience_band]

        return df_filtered

    def get_summary(self, role_family=None, city=None, experience_band=None):
        df_sub = self._filter_df(role_family, city, experience_band)
        if df_sub.empty:
            return {
                "total_postings": 0,
                "unique_companies": 0,
                "unique_locations": 0,
                "salary_disclosed_postings": 0,
                "salary_disclosure_rate": 0,
                "median_salary_inr": 0,
                "median_salary_lpa": 0,
                "mean_salary_inr": 0,
                "mean_salary_lpa": 0,
                "dataset_name": "Indian Job Market Dataset 2025-2026",
            }

        total = len(df_sub)
        sal_sub = df_sub[df_sub["salary_disclosed"] & df_sub["salary_midpoint_inr_annual"].notna()]
        sal_count = len(sal_sub)
        sal_vals = sal_sub["salary_midpoint_inr_annual"]

        median_inr = float(sal_vals.median()) if sal_count > 0 else 0
        mean_inr = float(sal_vals.mean()) if sal_count > 0 else 0
        q25 = float(sal_vals.quantile(0.25)) if sal_count > 0 else 0
        q75 = float(sal_vals.quantile(0.75)) if sal_count > 0 else 0

        return {
            "total_postings": total,
            "unique_companies": int(df_sub["company_name"].nunique(dropna=True)),
            "unique_locations": int(df_sub["city"].nunique(dropna=True)),
            "salary_disclosed_postings": sal_count,
            "salary_disclosure_rate": round((sal_count / total * 100), 2) if total > 0 else 0,
            "median_salary_inr": round(median_inr),
            "median_salary_lpa": round(median_inr / 100000.0, 2),
            "mean_salary_inr": round(mean_inr),
            "mean_salary_lpa": round(mean_inr / 100000.0, 2),
            "iqr_salary_lpa": [round(q25 / 100000.0, 2), round(q75 / 100000.0, 2)],
            "dataset_name": "Indian Job Market Dataset 2025-2026",
            "snapshot_date": "2025-2026",
        }

    def get_role_demand(self, limit=12, city=None):
        df_sub = self._df
        if city and city != "All":
            df_sub = df_sub[df_sub["city"] == city]

        if df_sub.empty:
            return []

        total = len(df_sub)
        roles = []
        counts = df_sub["role_family"].value_counts().head(limit)

        for role_name, count in counts.items():
            role_df = df_sub[df_sub["role_family"] == role_name]
            sal_df = role_df[role_df["salary_disclosed"] & role_df["salary_midpoint_inr_annual"].notna()]
            median_lpa = round(float(sal_df["salary_midpoint_inr_annual"].median() / 1e5), 2) if len(sal_df) > 0 else None

            roles.append({
                "role_family": role_name,
                "count": int(count),
                "percentage": round((count / total) * 100, 2),
                "median_salary_lpa": median_lpa,
                "salary_sample_count": len(sal_df)
            })

        return roles

    def get_location_demand(self, limit=12, level="city"):
        col = "state" if level == "state" else "city"
        df_sub = self._df[self._df[col].notna() & (self._df[col] != "Unknown") & (self._df[col] != "Other")]

        if df_sub.empty:
            return []

        total = len(df_sub)
        locs = []
        counts = df_sub[col].value_counts().head(limit)

        for loc_name, count in counts.items():
            sub = df_sub[df_sub[col] == loc_name]
            sal_df = sub[sub["salary_disclosed"] & sub["salary_midpoint_inr_annual"].notna()]
            median_lpa = round(float(sal_df["salary_midpoint_inr_annual"].median() / 1e5), 2) if len(sal_df) > 0 else None

            locs.append({
                "name": loc_name,
                "count": int(count),
                "percentage": round((count / total) * 100, 2),
                "median_salary_lpa": median_lpa
            })

        return locs

    def get_experience_distribution(self, role_family=None, city=None):
        df_sub = self._filter_df(role_family, city)
        if df_sub.empty:
            return []

        order = [
            "Entry / Fresher (0-2 Yrs)",
            "Junior / Associate (2-5 Yrs)",
            "Mid-Senior (5-8 Yrs)",
            "Senior (8-12 Yrs)",
            "Lead / Executive (12+ Yrs)",
        ]
        total = len(df_sub)
        dist = []

        for band in order:
            band_df = df_sub[df_sub["experience_band"] == band]
            count = len(band_df)
            sal_df = band_df[band_df["salary_disclosed"] & band_df["salary_midpoint_inr_annual"].notna()]
            med_lpa = round(float(sal_df["salary_midpoint_inr_annual"].median() / 1e5), 2) if len(sal_df) > 0 else None

            dist.append({
                "experience_band": band,
                "count": count,
                "percentage": round((count / total) * 100, 2) if total > 0 else 0,
                "median_salary_lpa": med_lpa
            })

        return dist

    def get_salary_distribution(self, role_family=None, city=None):
        df_sub = self._filter_df(role_family, city)
        sal_sub = df_sub[df_sub["salary_disclosed"] & df_sub["salary_midpoint_lpa"].notna()]

        if sal_sub.empty:
            return []

        brackets = [
            ("0-3 LPA", 0.0, 3.0),
            ("3-6 LPA", 3.0, 6.0),
            ("6-10 LPA", 6.0, 10.0),
            ("10-15 LPA", 10.0, 15.0),
            ("15-25 LPA", 15.0, 25.0),
            ("25-40 LPA", 25.0, 40.0),
            ("40+ LPA", 40.0, 1000.0),
        ]

        total = len(sal_sub)
        res = []
        sal_series = sal_sub["salary_midpoint_lpa"]

        for label, low, high in brackets:
            c = int(((sal_series >= low) & (sal_series < high)).sum())
            res.append({
                "bracket": label,
                "count": c,
                "percentage": round((c / total) * 100, 2) if total > 0 else 0
            })

        return res

    def get_skill_demand(self, role_family=None, limit=20):
        if self._df_skills is None or self._df_skills.empty:
            return []

        if role_family and role_family != "All":
            relevant_jobs = set(self._df[self._df["role_family"] == role_family]["job_id"])
            skill_sub = self._df_skills[self._df_skills["job_id"].isin(relevant_jobs)]
            total_role_jobs = len(relevant_jobs)
        else:
            skill_sub = self._df_skills
            total_role_jobs = len(self._df)

        if skill_sub.empty or total_role_jobs == 0:
            return []

        counts = skill_sub["skill"].value_counts().head(limit)
        items = []

        for sk, count in counts.items():
            prevalence = round(float(count / total_role_jobs), 4)
            items.append({
                "skill": sk,
                "count": int(count),
                "prevalence": prevalence,
                "role_family": role_family or "All"
            })

        return items

    def get_filter_options(self):
        if self._df.empty:
            return {"role_families": [], "cities": [], "experience_bands": [], "work_modes": []}

        roles = [r for r in self._df["role_family"].dropna().unique() if r != "Other"]
        roles.sort()
        roles.append("Other")

        top_cities = [c for c in self._df["city"].value_counts().head(25).index if c not in ["Unknown", "Other"]]
        top_cities.sort()

        exp_bands = [
            "Entry / Fresher (0-2 Yrs)",
            "Junior / Associate (2-5 Yrs)",
            "Mid-Senior (5-8 Yrs)",
            "Senior (8-12 Yrs)",
            "Lead / Executive (12+ Yrs)",
        ]

        work_modes = ["On-site", "Hybrid", "Remote"]

        return {
            "role_families": roles,
            "cities": top_cities,
            "experience_bands": exp_bands,
            "work_modes": work_modes,
        }

analytics_service = AnalyticsService()

