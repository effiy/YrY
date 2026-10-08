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
from llama_index.core.embeddings import BaseEmbedding

from domain.rag.embed_cache import get_text_embedding, set_text_embedding
from shared.config import settings

logger = logging.getLogger(__name__)

_configured = False


class _CachedEmbedding(BaseEmbedding):
    """Wraps a llama_index BaseEmbedding to add query-time caching.

    ``llama_index.core.embeddings.utils.resolve_embed_model`` performs a
    strict ``isinstance(embed_model, BaseEmbedding)`` check *before*
    delegating, so duck-typed wrappers relying on ``__getattr__`` fail hard
    with ``AssertionError`` at Settings assignment. We therefore inherit
    from BaseEmbedding (a Pydantic ``BaseModel``) and use
    ``model_construct`` to bypass validation against the underlying
    delegate's schema.

    For short texts (<2000 chars, typical user queries), consults the
    embed_cache before delegating to the real model. Long texts
    (document chunks during indexing) bypass the cache to save memory.

    All 6 abstract methods on BaseEmbedding are implemented here; unknown
    attributes (``model_name``, ``embed_batch_size``, Ollama client, …)
    fall through to the wrapped delegate via ``__getattr__``.
    """

    # We deliberately declare zero pydantic fields so that
    # model_construct() doesn't need any and the model isn't tempted to
    # validate the delegate's attributes through us.
    model_config = {"arbitrary_types_allowed": True, "extra": "allow"}

    @classmethod
    def wrap(cls, delegate: BaseEmbedding) -> "_CachedEmbedding":
        """Build a cached wrapper around an existing BaseEmbedding.

        Using ``model_construct`` avoids pydantic running a schema-derived
        validation pass — important because the delegate carries fields
        (api_key, base_url, httpx client, …) we don't want to re-validate
        at the wrapper level.
        """
        assert isinstance(delegate, BaseEmbedding), (
            f"_CachedEmbedding.wrap() requires a BaseEmbedding, got {type(delegate)!r}"
        )
        wrapper = cls.model_construct()
        # model_construct() doesn't trigger __init__/__attrs_post_init__;
        # stash the delegate on the instance dict directly.
        object.__setattr__(wrapper, "_delegate", delegate)
        return wrapper

    # ── attribute pass-through ───────────────────────────────────────

    def __getattr__(self, name: str) -> Any:
        # This method only runs when normal attribute lookup fails — i.e.
        # for properties and fields that live on the delegate, not on the
        # pydantic wrapper.
        delegate = self.__dict__.get("_delegate")
        if delegate is None:
            raise AttributeError(name)
        return getattr(delegate, name)

    # ── cache helpers ────────────────────────────────────────────────

    def _cached_hit(self, text: str) -> list[float] | None:
        if len(text or "") > 2000:
            return None
        return get_text_embedding(text)

    def _cached_store(self, text: str, vec: list[float]) -> None:
        if len(text or "") > 2000:
            return
        set_text_embedding(text, vec)

    # ── BaseEmbedding abstract methods ───────────────────────────────

    def _get_text_embedding(self, text: str) -> list[float]:
        cached = self._cached_hit(text)
        if cached is not None:
            return cached
        vec = list(self._delegate._get_text_embedding(text))
        self._cached_store(text, vec)
        return vec

    def _get_text_embeddings(self, texts: list[str]) -> list[list[float]]:
        results: list[list[float] | None] = [None] * len(texts)
        missing_indices: list[int] = []
        missing_texts: list[str] = []
        for i, t in enumerate(texts):
            c = self._cached_hit(t)
            if c is not None:
                results[i] = c
            else:
                missing_indices.append(i)
                missing_texts.append(t)
        if missing_texts:
            fresh = self._delegate._get_text_embeddings(missing_texts)
            for slot, t, v in zip(missing_indices, missing_texts, fresh):
                v_list = list(v)
                results[slot] = v_list
                self._cached_store(t, v_list)
        return [r if r is not None else [] for r in results]

    async def _aget_text_embedding(self, text: str) -> list[float]:
        cached = self._cached_hit(text)
        if cached is not None:
            return cached
        vec = list(await self._delegate._aget_text_embedding(text))
        self._cached_store(text, vec)
        return vec

    async def _aget_text_embeddings(self, texts: list[str]) -> list[list[float]]:
        results: list[list[float] | None] = [None] * len(texts)
        missing_indices: list[int] = []
        missing_texts: list[str] = []
        for i, t in enumerate(texts):
            c = self._cached_hit(t)
            if c is not None:
                results[i] = c
            else:
                missing_indices.append(i)
                missing_texts.append(t)
        if missing_texts:
            fresh = await self._delegate._aget_text_embeddings(missing_texts)
            for slot, t, v in zip(missing_indices, missing_texts, fresh):
                v_list = list(v)
                results[slot] = v_list
                self._cached_store(t, v_list)
        return [r if r is not None else [] for r in results]

    def _get_query_embedding(self, query: str) -> list[float]:
        # Queries are the prime cache-hit candidates — short and repetitive.
        cached = self._cached_hit(query)
        if cached is not None:
            return cached
        vec = list(self._delegate._get_query_embedding(query))
        self._cached_store(query, vec)
        return vec

    async def _aget_query_embedding(self, query: str) -> list[float]:
        cached = self._cached_hit(query)
        if cached is not None:
            return cached
        vec = list(await self._delegate._aget_query_embedding(query))
        self._cached_store(query, vec)
        return vec


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
        Settings.embed_model = _CachedEmbedding.wrap(raw)
        logger.info(f"RAG embeddings: DeepSeek ({raw.model_name})")
    else:
        from llama_index.embeddings.ollama import OllamaEmbedding
        raw = OllamaEmbedding(
            model_name=settings.rag_embed_model,
            base_url=settings.ollama_url,
            embed_batch_size=settings.rag_embed_batch_size,
            client_kwargs={"timeout": httpx.Timeout(_timeout, connect=10.0)},
        )
        Settings.embed_model = _CachedEmbedding.wrap(raw)
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
