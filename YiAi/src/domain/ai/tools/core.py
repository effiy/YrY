"""Tool system — public API re-exports.

All types live in types.py, registry logic in registry.py, sandboxing in sandbox.py.
External callers should continue to import from domain.ai.tools.core.
"""

from .registry import ToolRegistry, _group_for, _validate_arguments  # noqa: F401
from .sandbox import _is_path_allowed, _is_url_allowed  # noqa: F401
from .types import ToolCall, ToolDefinition, ToolEvent, ToolResult  # noqa: F401

_registry: ToolRegistry | None = None


def get_tool_registry() -> ToolRegistry:
    global _registry
    if _registry is None:
        _registry = ToolRegistry()
        from domain.ai.tools.builtin import _register_builtin_tools
        _register_builtin_tools(_registry)
    return _registry


def _format_file_size(size_bytes: int) -> str:
    from humanize import naturalsize
    return naturalsize(size_bytes)
