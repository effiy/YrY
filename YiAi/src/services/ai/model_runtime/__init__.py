"""
ModelRuntime — Pi-inspired provider abstraction for LLM backends.

Each runtime handles one provider (Ollama, RAG via llama_index, etc.) and
exposes a uniform async streaming interface::

    async for chunk in runtime.stream_chat(messages, model, system):
        ...  # chunk is a {"data": {"message": str}} dict (SSE-ready)
"""

from services.ai.model_runtime.base import ModelRuntime
from services.ai.model_runtime.ollama import OllamaRuntime, _get_ollama_client, _close_ollama_client
from services.ai.model_runtime.rag import RAGRuntime
from services.ai.model_runtime.openai import OpenAIRuntime
from typing import Any


def get_runtime(mode: str = "ollama", **kwargs: Any) -> ModelRuntime:
    """Create a ModelRuntime based on the desired mode.

    Args:
        mode: "ollama" | "rag" | "openai" | "deepseek"
        **kwargs: Passed to the runtime constructor.
    """
    if mode == "rag":
        return RAGRuntime(**kwargs)
    if mode in ("openai", "deepseek"):
        return OpenAIRuntime(**kwargs)
    return OllamaRuntime(**kwargs)


__all__ = [
    "ModelRuntime", "OllamaRuntime", "RAGRuntime", "OpenAIRuntime",
    "_get_ollama_client", "_close_ollama_client", "get_runtime",
]
