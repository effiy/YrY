"""Tests for domain/rss/feed.py — pure helper functions."""
import pytest
from domain.rss.feed import (
    _slugify,
    _keyword_matches,
    _classify_entry,
    _entry_date_dir,
    _entry_body,
    _build_meta,
    _build_entry_metadata,
)


class TestSlugify:
    def test_basic_english(self):
        assert _slugify("Hello World") == "hello-world"

    def test_special_characters_removed(self):
        slug = _slugify("What's new in AI/ML?")
        assert "?" not in slug
        assert "'" not in slug
        assert "/" not in slug

    def test_chinese_characters_preserved(self):
        slug = _slugify("人工智能发展报告")
        assert "人工智能发展报告" in slug

    def test_empty_string(self):
        assert _slugify("") == "untitled"

    def test_whitespace_only(self):
        assert _slugify("   ") == "untitled"

    def test_truncates_to_60_chars(self):
        long_title = "A" * 100
        slug = _slugify(long_title)
        assert len(slug) <= 60

    def test_multiple_dashes_collapsed(self):
        slug = _slugify("a---b___c")
        assert "---" not in slug
        assert "___" not in slug


class TestKeywordMatches:
    def test_exact_match(self):
        assert _keyword_matches("ai", "ai is great") is True

    def test_word_boundary_prevents_partial_match(self):
        assert _keyword_matches("ai", "analysis is hard") is False

    def test_match_within_phrase(self):
        assert _keyword_matches("machine learning", "I do machine learning daily") is True

    def test_empty_keyword(self):
        assert _keyword_matches("", "text") is False

    def test_chinese_substring_match(self):
        assert _keyword_matches("模型", "大模型推理") is True


class TestClassifyEntry:
    def test_ai_keyword_maps_to_methodology(self):
        result = _classify_entry("GPT-5 release", "new AI model")
        assert result == "aier/methodology"

    def test_cloud_keyword_maps_to_release(self):
        result = _classify_entry("Kubernetes 1.30", "cloud infra update")
        assert result == "srer/release"

    def test_fallback_category(self):
        result = _classify_entry("Random news", "nothing special here")
        assert result == "executiver/industry"

    def test_source_category_takes_priority(self):
        result = _classify_entry("AI news", "llm update", source_category="engineer/ship")
        assert result == "engineer/ship"

    def test_source_category_without_slash_ignored(self):
        result = _classify_entry("AI news", "llm update", source_category="nocategory")
        assert result == "aier/methodology"


class TestEntryDateDir:
    def test_extracts_date_from_parsed(self):
        entry = {"published_parsed": (2026, 9, 8, 12, 0, 0, 0, 0, 0)}
        assert _entry_date_dir(entry) == "2026-09-08"

    def test_falls_back_to_today(self):
        entry = {}
        result = _entry_date_dir(entry)
        assert len(result) == 10
        assert result[4] == "-" and result[7] == "-"


class TestEntryBody:
    def test_content_value_preferred(self):
        entry = {
            "content": [{"value": "Full article body"}],
            "description": "Short summary",
        }
        assert _entry_body(entry) == "Full article body"

    def test_falls_back_to_description(self):
        entry = {"description": "Just a summary"}
        assert _entry_body(entry) == "Just a summary"

    def test_falls_back_to_summary(self):
        entry = {"summary": "A brief note"}
        assert _entry_body(entry) == "A brief note"

    def test_empty_entry(self):
        assert _entry_body({}) == ""


class TestBuildMeta:
    def test_all_fields_present(self):
        meta = _build_meta(
            title="Test Title",
            link="https://example.com",
            source_name="Test Source",
            source_url="https://test.com/feed",
            category_path="aier/methodology",
            tags=["ai", "test"],
            published="Mon, 08 Sep 2026",
            author="John Doe",
        )
        assert meta["title"] == "Test Title"
        assert meta["source"] == "https://example.com"
        assert meta["source_name"] == "Test Source"
        assert meta["category"] == "aier/methodology"
        assert meta["tags"] == ["ai", "test"]
        assert meta["author"] == "John Doe"
        assert meta["type"] == "rss"

    def test_none_title_falls_back_to_link(self):
        meta = _build_meta(
            title="",
            link="https://example.com",
            source_name="Src",
            source_url="https://s.com",
            category_path="cat",
            tags=[],
            published="",
            author=None,
        )
        assert meta["title"] == "https://example.com"


class TestBuildEntryMetadata:
    def test_body_missing_flag(self):
        entry = {"title": "T", "link": "https://x.com", "published": "", "description": "d"}
        meta = _build_entry_metadata(
            entry,
            source_name="S",
            source_url="https://s.com",
            tags=["t"],
            current_time="2026-09-08",
            category_path="cat",
            file_path="rss/2026-09-08/t.md",
            body_missing=True,
        )
        assert meta["body_missing"] is True
        assert meta["file_path"] == "rss/2026-09-08/t.md"
        assert "content" not in meta  # body is NOT stored in MongoDB