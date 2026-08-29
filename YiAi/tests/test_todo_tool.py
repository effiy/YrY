"""Tests for domain/ai/todo_tool.py — session-scoped todo list helpers."""
import pytest
from domain.ai.todo_tool import (
    get_session_todos,
    set_session_todos,
    format_session_todos,
    set_current_session_id,
    _STATUS_MARKS,
)


class TestSessionTodos:
    def test_empty_for_unknown_session(self):
        assert get_session_todos("no-such-session") == []

    def test_set_and_get(self):
        todos = [
            {"id": "1", "content": "Create menu", "status": "completed"},
            {"id": "2", "content": "Update menu", "status": "in_progress"},
            {"id": "3", "content": "Delete menu", "status": "pending"},
        ]
        set_session_todos("s1", todos)
        result = get_session_todos("s1")
        assert len(result) == 3
        assert result[0]["content"] == "Create menu"

    def test_replace(self):
        set_session_todos("s1", [{"id": "1", "content": "A", "status": "pending"}])
        set_session_todos("s1", [{"id": "2", "content": "B", "status": "pending"}])
        result = get_session_todos("s1")
        assert len(result) == 1
        assert result[0]["content"] == "B"

    def test_empty_session_id_noop(self):
        set_session_todos("", [{"id": "1", "content": "A", "status": "pending"}])
        assert get_session_todos("") == []

    def test_bounded_at_max(self):
        todos = [{"id": str(i), "content": f"Task {i}", "status": "pending"} for i in range(100)]
        set_session_todos("s1", todos)
        result = get_session_todos("s1")
        assert len(result) <= 50  # _MAX_TODOS

    def test_sessions_isolated(self):
        set_session_todos("a", [{"id": "1", "content": "A", "status": "pending"}])
        set_session_todos("b", [{"id": "2", "content": "B", "status": "pending"}])
        assert get_session_todos("a")[0]["content"] == "A"
        assert get_session_todos("b")[0]["content"] == "B"


class TestFormatSessionTodos:
    def test_empty_returns_none(self):
        set_session_todos("s1", [])
        assert format_session_todos("s1") is None

    def test_formats_with_status_marks(self):
        set_session_todos("s1", [
            {"id": "1", "content": "Done", "status": "completed"},
            {"id": "2", "content": "Doing", "status": "in_progress"},
            {"id": "3", "content": "Todo", "status": "pending"},
        ])
        result = format_session_todos("s1")
        assert result is not None
        assert "[TODOS]" in result
        assert "Done" in result
        assert "Doing" in result
        assert "Todo" in result

    def test_unknown_status_defaults_to_space(self):
        set_session_todos("s1", [
            {"id": "1", "content": "Weird", "status": "unknown_status"},
        ])
        result = format_session_todos("s1")
        assert result is not None
        assert "[ ]" in result  # unknown → space mark


class TestStatusMarks:
    def test_pending_is_space(self):
        assert _STATUS_MARKS["pending"] == " "

    def test_in_progress_is_arrow(self):
        assert _STATUS_MARKS["in_progress"] == "▶"

    def test_completed_is_check(self):
        assert _STATUS_MARKS["completed"] == "✓"