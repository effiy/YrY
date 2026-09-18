"""ASGI middleware — pure ASGI for minimal per-request overhead.

All middleware uses the raw ASGI protocol (``__call__(scope, receive, send)``)
instead of Starlette's ``BaseHTTPMiddleware``. The latter wraps every request in
an ``anyio.create_task_group()`` which adds measurable overhead (~50-100 μs/req).
Pure ASGI middleware avoids this entirely.

When a middleware needs to modify the response (add headers, measure timing), it
intercepts the ``send`` callable passed to the inner app — no response object
allocation needed.
"""

import logging
import os
import time
import uuid

from fastapi import Request
from fastapi.responses import JSONResponse

from domain.auth import verify_jwt
from shared.config import settings
from shared.error_codes import ErrorCode
from shared.response import fail

logger = logging.getLogger(__name__)

_MAX_BODY_BYTES = getattr(settings, 'max_request_body_bytes', 10 * 1024 * 1024)

# Paths exempt from auth checks
_AUTH_WHITELIST = frozenset({
    "/write-file", "/read-file", "/delete-file", "/upload", "/auth/login",
})


# ── BodySizeLimitMiddleware (pure ASGI) ────────────────────────────────────

class BodySizeLimitMiddleware:
    """Reject oversized requests before the body is read.

    Checks ``content-length`` from the ASGI scope headers — no request body
    parsing needed. Returns 413 immediately for oversized payloads.
    """

    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        if scope["type"] != "http":
            return await self.app(scope, receive, send)

        for name, value in scope.get("headers", []):
            if name == b"content-length":
                try:
                    if int(value) > _MAX_BODY_BYTES:
                        resp = JSONResponse(
                            status_code=413,
                            content={"code": ErrorCode.INVALID_REQUEST.business,
                                     "message": f"Request body too large (max {_MAX_BODY_BYTES // (1024 * 1024)}MB)",
                                     "data": None},
                        )
                        return await resp(scope, receive, send)
                except ValueError:
                    pass
                break

        return await self.app(scope, receive, send)


# ── ResponseTimeMiddleware (pure ASGI) ─────────────────────────────────────

class ResponseTimeMiddleware:
    """Add ``X-Response-Time-Ms`` header via ``send`` interception.

    No response object allocation — captures the start time, intercepts the
    first ``send`` call (which carries headers), and injects the timing header.
    """

    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        if scope["type"] != "http":
            return await self.app(scope, receive, send)

        t0 = time.perf_counter()
        _sent = False

        async def _send(message):
            nonlocal _sent
            if not _sent and message["type"] == "http.response.start":
                _sent = True
                elapsed_ms = round((time.perf_counter() - t0) * 1000)
                headers = list(message.get("headers", []))
                headers.append((b"x-response-time-ms", str(elapsed_ms).encode()))
                message["headers"] = headers
            await send(message)

        await self.app(scope, receive, _send)


# ── RequestIdMiddleware (pure ASGI) ────────────────────────────────────────

class RequestIdMiddleware:
    """Assign a unique ``X-Request-ID`` to every request.

    Propagates an incoming ``X-Request-ID`` header if present; otherwise
    generates a new UUID. The id is injected into the response headers and
    attached to ``scope["state"]`` dict for downstream access.
    """

    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        if scope["type"] != "http":
            return await self.app(scope, receive, send)

        request_id = ""
        for name, value in scope.get("headers", []):
            if name == b"x-request-id":
                request_id = value.decode()
                break
        if not request_id:
            request_id = str(uuid.uuid4())

        # Stash in scope for downstream use
        state = scope.setdefault("state", {})
        state["request_id"] = request_id

        _sent = False

        async def _send(message):
            nonlocal _sent
            if not _sent and message["type"] == "http.response.start":
                _sent = True
                headers = list(message.get("headers", []))
                # Don't duplicate if client sent one
                if not any(h[0] == b"x-request-id" for h in headers):
                    headers.append((b"x-request-id", request_id.encode()))
                message["headers"] = headers
            await send(message)

        await self.app(scope, receive, _send)


# ── Auth middleware (pure ASGI) ─────────────────────────────────────────────

_AUTH_STATIC_PREFIXES = (b"/static",)

# Only log auth failures; skip request-completion logging (hot path).
# Enable for debugging by setting YIAI_LOG_AUTH=1.
_LOG_AUTH_REQUESTS = os.getenv("YIAI_LOG_AUTH", "") == "1"


async def _unauthorized_response(scope, receive, send, message: str) -> None:
    """Send a 401 JSON response through the raw ASGI interface."""
    body = fail(error=ErrorCode.UNAUTHORIZED, message=message).body
    await send({
        "type": "http.response.start",
        "status": 401,
        "headers": [
            (b"content-type", b"application/json"),
            (b"content-length", str(len(body)).encode()),
            (b"access-control-allow-origin", b"*"),
            (b"access-control-allow-methods", b"GET, POST, PUT, DELETE, OPTIONS, PATCH"),
            (b"access-control-allow-headers", b"*"),
        ],
    })
    await send({"type": "http.response.body", "body": body, "more_body": False})


class AuthMiddleware:
    """Optional authentication via ``X-Token`` or JWT ``Authorization: Bearer``.

    Disabled by default (``middleware.auth_enabled: false`` in config.yaml).
    When enabled, validates the token on every non-whitelisted request.
    OPTIONS preflight requests are always skipped.
    """

    def __init__(self, app, enabled: bool = False):
        self.app = app
        self._enabled = enabled
        self._required_token = settings.auth_token if enabled else ""

    async def __call__(self, scope, receive, send):
        if scope["type"] != "http":
            return await self.app(scope, receive, send)

        # OPTIONS preflight — always pass through
        if scope["method"] == "OPTIONS":
            return await self.app(scope, receive, send)

        path = scope["path"]

        # Static files — always pass through
        for prefix in _AUTH_STATIC_PREFIXES:
            if path.startswith(prefix):
                return await self.app(scope, receive, send)

        # Whitelisted paths — skip auth
        if path in _AUTH_WHITELIST:
            return await self.app(scope, receive, send)

        # Auth disabled — pass through
        if not self._enabled:
            return await self.app(scope, receive, send)

        # Extract headers from scope (list of (bytes, bytes) tuples)
        headers: dict[str, str] = {}
        for name, value in scope.get("headers", []):
            headers[name.decode().lower()] = value.decode()

        # ── JWT Bearer token ──
        auth_header = headers.get("authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header[7:]
            payload = verify_jwt(token)
            if payload:
                state = scope.setdefault("state", {})
                state["user_id"] = payload.get("sub", "")
                state["username"] = payload.get("username", "")
                return await self.app(scope, receive, send)
            if _LOG_AUTH_REQUESTS:
                logger.warning("Invalid or expired JWT Bearer token")
            return await _unauthorized_response(scope, receive, send, "Invalid or expired token")

        # ── Static X-Token fallback ──
        if not self._required_token:
            return await self.app(scope, receive, send)

        x_token = headers.get("x-token", "")
        if x_token != self._required_token:
            if _LOG_AUTH_REQUESTS:
                logger.warning(f"Invalid request header: X-Token={x_token[:8]}...")
            return await _unauthorized_response(scope, receive, send, "Invalid or missing headers")

        return await self.app(scope, receive, send)


# ── Legacy function-style auth middleware (kept for compatibility) ─────────

# This is the old `header_verification_middleware` used by `app.middleware("http")()`.
_header_verification_middleware = None  # deprecated, kept for import compat


# ── GracefulShutdownMiddleware (pure ASGI) ──────────────────────────────────

# Track in-flight request count for graceful draining.
# Incremented before each request, decremented after. The shutdown handler
# reads this to decide when all requests have completed.
_inflight_count = 0


class GracefulShutdownMiddleware:
    """Track in-flight requests for graceful connection draining.

    Does NOT block or delay any request — just maintains an atomic counter
    so the shutdown handler knows when all in-flight work has completed.
    The counter is exposed via the /debug/performance endpoint.

    Must be the **outermost** middleware (added last) so it wraps all other
    middleware and the route handler.
    """

    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        if scope["type"] != "http":
            return await self.app(scope, receive, send)

        global _inflight_count
        _inflight_count += 1
        try:
            await self.app(scope, receive, send)
        finally:
            _inflight_count -= 1

    @staticmethod
    def inflight() -> int:
        return _inflight_count
