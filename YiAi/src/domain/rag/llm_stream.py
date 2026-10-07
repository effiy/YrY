"""LLM interaction: HTTP client, Ollama streaming, health checks, question condensation."""

from __future__ import annotations

import asyncio
from collections.abc import AsyncIterator
import json
import logging
import time
from typing import Any

import httpx

from shared.config import settings

logger = logging.getLogger(__name__)

# ── Shared HTTP client (connection pooling) ─────────────────────────────────

_http_client: httpx.AsyncClient | None = None


def _get_http_client() -> httpx.AsyncClient:
    global _http_client
    if _http_client is None or _http_client.is_closed:
        _http_client = httpx.AsyncClient(
            timeout=httpx.Timeout(120.0, connect=10.0),
            limits=httpx.Limits(max_keepalive_connections=5, max_connections=20),
        )
    return _http_client


async def close_http_client():
    global _http_client
    if _http_client is not None and not _http_client.is_closed:
        await _http_client.aclose()
        _http_client = None
        logger.info("HTTP client closed")


# ── Queue helpers ────────────────────────────────────────────────────────────


def _safe_put(queue: asyncio.Queue, item: Any, loop: asyncio.AbstractEventLoop) -> bool:
    try:
        asyncio.run_coroutine_threadsafe(queue.put(item), loop)
        return True
    except RuntimeError:
        return False


async def _stream_queue(queue: asyncio.Queue, worker_task: asyncio.Task, timeout: float):
    heartbeat = 10.0
    t0 = asyncio.get_running_loop().time()
    while True:
        remaining = timeout - (asyncio.get_running_loop().time() - t0)
        if remaining <= 0:
            if not worker_task.done():
                worker_task.cancel()
            yield {"error": f"RAG chat request timed out after {timeout}s"}
            return
        wait = min(heartbeat, remaining)
        try:
            item = await asyncio.wait_for(queue.get(), timeout=wait)
        except asyncio.TimeoutError:
            if asyncio.get_running_loop().time() - t0 > timeout:
                if not worker_task.done():
                    worker_task.cancel()
                yield {"error": f"RAG chat request timed out after {timeout}s"}
                return
            yield {"data": {"phase": "thinking"}}
            continue
        if item is None:
            break
        yield item


# ── Ollama streaming ─────────────────────────────────────────────────────────


async def _stream_ollama_chat(
    model: str, messages: list[dict[str, Any]], base_url: str, timeout: float = 120.0,
) -> AsyncIterator[dict[str, Any]]:
    client = _get_http_client()
    try:
        async with client.stream(
            "POST", f"{base_url}/api/chat",
            json={
                "model": model, "messages": messages, "stream": True,
                "options": {
                    "temperature": settings.rag_temperature,
                    "num_predict": settings.rag_num_predict,
                    "num_ctx": settings.ollama_num_ctx,
                },
            },
            timeout=httpx.Timeout(timeout, connect=10.0),
        ) as response:
            response.raise_for_status()
            async for line in response.aiter_lines():
                if not line:
                    continue
                try:
                    chunk = json.loads(line)
                except json.JSONDecodeError:
                    continue
                msg = chunk.get("message") or {}
                content = msg.get("content") or msg.get("thinking", "")
                if content:
                    yield {"data": {"message": content}}
                if chunk.get("done") and (chunk.get("eval_count") or chunk.get("prompt_eval_count")):
                    yield {
                        "data": {
                            "usage": {
                                "prompt_tokens": chunk.get("prompt_eval_count", 0),
                                "completion_tokens": chunk.get("eval_count", 0),
                                "total_tokens": chunk.get("prompt_eval_count", 0) + chunk.get("eval_count", 0),
                            }
                        }
                    }
    except Exception as e:
        logger.error(f"Ollama stream chat failed: {e}")
        raise


# ── Ollama health check ──────────────────────────────────────────────────────

_ollama_check_cache: dict[tuple, tuple[float, bool, str]] = {}


async def _check_ollama(model: str, base_url: str) -> tuple[bool, str]:
    cache_key = (model, base_url)
    now = time.monotonic()
    if cache_key in _ollama_check_cache:
        ts, ok, info = _ollama_check_cache[cache_key]
        if now - ts < 600.0:
            return ok, info

    try:
        client = _get_http_client()
        r = await client.get(f"{base_url}/api/tags", timeout=httpx.Timeout(5.0))
        r.raise_for_status()
        models = [m.get("name", "") for m in (r.json().get("models", []) or [])]
        base = model.split(":")[0]
        for m in models:
            if m == model or m.startswith(f"{base}:"):
                _ollama_check_cache[cache_key] = (now, True, m)
                return True, m
        _ollama_check_cache[cache_key] = (now, False, f"model {model} not found in {models}")
        return False, f"model {model} not found in {models}"
    except Exception as e:
        _ollama_check_cache[cache_key] = (now, False, str(e))
        return False, str(e)


# ── Question condensation ────────────────────────────────────────────────────


async def _condense_question_llm(
    question: str, history: list[dict[str, Any]], model: str, base_url: str,
) -> str:
    """Rewrite the latest question into a standalone query using conversation context.

    Resolves pronouns, entity references, abbreviations, and implicit context
    from prior turns. Returns the condensed question, or the original on failure.
    """
    if not history:
        return question

    # Build conversation context — last 8 messages, more content per message
    history_text = ""
    for m in history[-8:]:
        role = m.get("role", "user")
        if role in ("user", "assistant"):
            content = str(m.get("content", ""))[:500]
            history_text += f"{role}: {content}\n"

    condense_prompt = (
        "Rewrite the user's latest question into a standalone query suitable for "
        "knowledge base retrieval. Follow these rules:\n"
        "- Resolve all pronouns (it/they/this/that/these/those) to their referents.\n"
        "- Expand abbreviations and acronyms from the conversation context.\n"
        "- Include specific entities, project names, dates, or technical terms mentioned earlier.\n"
        "- If the latest question references a prior answer, incorporate the key facts.\n"
        "- Keep the rewritten question concise — one or two sentences.\n"
        "- Return ONLY the rewritten question, no preface or explanation.\n\n"
        f"Conversation:\n{history_text}\n"
        f"Latest question: {question}\n\n"
        "Standalone question:"
    )

    try:
        client = _get_http_client()
        r = await client.post(
            f"{base_url}/api/generate",
            json={
                "model": model, "prompt": condense_prompt, "stream": False,
                "options": {"num_predict": 128, "temperature": 0.0},
            },
            timeout=httpx.Timeout(20.0),
        )
        r.raise_for_status()
        condensed = (r.json().get("response") or r.json().get("thinking") or "").strip()
        if condensed and len(condensed) >= 3:
            return condensed
    except Exception:
        pass
    return question
