"""RAGRuntime — wraps llama_index CondensePlusContextChatEngine, falls back to Ollama."""

from __future__ import annotations

from collections.abc import AsyncIterator
import logging
from typing import Any

from shared.config import settings

from .base import ModelRuntime
from .ollama import OllamaRuntime

logger = logging.getLogger(__name__)


class RAGRuntime(ModelRuntime):
    """RAG-backed runtime — wraps llama_index's CondensePlusContextChatEngine.

    Requires the RAG engine to be initialized (index built). Falls back to
    OllamaRuntime if the RAG engine is unavailable.
    """

    def __init__(self):
        self._fallback = OllamaRuntime()

    def model_name(self) -> str:
        return settings.rag_llm_model

    async def stream_chat(
        self,
        messages: list[dict[str, Any]],
        model: str | None = None,
        system: str | None = None,
        images: list[bytes] | None = None,
    ) -> AsyncIterator[dict[str, Any]]:
        from domain.rag.engine import rag_chat_stream

        user_text = ""
        for m in reversed(messages):
            if m.get("role") == "user":
                user_text = str(m.get("content", ""))
                break

        if not user_text:
            async for chunk in self._fallback.stream_chat(messages, model, system, images):
                yield chunk
            return

        scope: str | None = None
        if system:
            import re
            paths = re.findall(r"ctx:(\S+)", system)
            if len(paths) == 1:
                scope = paths[0]
            elif len(paths) > 1:
                parts = [p.split("/") for p in paths]
                min_len = min(len(p) for p in parts)
                common: list[str] = []
                for i in range(min_len):
                    if all(p[i] == parts[0][i] for p in parts):
                        common.append(parts[0][i])
                    else:
                        break
                scope = "/".join(common) if common else None

        try:
            async for chunk in rag_chat_stream(messages=messages, scope=scope):
                yield chunk
        except Exception as e:
            logger.warning(f"RAG stream failed, falling back to Ollama: {e}")
            async for chunk in self._fallback.stream_chat(messages, model, system, images):
                yield chunk

    async def complete(
        self,
        messages: list[dict[str, Any]],
        model: str | None = None,
        system: str | None = None,
        images: list[bytes] | None = None,
        max_retries: int = 2,
    ) -> dict[str, Any]:
        return await self._fallback.complete(messages, model, system, images, max_retries)
