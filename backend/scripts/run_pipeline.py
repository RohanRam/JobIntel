"""Complete reproducible data ingestion, cleaning, normalization, and export pipeline.
Converts raw Indian job-market CSV into analytical Parquet files, SQLite tables,
and a comprehensive data quality report.
"""
from pathlib import Path
import re
import json
import sqlite3
import pandas as pd
import numpy as np

BASE_DIR = Path(__file__).resolve().parents[1]
RAW_DATA_PATH = BASE_DIR / "data" / "raw" / "indian_job_market.csv"
CLEAN_DATA_PATH = BASE_DIR / "data" / "processed" / "jobs_clean.parquet"
JOB_SKILLS_PATH = BASE_DIR / "data" / "processed" / "job_skills.parquet"
DB_PATH = BASE_DIR / "data" / "processed" / "job_market.db"
REPORT_PATH = BASE_DIR / "data" / "processed" / "data_quality_report.json"

# City aliases map
CITY_ALIASES = {
    "bangalore": "Bengaluru",
    "bengaluru": "Bengaluru",
    "gurgaon": "Gurugram",
    "gurugram": "Gurugram",
    "bombay": "Mumbai",
    "mumbai": "Mumbai",
    "navi mumbai": "Mumbai",
    "delhi": "Delhi-NCR",
    "new delhi": "Delhi-NCR",
    "delhi ncr": "Delhi-NCR",
    "noida": "Noida",
    "greater noida": "Noida",
    "hyderabad": "Hyderabad",
    "secunderabad": "Hyderabad",
    "chennai": "Chennai",
    "madras": "Chennai",
    "pune": "Pune",
    "poona": "Pune",
    "kolkata": "Kolkata",
    "calcutta": "Kolkata",
    "ahmedabad": "Ahmedabad",
    "chandigarh": "Chandigarh",
    "kochi": "Kochi",
    "cochin": "Kochi",
    "trivandrum": "Thiruvananthapuram",
    "thiruvananthapuram": "Thiruvananthapuram",
    "jaipur": "Jaipur",
    "indore": "Indore",
    "coimbatore": "Coimbatore",
    "nagpur": "Nagpur",
    "bhubaneswar": "Bhubaneswar",
    "surat": "Surat",
    "lucknow": "Lucknow",
    "vadodara": "Vadodara",
    "visakhapatnam": "Visakhapatnam",
    "vizag": "Visakhapatnam",
}

# State mapping for primary cities
CITY_TO_STATE = {
    "Bengaluru": "Karnataka",
    "Gurugram": "Haryana",
    "Mumbai": "Maharashtra",
    "Delhi-NCR": "Delhi",
    "Noida": "Uttar Pradesh",
    "Hyderabad": "Telangana",
    "Chennai": "Tamil Nadu",
    "Pune": "Maharashtra",
    "Kolkata": "West Bengal",
    "Ahmedabad": "Gujarat",
    "Chandigarh": "Chandigarh",
    "Kochi": "Kerala",
    "Thiruvananthapuram": "Kerala",
    "Jaipur": "Rajasthan",
    "Indore": "Madhya Pradesh",
    "Coimbatore": "Tamil Nadu",
    "Nagpur": "Maharashtra",
    "Bhubaneswar": "Odisha",
    "Surat": "Gujarat",
    "Lucknow": "Uttar Pradesh",
    "Vadodara": "Gujarat",
    "Visakhapatnam": "Andhra Pradesh",
}

# Canonical skill aliases
SKILL_ALIASES = {
    "py": "Python",
    "python": "Python",
    "python3": "Python",
    "python 3": "Python",
    "js": "JavaScript",
    "javascript": "JavaScript",
    "ts": "TypeScript",
    "typescript": "TypeScript",
    "react": "React",
    "reactjs": "React",
    "react.js": "React",
    "node": "Node.js",
    "nodejs": "Node.js",
    "node.js": "Node.js",
    "sql": "SQL",
    "mysql": "MySQL",
    "postgresql": "PostgreSQL",
    "postgres": "PostgreSQL",
    "sql server": "SQL Server",
    "ms sql": "SQL Server",
    "mongodb": "MongoDB",
    "mongo": "MongoDB",
    "aws": "AWS",
    "aws cloud": "AWS",
    "amazon web services": "AWS",
    "azure": "Azure",
    "microsoft azure": "Azure",
    "gcp": "Google Cloud",
    "google cloud platform": "Google Cloud",
    "google cloud": "Google Cloud",
    "docker": "Docker",
    "kubernetes": "Kubernetes",
    "k8s": "Kubernetes",
    "machine learning": "Machine Learning",
    "ml": "Machine Learning",
    "deep learning": "Deep Learning",
    "dl": "Deep Learning",
    "artificial intelligence": "Artificial Intelligence",
    "ai": "Artificial Intelligence",
    "nlp": "NLP",
    "natural language processing": "NLP",
    "computer vision": "Computer Vision",
    "cv": "Computer Vision",
    "excel": "Excel",
    "ms excel": "Excel",
    "advanced excel": "Excel",
    "power bi": "Power BI",
    "powerbi": "Power BI",
    "tableau": "Tableau",
    "pandas": "Pandas",
    "numpy": "NumPy",
    "scikit-learn": "Scikit-Learn",
    "sklearn": "Scikit-Learn",
    "tensorflow": "TensorFlow",
    "tf": "TensorFlow",
    "pytorch": "PyTorch",
    "torch": "PyTorch",
    "spark": "Apache Spark",
    "apache spark": "Apache Spark",
    "pyspark": "PySpark",
    "hadoop": "Hadoop",
    "git": "Git",
    "github": "GitHub",
    "linux": "Linux",
    "c++": "C++",
    "cpp": "C++",
    "c#": "C#",
    "csharp": "C#",
    "java": "Java",
    "core java": "Java",
    "html": "HTML",
    "html5": "HTML",
    "css": "CSS",
    "css3": "CSS",
    "tailwind": "Tailwind CSS",
    "tailwind css": "Tailwind CSS",
    "bootstrap": "Bootstrap",
    "spring": "Spring Boot",
    "spring boot": "Spring Boot",
    "django": "Django",
    "flask": "Flask",
    "fastapi": "FastAPI",
    "next.js": "Next.js",
    "nextjs": "Next.js",
    "graphql": "GraphQL",
    "rest api": "REST API",
    "restful api": "REST API",
    "microservices": "Microservices",
    "data analysis": "Data Analysis",
    "data analytics": "Data Analytics",
    "statistics": "Statistics",
    "statistical analysis": "Statistics",
    "communication": "Communication",
    "communication skills": "Communication",
    "problem solving": "Problem Solving",
    "agile": "Agile",
    "scrum": "Scrum",
    "jira": "Jira",
    "leadership": "Leadership",
    "recruitment": "Recruitment",
    "sourcing": "Sourcing",
    "hr": "Human Resources",
    "human resources": "Human Resources",
    "sales": "Sales",
    "b2b sales": "B2B Sales",
    "lead generation": "Lead Generation",
    "business development": "Business Development",
    "seo": "SEO",
    "search engine optimization": "SEO",
    "content marketing": "Content Marketing",
    "digital marketing": "Digital Marketing",
}

def clean_text(val):
    if pd.isna(val):
        return None
    val = str(val).strip()
    return val if val else None

def parse_experience_band(exp_years):
    if exp_years is None or np.isnan(exp_years):
        return "Unknown"
    if exp_years <= 2:
        return "Entry / Fresher (0-2 Yrs)"
    elif exp_years <= 5:
        return "Junior / Associate (2-5 Yrs)"
    elif exp_years <= 8:
        return "Mid-Senior (5-8 Yrs)"
    elif exp_years <= 12:
        return "Senior (8-12 Yrs)"
    else:
        return "Lead / Executive (12+ Yrs)"

def parse_work_mode(location_raw, title_raw):
    text = f"{location_raw or ''} {title_raw or ''}".lower()
    if "remote" in text or "work from home" in text or "wfh" in text:
        return "Remote"
    elif "hybrid" in text:
        return "Hybrid"
    elif location_raw:
        return "On-site"
    return "Unknown"

def normalize_location(location_str):
    if not location_str or pd.isna(location_str):
        return "Unknown", "Unknown"
    
    loc_clean = str(location_str).lower()
    for alias, canonical_city in CITY_ALIASES.items():
        if re.search(r'\b' + re.escape(alias) + r'\b', loc_clean):
            state = CITY_TO_STATE.get(canonical_city, "Other")
            return canonical_city, state
            
    tokens = [t.strip().title() for t in re.split(r'[,/()\-]', str(location_str)) if t.strip()]
    if tokens:
        first_city = tokens[0]
        if first_city.lower() not in ["india", "remote", "hybrid", "anywhere", "pan india", "multiple"]:
            return first_city, "Other"
            
    return "Other", "Other"

def classify_role_family(title):
    if not title or pd.isna(title):
        return "Other"
    
    t = str(title).lower()

    if any(k in t for k in ["data sci", "machine learning", "ml engineer", "ai engineer", "deep learning", "nlp", "computer vision", "artificial intelligence", "data modeler", "statistician", "genai", "llm"]):
        return "Data Science"
    if any(k in t for k in ["data anal", "business anal", "bi developer", "power bi", "tableau", "analytics", "data reporting", "insights anal", "mis executive", "mis analyst", "analyst", "data specialist"]):
        return "Data Analytics"
    if any(k in t for k in ["qa", "quality assurance", "test engineer", "automation tester", "software test", "manual test", "quality analyst"]):
        return "Quality Assurance"
    if any(k in t for k in ["devops", "cloud engineer", "aws", "azure", "site reliability", "sre", "infrastructure", "system admin", "network engineer", "database admin", "dba", "lead administrator", "cloud architect"]):
        return "DevOps & Cloud"
    if any(k in t for k in ["product manager", "product owner", "associate product", "technical product", "project manager", "scrum master", "delivery manager", "program manager", "pmo"]):
        return "Product & Project Management"
    if any(k in t for k in ["software", "developer", "engineer", "full stack", "backend", "frontend", "web dev", "python dev", "java dev", "react dev", "node", "programmer", "application lead", "technical lead", "tech lead", "application developer", "sap", "oracle consultant", "salesforce", "application designer", "solution architect", "tech consultant", "fullstack"]):
        return "Software Engineering"
    if any(k in t for k in ["sales", "business development", "bde", "inside sales", "account executive", "client relationship", "relationship manager", "relationship officer", "banca", "channel partner", "telecaller", "tele caller", "direct sales"]):
        return "Sales & Business Development"
    if any(k in t for k in ["digital market", "seo", "content writer", "copywriter", "marketing", "social media", "growth manager", "campaign", "content editor", "writer", "brand manager", "creative writer", "pr executive"]):
        return "Marketing & Content"
    if any(k in t for k in ["hr", "recruiter", "talent acquisition", "human resources", "people operations", "staffing", "payroll", "hiring"]):
        return "Human Resources"
    if any(k in t for k in ["accountant", "finance", "audit", "taxation", "financial anal", "chartered accountant", "accounts", "billing", "banking", "treasury", "bookkeeper"]):
        return "Finance & Accounting"
    if any(k in t for k in ["ui/ux", "ux designer", "ui designer", "graphic designer", "visual designer", "product designer", "creative designer", "illustrator", "animator"]):
        return "Design"
    if any(k in t for k in ["operations", "customer support", "customer care", "bpo", "kpo", "technical support", "helpdesk", "voice process", "non-voice", "service desk", "trust & safety", "ops associate", "executive assistant", "admin executive", "purchase executive", "procurement", "supply chain", "warehouse", "logistics", "back office"]):
        return "Operations & Support"
    if any(k in t for k in ["consultant", "advisory", "strategy", "associate"]):
        return "Consulting & Business Advisory"
    return "Other"

def normalize_skills(skills_str):
    if not skills_str or pd.isna(skills_str):
        return []
    
    raw_tokens = re.split(r'[,;]+', str(skills_str))
    canonical_list = []
    seen = set()

    for tok in raw_tokens:
        clean = tok.strip()
        if not clean or len(clean) > 50:
            continue
        lower_tok = clean.lower()
        canonical = SKILL_ALIASES.get(lower_tok, clean.title())
        if canonical and canonical.lower() not in seen:
            seen.add(canonical.lower())
            canonical_list.append(canonical)
            
    return canonical_list

def run_pipeline():
    print(f"Loading raw dataset from {RAW_DATA_PATH}...")
    if not RAW_DATA_PATH.exists():
        raise FileNotFoundError(f"Source dataset not found at {RAW_DATA_PATH}")

    df_raw = pd.read_csv(RAW_DATA_PATH, low_memory=False)
    initial_rows = len(df_raw)
    print(f"Loaded {initial_rows} raw records.")

    # Deduplicate exact rows
    df = df_raw.drop_duplicates().copy()
    exact_dups = initial_rows - len(df)
    print(f"Dropped {exact_dups} exact duplicate rows.")

    # Map canonical columns
    col_mapping = {
        "jobId": "job_id",
        "title": "job_title_raw",
        "companyName": "company_name",
        "location": "location_raw",
        "tagsAndSkills": "skills_raw",
        "experience": "experience_raw",
        "minimumExperience": "min_experience_years",
        "maximumExperience": "max_experience_years",
        "salary": "salary_raw",
        "minimumSalary": "salary_min",
        "maximumSalary": "salary_max",
        "currency": "salary_currency",
        "jobUploaded": "posted_age_raw",
        "companyId": "company_id",
        "ReviewsCount": "company_reviews_count",
        "AggregateRating": "company_rating",
        "jobDescription": "job_description",
    }
    
    df = df.rename(columns={k: v for k, v in col_mapping.items() if k in df.columns})

    # Ensure stable job_id
    if "job_id" not in df.columns or df["job_id"].isna().all():
        df["job_id"] = [f"JOB_{i+1:06d}" for i in range(len(df))]
    else:
        df["job_id"] = df["job_id"].fillna(pd.Series([f"JOB_{i+1:06d}" for i in range(len(df))])).astype(str)

    # Clean text columns
    text_cols = ["job_title_raw", "company_name", "location_raw", "skills_raw", "experience_raw", "salary_raw", "posted_age_raw", "salary_currency"]
    for c in text_cols:
        if c in df.columns:
            df[c] = df[c].apply(clean_text)

    # Normalize job title & role family
    df["job_title_normalized"] = df["job_title_raw"].fillna("Unknown Title").str.strip()
    df["role_family"] = df["job_title_raw"].apply(classify_role_family)

    # Parse location & state
    loc_tuples = df["location_raw"].apply(normalize_location)
    df["city"] = [t[0] for t in loc_tuples]
    df["state"] = [t[1] for t in loc_tuples]

    # Parse work mode
    df["work_mode"] = [parse_work_mode(loc, title) for loc, title in zip(df["location_raw"], df["job_title_raw"])]

    # Parse experience
    df["min_experience_years"] = pd.to_numeric(df["min_experience_years"], errors="coerce")
    df["max_experience_years"] = pd.to_numeric(df["max_experience_years"], errors="coerce")
    
    # Cap negative or extreme values (>50 yrs)
    df.loc[df["min_experience_years"] < 0, "min_experience_years"] = np.nan
    df.loc[df["max_experience_years"] < 0, "max_experience_years"] = np.nan
    df.loc[df["min_experience_years"] > 50, "min_experience_years"] = np.nan
    df.loc[df["max_experience_years"] > 50, "max_experience_years"] = np.nan

    # Calculate experience midpoint and band
    df["experience_years"] = df[["min_experience_years", "max_experience_years"]].mean(axis=1)
    df["experience_band"] = df["experience_years"].apply(parse_experience_band)

    # Parse Salary
    df["salary_min"] = pd.to_numeric(df["salary_min"], errors="coerce")
    df["salary_max"] = pd.to_numeric(df["salary_max"], errors="coerce")

    # Inverted salary validation
    inverted_mask = (df["salary_min"] > df["salary_max"]) & df["salary_min"].notna() & df["salary_max"].notna()
    if inverted_mask.any():
        print(f"Fixing {inverted_mask.sum()} records where salary_min > salary_max")
        df.loc[inverted_mask, ["salary_min", "salary_max"]] = df.loc[inverted_mask, ["salary_max", "salary_min"]].values

    # Valid INR annual salary criteria
    # Range check: between 50,000 INR (50k) and 150,000,000 INR (15 Cr)
    # Must be currency == 'INR'
    # Raw salary string must not be 'Not disclosed' or 'Unpaid'
    raw_salary_str = df["salary_raw"].fillna("").astype(str).str.lower()
    valid_salary_mask = (
        (df["salary_currency"] == "INR") &
        (df["salary_min"] > 0) &
        (df["salary_max"] > 0) &
        (df["salary_min"] >= 50000) &
        (df["salary_max"] <= 150000000) &
        (df["salary_min"] <= df["salary_max"]) &
        (~raw_salary_str.str.contains("not disclosed|unpaid", regex=True))
    )

    df["salary_disclosed"] = valid_salary_mask
    df["salary_min_inr_annual"] = np.where(valid_salary_mask, df["salary_min"], np.nan)
    df["salary_max_inr_annual"] = np.where(valid_salary_mask, df["salary_max"], np.nan)
    df["salary_midpoint_inr_annual"] = np.where(valid_salary_mask, (df["salary_min"] + df["salary_max"]) / 2.0, np.nan)
    df["salary_midpoint_lpa"] = df["salary_midpoint_inr_annual"] / 100000.0

    # Ratings
    if "company_rating" in df.columns:
        df["company_rating"] = pd.to_numeric(df["company_rating"], errors="coerce")
        df.loc[(df["company_rating"] < 1.0) | (df["company_rating"] > 5.0), "company_rating"] = np.nan
    else:
        df["company_rating"] = np.nan

    if "company_reviews_count" in df.columns:
        df["company_reviews_count"] = pd.to_numeric(df["company_reviews_count"], errors="coerce")
    else:
        df["company_reviews_count"] = np.nan

    # Parse and extract skills
    print("Normalizing skills and extracting job-skill relation...")
    skills_series = df["skills_raw"].apply(normalize_skills)
    df["skills"] = skills_series

    # Build job_skills table
    job_skills_records = []
    for jid, slist in zip(df["job_id"], skills_series):
        for sk in slist:
            job_skills_records.append({"job_id": jid, "skill": sk})

    df_job_skills = pd.DataFrame(job_skills_records).drop_duplicates()
    print(f"Extracted {len(df_job_skills)} job-skill associations across {df_job_skills['skill'].nunique()} unique canonical skills.")

    # Deduplicate by fingerprint (title + company + location) keeping first
    subset_dup_mask = df.duplicated(subset=["job_title_normalized", "company_name", "location_raw"], keep="first")
    df_clean = df[~subset_dup_mask].copy().reset_index(drop=True)
    fingerprint_dups = int(subset_dup_mask.sum())
    print(f"Retained {len(df_clean)} postings after deduplicating {fingerprint_dups} postings with identical title, company, and location.")

    # Export to Parquet
    CLEAN_DATA_PATH.parent.mkdir(parents=True, exist_ok=True)
    df_clean_export = df_clean.drop(columns=["job_description"], errors="ignore").copy()
    df_clean_export["skills_json"] = df_clean_export["skills"].apply(json.dumps)
    df_clean_export = df_clean_export.drop(columns=["skills"])

    print(f"Exporting cleaned jobs to {CLEAN_DATA_PATH}...")
    df_clean_export.to_parquet(CLEAN_DATA_PATH, index=False)

    print(f"Exporting job skills to {JOB_SKILLS_PATH}...")
    df_job_skills.to_parquet(JOB_SKILLS_PATH, index=False)

    # Export to SQLite for database querying
    print(f"Exporting to SQLite database at {DB_PATH}...")
    conn = sqlite3.connect(DB_PATH)
    df_clean_export.to_sql("jobs", conn, if_exists="replace", index=False)
    
    unique_skills_df = pd.DataFrame({
        "canonical_name": df_job_skills["skill"].unique()
    }).reset_index().rename(columns={"index": "skill_id"})
    unique_skills_df["skill_id"] = unique_skills_df["skill_id"] + 1
    unique_skills_df.to_sql("skills", conn, if_exists="replace", index=False)
    
    df_job_skills.to_sql("job_skills", conn, if_exists="replace", index=False)

    cursor = conn.cursor()
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_jobs_id ON jobs(job_id);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_jobs_role ON jobs(role_family);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_jobs_city ON jobs(city);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_jobs_salary ON jobs(salary_midpoint_inr_annual);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_job_skills_jid ON job_skills(job_id);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_job_skills_skill ON job_skills(skill);")
    conn.commit()
    conn.close()

    # Data Quality Report
    sal_recs = df_clean[df_clean["salary_disclosed"]]["salary_midpoint_inr_annual"]
    report = {
        "raw_record_count": initial_rows,
        "exact_duplicates_removed": exact_dups,
        "fingerprint_duplicates_removed": fingerprint_dups,
        "retained_record_count": len(df_clean),
        "unique_companies": int(df_clean["company_name"].nunique(dropna=True)),
        "unique_roles": int(df_clean["job_title_normalized"].nunique(dropna=True)),
        "unique_cities": int(df_clean[df_clean["city"] != "Unknown"]["city"].nunique(dropna=True)),
        "unique_skills": int(df_job_skills["skill"].nunique()),
        "total_job_skill_links": len(df_job_skills),
        "salary_disclosed_records": int(df_clean["salary_disclosed"].sum()),
        "salary_disclosure_percentage": round(float(df_clean["salary_disclosed"].mean() * 100), 2),
        "salary_statistics": {
            "median_inr": float(sal_recs.median()) if len(sal_recs) > 0 else 0,
            "mean_inr": float(sal_recs.mean()) if len(sal_recs) > 0 else 0,
            "min_inr": float(sal_recs.min()) if len(sal_recs) > 0 else 0,
            "max_inr": float(sal_recs.max()) if len(sal_recs) > 0 else 0,
            "q25_inr": float(sal_recs.quantile(0.25)) if len(sal_recs) > 0 else 0,
            "q75_inr": float(sal_recs.quantile(0.75)) if len(sal_recs) > 0 else 0,
            "median_lpa": round(float(sal_recs.median() / 100000.0), 2) if len(sal_recs) > 0 else 0,
            "q25_lpa": round(float(sal_recs.quantile(0.25) / 100000.0), 2) if len(sal_recs) > 0 else 0,
            "q75_lpa": round(float(sal_recs.quantile(0.75) / 100000.0), 2) if len(sal_recs) > 0 else 0,
        },
        "role_family_counts": df_clean["role_family"].value_counts().to_dict(),
        "top_cities_counts": df_clean["city"].value_counts().head(20).to_dict(),
        "work_mode_counts": df_clean["work_mode"].value_counts().to_dict(),
        "experience_band_counts": df_clean["experience_band"].value_counts().to_dict(),
    }

    with open(REPORT_PATH, "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2)

    print(f"Data quality report successfully generated at {REPORT_PATH}")
    print("\n--- Pipeline Run Summary ---")
    print(f"Retained Postings: {report['retained_record_count']:,}")
    print(f"Salary Disclosed: {report['salary_disclosed_records']:,} ({report['salary_disclosure_percentage']}%)")
    print(f"Median Disclosed Salary: ₹{report['salary_statistics']['median_inr']:,.0f} ({report['salary_statistics']['median_lpa']} LPA)")
    print(f"Unique Companies: {report['unique_companies']:,}")
    print(f"Unique Skills: {report['unique_skills']:,}")

if __name__ == "__main__":
    run_pipeline()
