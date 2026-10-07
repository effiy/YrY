"""Built-in agent tools — re-exports all tool groups."""

from .file_tools import register_file_tools
from .web_tools import register_web_tools
from .knowledge_tools import register_knowledge_tools


def _register_builtin_tools(registry) -> None:
    """Register the built-in tools that ship with YiAi."""
    register_file_tools(registry)
    register_web_tools(registry)
    register_knowledge_tools(registry)
