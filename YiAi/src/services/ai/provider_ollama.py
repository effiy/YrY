"""Ollama local inference provider.

EMBED GATEKEEPING
=================
The ``/api/embeddings`` endpoint is the single most resource-heavy HTTP call
YiAi makes against Ollama — a full index rebuild can easily queue tens of
thousands of embed requests which pin the CPU/GPU at 100% and drain laptop
batteries in minutes.

We therefore enforce **two layers of protection** *right here at the HTTP
edge* (before the request is even assembled), so no caller — not the RAG
indexer, not the watcher, not a stray background thread — can bypass them:

1. ``RAG_EMBED_KILL_SWITCH`` — a module-level flag that defaults to the value
   of ``settings.rag_embed_kill_switch`` (``True`` out of the box in
   ``config.yaml``).  When it is truthy, **every** ``OllamaProvider.embed()``
   call raises ``EmbedDisabledError`` *instead* of hitting Ollama.  The flag
   is flipped to ``False`` **only** inside the narrow manual-build contexts
   in ``kb_indexer.py`` (``build_kb_index`` / ``refresh_index_for_changes``)
   and ``embed_cache.py`` (``warmup_embeddings``), using the
   :class:`_AllowEmbedScope` context manager.  Those three code paths are
   the *only* ways embed traffic is ever allowed to leave this process.

2. ``_THROTTLE_MS`` — even when the kill-switch is lifted, successive embed
   requests are separated by a minimum ``_THROTTLE_MS`` sleep so the Ollama
   process and the local CPU/GPU get breathing room.  ``3_000 ms`` was
   chosen to be conservative on laptops; on a dedicated GPU box you can
   lower it via ``settings.rag_embed_throttle_ms`` in the YAML.

Chat traffic (``/api/chat``) is **not** gated — answering a user question is
always allowed, and its per-request cost is trivial compared to batch
embedding.
"""
from __future__ import annotations

import logging
import os
import threading
import time
from contextlib import contextmanager
from typing import Iterator

import httpx

from services.ai.provider_types import ChatMessage, ChatResponse, LLMProvider, ProviderType
from shared.config import settings
from shared.error_codes import ErrorCode
from shared.exceptions import BusinessException

logger = logging.getLogger(__name__)

_shared_client: httpx.AsyncClient | None = None


def _get_http_client() -> httpx.AsyncClient:
    global _shared_client
    if _shared_client is None or _shared_client.is_closed:
        _shared_client = httpx.AsyncClient(
            timeout=httpx.Timeout(120.0, connect=10.0),
            limits=httpx.Limits(max_keepalive_connections=10, max_connections=50),
        )
    return _shared_client


async def close_http_client():
    global _shared_client
    if _shared_client is not None and not _shared_client.is_closed:
        await _shared_client.aclose()
        _shared_client = None
        logger.info("LLM provider HTTP client closed")


# ── Kill-switch + throttle ──────────────────────────────────────────────────

class EmbedDisabledError(BusinessException):
    """Raised when ``OllamaProvider.embed()`` is called outside a manual
    build / warmup scope.  See module docstring for the contract."""

    def __init__(self) -> None:
        super().__init__(
            ErrorCode.AI_UNAVAILABLE,
            message=(
                "Ollama embedding is globally disabled to reduce resource usage. "
                "Use POST /rag-build (index rebuild) or POST /rag-embed-warmup "
                "(query cache warmup) to explicitly enable embedding for a single "
                "controlled batch."
            ),
        )


def _default_kill_switch() -> bool:
    env_override = os.getenv("YIAI_RAG_EMBED_KILL_SWITCH", "").strip().lower()
    if env_override in ("0", "false", "no", "off"):
        return False
    if env_override in ("1", "true", "yes", "on"):
        return True
    return bool(getattr(settings, "rag_embed_kill_switch", True))


RAG_EMBED_KILL_SWITCH: bool = _default_kill_switch()
_ALLOW_SCOPE_DEPTH: int = 0
_ALLOW_SCOPE_LOCK = threading.Lock()

_THROTTLE_MS: int = int(getattr(settings, "rag_embed_throttle_ms", 3000))
_LAST_EMBED_TS_NS: int = 0
_THROTTLE_LOCK = threading.Lock()


def _throttle() -> None:
    """Best-effort serialising throttle — keeps consecutive HTTP calls to
    ``/api/embeddings`` at least ``_THROTTLE_MS`` apart."""
    global _LAST_EMBED_TS_NS
    if _THROTTLE_MS <= 0:
        return
    min_s = _THROTTLE_MS / 1000.0
    with _THROTTLE_LOCK:
        now = time.monotonic_ns()
        wait_s = min_s - (now - _LAST_EMBED_TS_NS) / 1e9
        if wait_s > 0:
            time.sleep(wait_s)
        _LAST_EMBED_TS_NS = time.monotonic_ns()


@contextmanager
def allow_embed_scope(reason: str) -> Iterator[None]:
    """Temporarily lift the global embed kill-switch for a manually-invoked
    build / refresh / warmup batch.

    Callers *must* pass a short ``reason`` string for audit logging.  The
    context is re-entrant (reference-counted) so nested callers are safe —
    the kill-switch stays lifted until the outermost scope exits.
    """
    global RAG_EMBED_KILL_SWITCH, _ALLOW_SCOPE_DEPTH
    with _ALLOW_SCOPE_LOCK:
        _ALLOW_SCOPE_DEPTH += 1
        was_enabled = not RAG_EMBED_KILL_SWITCH
        RAG_EMBED_KILL_SWITCH = False
    logger.info(f"[embed] KILL-SWITCH LIFTED (scope depth={_ALLOW_SCOPE_DEPTH}, reason={reason!r})")
    try:
        yield
    finally:
        with _ALLOW_SCOPE_LOCK:
            _ALLOW_SCOPE_DEPTH -= 1
            if _ALLOW_SCOPE_DEPTH <= 0:
                _ALLOW_SCOPE_DEPTH = 0
                RAG_EMBED_KILL_SWITCH = _default_kill_switch()
                logger.info(
                    f"[embed] KILL-SWITCH RESTORED "
                    f"(kill_switch={RAG_EMBED_KILL_SWITCH}, reason={reason!r})"
                )
            else:
                logger.info(
                    f"[embed] allow_embed_scope exit (remaining depth={_ALLOW_SCOPE_DEPTH}, "
                    f"reason={reason!r})"
                )


class OllamaProvider(LLMProvider):
    def __init__(self, base_url: str | None = None, chat_model: str | None = None, embed_model: str | None = None):
        self._base_url = (base_url or settings.ollama_url).rstrip("/")
        self._chat_model = chat_model or getattr(settings, "ollama_chat_model", "qwen3.5:latest")
        self._embed_model = embed_model or getattr(settings, "ollama_embed_model", "nomic-embed-text")

    @property
    def provider_type(self) -> ProviderType: return ProviderType.OLLAMA
    @property
    def chat_model(self) -> str: return self._chat_model
    @property
    def embed_model(self) -> str: return self._embed_model

    async def chat(self, messages: list[ChatMessage], temperature: float = 0.7, max_tokens: int = 4096, **kwargs) -> ChatResponse:
        timeout = float(getattr(settings, "ollama_chat_timeout", 120))
        client = _get_http_client()
        resp = await client.post(
            f"{self._base_url}/api/chat",
            json={"model": self._chat_model, "messages": [{"role": m.role, "content": m.content} for m in messages], "stream": False, "options": {"temperature": temperature, "num_predict": max_tokens}},
            timeout=httpx.Timeout(timeout),
        )
        resp.raise_for_status()
        data = resp.json()
        return ChatResponse(content=data["message"]["content"], model=self._chat_model, provider=ProviderType.OLLAMA, usage={"prompt_tokens": data.get("prompt_eval_count", 0), "completion_tokens": data.get("eval_count", 0)}, finish_reason=data.get("done_reason", "stop"))

    async def embed(self, text: str) -> list[float]:
        if RAG_EMBED_KILL_SWITCH or _ALLOW_SCOPE_DEPTH <= 0:
            raise EmbedDisabledError()
        _throttle()
        client = _get_http_client()
        resp = await client.post(
            f"{self._base_url}/api/embeddings",
            json={"model": self._embed_model, "prompt": text},
            timeout=httpx.Timeout(30.0),
        )
        resp.raise_for_status()
        return resp.json()["embedding"]
