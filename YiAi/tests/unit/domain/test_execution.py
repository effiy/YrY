"""Tests for domain/execution/executor.py — pure helper functions."""
import pytest
from domain.execution.executor import parse_parameters
from shared.exceptions import BusinessException


class TestParseParameters:
    def test_dict_passthrough(self):
        result = parse_parameters({"key": "value"})
        assert result == {"key": "value"}

    def test_empty_dict(self):
        result = parse_parameters({})
        assert result == {}

    def test_json_string(self):
        result = parse_parameters('{"key": "value"}')
        assert result == {"key": "value"}

    def test_invalid_json(self):
        with pytest.raises(BusinessException, match="Invalid JSON"):
            parse_parameters("not json")

    def test_non_object_json(self):
        with pytest.raises(BusinessException, match="JSON object"):
            parse_parameters("[1, 2, 3]")

    def test_nested_dict(self):
        data = {"a": {"b": 1}}
        result = parse_parameters(data)
        assert result == data

    def test_json_with_unicode(self):
        result = parse_parameters('{"name": "你好"}')
        assert result == {"name": "你好"}