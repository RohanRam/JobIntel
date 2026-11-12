from collections import Counter
import pandas as pd
from config import Config
from app.utils.errors import APIError

class RecommendationService:
    def __init__(self):
        self._df = None
        self._df_skills = None
        self._load_data()

    def _load_data(self):
        if Config.PROCESSED_DATA_PATH.exists():
            self._df = pd.read_parquet(Config.PROCESSED_DATA_PATH)
        else:
            self._df = pd.DataFrame()

        if Config.JOB_SKILLS_PATH.exists():
            self._df_skills = pd.read_parquet(Config.JOB_SKILLS_PATH)
        else:
            self._df_skills = pd.DataFrame()

    def analyze_skill_gap(self, payload: dict) -> dict:
        target_role = payload.get("target_role")
        if not target_role:
            raise APIError("target_role is required", code="VALIDATION_ERROR", status_code=400)

        user_skills_raw = payload.get("current_skills", [])
        if not isinstance(user_skills_raw, list):
            user_skills_raw = [str(user_skills_raw)]

        # Normalize user skills (strip, case-insensitive mapping)
        user_skills_norm = {s.strip().lower(): s.strip() for s in user_skills_raw if s and s.strip()}

        city = payload.get("city")
        exp_band = payload.get("experience_band")

        # Filter relevant jobs
        df_sub = self._df[self._df["role_family"] == target_role]
        if city and city != "All":
            sub_city = df_sub[df_sub["city"] == city]
            if len(sub_city) >= 30:  # only apply city filter if enough sample size
                df_sub = sub_city
        if exp_band and exp_band != "All":
            sub_exp = df_sub[df_sub["experience_band"] == exp_band]
            if len(sub_exp) >= 30:
                df_sub = sub_exp

        role_job_count = len(df_sub)
        if role_job_count == 0:
            # Fallback to entire role family
            df_sub = self._df[self._df["role_family"] == target_role]
            role_job_count = len(df_sub)

        if role_job_count == 0:
            raise APIError(f"No job postings found for target role: {target_role}", code="NOT_FOUND", status_code=404)

        job_ids = set(df_sub["job_id"])
        role_skills = self._df_skills[self._df_skills["job_id"].isin(job_ids)]

        # Calculate skill counts and prevalence
        skill_counts = role_skills["skill"].value_counts().head(30)
        
        matched_skills = []
        missing_skills = []
        top_role_skills = []

        total_top_prevalence = 0.0
        matched_prevalence = 0.0

        for sk, count in skill_counts.items():
            prevalence = round(float(count / role_job_count), 4)
            total_top_prevalence += prevalence
            
            # Check match
            sk_lower = sk.lower()
            if sk_lower in user_skills_norm:
                matched_skills.append(sk)
                matched_prevalence += prevalence
            else:
                priority = "high" if prevalence >= 0.30 else ("medium" if prevalence >= 0.15 else "low")
                missing_skills.append({
                    "skill": sk,
                    "prevalence": prevalence,
                    "priority": priority,
                    "postings_count": int(count)
                })

        # Calculate weighted coverage score
        if total_top_prevalence > 0:
            coverage_score = round(matched_prevalence / total_top_prevalence, 4)
        else:
            coverage_score = 0.0

        # Co-occurrence pairs (e.g. top 5 pairs within this role)
        # Group skills by job_id for a sample of jobs to find frequent co-occurrence
        co_occurring = []
        sample_jobs = list(job_ids)[:500]
        sample_skills_df = role_skills[role_skills["job_id"].isin(sample_jobs)]
        grouped = sample_skills_df.groupby("job_id")["skill"].apply(list)
        
        pair_counter = Counter()
        for slist in grouped:
            unique_s = sorted(set(slist))
            for i in range(len(unique_s)):
                for j in range(i + 1, len(unique_s)):
                    pair_counter[(unique_s[i], unique_s[j])] += 1

        for (s1, s2), cnt in pair_counter.most_common(6):
            co_occurring.append({"skill_a": s1, "skill_b": s2, "count": cnt})

        return {
            "target_role": target_role,
            "market_sample_size": role_job_count,
            "user_skills": list(user_skills_norm.values()),
            "matched_skills": matched_skills,
            "missing_skills": missing_skills,
            "coverage_score": coverage_score,
            "coverage_pct": round(coverage_score * 100, 1),
            "co_occurring_skills": co_occurring,
            "interpretation": f"Coverage is calculated based on {role_job_count:,} postings in {target_role}. It reflects alignment with market skill mentions, not a hiring guarantee."
        }

recommendation_service = RecommendationService()

