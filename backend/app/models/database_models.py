from app.extensions import db

class Job(db.Model):
    __tablename__ = "jobs"

    job_id = db.Column(db.String(64), primary_key=True)
    job_title_raw = db.Column(db.Text, nullable=True)
    job_title_normalized = db.Column(db.Text, nullable=True, index=True)
    role_family = db.Column(db.String(100), nullable=True, index=True)
    company_name = db.Column(db.Text, nullable=True, index=True)
    location_raw = db.Column(db.Text, nullable=True)
    city = db.Column(db.String(100), nullable=True, index=True)
    state = db.Column(db.String(100), nullable=True)
    min_experience_years = db.Column(db.Float, nullable=True)
    max_experience_years = db.Column(db.Float, nullable=True)
    experience_years = db.Column(db.Float, nullable=True)
    experience_band = db.Column(db.String(50), nullable=True)
    salary_raw = db.Column(db.Text, nullable=True)
    salary_min_inr_annual = db.Column(db.Float, nullable=True)
    salary_max_inr_annual = db.Column(db.Float, nullable=True)
    salary_midpoint_inr_annual = db.Column(db.Float, nullable=True, index=True)
    salary_midpoint_lpa = db.Column(db.Float, nullable=True)
    salary_disclosed = db.Column(db.Boolean, default=False, index=True)
    work_mode = db.Column(db.String(50), nullable=True)
    posted_age_raw = db.Column(db.String(50), nullable=True)
    skills_json = db.Column(db.Text, nullable=True)
    company_rating = db.Column(db.Float, nullable=True)
    company_reviews_count = db.Column(db.Float, nullable=True)

class Skill(db.Model):
    __tablename__ = "skills"

    skill_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    canonical_name = db.Column(db.String(100), unique=True, nullable=False, index=True)

class JobSkill(db.Model):
    __tablename__ = "job_skills"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    job_id = db.Column(db.String(64), db.ForeignKey("jobs.job_id"), nullable=False, index=True)
    skill = db.Column(db.String(100), nullable=False, index=True)

