"""Global llama_index Settings configuration.

llama_index 0.13 reads embed_model / llm / chunk_size / chunk_overlap from a
module-level `Settings` singleton. Configuring it once at first use means
`VectorStoreIndex.from_documents(...)`, `load_index_from_storage(...)`, and
`CondensePlusContextChatEngine.from_defaults(...)` all pick up the same
embed model, LLM, and chunk parameters without each call site having to
pass them explicitly.

Public surface:
    - ``ensure_settings_configured()`` — idempotent; safe to call from
      every public entry point in ``domain.rag``.
"""
from __future__ import annotations

import logging
from typing import Any

import httpx

from domain.rag.embed_cache import get_text_embedding, set_text_embedding
from shared.config import settings

logger = logging.getLogger(__name__)

_configured = False


class _CachedEmbedding:
    """Wraps a llama_index BaseEmbedding to add query-time caching.

    For short texts (<2000 chars, typical user queries), consults the
    embed_cache before delegating to the real model. Long texts
    (document chunks during indexing) bypass the cache to save memory.
    """

    def __init__(self, delegate: Any):
        self._delegate = delegate

    def __getattr__(self, name: str) -> Any:
        return getattr(self._delegate, name)

    def _get_text_list(self, kwargs: dict) -> list[str] | None:
        texts = kwargs.get("texts")
        if isinstance(texts, list):
            return texts
        return None

    def _cached_get_text_embedding(self, text: str) -> list[float] | None:
        if len(text or "") > 2000:
            return None
        return get_text_embedding(text)

    def _cached_set_text_embedding(self, text: str, vec: list[float]) -> None:
        if len(text or "") > 2000:
            return
        set_text_embedding(text, vec)

    def get_text_embedding(self, text: str) -> list[float]:
        cached = self._cached_get_text_embedding(text)
        if cached is not None:
            return cached
        vec = self._delegate.get_text_embedding(text)
        self._cached_set_text_embedding(text, vec)
        return vec

    def get_text_embeddings(self, texts: list[str]) -> list[list[float]]:
        results: list[list[float] | None] = [None] * len(texts)
        missing_indices: list[int] = []
        missing_texts: list[str] = []
        for i, t in enumerate(texts):
            c = self._cached_get_text_embedding(t)
            if c is not None:
                results[i] = c
            else:
                missing_indices.append(i)
                missing_texts.append(t)
        if missing_texts:
            fresh = self._delegate.get_text_embeddings(missing_texts)
            for slot, t, v in zip(missing_indices, missing_texts, fresh):
                results[slot] = list(v)
                self._cached_set_text_embedding(t, list(v))
        return [r if r is not None else [] for r in results]

    async def aget_text_embedding(self, text: str) -> list[float]:
        cached = self._cached_get_text_embedding(text)
        if cached is not None:
            return cached
        vec = await self._delegate.aget_text_embedding(text)
        self._cached_set_text_embedding(text, vec)
        return vec

    async def aget_text_embeddings(self, texts: list[str]) -> list[list[float]]:
        results: list[list[float] | None] = [None] * len(texts)
        missing_indices: list[int] = []
        missing_texts: list[str] = []
        for i, t in enumerate(texts):
            c = self._cached_get_text_embedding(t)
            if c is not None:
                results[i] = c
            else:
                missing_indices.append(i)
                missing_texts.append(t)
        if missing_texts:
            fresh = await self._delegate.aget_text_embeddings(missing_texts)
            for slot, t, v in zip(missing_indices, missing_texts, fresh):
                results[slot] = list(v)
                self._cached_set_text_embedding(t, list(v))
        return [r if r is not None else [] for r in results]

    @property
    def model_name(self) -> str:
        return getattr(self._delegate, "model_name", None) or str(self._delegate)


def ensure_settings_configured() -> None:
    """Set global llama_index Settings once. Idempotent.

    When ``llm_embed_provider`` is ``deepseek``, uses ``OpenAIEmbedding``
    pointed at the DeepSeek API. Otherwise falls back to Ollama.
    """
    global _configured
    if _configured:
        return
    from llama_index.core import Settings

    _timeout = float(settings.rag_llm_request_timeout)
    embed_provider = (getattr(settings, "llm_embed_provider", None) or "").lower()

    if embed_provider == "deepseek" and settings.deepseek_api_key:
        from llama_index.embeddings.openai import OpenAIEmbedding
        raw = OpenAIEmbedding(
            model=settings.rag_embed_model if settings.rag_embed_model != "nomic-embed-text" else "deepseek-embed",
            api_key=settings.deepseek_api_key,
            api_base=settings.deepseek_base_url,
            timeout=_timeout,
        )
        Settings.embed_model = _CachedEmbedding(raw)
        logger.info(f"RAG embeddings: DeepSeek ({raw.model_name})")
    else:
        from llama_index.embeddings.ollama import OllamaEmbedding
        raw = OllamaEmbedding(
            model_name=settings.rag_embed_model,
            base_url=settings.ollama_url,
            embed_batch_size=settings.rag_embed_batch_size,
            client_kwargs={"timeout": httpx.Timeout(_timeout, connect=10.0)},
        )
        Settings.embed_model = _CachedEmbedding(raw)
        logger.info(f"RAG embeddings: Ollama ({settings.rag_embed_model})")

    # LLM for RAG chat — use DeepSeek if configured as chat provider
    chat_provider = (getattr(settings, "llm_chat_provider", None) or settings.ai_provider).lower()
    if chat_provider in ("deepseek", "openai") and settings.deepseek_api_key:
        from llama_index.llms.openai import OpenAI
        Settings.llm = OpenAI(
            model=settings.deepseek_default_model,
            api_key=settings.deepseek_api_key,
            api_base=settings.deepseek_base_url,
            temperature=0.0,
            max_tokens=2048,
            timeout=_timeout,
        )
        logger.info(f"RAG LLM: DeepSeek ({settings.deepseek_default_model})")
    else:
        from llama_index.llms.ollama import Ollama
        Settings.llm = Ollama(
            model=settings.rag_llm_model,
            base_url=settings.ollama_url,
            request_timeout=_timeout,
            temperature=0.0,
            num_predict=2048,
        )
        logger.info(f"RAG LLM: Ollama ({settings.rag_llm_model})")

    Settings.chunk_size = settings.rag_chunk_size
    Settings.chunk_overlap = settings.rag_chunk_overlap
    _configured = True
    logger.info(
        f"llama_index Settings configured: chunk={settings.rag_chunk_size}/{settings.rag_chunk_overlap}"
        f" timeout={_timeout}s"
    )
