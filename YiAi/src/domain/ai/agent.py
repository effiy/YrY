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
import re
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
from domain.ai.todo_tool import (
    format_session_todos,
    get_session_todos,
    set_current_session_id,
)

logger = logging.getLogger(__name__)

# ── Constants ──────────────────────────────────────────────────────────────

_CHARS_PER_TOKEN = 4
_COMPACTION_THRESHOLD = 0.8  # 80% of context window
_DEFAULT_CONTEXT_WINDOW = 8192
# Bound for a single tool result rendered into the LLM context. A db_list can
# return up to 1000 documents (~75K tokens), which blows past the context window
# (Ollama num_ctx 16384) and degrades task completion: compaction only fires
# AFTER the turn and summarizes away the exact data the model needs. Keep the
# full content in persistence/UI, but feed the model a bounded head+tail plus an
# explicit note telling it how to re-query the omitted items.
_DEFAULT_MAX_TOOL_RESULT_CHARS = 6000
_CONFIRMATION_TIMEOUT_S = 120  # how long the loop waits for a user approve/reject
_CONFIRMATION_POLL_S = 1.5  # poll interval for the user's decision
_ASK_TIMEOUT_S = 120  # how long the loop waits for a user answer to ask_user
_ASK_POLL_S = 0.5  # poll interval for the user's answer

# Substrings that mark a user message as a *write task* (mutate data) rather than
# pure Q&A or a read-only query. Used by the task-completion nudge below: a run that
# ends with no mutating tool executed on a write request is likely incomplete, even
# when the model never *named* the write tool (so the named-tool guard stays quiet).
# Read verbs (列出/查询/统计/list/query/count) are deliberately excluded — a read-only
# query is "done" once answered, and nudging it would be noise.
_WRITE_MARKERS_ZH = (
    "创建", "新增", "添加", "插入", "删除", "移除", "更新", "修改", "改名为", "重命名",
    "改名", "导出", "生成", "保存", "写入", "清理", "禁用", "启用", "移动", "复制", "补充",
)
_WRITE_MARKERS_EN = (
    "create", "add", "insert", "delete", "remove", "update", "rename",
    "export", "generate", "save", "write", "clean", "disable", "enable", "move", "copy",
)

# Negation tokens: when a write marker is *preceded* (within a short window) by one
# of these, it is not a write intent — a read-only query that says "只读，不要创建/
# 更新/删除任何菜单" must not read as a write task. Compound tokens only (a bare "别"
# appears inside unrelated words like "特别"), and the EN tokens need a trailing
# space/boundary so "note"/"notebook"/"cannot" edge cases behave sanely.
_NEGATION_TOKENS_ZH = ("不要", "禁止", "勿", "不能", "不得", "不可", "请勿", "切勿", "不需要", "不该")
_NEGATION_TOKENS_EN = ("do not", "don't", "never", "no ", "not ")
_NEGATION_MAX_DISTANCE = 40  # max chars to scan back (a clause rarely exceeds this)

# Clause boundaries: when a negation token and a verb are separated by one of these,
# they belong to different clauses and the token does not negate the verb. The fixed
# pre-window approach failed on "不要调用 db_create/db_update/db_delete" — the second
# and third tool names put the negation more than one fixed window away. Scanning back
# to the previous boundary (or 40 chars) makes "不要调用 db_create/db_update/db_delete"
# read as fully negated while "不要创建菜单，但把 X 的标题更新为 Y" keeps 更新 un-negated.
_BOUNDARY_CHARS = "，。！？；：、（）()!?;:.,\n"


def _clause_before(text: str, idx: int) -> str:
    """Text since the previous clause boundary, capped at _NEGATION_MAX_DISTANCE."""
    start = idx
    scanned = 0
    while start > 0 and scanned < _NEGATION_MAX_DISTANCE:
        start -= 1
        scanned += 1
        if text[start] in _BOUNDARY_CHARS:
            start += 1
            break
    return text[start:idx]


def _is_negated(text: str, lowered: str, idx: int) -> bool:
    """Is a marker occurrence at ``idx`` negated by a token in the preceding clause?"""
    zh = _clause_before(text, idx)
    en = _clause_before(lowered, idx)
    return any(t in zh for t in _NEGATION_TOKENS_ZH) or any(
        t in en for t in _NEGATION_TOKENS_EN
    )


def _write_marker_count(text: str) -> int:
    """Count *distinct* non-negated write markers in a user message.

    Used both by :func:`_is_write_request` (any marker ⇒ write task) and by the
    completeness checkpoint (≥2 markers ⇒ plausibly a multi-step task whose trailing
    steps a model might drop). Overlapping markers ("改名为" ⊃ "改名") are deduped so
    one rename intent counts once, and negated occurrences ("不要删除") are skipped.
    """
    if not text:
        return 0
    lowered = text.lower()
    found = set()
    covered: List[tuple] = []  # (start, end) of already-counted non-negated occurrences
    all_markers = sorted(
        [(m, "zh") for m in _WRITE_MARKERS_ZH] + [(m, "en") for m in _WRITE_MARKERS_EN],
        key=lambda t: len(t[0]),
        reverse=True,
    )
    for m, lang in all_markers:
        hay = text if lang == "zh" else lowered
        idx = 0
        while True:
            i = hay.find(m, idx)
            if i < 0:
                break
            start, end = i, i + len(m)
            if any(cs <= start < ce or cs < end <= ce for cs, ce in covered):
                idx = i + 1
                continue  # already counted as part of a longer overlapping marker
            if _is_negated(text, lowered, i):
                idx = i + len(m)
                continue
            found.add(m)
            covered.append((start, end))
            idx = i + len(m)
    return len(found)


def _is_write_request(text: str) -> bool:
    """Heuristic: does this user message ask for a write/mutation on data?

    Looks for write-verb substrings (zh + en) on the lowercased text, skipping
    negated occurrences ("不要创建") so read-only queries that *mention* write verbs
    to forbid them are not mistaken for write tasks. Pure Q&A ("what is X") and
    read-only queries ("how many menus") rarely contain a non-negated marker, so the
    nudge stays quiet there while catching "create a menu", "delete the row",
    "rename menu X".
    """
    return _write_marker_count(text) > 0


def _last_user_text(messages: List["AgentMessage"]) -> str:
    """Return the content of the most recent *user-authored* message, or empty.

    Skips the loop's injected `[CONTINUE]` / `[MODEL SWITCH]` / `[TASK]` messages
    (role="user", content starts with `[`): those are system nudges whose wording
    must not be mistaken for the user's real request (e.g. a nudge has no write
    verb, so the task-completion nudge would fail to fire on a recon-then-stop).
    """
    for m in reversed(messages):
        if m.role == "user" and not (m.content or "").lstrip().startswith("["):
            return m.content or ""
    return ""


def _is_continuation(text: str) -> bool:
    """True when the message is a bare "continue" directive, not a new task.

    Used to keep the end-of-loop completion checks alive across a resume: after
    max_turns the user replies 继续, so the last user message is no longer a
    write request — but the ORIGINAL task still is, and it must still be checked.
    """
    t = (text or "").strip().lower()
    if not t:
        return False
    return (
        t in ("继续", "继续完成", "继续吧", "continue", "go on", "keep going", "接着来", "接着")
        or t.startswith("继续")
        or t.startswith("接着")
        or t.startswith("continue")
    )


_MISSION_PREFIX = "[TASK] The user's concrete task"

# ── Session history persistence (Pi: persistent loop) ───────────────────────
# The frontend resends history text-only on each /agent/chat, so a "继续"
# resume after max_turns loses the faithful tool trajectory and the model can
# redo completed writes (observed: a resumed run re-created a menu db_create
# had already made). Persist each run's full agent_messages — including
# tool_result messages (rendered to the model as "[Tool result: <name>] …") —
# per session, and let a resume call restore them and append only the user's
# continuation. MongoDB-backed (survives restart) with an in-memory read cache;
# `tool_call_id` is preserved so restored tool_results keep their tool name.
_session_history: Dict[str, List[Dict[str, Any]]] = {}
_session_history_ts: Dict[str, float] = {}
_SESSION_HISTORY_TTL = 3600.0  # seconds


async def save_session_history(session_id: str, messages: List["AgentMessage"]) -> None:
    """Persist a finished run's trajectory for later resume (no-op without session_id)."""
    if not session_id:
        return
    payload = [
        {"role": m.role, "content": m.content, "name": m.name, "tool_call_id": m.tool_call_id}
        for m in messages
    ]
    _session_history[session_id] = payload
    _session_history_ts[session_id] = time.time()
    try:
        from data.agent_sessions import save_agent_session
        await save_agent_session(session_id, payload)
    except Exception as e:  # MongoDB unavailable → degrade to in-memory only
        logger.warning(f"Agent session {session_id!r} persist to MongoDB failed: {e}")


async def load_session_history(session_id: str) -> Optional[List[Dict[str, Any]]]:
    """Return the persisted trajectory if present and not expired, else None.

    Read-through cache: a same-process hit returns the in-memory copy; on a miss
    (e.g. after a restart) the MongoDB document is consulted. Expired trajectories
    (older than _SESSION_HISTORY_TTL) are ignored either way.
    """
    if not session_id:
        return None
    ts = _session_history_ts.get(session_id)
    if ts is not None and time.time() - ts <= _SESSION_HISTORY_TTL:
        return _session_history.get(session_id)
    if ts is not None:
        _session_history.pop(session_id, None)
        _session_history_ts.pop(session_id, None)
    try:
        from data.agent_sessions import load_agent_session
        stored = await load_agent_session(session_id)
    except Exception as e:
        logger.warning(f"Agent session {session_id!r} load from MongoDB failed: {e}")
        return None
    if stored:
        _session_history[session_id] = stored
        _session_history_ts[session_id] = time.time()
    return stored


def _inject_mission_if_needed(
    msgs: List["AgentMessage"],
    mission: str,
    mission_note: str,
) -> List["AgentMessage"]:
    """Re-inject the user's task verbatim when compaction pruned it from context.

    Compaction folds old messages into a summary and keeps only the last K
    verbatim, so a long multi-step task can lose its exact requirements (menu
    names, paths, item counts) mid-run. This restores the task before an LLM
    call, but only when it is no longer in context — a no-op while the mission
    was already injected, or while the task is still verbatim among the user
    messages (short runs that never compact). Safe fallback: return ``msgs``.
    """
    for m in msgs:
        if m.role == "system" and m.content.startswith(_MISSION_PREFIX):
            return msgs
    if any(m.role == "user" and m.content == mission for m in msgs):
        return msgs
    return [AgentMessage(role="system", content=mission_note)] + list(msgs)


# ── Count-aware partial-completion detection ─────────────────────────────


# Write verb → the confirmation-gated tool it maps to, longest-first so 改名为
# wins over 改名 and 新增/添加 are not swallowed by 新.
_WRITE_VERB_TOOL = (
    ("创建", "db_create"), ("新增", "db_create"), ("添加", "db_create"), ("插入", "db_create"),
    ("生成", "db_create"), ("写入", "db_create"), ("保存", "db_create"), ("导出", "db_create"),
    ("复制", "db_create"),
    ("删除", "db_delete"), ("移除", "db_delete"), ("清理", "db_delete"),
    ("更新", "db_update"), ("修改", "db_update"), ("重命名", "db_update"),
    ("改名为", "db_update"), ("改名", "db_update"),
    ("create", "db_create"), ("add", "db_create"), ("insert", "db_create"),
    ("delete", "db_delete"), ("remove", "db_delete"),
    ("update", "db_update"), ("rename", "db_update"),
)
# Item nouns that make a number read as an item count ("2 个菜单" / "create 2
# menus"). The generic measure words (个/项/条) are allowed BEFORE the noun but
# are NOT themselves item nouns — "2 个字段" / "2 小时后" must not count.
_COUNT_NOUN = r"(?:菜单项|菜单|记录|数据|menus|menu|items|item|entries|entry)"
_CHINESE_NUMERALS = {"一": 1, "二": 2, "两": 2, "三": 3, "四": 4,
                     "五": 5, "六": 6, "七": 7, "八": 8, "九": 9}
# A measure word (个/项/条) counts as an item count only when followed by an
# item noun OR a clause boundary — "2 个菜单" ✓, "更新 3 个" ✓, but "2 个字段" ✗.
_COUNT_RE = re.compile(
    r"(\d{1,3}|[一二两三四五六七八九])\s*(?:"
    r"(?:个|项|条)\s*(?:" + _COUNT_NOUN + r"|(?=$|[，。；！？、\s]))"
    r"|" + _COUNT_NOUN +
    r")"
)


def _clause_after(text: str, idx: int) -> str:
    """Return the slice from idx (inclusive) up to the next clause boundary."""
    end = len(text)
    for i in range(idx, len(text)):
        if text[i] in _BOUNDARY_CHARS:
            end = i
            break
    return text[idx:end]


def _parse_task_item_counts(text: str) -> list:
    """Return ``[(tool_name, count)]`` for explicit item counts in task text.

    Associates each count with the nearest preceding write verb in the same
    clause, skipping negated verbs (不要创建 2 个 → ignored). Only counts ≥ 2
    are reported. Example: "创建 2 个菜单，删除 1 个" → [(db_create, 2)].
    """
    lowered = text.lower()
    out: list = []
    seen: set = set()
    for verb, tool in _WRITE_VERB_TOOL:
        start = 0
        while True:
            idx = text.find(verb, start)
            if idx < 0:
                break
            start = idx + len(verb)
            if _is_negated(text, lowered, idx):
                continue
            m = _COUNT_RE.search(_clause_after(text, idx))
            if m:
                raw = m.group(1)
                count = _CHINESE_NUMERALS.get(raw, 0) if not raw.isdigit() else int(raw)
                if count >= 2 and (tool, count) not in seen:
                    seen.add((tool, count))
                    out.append((tool, count))
    return out


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
    TODO_UPDATE = "todo_update"
    ASK_USER = "ask_user"
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
    # ask_user event (Pi/dsh: interaction/ask-user)
    question_id: Optional[str] = None  # id the user answers via /agent/answer
    question: Optional[str] = None
    options: Optional[List[str]] = None
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
        if self.question_id is not None:
            payload["question_id"] = self.question_id
        if self.question is not None:
            payload["question"] = self.question
        if self.options is not None:
            payload["options"] = self.options
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

    model: str = "qwen3.5:4b"
    system_prompt: str = "You are a helpful AI assistant with access to tools."
    max_turns: int = 10
    tool_execution: str = "parallel"  # "sequential" | "parallel" (Pi default: parallel)
    stream: bool = True
    temperature: float = 0.7
    top_p: float = 0.9
    context_window: int = _DEFAULT_CONTEXT_WINDOW
    auto_compact: bool = True
    compaction_keep_last: int = 4
    max_tool_result_chars: int = _DEFAULT_MAX_TOOL_RESULT_CHARS  # bound per tool result in LLM context
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


# Rejection memory: session → list of canonical signatures (tool name + args
# JSON with keys sorted) the user explicitly rejected. A model can re-attempt a
# just-rejected write with identical args, popping a *new* confirmation each
# time (previously an accepted edge). Remembering the rejection lets the gate
# auto-block the identical re-issue instead of re-prompting — data stays
# user-gated, but the user isn't asked the same question twice in one session.
_session_rejections: Dict[str, List[str]] = {}
_MAX_SESSION_REJECTIONS = 20  # bound per session; drop oldest


def _call_signature(call: ToolCall) -> str:
    """Canonical identity of a call: tool name + args (keys sorted, stable JSON).

    Two calls are "the same" iff they target the same tool with the same args,
    regardless of the provider's (often reused) call id.
    """
    try:
        args_json = json.dumps(call.arguments, sort_keys=True, ensure_ascii=False)
    except Exception:
        args_json = str(call.arguments)
    return f"{call.name}|{args_json}"


def _remember_rejection(session_id: str, call: ToolCall) -> None:
    """Record an explicit user rejection for this session (bounded per-session list)."""
    if not session_id:
        return
    sig = _call_signature(call)
    lst = _session_rejections.setdefault(session_id, [])
    if sig in lst:
        return
    lst.append(sig)
    if len(lst) > _MAX_SESSION_REJECTIONS:
        del lst[: len(lst) - _MAX_SESSION_REJECTIONS]


def _is_rejected_call(session_id: str, call: ToolCall) -> bool:
    """True if an identical call was explicitly rejected earlier in this session."""
    if not session_id:
        return False
    return _call_signature(call) in _session_rejections.get(session_id, ())


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


async def _wait_for_answer(question_id: str, abort: asyncio.Event) -> Optional[str]:
    """Wait for the user's answer to an ``ask_user`` question.

    The answer is recorded via ``POST /agent/answer`` and read from an
    in-memory store in ``server/routes/agent.py`` (same pattern as confirmation).
    Returns the answer string, or ``None`` on timeout/disconnect (the loop then
    feeds the model a ``[USER DID NOT ANSWER]`` note).
    """
    if not question_id:
        return None
    try:
        from server.routes.agent import get_answer, mark_answer_seen
    except Exception:
        return None
    deadline = time.monotonic() + _ASK_TIMEOUT_S
    while time.monotonic() < deadline:
        if abort.is_set():
            return None
        answer = get_answer(question_id)
        if answer is not None:
            mark_answer_seen(question_id)
            return answer
        await asyncio.sleep(_ASK_POLL_S)
    return None


def _budget_warning(
    turn_index: int,
    max_turns: int,
    warn_leftover: int = 3,
) -> Optional[str]:
    """One-shot budget note injected near the turn limit.

    The model never sees ``max_turns`` (it only appears in SSE events), so it
    over-plans and gets cut off mid-task. Fires once when at most
    ``warn_leftover`` turns remain after the current one, telling the model the
    exact budget so it compresses the plan or surfaces what's left for a
    「继续」 resume. The ``[BUDGET]`` prefix keeps it out of ``_last_user_text``
    (the ``[``-skip convention), so it can never shadow the user's real task for
    the completion checkpoints. Returns None until near the limit.
    """
    remaining = max_turns - turn_index
    if remaining < 0 or remaining > warn_leftover:
        return None
    return (
        f"[BUDGET] 本次运行最多 {max_turns} 轮，当前是第 {turn_index} 轮，"
        f"还剩 {remaining} 轮。请据此调整计划：优先完成必要步骤，压缩或省略"
        f"非必要步骤。若剩余轮数不足以完成全部任务，请明确指出还差哪些工作，"
        f"方便用户回复「继续」接着完成。"
    )


def _turn_observation_signature(tool_results: List[ToolResult]) -> str:
    """Signature of a turn's executed tool observations (name + effective result).

    Two turns count as "the same observation" iff this signature is identical —
    the model called the same tool(s) and got the same data back, i.e. no
    progress. A narration-only turn has no results → ``""``.
    """
    if not tool_results:
        return ""
    parts = []
    for r in tool_results:
        content = r.content if not r.error else f"Error: {r.error}"
        parts.append(f"{r.name}|{content}")
    return "||".join(parts)


def _advance_spin_state(
    prev_obs: Optional[str],
    run: int,
    obs: str,
    threshold: int = 3,
) -> tuple[Optional[str], int, bool]:
    """Pure spin-detector state transition. Returns (new_prev_obs, new_run, fired).

    A narration turn (``obs == ""``) resets the chain — the model tried something
    different (even just re-planning), so it is never counted as a spin. Two
    consecutive turns with the same non-empty observation increment the run; a
    different observation restarts it. Reaching ``threshold`` fires once and
    resets the run so the same spin doesn't re-fire every turn.
    """
    if not obs:
        return None, 0, False
    if obs == prev_obs:
        run += 1
    else:
        prev_obs = obs
        run = 1
    if run >= threshold:
        return prev_obs, 0, True
    return prev_obs, run, False


def _bound_tool_result(
    name: str,
    content: str,
    max_chars: int = _DEFAULT_MAX_TOOL_RESULT_CHARS,
) -> str:
    """Bound a large tool result for the LLM context while preserving recoverability.

    db_list can return up to 1000 docs (~75K tokens) — far past the context
    window. Rather than letting it overflow (Ollama mid-truncates, losing data),
    keep a bounded head + tail and append an explicit note stating how much was
    omitted and how to re-query for it (filter/fields/key). The model keeps the
    most relevant recent items and knows the rest exists.

    The full content is left untouched in persistence and the UI — this only
    bounds the text that is rendered into the model's context.
    """
    if not content or len(content) <= max_chars:
        return content

    total = len(content)
    head_end = int(max_chars * 0.70)
    tail_start = max(head_end, total - int(max_chars * 0.22))
    head = content[:head_end]
    tail = content[tail_start:]
    omitted_chars = total - len(head) - len(tail)
    omitted_lines = content.count("\n", head_end, tail_start)
    note = (
        f"\n... [result truncated for context: {total:,} chars, "
        f"~{omitted_lines:,} lines omitted in the middle. "
        f"Re-query with filter/fields/key to fetch the specific items you need.]"
    )
    return f"{head}{note}{tail}"


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
    model: str = "qwen3.5:4b",
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
    task_text: str = "",
) -> AsyncIterator[Dict[str, Any] | AgentEvent]:
    """Run the agent loop and yield SSE-ready dicts and AgentEvents.

    task_text: the concrete task under execution (the run's mission). Used by
    the end-of-loop completion checks. On a resume it is the ORIGINAL task
    (restored from the persisted trajectory) so "继续" runs still verify the
    real task's write steps instead of skipping them because the last user
    message is just a continuation directive.
    """
    cfg = config or AgentConfig()
    registry = tool_registry or get_tool_registry()
    abort = signal or asyncio.Event()

    turn_index = 0
    total_tokens = 0
    agent_messages: List[AgentMessage] = [
        AgentMessage(
            role=m.get("role", "user"),
            content=str(m.get("content", "")),
            # Preserve name so a restored tool_result still renders
            # "[Tool result: <name>]" on resume (the tool trajectory is the
            # faithful state that stops the model redoing completed writes).
            name=m.get("name"),
            tool_call_id=m.get("tool_call_id"),
        )
        for m in messages
    ]

    # Tool names already completed by a prior run (from the restored trajectory's
    # tool_result messages). Seeded into the per-run tracking below so the
    # completion checkpoints compare against the full task without demanding
    # re-runs of writes the previous run already finished.
    _resume_names: set[str] = {
        _m.get("name")
        for _m in messages
        if _m.get("role") == "tool_result" and _m.get("name")
    }

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
    _task_nudged = False  # one no-write task-completion nudge per run
    _write_executed: set[str] = set()  # mutating tools (requires_confirmation) that SUCCEEDED
    _write_counts: dict = {}  # per-tool count of successful confirmed writes (count-aware checkpoint)
    _write_rejected = False  # the user rejected (or timed out) a write confirmation this run
    _natural_stop = False  # the loop ended with a natural completion (break), not max_turns exhaustion
    # Repeated-observation spin guard: track consecutive turns whose tool
    # observations (name + result) are identical, so a model stuck re-issuing the
    # same call (unchanged read query; re-attempting a just-rejected write) is
    # nudged out instead of burning max_turns on spinning.
    _obs_prev: Optional[str] = None
    _obs_run = 0
    _spin_nudged = False  # one spin nudge per run
    _budget_injected = False  # one turn-budget warning per run (near the limit)
    # Steering consumed this run. Steering (Pi: Agent.steer) changes the task
    # mid-run, so the end-of-loop completion checkpoints — which verify the
    # ORIGINAL task text against executed tools — are invalid: they could re-arm
    # a write the user steered away from ("不要删除 Z" then re-nudge db_delete).
    # A steered run is user-in-the-loop; the human's latest direction wins.
    _steering_consumed = False

    # Carry forward completed writes from the restored trajectory (resume): the
    # run's per-tool tracking starts from what the previous run already did, so
    # the end-of-loop checkpoints see the full task (create+update+delete) while
    # knowing create/update are already done.
    _executed_tool_names |= _resume_names
    for _n in _resume_names:
        _td = registry.get(_n)
        if _td and _td.requires_confirmation:
            _write_executed.add(_n)
            _write_counts[_n] = _write_counts.get(_n, 0) + 1

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
            _steering_consumed = True

        # ── Drain external steering store (Pi: Agent.steer) ────────────
        # Appended DIRECTLY to agent_messages, not via the turn-delayed
        # steering_queue: a steer that lands before this turn's LLM call must be
        # visible immediately (the queue added a one-turn lag, so a mid-run
        # correction like "don't delete Z" reached the model only after it had
        # already acted on the original plan). `[STEERING]` starts with `[` so it
        # stays out of `_last_user_text` (does not shadow the user's task).
        if session_id:
            try:
                from server.routes.agent import get_steering_messages
                external_steers = get_steering_messages(session_id)
                if external_steers:
                    for es in external_steers:
                        agent_messages.append(AgentMessage(
                            role="user",
                            content=str(es.get("content", "")),
                        ))
                    _steering_consumed = True
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

        # Pi: budget awareness — the model never sees max_turns, so it over-plans
        # and gets cut off mid-task. One shot, near the limit: tell it the exact
        # remaining turns so it compresses the plan or surfaces what's left for a
        # 「继续」 resume. The [BUDGET] prefix keeps it out of _last_user_text.
        if not _budget_injected:
            _budget_note = _budget_warning(turn_index, cfg.max_turns)
            if _budget_note:
                _budget_injected = True
                agent_messages.append(AgentMessage(role="user", content=_budget_note))
                logger.info(
                    f"Agent budget warning injected (session={session_id!r}): "
                    f"turn {turn_index}/{cfg.max_turns}, "
                    f"{cfg.max_turns - turn_index} left"
                )

        # ── Todo visibility (Pi/dsh: "model-visible ⟺ logged") ──────────
        # Inject the current session todo list as a [TODOS] system note each turn,
        # replacing any stale note from a prior turn. The list is plan state the
        # model maintains via todo_write; re-injecting it keeps a multi-step task
        # coherent across turns and after compaction. `[TODOS]` is a system
        # message, so it can never shadow the user's task text.
        _todo_note = format_session_todos(session_id) if session_id else None
        _had_todo_note = any(
            m.role == "system" and m.content.startswith("[TODOS]") for m in agent_messages
        )
        if _todo_note or _had_todo_note:
            agent_messages = [
                m for m in agent_messages
                if not (m.role == "system" and m.content.startswith("[TODOS]"))
            ]
            if _todo_note:
                agent_messages.append(AgentMessage(role="system", content=_todo_note))

        # Make the session id visible to tools (todo_write) without threading it
        # through every execute() call. Set before tool execution below.
        set_current_session_id(session_id)

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
                    #
                    # Rejection memory: if the user already rejected this exact
                    # call (same tool + same args) earlier in this session, do
                    # NOT re-prompt — auto-block it so the model cannot nag the
                    # user with the same question repeatedly. The ToolResult
                    # error tells the model to stop retrying and adapt.
                    if _is_rejected_call(session_id, call):
                        _write_rejected = True
                        _preflight.append((call, ToolResult(
                            call_id=call.id, name=call.name, content="",
                            error=(
                                "Blocked: identical call was previously rejected "
                                "by the user in this session. Do NOT retry it — "
                                "change your approach or ask the user how to proceed."
                            ),
                        )))
                        continue
                    confirm_id = f"t{turn_index}:{call.id}"
                    yield await _emit(AgentEvent(
                        type=AgentEventType.CONFIRMATION_REQUIRED,
                        tool_name=call.name,
                        tool_args=call.arguments,
                        confirmation_id=confirm_id,
                        message={"role": "tool", "content": f"Tool '{call.name}' requires user confirmation"},
                    ), on_event)
                    decision = await _wait_for_confirmation(session_id, call, abort, confirm_id)
                    if decision == "rejected":
                        # Only an explicit "rejected" (not a timeout) is
                        # remembered; a timeout is ambiguous and may warrant a
                        # later re-attempt after a resume.
                        _remember_rejection(session_id, call)
                        _write_rejected = True
                        _preflight.append((call, ToolResult(
                            call_id=call.id, name=call.name, content="",
                            error="Rejected by user",
                        )))
                        continue
                    if decision == "timeout":
                        _write_rejected = True
                        _preflight.append((call, ToolResult(
                            call_id=call.id, name=call.name, content="",
                            error="Confirmation timed out — tool skipped",
                        )))
                        continue
                    if decision == "approved":
                        _preflight.append((call, None))  # approved → execute
                        continue
                    # Defensive: an unexpected decision must NEVER execute the
                    # call. Treat it like a rejection (but don't remember it).
                    _write_rejected = True
                    _preflight.append((call, ToolResult(
                        call_id=call.id, name=call.name, content="",
                        error="Confirmation decision invalid — tool skipped",
                    )))
                    continue

                # ── ask_user (Pi/dsh: interaction/ask-user) ─────────────
                # The agent wants to ask the user a question. Emit ASK_USER so the
                # frontend renders the prompt, then block on the /agent/answer store
                # (same poll pattern as confirmation). The answer becomes the tool
                # result content, so the model continues with the user's reply.
                if tool_def and call.name == "ask_user":
                    question = str(call.arguments.get("question", "")).strip()
                    raw_options = call.arguments.get("options") or []
                    options = [str(o) for o in raw_options] if isinstance(raw_options, list) else []
                    if not question:
                        _preflight.append((call, ToolResult(
                            call_id=call.id, name=call.name, content="",
                            error="ask_user requires a non-empty 'question' argument",
                        )))
                        continue
                    qid = f"t{turn_index}:{uuid.uuid4().hex[:8]}"
                    yield await _emit(AgentEvent(
                        type=AgentEventType.ASK_USER,
                        question_id=qid,
                        question=question,
                        options=options,
                        turn_index=turn_index,
                    ), on_event)
                    answer = await _wait_for_answer(qid, abort)
                    if answer is None:
                        _preflight.append((call, ToolResult(
                            call_id=call.id, name=call.name, content="",
                            error="[USER DID NOT ANSWER] — the user did not respond. Proceed with reasonable assumptions, or ask again.",
                        )))
                    else:
                        _preflight.append((call, ToolResult(
                            call_id=call.id, name=call.name, content=answer,
                        )))
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

            # Pi: a blocked call (rejected / timed-out / pre-blocked confirmation)
            # is skipped WITHOUT executing, but the user should still see it in the
            # live tool timeline with the reason — otherwise the write vanishes with
            # no record of why it never ran. Emit start+end with the error, matching
            # the length-stop path which does the same for truncated calls.
            def _blocked_events(call: ToolCall, blocked: ToolResult) -> List[AgentEvent]:
                label = call.name.replace("_", " ").title()
                return [
                    AgentEvent(
                        type=AgentEventType.TOOL_EXECUTION_START,
                        tool={"name": call.name, "label": label},
                    ),
                    AgentEvent(
                        type=AgentEventType.TOOL_EXECUTION_END,
                        tool={"name": call.name, "label": label,
                              "content": blocked.content or "", "error": blocked.error},
                    ),
                ]

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
                        for _be in _blocked_events(call, blocked):
                            yield await _emit(_be, on_event)
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
                        for _be in _blocked_events(call, blocked):
                            yield await _emit(_be, on_event)
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
                _td = registry.get(result.name)
                if _td and _td.requires_confirmation and not result.error:
                    _write_executed.add(result.name)
                    _write_counts[result.name] = _write_counts.get(result.name, 0) + 1
                tr_msg = AgentMessage(
                    role="tool_result",
                    content=result.content if not result.error else f"Error: {result.error}",
                    tool_call_id=result.call_id,
                    name=result.name,
                    metadata={"error": result.error, "duration_ms": result.duration_ms},
                )
                agent_messages.append(tr_msg)

            # ── Todo update event (Pi/dsh: capability event) ────────────
            # When the agent wrote the todo list this turn, surface the new list
            # so the frontend can render it live. The list is also re-injected into
            # context at the next turn start (see above).
            if "todo_write" in _executed_tool_names and session_id:
                yield await _emit(AgentEvent(
                    type=AgentEventType.TODO_UPDATE,
                    message={"todos": get_session_todos(session_id)},
                    turn_index=turn_index,
                ), on_event)

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

            # Pi: repeated-observation spin guard — a model can get stuck re-issuing
            # the same tool call and observing the same result every turn (a read
            # loop on an unchanged query; re-attempting a just-rejected write). Real
            # progress changes the observation: a write alters the data a later read
            # sees, and a different query returns different rows. When the SAME
            # observation repeats 3 turns in a row, inject one nudge to break the
            # loop out instead of wasting turns on spinning.
            _obs_now = _turn_observation_signature(tool_results)
            _obs_prev, _obs_run, _obs_fired = _advance_spin_state(
                _obs_prev, _obs_run, _obs_now, threshold=3
            )
            if _obs_fired and not _spin_nudged:
                _spin_nudged = True
                logger.info(
                    f"Agent spin guard fired (session={session_id!r}): same tool "
                    f"observation repeated 3 turns with no progress"
                )
                agent_messages.append(AgentMessage(
                    role="user",
                    content=(
                        "[TASK] 你连续多轮调用相同的工具并得到完全相同的结果，没有任何进展。"
                        "停止重复这一步。重新阅读用户的任务并执行下一步；如果任务已完成或无法继续，"
                        "直接给出结论。如果某个操作被用户拒绝，不要再次尝试它。"
                    ),
                ))
                continue

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
                takeover = (
                    f"[MODEL SWITCH] Your predecessor model {old_model} described "
                    f"calling tool(s) {', '.join(mentioned_unexecuted)} but never "
                    f"actually invoked them. You are now {cfg.model} with the same "
                    "tools and the full conversation context. Complete the user's "
                    "original task now — call the tools, do not just describe them."
                )
                if _write_rejected:
                    takeover += (
                        " IMPORTANT: a write confirmation was REJECTED by the user "
                        "earlier in this run — do NOT re-attempt that specific write. "
                        "Respect the rejection: if the task is blocked by it, say so "
                        "and ask how to proceed."
                    )
                agent_messages.append(AgentMessage(role="user", content=takeover))
                continue

        # No-write task-completion nudge: the run is about to end "completed", but
        # if the user asked for a *write* on data and we never executed a mutating
        # tool (requires_confirmation), the task likely ended incomplete. This is
        # broader than "no tool at all": a model can do the read-only recon
        # (db_schema, db_list) and then stop without ever writing — observed when a
        # multi-create task ended after recon with db_create never invoked, and the
        # named-tool guard stayed quiet because the model named no tool. Give the
        # model one explicit chance to finish the write, then end regardless.
        # Bounded to one per run; read-only queries ("how many menus") and pure Q&A
        # are excluded by _is_write_request, so they are never nudged. A run where the
        # user *rejected* a write confirmation is also excluded — the nudge must not
        # re-arm a write the user explicitly declined.
        # Effective task for the completion checks below. Normally the last user
        # message; on a resume (user replied 继续 after max_turns) it is the
        # ORIGINAL task restored from the persisted trajectory, so the checks
        # still verify the real write steps instead of skipping them because the
        # last user message is just a continuation directive. A read-only query
        # yields "" (no write task) — never nudged.
        last_user = _last_user_text(agent_messages)
        if _is_write_request(last_user):
            effective_task = last_user
        elif task_text and _is_continuation(last_user) and _is_write_request(task_text):
            effective_task = task_text
        else:
            effective_task = ""
        if (
            not _task_nudged
            and not _steering_consumed  # user steered mid-run: their direction wins
            and not _write_executed
            and not _write_rejected
            and _is_write_request(effective_task)
        ):
            _task_nudged = True
            logger.info(
                f"Agent task-completion nudge fired (session={session_id!r}): "
                "run ended with no mutating tool executed on a write request"
            )
            nudge = AgentMessage(
                role="user",
                content=(
                    "[TASK] You were asked to create/update/delete data, but this run "
                    "never actually invoked the write tool (e.g. db_create/db_update/"
                    "db_delete) — reconnaissance alone does not complete the task. "
                    "Call the appropriate write tool now to finish it. If the write "
                    "genuinely cannot proceed, state why and finish."
                ),
            )
            agent_messages.append(nudge)
            continue

        # Escalate when the no-write nudge was ignored: the run already injected a
        # "[TASK] … never invoked the write tool" reminder, yet this turn STILL
        # ends without a mutating tool (observed with a weak model doing read-only
        # recon — db_schema/db_list — then narrating to completion). A second
        # identical nudge rarely helps; swap to the fallback "doer" model instead
        # (Pi-inspired escalation, mirroring the narrate-and-stop path) so the task
        # can actually complete. Bounded by the same one-per-run `_model_escalated`
        # flag; a rejected write never re-arms; a user steer wins.
        if (
            _task_nudged
            and not _steering_consumed
            and not _write_executed
            and not _write_rejected
            and not _model_escalated
            and cfg.model_fallback
            and _is_write_request(effective_task)
        ):
            _model_escalated = True
            old_model = cfg.model
            cfg.model = cfg.model_fallback.pop(0)
            yield await _emit(AgentEvent(
                type=AgentEventType.MODEL_SWITCH,
                message={"from": old_model, "to": cfg.model},
            ), on_event)
            takeover = (
                f"[MODEL SWITCH] Your predecessor model {old_model} was asked to "
                "create/update/delete data but only performed read-only "
                "reconnaissance (e.g. db_schema/db_list) and never invoked the "
                "write tool, even after a reminder. You are now "
                f"{cfg.model} with the same tools and full conversation context. "
                "Complete the user's data task now — call the write tool "
                "(db_create/db_update/db_delete); do not stop at reads."
            )
            agent_messages.append(AgentMessage(role="user", content=takeover))
            continue

        # Completeness checkpoint: the run *did* execute mutating tool(s) and is
        # about to end, but the task may be only partially done — observed:
        # create+update completed, then the model stopped without the delete step
        # it planned (e2e cycle ~2/5 before the checkpoint). The no-write nudge
        # above cannot fire (_write_executed non-empty) and the narrate-guard cannot
        # either (the model *forgets* the tool rather than narrating it). The
        # strongest verifiable signal: the task text NAMES a write tool (db_create/
        # db_update/db_delete) that was never executed. Tell the model the concrete
        # missing tool instead of asking it to self-assess — a generic "any remaining
        # steps?" is declined when the model confidently believes it is done.
        # Gating on named-but-unexecuted tools also means a fully-complete multi-step
        # run pays no extra turn, and a single-create task (names only db_create,
        # which did run) is never checkpointed. Runs where the user *rejected* a
        # write confirmation are excluded — re-nudging after a rejection would
        # override the user's decision.
        unexecuted_writes = [
            td.name
            for td in registry.get_enabled()
            if td.requires_confirmation
            and td.name in effective_task
            and td.name not in _executed_tool_names
        ]
        if (
            not _task_nudged
            and not _steering_consumed  # user steered mid-run: their direction wins
            and _write_executed
            and not _write_rejected
            and unexecuted_writes
        ):
            _task_nudged = True
            logger.info(
                f"Agent completeness checkpoint fired (session={session_id!r}): "
                f"task named tool(s) {', '.join(unexecuted_writes)} that never executed"
            )
            nudge = AgentMessage(
                role="user",
                content=(
                    "[TASK] You executed write operation(s) for the user's data task, "
                    "but the task explicitly named tool(s) "
                    f"{', '.join(unexecuted_writes)} that were never actually "
                    "invoked. Call the missing tool(s) now to complete every requested "
                    "step. If a step genuinely cannot proceed, state why. Do NOT invent "
                    "new work beyond what the user asked."
                ),
            )
            agent_messages.append(nudge)
            continue

        # Count-aware partial-completion check: the task asked for an explicit
        # number of items (创建 2 个菜单) but fewer successful executions of the
        # mapped tool happened. The named-tool checkpoint above cannot fire (the
        # tool DID run), and the no-write nudge cannot either (_write_executed is
        # non-empty) — yet the task is only half done. Gate on count ≥ 2 and a
        # real gap so a fully-completed multi-item run pays no extra turn.
        count_gaps: list = []
        if not _task_nudged and not _steering_consumed and _write_executed and not _write_rejected:
            for tool_name, need in _parse_task_item_counts(effective_task):
                have = _write_counts.get(tool_name, 0)
                if need >= 2 and have < need:
                    count_gaps.append((tool_name, need, have))
        if count_gaps:
            _task_nudged = True
            gap_desc = ", ".join(
                f"{tn} 需要 {need} 次但只成功执行了 {have} 次" for tn, need, have in count_gaps
            )
            logger.info(
                f"Agent count-aware checkpoint fired (session={session_id!r}): {gap_desc}"
            )
            nudge = AgentMessage(
                role="user",
                content=(
                    "[TASK] The task requested a specific number of items that "
                    f"was not fully completed. Gap: {gap_desc}. Execute the missing "
                    "write(s) now. First verify what already exists (db_list) and "
                    "do NOT create duplicates. If all requested items already "
                    "exist, say so and stop — do NOT invent new work."
                ),
            )
            agent_messages.append(nudge)
            continue

        _natural_stop = True
        break

    # ── Agent end ──────────────────────────────────────────────────────
    # Distinguish a natural completion from exhausting max_turns mid-task:
    # the loop previously reported stop_reason="completed" in both cases, so a
    # run that ran out of turns with steps still pending looked finished to the
    # frontend. The user must know the task may be incomplete so they can reply
    # "继续" and the loop resumes from the accumulated history.
    final_stop_reason = "completed" if _natural_stop else "max_turns_reached"
    if not _natural_stop:
        logger.info(
            f"Agent reached max_turns={cfg.max_turns} without a natural stop "
            f"(session={session_id!r}, {turn_index} turns) — task may be incomplete"
        )
    # Persist the faithful trajectory (incl. tool_result names) so a later
    # "继续" resume in this session restores it instead of a text-only re-send.
    await save_session_history(session_id, agent_messages)
    yield await _emit(AgentEvent(
        type=AgentEventType.AGENT_END,
        stop_reason=final_stop_reason,
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
            bounded = _bound_tool_result(m.name or "", m.content, config.max_tool_result_chars)
            label = f"[Tool result: {m.name}]\n{bounded}"
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
    model: str = "qwen3.5:4b",
    system_prompt: str = "",
    max_turns: int = 10,
    signal: Optional[asyncio.Event] = None,
    images: Optional[List[str]] = None,
    session_id: str = "",
    model_rotation: Optional[List[str]] = None,
    model_fallback: Optional[List[str]] = None,
    resume: bool = False,
) -> AsyncIterator[Dict[str, Any] | AgentEvent]:
    """High-level entry point: stream agent chat with tool calling.

    Yields SSE-ready dicts that include both content deltas and agent
    observability events. The frontend can distinguish them by checking
    for ``type`` (agent event) vs ``data.message`` (content delta) vs
    ``done`` (stream end).

    resume: when True, restore the session's persisted agent trajectory
    (incl. tool_result messages) and append only ``messages`` — the user's
    continuation. The model then sees the real completed tool calls instead
    of a text-only re-send, so it continues rather than redoing work.

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

    # Pi: persistent loop — restore the session's faithful trajectory on a
    # resume (user replied 继续 after max_turns). The stored history already
    # contains the original task + tool_call/tool_result messages, so only the
    # user's continuation message(s) come from this request. If no stored
    # history exists (server restarted / TTL), fall back to the request as-is.
    if resume and session_id:
        stored = await load_session_history(session_id)
        if stored:
            base = list(stored)
            done = sorted({m["name"] for m in stored if m.get("role") == "tool_result" and m.get("name")})
            if done:
                # Explicit handoff so even a weaker model doesn't redo completed
                # writes: the restored [Tool result: …] trajectory is faithfully
                # presented, but a weak model (qwen3.5) can misread it as a new
                # instruction. Name the already-executed tools up front.
                base.append({
                    "role": "system",
                    "content": (
                        "[RESUME] 上一轮任务因达到最大轮次被中断，你现在继续它。"
                        "以下工具调用已在此前成功执行：" + "、".join(done) +
                        "。其中的写操作（db_create/db_update/db_delete）请勿重复执行，"
                        "只继续完成尚未完成的步骤。"
                    ),
                })
            messages = base + list(messages)
            logger.info(
                f"Agent resumed session {session_id!r}: restored "
                f"{len(stored)} history messages + {len(messages) - len(stored)} new"
            )

    # Pi: transformContext — re-inject the user's concrete task after compaction.
    # Compaction folds old messages into a summary and keeps only the last K
    # verbatim, so a long multi-step task can lose its exact requirements (menu
    # names, paths, item counts) mid-run. This hook restores the task verbatim
    # before every LLM call, but only when it is no longer in context — short
    # runs (task still the last user message) are untouched, so there is zero
    # behavior change for tasks that never hit compaction.
    _mission = ""
    for _m in messages:
        if _m.get("role") == "user" and isinstance(_m.get("content"), str) and _m["content"].strip():
            _mission = _m["content"].strip()
            break

    if _mission:
        _mission_note = (
            f"{_MISSION_PREFIX} — it is the goal of this run. "
            "Complete it; do NOT repeat work already shown as done in the history.\n"
            f"{_mission}"
        )

        async def _re_inject_mission(msgs: List[AgentMessage]) -> List[AgentMessage]:
            injected = _inject_mission_if_needed(msgs, _mission, _mission_note)
            if len(injected) > len(msgs):
                logger.info(f"Agent mission re-injected after context loss (session={session_id!r})")
            return injected

        config.transform_context = _re_inject_mission

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
        messages=messages,
        config=config,
        signal=signal,
        images=image_bytes,
        session_id=session_id,
        task_text=_mission,
    ):
        yield frame