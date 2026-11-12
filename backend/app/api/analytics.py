from flask import Blueprint, request, jsonify
from app.services.analytics_service import analytics_service

analytics_bp = Blueprint("analytics", __name__)

@analytics_bp.route("/summary", methods=["GET"])
def get_summary():
    role_family = request.args.get("role_family")
    city = request.args.get("city")
    experience_band = request.args.get("experience_band")
    summary = analytics_service.get_summary(role_family, city, experience_band)
    return jsonify(summary)

@analytics_bp.route("/roles", methods=["GET"])
def get_roles():
    limit = int(request.args.get("limit", 15))
    city = request.args.get("city")
    roles = analytics_service.get_role_demand(limit=limit, city=city)
    return jsonify({"roles": roles})

@analytics_bp.route("/locations", methods=["GET"])
def get_locations():
    limit = int(request.args.get("limit", 15))
    level = request.args.get("level", "city")
    locations = analytics_service.get_location_demand(limit=limit, level=level)
    return jsonify({"locations": locations})

@analytics_bp.route("/experience", methods=["GET"])
def get_experience():
    role_family = request.args.get("role_family")
    city = request.args.get("city")
    distribution = analytics_service.get_experience_distribution(role_family, city)
    return jsonify({"distribution": distribution})

@analytics_bp.route("/salaries", methods=["GET"])
def get_salaries():
    role_family = request.args.get("role_family")
    city = request.args.get("city")
    distribution = analytics_service.get_salary_distribution(role_family, city)
    return jsonify({"distribution": distribution})

@analytics_bp.route("/skills", methods=["GET"])
def get_skills():
    role_family = request.args.get("role_family")
    limit = int(request.args.get("limit", 20))
    skills = analytics_service.get_skill_demand(role_family=role_family, limit=limit)
    return jsonify({"skills": skills})

@analytics_bp.route("/filter-options", methods=["GET"])
def get_filter_options():
    options = analytics_service.get_filter_options()
    return jsonify(options)

