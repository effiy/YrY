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

import httpx
import logging

from shared.config import settings

logger = logging.getLogger(__name__)

_configured = False


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
        Settings.embed_model = OpenAIEmbedding(
            model=settings.rag_embed_model if settings.rag_embed_model != "nomic-embed-text" else "deepseek-embed",
            api_key=settings.deepseek_api_key,
            api_base=settings.deepseek_base_url,
            timeout=_timeout,
        )
        logger.info(f"RAG embeddings: DeepSeek ({Settings.embed_model.model_name})")
    else:
        from llama_index.embeddings.ollama import OllamaEmbedding
        Settings.embed_model = OllamaEmbedding(
            model_name=settings.rag_embed_model,
            base_url=settings.ollama_url,
            client_kwargs={"timeout": httpx.Timeout(_timeout, connect=10.0)},
        )
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
