"""Global exception handlers"""
import logging
from fastapi import Request, HTTPException
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

from shared.error_codes import ErrorCode, map_http_to_error_code
from shared.response import fail
from shared.exceptions import BusinessException

logger = logging.getLogger(__name__)

async def validation_exception_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
    """Handle request parameter validation errors"""
    error_details = exc.errors()
    error_messages = []

    for error in error_details:
        # Get field path
        loc = error.get("loc", [])
        field = ".".join(str(part) for part in loc if part not in ('body', 'query', 'path'))
        msg = error.get("msg", "Validation failed")
        error_messages.append(f"{field}: {msg}" if field else msg)

    error_msg = "; ".join(error_messages)
    logger.warning(f"Parameter validation failed: {error_msg} | URL: {request.url}")

    return fail(
        error=ErrorCode.INVALID_PARAMS,
        message=f"Parameter validation failed: {error_msg}",
        data=error_details
    )

async def business_exception_handler(request: Request, exc: BusinessException) -> JSONResponse:
    """Handle business logic exceptions"""
    logger.warning(f"Business exception: {exc.message} | Code: {exc.error_code.business}")
    return fail(
        error=exc.error_code,
        message=exc.message,
        data=exc.data
    )

async def http_exception_handler(request: Request, exc: HTTPException) -> JSONResponse:
    """Handle HTTP exceptions raised by FastAPI"""
    logger.warning(f"HTTP exception: {exc.detail} | Status: {exc.status_code}")

    # Attempt to map to custom error code
    error_code = map_http_to_error_code(exc.status_code)

    return fail(
        error=error_code,
        message=str(exc.detail),
    )

async def general_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """Handle uncaught global exceptions"""
    logger.error(f"Unhandled system exception: {str(exc)}", exc_info=True)
    return fail(
        error=ErrorCode.SERVER_ERROR,
        message="Internal server error, please contact administrator"
    )

def register_exception_handlers(app):
    """Register all exception handlers"""
    app.add_exception_handler(RequestValidationError, validation_exception_handler)
    app.add_exception_handler(BusinessException, business_exception_handler)
    app.add_exception_handler(HTTPException, http_exception_handler)
    app.add_exception_handler(Exception, general_exception_handler)
