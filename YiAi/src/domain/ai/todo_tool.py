"""Todo capability tool — Pi/dsh ``todo/`` parity.

A session-scoped task list the agent maintains via a single ``todo_write``
tool with full-replace semantics (small-model friendly: one call, no per-item
add/update/remove dance). The list is injected back into the model context at
each turn ("model-visible ⟺ logged"), so a multi-step task survives compaction
and turn boundaries. Pure plan state — never gated by the confirmation flow.
"""

from __future__ import annotations

import contextvars
import logging
from typing import Any, Dict, List, Optional

from domain.ai.tools import ToolDefinition

logger = logging.getLogger(__name__)

# Session → ordered todo list. Bounded per-session list; full-replace on write.
_todo_store: Dict[str, List[Dict[str, Any]]] = {}
_MAX_TODOS = 50

# The agent loop sets this contextvar before executing tools so a tool can
# discover its session_id without threading it through every execute() call.
_current_session_id: contextvars.ContextVar[str] = contextvars.ContextVar(
    "yiai_agent_session_id", default=""
)

_STATUS_MARKS = {"pending": " ", "in_progress": "▶", "completed": "✓"}


def set_current_session_id(session_id: str) -> None:
    """Record the active session for the current task (called by the agent loop)."""
    _current_session_id.set(session_id or "")


def get_session_todos(session_id: str) -> List[Dict[str, Any]]:
    """Return the session's todo list (empty if none)."""
    return list(_todo_store.get(session_id, []))


def set_session_todos(session_id: str, todos: List[Dict[str, Any]]) -> None:
    """Replace the session's todo list (bounded)."""
    if not session_id:
        return
    _todo_store[session_id] = todos[:_MAX_TODOS]


def format_session_todos(session_id: str) -> Optional[str]:
    """Render the session's todos as a model-visible ``[TODOS]`` note, or None.

    The ``[TODOS]`` prefix mirrors the ``[BUDGET]``/``[TASK]`` convention so the
    note is a system message (never read as the user's task text).
    """
    todos = get_session_todos(session_id)
    if not todos:
        return None
    lines = ["[TODOS] 当前任务清单（用 todo_write 维护，全量替换）:"]
    for t in todos:
        mark = _STATUS_MARKS.get(t.get("status"), " ")
        lines.append(f"- [{mark}] {t.get('content', '')}")
    return "\n".join(lines)


async def _todo_write(args: Dict[str, Any]) -> Dict[str, Any]:
    raw = args.get("todos")
    if not isinstance(raw, list):
        return {"content": "", "error": "todo_write requires a 'todos' list of {id, content, status}"}

    cleaned: List[Dict[str, Any]] = []
    for i, item in enumerate(raw):
        if not isinstance(item, dict):
            continue
        status = item.get("status", "pending")
        if status not in ("pending", "in_progress", "completed"):
            status = "pending"
        cleaned.append({
            "id": str(item.get("id", i + 1)),
            "content": str(item.get("content", "")).strip(),
            "status": status,
        })

    session_id = _current_session_id.get()
    set_session_todos(session_id, cleaned)
    logger.info(f"todo_write updated {len(cleaned)} todos (session={session_id!r})")

    if not cleaned:
        return {"content": "Todo list cleared."}
    return {
        "content": (
            f"Todo list updated ({len(cleaned)} items):\n"
            + "\n".join(f"- [{_STATUS_MARKS.get(t['status'], ' ')}] {t['content']}" for t in cleaned)
        )
    }


def register_todo_tool(registry) -> None:
    registry.register(ToolDefinition(
        name="todo_write",
        description=(
            "Maintain a task list for the current multi-step task. Provide the FULL "
            "list each call (full-replace): every item is {id, content, status} where "
            "status is one of pending/in_progress/completed. Use it to plan a task with "
            "several steps and to mark progress as you complete each step, so the user "
            "can see what remains."
        ),
        parameters={
            "type": "object",
            "properties": {
                "todos": {
                    "type": "array",
                    "description": "The complete todo list (full replacement).",
                    "items": {
                        "type": "object",
                        "properties": {
                            "id": {"type": "string", "description": "Stable item id."},
                            "content": {"type": "string", "description": "What to do."},
                            "status": {
                                "type": "string",
                                "enum": ["pending", "in_progress", "completed"],
                            },
                        },
                        "required": ["content", "status"],
                    },
                },
            },
            "required": ["todos"],
        },
        execute=_todo_write,
        requires_confirmation=False,
    ))
