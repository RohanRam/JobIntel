from flask import Flask, jsonify
from flask_cors import CORS
from config import Config
from .extensions import db, cors
from .utils.errors import APIError
from .api.health import health_bp
from .api.analytics import analytics_bp
from .api.predictions import predictions_bp
from .api.skills import skills_bp
from .api.jobs import jobs_bp

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Initialize extensions
    cors.init_app(
        app,
        resources={r"/api/*": {"origins": app.config.get("FRONTEND_ORIGIN", "*")}},
        supports_credentials=True,
    )
    db.init_app(app)

    # Global custom error handlers
    @app.errorhandler(APIError)
    def handle_api_error(err):
        response = jsonify(err.to_dict())
        response.status_code = err.status_code
        return response

    @app.errorhandler(404)
    def handle_not_found(err):
        return jsonify({
            "error": {
                "code": "NOT_FOUND",
                "message": "The requested endpoint or resource was not found."
            }
        }), 404

    @app.errorhandler(500)
    def handle_internal_server_error(err):
        return jsonify({
            "error": {
                "code": "INTERNAL_SERVER_ERROR",
                "message": "An unexpected internal server error occurred."
            }
        }), 500

    # Register blueprints under /api
    app.register_blueprint(health_bp, url_prefix="/api")
    app.register_blueprint(analytics_bp, url_prefix="/api/analytics")
    app.register_blueprint(predictions_bp, url_prefix="/api/predictions")
    app.register_blueprint(skills_bp, url_prefix="/api/skills")
    app.register_blueprint(jobs_bp, url_prefix="/api/jobs")

    return app

