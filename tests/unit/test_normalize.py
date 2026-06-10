"""
Unit tests for skills/rui/scripts/lib/normalize.py — pure logic, no I/O.
"""

import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '../../skills/rui/scripts'))

from lib.normalize import normalize_direction, normalize_complexity, classify_id_fix, normalize_node_id, _num

# ── _num ─────────────────────────────────────────────────────────────────

def test_num_float():
    assert _num(3.14) == 3.14

def test_num_int():
    assert _num(42) == 42.0

def test_num_string_number():
    assert _num("2.5") == 2.5

def test_num_invalid_falls_back_to_zero():
    assert _num("abc") == 0.0
    assert _num(None) == 0.0
    assert _num({}) == 0.0

# ── normalize_direction ──────────────────────────────────────────────────

def test_direction_forward_passthrough():
    assert normalize_direction("forward") == "forward"

def test_direction_backward_passthrough():
    assert normalize_direction("backward") == "backward"

def test_direction_bidirectional_passthrough():
    assert normalize_direction("bidirectional") == "bidirectional"

def test_direction_alias_both():
    assert normalize_direction("both") == "bidirectional"

def test_direction_alias_mutual():
    assert normalize_direction("mutual") == "bidirectional"

def test_direction_case_insensitive():
    assert normalize_direction("FORWARD") == "forward"
    assert normalize_direction("Forward") == "forward"

def test_direction_unknown_defaults_to_forward():
    assert normalize_direction("sideways") == "forward"

def test_direction_none_defaults_to_forward():
    assert normalize_direction(None) == "forward"

def test_direction_empty_defaults_to_forward():
    assert normalize_direction("") == "forward"

def test_direction_integer_defaults_to_forward():
    assert normalize_direction(123) == "forward"

# ── normalize_complexity ─────────────────────────────────────────────────

def test_complexity_simple_valid():
    val, status = normalize_complexity("simple")
    assert val == "simple"
    assert status == "valid"

def test_complexity_moderate_valid():
    val, status = normalize_complexity("moderate")
    assert val == "moderate"
    assert status == "valid"

def test_complexity_complex_valid():
    val, status = normalize_complexity("complex")
    assert val == "complex"
    assert status == "valid"

def test_complexity_alias_low():
    val, status = normalize_complexity("low")
    assert val == "simple"
    assert status == "mapped"

def test_complexity_alias_easy():
    val, status = normalize_complexity("easy")
    assert val == "simple"
    assert status == "mapped"

def test_complexity_alias_medium():
    val, status = normalize_complexity("medium")
    assert val == "moderate"
    assert status == "mapped"

def test_complexity_alias_high():
    val, status = normalize_complexity("high")
    assert val == "complex"
    assert status == "mapped"

def test_complexity_alias_hard():
    val, status = normalize_complexity("hard")
    assert val == "complex"
    assert status == "mapped"

def test_complexity_numeric_low_range():
    val, status = normalize_complexity(1)
    assert val == "simple"
    assert status == "mapped"

def test_complexity_numeric_boundary_simple():
    val, status = normalize_complexity(3)
    assert val == "simple"
    assert status == "mapped"

def test_complexity_numeric_moderate_range():
    val, status = normalize_complexity(4)
    assert val == "moderate"
    assert status == "mapped"

def test_complexity_numeric_boundary_moderate():
    val, status = normalize_complexity(6)
    assert val == "moderate"
    assert status == "mapped"

def test_complexity_numeric_high():
    val, status = normalize_complexity(7)
    assert val == "complex"
    assert status == "mapped"

def test_complexity_numeric_large():
    val, status = normalize_complexity(10)
    assert val == "complex"
    assert status == "mapped"

def test_complexity_float_truncates_to_int():
    val, status = normalize_complexity(2.9)
    assert val == "simple"
    assert status == "mapped"

def test_complexity_unknown_string():
    val, status = normalize_complexity("extreme")
    assert val == "moderate"
    assert status == "unknown"

def test_complexity_none_defaults():
    val, status = normalize_complexity(None)
    assert val == "moderate"
    assert status == "unknown"

def test_complexity_case_insensitive():
    val, status = normalize_complexity("SIMPLE")
    assert val == "simple"
    assert status == "valid"

# ── classify_id_fix ──────────────────────────────────────────────────────

def test_classify_double_prefix():
    result = classify_id_fix("file:file:src/main.ts", "file:src/main.ts")
    assert "double prefix" in result

def test_classify_project_name_prefix():
    result = classify_id_fix("myproject:file:src/main.ts", "file:src/main.ts")
    assert "project-name prefix" in result

def test_classify_func_to_function():
    result = classify_id_fix("func:doThing", "function:doThing")
    assert "func: → function:" in result

def test_classify_bare_path():
    result = classify_id_fix("src/main.ts", "file:src/main.ts")
    assert "missing prefix" in result

def test_classify_generic():
    # "old-id" has no known prefix → classified as bare path → missing prefix
    result = classify_id_fix("old-id", "file:old-id")
    assert "missing prefix" in result

# ── normalize_node_id ────────────────────────────────────────────────────

def test_normalize_keeps_valid_id():
    result = normalize_node_id("file:src/main.ts", {"type": "file"})
    assert result == "file:src/main.ts"

def test_normalize_fixes_double_prefix():
    result = normalize_node_id("file:file:src/main.ts", {"type": "file"})
    assert result == "file:src/main.ts"

def test_normalize_func_to_function():
    result = normalize_node_id("func:doThing", {"type": "function"})
    assert result == "function:doThing"

def test_normalize_bare_path_to_file_prefix():
    result = normalize_node_id("src/main.ts", {"type": "file"})
    assert result == "file:src/main.ts"

def test_normalize_function_with_file_path():
    node = {"type": "function", "filePath": "src/utils.ts", "name": "helper"}
    result = normalize_node_id("helper", node)
    assert result == "function:src/utils.ts:helper"

def test_normalize_function_without_file_path():
    node = {"type": "function", "name": "orphan"}
    result = normalize_node_id("orphan", node)
    assert result == "function:__nofilepath__:orphan"

def test_normalize_class_with_file_path():
    node = {"type": "class", "filePath": "src/App.ts", "name": "App"}
    result = normalize_node_id("App", node)
    assert result == "class:src/App.ts:App"

def test_normalize_strips_project_prefix():
    result = normalize_node_id("yry:file:src/index.ts", {"type": "file"})
    assert result == "file:src/index.ts"

def test_normalize_preserves_known_prefix_segment():
    # "domain" is a valid prefix, so "domain:file:something" shouldn't strip "domain"
    result = normalize_node_id("domain:flow:step", {"type": "domain"})
    assert result == "domain:flow:step"


if __name__ == "__main__":
    import pytest
    pytest.main([__file__, "-v"])
