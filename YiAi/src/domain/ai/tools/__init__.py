"""Tool registry — Pi-inspired pluggable tool system."""
from domain.ai.tools.core import (
    ToolDefinition, ToolCall, ToolResult, ToolEvent,
    ToolRegistry, _validate_arguments,
    get_tool_registry, _is_path_allowed, _is_url_allowed,
    _format_file_size, _group_for,
)
from domain.ai.tools.builtin import _register_builtin_tools
from domain.ai.tools.mcp import _register_mcp_tools, _extract_mcp_text

__all__ = [
    "ToolDefinition", "ToolCall", "ToolResult", "ToolEvent",
    "ToolRegistry", "get_tool_registry",
    "_register_builtin_tools", "_register_mcp_tools", "_extract_mcp_text",
]
