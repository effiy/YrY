"""
Agent loop — Pi-inspired multi-turn reasoning with tool calling.

Implements the core agent pattern::

    User message → [think → tool_call → observe] × N → respond

The agent loop emits a rich SSE event stream for high observability::

    agent_start → turn_start → message_start → [thinking] →
    [tool_execution_start → tool_execution_end] × N →
    message_end → turn_end → agent_end

Each event carries a ``type``, ``timestamp``, and type-specific payload so
the frontend can render per-step agent state (thinking spinner, tool timeline,
token usage, etc.) in real time.

Pattern adapted from Pi's ``agent-loop.ts`` + ``agent.ts`` in
``@earendil-works/pi-agent-core``.
"""

from __future__ import annotations

import asyncio
import json
import logging
import time
import uuid
from dataclasses import dataclass, field
from enum import Enum
from typing import Any, AsyncIterator, Awaitable, Callable, Dict, List, Optional

from domain.ai.tools import (
    ToolCall,
    ToolDefinition,
    ToolEvent,
    ToolRegistry,
    ToolResult,
    get_tool_registry,
)

logger = logging.getLogger(__name__)

# ── Constants ──────────────────────────────────────────────────────────────

_CHARS_PER_TOKEN = 4
_COMPACTION_THRESHOLD = 0.8  # 80% of context window
_DEFAULT_CONTEXT_WINDOW = 8192
_CONFIRMATION_TIMEOUT_S = 120  # how long the loop waits for a user approve/reject
_CONFIRMATION_POLL_S = 1.5  # poll interval for the user's decision

# Substrings that mark a user message as a *concrete task* (do something to data)
# rather than pure Q&A. Used by the no-tool task-completion nudge below: a run that
# ends with zero tools executed on a task-like request is likely incomplete, even
# when the model never *named* a tool (so the named-tool guard stays quiet).
_TASK_MARKERS_ZH = (
    "创建", "新增", "添加", "插入", "删除", "移除", "更新", "修改", "改名为", "重命名",
    "改名", "列出", "查询", "统计", "汇总", "数一数", "导出", "生成", "保存", "写入",
    "读取", "清理", "禁用", "启用", "移动", "复制", "完成", "执行", "帮我", "补充",
)
_TASK_MARKERS_EN = (
    "create", "add", "insert", "delete", "remove", "update", "rename",
    "list", "query", "count", "export", "generate", "save", "write", "read",
    "clean", "disable", "enable", "move", "copy", "complete", "execute", "do it",
)


def _is_task_request(text: str) -> bool:
    """Heuristic: does this user message ask for a concrete action on data?

    Looks for task-verb substrings (zh + en) on the lowercased text. Pure Q&A
    ("what is X", "why...") rarely contains these verbs, so this stays quiet
    there while catching "create a menu", "delete the row", "count the menus".
    """
    if not text:
        return False
    lowered = text.lower()
    return any(m in text for m in _TASK_MARKERS_ZH) or any(m in lowered for m in _TASK_MARKERS_EN)


def _last_user_text(messages: List["AgentMessage"]) -> str:
    """Return the content of the most recent user-role message, or empty."""
    for m in reversed(messages):
        if m.role == "user":
            return m.content or ""
    return ""


# ── Agent event types (Pi parity) ─────────────────────────────────────────


class AgentEventType(str, Enum):
    AGENT_START = "agent_start"
    AGENT_END = "agent_end"
    TURN_START = "turn_start"
    TURN_END = "turn_end"
    MESSAGE_START = "message_start"
    MESSAGE_END = "message_end"
    THINKING = "thinking"
    TOOL_EXECUTION_START = "tool_execution_start"
    TOOL_EXECUTION_UPDATE = "tool_execution_update"  # Pi: partial progress during long-running tools
    TOOL_EXECUTION_END = "tool_execution_end"
    COMPACTION = "compaction"
    CONFIRMATION_REQUIRED = "confirmation_required"
    MODEL_SWITCH = "model_switch"
    ERROR = "error"


@dataclass
class AgentEvent:
    """An observability event emitted by the agent loop."""

    type: str
    timestamp: float = field(default_factory=time.time)
    message: Optional[Dict[str, Any]] = None
    turn_index: int = 0
    tool_results: Optional[List[Dict[str, Any]]] = None
    tool: Optional[Dict[str, Any]] = None
    phase: Optional[str] = None
    delta: Optional[str] = None
    error: Optional[str] = None
    usage: Optional[Dict[str, Any]] = None
    stop_reason: Optional[str] = None
    messages: Optional[List[Dict[str, Any]]] = None
    # compaction event
    before_count: int = 0
    after_count: int = 0
    saved_tokens: int = 0
    # confirmation event
    tool_name: Optional[str] = None
    tool_args: Optional[Dict[str, Any]] = None
    confirmation_id: Optional[str] = None  # call id the user approves/rejects via /agent/confirm
    # tool_execution_update event (Pi: partial progress)
    tool_call_id: Optional[str] = None
    partial_result: Optional[Dict[str, Any]] = None
    is_error: bool = False
    terminate: bool = False  # Pi: tool result requests early loop termination

    def to_sse(self) -> str:
        payload = {"type": self.type, "timestamp": self.timestamp}
        if self.message is not None:
            payload["message"] = self.message
        if self.turn_index:
            payload["turn_index"] = self.turn_index
        if self.tool_results is not None:
            payload["tool_results"] = self.tool_results
        if self.tool is not None:
            payload["tool"] = self.tool
        if self.phase is not None:
            payload["phase"] = self.phase
        if self.delta is not None:
            payload["delta"] = self.delta
        if self.error is not None:
            payload["error"] = self.error
        if self.usage is not None:
            payload["usage"] = self.usage
        if self.stop_reason is not None:
            payload["stop_reason"] = self.stop_reason
        if self.messages is not None:
            payload["messages"] = self.messages
        if self.before_count:
            payload["before_count"] = self.before_count
        if self.after_count:
            payload["after_count"] = self.after_count
        if self.saved_tokens:
            payload["saved_tokens"] = self.saved_tokens
        if self.tool_name is not None:
            payload["tool_name"] = self.tool_name
        if self.tool_args is not None:
            payload["tool_args"] = self.tool_args
        if self.confirmation_id is not None:
            payload["confirmation_id"] = self.confirmation_id
        if self.tool_call_id is not None:
            payload["tool_call_id"] = self.tool_call_id
        if self.partial_result is not None:
            payload["partial_result"] = self.partial_result
        if self.is_error:
            payload["is_error"] = self.is_error
        if self.terminate:
            payload["terminate"] = self.terminate
        return f"data: {json.dumps(payload, ensure_ascii=False)}\n\n"


# ── Agent message types ───────────────────────────────────────────────────


@dataclass
class AgentMessage:
    """A message in the agent's conversation history."""

    role: str  # "user" | "assistant" | "tool_call" | "tool_result" | "system"
    content: str = ""
    tool_calls: Optional[List[ToolCall]] = None
    tool_call_id: Optional[str] = None
    name: Optional[str] = None
    timestamp: float = field(default_factory=time.time)
    metadata: Dict[str, Any] = field(default_factory=dict)


# ── Agent configuration ───────────────────────────────────────────────────


@dataclass
class PrepareNextTurnContext:
    """Context passed to prepare_next_turn hook (Pi: PrepareNextTurnContext)."""

    message: AgentMessage
    tool_results: List[ToolResult]
    context: List[AgentMessage]
    new_messages: List[AgentMessage]


@dataclass
class AgentLoopTurnUpdate:
    """Returned by prepare_next_turn to modify the next turn's config (Pi: AgentLoopTurnUpdate)."""

    model: Optional[str] = None
    system_prompt: Optional[str] = None
    temperature: Optional[float] = None
    top_p: Optional[float] = None


@dataclass
class AgentConfig:
    """Configuration for an agent run."""

    model: str = "qwen3.5"
    system_prompt: str = "You are a helpful AI assistant with access to tools."
    max_turns: int = 10
    tool_execution: str = "parallel"  # "sequential" | "parallel" (Pi default: parallel)
    stream: bool = True
    temperature: float = 0.7
    top_p: float = 0.9
    context_window: int = _DEFAULT_CONTEXT_WINDOW
    auto_compact: bool = True
    compaction_keep_last: int = 4
    steering_mode: str = "all"  # Pi QueueMode: "all" | "one-at-a-time"
    follow_up_mode: str = "one-at-a-time"  # Pi QueueMode for follow-up messages
    llm_max_retries: int = 2  # Pi: retry transient LLM failures (connection reset, model still loading)
    llm_retry_backoff_base: float = 0.5  # exponential backoff: base * 2^(attempt-1) seconds
    model_fallback: List[str] = field(default_factory=list)  # escalate to these on stall, in order

    # ── Lifecycle hooks (Pi: beforeToolCall / afterToolCall) ──────────

    async def before_tool_call(self, call: ToolCall, context: List[AgentMessage]) -> Optional[Dict[str, Any]]:
        """Called before executing a tool. Return ``{"block": True, "reason": "..."}`` to block."""
        return None

    async def after_tool_call(self, call: ToolCall, result: ToolResult, context: List[AgentMessage]) -> Optional[Dict[str, Any]]:
        """Called after tool execution. Return a dict to override the result."""
        return None

    async def should_stop_after_turn(self, message: AgentMessage, results: List[ToolResult]) -> bool:
        """Return True to stop the agent loop after this turn."""
        return False

    async def prepare_next_turn(
        self, _context: PrepareNextTurnContext
    ) -> Optional[AgentLoopTurnUpdate]:
        """Called after turn_end to optionally switch model/config for the next turn (Pi: prepareNextTurn)."""
        return None

    async def transform_context(
        self, messages: List[AgentMessage]
    ) -> List[AgentMessage]:
        """Called before each LLM call to transform the context (Pi: transformContext).

        Use this to prune old messages, inject external context, or apply any
        AgentMessage-level transformation before the context is sent to the LLM.

        Contract: must not throw. Return the original messages or a safe fallback.
        """
        return messages


# ── Tool call parser ──────────────────────────────────────────────────────


def _parse_tool_calls_from_text(text: str) -> List[ToolCall]:
    """Parse tool calls from LLM text output."""
    import re

    calls: List[ToolCall] = []

    xml_pattern = r"<tool_call>\s*(.*?)\s*</tool_call>"
    for match in re.finditer(xml_pattern, text, re.DOTALL):
        try:
            data = json.loads(match.group(1))
            calls.append(ToolCall(
                id=f"call_{uuid.uuid4().hex[:8]}",
                name=data.get("name", ""),
                arguments=data.get("arguments", {}),
            ))
        except json.JSONDecodeError:
            continue

    if calls:
        return calls

    json_pattern = r"```(?:json)?\s*(\{.*?\})\s*```"
    for match in re.finditer(json_pattern, text, re.DOTALL):
        try:
            data = json.loads(match.group(1))
            if "name" in data and "arguments" in data:
                calls.append(ToolCall(
                    id=f"call_{uuid.uuid4().hex[:8]}",
                    name=data.get("name", ""),
                    arguments=data.get("arguments", {}),
                ))
        except json.JSONDecodeError:
            continue

    return calls


def _strip_tool_calls_from_text(text: str) -> str:
    import re
    text = re.sub(r"<tool_call>.*?</tool_call>", "", text, flags=re.DOTALL)
    text = re.sub(r"```(?:json)?\s*\{.*?\"name\".*?\}\s*```", "", text, flags=re.DOTALL)
    return text.strip()


async def _wait_for_confirmation(session_id: str, call: ToolCall, abort: asyncio.Event,
                                 confirmation_id: str | None = None) -> str:
    """Wait for the user's approve/reject decision on a tool call.

    The decision is recorded via ``POST /agent/confirm`` and read from an
    in-memory store in ``server/routes/agent.py`` (same pattern as steering).
    Returns ``"approved" | "rejected" | "timeout"``.

    ``confirmation_id`` must be unique per confirmation *request*: Ollama
    resets native tool-call ids to ``tool_0``/``tool_1`` on every generation,
    so ``call.id`` alone collides across turns. A stale decision from an
    earlier turn could otherwise auto-approve a later, different tool call.
    The caller prefixes ``call.id`` with the turn index; ``call.id`` itself
    is still used for the tool_result message protocol (it must match the
    provider's call id verbatim).
    """
    if not session_id:
        return "rejected"
    key = confirmation_id or call.id
    try:
        from server.routes.agent import get_confirmation_decision, mark_confirmation_seen
    except Exception:
        return "rejected"
    deadline = time.monotonic() + _CONFIRMATION_TIMEOUT_S
    while time.monotonic() < deadline:
        if abort.is_set():
            return "rejected"
        decision = get_confirmation_decision(session_id, key)
        if decision is not None:
            mark_confirmation_seen(session_id, key)
            return decision
        await asyncio.sleep(_CONFIRMATION_POLL_S)
    return "timeout"


# ── Token estimation ──────────────────────────────────────────────────────


def _estimate_tokens(messages: List[AgentMessage]) -> int:
    """Conservative token count from message content strings."""
    total = 0
    for m in messages:
        total += len(m.content) // _CHARS_PER_TOKEN
        total += 4  # role/metadata overhead per message
    return total


def _should_compact(messages: List[AgentMessage], context_window: int) -> bool:
    return _estimate_tokens(messages) > int(context_window * _COMPACTION_THRESHOLD)


# ── Compaction ────────────────────────────────────────────────────────────


async def _compact_messages(
    messages: List[AgentMessage],
    keep_last: int = 4,
    model: str = "qwen3.5",
) -> List[AgentMessage]:
    """Summarize older messages, keep recent ones verbatim."""
    if len(messages) <= keep_last:
        return messages

    to_summarize = messages[:-keep_last]
    recent = messages[-keep_last:]

    conversation_text = "\n\n".join(
        f"[{m.role}]: {m.content[:2000]}" for m in to_summarize
    )
    summary_prompt = (
        "Summarize the key points, decisions, and context from the following "
        "conversation. Keep it concise but include all important facts that "
        "would be needed to continue the conversation coherently.\n\n"
        f"{conversation_text}\n\n"
        "Summary:"
    )

    try:
        from services.ai.model_runtime import OllamaRuntime

        runtime = OllamaRuntime()
        result = await runtime.complete(
            messages=[{"role": "user", "content": summary_prompt}],
            model=model,
        )

        if result.get("success"):
            summary = result["message"]
            saved = _estimate_tokens(to_summarize) - len(summary) // _CHARS_PER_TOKEN
            logger.info(
                f"Compaction: {len(to_summarize)} msgs → summary "
                f"({len(conversation_text)} → {len(summary)} chars, saved ~{saved} tokens)"
            )
            system_msg = AgentMessage(
                role="system",
                content=f"[Previous conversation summary]\n{summary}\n[/Previous conversation summary]",
            )
            return [system_msg] + [AgentMessage(role=m.role, content=m.content) for m in recent]
        else:
            logger.warning(f"Compaction summarization failed: {result.get('error')}")
            return messages
    except Exception as e:
        logger.warning(f"Compaction failed: {e}")
        return messages


# ── Agent loop ────────────────────────────────────────────────────────────


async def run_agent_loop(
    messages: List[Dict[str, Any]],
    config: Optional[AgentConfig] = None,
    *,
    tool_registry: Optional[ToolRegistry] = None,
    signal: Optional[asyncio.Event] = None,
    on_event: Optional[Callable[[AgentEvent], Awaitable[None]]] = None,
    images: Optional[List[bytes]] = None,
    session_id: str = "",
) -> AsyncIterator[Dict[str, Any] | AgentEvent]:
    """Run the agent loop and yield SSE-ready dicts and AgentEvents."""
    cfg = config or AgentConfig()
    registry = tool_registry or get_tool_registry()
    abort = signal or asyncio.Event()

    turn_index = 0
    total_tokens = 0
    agent_messages: List[AgentMessage] = [
        AgentMessage(role=m.get("role", "user"), content=str(m.get("content", "")))
        for m in messages
    ]

    # ── Steering / follow-up queues (Pi: Agent.steer / Agent.followUp) ──
    steering_queue: List[AgentMessage] = []
    follow_up_queue: List[AgentMessage] = []

    def _drain_steering() -> List[AgentMessage]:
        """Drain steering queue per QueueMode."""
        if not steering_queue:
            return []
        if cfg.steering_mode == "all":
            drained = list(steering_queue)
            steering_queue.clear()
            return drained
        # one-at-a-time
        first = steering_queue.pop(0)
        return [first]

    def _drain_follow_up() -> List[AgentMessage]:
        """Drain follow-up queue per QueueMode."""
        if not follow_up_queue:
            return []
        if cfg.follow_up_mode == "all":
            drained = list(follow_up_queue)
            follow_up_queue.clear()
            return drained
        first = follow_up_queue.pop(0)
        return [first]

    yield await _emit(AgentEvent(type=AgentEventType.AGENT_START), on_event)

    # Track tools actually executed + narrate-and-stop nudges (qwen3.5 sometimes
    # *describes* the next tool call without emitting it — see no-tool branch).
    _executed_tool_names: set[str] = set()
    _nudges = 0
    _MAX_NUDGES = 2
    _model_escalated = False  # one escalation per run; a second stall ends it
    _task_nudged = False  # one no-tool task-completion nudge per run

    # Outer loop: process user turns + queued messages
    while turn_index < cfg.max_turns:
        if abort.is_set():
            yield await _emit(AgentEvent(
                type=AgentEventType.AGENT_END,
                stop_reason="aborted",
                usage={"total_tokens": total_tokens, "turns": turn_index},
                messages=[{"role": m.role, "content": m.content} for m in agent_messages],
            ), on_event)
            yield {"done": True}
            return

        # ── Drain steering queue (Pi: pendingMessages) ──────────────────
        drained_steering = _drain_steering()
        if drained_steering:
            for sm in drained_steering:
                agent_messages.append(sm)

        # ── Drain external steering store (Pi: Agent.steer) ────────────
        if session_id:
            try:
                from server.routes.agent import get_steering_messages
                external_steers = get_steering_messages(session_id)
                for es in external_steers:
                    steering_queue.append(AgentMessage(
                        role="user",
                        content=str(es.get("content", "")),
                    ))
            except Exception:
                pass  # steering is best-effort

        # ── Auto-compaction (Pi: shouldCompact before each LLM call) ────
        if cfg.auto_compact and _should_compact(agent_messages, cfg.context_window):
            before = len(agent_messages)
            before_tokens = _estimate_tokens(agent_messages)
            agent_messages = await _compact_messages(
                agent_messages,
                keep_last=cfg.compaction_keep_last,
                model=cfg.model,
            )
            after = len(agent_messages)
            after_tokens = _estimate_tokens(agent_messages)
            yield await _emit(AgentEvent(
                type=AgentEventType.COMPACTION,
                before_count=before,
                after_count=after,
                saved_tokens=max(0, before_tokens - after_tokens),
            ), on_event)

        turn_index += 1

        yield await _emit(AgentEvent(
            type=AgentEventType.TURN_START,
            turn_index=turn_index,
        ), on_event)

        # ── Get LLM response ───────────────────────────────────────────
        streaming_content = ""
        tool_calls: List[ToolCall] = []
        turn_tokens = 0
        stop_reason: Optional[str] = None  # Pi: length → truncated tool-call args

        # Pi: transformContext — allow pre-LLM context transformation
        if cfg.transform_context:
            try:
                agent_messages = await cfg.transform_context(agent_messages)
            except Exception:
                pass  # contract: must not throw

        try:
            async for chunk in _stream_llm_response(agent_messages, cfg, registry, abort, images):
                if abort.is_set():
                    break
                if isinstance(chunk, dict):
                    if chunk.get("error"):
                        # Pi: surface LLM failures instead of silently dropping them.
                        # With retries exhausted (or content already streamed), the
                        # run cannot continue meaningfully — end it with a clear error.
                        error_msg = chunk["error"]
                        logger.error(f"Agent LLM stream failed: {error_msg}")
                        yield await _emit(AgentEvent(
                            type=AgentEventType.ERROR,
                            error=error_msg,
                        ), on_event)
                        yield await _emit(AgentEvent(
                            type=AgentEventType.AGENT_END,
                            stop_reason="error",
                            usage={"total_tokens": total_tokens + turn_tokens, "turns": turn_index},
                            messages=[{"role": m.role, "content": m.content} for m in agent_messages],
                        ), on_event)
                        yield {"error": error_msg}
                        yield {"done": True}
                        return
                    if chunk.get("done_reason"):
                        stop_reason = chunk["done_reason"]
                    delta = chunk.get("delta", "")
                    if delta:
                        streaming_content += delta
                        turn_tokens += len(delta) // _CHARS_PER_TOKEN
                        yield await _emit(AgentEvent(
                            type=AgentEventType.THINKING,
                            phase="streaming",
                            delta=delta,
                        ), on_event)
                        yield {"data": {"message": delta}}
                    if chunk.get("tool_calls"):
                        tool_calls = chunk["tool_calls"]
                elif isinstance(chunk, str):
                    streaming_content += chunk
                    turn_tokens += len(chunk) // _CHARS_PER_TOKEN
                    yield await _emit(AgentEvent(
                        type=AgentEventType.THINKING,
                        phase="streaming",
                        delta=chunk,
                    ), on_event)
                    yield {"data": {"message": chunk}}
        except Exception as e:
            logger.exception(f"Agent turn {turn_index} failed")
            yield await _emit(AgentEvent(
                type=AgentEventType.ERROR,
                error=f"LLM call failed: {e}",
            ), on_event)
            yield {"error": str(e)}
            break

        if abort.is_set():
            yield await _emit(AgentEvent(
                type=AgentEventType.AGENT_END,
                stop_reason="aborted",
                usage={"total_tokens": total_tokens + turn_tokens, "turns": turn_index},
                messages=[{"role": m.role, "content": m.content} for m in agent_messages],
            ), on_event)
            yield {"done": True}
            return

        if not tool_calls:
            tool_calls = _parse_tool_calls_from_text(streaming_content)

        clean_content = _strip_tool_calls_from_text(streaming_content)

        assistant_msg = AgentMessage(
            role="assistant",
            content=clean_content,
            tool_calls=tool_calls if tool_calls else None,
        )
        agent_messages.append(assistant_msg)

        yield await _emit(AgentEvent(
            type=AgentEventType.MESSAGE_END,
            message={"role": "assistant", "content": clean_content},
        ), on_event)

        # ── Execute tool calls with lifecycle hooks ────────────────────
        if tool_calls:
            tool_results: List[ToolResult] = []

            # Pi: failToolCallsFromTruncatedMessage — if the model hit its output
            # token limit, the streamed tool-call arguments may be truncated and
            # incomplete. None are safe to execute; fail each so the model re-issues.
            if stop_reason == "length":
                for _call in tool_calls:
                    _err = (
                        f"Tool call \"{_call.name}\" was not executed: the response hit "
                        "the output token limit, so its arguments may be truncated. "
                        "Re-issue the tool call with complete arguments."
                    )
                    yield await _emit(AgentEvent(
                        type=AgentEventType.TOOL_EXECUTION_START,
                        tool={"name": _call.name, "label": _call.name.replace("_", " ").title()},
                    ), on_event)
                    yield await _emit(AgentEvent(
                        type=AgentEventType.TOOL_EXECUTION_END,
                        tool={"name": _call.name, "label": _call.name.replace("_", " ").title(),
                              "content": "", "error": _err},
                    ), on_event)
                    tool_results.append(ToolResult(
                        call_id=_call.id, name=_call.name, content="", error=_err,
                    ))
                for result in tool_results:
                    agent_messages.append(AgentMessage(
                        role="tool_result",
                        content=f"Error: {result.error}",
                        tool_call_id=result.call_id,
                        name=result.name,
                        metadata={"error": result.error},
                    ))
                total_tokens += turn_tokens
                yield await _emit(AgentEvent(
                    type=AgentEventType.TURN_END,
                    turn_index=turn_index,
                    tool_results=[
                        {"name": r.name, "content": "", "error": r.error,
                         "duration_ms": r.duration_ms, "terminate": False}
                        for r in tool_results
                    ],
                    usage={"turn_tokens": turn_tokens, "total_tokens": total_tokens},
                ), on_event)
                continue

            # Pi: preflight phase — validate, check confirmation, run beforeToolCall hooks
            _preflight: List[tuple[ToolCall, Optional[ToolResult]]] = []
            for call in tool_calls:
                if abort.is_set():
                    break

                tool_def = registry.get(call.name)
                if tool_def and tool_def.requires_confirmation:
                    # Pi: pause the loop and ask the user before executing a
                    # destructive tool. The frontend renders Approve/Reject and
                    # calls POST /agent/confirm; we poll for the decision.
                    # confirmation_id is prefixed with the turn index so it is
                    # unique per request (Ollama reuses tool_0 every turn).
                    confirm_id = f"t{turn_index}:{call.id}"
                    yield await _emit(AgentEvent(
                        type=AgentEventType.CONFIRMATION_REQUIRED,
                        tool_name=call.name,
                        tool_args=call.arguments,
                        confirmation_id=confirm_id,
                        message={"role": "tool", "content": f"Tool '{call.name}' requires user confirmation"},
                    ), on_event)
                    decision = await _wait_for_confirmation(session_id, call, abort, confirm_id)
                    if decision != "approved":
                        reason = (
                            "Rejected by user" if decision == "rejected"
                            else "Confirmation timed out — tool skipped"
                        )
                        _preflight.append((call, ToolResult(
                            call_id=call.id, name=call.name, content="",
                            error=reason,
                        )))
                        continue
                    _preflight.append((call, None))  # approved → execute
                    continue

                if cfg.before_tool_call:
                    hook_result = await cfg.before_tool_call(call, agent_messages)
                    if hook_result and hook_result.get("block"):
                        _preflight.append((call, ToolResult(
                            call_id=call.id, name=call.name, content="",
                            error=hook_result.get("reason", "Blocked by before_tool_call hook"),
                        )))
                        continue

                _preflight.append((call, None))  # None = needs execution

            # Pi: execution phase — sequential or parallel
            if cfg.tool_execution == "parallel" and len(_preflight) > 1:
                # Parallel: execute all allowed tools concurrently
                async def _execute_one(call: ToolCall) -> tuple[ToolCall, ToolResult]:
                    _progress_events: List[AgentEvent] = []

                    async def _on_tool_progress(partial: Dict[str, Any]) -> None:
                        _progress_events.append(AgentEvent(
                            type=AgentEventType.TOOL_EXECUTION_UPDATE,
                            tool_call_id=call.id,
                            partial_result=partial,
                            is_error=partial.get("error") is not None,
                            tool={"name": call.name, "label": call.name.replace("_", " ").title()},
                        ))

                    # Pi: tool_execution_start / tool_execution_end lifecycle
                    async def _on_tool_event(te: ToolEvent) -> None:
                        if te.phase == "start":
                            _progress_events.append(AgentEvent(
                                type=AgentEventType.TOOL_EXECUTION_START,
                                tool={"name": te.name, "label": te.label},
                            ))
                        elif te.phase == "end":
                            _progress_events.append(AgentEvent(
                                type=AgentEventType.TOOL_EXECUTION_END,
                                tool={"name": te.name, "label": te.label, "content": te.content, "error": te.error},
                            ))

                    result = await registry.execute(
                        call, signal=abort,
                        on_event=_on_tool_event,
                        on_progress=_on_tool_progress if cfg.stream else None,
                    )
                    return call, result, _progress_events

                _tasks = []
                for call, blocked in _preflight:
                    if blocked is not None:
                        tool_results.append(blocked)
                    else:
                        _tasks.append(_execute_one(call))

                if _tasks:
                    _exec_results = await asyncio.gather(*_tasks)
                    for call, result, progress_events in _exec_results:
                        if cfg.after_tool_call:
                            override = await cfg.after_tool_call(call, result, agent_messages)
                            if override:
                                if "content" in override:
                                    result.content = override["content"]
                                if "error" in override:
                                    result.error = override["error"]
                        tool_results.append(result)
                        for pe in progress_events:
                            yield await _emit(pe, on_event)
            else:
                # Sequential: execute one at a time (original behavior)
                for call, blocked in _preflight:
                    if blocked is not None:
                        tool_results.append(blocked)
                        continue

                    _progress_events: List[AgentEvent] = []

                    async def _on_tool_progress_seq(partial: Dict[str, Any]) -> None:
                        _progress_events.append(AgentEvent(
                            type=AgentEventType.TOOL_EXECUTION_UPDATE,
                            tool_call_id=call.id,
                            partial_result=partial,
                            is_error=partial.get("error") is not None,
                            tool={"name": call.name, "label": call.name.replace("_", " ").title()},
                        ))

                    # Pi: tool_execution_start / tool_execution_end lifecycle
                    async def _on_tool_event_seq(te: ToolEvent) -> None:
                        if te.phase == "start":
                            _progress_events.append(AgentEvent(
                                type=AgentEventType.TOOL_EXECUTION_START,
                                tool={"name": te.name, "label": te.label},
                            ))
                        elif te.phase == "end":
                            _progress_events.append(AgentEvent(
                                type=AgentEventType.TOOL_EXECUTION_END,
                                tool={"name": te.name, "label": te.label, "content": te.content, "error": te.error},
                            ))

                    result = await registry.execute(
                        call, signal=abort,
                        on_event=_on_tool_event_seq,
                        on_progress=_on_tool_progress_seq if cfg.stream else None,
                    )

                    for pe in _progress_events:
                        yield await _emit(pe, on_event)

                    if cfg.after_tool_call:
                        override = await cfg.after_tool_call(call, result, agent_messages)
                        if override:
                            if "content" in override:
                                result.content = override["content"]
                            if "error" in override:
                                result.error = override["error"]

                    tool_results.append(result)

            for result in tool_results:
                _executed_tool_names.add(result.name)
                tr_msg = AgentMessage(
                    role="tool_result",
                    content=result.content if not result.error else f"Error: {result.error}",
                    tool_call_id=result.call_id,
                    name=result.name,
                    metadata={"error": result.error, "duration_ms": result.duration_ms},
                )
                agent_messages.append(tr_msg)

            total_tokens += turn_tokens

            yield await _emit(AgentEvent(
                type=AgentEventType.TURN_END,
                turn_index=turn_index,
                tool_results=[
                    {
                        "name": r.name,
                        "content": r.content[:200] if r.content else "",
                        "error": r.error,
                        "duration_ms": r.duration_ms,
                        "terminate": r.terminate,
                    }
                    for r in tool_results
                ],
                usage={"turn_tokens": turn_tokens, "total_tokens": total_tokens},
            ), on_event)

            # Pi: prepareNextTurn — allow model/config switching between turns
            if cfg.prepare_next_turn:
                turn_ctx = PrepareNextTurnContext(
                    message=assistant_msg,
                    tool_results=tool_results,
                    context=agent_messages,
                    new_messages=[assistant_msg] + [
                        AgentMessage(
                            role="tool_result",
                            content=r.content if not r.error else f"Error: {r.error}",
                            tool_call_id=r.call_id,
                            name=r.name,
                        )
                        for r in tool_results
                    ],
                )
                update = await cfg.prepare_next_turn(turn_ctx)
                if update:
                    if update.model:
                        cfg.model = update.model
                    if update.system_prompt:
                        cfg.system_prompt = update.system_prompt
                    if update.temperature is not None:
                        cfg.temperature = update.temperature
                    if update.top_p is not None:
                        cfg.top_p = update.top_p

            # Pi: terminate flag — if all tool results request termination, stop the loop
            if tool_results and all(r.terminate for r in tool_results):
                break

            # shouldStopAfterTurn (Pi: early termination hint)
            if cfg.should_stop_after_turn and await cfg.should_stop_after_turn(assistant_msg, tool_results):
                break

            continue

        # ── No tool calls — agent is done with this turn ───────────────
        total_tokens += turn_tokens
        yield await _emit(AgentEvent(
            type=AgentEventType.TURN_END,
            turn_index=turn_index,
            # Report the real LLM stop reason ("length" → output budget exhausted
            # mid-generation, which can leave the task incomplete), not a masked
            # "completed" — observability for truncated no-tool turns.
            stop_reason=stop_reason or "completed",
            usage={"turn_tokens": turn_tokens, "total_tokens": total_tokens},
        ), on_event)

        # Pi: follow-up queue — drain after agent would otherwise stop
        drained_follow_up = _drain_follow_up()

        # Also drain external follow-up store
        if session_id:
            try:
                from server.routes.agent import get_follow_up_messages
                external_follow_ups = get_follow_up_messages(session_id)
                for ef in external_follow_ups:
                    drained_follow_up.append(AgentMessage(
                        role="user",
                        content=str(ef.get("content", "")),
                    ))
            except Exception:
                pass

        if drained_follow_up:
            for fm in drained_follow_up:
                agent_messages.append(fm)
            continue  # keep looping with follow-up messages

        # Narrate-and-stop guard: qwen3.5 (a reasoning model) sometimes streams its
        # *plan* as content and stops without emitting the tool_call — the task is
        # left incomplete. If the assistant's text names a registered tool we have
        # not actually executed, nudge it to call it instead of silently ending.
        # Bounded by max_turns and a per-run nudge cap so a stubborn model cannot
        # loop forever. (A pure-Q&A turn rarely names tools, so this stays quiet
        # there; a narration of past tool calls names only already-executed tools.)
        mentioned_unexecuted = [
            td.name for td in registry.get_enabled()
            if td.name not in _executed_tool_names and td.name in clean_content
        ]
        if mentioned_unexecuted:
            if _nudges < _MAX_NUDGES:
                _nudges += 1
                nudge = AgentMessage(
                    role="user",
                    content=(
                        "[CONTINUE] You described calling tool(s) "
                        f"{', '.join(mentioned_unexecuted)} but did not actually "
                        "invoke them. Call them now to complete the task — do not "
                        "just describe the call. If the task is genuinely finished, "
                        "give the final summary."
                    ),
                )
                agent_messages.append(nudge)
                continue

            # Nudges exhausted but the model still narrates tool calls without
            # executing them — the task will end incomplete. Escalate to a
            # stronger model (Pi-inspired resilience: swap the stalling "thinker"
            # for a capable "doer") with the full context so it can finish the
            # job. Bounded to one escalation per run.
            if cfg.model_fallback and not _model_escalated:
                _model_escalated = True
                old_model = cfg.model
                cfg.model = cfg.model_fallback.pop(0)
                yield await _emit(AgentEvent(
                    type=AgentEventType.MODEL_SWITCH,
                    message={"from": old_model, "to": cfg.model},
                ), on_event)
                agent_messages.append(AgentMessage(
                    role="user",
                    content=(
                        f"[MODEL SWITCH] Your predecessor model {old_model} described "
                        f"calling tool(s) {', '.join(mentioned_unexecuted)} but never "
                        f"actually invoked them. You are now {cfg.model} with the same "
                        "tools and the full conversation context. Complete the user's "
                        "original task now — call the tools, do not just describe them."
                    ),
                ))
                continue

        # No-tool task-completion nudge: the run is about to end "completed", but if
        # the user asked for a *concrete task* and we never executed a single tool
        # (and the model named no tool either — the named-tool guard above stays
        # quiet on a vague ramble), the task likely ended incomplete. Give the model
        # one explicit chance to finish it by calling a tool, then end regardless.
        # Bounded to one per run; pure Q&A rarely contains task markers, so it stays
        # quiet there (a genuine "how many menus?" question still gets its chance).
        if (
            not _task_nudged
            and not _executed_tool_names
            and _is_task_request(_last_user_text(agent_messages))
        ):
            _task_nudged = True
            nudge = AgentMessage(
                role="user",
                content=(
                    "[TASK] You were asked to complete a concrete task, but this run "
                    "has not invoked any tool yet. If the task requires data access "
                    "or a write, call the appropriate tool now to actually do it — do "
                    "not end with a description alone. If no tool is genuinely needed, "
                    "state that clearly and finish."
                ),
            )
            agent_messages.append(nudge)
            continue

        break

    # ── Agent end ──────────────────────────────────────────────────────
    yield await _emit(AgentEvent(
        type=AgentEventType.AGENT_END,
        stop_reason="completed",
        usage={"total_tokens": total_tokens, "turns": turn_index},
        messages=[{"role": m.role, "content": m.content} for m in agent_messages],
    ), on_event)
    yield {"done": True}


async def _stream_llm_response(
    messages: List[AgentMessage],
    config: AgentConfig,
    registry: ToolRegistry,
    abort: asyncio.Event,
    images: Optional[List[bytes]] = None,
) -> AsyncIterator[Dict[str, Any]]:
    """Stream an LLM response via Ollama, yielding deltas and tool calls."""
    from services.ai.model_runtime import OllamaRuntime
    from domain.ai.tools import ToolCall

    tool_defs = registry.get_function_definitions()
    tool_prompt = _build_tool_system_prompt(tool_defs)

    full_system = config.system_prompt
    if tool_prompt:
        full_system = f"{full_system}\n\n{tool_prompt}"

    ollama_messages: List[Dict[str, Any]] = []
    for m in messages:
        if m.role == "system":
            ollama_messages.append({"role": "system", "content": m.content})
        elif m.role == "user":
            ollama_messages.append({"role": "user", "content": m.content})
        elif m.role == "assistant":
            ollama_messages.append({"role": "assistant", "content": m.content})
        elif m.role == "tool_result":
            label = f"[Tool result: {m.name}]\n{m.content}"
            ollama_messages.append({"role": "user", "content": label})

    if full_system:
        ollama_messages.insert(0, {"role": "system", "content": full_system})

    runtime = OllamaRuntime()
    max_attempts = max(1, config.llm_max_retries + 1)

    # Pi: retry transient LLM failures (connection reset, model still loading into
    # VRAM, 5xx) with exponential backoff instead of killing the whole agent run.
    # We only retry when nothing has been streamed yet this attempt — retrying
    # after content was already yielded would duplicate text the user has seen.
    attempt = 0
    while True:
        attempt += 1
        yielded_content = False
        restart = False
        try:
            async for chunk in runtime.stream_chat(
                messages=ollama_messages,
                model=config.model,
                images=images,
                tools=tool_defs or None,
            ):
                if abort.is_set():
                    return
                if isinstance(chunk, dict):
                    if "error" in chunk:
                        # A tool-call XML parse error means the model emitted a
                        # malformed tool frame. Retrying with the same `tools` def
                        # is futile — the same broken frame tends to reappear. Drop
                        # `tools` for the retry so the model answers in plain text;
                        # the agent loop's _parse_tool_calls_from_text fallback then
                        # extracts any <tool_call> XML from the text stream.
                        is_tool_xml_err = "XML syntax error" in chunk["error"]
                        # XML errors retry even after content was streamed: the frame
                        # is malformed and the generation is dead regardless — the
                        # model often streams its *plan* before botching the frame
                        # (reasoning models), so `not yielded_content` alone would
                        # leave the run stranded at `stop=error`. Non-XML errors still
                        # only retry before content, to avoid duplicating user-visible text.
                        if attempt < max_attempts and (not yielded_content or is_tool_xml_err):
                            if is_tool_xml_err:
                                logger.warning(
                                    f"Agent tool-call XML parse error (attempt {attempt}/"
                                    f"{max_attempts}), retrying WITHOUT tools: {chunk['error']}"
                                )
                                tool_defs = None
                            else:
                                logger.warning(
                                    f"Agent LLM call failed (attempt {attempt}/{max_attempts}), "
                                    f"retrying: {chunk['error']}"
                                )
                            restart = True
                            break
                        yield {"error": chunk["error"]}
                        return
                    # Pi: failToolCallsFromTruncatedMessage — the final Ollama chunk carries
                    # done_reason; "length" means the output token limit was hit, so any
                    # tool calls yielded so far may have truncated arguments.
                    if chunk.get("done_reason"):
                        yield {"done_reason": chunk["done_reason"]}
                        return
                    # Native tool call from Ollama — convert SDK objects to app ToolCall
                    # (Pi: structured tool calling preferred over XML text parsing).
                    if chunk.get("tool_calls"):
                        raw_calls = chunk["tool_calls"]
                        converted: List[ToolCall] = []
                        for i, raw in enumerate(raw_calls):
                            fn = raw.function if hasattr(raw, "function") else (raw.get("function") if isinstance(raw, dict) else None)
                            if fn is None:
                                continue
                            name = fn.name if hasattr(fn, "name") else fn.get("name", "")
                            args = fn.arguments if hasattr(fn, "arguments") else fn.get("arguments", {})
                            converted.append(ToolCall(
                                id=f"tool_{i}", name=name, arguments=dict(args or {}),
                            ))
                        if converted:
                            yield {"tool_calls": converted}
                        continue
                    data = chunk.get("data", {})
                    delta = data.get("message", "") if isinstance(data, dict) else str(data)
                    if delta:
                        yielded_content = True
                        yield {"delta": str(delta)}
        except Exception as e:
            if attempt < max_attempts and not yielded_content:
                logger.warning(
                    f"Agent LLM call raised (attempt {attempt}/{max_attempts}), retrying: {e}"
                )
                await asyncio.sleep(min(config.llm_retry_backoff_base * (2 ** (attempt - 1)), 8.0))
                continue
            yield {"error": f"LLM call failed: {e}"}
            return

        if restart:
            await asyncio.sleep(min(config.llm_retry_backoff_base * (2 ** (attempt - 1)), 8.0))
            continue
        return


def _build_tool_system_prompt(tool_defs: List[Dict[str, Any]]) -> str:
    if not tool_defs:
        return ""

    lines = [
        "You are an agent that completes tasks by calling tools. Call tools directly —",
        "do NOT describe an action and stop: narrating what you would do does not",
        "complete the task. Each tool you invoke runs, and its result is delivered in",
        "the next message; keep calling tools until the user's task is fully done,",
        "then write a short final summary.",
        "",
        "You may call multiple tools in sequence, one step at a time. If a step failed",
        "or returned an unexpected result, adapt and retry rather than giving up.",
        "",
        "Available tools:",
    ]

    for td in tool_defs:
        func = td.get("function", {})
        name = func.get("name", "unknown")
        desc = func.get("description", "")
        params = func.get("parameters", {})
        required = params.get("required", [])
        props = params.get("properties", {})

        lines.append(f"\n- **{name}**: {desc}")
        if props:
            lines.append("  Parameters:")
            for pname, pinfo in props.items():
                req = " (required)" if pname in required else ""
                pdesc = pinfo.get("description", "")
                lines.append(f"    - {pname}{req}: {pdesc}")

    return "\n".join(lines)


async def _emit(
    event: AgentEvent,
    on_event: Optional[Callable[[AgentEvent], Awaitable[None]]],
) -> AgentEvent:
    """Call the on_event hook (if any) and return the event for yielding."""
    if on_event:
        try:
            await on_event(event)
        except Exception:
            pass
    return event


# ── Convenience: agent chat that streams SSE events ────────────────────────


async def agent_chat_stream(
    messages: List[Dict[str, Any]],
    model: str = "qwen3.5",
    system_prompt: str = "",
    max_turns: int = 10,
    signal: Optional[asyncio.Event] = None,
    images: Optional[List[str]] = None,
    session_id: str = "",
    model_rotation: Optional[List[str]] = None,
    model_fallback: Optional[List[str]] = None,
) -> AsyncIterator[Dict[str, Any] | AgentEvent]:
    """High-level entry point: stream agent chat with tool calling.

    Yields SSE-ready dicts that include both content deltas and agent
    observability events. The frontend can distinguish them by checking
    for ``type`` (agent event) vs ``data.message`` (content delta) vs
    ``done`` (stream end).

    model_rotation: optional list of model names to rotate between turns.
    When provided, prepare_next_turn switches to the next model in the list
    after each turn, enabling "think model" → "tool model" → "think model" cycles.

    model_fallback: optional ordered list of model names to escalate to when the
    active model stalls on a tool-calling task — it narrates a tool call without
    executing it and resists the nudge guard. The next model in the list takes
    over mid-run with the full conversation context (see the narrate-and-stop
    escalation in the loop). Defaults to the server's `agent_model_fallback`.
    """
    if model_fallback is None:
        try:
            from shared.config import settings
            model_fallback = list(settings.agent_model_fallback or [])
        except Exception:
            model_fallback = []
    config = AgentConfig(
        model=model,
        system_prompt=system_prompt or "You are a helpful AI assistant with access to tools. Use tools when they would help answer the user's question more accurately.",
        max_turns=max_turns,
        stream=True,
        auto_compact=True,
        compaction_keep_last=4,
        model_fallback=model_fallback or [],
    )

    # Pi: prepareNextTurn — model rotation between turns
    if model_rotation and len(model_rotation) > 1:
        _rotation_idx = 0

        async def _rotate_model(_ctx: PrepareNextTurnContext) -> Optional[AgentLoopTurnUpdate]:
            nonlocal _rotation_idx
            _rotation_idx = (_rotation_idx + 1) % len(model_rotation)
            next_model = model_rotation[_rotation_idx]
            logger.info(f"Agent model rotation: turn → {next_model}")
            return AgentLoopTurnUpdate(model=next_model)

        config.prepare_next_turn = _rotate_model

    # Decode base64 data URLs to bytes for the model runtime
    image_bytes: Optional[List[bytes]] = None
    if images:
        import base64
        import re
        image_bytes = []
        for img in images:
            # Strip data:image/...;base64, prefix
            payload = re.sub(r"^data:image/\w+;base64,", "", img)
            try:
                image_bytes.append(base64.b64decode(payload))
            except Exception:
                pass

    async for frame in run_agent_loop(
        messages=messages, config=config, signal=signal, images=image_bytes, session_id=session_id
    ):
        yield frame