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

from shared.config import settings

logger = logging.getLogger(__name__)

_configured = False


def ensure_settings_configured() -> None:
    """Set global llama_index Settings once. Idempotent."""
    global _configured
    if _configured:
        return
    from llama_index.core import Settings
    from llama_index.embeddings.ollama import OllamaEmbedding
    from llama_index.llms.ollama import Ollama

    Settings.embed_model = OllamaEmbedding(
        model_name=settings.rag_embed_model,
        base_url=settings.ollama_url,
    )
    Settings.llm = Ollama(
        model=settings.rag_llm_model,
        base_url=settings.ollama_url,
        request_timeout=120.0,
    )
    Settings.chunk_size = settings.rag_chunk_size
    Settings.chunk_overlap = settings.rag_chunk_overlap
    _configured = True
    logger.info(
        f"llama_index Settings configured: embed={settings.rag_embed_model} "
        f"llm={settings.rag_llm_model} chunk={settings.rag_chunk_size}/{settings.rag_chunk_overlap}"
    )
