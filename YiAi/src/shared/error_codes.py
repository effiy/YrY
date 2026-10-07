"""Error code definitions aligned with RPC protocol spec (root CLAUDE.md).

Standard RPC Error Codes:
    0    — Success
    1001 — Parameter Validation Failed  →  INVALID_PARAMS (code 1002, legacy)
    1002 — Resource Not Found           →  DATA_NOT_FOUND (code 1004, legacy)
    1003 — Resource Already Exists      →  RESOURCE_ALREADY_EXISTS
    2001 — AI Service Unavailable       →  AI_UNAVAILABLE
    2002 — AI Inference Timeout         →  AI_TIMEOUT
    3001 — File Read/Write Failed       →  FILE_READ_WRITE_FAILED
    3002 — File Not Found               →  FILE_NOT_FOUND
    4001 — Authentication Failed        →  AUTH_FAILED
    4002 — Insufficient Permission      →  INSUFFICIENT_PERMISSION
    5001 — Database Error               →  DATABASE_ERROR
    9999 — Unknown Internal Error       →  UNKNOWN_INTERNAL_ERROR

Legacy codes retained for backward compatibility:
    1000 INVALID_REQUEST, 1002 INVALID_PARAMS, 1003 RATE_LIMITED,
    1001 BUSINESS_ERROR, 1004 DATA_NOT_FOUND, 1008 PERMISSION_DENIED,
    1009 UNAUTHORIZED, 5000 SERVER_ERROR, 5001 DATABASE_ERROR (legacy: INTERNAL_ERROR),
    5002-5004 DATA_STORE/UPDATE/DESTROY_FAIL
"""
from dataclasses import dataclass
from enum import Enum

from fastapi import status as http_status


@dataclass(frozen=True)
class ErrorInfo:
    business: int
    http: int
    message: str

class ErrorCode(Enum):
    # Success
    OK = ErrorInfo(0, http_status.HTTP_200_OK, "Success")

    # ── Client errors (1xxx) ──
    INVALID_REQUEST = ErrorInfo(1000, http_status.HTTP_400_BAD_REQUEST, "Invalid Request")
    BUSINESS_ERROR = ErrorInfo(1001, http_status.HTTP_400_BAD_REQUEST, "Business Error")
    INVALID_PARAMS = ErrorInfo(1002, http_status.HTTP_400_BAD_REQUEST, "Invalid Parameters")
    RATE_LIMITED = ErrorInfo(1005, http_status.HTTP_429_TOO_MANY_REQUESTS, "Too Many Requests")
    RESOURCE_ALREADY_EXISTS = ErrorInfo(1003, http_status.HTTP_409_CONFLICT, "Resource Already Exists")
    DATA_NOT_FOUND = ErrorInfo(1004, http_status.HTTP_404_NOT_FOUND, "Resource Not Found")
    PERMISSION_DENIED = ErrorInfo(1008, http_status.HTTP_403_FORBIDDEN, "Permission Denied")
    UNAUTHORIZED = ErrorInfo(1009, http_status.HTTP_401_UNAUTHORIZED, "Unauthorized")

    # ── AI service errors (2xxx) — RPC Spec: 2001/2002 ──
    AI_UNAVAILABLE = ErrorInfo(2001, http_status.HTTP_503_SERVICE_UNAVAILABLE, "AI Service Unavailable")
    AI_TIMEOUT = ErrorInfo(2002, http_status.HTTP_504_GATEWAY_TIMEOUT, "AI Inference Timeout")

    # ── File errors (3xxx) — RPC Spec: 3001/3002 ──
    FILE_READ_WRITE_FAILED = ErrorInfo(3001, http_status.HTTP_500_INTERNAL_SERVER_ERROR, "File Read/Write Failed")
    FILE_NOT_FOUND = ErrorInfo(3002, http_status.HTTP_404_NOT_FOUND, "File Not Found")
    KNOWLEDGE_FILE_NOT_FOUND = ErrorInfo(3002, http_status.HTTP_404_NOT_FOUND, "Knowledge File Not Found")

    # ── Auth errors (4xxx) — RPC Spec: 4001/4002 ──
    AUTH_FAILED = ErrorInfo(4001, http_status.HTTP_401_UNAUTHORIZED, "Authentication Failed")
    INSUFFICIENT_PERMISSION = ErrorInfo(4002, http_status.HTTP_403_FORBIDDEN, "Insufficient Permission")

    # ── Server errors (5xxx) ──
    SERVER_ERROR = ErrorInfo(5000, http_status.HTTP_500_INTERNAL_SERVER_ERROR, "Server Busy")
    DATABASE_ERROR = ErrorInfo(5001, http_status.HTTP_500_INTERNAL_SERVER_ERROR, "Database Error")
    INTERNAL_ERROR = ErrorInfo(5005, http_status.HTTP_500_INTERNAL_SERVER_ERROR, "Internal Error")
    DATA_STORE_FAIL = ErrorInfo(5002, http_status.HTTP_500_INTERNAL_SERVER_ERROR, "Create Failed")
    DATA_UPDATE_FAIL = ErrorInfo(5003, http_status.HTTP_500_INTERNAL_SERVER_ERROR, "Update Failed")
    DATA_DESTROY_FAIL = ErrorInfo(5004, http_status.HTTP_500_INTERNAL_SERVER_ERROR, "Delete Failed")
    UNKNOWN_INTERNAL_ERROR = ErrorInfo(9999, http_status.HTTP_500_INTERNAL_SERVER_ERROR, "Unknown Internal Error")

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
        http_status.HTTP_503_SERVICE_UNAVAILABLE: ErrorCode.AI_UNAVAILABLE,
        http_status.HTTP_504_GATEWAY_TIMEOUT: ErrorCode.AI_TIMEOUT,
    }
    return mapping.get(status, ErrorCode.SERVER_ERROR)
