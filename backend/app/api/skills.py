from flask import Blueprint, request, jsonify
from app.services.recommendation_service import recommendation_service
from app.services.analytics_service import analytics_service
from app.utils.errors import APIError

skills_bp = Blueprint("skills", __name__)

@skills_bp.route("/recommend", methods=["POST"])
def recommend_skills():
    payload = request.get_json()
    if not payload:
        raise APIError("Request body must be valid JSON", code="INVALID_BODY", status_code=400)

    result = recommendation_service.analyze_skill_gap(payload)
    return jsonify(result)

@skills_bp.route("/common", methods=["GET"])
def get_common_skills():
    role_family = request.args.get("role_family")
    limit = int(request.args.get("limit", 25))
    skills = analytics_service.get_skill_demand(role_family=role_family, limit=limit)
    return jsonify({"skills": skills})

