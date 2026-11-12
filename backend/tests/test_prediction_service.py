import pytest
from app.services.prediction_service import prediction_service
from app.utils.errors import APIError

def test_model_loaded():
    assert prediction_service.is_loaded() is True

def test_prediction_output_format():
    payload = {
        "role_family": "Software Engineering",
        "city": "Bengaluru",
        "work_mode": "Hybrid",
        "experience_years": 3.0,
        "skills": ["Python", "React", "SQL"]
    }
    result = prediction_service.predict(payload)
    assert "predicted_salary_inr_annual" in result
    assert "predicted_salary_lpa" in result
    assert "prediction_interval" in result
    assert result["currency"] == "INR"
    assert result["period"] == "annual"
    assert result["predicted_salary_inr_annual"] > 50000

    interval = result["prediction_interval"]
    assert interval["lower_inr"] <= interval["upper_inr"]
    assert interval["lower_lpa"] <= interval["upper_lpa"]

def test_prediction_with_unseen_category():
    payload = {
        "role_family": "CompletelyUnseenRole999",
        "city": "MarsCity",
        "work_mode": "Orbital",
        "experience_years": 5.0,
        "skills": ["AlienLanguage", "QuantumTeleportation"]
    }
    result = prediction_service.predict(payload)
    assert result["predicted_salary_inr_annual"] > 0
    assert result["prediction_interval"]["lower_inr"] <= result["prediction_interval"]["upper_inr"]

def test_invalid_experience_handling():
    with pytest.raises(APIError):
        prediction_service.predict({"experience_years": -5.0})

    with pytest.raises(APIError):
        prediction_service.predict({"experience_years": 85.0})

