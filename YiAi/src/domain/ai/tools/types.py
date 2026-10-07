"""Tool system types — ToolDefinition, ToolCall, ToolResult, ToolEvent."""

from __future__ import annotations

from collections.abc import Awaitable, Callable
from dataclasses import dataclass
from typing import Any


@dataclass
class ToolDefinition:
    name: str
    description: str
    parameters: dict[str, Any]
    execute: Callable[..., Awaitable[dict[str, Any]]]
    requires_confirmation: bool = False


@dataclass
class ToolCall:
    id: str
    name: str
    arguments: dict[str, Any]


@dataclass
class ToolResult:
    call_id: str
    name: str
    content: str
    error: str | None = None
    duration_ms: float = 0
    details: Any = None
    terminate: bool = False


@dataclass
class ToolEvent:
    phase: str
    name: str
    label: str
    args: dict[str, Any] | None = None
    content: str | None = None
    error: str | None = None
    duration_ms: float = 0
    timestamp: float = 0.0
    tool_call_id: str | None = None
    partial_result: dict[str, Any] | None = None
    is_error: bool = False
