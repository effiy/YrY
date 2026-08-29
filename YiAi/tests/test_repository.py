"""Tests for data/repository.py — pure helper functions."""
import re
import pytest
from data.repository import (
    _build_filter,
    _validate_collection_name,
    _handle_string_search_filter,
    _handle_range_or_list_filter,
)


class TestValidateCollectionName:
    def test_valid_name(self):
        assert _validate_collection_name("sessions") == "sessions"

    def test_empty_raises(self):
        with pytest.raises(ValueError, match="Collection name"):
            _validate_collection_name("")

    def test_none_raises(self):
        with pytest.raises(ValueError, match="Collection name"):
            _validate_collection_name(None)


class TestBuildFilter:
    def test_empty_params(self):
        assert _build_filter({}) == {}

    def test_falsy_values_skipped(self):
        assert _build_filter({"name": ""}) == {}
        assert _build_filter({"name": None}) == {}

    def test_string_search(self):
        result = _build_filter({"title": "hello"})
        assert isinstance(result["title"], re.Pattern)
        assert result["title"].search("hello world")

    def test_string_search_case_insensitive(self):
        result = _build_filter({"title": "Hello"})
        assert result["title"].search("HELLO")

    def test_comma_separated_terms(self):
        result = _build_filter({"title": "foo, bar"})
        assert "$or" in result
        assert len(result["$or"]) == 2
        assert result["$or"][0]["title"].search("foo")
        assert result["$or"][1]["title"].search("bar")

    def test_exact_key_match(self):
        result = _build_filter({"key": "abc123"})
        assert result == {"key": "abc123"}

    def test_mongo_operator_passthrough(self):
        result = _build_filter({"$or": [{"status": "active"}]})
        assert result == {"$or": [{"status": "active"}]}

    def test_field_operator_dict_passthrough(self):
        result = _build_filter({"age": {"$gte": 18}})
        assert result == {"age": {"$gte": 18}}

    def test_number_value(self):
        result = _build_filter({"count": 42})
        assert result == {"count": 42}

    def test_boolean_value(self):
        result = _build_filter({"active": True})
        assert result == {"active": True}

    def test_range_list_numeric(self):
        result = _build_filter({"score": [10, 100]})
        assert result == {"score": {"$gte": 10.0, "$lt": 100.0}}

    def test_range_list_strings_falls_through_to_in(self):
        result = _build_filter({"tags": ["work", "personal"]})
        assert result == {"tags": {"$in": ["work", "personal"]}}


class TestHandleStringSearchFilter:
    def test_single_term(self):
        fd: dict = {}
        assert _handle_string_search_filter("name", "test", fd) is True
        assert isinstance(fd["name"], re.Pattern)

    def test_comma_terms(self):
        fd: dict = {}
        assert _handle_string_search_filter("name", "a, b", fd) is True
        assert "$or" in fd
        assert len(fd["$or"]) == 2

    def test_non_string_returns_false(self):
        fd: dict = {}
        assert _handle_string_search_filter("name", 123, fd) is False
        assert fd == {}


class TestHandleRangeOrListFilter:
    def test_two_numeric_range(self):
        fd: dict = {}
        assert _handle_range_or_list_filter("score", [0, 100], fd) is True
        assert fd == {"score": {"$gte": 0.0, "$lt": 100.0}}

    def test_list_of_strings(self):
        fd: dict = {}
        assert _handle_range_or_list_filter("tags", ["a", "b", "c"], fd) is True
        assert fd == {"tags": {"$in": ["a", "b", "c"]}}

    def test_non_iterable_returns_false(self):
        fd: dict = {}
        assert _handle_range_or_list_filter("name", "not-a-list", fd) is False
        assert fd == {}

    def test_empty_list(self):
        fd: dict = {}
        assert _handle_range_or_list_filter("tags", [], fd) is True
        assert fd == {}