"""Tests for domain/ai/tools/ — pure helper functions."""
import os
import pytest
from domain.ai.tools import (
    _validate_arguments,
    _format_file_size,
    _group_for,
    _extract_mcp_text,
    _is_url_allowed,
    _is_path_allowed,
    ToolDefinition,
    ToolCall,
    ToolResult,
    ToolEvent,
    ToolRegistry,
    get_tool_registry,
)


class TestValidateArguments:
    STRING_SCHEMA = {
        "type": "object",
        "properties": {"name": {"type": "string"}},
        "required": ["name"],
    }
    MIXED_SCHEMA = {
        "type": "object",
        "properties": {
            "name": {"type": "string"},
            "count": {"type": "integer"},
            "active": {"type": "boolean"},
            "score": {"type": "number"},
            "items": {"type": "array"},
            "meta": {"type": "object"},
        },
        "required": ["name"],
    }

    def test_valid(self):
        assert _validate_arguments("test", {"name": "hello"}, self.STRING_SCHEMA) is None

    def test_missing_required(self):
        err = _validate_arguments("test", {}, self.STRING_SCHEMA)
        assert err is not None
        assert "missing required argument" in err
        assert "name" in err

    def test_null_args(self):
        err = _validate_arguments("test", None, self.STRING_SCHEMA)
        assert "missing required argument" in err

    def test_non_dict_args(self):
        err = _validate_arguments("test", "not-a-dict", self.STRING_SCHEMA)
        assert "must be a JSON object" in err

    def test_wrong_type_string(self):
        err = _validate_arguments("test", {"name": 123}, self.STRING_SCHEMA)
        assert "must be a string" in err

    def test_wrong_type_integer(self):
        schema = {"type": "object", "properties": {"count": {"type": "integer"}}, "required": ["count"]}
        err = _validate_arguments("test", {"count": "not-int"}, schema)
        assert "must be an integer" in err

    def test_wrong_type_boolean(self):
        schema = {"type": "object", "properties": {"flag": {"type": "boolean"}}, "required": ["flag"]}
        err = _validate_arguments("test", {"flag": "true"}, schema)
        assert "must be a boolean" in err

    def test_wrong_type_array(self):
        schema = {"type": "object", "properties": {"items": {"type": "array"}}, "required": ["items"]}
        err = _validate_arguments("test", {"items": "not-array"}, schema)
        assert "must be an array" in err

    def test_wrong_type_object(self):
        schema = {"type": "object", "properties": {"meta": {"type": "object"}}, "required": ["meta"]}
        err = _validate_arguments("test", {"meta": "not-object"}, schema)
        assert "must be an object" in err

    def test_wrong_type_number(self):
        schema = {"type": "object", "properties": {"score": {"type": "number"}}, "required": ["score"]}
        err = _validate_arguments("test", {"score": "not-number"}, schema)
        assert "must be a number" in err

    def test_extra_fields_ok(self):
        assert _validate_arguments("test", {"name": "x", "extra": 123}, self.STRING_SCHEMA) is None

    def test_no_schema(self):
        assert _validate_arguments("test", {"any": "thing"}, {}) is None


class TestFormatFileSize:
    def test_bytes(self):
        assert _format_file_size(500) == "500B"

    def test_kb(self):
        assert _format_file_size(2048) == "2.0KB"

    def test_mb(self):
        assert _format_file_size(5 * 1024 * 1024) == "5.0MB"


class TestGroupFor:
    def test_known_groups(self):
        assert _group_for("web_search") == "search"
        assert _group_for("file_read") == "files"
        assert _group_for("bash") == "files"
        assert _group_for("edit") == "files"
        assert _group_for("mcp_chat") == "mcp"

    def test_unknown_falls_back(self):
        assert _group_for("nonexistent_tool") == "general"
        assert _group_for("db_create") == "general"
        assert _group_for("todo_write") == "general"


class TestExtractMcpText:
    def test_none(self):
        assert _extract_mcp_text(None) == ""

    def test_string(self):
        assert _extract_mcp_text("hello") == "hello"

    def test_list_of_strings(self):
        assert _extract_mcp_text(["a", "b"]) == "a\nb"

    def test_object_with_text_attr(self):
        class Obj:
            text = "content"
        assert _extract_mcp_text(Obj()) == "content"

    def test_object_with_content_attr(self):
        class Obj:
            content = "data"
        assert _extract_mcp_text(Obj()) == "data"


class TestIsUrlAllowed:
    def test_all_allowed_when_empty(self):
        # Default _ALLOWED_DOMAINS is empty, so all URLs are allowed
        assert _is_url_allowed("https://example.com") is True
        assert _is_url_allowed("https://evil.com") is True

    def test_invalid_url(self):
        # When allowlist is empty (default), all URLs are allowed
        assert _is_url_allowed("not-a-url") is True


class TestToolRegistry:
    def test_register_and_get(self):
        reg = ToolRegistry()
        tool = ToolDefinition(
            name="test_tool",
            description="A test",
            parameters={},
            execute=lambda args: None,
        )
        reg.register(tool)
        assert reg.get("test_tool") is not None
        assert reg.get("test_tool").name == "test_tool"

    def test_unregister(self):
        reg = ToolRegistry()
        reg.register(ToolDefinition(name="t", description="", parameters={}, execute=lambda args: None))
        reg.unregister("t")
        assert reg.get("t") is None

    def test_disable_tool(self):
        reg = ToolRegistry()
        reg.register(ToolDefinition(name="t", description="", parameters={}, execute=lambda args: None))
        reg.set_enabled("t", False)
        assert len(reg.get_enabled()) == 0

    def test_get_function_definitions(self):
        reg = ToolRegistry()
        reg.register(ToolDefinition(
            name="test_tool",
            description="A test tool",
            parameters={"type": "object", "properties": {"q": {"type": "string"}}, "required": ["q"]},
            execute=lambda args: None,
        ))
        defs = reg.get_function_definitions()
        assert len(defs) == 1
        assert defs[0]["type"] == "function"
        assert defs[0]["function"]["name"] == "test_tool"

    def test_get_tool_catalog(self):
        reg = ToolRegistry()
        reg.register(ToolDefinition(
            name="db_create",
            description="Create a document",
            parameters={},
            execute=lambda args: None,
            requires_confirmation=True,
        ))
        catalog = reg.get_tool_catalog()
        assert len(catalog) == 1
        assert catalog[0]["requires_confirmation"] is True
        assert catalog[0]["group"] == "general"


class TestIsPathAllowed:
    def test_allowed_knowledge_path(self):
        # ../YiKnowledge should be in _ALLOWED_ROOTS
        cwd = os.getcwd()
        target = os.path.join(cwd, "..", "YiKnowledge", "README.md")
        assert _is_path_allowed(target) is True

    def test_allowed_yiai_path(self):
        cwd = os.getcwd()
        target = os.path.join(cwd, "..", "YiAi", "src", "app.py")
        assert _is_path_allowed(target) is True

    def test_disallowed_random_path(self):
        assert _is_path_allowed("/etc/passwd") is False

    def test_disallowed_home_path(self):
        home = os.path.expanduser("~")
        # home is not in allowed roots
        assert _is_path_allowed(os.path.join(home, "test.txt")) is False


class TestToolResult:
    def test_default_values(self):
        result = ToolResult(call_id="c1", name="test", content="ok")
        assert result.error is None
        assert result.duration_ms == 0
        assert result.details is None
        assert result.terminate is False

    def test_with_error(self):
        result = ToolResult(call_id="c2", name="fail", content="", error="boom")
        assert result.error == "boom"

    def test_terminate_hint(self):
        result = ToolResult(call_id="c3", name="done", content="", terminate=True)
        assert result.terminate is True


class TestToolCall:
    def test_creation(self):
        call = ToolCall(id="t1", name="web_search", arguments={"query": "test"})
        assert call.id == "t1"
        assert call.name == "web_search"
        assert call.arguments == {"query": "test"}


class TestToolEvent:
    def test_creation(self):
        event = ToolEvent(phase="start", name="test", label="Test Tool")
        assert event.phase == "start"
        assert event.name == "test"
        assert event.label == "Test Tool"
        assert event.args is None
        assert event.error is None


class TestGetToolRegistry:
    def test_returns_registry(self):
        reg = get_tool_registry()
        assert reg is not None
        assert isinstance(reg, ToolRegistry)

    def test_singleton(self):
        reg1 = get_tool_registry()
        reg2 = get_tool_registry()
        assert reg1 is reg2