"""In-memory ring buffer of recent RAG queries.

Keeps the last N retrieval query records so the aiChat Console's History
tab can show what was asked, what was retrieved, and how long it took —
without persisting to disk (RAG retrieval is ephemeral; chat history
already lives in sessions).

Public API:
    - ``record_query(...)``   — push a record after a retrieval completes
    - ``list_history()``      — newest-first list of records
    - ``clear_history()``     — wipe the buffer (for the "Clear" button)
"""
from __future__ import annotations

import time
import uuid
from typing import Any, Dict, List, Optional

# Max records kept in memory. Older entries drop off the front as new ones
# are pushed. 20 matches the frontend ``RagQueryRecord`` docstring.
MAX_HISTORY = 20

_history: List[Dict[str, Any]] = []


def record_query(
    question: str,
    scope: str,
    top_k: int,
    sources: List[Dict[str, Any]],
    latency_ms: float,
    hybrid: bool = False,
    rerank: bool = False,
    citations: bool = False,
    num_queries: int = 1,
    category: str = "",
    tags: Optional[List[str]] = None,
) -> Dict[str, Any]:
    """Push a query record and return it (already-shaped, ready for emit).

    The ``config`` block records which retrieval knobs were active for
    this query so the History tab can group/compare across configs — e.g.
    "hybrid on vs off" or "with rerank vs without".
    """
    scores = [float(s.get("score") or 0) for s in sources if s.get("score") is not None]
    record: Dict[str, Any] = {
        "id": uuid.uuid4().hex[:12],
        "question": question,
        "scope": scope or "",
        "top_k": top_k,
        "result_count": len(sources),
        "top_score": max(scores) if scores else 0.0,
        "avg_score": (sum(scores) / len(scores)) if scores else 0.0,
        "sources": sources,
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%S", time.localtime()),
        "latency_ms": int(latency_ms),
        "config": {
            "hybrid": bool(hybrid),
            "rerank": bool(rerank),
            "citations": bool(citations),
            "num_queries": int(num_queries),
            "category": category or "",
            "tags": list(tags) if tags else [],
        },
    }
    _history.append(record)
    # Trim oldest beyond MAX_HISTORY
    if len(_history) > MAX_HISTORY:
        del _history[: len(_history) - MAX_HISTORY]
    return record


def list_history() -> List[Dict[str, Any]]:
    """Return records newest-first (most-recent retrieval at the top)."""
    return list(reversed(_history))


def clear_history() -> None:
    _history.clear()
