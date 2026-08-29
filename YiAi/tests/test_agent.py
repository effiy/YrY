"""Tests for domain/ai/agent.py — pure helper functions."""
import pytest
from dataclasses import dataclass, field
from typing import Optional, List, Dict, Any

from domain.ai.agent import (
    _call_signature,
    _budget_warning,
    _turn_observation_signature,
    _advance_spin_state,
    _bound_tool_result,
    _parse_tool_calls_from_text,
    _strip_tool_calls_from_text,
    _is_continuation,
    _is_write_request,
    _last_user_text,
    _inject_mission_if_needed,
    AgentMessage,
)

# Re-import ToolCall/ToolResult for test fixtures
from domain.ai.tools import ToolCall, ToolResult


class TestCallSignature:
    def test_basic(self):
        call = ToolCall(id="t1", name="db_create", arguments={"cname": "menus", "data": {"title": "X"}})
        sig = _call_signature(call)
        assert "db_create" in sig
        assert "cname" in sig
        assert "menus" in sig

    def test_different_args_different_signature(self):
        c1 = ToolCall(id="t1", name="db_create", arguments={"cname": "menus"})
        c2 = ToolCall(id="t2", name="db_create", arguments={"cname": "sessions"})
        assert _call_signature(c1) != _call_signature(c2)

    def test_same_args_same_signature(self):
        c1 = ToolCall(id="t1", name="db_create", arguments={"cname": "menus", "data": {"a": 1}})
        c2 = ToolCall(id="t2", name="db_create", arguments={"data": {"a": 1}, "cname": "menus"})
        # sort_keys=True ensures same JSON output regardless of key order
        assert _call_signature(c1) == _call_signature(c2)


class TestBudgetWarning:
    def test_far_from_limit(self):
        assert _budget_warning(1, 10) is None
        assert _budget_warning(5, 10) is None

    def test_near_limit(self):
        result = _budget_warning(8, 10)
        assert result is not None
        assert "[BUDGET]" in result
        assert "10" in result
        assert "2" in result  # remaining

    def test_at_limit(self):
        result = _budget_warning(10, 10)
        assert result is not None
        assert "还剩 0 轮" in result

    def test_past_limit(self):
        assert _budget_warning(11, 10) is None

    def test_custom_warn_leftover(self):
        assert _budget_warning(5, 10, warn_leftover=5) is not None
        assert _budget_warning(4, 10, warn_leftover=5) is None


class TestTurnObservationSignature:
    def test_empty_results(self):
        assert _turn_observation_signature([]) == ""

    def test_single_result(self):
        r = ToolResult(call_id="t1", name="db_list", content="3 docs")
        sig = _turn_observation_signature([r])
        assert "db_list" in sig
        assert "3 docs" in sig

    def test_error_result(self):
        r = ToolResult(call_id="t1", name="db_create", content="", error="Rejected")
        sig = _turn_observation_signature([r])
        assert "Error: Rejected" in sig

    def test_multiple_results(self):
        r1 = ToolResult(call_id="t1", name="db_list", content="a")
        r2 = ToolResult(call_id="t2", name="db_create", content="ok")
        sig = _turn_observation_signature([r1, r2])
        assert "||" in sig
        assert "db_list|a" in sig
        assert "db_create|ok" in sig


class TestAdvanceSpinState:
    def test_empty_observation_resets(self):
        prev, run, fired = _advance_spin_state("prev_obs", 2, "")
        assert prev is None
        assert run == 0
        assert fired is False

    def test_same_observation_increments(self):
        prev, run, fired = _advance_spin_state("same", 2, "same")
        # run reaches 3 (>= threshold 3), fires and resets
        assert run == 0
        assert fired is True

    def test_fires_at_threshold_fires(self):
        # run=2, threshold=3, same obs → run=3 >= 3 → fires
        prev, run, fired = _advance_spin_state("same", 2, "same")
        assert fired is True

    def test_fires_at_custom_threshold(self):
        prev, run, fired = _advance_spin_state("same", 1, "same", threshold=2)
        assert run == 0  # reset after firing
        assert fired is True

    def test_different_observation_restarts(self):
        prev, run, fired = _advance_spin_state("old", 3, "new")
        assert prev == "new"
        assert run == 1
        assert fired is False

    def test_first_observation(self):
        prev, run, fired = _advance_spin_state(None, 0, "first")
        assert prev == "first"
        assert run == 1
        assert fired is False


class TestBoundToolResult:
    def test_short_result_passthrough(self):
        original = "short result"
        assert _bound_tool_result("db_list", original, max_chars=100) == original

    def test_large_result_bounded(self):
        content = "x" * 10000
        result = _bound_tool_result("db_list", content, max_chars=1000)
        assert len(result) < len(content)
        assert "truncated" in result

    def test_empty_content(self):
        assert _bound_tool_result("t", "", max_chars=100) == ""

    def test_exact_boundary(self):
        content = "x" * 100
        result = _bound_tool_result("t", content, max_chars=100)
        assert result == content

    def test_truncation_note(self):
        content = "x" * 5000
        result = _bound_tool_result("db_list", content, max_chars=1000)
        assert "Re-query" in result
        assert "filter" in result


class TestParseToolCalls:
    def test_no_tool_calls(self):
        result = _parse_tool_calls_from_text("plain text response")
        assert result == []

    def test_single_tool_call(self):
        text = '<tool_call>{"name": "db_list", "arguments": {"cname": "menus"}}</tool_call>'
        result = _parse_tool_calls_from_text(text)
        assert len(result) == 1
        assert result[0].name == "db_list"
        assert result[0].arguments == {"cname": "menus"}

    def test_multiple_tool_calls(self):
        text = (
            '<tool_call>{"name": "db_list", "arguments": {"cname": "menus"}}</tool_call>\n'
            '<tool_call>{"name": "db_create", "arguments": {"cname": "menus", "data": {"title": "X"}}}</tool_call>'
        )
        result = _parse_tool_calls_from_text(text)
        assert len(result) == 2
        assert result[1].name == "db_create"

    def test_malformed_json_skipped(self):
        text = '<tool_call>not valid json</tool_call>'
        result = _parse_tool_calls_from_text(text)
        assert result == []

    def test_missing_name_returns_empty_name(self):
        text = '<tool_call>{"arguments": {"cname": "menus"}}</tool_call>'
        result = _parse_tool_calls_from_text(text)
        # name is empty string, not filtered out
        assert len(result) == 1
        assert result[0].name == ""


class TestStripToolCalls:
    def test_no_tool_calls(self):
        assert _strip_tool_calls_from_text("plain text") == "plain text"

    def test_strips_tool_calls(self):
        text = "Before\n<tool_call>{}</tool_call>\nAfter"
        result = _strip_tool_calls_from_text(text)
        assert "<tool_call>" not in result
        assert "Before" in result
        assert "After" in result


class TestIsContinuation:
    def test_bare_zh(self):
        assert _is_continuation("继续") is True
        assert _is_continuation("继续完成") is True

    def test_bare_en(self):
        assert _is_continuation("continue") is True
        assert _is_continuation("go on") is True

    def test_prefix(self):
        assert _is_continuation("继续完成剩余任务") is True
        assert _is_continuation("continue the task") is True

    def test_not_continuation(self):
        assert _is_continuation("创建 3 个菜单") is False
        assert _is_continuation("") is False


class TestIsWriteRequest:
    def test_write_zh(self):
        assert _is_write_request("创建 3 个菜单") is True
        assert _is_write_request("删除这个记录") is True
        assert _is_write_request("更新标题") is True

    def test_write_en(self):
        assert _is_write_request("create a new menu") is True
        assert _is_write_request("delete the record") is True

    def test_read_only(self):
        assert _is_write_request("列出所有菜单") is False
        assert _is_write_request("what is the status?") is False

    def test_negated_write(self):
        assert _is_write_request("只读，不要创建/更新/删除任何菜单") is False

    def test_empty(self):
        assert _is_write_request("") is False


class TestLastUserText:
    def test_simple(self):
        msgs = [
            AgentMessage(role="user", content="hello"),
            AgentMessage(role="assistant", content="hi"),
        ]
        assert _last_user_text(msgs) == "hello"

    def test_skips_system_injected(self):
        msgs = [
            AgentMessage(role="user", content="create a menu"),
            AgentMessage(role="assistant", content="ok"),
            AgentMessage(role="user", content="[TASK] the user's concrete task..."),
        ]
        assert _last_user_text(msgs) == "create a menu"

    def test_empty(self):
        assert _last_user_text([]) == ""


class TestInjectMissionIfNeeded:
    def test_already_present(self):
        msgs = [AgentMessage(role="user", content="create 3 menus")]
        result = _inject_mission_if_needed(msgs, "create 3 menus", "note")
        assert result is msgs  # same reference, no change

    def test_injects_when_missing(self):
        msgs = [AgentMessage(role="assistant", content="summary")]
        result = _inject_mission_if_needed(msgs, "create 3 menus", "[TASK] The user's concrete task: create 3 menus")
        assert len(result) == 2
        assert result[0].role == "system"
        assert "create 3 menus" in result[0].content

    def test_already_injected_skips(self):
        msgs = [AgentMessage(role="system", content="[TASK] The user's concrete task: create 3 menus")]
        result = _inject_mission_if_needed(msgs, "create 3 menus", "note")
        assert result is msgs