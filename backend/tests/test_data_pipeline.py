import pytest
import numpy as np
from scripts.run_pipeline import (
    classify_role_family,
    normalize_skills,
    normalize_location,
    parse_experience_band,
    parse_work_mode,
)

def test_classify_role_family():
    assert classify_role_family("Senior Data Scientist") == "Data Science"
    assert classify_role_family("Lead Machine Learning Engineer") == "Data Science"
    assert classify_role_family("Senior Business Analyst") == "Data Analytics"
    assert classify_role_family("Full Stack Software Engineer") == "Software Engineering"
    assert classify_role_family("DevOps Engineer - AWS") == "DevOps & Cloud"
    assert classify_role_family("QA Automation Lead") == "Quality Assurance"
    assert classify_role_family("Technical Product Manager") == "Product & Project Management"
    assert classify_role_family("Inside Sales Executive") == "Sales & Business Development"
    assert classify_role_family("Digital Marketing Specialist") == "Marketing & Content"
    assert classify_role_family("HR Generalist") == "Human Resources"
    assert classify_role_family("Senior Financial Accountant") == "Finance & Accounting"
    assert classify_role_family("UI/UX Designer") == "Design"
    assert classify_role_family("Random Unclassified 123") == "Other"
    assert classify_role_family(None) == "Other"

def test_normalize_skills():
    raw = "py, python 3, REACTJS, aws cloud, machine learning, sql, communication"
    normalized = normalize_skills(raw)
    assert "Python" in normalized
    assert "React" in normalized
    assert "AWS" in normalized
    assert "Machine Learning" in normalized
    assert "SQL" in normalized
    assert "Communication" in normalized
    # Check deduplication
    assert normalized.count("Python") == 1

def test_empty_skills():
    assert normalize_skills("") == []
    assert normalize_skills(None) == []

def test_normalize_location_aliases():
    city, state = normalize_location("Bangalore/Bengaluru, Karnataka")
    assert city == "Bengaluru"
    assert state == "Karnataka"

    city, state = normalize_location("Gurgaon, Haryana")
    assert city == "Gurugram"
    assert state == "Haryana"

    city, state = normalize_location("Bombay")
    assert city == "Mumbai"
    assert state == "Maharashtra"

def test_parse_experience_band():
    assert parse_experience_band(0.0) == "Entry / Fresher (0-2 Yrs)"
    assert parse_experience_band(2.0) == "Entry / Fresher (0-2 Yrs)"
    assert parse_experience_band(4.0) == "Junior / Associate (2-5 Yrs)"
    assert parse_experience_band(7.0) == "Mid-Senior (5-8 Yrs)"
    assert parse_experience_band(10.0) == "Senior (8-12 Yrs)"
    assert parse_experience_band(15.0) == "Lead / Executive (12+ Yrs)"
    assert parse_experience_band(None) == "Unknown"
    assert parse_experience_band(np.nan) == "Unknown"

def test_parse_work_mode():
    assert parse_work_mode("Remote / WFH", "Developer") == "Remote"
    assert parse_work_mode("Bengaluru", "Software Engineer - Hybrid") == "Hybrid"
    assert parse_work_mode("Mumbai, Maharashtra", "Office Associate") == "On-site"

