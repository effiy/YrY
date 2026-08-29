"""In-memory ring buffer of recent RAG chat turns.

Mirrors ``history.py`` but for chat (vs one-shot retrieval). Keeps the
last N chat turns — user question + assistant answer + sources — so the
aiChat Console's History tab can surface what was asked in chat (not just
retrieval) without persisting to disk (chat sessions already live in
MongoDB via ``aicr``).

Public API:
    - ``record_chat_turn(...)`` — push a turn after a chat stream completes
    - ``list_chat_history()``  — newest-first list of turns
    - ``clear_chat_history()`` — wipe the buffer
"""
from __future__ import annotations

import time
import uuid
from typing import Any, Dict, List, Optional

# Max turns kept in memory. 20 matches the retrieval ring buffer.
MAX_CHAT_HISTORY = 20

_chat_history: List[Dict[str, Any]] = []


def record_chat_turn(
    question: str,
    answer: str,
    sources: List[Dict[str, Any]],
    scope: str = "",
    chat_mode: str = "condense_plus_context",
    latency_ms: float = 0,
    hybrid: bool = False,
    rerank: bool = False,
    citations: bool = False,
    num_queries: int = 1,
    category: str = "",
    tags: Optional[List[str]] = None,
) -> Dict[str, Any]:
    """Push a chat turn and return it (already-shaped, ready for emit).

    Mirrors ``history.record_query``'s ``config`` block so the frontend
    can show the same retrieval-knob chips for chat turns as for retrieval
    queries. ``latency_ms`` measures the round-trip from ``stream_chat``
    start to the last token + source emit — comparable to ``RagQueryRecord``
    latency so the chat sub-tab can render a latency-trend sparkline.
    """
    scores = [float(s.get("score") or 0) for s in sources if s.get("score") is not None]
    record: Dict[str, Any] = {
        "id": uuid.uuid4().hex[:12],
        "question": question,
        "answer": answer,
        "scope": scope or "",
        "chat_mode": chat_mode,
        "latency_ms": int(latency_ms),
        "source_count": len(sources),
        "top_score": max(scores) if scores else 0.0,
        "avg_score": (sum(scores) / len(scores)) if scores else 0.0,
        "sources": sources,
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%S", time.localtime()),
        "config": {
            "hybrid": bool(hybrid),
            "rerank": bool(rerank),
            "citations": bool(citations),
            "num_queries": int(num_queries),
            "category": category or "",
            "tags": list(tags) if tags else [],
        },
    }
    _chat_history.append(record)
    if len(_chat_history) > MAX_CHAT_HISTORY:
        del _chat_history[: len(_chat_history) - MAX_CHAT_HISTORY]
    return record


def list_chat_history() -> List[Dict[str, Any]]:
    """Return turns newest-first (most-recent chat turn at the top)."""
    return list(reversed(_chat_history))


def clear_chat_history() -> None:
    _chat_history.clear()
