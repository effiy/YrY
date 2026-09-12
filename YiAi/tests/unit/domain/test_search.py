"""Tests for domain/search/__init__.py — web search and caching."""
import pytest
from unittest.mock import patch, MagicMock
from domain.search import _clean, search, clear_cache


class TestClean:
    def test_clean_text(self):
        assert _clean("  hello  ") == "hello"

    def test_clean_none(self):
        assert _clean(None) == ""

    def test_clean_empty(self):
        assert _clean("") == ""


class TestSearch:
    def setup_method(self):
        clear_cache()

    def test_empty_query(self):
        result = search("")
        assert result == []

    def test_whitespace_query(self):
        result = search("   ")
        assert result == []

    def test_none_query(self):
        result = search(None)
        assert result == []

    def test_max_results_capped(self):
        with patch("domain.search.DDGS") as mock_ddgs:
            instance = MagicMock()
            instance.text = MagicMock(return_value=iter([]))
            mock_ddgs.return_value = instance
            search("test", max_results=100)
            call_args = instance.text.call_args
            assert call_args[1]["max_results"] == 15

    def test_max_results_minimum(self):
        with patch("domain.search.DDGS") as mock_ddgs:
            instance = MagicMock()
            instance.text = MagicMock(return_value=iter([]))
            mock_ddgs.return_value = instance
            search("test", max_results=0)
            call_args = instance.text.call_args
            assert call_args[1]["max_results"] == 1

    def test_returns_formatted_results(self):
        with patch("domain.search.DDGS") as mock_ddgs:
            instance = MagicMock()
            instance.text = MagicMock(return_value=iter([
                {"title": "Test Title", "href": "https://example.com", "body": "A snippet"},
            ]))
            mock_ddgs.return_value = instance
            results = search("test query")
            assert len(results) == 1
            assert results[0]["title"] == "Test Title"
            assert results[0]["url"] == "https://example.com"
            assert results[0]["snippet"] == "A snippet"

    def test_skips_empty_results(self):
        with patch("domain.search.DDGS") as mock_ddgs:
            instance = MagicMock()
            instance.text = MagicMock(return_value=iter([
                {"title": "", "href": "", "body": ""},
                {"title": "Valid", "href": "https://example.com", "body": "OK"},
            ]))
            mock_ddgs.return_value = instance
            results = search("test")
            assert len(results) == 1
            assert results[0]["title"] == "Valid"

    def test_search_error_returns_empty(self):
        with patch("domain.search.DDGS") as mock_ddgs:
            mock_ddgs.side_effect = RuntimeError("Network error")
            results = search("test")
            assert results == []

    def test_cache_hit(self):
        with patch("domain.search.DDGS") as mock_ddgs:
            instance = MagicMock()
            instance.text = MagicMock(return_value=iter([
                {"title": "Cached", "href": "https://example.com", "body": "Cached result"},
            ]))
            mock_ddgs.return_value = instance
            # First call
            results1 = search("cache test")
            assert len(results1) == 1
            # Second call should use cache, DDGS should not be called again
            instance.text.reset_mock()
            results2 = search("cache test")
            assert len(results2) == 1
            instance.text.assert_not_called()


class TestClearCache:
    def test_clear_cache(self):
        with patch("domain.search.DDGS") as mock_ddgs:
            instance = MagicMock()
            instance.text = MagicMock(return_value=iter([
                {"title": "T", "href": "https://example.com", "body": "S"},
            ]))
            mock_ddgs.return_value = instance
            search("test")
            clear_cache()
            # After clearing, DDGS should be called again
            instance.text.reset_mock()
            search("test")
            instance.text.assert_called_once()