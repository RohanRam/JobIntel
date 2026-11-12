import os
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env")

def resolve_path(env_key: str, default_subpath: Path) -> Path:
    val = os.getenv(env_key)
    if val:
        p = Path(val)
        return p if p.is_absolute() else (BASE_DIR / p).resolve()
    return default_subpath.resolve()

class Config:
    FLASK_ENV = os.getenv("FLASK_ENV", "development")
    DEBUG = os.getenv("FLASK_DEBUG", "1") == "1"
    API_HOST = os.getenv("API_HOST", "127.0.0.1")
    API_PORT = int(os.getenv("API_PORT", 5000))
    FRONTEND_ORIGIN = os.getenv("FRONTEND_ORIGIN", "*")
    
    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL", f"sqlite:///{BASE_DIR / 'data' / 'processed' / 'job_market.db'}")
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    DATASET_PATH = resolve_path("DATASET_PATH", BASE_DIR / "data" / "raw" / "indian_job_market.csv")
    PROCESSED_DATA_PATH = resolve_path("PROCESSED_DATA_PATH", BASE_DIR / "data" / "processed" / "jobs_clean.parquet")
    JOB_SKILLS_PATH = resolve_path("JOB_SKILLS_PATH", BASE_DIR / "data" / "processed" / "job_skills.parquet")
    DATA_QUALITY_REPORT_PATH = BASE_DIR / "data" / "processed" / "data_quality_report.json"
    
    MODEL_PATH = resolve_path("MODEL_PATH", BASE_DIR / "artifacts" / "salary_model.joblib")
    METADATA_PATH = resolve_path("METADATA_PATH", BASE_DIR / "artifacts" / "model_metadata.json")
    EVALUATION_REPORT_PATH = BASE_DIR / "artifacts" / "evaluation_report.json"

class DevelopmentConfig(Config):
    DEBUG = True

class ProductionConfig(Config):
    DEBUG = False

config_by_name = {
    "development": DevelopmentConfig,
    "production": ProductionConfig,
    "default": DevelopmentConfig,
}
