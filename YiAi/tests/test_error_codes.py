"""Tests for shared/error_codes.py."""
from shared.error_codes import ErrorCode, ErrorInfo, map_http_to_error_code
from fastapi import status as http_status


class TestErrorCode:
    def test_ok(self):
        assert ErrorCode.OK.business == 0
        assert ErrorCode.OK.http == 200
        assert ErrorCode.OK.message == "Success"

    def test_client_errors(self):
        assert ErrorCode.INVALID_REQUEST.business == 1000
        assert ErrorCode.INVALID_REQUEST.http == 400

        assert ErrorCode.UNAUTHORIZED.business == 1009
        assert ErrorCode.UNAUTHORIZED.http == 401

        assert ErrorCode.PERMISSION_DENIED.business == 1008
        assert ErrorCode.PERMISSION_DENIED.http == 403

        assert ErrorCode.DATA_NOT_FOUND.business == 1004
        assert ErrorCode.DATA_NOT_FOUND.http == 404

        assert ErrorCode.RATE_LIMITED.business == 1003
        assert ErrorCode.RATE_LIMITED.http == 429

    def test_server_errors(self):
        assert ErrorCode.SERVER_ERROR.business == 5000
        assert ErrorCode.SERVER_ERROR.http == 500

        assert ErrorCode.INTERNAL_ERROR.business == 5001
        assert ErrorCode.INTERNAL_ERROR.http == 500

        assert ErrorCode.DATA_STORE_FAIL.business == 5002
        assert ErrorCode.DATA_STORE_FAIL.http == 500

        assert ErrorCode.DATA_UPDATE_FAIL.business == 5003
        assert ErrorCode.DATA_UPDATE_FAIL.http == 500

        assert ErrorCode.DATA_DESTROY_FAIL.business == 5004
        assert ErrorCode.DATA_DESTROY_FAIL.http == 500

    def test_error_info_is_frozen(self):
        """ErrorInfo is a frozen dataclass."""
        import pytest
        info = ErrorInfo(100, 400, "test")
        with pytest.raises(Exception):
            info.business = 200

    def test_all_business_codes_unique(self):
        """No two error codes should share the same business code."""
        codes = [e.business for e in ErrorCode]
        assert len(codes) == len(set(codes)), f"Duplicate business codes found: {codes}"


class TestMapHttpToErrorCode:
    def test_known_mappings(self):
        assert map_http_to_error_code(401) == ErrorCode.UNAUTHORIZED
        assert map_http_to_error_code(404) == ErrorCode.DATA_NOT_FOUND
        assert map_http_to_error_code(403) == ErrorCode.PERMISSION_DENIED
        assert map_http_to_error_code(400) == ErrorCode.INVALID_REQUEST
        assert map_http_to_error_code(429) == ErrorCode.RATE_LIMITED
        assert map_http_to_error_code(500) == ErrorCode.SERVER_ERROR

    def test_unknown_falls_back_to_server_error(self):
        assert map_http_to_error_code(999) == ErrorCode.SERVER_ERROR
        assert map_http_to_error_code(302) == ErrorCode.SERVER_ERROR