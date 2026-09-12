"""Tests for domain/files/paths.py — pure path validation functions."""
import pytest
from unittest.mock import patch
from domain.files.paths import (
    is_image_file,
    normalize_no_spaces,
    validate_path,
    resolve_static_path,
)
from shared.exceptions import BusinessException


class TestIsImageFile:
    def test_png(self):
        assert is_image_file("photo.png") is True

    def test_jpg(self):
        assert is_image_file("photo.jpg") is True
        assert is_image_file("photo.jpeg") is True

    def test_gif(self):
        assert is_image_file("anim.gif") is True

    def test_webp(self):
        assert is_image_file("img.webp") is True

    def test_svg(self):
        assert is_image_file("icon.svg") is True

    def test_text_file(self):
        assert is_image_file("readme.md") is False

    def test_empty_string(self):
        assert is_image_file("") is False

    def test_none(self):
        assert is_image_file(None) is False

    def test_case_insensitive(self):
        assert is_image_file("PHOTO.PNG") is True


class TestNormalizeNoSpaces:
    def test_replaces_spaces(self):
        assert normalize_no_spaces("hello world") == "hello_world"

    def test_strips_whitespace(self):
        assert normalize_no_spaces("  hello  ") == "hello"

    def test_empty_string(self):
        assert normalize_no_spaces("") == ""

    def test_none(self):
        assert normalize_no_spaces(None) == ""


class TestValidatePath:
    def test_valid_relative_path(self):
        result = validate_path("projects/test/file.md")
        assert result == "projects/test/file.md"

    def test_backslash_normalized(self):
        result = validate_path("projects\\test\\file.md")
        assert result == "projects/test/file.md"

    def test_empty_path_raises(self):
        with pytest.raises(BusinessException, match="Invalid"):
            validate_path("")

    def test_absolute_path_raises(self):
        with pytest.raises(BusinessException, match="Invalid"):
            validate_path("/etc/passwd")

    def test_traversal_raises(self):
        with pytest.raises(BusinessException, match="Invalid"):
            validate_path("../etc/passwd")


class TestResolveStaticPath:
    def test_relative_path_resolved(self):
        with patch("domain.files.paths.settings") as mock_settings:
            mock_settings.static_base_dir = "/app/static"
            result = resolve_static_path("projects/test.md")
            assert result == "/app/static/projects/test.md"

    def test_strips_static_prefix(self):
        with patch("domain.files.paths.settings") as mock_settings:
            mock_settings.static_base_dir = "/app/static"
            result = resolve_static_path("static/projects/test.md")
            assert result == "/app/static/projects/test.md"

    def test_empty_path_raises(self):
        with pytest.raises(BusinessException, match="Invalid path"):
            resolve_static_path("")

    def test_traversal_rejected(self):
        with pytest.raises(BusinessException, match="Invalid path"):
            resolve_static_path("../etc/passwd")

    def test_absolute_path_raises(self):
        with pytest.raises(BusinessException, match="Invalid path"):
            resolve_static_path("/etc/passwd")