"""
Compaction — Pi-inspired context window management.

When the conversation grows too large for the model's context window,
summarize older messages and keep only the most recent ones verbatim.

Pattern adapted from Pi's ``shouldCompact()`` + ``compact()`` +
``generateSummary()`` in ``agent-session.ts``.

Usage::

    from services.ai.compaction import should_compact, compact_messages

    if should_compact(messages, max_tokens=8192):
        messages = await compact_messages(messages)
"""

from __future__ import annotations

import logging
from typing import Any, Dict, List

logger = logging.getLogger(__name__)

# Conservative token estimator: ~4 chars per token for mixed CN/EN text
_CHARS_PER_TOKEN = 4
# Keep last N message turns (user+assistant pairs) verbatim
_DEFAULT_KEEP_LAST = 4


def estimate_tokens(messages: List[Dict[str, Any]]) -> int:
    """Conservative token count estimation from message content strings."""
    total_chars = 0
    for m in messages:
        content = str(m.get("content", ""))
        total_chars += len(content)
    # Each message also has ~4 tokens of role/metadata overhead
    overhead = len(messages) * 4
    return overhead + (total_chars // _CHARS_PER_TOKEN)


def should_compact(
    messages: List[Dict[str, Any]],
    max_tokens: int = 8192,
    threshold: float = 0.8,
) -> bool:
    """Return True if the message list should be compacted.

    Triggers when estimated tokens exceed ``max_tokens * threshold``.
    Default threshold of 0.8 leaves headroom for the model's response.
    """
    if not messages:
        return False
    return estimate_tokens(messages) > int(max_tokens * threshold)


async def compact_messages(
    messages: List[Dict[str, Any]],
    *,
    keep_last: int = _DEFAULT_KEEP_LAST,
    compact_model: str = "qwen3.5:4b",
    max_tokens: int = 8192,
) -> List[Dict[str, Any]]:
    """Summarize early messages, keep recent ones verbatim.

    Args:
        messages: Full message list in ``[{role, content}]`` format.
        keep_last: Number of most recent messages to keep verbatim.
        compact_model: Model to use for summarization (should be fast/cheap).
        max_tokens: Context window size for the target model.

    Returns:
        Compacted message list: ``[summary_system_msg] + recent_messages``.
    """
    if not should_compact(messages, max_tokens):
        return messages

    if len(messages) <= keep_last:
        return messages

    to_summarize = messages[:-keep_last]
    recent = messages[-keep_last:]

    # Build a simple request for summarization
    conversation_text = _format_for_summary(to_summarize)
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
            model=compact_model,
        )

        if result.get("success"):
            summary = result["message"]
            logger.info(
                f"Compaction: {len(to_summarize)} msgs → summary "
                f"({len(conversation_text)} → {len(summary)} chars)"
            )
            system_msg = {
                "role": "system",
                "content": (
                    "[Previous conversation summary]\n"
                    f"{summary}\n"
                    "[/Previous conversation summary]"
                ),
            }
            return [system_msg] + recent
        else:
            logger.warning(f"Compaction summarization failed: {result.get('error')}")
            return messages
    except Exception as e:
        logger.warning(f"Compaction failed, returning original messages: {e}")
        return messages


def _format_for_summary(messages: List[Dict[str, Any]]) -> str:
    """Format messages into a compact text block for the summarizer."""
    lines: list[str] = []
    for m in messages:
        role = m.get("role", "unknown")
        content = str(m.get("content", ""))[:2000]  # Cap per message
        lines.append(f"[{role}]: {content}")
    return "\n\n".join(lines)
