import pytest
from app import create_app
from config import Config

@pytest.fixture
def client():
    app = create_app(Config)
    app.config["TESTING"] = True
    with app.test_client() as client:
        yield client

def test_health_endpoint(client):
    res = client.get("/api/health")
    assert res.status_code == 200
    data = res.get_json()
    assert data["status"] == "ok"
    assert data["model_loaded"] is True
    assert data["dataset_loaded"] is True

def test_analytics_summary(client):
    res = client.get("/api/analytics/summary")
    assert res.status_code == 200
    data = res.get_json()
    assert "total_postings" in data
    assert data["total_postings"] > 0
    assert "median_salary_lpa" in data

def test_analytics_roles(client):
    res = client.get("/api/analytics/roles?limit=5")
    assert res.status_code == 200
    data = res.get_json()
    assert "roles" in data
    assert len(data["roles"]) <= 5

def test_analytics_locations(client):
    res = client.get("/api/analytics/locations?limit=5&level=city")
    assert res.status_code == 200
    data = res.get_json()
    assert "locations" in data
    assert len(data["locations"]) <= 5

def test_predict_salary_endpoint(client):
    payload = {
        "role_family": "Software Engineering",
        "city": "Bengaluru",
        "experience_years": 3,
        "skills": ["Python", "React"]
    }
    res = client.post("/api/predictions/salary", json=payload)
    assert res.status_code == 200
    data = res.get_json()
    assert "predicted_salary_inr_annual" in data
    assert data["predicted_salary_lpa"] > 0

def test_predict_salary_invalid_input(client):
    res = client.post("/api/predictions/salary", json={"experience_years": 999})
    assert res.status_code == 400
    data = res.get_json()
    assert "error" in data
    assert data["error"]["code"] == "VALIDATION_ERROR"

def test_skills_recommend_endpoint(client):
    payload = {
        "target_role": "Data Science",
        "current_skills": ["Python", "SQL"]
    }
    res = client.post("/api/skills/recommend", json=payload)
    assert res.status_code == 200
    data = res.get_json()
    assert "target_role" in data
    assert "coverage_score" in data

def test_jobs_list_and_pagination(client):
    res = client.get("/api/jobs?page=1&page_size=10")
    assert res.status_code == 200
    data = res.get_json()
    assert "items" in data
    assert len(data["items"]) == 10
    assert "pagination" in data
    assert data["pagination"]["total_items"] > 0
    assert data["pagination"]["page"] == 1

