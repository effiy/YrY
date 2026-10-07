"""ModelRuntime — abstract base for LLM provider backends."""

from __future__ import annotations

from abc import ABC, abstractmethod
from collections.abc import AsyncIterator
from typing import Any


class ModelRuntime(ABC):
    """Abstract base for LLM provider runtimes.

    Each provider implements ``stream_chat`` (async generator yielding
    SSE-ready dicts) and ``complete`` (non-streaming single response).
    """

    @abstractmethod
    async def stream_chat(
        self,
        messages: list[dict[str, Any]],
        model: str | None = None,
        system: str | None = None,
        images: list[bytes] | None = None,
    ) -> AsyncIterator[dict[str, Any]]:
        """Stream a chat response — yields {"data": {"message": str}} or {"error": str}."""
        ...

    @abstractmethod
    async def complete(
        self,
        messages: list[dict[str, Any]],
        model: str | None = None,
        system: str | None = None,
        images: list[bytes] | None = None,
        max_retries: int = 2,
    ) -> dict[str, Any]:
        """Non-streaming completion — returns {"success": bool, "message": str, "model": str}."""
        ...

    def model_name(self) -> str:
        return "qwen3.5:4b"
