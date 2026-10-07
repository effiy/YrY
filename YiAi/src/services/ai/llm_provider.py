"""LLM Provider abstraction layer — public API re-exports.

All types live in provider_types.py, providers in provider_ollama.py /
provider_deepseek.py, and the router + singleton in provider_router.py.
External callers should continue to import from services.ai.llm_provider.
"""

from services.ai.provider_deepseek import DeepSeekProvider  # noqa: F401
from services.ai.provider_ollama import OllamaProvider, close_http_client  # noqa: F401
from services.ai.provider_router import LLMProviderRouter  # noqa: F401
from services.ai.provider_types import ChatMessage, ChatResponse, LLMProvider, ProviderType  # noqa: F401

_router: LLMProviderRouter | None = None


def get_llm_router() -> LLMProviderRouter:
    global _router
    if _router is None:
        _router = LLMProviderRouter()
    return _router


def reset_llm_router() -> None:
    global _router
    _router = None
