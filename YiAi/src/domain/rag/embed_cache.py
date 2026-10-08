"""Query embedding cache — in-memory + optional on-disk persistence.

Caches the float[] embedding vectors produced by /api/embeddings so repeated
identical (or near-identical) queries don't re-hit Ollama's embed endpoint.

Public surface:
    - ``get_text_embedding(text)`` -> list[float] | None
    - ``set_text_embedding(text, vector)`` -> None
    - ``warmup_embeddings(texts)`` -> dict{hits, misses, errors}
    - ``clear_embedding_cache()`` -> int (entries cleared)
    - ``embedding_cache_stats()`` -> dict{count, persist_enabled, persist_path}

KILL-SWITCH COMPLIANCE
======================
``warmup_embeddings`` is one of the THREE allowed call paths that may lift the
global ``RAG_EMBED_KILL_SWITCH`` (see ``services.ai.provider_ollama`` for the
gory details).  Every other embed call gets ``EmbedDisabledError``.
"""
from __future__ import annotations

import asyncio
import hashlib
import json
import logging
import os
import threading
import time
from typing import Any

from shared.config import settings

logger = logging.getLogger(__name__)

_CACHE_MAX = 2000
_CACHE_TTL = 86400 * 7

_mem_cache: dict[str, tuple[float, list[float]]] = {}
_lock = threading.Lock()


def _cache_key(text: str) -> str:
    norm = " ".join((text or "").lower().split())
    return hashlib.sha256(norm.encode()).hexdigest()[:24]


def _persist_path() -> str:
    return os.path.realpath(os.path.abspath(
        getattr(settings, "rag_embed_cache_persist_dir", None)
        or os.path.join(settings.rag_persist_dir, "embed_cache.jsonl")
    ))


def _load_persisted() -> None:
    if not settings.rag_embed_cache_persist:
        return
    path = _persist_path()
    if not os.path.isfile(path):
        return
    try:
        loaded = 0
        now = time.time()
        with open(path, encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if not line:
                    continue
                try:
                    rec = json.loads(line)
                    k = rec.get("k")
                    v = rec.get("v")
                    ts = float(rec.get("ts", 0))
                    if not k or not isinstance(v, list):
                        continue
                    if now - ts > _CACHE_TTL:
                        continue
                    with _lock:
                        if len(_mem_cache) >= _CACHE_MAX:
                            oldest = next(iter(_mem_cache))
                            del _mem_cache[oldest]
                        _mem_cache[k] = (ts, v)
                    loaded += 1
                except (ValueError, TypeError, json.JSONDecodeError):
                    continue
        logger.info(f"Embedding cache loaded {loaded} persisted entries from {path}")
    except OSError as e:
        logger.warning(f"Failed to load persisted embedding cache: {e}")


_persist_loaded = False


def _ensure_persist_loaded() -> None:
    global _persist_loaded
    if _persist_loaded:
        return
    _load_persisted()
    _persist_loaded = True


def _append_persist(key: str, vector: list[float], ts: float) -> None:
    if not settings.rag_embed_cache_persist:
        return
    path = _persist_path()
    try:
        os.makedirs(os.path.dirname(path), exist_ok=True)
        with open(path, "a", encoding="utf-8") as f:
            f.write(json.dumps({"k": key, "v": vector, "ts": ts}, ensure_ascii=False) + "\n")
    except OSError as e:
        logger.warning(f"Failed to persist embedding cache entry: {e}")


def get_text_embedding(text: str) -> list[float] | None:
    """Look up a cached embedding for *text*. Returns None on miss."""
    if not settings.rag_embed_cache_enabled:
        return None
    _ensure_persist_loaded()
    k = _cache_key(text)
    with _lock:
        hit = _mem_cache.get(k)
    if hit is None:
        return None
    ts, vec = hit
    if time.time() - ts > _CACHE_TTL:
        with _lock:
            _mem_cache.pop(k, None)
        return None
    return list(vec)


def set_text_embedding(text: str, vector: list[float]) -> None:
    """Store an embedding vector for *text*."""
    if not settings.rag_embed_cache_enabled:
        return
    k = _cache_key(text)
    ts = time.time()
    with _lock:
        if len(_mem_cache) >= _CACHE_MAX:
            oldest = next(iter(_mem_cache))
            del _mem_cache[oldest]
        _mem_cache[k] = (ts, list(vector))
    _append_persist(k, vector, ts)


def clear_embedding_cache() -> int:
    """Drop all in-memory entries and truncate the persist file. Returns cleared count."""
    with _lock:
        count = len(_mem_cache)
        _mem_cache.clear()
    if settings.rag_embed_cache_persist:
        path = _persist_path()
        try:
            if os.path.isfile(path):
                os.remove(path)
                logger.info(f"Truncated persisted embedding cache at {path}")
        except OSError as e:
            logger.warning(f"Failed to truncate persisted embedding cache: {e}")
    return count


def embedding_cache_stats() -> dict[str, Any]:
    _ensure_persist_loaded()
    with _lock:
        count = len(_mem_cache)
    return {
        "count": count,
        "max": _CACHE_MAX,
        "ttl_seconds": _CACHE_TTL,
        "cache_enabled": settings.rag_embed_cache_enabled,
        "query_embed_enabled": settings.rag_query_embed_enabled,
        "persist_enabled": settings.rag_embed_cache_persist,
        "persist_path": _persist_path() if settings.rag_embed_cache_persist else "",
    }


async def warmup_embeddings(texts: list[str]) -> dict[str, Any]:
    """Pre-compute and cache embeddings for each text in *texts*.

    Lifts the global ``RAG_EMBED_KILL_SWITCH`` for this single controlled batch
    via :func:`services.ai.provider_ollama.allow_embed_scope`.
    """
    from services.ai.provider_ollama import allow_embed_scope
    from services.ai.provider_router import provider_router

    hits = 0
    misses = 0
    errors: list[str] = []
    total = len(texts or [])

    async def _do_one(t: str) -> None:
        nonlocal hits, misses
        if not t or not t.strip():
            return
        if get_text_embedding(t) is not None:
            hits += 1
            return
        misses += 1
        try:
            vec = await provider_router.embed_with_fallback(t)
            set_text_embedding(t, vec)
        except Exception as e:
            errors.append(f"{t[:60]}: {e}")

    sem = asyncio.Semaphore(2)

    async def _bounded(t: str):
        async with sem:
            await _do_one(t)

    tasks = [_bounded(t) for t in (texts or [])]
    if tasks:
        with allow_embed_scope(reason="embed_cache.warmup_embeddings"):
            await asyncio.gather(*tasks, return_exceptions=False)

    return {
        "total": total,
        "hits": hits,
        "misses": misses,
        "computed": max(0, misses - len(errors)),
        "errors": len(errors),
        "errors_detail": errors[:10],
    }
