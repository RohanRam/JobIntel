from flask import Blueprint, request, jsonify
from app.services.job_service import job_service
from app.utils.pagination import get_pagination_params

jobs_bp = Blueprint("jobs", __name__)

@jobs_bp.route("", methods=["GET"])
def list_jobs():
    page, page_size = get_pagination_params(default_page=1, default_page_size=20, max_page_size=100)

    filters = {
        "search": request.args.get("search"),
        "role_family": request.args.get("role_family"),
        "city": request.args.get("city"),
        "state": request.args.get("state"),
        "min_exp": request.args.get("min_exp"),
        "max_exp": request.args.get("max_exp"),
        "salary_disclosed": request.args.get("salary_disclosed"),
        "min_salary_lpa": request.args.get("min_salary_lpa"),
        "max_salary_lpa": request.args.get("max_salary_lpa"),
        "skill": request.args.get("skill"),
        "work_mode": request.args.get("work_mode"),
        "sort_by": request.args.get("sort_by"),
        "sort_order": request.args.get("sort_order"),
    }

    result = job_service.get_jobs(filters=filters, page=page, page_size=page_size)
    return jsonify(result)

@jobs_bp.route("/<job_id>", methods=["GET"])
def get_job(job_id):
    job = job_service.get_job_by_id(job_id)
    return jsonify(job)

