"""Tests for domain/ai/data_tools.py — pure helper functions."""
import pytest
from domain.ai.data_tools import (
    _require_cname,
    _require_writable,
    _coerce_fields,
    _format_schema,
    json_dumps_safe,
    _COLLECTION_SCHEMAS,
)


class TestRequireCname:
    def test_valid(self):
        assert _require_cname({"cname": "menus"}) == "menus"

    def test_empty_raises(self):
        with pytest.raises(ValueError, match="cname"):
            _require_cname({"cname": ""})

    def test_missing_raises(self):
        with pytest.raises(ValueError, match="cname"):
            _require_cname({})


class TestRequireWritable:
    def test_writable_collection(self):
        _require_writable("menus")  # does not raise

    def test_non_writable_raises(self):
        with pytest.raises(ValueError, match="read-only"):
            _require_writable("sessions")

    def test_unknown_raises(self):
        with pytest.raises(ValueError, match="read-only"):
            _require_writable("nonexistent")


class TestCoerceFields:
    def test_none(self):
        assert _coerce_fields(None) is None

    def test_list(self):
        assert _coerce_fields(["key", "name", "path"]) == "key,name,path"

    def test_tuple(self):
        assert _coerce_fields(("key", "name")) == "key,name"

    def test_string(self):
        assert _coerce_fields("key,name,path") == "key,name,path"

    def test_empty_string(self):
        assert _coerce_fields("") is None

    def test_whitespace_string(self):
        assert _coerce_fields("   ") is None


class TestFormatSchema:
    def test_includes_description(self):
        entry = _COLLECTION_SCHEMAS["menus"]
        result = _format_schema("menus", entry)
        assert "menus" in result
        assert "sidebar menu" in result.lower()

    def test_includes_rules(self):
        entry = _COLLECTION_SCHEMAS["menus"]
        result = _format_schema("menus", entry)
        assert "Rules" in result
        assert "DEAD LINK" in result

    def test_includes_fields(self):
        entry = _COLLECTION_SCHEMAS["menus"]
        result = _format_schema("menus", entry)
        assert "key" in result
        assert "path" in result
        assert "meta" in result

    def test_writable_note(self):
        entry = _COLLECTION_SCHEMAS["menus"]
        result = _format_schema("menus", entry)
        assert "requires confirmation" in result

    def test_read_only_schema(self):
        entry = {"description": "Test", "writable": False, "fields": {}}
        result = _format_schema("test", entry)
        assert "read-only" in result

    def test_no_rules(self):
        entry = {"description": "Test", "writable": False, "fields": {"key": "string id"}}
        result = _format_schema("test", entry)
        assert "Rules" not in result


class TestJsonDumpsSafe:
    def test_simple_dict(self):
        result = json_dumps_safe({"a": 1, "b": "hello"})
        assert "a" in result
        assert "hello" in result

    def test_unicode(self):
        result = json_dumps_safe({"name": "中文"})
        assert "中文" in result

    def test_non_serializable_fallback(self):
        # Objects with non-serializable types fall back to str()
        result = json_dumps_safe({"fn": lambda: None})
        assert isinstance(result, str)