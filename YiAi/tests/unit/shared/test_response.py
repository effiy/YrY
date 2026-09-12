"""Tests for shared/response.py."""
import json
from shared.response import StandardResponse, success, fail
from shared.error_codes import ErrorCode


class TestStandardResponse:
    def test_defaults(self):
        resp = StandardResponse()
        assert resp.code == 0
        assert resp.message == "success"
        assert resp.data is None
        assert resp.http_code == 200

    def test_custom_values(self):
        resp = StandardResponse(code=1001, message="error", data={"key": "val"}, http_code=400)
        assert resp.code == 1001
        assert resp.message == "error"
        assert resp.data == {"key": "val"}
        assert resp.http_code == 400

    def test_to_dict(self):
        resp = StandardResponse(code=0, message="ok", data=[1, 2, 3])
        d = resp.to_dict()
        assert d == {"code": 0, "message": "ok", "data": [1, 2, 3]}
        # http_code not included in body
        assert "http_code" not in d


class TestSuccess:
    def test_basic_success(self):
        resp = success()
        body = json.loads(resp.body)
        assert body["code"] == 0
        assert body["message"] == "success"
        assert body["data"] is None

    def test_success_with_data(self):
        resp = success(data={"items": [1, 2]})
        body = json.loads(resp.body)
        assert body["data"] == {"items": [1, 2]}

    def test_success_with_pagination(self):
        resp = success(data=[], pagination={"total": 100, "page": 1})
        body = json.loads(resp.body)
        assert body["pagination"] == {"total": 100, "page": 1}

    def test_success_custom_message_and_code(self):
        resp = success(message="created", http_code=201)
        assert resp.status_code == 201
        body = json.loads(resp.body)
        assert body["message"] == "created"


class TestFail:
    def test_basic_fail(self):
        resp = fail(ErrorCode.DATA_NOT_FOUND)
        body = json.loads(resp.body)
        assert body["code"] == ErrorCode.DATA_NOT_FOUND.business
        assert resp.status_code == ErrorCode.DATA_NOT_FOUND.http

    def test_fail_custom_message(self):
        resp = fail(ErrorCode.INVALID_PARAMS, message="Missing required field: name")
        body = json.loads(resp.body)
        assert body["message"] == "Missing required field: name"

    def test_fail_with_data(self):
        resp = fail(ErrorCode.INVALID_PARAMS, data={"field": "name"})
        body = json.loads(resp.body)
        assert body["data"] == {"field": "name"}