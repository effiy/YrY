"""Tests for domain/rag/paths.py — path safety helpers."""
import pytest
from unittest.mock import patch, MagicMock
from domain.rag.paths import resolve_safe, base_dir
from shared.exceptions import BusinessException


class TestBaseDir:
    def test_returns_absolute_path(self):
        result = base_dir()
        assert result.startswith("/")


class TestResolveSafe:
    BASE = "/home/user/YiKnowledge"

    def _patch_os(self, mock_os):
        """Configure the mocked os module for path containment checks."""
        mock_os.path.normpath.side_effect = lambda p: p.replace("\\", "/")
        mock_os.path.isabs.side_effect = lambda p: p.startswith("/")
        mock_os.path.abspath.side_effect = lambda p: p
        mock_os.path.realpath.side_effect = lambda p: p
        mock_os.path.join.side_effect = lambda *args: "/".join(args)
        mock_os.path.commonpath.return_value = self.BASE

    @patch("domain.rag.paths.os")
    @patch("domain.rag.paths.base_dir", return_value=BASE)
    def test_valid_relative_path(self, mock_bd, mock_os):
        self._patch_os(mock_os)
        result = resolve_safe("notes/today.md")
        assert result.endswith("notes/today.md")

    @patch("domain.rag.paths.os")
    @patch("domain.rag.paths.base_dir", return_value=BASE)
    def test_valid_nested_path(self, mock_bd, mock_os):
        self._patch_os(mock_os)
        result = resolve_safe("engineer/projects/yivad/manage-menu-catalog.md")
        assert result.endswith("manage-menu-catalog.md")

    def test_empty_path_raises(self):
        with pytest.raises(BusinessException, match="Empty path"):
            resolve_safe("")

    def test_whitespace_only_raises(self):
        with pytest.raises(BusinessException, match="Empty path"):
            resolve_safe("   ")

    def test_absolute_path_raises(self):
        with pytest.raises(BusinessException, match="Absolute paths"):
            resolve_safe("/etc/passwd")

    def test_parent_traversal_raises(self):
        with pytest.raises(BusinessException, match="Invalid path"):
            resolve_safe("../../../etc/passwd")

    @patch("domain.rag.paths.os")
    @patch("domain.rag.paths.base_dir", return_value=BASE)
    def test_escape_via_commonpath_mismatch(self, mock_bd, mock_os):
        self._patch_os(mock_os)
        mock_os.path.commonpath.return_value = "/home/user"  # different from BASE

        with pytest.raises(BusinessException, match="escapes"):
            resolve_safe("notes/ok.md")

    @patch("domain.rag.paths.os")
    @patch("domain.rag.paths.base_dir", return_value=BASE)
    def test_backslash_normalized(self, mock_bd, mock_os):
        self._patch_os(mock_os)
        result = resolve_safe("notes\\today.md")
        assert "/" in result
        assert "\\" not in result