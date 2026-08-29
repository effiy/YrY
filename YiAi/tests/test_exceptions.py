"""Tests for shared/exceptions.py."""
import pytest
from shared.exceptions import BusinessException
from shared.error_codes import ErrorCode


class TestBusinessException:
    def test_with_error_code(self):
        exc = BusinessException(ErrorCode.DATA_NOT_FOUND)
        assert exc.error_code == ErrorCode.DATA_NOT_FOUND
        assert exc.message == ErrorCode.DATA_NOT_FOUND.message
        assert exc.data is None

    def test_custom_message(self):
        exc = BusinessException(ErrorCode.INVALID_PARAMS, message="Custom error")
        assert exc.error_code == ErrorCode.INVALID_PARAMS
        assert exc.message == "Custom error"

    def test_with_data(self):
        exc = BusinessException(ErrorCode.INVALID_PARAMS, data={"field": "email"})
        assert exc.data == {"field": "email"}

    def test_is_exception(self):
        exc = BusinessException(ErrorCode.SERVER_ERROR)
        assert isinstance(exc, Exception)

    def test_string_representation(self):
        exc = BusinessException(ErrorCode.DATA_NOT_FOUND)
        assert str(exc) == ErrorCode.DATA_NOT_FOUND.message