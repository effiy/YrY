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

        assert ErrorCode.RATE_LIMITED.business == 1005
        assert ErrorCode.RATE_LIMITED.http == 429

    def test_server_errors(self):
        assert ErrorCode.SERVER_ERROR.business == 5000
        assert ErrorCode.SERVER_ERROR.http == 500

        assert ErrorCode.INTERNAL_ERROR.business == 5005
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
        """No two semantically distinct error codes should share the same business code.
        Intentional alias pairs (same code, different semantics for backward compat) are excluded."""
        aliases = {
            "KNOWLEDGE_FILE_NOT_FOUND",  # alias of FILE_NOT_FOUND (both 3002)
        }
        codes = [(e.name, e.business) for e in ErrorCode if e.name not in aliases]
        names = [n for n, _ in codes]
        values = [v for _, v in codes]
        assert len(values) == len(set(values)), \
            f"Duplicate business codes found: {dict(zip(names, values))}"


class TestMapHttpToErrorCode:
    def test_known_mappings(self):
        assert map_http_to_error_code(401) == ErrorCode.UNAUTHORIZED
        assert map_http_to_error_code(404) == ErrorCode.DATA_NOT_FOUND
        assert map_http_to_error_code(403) == ErrorCode.PERMISSION_DENIED
        assert map_http_to_error_code(400) == ErrorCode.INVALID_REQUEST
        assert map_http_to_error_code(429) == ErrorCode.RATE_LIMITED
        assert map_http_to_error_code(500) == ErrorCode.SERVER_ERROR
        assert map_http_to_error_code(503) == ErrorCode.AI_UNAVAILABLE
        assert map_http_to_error_code(504) == ErrorCode.AI_TIMEOUT

    def test_unknown_falls_back_to_server_error(self):
        assert map_http_to_error_code(999) == ErrorCode.SERVER_ERROR
        assert map_http_to_error_code(302) == ErrorCode.SERVER_ERROR


class TestNewErrorCodes:
    """RPC-spec-aligned error codes added for cross-project consistency."""

    def test_ai_errors(self):
        assert ErrorCode.AI_UNAVAILABLE.business == 2001
        assert ErrorCode.AI_UNAVAILABLE.http == 503
        assert ErrorCode.AI_TIMEOUT.business == 2002
        assert ErrorCode.AI_TIMEOUT.http == 504

    def test_file_errors(self):
        assert ErrorCode.FILE_READ_WRITE_FAILED.business == 3001
        assert ErrorCode.FILE_NOT_FOUND.business == 3002
        assert ErrorCode.FILE_NOT_FOUND.http == 404

    def test_auth_errors(self):
        assert ErrorCode.AUTH_FAILED.business == 4001
        assert ErrorCode.INSUFFICIENT_PERMISSION.business == 4002

    def test_database_error(self):
        assert ErrorCode.DATABASE_ERROR.business == 5001
        assert ErrorCode.DATABASE_ERROR.http == 500

    def test_unknown_error(self):
        assert ErrorCode.UNKNOWN_INTERNAL_ERROR.business == 9999
        assert ErrorCode.UNKNOWN_INTERNAL_ERROR.http == 500

    def test_resource_already_exists(self):
        assert ErrorCode.RESOURCE_ALREADY_EXISTS.business == 1003
        assert ErrorCode.RESOURCE_ALREADY_EXISTS.http == 409