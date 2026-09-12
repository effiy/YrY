"""Auth middleware - handles request header verification"""
import logging
import os
from fastapi import Request
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from shared.config import settings
from shared.response import fail
from shared.error_codes import ErrorCode
from domain.auth import verify_jwt

# Default: 10MB max request body
_MAX_BODY_BYTES = getattr(settings, 'max_request_body_bytes', 10 * 1024 * 1024)


class BodySizeLimitMiddleware(BaseHTTPMiddleware):
    """Reject requests whose Content-Length exceeds the configured maximum."""

    async def dispatch(self, request: Request, call_next):
        content_length = request.headers.get("content-length")
        if content_length:
            try:
                if int(content_length) > _MAX_BODY_BYTES:
                    return JSONResponse(
                        status_code=413,
                        content=fail(
                            error=ErrorCode.INVALID_REQUEST,
                            message=f"Request body too large (max {_MAX_BODY_BYTES // (1024 * 1024)}MB)",
                        ),
                    )
            except ValueError:
                pass
        return await call_next(request)


logger = logging.getLogger(__name__)

CORS_MAX_AGE = "3600"  # 1 hour browser cache for preflight


def _add_cors_headers(response: JSONResponse, request: Request) -> JSONResponse:
    """
    Add CORS headers to response (allow all origins)

    Args:
        response: Original response object
        request: Request object

    Returns:
        JSONResponse: Response object with CORS headers

    Example:
        >>> response = _add_cors_headers(JSONResponse({}), request)
        >>> response.headers["Access-Control-Allow-Origin"]
        '*'
    """
    # Default to allow all origins, consistent with CORS config in server.py
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS, PATCH"
    response.headers["Access-Control-Allow-Headers"] = "*"
    response.headers["Access-Control-Expose-Headers"] = "*"
    response.headers["Access-Control-Max-Age"] = CORS_MAX_AGE

    return response


async def header_verification_middleware(request: Request, call_next):
    """
    Request header verification middleware
    Validates X-Token header (if env var is configured)

    Args:
        request: Request object
        call_next: Next middleware/handler function

    Returns:
        Response: Response object

    Example:
        >>> # Register in FastAPI app
        >>> app.add_middleware(header_verification_middleware)
    """
    try:
        # Log request info
        content_type = request.headers.get("content-type", "")
        logger.info(f"Request received: {request.method} {request.url}, Content-Type: {content_type}")

        # Skip OPTIONS preflight requests, let CORS middleware handle them
        if request.method == "OPTIONS":
            response = await call_next(request)
            return response

        # Whitelist paths, skip auth
        # write-file/read-file/delete-file/upload are local file operation endpoints, typically called directly by the frontend
        # /auth/login is the login endpoint, no auth needed
        # Content under /static is static assets, no auth needed
        if request.url.path in ["/write-file", "/read-file", "/delete-file", "/upload", "/auth/login"] or request.url.path.startswith("/static"):
            return await call_next(request)

        # Check if middleware is enabled
        enable_middleware = settings.middleware_auth_enabled
        if not enable_middleware:
            response = await call_next(request)
            return response

        # ── JWT Bearer token verification ──
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header[7:]
            payload = verify_jwt(token)
            if payload:
                # Attach user info to request state for downstream handlers
                request.state.user_id = payload.get("sub", "")
                request.state.username = payload.get("username", "")
                response = await call_next(request)
                logger.info(f"Request processed (JWT): {request.method} {request.url}")
                return response
            logger.warning("Invalid or expired JWT Bearer token")
            error_response = fail(
                error=ErrorCode.UNAUTHORIZED,
                message="Invalid or expired token"
            )
            return _add_cors_headers(error_response, request)

        # ── Static X-Token fallback ──
        # Get configuration
        required_token = settings.auth_token

        # If no token configured, skip verification
        if not required_token:
            logger.info("API verification not configured, skipping request header verification")
            response = await call_next(request)
            return response

        x_token = request.headers.get("X-Token", "")

        # Verify request header
        if x_token != required_token:
            logger.warning(f"Invalid request header: X-Token={x_token}")
            error_response = fail(
                error=ErrorCode.UNAUTHORIZED,
                message="Invalid or missing headers"
            )
            # Add CORS headers
            return _add_cors_headers(error_response, request)

        response = await call_next(request)
        logger.info(f"Request processed: {request.method} {request.url}")
        return response

    except Exception as e:
        logger.error(f"Middleware processing exception: {e!s}", exc_info=True)
        is_dev = os.getenv("ENV", "development") == "development"
        message = (
            f"Middleware error: {type(e).__name__}: {e!s}"
            if is_dev
            else "Internal Server Error"
        )
        error_response = fail(
            error=ErrorCode.SERVER_ERROR,
            message=message
        )
        return _add_cors_headers(error_response, request)

