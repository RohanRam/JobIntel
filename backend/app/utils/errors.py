from flask import jsonify

class APIError(Exception):
    def __init__(self, message, code="BAD_REQUEST", status_code=400, details=None):
        super().__init__(message)
        self.message = message
        self.code = code
        self.status_code = status_code
        self.details = details

    def to_dict(self):
        err = {"code": self.code, "message": self.message}
        if self.details is not None:
            err["details"] = self.details
        return {"error": err}

def make_error_response(message, code="BAD_REQUEST", status_code=400, details=None):
    err = {"code": code, "message": message}
    if details is not None:
        err["details"] = details
    return jsonify({"error": err}), status_code

