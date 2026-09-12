"""Tests for services/code_health_service.py — pure helper functions."""
import pytest
from services.code_health_service import (
    _norm_line,
    _is_blank,
    _is_comment,
    _generate_alerts,
)


class TestNormLine:
    def test_strips_whitespace(self):
        assert _norm_line("  hello  ") == "hello"

    def test_empty_string(self):
        assert _norm_line("") == ""


class TestIsBlank:
    def test_blank_line(self):
        assert _is_blank("   ") is True

    def test_empty_string(self):
        assert _is_blank("") is True

    def test_non_blank(self):
        assert _is_blank("code") is False


class TestIsComment:
    def test_python_comment(self):
        is_c, in_block = _is_comment("# this is a comment", ".py", False)
        assert is_c is True
        assert in_block is False

    def test_python_non_comment(self):
        is_c, in_block = _is_comment("x = 1", ".py", False)
        assert is_c is False

    def test_js_single_line_comment(self):
        is_c, in_block = _is_comment("// comment", ".js", False)
        assert is_c is True
        assert in_block is False

    def test_css_block_comment(self):
        is_c, in_block = _is_comment("/* comment */", ".css", False)
        assert is_c is True
        assert in_block is False

    def test_block_comment_open(self):
        is_c, in_block = _is_comment("/* start of block", ".js", False)
        assert is_c is True
        assert in_block is True

    def test_block_comment_close(self):
        is_c, in_block = _is_comment("end of block */", ".js", True)
        assert is_c is True
        assert in_block is False

    def test_vue_html_comment(self):
        is_c, in_block = _is_comment("<!-- comment -->", ".vue", False)
        assert is_c is True
        assert in_block is False

    def test_unknown_extension_defaults(self):
        is_c, in_block = _is_comment("// comment", ".unknown", False)
        assert is_c is True


class TestGenerateAlerts:
    def test_no_alerts_when_healthy(self):
        scale = {"max_file": {"path": "small.ts", "lines": 100}}
        density = {"comment_rate": 0.3}
        reuse = {"component_defs": 0, "reuse_rate": 3.0, "unused_components": []}
        duplication = {"duplicate_rate": 0.02, "duplicate_blocks": 0, "duplicate_lines": 0}
        alerts = _generate_alerts(scale, density, reuse, duplication, 300, 600, 0.1, 0.05, 2.0, 1.0, 0.05, 0.15)
        assert alerts == []

    def test_max_file_danger_alert(self):
        scale = {"max_file": {"path": "huge.ts", "lines": 700}}
        density = {"comment_rate": 0.3}
        reuse = {"component_defs": 0, "reuse_rate": 3.0, "unused_components": []}
        duplication = {"duplicate_rate": 0.02, "duplicate_blocks": 0, "duplicate_lines": 0}
        alerts = _generate_alerts(scale, density, reuse, duplication, 300, 600, 0.1, 0.05, 2.0, 1.0, 0.05, 0.15)
        assert len(alerts) >= 1
        assert any(a["level"] == "danger" and "huge.ts" in a["message"] for a in alerts)

    def test_max_file_warn_alert(self):
        scale = {"max_file": {"path": "big.ts", "lines": 400}}
        density = {"comment_rate": 0.3}
        reuse = {"component_defs": 0, "reuse_rate": 3.0, "unused_components": []}
        duplication = {"duplicate_rate": 0.02, "duplicate_blocks": 0, "duplicate_lines": 0}
        alerts = _generate_alerts(scale, density, reuse, duplication, 300, 600, 0.1, 0.05, 2.0, 1.0, 0.05, 0.15)
        assert any(a["level"] == "warn" and "big.ts" in a["message"] for a in alerts)

    def test_low_comment_rate_danger(self):
        scale = {"max_file": {"path": "small.ts", "lines": 100}}
        density = {"comment_rate": 0.02}
        reuse = {"component_defs": 0, "reuse_rate": 3.0, "unused_components": []}
        duplication = {"duplicate_rate": 0.02, "duplicate_blocks": 0, "duplicate_lines": 0}
        alerts = _generate_alerts(scale, density, reuse, duplication, 300, 600, 0.1, 0.05, 2.0, 1.0, 0.05, 0.15)
        assert any(a["metric"] == "comment_rate" and a["level"] == "danger" for a in alerts)

    def test_high_duplication_danger(self):
        scale = {"max_file": {"path": "small.ts", "lines": 100}}
        density = {"comment_rate": 0.3}
        reuse = {"component_defs": 0, "reuse_rate": 3.0, "unused_components": []}
        duplication = {"duplicate_rate": 0.20, "duplicate_blocks": 5, "duplicate_lines": 200}
        alerts = _generate_alerts(scale, density, reuse, duplication, 300, 600, 0.1, 0.05, 2.0, 1.0, 0.05, 0.15)
        assert any(a["metric"] == "duplicate_rate" and a["level"] == "danger" for a in alerts)

    def test_unused_components_alert(self):
        scale = {"max_file": {"path": "small.ts", "lines": 100}}
        density = {"comment_rate": 0.3}
        reuse = {"component_defs": 10, "reuse_rate": 3.0, "unused_components": [
            {"path": "OldModal.vue", "lines": 150},
            {"path": "LegacyHeader.vue", "lines": 80},
            {"path": "DeadFooter.vue", "lines": 60},
            {"path": "UnusedSidebar.vue", "lines": 200},
        ]}
        duplication = {"duplicate_rate": 0.02, "duplicate_blocks": 0, "duplicate_lines": 0}
        alerts = _generate_alerts(scale, density, reuse, duplication, 300, 600, 0.1, 0.05, 2.0, 1.0, 0.05, 0.15)
        assert any(a["metric"] == "unused_components" for a in alerts)