"""Error code definitions
- Business error codes use 4-digit grouping: 1xxx for client errors, 5xxx for server errors
- Uses enum to manage all error codes
"""
from enum import Enum
from dataclasses import dataclass
from fastapi import status as http_status

@dataclass(frozen=True)
class ErrorInfo:
    business: int
    http: int
    message: str

class ErrorCode(Enum):
    # Success
    OK = ErrorInfo(0, http_status.HTTP_200_OK, "Success")

    # Client errors
    INVALID_REQUEST = ErrorInfo(1000, http_status.HTTP_400_BAD_REQUEST, "Invalid Request")
    INVALID_PARAMS = ErrorInfo(1002, http_status.HTTP_400_BAD_REQUEST, "Invalid Parameters")
    RATE_LIMITED = ErrorInfo(1003, http_status.HTTP_429_TOO_MANY_REQUESTS, "Too Many Requests")
    BUSINESS_ERROR = ErrorInfo(1001, http_status.HTTP_400_BAD_REQUEST, "Business Error")
    DATA_NOT_FOUND = ErrorInfo(1004, http_status.HTTP_404_NOT_FOUND, "Resource Not Found")
    UNAUTHORIZED = ErrorInfo(1009, http_status.HTTP_401_UNAUTHORIZED, "Unauthorized")
    PERMISSION_DENIED = ErrorInfo(1008, http_status.HTTP_403_FORBIDDEN, "Permission Denied")

    # Server errors
    SERVER_ERROR = ErrorInfo(5000, http_status.HTTP_500_INTERNAL_SERVER_ERROR, "Server Busy")
    INTERNAL_ERROR = ErrorInfo(5001, http_status.HTTP_500_INTERNAL_SERVER_ERROR, "Internal Error")
    DATA_STORE_FAIL = ErrorInfo(5002, http_status.HTTP_500_INTERNAL_SERVER_ERROR, "Create Failed")
    DATA_UPDATE_FAIL = ErrorInfo(5003, http_status.HTTP_500_INTERNAL_SERVER_ERROR, "Update Failed")
    DATA_DESTROY_FAIL = ErrorInfo(5004, http_status.HTTP_500_INTERNAL_SERVER_ERROR, "Delete Failed")

    @property
    def business(self) -> int:
        return self.value.business

    @property
    def http(self) -> int:
        return self.value.http

    @property
    def message(self) -> str:
        return self.value.message

def map_http_to_error_code(status: int) -> ErrorCode:
    """Map HTTP status code to business error code"""
    mapping = {
        http_status.HTTP_401_UNAUTHORIZED: ErrorCode.UNAUTHORIZED,
        http_status.HTTP_404_NOT_FOUND: ErrorCode.DATA_NOT_FOUND,
        http_status.HTTP_403_FORBIDDEN: ErrorCode.PERMISSION_DENIED,
        http_status.HTTP_400_BAD_REQUEST: ErrorCode.INVALID_REQUEST,
        http_status.HTTP_429_TOO_MANY_REQUESTS: ErrorCode.RATE_LIMITED,
        http_status.HTTP_500_INTERNAL_SERVER_ERROR: ErrorCode.SERVER_ERROR,
    }
    return mapping.get(status, ErrorCode.SERVER_ERROR)
