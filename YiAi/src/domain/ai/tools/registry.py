"""Tool registry — registration, lookup, execution with observability events."""

from __future__ import annotations

import asyncio
from collections.abc import Awaitable, Callable
import logging
import time
import traceback
from typing import Any

from .types import ToolCall, ToolDefinition, ToolEvent, ToolResult

logger = logging.getLogger(__name__)

_TOOL_GROUPS: dict[str, str] = {
    "web_search": "search", "web_fetch": "search", "rag_search": "search",
    "file_read": "files", "file_write": "files", "read": "files",
    "write": "files", "edit": "files", "ls": "files", "find": "files",
    "grep": "files", "bash": "files",
    "mcp_chat": "mcp", "mcp_list_models": "mcp", "mcp_health": "mcp", "mcp_query_db": "mcp",
}


def _group_for(name: str) -> str:
    return _TOOL_GROUPS.get(name, "general")


def _validate_arguments(name: str, arguments: Any, schema: dict[str, Any]) -> str | None:
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
        if ptype == "number" and not isinstance(value, int | float):
            return f"Tool '{name}' argument '{fname}' must be a number, got {type(value).__name__}"
    return None


class ToolRegistry:
    def __init__(self):
        self._tools: dict[str, ToolDefinition] = {}
        self._enabled: dict[str, bool] = {}

    def register(self, tool: ToolDefinition) -> None:
        self._tools[tool.name] = tool
        self._enabled[tool.name] = True

    def unregister(self, name: str) -> None:
        self._tools.pop(name, None)
        self._enabled.pop(name, None)

    def set_enabled(self, name: str, enabled: bool) -> None:
        if name in self._tools:
            self._enabled[name] = enabled

    def get(self, name: str) -> ToolDefinition | None:
        return self._tools.get(name)

    def get_enabled(self) -> list[ToolDefinition]:
        return [t for name, t in self._tools.items() if self._enabled.get(name, True)]

    def get_function_definitions(self) -> list[dict[str, Any]]:
        return [{"type": "function", "function": {"name": t.name, "description": t.description, "parameters": t.parameters}} for t in self.get_enabled()]

    def get_tool_catalog(self) -> list[dict[str, Any]]:
        return [{"name": t.name, "description": t.description, "parameters": t.parameters, "requires_confirmation": t.requires_confirmation, "group": _group_for(t.name)} for t in self.get_enabled()]

    async def execute(self, call: ToolCall, *, signal: asyncio.Event | None = None, on_event: Callable[[ToolEvent], Awaitable[None]] | None = None, on_progress: Callable[[dict[str, Any]], Awaitable[None]] | None = None, timeout: float = 60.0) -> ToolResult:
        tool = self._tools.get(call.name)
        if tool is None:
            return ToolResult(call_id=call.id, name=call.name, content="", error=f"Unknown tool: {call.name}")
        if not self._enabled.get(call.name, True):
            return ToolResult(call_id=call.id, name=call.name, content="", error=f"Tool '{call.name}' is disabled")

        label = tool.name.replace("_", " ").title()

        if tool.parameters:
            validate_error = _validate_arguments(call.name, call.arguments, tool.parameters)
            if validate_error:
                start_ts = time.time()
                if on_event:
                    await on_event(ToolEvent(phase="start", name=call.name, label=label, args=call.arguments, timestamp=start_ts))
                    await on_event(ToolEvent(phase="end", name=call.name, label=label, content="", error=validate_error, timestamp=time.time()))
                return ToolResult(call_id=call.id, name=call.name, content="", error=validate_error)

        start = time.monotonic()
        start_ts = time.time()
        if on_event:
            await on_event(ToolEvent(phase="start", name=call.name, label=label, args=call.arguments, timestamp=start_ts))

        try:
            result = await asyncio.wait_for(self._run_with_abort(tool, call.arguments, signal, on_progress), timeout=timeout)
            duration_ms = (time.monotonic() - start) * 1000
            content = result.get("content", "") if isinstance(result, dict) else str(result)
            error = result.get("error") if isinstance(result, dict) else None
            if on_event:
                await on_event(ToolEvent(phase="end", name=call.name, label=label, content=content[:500] if content else "", error=error, duration_ms=duration_ms, timestamp=time.time()))
            return ToolResult(call_id=call.id, name=call.name, content=content, error=error, duration_ms=duration_ms, details=result.get("details") if isinstance(result, dict) else None)
        except asyncio.TimeoutError:
            duration_ms = (time.monotonic() - start) * 1000
            err = f"Tool execution timed out after {timeout}s"
            if on_event:
                await on_event(ToolEvent(phase="end", name=call.name, label=label, error=err, duration_ms=duration_ms, timestamp=time.time()))
            return ToolResult(call_id=call.id, name=call.name, content="", error=err, duration_ms=duration_ms)
        except asyncio.CancelledError:
            duration_ms = (time.monotonic() - start) * 1000
            err = "Tool execution aborted"
            if on_event:
                await on_event(ToolEvent(phase="end", name=call.name, label=label, error=err, duration_ms=duration_ms, timestamp=time.time()))
            return ToolResult(call_id=call.id, name=call.name, content="", error=err, duration_ms=duration_ms)
        except Exception as e:
            duration_ms = (time.monotonic() - start) * 1000
            err_msg = f"{type(e).__name__}: {e}"
            logger.warning(f"Tool '{call.name}' failed: {err_msg}\n{traceback.format_exc()}")
            if on_event:
                await on_event(ToolEvent(phase="end", name=call.name, label=label, error=err_msg, duration_ms=duration_ms, timestamp=time.time()))
            return ToolResult(call_id=call.id, name=call.name, content="", error=err_msg, duration_ms=duration_ms)

    async def _run_with_abort(self, tool: ToolDefinition, arguments: dict[str, Any], signal: asyncio.Event | None, on_progress: Callable | None) -> dict[str, Any]:
        if signal and signal.is_set():
            raise asyncio.CancelledError("Tool execution aborted")
        loop = asyncio.get_running_loop()
        import inspect
        try:
            _has_progress = "on_progress" in inspect.signature(tool.execute).parameters
        except (ValueError, TypeError):
            _has_progress = False
        coro = tool.execute(arguments, on_progress=on_progress) if _has_progress else tool.execute(arguments)
        task = loop.create_task(coro)
        if signal is None:
            return await task
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
