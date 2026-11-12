from flask import Blueprint, jsonify
from app.services.prediction_service import prediction_service
from app.services.analytics_service import analytics_service

health_bp = Blueprint("health", __name__)

@health_bp.route("/health", methods=["GET"])
def check_health():
    total_records = len(analytics_service._df) if analytics_service._df is not None else 0
    return jsonify({
        "status": "ok",
        "service": "ai-job-market-api",
        "model_loaded": prediction_service.is_loaded(),
        "dataset_loaded": total_records > 0,
        "total_records": total_records,
    })

