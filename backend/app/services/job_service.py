import json
import pandas as pd
from config import Config
from app.utils.errors import APIError
from app.utils.pagination import paginate_records

class JobService:
    def __init__(self):
        self._df = None
        self._df_skills = None
        self._load_data()

    def _load_data(self):
        if Config.PROCESSED_DATA_PATH.exists():
            self._df = pd.read_parquet(Config.PROCESSED_DATA_PATH)
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

    def get_jobs(self, filters: dict, page: int = 1, page_size: int = 20) -> dict:
        if self._df.empty:
            return paginate_records([], page, page_size, total_count=0)

        df_sub = self._df

        # Text search (title or company)
        search = filters.get("search")
        if search:
            s_clean = str(search).lower().strip()
            title_match = df_sub["job_title_raw"].fillna("").str.lower().str.contains(s_clean, regex=False)
            comp_match = df_sub["company_name"].fillna("").str.lower().str.contains(s_clean, regex=False)
            df_sub = df_sub[title_match | comp_match]

        # Role family filter
        role = filters.get("role_family")
        if role and role != "All":
            df_sub = df_sub[df_sub["role_family"] == role]

        # City filter
        city = filters.get("city")
        if city and city != "All":
            df_sub = df_sub[df_sub["city"] == city]

        # State filter
        state = filters.get("state")
        if state and state != "All":
            df_sub = df_sub[df_sub["state"] == state]

        # Work mode filter
        work_mode = filters.get("work_mode")
        if work_mode and work_mode != "All":
            df_sub = df_sub[df_sub["work_mode"] == work_mode]

        # Salary disclosed filter
        salary_disclosed = filters.get("salary_disclosed")
        if salary_disclosed is not None:
            if str(salary_disclosed).lower() in ["true", "1"]:
                df_sub = df_sub[df_sub["salary_disclosed"] == True]
            elif str(salary_disclosed).lower() in ["false", "0"]:
                df_sub = df_sub[df_sub["salary_disclosed"] == False]

        # Experience filters
        min_exp = filters.get("min_exp")
        if min_exp is not None:
            try:
                val = float(min_exp)
                df_sub = df_sub[df_sub["min_experience_years"] >= val]
            except (ValueError, TypeError):
                pass

        max_exp = filters.get("max_exp")
        if max_exp is not None:
            try:
                val = float(max_exp)
                df_sub = df_sub[df_sub["max_experience_years"] <= val]
            except (ValueError, TypeError):
                pass

        # Salary range filters (LPA)
        min_sal = filters.get("min_salary_lpa")
        if min_sal is not None:
            try:
                val = float(min_sal)
                df_sub = df_sub[df_sub["salary_midpoint_lpa"] >= val]
            except (ValueError, TypeError):
                pass

        max_sal = filters.get("max_salary_lpa")
        if max_sal is not None:
            try:
                val = float(max_sal)
                df_sub = df_sub[df_sub["salary_midpoint_lpa"] <= val]
            except (ValueError, TypeError):
                pass

        # Skill filter
        skill = filters.get("skill")
        if skill and skill != "All" and not self._df_skills.empty:
            skill_clean = str(skill).strip().lower()
            matching_jids = set(
                self._df_skills[self._df_skills["skill"].str.lower() == skill_clean]["job_id"]
            )
            df_sub = df_sub[df_sub["job_id"].isin(matching_jids)]

        # Sorting
        sort_by = filters.get("sort_by") or "default"
        sort_order = (filters.get("sort_order") or "desc").lower()
        ascending = sort_order == "asc"

        if sort_by == "salary":
            df_sub = df_sub.sort_values(by="salary_midpoint_inr_annual", ascending=ascending, na_position="last")
        elif sort_by == "experience":
            df_sub = df_sub.sort_values(by="experience_years", ascending=ascending, na_position="last")
        elif sort_by == "rating":
            df_sub = df_sub.sort_values(by="company_rating", ascending=ascending, na_position="last")
        elif sort_by == "company":
            df_sub = df_sub.sort_values(by="company_name", ascending=ascending, na_position="last")

        total_count = len(df_sub)
        start_idx = (page - 1) * page_size
        end_idx = start_idx + page_size

        page_records = df_sub.iloc[start_idx:end_idx].copy()

        # Format items for JSON
        items = []
        for _, row in page_records.iterrows():
            skills_val = row.get("skills", [])
            if not isinstance(skills_val, list):
                if pd.notna(row.get("skills_json")):
                    try:
                        skills_val = json.loads(row["skills_json"])
                    except Exception:
                        skills_val = []
                else:
                    skills_val = []

            items.append({
                "job_id": str(row["job_id"]),
                "job_title_raw": row.get("job_title_raw", "Untitled"),
                "job_title_normalized": row.get("job_title_normalized", "Untitled"),
                "role_family": row.get("role_family", "Other"),
                "company_name": row.get("company_name", "Confidential"),
                "location_raw": row.get("location_raw", "India"),
                "city": row.get("city", "Unknown"),
                "state": row.get("state", "Other"),
                "min_experience_years": None if pd.isna(row.get("min_experience_years")) else float(row["min_experience_years"]),
                "max_experience_years": None if pd.isna(row.get("max_experience_years")) else float(row["max_experience_years"]),
                "salary_raw": row.get("salary_raw"),
                "salary_min_inr_annual": None if pd.isna(row.get("salary_min_inr_annual")) else float(row["salary_min_inr_annual"]),
                "salary_max_inr_annual": None if pd.isna(row.get("salary_max_inr_annual")) else float(row["salary_max_inr_annual"]),
                "salary_midpoint_inr_annual": None if pd.isna(row.get("salary_midpoint_inr_annual")) else float(row["salary_midpoint_inr_annual"]),
                "salary_midpoint_lpa": None if pd.isna(row.get("salary_midpoint_lpa")) else float(row["salary_midpoint_lpa"]),
                "salary_disclosed": bool(row.get("salary_disclosed", False)),
                "work_mode": row.get("work_mode", "On-site"),
                "posted_age_raw": row.get("posted_age_raw", "Recently"),
                "skills": skills_val,
                "company_rating": None if pd.isna(row.get("company_rating")) else float(row["company_rating"]),
                "company_reviews_count": None if pd.isna(row.get("company_reviews_count")) else int(row["company_reviews_count"]),
            })

        return paginate_records(items, page, page_size, total_count=total_count)

    def get_job_by_id(self, job_id: str) -> dict:
        if self._df.empty:
            raise APIError("Job not found", code="NOT_FOUND", status_code=404)

        matching = self._df[self._df["job_id"] == str(job_id)]
        if matching.empty:
            raise APIError(f"Job with id {job_id} not found", code="NOT_FOUND", status_code=404)

        row = matching.iloc[0]
        skills_val = row.get("skills", [])
        if not isinstance(skills_val, list):
            if pd.notna(row.get("skills_json")):
                try:
                    skills_val = json.loads(row["skills_json"])
                except Exception:
                    skills_val = []

        return {
            "job_id": str(row["job_id"]),
            "job_title_raw": row.get("job_title_raw", "Untitled"),
            "job_title_normalized": row.get("job_title_normalized", "Untitled"),
            "role_family": row.get("role_family", "Other"),
            "company_name": row.get("company_name", "Confidential"),
            "location_raw": row.get("location_raw", "India"),
            "city": row.get("city", "Unknown"),
            "state": row.get("state", "Other"),
            "min_experience_years": None if pd.isna(row.get("min_experience_years")) else float(row["min_experience_years"]),
            "max_experience_years": None if pd.isna(row.get("max_experience_years")) else float(row["max_experience_years"]),
            "salary_raw": row.get("salary_raw"),
            "salary_min_inr_annual": None if pd.isna(row.get("salary_min_inr_annual")) else float(row["salary_min_inr_annual"]),
            "salary_max_inr_annual": None if pd.isna(row.get("salary_max_inr_annual")) else float(row["salary_max_inr_annual"]),
            "salary_midpoint_inr_annual": None if pd.isna(row.get("salary_midpoint_inr_annual")) else float(row["salary_midpoint_inr_annual"]),
            "salary_midpoint_lpa": None if pd.isna(row.get("salary_midpoint_lpa")) else float(row["salary_midpoint_lpa"]),
            "salary_disclosed": bool(row.get("salary_disclosed", False)),
            "work_mode": row.get("work_mode", "On-site"),
            "posted_age_raw": row.get("posted_age_raw", "Recently"),
            "skills": skills_val,
            "company_rating": None if pd.isna(row.get("company_rating")) else float(row["company_rating"]),
            "company_reviews_count": None if pd.isna(row.get("company_reviews_count")) else int(row["company_reviews_count"]),
        }

job_service = JobService()
