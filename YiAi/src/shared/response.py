"""Response object wrapper
- Defines unified response object StandardResponse
- Provides success and fail helper functions
"""
from typing import Union, Generic, TypeVar, Optional, Any
from fastapi.responses import JSONResponse, Response
from fastapi.encoders import jsonable_encoder
from shared.error_codes import ErrorCode

T = TypeVar("T")

class StandardResponse(Generic[T]):
    """
    Standard response object
    """
    def __init__(
        self,
        code: int = 0,
        message: str = "success",
        data: Optional[T] = None,
        http_code: int = 200
    ):
        self.code = code        # Business status code
        self.message = message  # Status message
        self.data = data        # Data payload
        self.http_code = http_code # HTTP status code (not included in response body, only used for status_code)

    def to_dict(self) -> dict:
        return {
            "code": self.code,
            "message": self.message,
            "data": self.data
        }

def success(
    data: Union[list, dict, str, None] = None,
    message: str = "success",
    pagination: dict = None,
    http_code: int = 200
) -> Response:
    """
    Create success response
    """
    content = {
        "code": ErrorCode.OK.business,
        "message": message,
        "data": data
    }
    if pagination:
        content["pagination"] = pagination

    return JSONResponse(
        status_code=http_code,
        content=jsonable_encoder(content)
    )

def fail(
    error: ErrorCode,
    message: str = None,
    data: Any = None
) -> Response:
    """
    Create failure response
    """
    return JSONResponse(
        status_code=error.http,
        content=jsonable_encoder({
            "code": error.business,
            "message": message or error.message,
            "data": data
        })
    )
