"""Tests for data/repository.py — pure helper functions."""
import re
import pytest
from shared.exceptions import BusinessException
from data.repository import (
    _validate_collection_name,
    _build_sort_list,
    _BUG_TYPE_DIR,
    _ISSUE_TYPE_DIR,
)
from data.filter_helpers import (
    build_filter,
    _DENIED_OPERATORS,
    _handle_string_search_filter,
    _handle_range_or_list_filter,
    _handle_iso_date_filter,
    _build_published_date_filter,
)
from data.date_helpers import (
    parse_ms_ts,
    rss_doc_published_ms,
    apply_rss_date_filters,
)


class TestValidateCollectionName:
    def test_valid_name(self):
        assert _validate_collection_name("sessions") == "sessions"

    def test_empty_raises(self):
        with pytest.raises(BusinessException, match="Collection name"):
            _validate_collection_name("")

    def test_none_raises(self):
        with pytest.raises(BusinessException, match="Collection name"):
            _validate_collection_name(None)


class TestBuildFilter:
    def test_empty_params(self):
        assert build_filter({}) == {}

    def test_falsy_values_skipped(self):
        assert build_filter({"name": ""}) == {}
        assert build_filter({"name": None}) == {}

    def test_string_search(self):
        result = build_filter({"title": "hello"})
        assert isinstance(result["title"], re.Pattern)
        assert result["title"].search("hello world")

    def test_string_search_case_insensitive(self):
        result = build_filter({"title": "Hello"})
        assert result["title"].search("HELLO")

    def test_comma_separated_terms(self):
        result = build_filter({"title": "foo, bar"})
        assert "$or" in result
        assert len(result["$or"]) == 2
        assert result["$or"][0]["title"].search("foo")
        assert result["$or"][1]["title"].search("bar")

    def test_exact_key_match(self):
        result = build_filter({"key": "abc123"})
        assert result == {"key": "abc123"}

    def test_mongo_operator_passthrough(self):
        result = build_filter({"$or": [{"status": "active"}]})
        assert result == {"$or": [{"status": "active"}]}

    def test_field_operator_dict_passthrough(self):
        result = build_filter({"age": {"$gte": 18}})
        assert result == {"age": {"$gte": 18}}

    def test_number_value(self):
        result = build_filter({"count": 42})
        assert result == {"count": 42}

    def test_boolean_value(self):
        result = build_filter({"active": True})
        assert result == {"active": True}

    def test_range_list_numeric(self):
        result = build_filter({"score": [10, 100]})
        assert result == {"score": {"$gte": 10.0, "$lt": 100.0}}

    def test_range_list_strings_falls_through_to_in(self):
        result = build_filter({"tags": ["work", "personal"]})
        assert result == {"tags": {"$in": ["work", "personal"]}}


class TestBuildFilterSecurity:
    def test_blocked_where_operator_is_stripped(self):
        result = build_filter({"$where": "this.status == 'open'"})
        assert "$where" not in result

    def test_blocked_function_operator_is_stripped(self):
        result = build_filter({"$function": "function() { return true; }"})
        assert "$function" not in result

    def test_blocked_accumulator_operator_is_stripped(self):
        result = build_filter({"$accumulator": "some js"})
        assert "$accumulator" not in result

    def test_blocked_query_operator_is_stripped(self):
        result = build_filter({"$query": {"status": "open"}})
        assert "$query" not in result

    def test_safe_operators_still_pass_through(self):
        result = build_filter({"$or": [{"a": 1}, {"b": 2}]})
        assert result == {"$or": [{"a": 1}, {"b": 2}]}

    def test_field_level_operators_still_pass_through(self):
        result = build_filter({"age": {"$gte": 18, "$lte": 65}})
        assert result == {"age": {"$gte": 18, "$lte": 65}}

    def test_denied_operators_set_is_complete(self):
        assert "$where" in _DENIED_OPERATORS
        assert "$function" in _DENIED_OPERATORS
        assert "$accumulator" in _DENIED_OPERATORS
        assert "$query" in _DENIED_OPERATORS


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

    def test_single_numeric_element_range(self):
        fd: dict = {}
        assert _handle_range_or_list_filter("score", [10], fd) is True
        assert fd == {"score": {"$in": [10]}}

    def test_three_element_list(self):
        fd: dict = {}
        assert _handle_range_or_list_filter("tags", ["a", "b", "c"], fd) is True
        assert fd == {"tags": {"$in": ["a", "b", "c"]}}

    def test_mixed_numeric_string_pairs(self):
        fd: dict = {}
        assert _handle_range_or_list_filter("field", [10, "hello"], fd) is True
        # Mixed types → falls through to $in list (can't form a coherent range)
        assert fd == {"field": {"$in": [10, "hello"]}}

    def test_single_number_start_only(self):
        fd: dict = {}
        assert _handle_range_or_list_filter("score", [10, "not-a-number"], fd) is True
        # Mixed types → falls through to $in list
        assert fd == {"score": {"$in": [10, "not-a-number"]}}

    def test_single_number_end_only(self):
        fd: dict = {}
        assert _handle_range_or_list_filter("score", ["not-a-number", 100], fd) is True
        # Mixed types → falls through to $in list
        assert fd == {"score": {"$in": ["not-a-number", 100]}}


class TestParseMsTs:
    def test_none_returns_none(self):
        assert parse_ms_ts(None) is None

    def test_seconds_precision_int(self):
        # 10-digit timestamp = seconds
        result = parse_ms_ts(1724900000)
        assert result == 1724900000000

    def test_milliseconds_precision_int(self):
        # 13-digit timestamp = milliseconds
        result = parse_ms_ts(1724900000000)
        assert result == 1724900000000

    def test_float_seconds(self):
        result = parse_ms_ts(1724900000.0)
        assert result == 1724900000000

    def test_numeric_string_seconds(self):
        result = parse_ms_ts("1724900000")
        assert result == 1724900000000

    def test_numeric_string_milliseconds(self):
        result = parse_ms_ts("1724900000000")
        assert result == 1724900000000

    def test_iso_date_string(self):
        result = parse_ms_ts("2024-08-28T10:00:00Z")
        assert result is not None
        assert result > 1724800000000

    def test_iso_date_no_tz(self):
        result = parse_ms_ts("2024-08-28 10:00:00")
        assert result is not None

    def test_simple_date(self):
        result = parse_ms_ts("2024-08-28")
        assert result is not None

    def test_empty_string(self):
        assert parse_ms_ts("") is None

    def test_invalid_string(self):
        assert parse_ms_ts("not-a-date") is None

    def test_whitespace_string(self):
        assert parse_ms_ts("   ") is None


class TestBuildPublishedDateFilter:
    def test_valid_range(self):
        result = _build_published_date_filter("2024-08-01", "2024-08-03")
        assert "$or" in result
        assert len(result["$or"]) > 0

    def test_invalid_range(self):
        result = _build_published_date_filter("invalid", "also-invalid")
        assert result == {}


class TestHandleIsoDateFilter:
    def test_non_iso_date_key_returns_false(self):
        fd: dict = {}
        assert _handle_iso_date_filter("title", "2024-08-01", fd) is False
        assert fd == {}

    def test_non_string_value_returns_false(self):
        fd: dict = {}
        assert _handle_iso_date_filter("isoDate", 123, fd) is False
        assert fd == {}

    def test_single_valid_date(self):
        fd: dict = {}
        assert _handle_iso_date_filter("isoDate", "2024-08-01", fd) is True
        assert "$or" in fd

    def test_comma_range_valid_dates(self):
        fd: dict = {}
        assert _handle_iso_date_filter("isoDate", "2024-08-01, 2024-08-03", fd) is True
        assert "$or" in fd

    def test_invalid_date_returns_false(self):
        fd: dict = {}
        assert _handle_iso_date_filter("isoDate", "not-a-date", fd) is False
        assert fd == {}

    def test_invalid_range_dates(self):
        fd: dict = {}
        assert _handle_iso_date_filter("isoDate", "bad, also-bad", fd) is False
        assert fd == {}


class TestBuildSortList:
    def test_default_sort(self):
        result = _build_sort_list("updatedTime", -1)
        assert len(result) >= 1
        assert result[0][0] == "updatedTime"

    def test_order_sort(self):
        result = _build_sort_list("order", 1)
        assert result[0] == ("order", 1)

    def test_sort_ascending(self):
        result = _build_sort_list("createdTime", 1)
        assert result[0] == ("createdTime", 1)

    def test_sort_descending(self):
        result = _build_sort_list("title", -1)
        assert result[0] == ("title", -1)


class TestKnownProjectTypes:
    """Tests for _KNOWN_PROJECT_TYPES static map."""

    def test_known_types(self):
        assert _BUG_TYPE_DIR["functional"] == "logic"
        assert _BUG_TYPE_DIR["performance"] == "performance"
        assert _BUG_TYPE_DIR["ui"] == "style"
        assert _BUG_TYPE_DIR["security"] == "security"
        assert _BUG_TYPE_DIR["other"] == "other"


class TestIssueTypeDir:
    def test_known_types(self):
        assert _ISSUE_TYPE_DIR["bug"] == "bug"
        assert _ISSUE_TYPE_DIR["task"] == "task"
        assert _ISSUE_TYPE_DIR["feature"] == "feature"
        assert _ISSUE_TYPE_DIR["improvement"] == "improvement"