"""Tests for domain/audit/decorator.py — @audit_write and helpers."""
import pytest
from domain.audit.decorator import (
    _truncate_large_fields,
    _compute_changes,
    _resolve_params,
    set_audit_context,
    _audit_actor,
    _audit_ip,
    _audit_user_agent,
)


class TestTruncateLargeFields:
    def test_none_returns_none(self):
        assert _truncate_large_fields(None, 100) is None

    def test_short_strings_unchanged(self):
        data = {"title": "short", "count": 5}
        result = _truncate_large_fields(data, 100)
        assert result == {"title": "short", "count": 5}

    def test_long_string_truncated(self):
        data = {"content": "a" * 100, "title": "ok"}
        result = _truncate_large_fields(data, 50)
        assert result["title"] == "ok"
        assert result["content"] == "a" * 50 + "[truncated]"
        assert len(result["content"]) == 50 + len("[truncated]")

    def test_exact_boundary_not_truncated(self):
        data = {"content": "a" * 50}
        result = _truncate_large_fields(data, 50)
        assert result["content"] == "a" * 50

    def test_one_over_boundary_truncated(self):
        data = {"content": "a" * 51}
        result = _truncate_large_fields(data, 50)
        assert "[truncated]" in result["content"]


class TestComputeChanges:
    def test_no_changes(self):
        before = {"a": 1, "b": "same"}
        after = {"a": 1, "b": "same"}
        assert _compute_changes(before, after) == {}

    def test_value_changed(self):
        before = {"a": 1, "b": "old"}
        after = {"a": 1, "b": "new"}
        assert _compute_changes(before, after) == {"b": {"old": "old", "new": "new"}}

    def test_key_added(self):
        before = {"a": 1}
        after = {"a": 1, "b": "new"}
        changes = _compute_changes(before, after)
        assert changes == {"b": {"old": None, "new": "new"}}

    def test_key_removed(self):
        before = {"a": 1, "b": "old"}
        after = {"a": 1}
        changes = _compute_changes(before, after)
        assert changes == {"b": {"old": "old", "new": None}}

    def test_multiple_changes(self):
        before = {"a": 1, "b": "x", "c": 3}
        after = {"a": 2, "b": "x", "c": 4}
        changes = _compute_changes(before, after)
        assert len(changes) == 2
        assert "a" in changes
        assert "c" in changes
        assert "b" not in changes


class TestResolveParams:
    def test_dict_params(self):
        assert _resolve_params(({"cname": "issues"},), {}) == {"cname": "issues"}

    def test_kwargs_params(self):
        assert _resolve_params((), {"parameters": {"cname": "bugs"}}) == {"cname": "bugs"}

    def test_json_string_params(self):
        result = _resolve_params(('{"cname": "menus"}',), {})
        assert result == {"cname": "menus"}

    def test_empty_args(self):
        assert _resolve_params((), {}) == {}


class TestAuditContext:
    def test_set_and_get_context(self):
        set_audit_context(actor="alice", ip="1.2.3.4", user_agent="TestAgent")
        assert _audit_actor.get() == "alice"
        assert _audit_ip.get() == "1.2.3.4"
        assert _audit_user_agent.get() == "TestAgent"

    def test_empty_actor_defaults_to_anonymous(self):
        set_audit_context(actor="", ip="", user_agent="")
        assert _audit_actor.get() == "anonymous"

    def test_default_context(self):
        # Reset to defaults by creating a new context
        import contextvars
        ctx = contextvars.copy_context()
        assert ctx.get(_audit_actor, "anonymous") == "anonymous"
        assert ctx.get(_audit_ip, "") == ""
        assert ctx.get(_audit_user_agent, "") == ""