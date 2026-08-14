"""Ask-user capability tool — Pi/dsh ``interaction/ask-user`` parity.

The ``ask_user`` tool lets the agent pause and ask the user a clarifying
question. The actual pause-and-wait is handled by the agent loop's preflight
(which has the SSE stream and the answer store); this module only registers the
tool so the LLM discovers it. The ``execute`` here is a defensive no-op — the
loop intercepts ``ask_user`` before it ever reaches normal execution.
"""

from __future__ import annotations

import logging
from typing import Any, Dict

from domain.ai.tools import ToolDefinition

logger = logging.getLogger(__name__)


async def _ask_user(args: Dict[str, Any]) -> Dict[str, Any]:
    # Defensive only: the agent loop handles ask_user in its preflight (it must
    # emit ASK_USER and wait on the /agent/answer store, which a plain tool
    # execute cannot do). If we ever reach here, fail loudly rather than hang.
    return {
        "content": "",
        "error": "ask_user is handled by the agent loop — this tool should not be executed directly.",
    }


def register_ask_tool(registry) -> None:
    registry.register(ToolDefinition(
        name="ask_user",
        description=(
            "Ask the user a clarifying question when the task is ambiguous or a "
            "decision is needed before continuing. Provide a concise question and, "
            "optionally, a list of suggested options. The loop pauses until the user "
            "answers; the answer is returned as the tool result."
        ),
        parameters={
            "type": "object",
            "properties": {
                "question": {"type": "string", "description": "The question to ask the user."},
                "options": {
                    "type": "array",
                    "items": {"type": "string"},
                    "description": "Optional suggested answers the user can pick from.",
                },
            },
            "required": ["question"],
        },
        execute=_ask_user,
        requires_confirmation=False,
    ))
