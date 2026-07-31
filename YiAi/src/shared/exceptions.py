"""Custom exception definitions"""
from typing import Any, Optional
from shared.error_codes import ErrorCode

class BusinessException(Exception):
    """
    Business logic exception
    When raised, this exception is caught by the global exception handler and returns a standard error response
    """
    def __init__(
        self,
        error_code: ErrorCode,
        message: Optional[str] = None,
        data: Any = None
    ):
        self.error_code = error_code
        self.message = message or error_code.message
        self.data = data
        super().__init__(self.message)
