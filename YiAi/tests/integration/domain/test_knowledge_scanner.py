"""Tests for domain/knowledge/scanner.py — pure helper functions."""
import pytest
from domain.knowledge.scanner import (
    _parse_frontmatter,
    _categorize,
    _normalize_meta,
    _WELL_KNOWN_CATEGORIES,
    _SKIP_DIRS,
)


class TestParseFrontmatter:
    def test_no_frontmatter(self):
        meta, body = _parse_frontmatter("# Just markdown\n\nContent here.")
        assert meta == {}
        assert body == "# Just markdown\n\nContent here."

    def test_valid_yaml_frontmatter(self):
        text = "---\ntitle: Test Doc\ntags: [a, b]\n---\n\n# Heading\nBody text."
        meta, body = _parse_frontmatter(text)
        assert meta == {"title": "Test Doc", "tags": ["a", "b"]}
        assert body == "# Heading\nBody text."

    def test_empty_frontmatter(self):
        # Frontmatter with no keys — requires newline before closing ---
        text = "---\n\n---\n\nBody only."
        meta, body = _parse_frontmatter(text)
        assert meta == {}
        assert body == "Body only."

    def test_malformed_yaml_frontmatter(self):
        text = "---\n- [unclosed\n---\n\nBody."
        meta, body = _parse_frontmatter(text)
        assert meta == {}
        assert body == "Body."

    def test_non_dict_frontmatter(self):
        text = "---\n- item1\n- item2\n---\n\nBody."
        meta, body = _parse_frontmatter(text)
        assert meta == {}
        assert body == "Body."

    def test_frontmatter_with_multiline_values(self):
        text = "---\ntitle: Test\ndescription: |\n  Line 1\n  Line 2\n---\n\nBody."
        meta, body = _parse_frontmatter(text)
        assert meta["title"] == "Test"
        # YAML | block scalar strips trailing newline
        assert meta["description"] == "Line 1\nLine 2"

    def test_frontmatter_with_nested_dict(self):
        text = "---\nmeta:\n  author: Alice\n  version: 2\n---\n\nBody."
        meta, body = _parse_frontmatter(text)
        assert meta == {"meta": {"author": "Alice", "version": 2}}

    def test_body_with_frontmatter_like_content(self):
        """Body containing `---` should not be parsed as frontmatter."""
        text = "---\ntitle: Test\n---\n\n# Body\n\n---\n\nMore body with dashes."
        meta, body = _parse_frontmatter(text)
        assert meta == {"title": "Test"}
        assert body.startswith("# Body")


class TestCategorize:
    def test_root_level_file(self):
        assert _categorize("README.md") == "__root__"

    def test_nested_file(self):
        assert _categorize("engineer/notes/test.md") == "engineer"

    def test_deeply_nested(self):
        assert _categorize("engineer/learn/projects/yivad/stories/s1/story.md") == "engineer"

    def test_single_segment(self):
        assert _categorize("index.md") == "__root__"


class TestNormalizeMeta:
    def test_empty(self):
        assert _normalize_meta({}) == {}

    def test_none_skipped(self):
        assert _normalize_meta({"a": None, "b": "val"}) == {"b": "val"}

    def test_scalars_preserved(self):
        result = _normalize_meta({"str": "hello", "int": 42, "float": 3.14, "bool": True})
        assert result == {"str": "hello", "int": 42, "float": 3.14, "bool": True}

    def test_list_coerced(self):
        result = _normalize_meta({"tags": ["a", 1, True, None]})
        # scanner's _normalize_meta converts None to string 'None'
        assert "a" in result["tags"]
        assert 1 in result["tags"]

    def test_non_scalar_coerced_to_string(self):
        result = _normalize_meta({"complex": {"nested": "dict"}})
        assert result["complex"] == "{'nested': 'dict'}"

    def test_none_meta(self):
        assert _normalize_meta(None) == {}


class TestConstants:
    def test_well_known_categories(self):
        assert "engineer" in _WELL_KNOWN_CATEGORIES
        assert "producter" in _WELL_KNOWN_CATEGORIES
        assert len(_WELL_KNOWN_CATEGORIES) == 7  # producter, leader, engineer, srer, executiver, aier, curator

    def test_skip_dirs(self):
        assert ".git" in _SKIP_DIRS
        assert "node_modules" in _SKIP_DIRS
        assert "__pycache__" in _SKIP_DIRS