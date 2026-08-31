from fastapi import Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse


class AppError(Exception):
    """Application error with a stable machine-readable code."""

    status_code = 400

    def __init__(self, code: str, message: str, status_code: int | None = None):
        self.code = code
        self.message = message
        if status_code is not None:
            self.status_code = status_code
        super().__init__(message)


def error_response(status_code: int, code: str, message: str) -> JSONResponse:
    return JSONResponse(
        status_code=status_code,
        content={"error": {"code": code, "message": message}},
    )


async def app_error_handler(_: Request, exc: AppError) -> JSONResponse:
    return error_response(exc.status_code, exc.code, exc.message)


async def validation_error_handler(_: Request, exc: RequestValidationError) -> JSONResponse:
    first = exc.errors()[0] if exc.errors() else {}
    field = ".".join(str(p) for p in first.get("loc", []) if p != "body")
    message = f"Invalid value for '{field}'." if field else "Invalid request data."
    return error_response(422, "VALIDATION_ERROR", message)


async def unhandled_error_handler(_: Request, exc: Exception) -> JSONResponse:
    return error_response(500, "INTERNAL_ERROR", "An unexpected error occurred.")
