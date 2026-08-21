"""Tests for shared/utils.py — pure utility functions."""
import pytest
from shared.utils import (
    estimate_tokens,
    clean_text,
    truncate_text,
    generate_md5,
    generate_random_string,
    extract_json_from_text,
    is_valid_date,
    is_number,
    format_file_size,
    format_tokens,
    format_tokens_with_commas,
    chunk_list,
)


class TestEstimateTokens:
    def test_empty_string(self):
        assert estimate_tokens("") == 0

    def test_non_string(self):
        assert estimate_tokens(None) == 0
        assert estimate_tokens(123) == 0

    def test_ascii_text(self):
        # 4 chars per token
        result = estimate_tokens("hello")
        assert result == 1  # 5 * 0.25 = 1.25 → 1

    def test_cjk_text(self):
        # 1 token per CJK char
        assert estimate_tokens("你好世界") == 4

    def test_mixed_text(self):
        # "Hello世界" = 5 ASCII * 0.25 + 2 CJK = 1.25 + 2 = 3.25 → 3
        assert estimate_tokens("Hello世界") == 3


class TestCleanText:
    def test_strips_whitespace(self):
        assert clean_text("  hello  ") == "hello"

    def test_collapses_whitespace(self):
        assert clean_text("hello   world") == "hello world"

    def test_empty(self):
        assert clean_text("") == ""
        assert clean_text(None) == ""


class TestTruncateText:
    def test_no_truncation_when_short(self):
        assert truncate_text("hello", 10) == "hello"

    def test_truncation_with_ellipsis(self):
        assert truncate_text("hello world", 5) == "hello..."

    def test_custom_ellipsis(self):
        assert truncate_text("hello world", 5, "…") == "hello…"

    def test_empty(self):
        assert truncate_text("", 5) == ""
        assert truncate_text(None, 5) is None


class TestGenerateMd5:
    def test_known_hash(self):
        assert generate_md5("hello") == "5d41402abc4b2a76b9719d911017c592"

    def test_deterministic(self):
        assert generate_md5("test") == generate_md5("test")

    def test_different_inputs(self):
        assert generate_md5("a") != generate_md5("b")


class TestGenerateRandomString:
    def test_default_length(self):
        s = generate_random_string()
        assert len(s) == 8

    def test_custom_length(self):
        assert len(generate_random_string(16)) == 16

    def test_alphanumeric(self):
        s = generate_random_string(100)
        assert all(c.isalnum() for c in s)


class TestExtractJsonFromText:
    def test_direct_json_object(self):
        result = extract_json_from_text('{"a": 1}')
        assert result == {"a": 1}

    def test_direct_json_array(self):
        result = extract_json_from_text('[1, 2, 3]')
        assert result == [1, 2, 3]

    def test_markdown_code_block(self):
        result = extract_json_from_text('```json\n{"key": "val"}\n```')
        assert result == {"key": "val"}

    def test_markdown_code_block_no_lang(self):
        result = extract_json_from_text('```\n{"key": "val"}\n```')
        assert result == {"key": "val"}

    def test_embedded_json_extraction(self):
        result = extract_json_from_text('prefix {"a": 1} suffix')
        assert result == {"a": 1}

    def test_empty_text(self):
        assert extract_json_from_text("") is None
        assert extract_json_from_text(None) is None

    def test_invalid_json(self):
        assert extract_json_from_text("not json at all") is None


class TestIsValidDate:
    def test_valid_date(self):
        assert is_valid_date("2024-01-15") is True

    def test_invalid_dates(self):
        assert is_valid_date("2024-13-01") is False
        assert is_valid_date("not-a-date") is False
        assert is_valid_date("") is False

    def test_non_string(self):
        assert is_valid_date(123) is False
        assert is_valid_date(None) is False


class TestIsNumber:
    def test_integers(self):
        assert is_number(42) is True
        assert is_number(0) is True
        assert is_number(-1) is True

    def test_floats(self):
        assert is_number(3.14) is True

    def test_string_numbers(self):
        assert is_number("42") is True
        assert is_number("3.14") is True

    def test_non_numbers(self):
        assert is_number("hello") is False
        assert is_number(None) is False
        assert is_number(True) is False  # bool is not a number
        assert is_number(False) is False

    def test_nan_inf(self):
        import math
        assert is_number(float("nan")) is False
        assert is_number(float("inf")) is False


class TestFormatFileSize:
    def test_zero(self):
        assert format_file_size(0) == "0B"

    def test_bytes(self):
        assert format_file_size(500) == "500.0 B"

    def test_kb(self):
        assert format_file_size(2048) == "2.0 KB"

    def test_mb(self):
        assert format_file_size(5 * 1024 * 1024) == "5.0 MB"

    def test_gb(self):
        assert format_file_size(2 * 1024 * 1024 * 1024) == "2.0 GB"


class TestFormatTokens:
    def test_small(self):
        assert format_tokens(500) == "500"

    def test_k(self):
        assert format_tokens(1500) == "1.5K"

    def test_m(self):
        assert format_tokens(2_500_000) == "2.5M"


class TestFormatTokensWithCommas:
    def test_format(self):
        assert format_tokens_with_commas(1000) == "1,000"
        assert format_tokens_with_commas(1000000) == "1,000,000"


class TestChunkList:
    def test_chunks(self):
        result = list(chunk_list([1, 2, 3, 4, 5], 2))
        assert result == [[1, 2], [3, 4], [5]]

    def test_empty(self):
        assert list(chunk_list([], 3)) == []

    def test_exact_chunks(self):
        assert list(chunk_list([1, 2, 3, 4], 2)) == [[1, 2], [3, 4]]