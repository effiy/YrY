"""Tests for domain/ai/tools/builtin/mcp.py — _extract_content edge cases."""
import pytest
from server.routes.mcp import _extract_content


class TestExtractContent:
    def test_string(self):
        out = []
        _extract_content("hello", out)
        assert out == ["hello"]

    def test_none(self):
        out = []
        _extract_content(None, out)
        assert out == []

    def test_list_of_strings(self):
        out = []
        _extract_content(["a", "b"], out)
        assert out == ["a", "b"]

    def test_nested_list(self):
        out = []
        _extract_content([["nested"]], out)
        assert out == ["nested"]

    def test_object_with_text_attr(self):
        class FakeText:
            text = "content from text attr"
        out = []
        _extract_content(FakeText(), out)
        assert out == ["content from text attr"]

    def test_object_with_data_attr(self):
        class FakeData:
            data = "binary_data"
        out = []
        _extract_content(FakeData(), out)
        assert out == ["binary_data"]

    def test_object_with_model_dump(self):
        class FakeModel:
            @staticmethod
            def model_dump():
                return {"key": "value"}
        out = []
        _extract_content(FakeModel(), out)
        assert out == ["{'key': 'value'}"]

    def test_unknown_object_fallback(self):
        class Unknown:
            pass
        out = []
        _extract_content(Unknown(), out)
        assert len(out) == 1
        assert "Unknown" in out[0]

    def test_empty_list(self):
        out = []
        _extract_content([], out)
        assert out == []

    def test_mixed_list(self):
        class FakeText:
            text = "hello"
        out = []
        _extract_content(["str", FakeText(), None], out)
        assert out == ["str", "hello"]