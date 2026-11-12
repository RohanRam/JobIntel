import pytest
from app.services.recommendation_service import recommendation_service
from app.utils.errors import APIError

def test_recommendation_analysis():
    payload = {
        "target_role": "Data Analytics",
        "current_skills": ["Excel", "SQL"],
        "city": "Bengaluru"
    }
    result = recommendation_service.analyze_skill_gap(payload)
    assert result["target_role"] == "Data Analytics"
    assert result["market_sample_size"] > 0
    assert "Excel" in result["matched_skills"] or "SQL" in result["matched_skills"]
    assert len(result["missing_skills"]) > 0
    assert 0.0 <= result["coverage_score"] <= 1.0
    assert 0.0 <= result["coverage_pct"] <= 100.0

def test_recommendation_missing_target_role():
    with pytest.raises(APIError):
        recommendation_service.analyze_skill_gap({})

