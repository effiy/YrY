"""
Tool registry and execution — Pi-inspired pluggable tool system.

Each tool declares a JSON Schema for its parameters and an async execute
function. Tool schemas tell the LLM what tools are available and the
registry executes tool calls the LLM requests.

Pattern adapted from Pi's ``AgentTool`` + ``executeTool`` in agent-core.
"""

from __future__ import annotations

import asyncio
import logging
import os
import time
import traceback
from dataclasses import dataclass
from typing import Any, Awaitable, Callable, Dict, List, Optional

import aiofiles

logger = logging.getLogger(__name__)


@dataclass
class ToolDefinition:
    """A tool that the LLM can call during an agent turn.

    Attributes:
        name: Unique tool identifier (e.g. ``web_search``).
        description: Human-readable description shown to the LLM.
        parameters: JSON Schema for the tool's arguments.
        execute: Async callable that receives the parsed arguments and returns
            a result dict with at least a ``content`` key.
        requires_confirmation: If True, the caller pauses and asks the
            user before executing this tool.
    """

    name: str
    description: str
    parameters: Dict[str, Any]
    execute: Callable[..., Awaitable[Dict[str, Any]]]
    requires_confirmation: bool = False


@dataclass
class ToolCall:
    """A concrete tool invocation requested by the LLM."""

    id: str
    name: str
    arguments: Dict[str, Any]


@dataclass
class ToolResult:
    """The result of executing a tool call."""

    call_id: str
    name: str
    content: str
    error: Optional[str] = None
    duration_ms: float = 0
    details: Any = None
    terminate: bool = False  # Pi: hint to stop after this tool batch


@dataclass
class ToolEvent:
    """Observability event emitted during tool execution (Pi pattern)."""

    phase: str  # "start" | "update" | "end"
    name: str
    label: str
    args: Optional[Dict[str, Any]] = None
    content: Optional[str] = None
    error: Optional[str] = None
    duration_ms: float = 0
    timestamp: float = 0.0
    # Pi: tool_execution_update fields
    tool_call_id: Optional[str] = None
    partial_result: Optional[Dict[str, Any]] = None
    is_error: bool = False


def _validate_arguments(name: str, arguments: Any, schema: Dict[str, Any]) -> Optional[str]:
    """Validate tool-call arguments against the tool's JSON Schema (Pi: validateToolArguments).

    Returns an error string if invalid, or ``None`` if valid. Lightweight check for
    required fields + declared property types, kept intentionally small so the error
    message is short and model-readable — the LLM can re-issue the call correctly.
    """
    if arguments is None:
        arguments = {}
    if not isinstance(arguments, dict):
        return f"Arguments for '{name}' must be a JSON object, got {type(arguments).__name__}"
    props = schema.get("properties") or {}
    for req_field in schema.get("required") or []:
        if req_field not in arguments:
            return f"Tool '{name}' is missing required argument '{req_field}'"
    for fname, value in arguments.items():
        ptype = (props.get(fname) or {}).get("type")
        if ptype == "string" and not isinstance(value, str):
            return f"Tool '{name}' argument '{fname}' must be a string, got {type(value).__name__}"
        if ptype == "object" and not isinstance(value, dict):
            return f"Tool '{name}' argument '{fname}' must be an object, got {type(value).__name__}"
        if ptype == "array" and not isinstance(value, list):
            return f"Tool '{name}' argument '{fname}' must be an array, got {type(value).__name__}"
        if ptype == "boolean" and not isinstance(value, bool):
            return f"Tool '{name}' argument '{fname}' must be a boolean, got {type(value).__name__}"
        if ptype == "integer" and not isinstance(value, int):
            return f"Tool '{name}' argument '{fname}' must be an integer, got {type(value).__name__}"
        if ptype == "number" and not isinstance(value, (int, float)):
            return f"Tool '{name}' argument '{fname}' must be a number, got {type(value).__name__}"
    return None


class ToolRegistry:
    """Registry of available tools.

    Tools are registered by name and can be toggled on/off per session.
    The registry produces the JSON Schema function definitions that the
    LLM uses to decide when to call tools.
    """

    def __init__(self):
        self._tools: Dict[str, ToolDefinition] = {}
        self._enabled: Dict[str, bool] = {}

    def register(self, tool: ToolDefinition) -> None:
        self._tools[tool.name] = tool
        self._enabled[tool.name] = True

    def unregister(self, name: str) -> None:
        self._tools.pop(name, None)
        self._enabled.pop(name, None)

    def set_enabled(self, name: str, enabled: bool) -> None:
        if name in self._tools:
            self._enabled[name] = enabled

    def get(self, name: str) -> Optional[ToolDefinition]:
        return self._tools.get(name)

    def get_enabled(self) -> List[ToolDefinition]:
        return [t for name, t in self._tools.items() if self._enabled.get(name, True)]

    def get_function_definitions(self) -> List[Dict[str, Any]]:
        """Return OpenAI/Anthropic-compatible function/tool definitions."""
        defs: List[Dict[str, Any]] = []
        for tool in self.get_enabled():
            defs.append({
                "type": "function",
                "function": {
                    "name": tool.name,
                    "description": tool.description,
                    "parameters": tool.parameters,
                },
            })
        return defs

    def get_tool_catalog(self) -> List[Dict[str, Any]]:
        """Return enriched tool descriptors for capability-discovery UIs.

        Unlike ``get_function_definitions`` (which produces the LLM-facing
        OpenAI schema), this exposes the confirmation flag + a coarse group so
        a frontend can render a browsable registry of what the agent can do.
        """
        return [
            {
                "name": tool.name,
                "description": tool.description,
                "parameters": tool.parameters,
                "requires_confirmation": tool.requires_confirmation,
                "group": _group_for(tool.name),
            }
            for tool in self.get_enabled()
        ]

    async def execute(
        self,
        call: ToolCall,
        *,
        signal: Optional[asyncio.Event] = None,
        on_event: Optional[Callable[[ToolEvent], Awaitable[None]]] = None,
        on_progress: Optional[Callable[[Dict[str, Any]], Awaitable[None]]] = None,
        timeout: float = 60.0,
    ) -> ToolResult:
        """Execute a tool call and emit observability events.

        Args:
            call: The tool call to execute.
            signal: Optional abort signal. If set, the tool execution is cancelled
                when the signal is triggered.
            on_event: Optional callback for observability events.
            on_progress: Optional callback for progress updates during long-running
                tool execution. Receives partial result dicts (Pi: tool_execution_update).
            timeout: Max seconds for tool execution (default 60s).

        Returns:
            ToolResult with content, error, and timing info.
        """
        tool = self._tools.get(call.name)
        if tool is None:
            return ToolResult(
                call_id=call.id,
                name=call.name,
                content="",
                error=f"Unknown tool: {call.name}",
            )

        if not self._enabled.get(call.name, True):
            return ToolResult(
                call_id=call.id,
                name=call.name,
                content="",
                error=f"Tool '{call.name}' is disabled",
            )

        label = tool.name.replace("_", " ").title()

        # Pi: validateToolArguments — fail fast on malformed calls instead of
        # executing them. A truncated/incomplete arg (e.g. a db_create missing
        # 'data') would otherwise hit the DB as a broken write.
        if tool.parameters:
            validate_error = _validate_arguments(call.name, call.arguments, tool.parameters)
            if validate_error:
                start_ts = time.time()
                if on_event:
                    await on_event(ToolEvent(
                        phase="start", name=call.name, label=label,
                        args=call.arguments, timestamp=start_ts,
                    ))
                    await on_event(ToolEvent(
                        phase="end", name=call.name, label=label,
                        content="", error=validate_error, timestamp=time.time(),
                    ))
                return ToolResult(
                    call_id=call.id, name=call.name, content="", error=validate_error,
                )

        start = time.monotonic()
        start_ts = time.time()

        if on_event:
            await on_event(ToolEvent(
                phase="start",
                name=call.name,
                label=label,
                args=call.arguments,
                timestamp=start_ts,
            ))

        async def _run_with_abort() -> Dict[str, Any]:
            """Run the tool in a task, checking the abort signal periodically."""
            if signal and signal.is_set():
                raise asyncio.CancelledError("Tool execution aborted")
            loop = asyncio.get_running_loop()
            # Pass on_progress if the tool supports it (Pi: tool_execution_update)
            import inspect
            try:
                _sig = inspect.signature(tool.execute)
                _has_progress = "on_progress" in _sig.parameters
            except (ValueError, TypeError):
                _has_progress = False
            coro = tool.execute(call.arguments, on_progress=on_progress) if _has_progress else tool.execute(call.arguments)
            task = loop.create_task(coro)
            if signal is None:
                return await task
            # Poll for abort while tool is running
            while not task.done():
                if signal.is_set():
                    task.cancel()
                    try:
                        await task
                    except asyncio.CancelledError:
                        pass
                    raise asyncio.CancelledError("Tool execution aborted")
                try:
                    return await asyncio.wait_for(asyncio.shield(task), timeout=0.5)
                except asyncio.TimeoutError:
                    continue
            return await task

        try:
            result = await asyncio.wait_for(_run_with_abort(), timeout=timeout)
            duration_ms = (time.monotonic() - start) * 1000
            content = result.get("content", "") if isinstance(result, dict) else str(result)
            # Propagate tool-reported errors (result dicts carry {"error": ...});
            # previously they were silently dropped from ToolResult.error.
            error = result.get("error") if isinstance(result, dict) else None

            if on_event:
                await on_event(ToolEvent(
                    phase="end",
                    name=call.name,
                    label=label,
                    content=content[:500] if content else "",
                    error=error,
                    duration_ms=duration_ms,
                    timestamp=time.time(),
                ))

            return ToolResult(
                call_id=call.id,
                name=call.name,
                content=content,
                error=error,
                duration_ms=duration_ms,
                details=result.get("details") if isinstance(result, dict) else None,
            )
        except asyncio.TimeoutError:
            duration_ms = (time.monotonic() - start) * 1000
            err = f"Tool execution timed out after {timeout}s"
            if on_event:
                await on_event(ToolEvent(
                    phase="end",
                    name=call.name,
                    label=label,
                    error=err,
                    duration_ms=duration_ms,
                    timestamp=time.time(),
                ))
            return ToolResult(call_id=call.id, name=call.name, content="", error=err, duration_ms=duration_ms)
        except asyncio.CancelledError:
            duration_ms = (time.monotonic() - start) * 1000
            err = "Tool execution aborted"
            if on_event:
                await on_event(ToolEvent(
                    phase="end",
                    name=call.name,
                    label=label,
                    error=err,
                    duration_ms=duration_ms,
                    timestamp=time.time(),
                ))
            return ToolResult(call_id=call.id, name=call.name, content="", error=err, duration_ms=duration_ms)
        except Exception as e:
            duration_ms = (time.monotonic() - start) * 1000
            err_msg = f"{type(e).__name__}: {e}"
            logger.warning(f"Tool '{call.name}' failed: {err_msg}\n{traceback.format_exc()}")
            if on_event:
                await on_event(ToolEvent(
                    phase="end",
                    name=call.name,
                    label=label,
                    error=err_msg,
                    duration_ms=duration_ms,
                    timestamp=time.time(),
                ))
            return ToolResult(call_id=call.id, name=call.name, content="", error=err_msg, duration_ms=duration_ms)


# ── Tool sandboxing helpers ────────────────────────────────────────────────

# Directories that file_read/file_write are allowed to access.
# Paths must resolve within one of these roots.
_ALLOWED_ROOTS = ["../YiKnowledge", "../YiVad", "../YiPet", "../YiAi", "../YiWeb", "../YiPett"]

# Domains that web_fetch is allowed to access. Subdomains are matched by suffix.
# Empty list = allow all (default when sandbox is off).
_ALLOWED_DOMAINS: List[str] = []


def _is_path_allowed(target: str) -> bool:
    """Check if a relative path resolves within an allowed root directory."""
    import os
    cwd = os.getcwd()
    resolved = os.path.normpath(os.path.join(cwd, target))
    for root in _ALLOWED_ROOTS:
        allowed = os.path.normpath(os.path.join(cwd, root))
        if resolved.startswith(allowed + os.sep) or resolved == allowed:
            return True
    return False


def _is_url_allowed(url: str) -> bool:
    """Check if a URL's host is in the allowed domains list."""
    if not _ALLOWED_DOMAINS:
        return True
    from urllib.parse import urlparse
    try:
        host = (urlparse(url).hostname or "").lower()
    except Exception:
        return False
    return any(
        host == allowed or host.endswith("." + allowed)
        for allowed in _ALLOWED_DOMAINS
    )


# ── Global singleton ──────────────────────────────────────────────────────

_registry: Optional[ToolRegistry] = None


def get_tool_registry() -> ToolRegistry:
    global _registry
    if _registry is None:
        _registry = ToolRegistry()
        from domain.ai.tools.builtin import _register_builtin_tools  # deferred import to avoid circular dependency
        _register_builtin_tools(_registry)
    return _registry


def _format_file_size(size_bytes: int) -> str:
    """Format file size for human-readable display."""
    if size_bytes < 1024:
        return f"{size_bytes}B"
    if size_bytes < 1024 * 1024:
        return f"{size_bytes / 1024:.1f}KB"
    return f"{size_bytes / (1024 * 1024):.1f}MB"


# Coarse grouping used only by capability-discovery UIs.
# Unknown tools fall back to "general".
_TOOL_GROUPS: Dict[str, str] = {
    "web_search": "search",
    "web_fetch": "search",
    "rag_search": "search",
    "file_read": "files",
    "file_write": "files",
    "read": "files",
    "write": "files",
    "edit": "files",
    "ls": "files",
    "find": "files",
    "grep": "files",
    "bash": "files",
    "mcp_chat": "mcp",
    "mcp_list_models": "mcp",
    "mcp_health": "mcp",
    "mcp_query_db": "mcp",
}


def _group_for(name: str) -> str:
    return _TOOL_GROUPS.get(name, "general")

