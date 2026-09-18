"""Response helpers — unified envelope + orjson-backed serialization.

orjson is 2-5× faster than stdlib json and returns bytes natively,
avoiding the str→bytes copy that JSONResponse performs internally.
"""
from __future__ import annotations

import hashlib
from typing import Any, Generic, TypeVar

from fastapi.responses import Response
import orjson

from shared.error_codes import ErrorCode

T = TypeVar("T")


class StandardResponse(Generic[T]):
    """Standard response object (kept for backward-compatibility with tests)."""

    def __init__(
        self,
        code: int = 0,
        message: str = "success",
        data: T | None = None,
        http_code: int = 200,
    ):
        self.code = code
        self.message = message
        self.data = data
        self.http_code = http_code

    def to_dict(self) -> dict:
        return {"code": self.code, "message": self.message, "data": self.data}


def _default_serializer(obj: Any) -> Any:
    """Fallback for types orjson doesn't handle natively (e.g. ObjectId)."""
    if hasattr(obj, "__str__"):
        return str(obj)
    raise TypeError(f"Object of type {type(obj)} is not JSON serializable")


class ORJSONResponse(Response):
    """FastAPI-compatible response that serializes with orjson."""

    media_type = "application/json"

    def render(self, content: Any) -> bytes:
        return orjson.dumps(
            content,
            default=_default_serializer,
            option=orjson.OPT_SERIALIZE_NUMPY | orjson.OPT_NON_STR_KEYS,
        )


def _build_content(
    data: list | dict | str | None = None,
    message: str = "success",
    code: int = 0,
    pagination: dict | None = None,
) -> dict[str, Any]:
    content = {"code": code, "message": message, "data": data}
    if pagination:
        content["pagination"] = pagination
    return content


def _etag(value: str) -> str:
    return hashlib.sha256(value.encode()).hexdigest()[:16]


def success(
    data: list | dict | str | None = None,
    message: str = "success",
    code: int = 0,
    pagination: dict | None = None,
    http_code: int = 200,
    cache_ttl: int | None = None,
) -> Response:
    content = _build_content(data=data, message=message, code=code, pagination=pagination)
    headers: dict[str, str] = {}
    if cache_ttl is not None:
        headers["Cache-Control"] = f"public, max-age={cache_ttl}"
        headers["ETag"] = _etag(orjson.dumps(content, default=_default_serializer).decode())
    return ORJSONResponse(
        content=content,
        status_code=http_code,
        headers=headers,
    )


def fail(
    error: ErrorCode,
    message: str | None = None,
    data: Any = None,
) -> Response:
    content = _build_content(
        data=data,
        message=message or error.message,
        code=error.business,
    )
    return ORJSONResponse(
        content=content,
        status_code=error.http,
    )
