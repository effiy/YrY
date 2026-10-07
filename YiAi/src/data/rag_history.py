"""RAG history persistence — MongoDB-backed retrieval & chat records.

Persists every retrieval query and chat turn so the RAG Console History tab
survives server restarts and can query across larger time windows than the
in-memory ring buffers (which are still the fast path for the /rag-history
endpoint).
"""
from __future__ import annotations

import logging
import time
from typing import Any

from data.database import db

logger = logging.getLogger(__name__)

_COLLECTION = "rag_history"


async def _ensure_collection():
    await db.initialize()
    coll = db.db[_COLLECTION]
    # Indexes: compound for type+timestamp queries (the primary access pattern)
    try:
        await coll.create_index([("type", 1), ("timestamp", -1)], background=True)
        await coll.create_index([("scope", 1), ("timestamp", -1)], background=True)
        await coll.create_index("timestamp", background=True)
    except Exception:
        logger.debug("Failed to create rag_history indexes", exc_info=True)
    return coll


async def save_retrieval_record(record: dict[str, Any]) -> None:
    """Persist a retrieval query record to MongoDB (fire-and-forget)."""
    try:
        coll = await _ensure_collection()
        doc = {
            "type": "retrieval",
            "question": record.get("question", ""),
            "scope": record.get("scope", ""),
            "top_k": record.get("top_k", 0),
            "result_count": record.get("result_count", 0),
            "top_score": record.get("top_score", 0.0),
            "avg_score": record.get("avg_score", 0.0),
            "latency_ms": record.get("latency_ms", 0),
            "sources": record.get("sources", []),
            "config": record.get("config", {}),
            "timestamp": record.get("timestamp", time.time()),
        }
        await coll.insert_one(doc)
    except Exception:
        logger.debug("Failed to persist retrieval record", exc_info=True)


async def save_chat_turn(record: dict[str, Any]) -> None:
    """Persist a chat turn record to MongoDB (fire-and-forget)."""
    try:
        coll = await _ensure_collection()
        doc = {
            "type": "chat",
            "question": record.get("question", ""),
            "answer": record.get("answer", ""),
            "scope": record.get("scope", ""),
            "chat_mode": record.get("chat_mode", ""),
            "latency_ms": record.get("latency_ms", 0),
            "source_count": record.get("source_count", 0),
            "top_score": record.get("top_score", 0.0),
            "avg_score": record.get("avg_score", 0.0),
            "sources": record.get("sources", []),
            "config": record.get("config", {}),
            "timestamp": record.get("timestamp", time.time()),
        }
        await coll.insert_one(doc)
    except Exception:
        logger.debug("Failed to persist chat turn", exc_info=True)


async def list_retrieval_history(
    limit: int = 50,
    before_ts: float | None = None,
    scope: str = "",
) -> list[dict[str, Any]]:
    """Return recent retrieval records (newest first)."""
    try:
        coll = await _ensure_collection()
        query: dict[str, Any] = {"type": "retrieval"}
        if before_ts:
            query["timestamp"] = {"$lt": before_ts}
        if scope:
            query["scope"] = scope
        cursor = coll.find(query).sort("timestamp", -1).limit(limit)
        records = []
        async for doc in cursor:
            doc.pop("_id", None)
            doc.pop("type", None)
            records.append(doc)
        return records
    except Exception:
        logger.debug("Failed to list retrieval history", exc_info=True)
        return []


async def list_chat_history(
    limit: int = 50,
    before_ts: float | None = None,
    scope: str = "",
) -> list[dict[str, Any]]:
    """Return recent chat turns (newest first)."""
    try:
        coll = await _ensure_collection()
        query: dict[str, Any] = {"type": "chat"}
        if before_ts:
            query["timestamp"] = {"$lt": before_ts}
        if scope:
            query["scope"] = scope
        cursor = coll.find(query).sort("timestamp", -1).limit(limit)
        records = []
        async for doc in cursor:
            doc.pop("_id", None)
            doc.pop("type", None)
            records.append(doc)
        return records
    except Exception:
        logger.debug("Failed to list chat history", exc_info=True)
        return []


async def get_rag_analytics(window: str = "7d") -> dict[str, Any]:
    """Aggregated RAG quality metrics over a time window.

    Returns avg latency, avg top_score, query count, source grade distribution,
    zero-result rate, and config efficiency across both retrieval and chat.
    """
    try:
        coll = await _ensure_collection()
        now = time.time()
        windows: dict[str, float] = {
            "24h": 86400,
            "7d": 7 * 86400,
            "30d": 30 * 86400,
        }
        cutoff = now - windows.get(window, windows["7d"])

        pipeline = [
            {"$match": {"timestamp": {"$gte": cutoff}}},
            {
                "$group": {
                    "_id": "$type",
                    "count": {"$sum": 1},
                    "avg_latency_ms": {"$avg": "$latency_ms"},
                    "avg_top_score": {"$avg": "$top_score"},
                    "zero_result_count": {
                        "$sum": {"$cond": [{"$eq": ["$result_count", 0]}, 1, 0]}
                    },
                }
            },
        ]
        rows = await coll.aggregate(pipeline).to_list(length=10)

        result: dict[str, Any] = {
            "window": window,
            "retrieval": {"count": 0, "avg_latency_ms": 0, "avg_top_score": 0, "zero_result_rate": 0},
            "chat": {"count": 0, "avg_latency_ms": 0, "avg_top_score": 0},
            "total": 0,
        }
        for row in rows:
            t = row["_id"]
            result[t] = {
                "count": row["count"],
                "avg_latency_ms": round(row["avg_latency_ms"] or 0),
                "avg_top_score": round((row["avg_top_score"] or 0) * 100),
                "zero_result_rate": round((row.get("zero_result_count", 0) / max(row["count"], 1)) * 100),
            }
            result["total"] += row["count"]
        return result
    except Exception:
        logger.debug("Failed to get RAG analytics", exc_info=True)
        return {"window": window, "retrieval": {}, "chat": {}, "total": 0}
