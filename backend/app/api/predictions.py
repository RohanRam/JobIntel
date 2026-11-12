from flask import Blueprint, request, jsonify
from app.services.prediction_service import prediction_service
from app.services.analytics_service import analytics_service
from app.utils.errors import APIError

predictions_bp = Blueprint("predictions", __name__)

@predictions_bp.route("/salary", methods=["POST"])
def predict_salary():
    payload = request.get_json()
    if not payload:
        raise APIError("Request body must be valid JSON", code="INVALID_BODY", status_code=400)

    result = prediction_service.predict(payload)

    # Attach market context for comparison
    role = payload.get("role_family")
    city = payload.get("city")
    if role and analytics_service._df is not None:
        role_df = analytics_service._df[
            (analytics_service._df["role_family"] == role) &
            analytics_service._df["salary_disclosed"]
        ]
        city_df = analytics_service._df[
            (analytics_service._df["city"] == city) &
            analytics_service._df["salary_disclosed"]
        ] if city else pd.DataFrame()

        result["market_context"] = {
            "role_median_lpa": round(float(role_df["salary_midpoint_lpa"].median()), 2) if len(role_df) > 0 else None,
            "city_median_lpa": round(float(city_df["salary_midpoint_lpa"].median()), 2) if len(city_df) > 0 else None,
            "sample_size": len(role_df),
        }

    return jsonify(result)

@predictions_bp.route("/metadata", methods=["GET"])
def get_metadata():
    metadata = prediction_service.get_metadata()
    return jsonify(metadata)

