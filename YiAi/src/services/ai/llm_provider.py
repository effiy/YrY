"""
LLM Provider abstraction layer — unified Chat + Embedding interface.

Provides a config-driven router that selects the best available provider
for chat and embedding, with automatic fallback to Ollama.

Usage::

    from services.ai.llm_provider import get_llm_router

    router = get_llm_router()
    response = await router.chat_with_fallback(messages)
    embedding = await router.embed_with_fallback(text)
"""

from __future__ import annotations

import logging
from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from enum import Enum
from typing import Optional

import httpx

from shared.config import settings

logger = logging.getLogger(__name__)


# ── Types ──────────────────────────────────────────────────────────────────


class ProviderType(Enum):
    OLLAMA = "ollama"
    DEEPSEEK = "deepseek"


@dataclass
class ChatMessage:
    role: str  # "system" | "user" | "assistant"
    content: str


@dataclass
class ChatResponse:
    content: str
    model: str
    provider: ProviderType
    usage: dict = field(default_factory=dict)
    finish_reason: str = "stop"


# ── LLMProvider ABC ────────────────────────────────────────────────────────


class LLMProvider(ABC):
    """Abstract base for LLM providers.

    Every provider must implement ``chat()`` and ``embed()``.
    """

    @abstractmethod
    async def chat(
        self,
        messages: list[ChatMessage],
        temperature: float = 0.7,
        max_tokens: int = 4096,
        **kwargs,
    ) -> ChatResponse:
        """Send a chat completion and return a structured response."""
        ...

    @abstractmethod
    async def embed(self, text: str) -> list[float]:
        """Convert text to an embedding vector."""
        ...

    @property
    @abstractmethod
    def provider_type(self) -> ProviderType:
        ...

    @property
    @abstractmethod
    def chat_model(self) -> str:
        ...

    @property
    @abstractmethod
    def embed_model(self) -> str:
        ...

    async def health_check(self) -> bool:
        """Quick connectivity check — sends a minimal embedding request."""
        try:
            await self.embed("health check")
            return True
        except Exception:
            return False


# ── OllamaProvider ─────────────────────────────────────────────────────────


class OllamaProvider(LLMProvider):
    """Ollama local inference provider.

    Config keys (from config.yaml / env):
        - ``ollama_url`` / ``OLLAMA_URL``
        - ``ollama_chat_model`` (default: qwen2.5)
        - ``ollama_embed_model`` (default: nomic-embed-text)
    """

    def __init__(
        self,
        base_url: str | None = None,
        chat_model: str | None = None,
        embed_model: str | None = None,
    ):
        self._base_url = (base_url or settings.ollama_url).rstrip("/")
        self._chat_model = chat_model or getattr(settings, "ollama_chat_model", "qwen2.5")
        self._embed_model = embed_model or getattr(settings, "ollama_embed_model", "nomic-embed-text")

    @property
    def provider_type(self) -> ProviderType:
        return ProviderType.OLLAMA

    @property
    def chat_model(self) -> str:
        return self._chat_model

    @property
    def embed_model(self) -> str:
        return self._embed_model

    async def chat(
        self,
        messages: list[ChatMessage],
        temperature: float = 0.7,
        max_tokens: int = 4096,
        **kwargs,
    ) -> ChatResponse:
        timeout = float(getattr(settings, "ollama_chat_timeout", 120))
        async with httpx.AsyncClient(timeout=httpx.Timeout(timeout)) as client:
            resp = await client.post(
                f"{self._base_url}/api/chat",
                json={
                    "model": self._chat_model,
                    "messages": [{"role": m.role, "content": m.content} for m in messages],
                    "stream": False,
                    "options": {
                        "temperature": temperature,
                        "num_predict": max_tokens,
                    },
                },
            )
            resp.raise_for_status()
            data = resp.json()
            return ChatResponse(
                content=data["message"]["content"],
                model=self._chat_model,
                provider=ProviderType.OLLAMA,
                usage={
                    "prompt_tokens": data.get("prompt_eval_count", 0),
                    "completion_tokens": data.get("eval_count", 0),
                },
                finish_reason=data.get("done_reason", "stop"),
            )

    async def embed(self, text: str) -> list[float]:
        async with httpx.AsyncClient(timeout=httpx.Timeout(30.0)) as client:
            resp = await client.post(
                f"{self._base_url}/api/embeddings",
                json={"model": self._embed_model, "prompt": text},
            )
            resp.raise_for_status()
            return resp.json()["embedding"]


# ── DeepSeekProvider ───────────────────────────────────────────────────────


class DeepSeekProvider(LLMProvider):
    """DeepSeek cloud provider — uses the OpenAI-compatible API.

    Config keys:
        - ``deepseek_api_key`` / ``DEEPSEEK_API_KEY``
        - ``deepseek_base_url`` (default: https://api.deepseek.com/v1)
        - ``deepseek_default_model`` (default: deepseek-chat)
    """

    def __init__(
        self,
        api_key: str | None = None,
        base_url: str | None = None,
        chat_model: str | None = None,
        embed_model: str | None = None,
    ):
        self._api_key = api_key or settings.deepseek_api_key
        self._base_url = base_url or settings.deepseek_base_url
        self._chat_model = chat_model or settings.deepseek_default_model
        self._embed_model = embed_model or getattr(settings, "deepseek_embed_model", None) or "deepseek-embed"

    @property
    def provider_type(self) -> ProviderType:
        return ProviderType.DEEPSEEK

    @property
    def chat_model(self) -> str:
        return self._chat_model

    @property
    def embed_model(self) -> str:
        return self._embed_model

    async def chat(
        self,
        messages: list[ChatMessage],
        temperature: float = 0.7,
        max_tokens: int = 4096,
        **kwargs,
    ) -> ChatResponse:
        from openai import AsyncOpenAI

        client = AsyncOpenAI(
            api_key=self._api_key,
            base_url=self._base_url,
            timeout=float(getattr(settings, "deepseek_chat_timeout", 300)),
        )
        response = await client.chat.completions.create(
            model=self._chat_model,
            messages=[{"role": m.role, "content": m.content} for m in messages],
            temperature=temperature,
            max_tokens=max_tokens,
            **kwargs,
        )
        choice = response.choices[0]
        return ChatResponse(
            content=choice.message.content or "",
            model=self._chat_model,
            provider=ProviderType.DEEPSEEK,
            usage={
                "prompt_tokens": response.usage.prompt_tokens if response.usage else 0,
                "completion_tokens": response.usage.completion_tokens if response.usage else 0,
            },
            finish_reason=choice.finish_reason or "stop",
        )

    async def embed(self, text: str) -> list[float]:
        from openai import AsyncOpenAI

        client = AsyncOpenAI(
            api_key=self._api_key,
            base_url=self._base_url,
            timeout=30.0,
        )
        response = await client.embeddings.create(
            model=self._embed_model,
            input=text,
        )
        return response.data[0].embedding


# ── LLMProviderRouter ──────────────────────────────────────────────────────


class LLMProviderRouter:
    """Config-driven provider router with automatic fallback to Ollama.

    Features:
        - Separate chat / embedding provider selection
        - Auto-fallback: DeepSeek unavailable → Ollama
        - Health checks for all registered providers
    """

    def __init__(self):
        self._providers: dict[ProviderType, LLMProvider] = {}
        self._chat_provider_type: ProviderType = self._resolve_provider(
            getattr(settings, "llm_chat_provider", None) or settings.ai_provider
        )
        self._embed_provider_type: ProviderType = self._resolve_provider(
            getattr(settings, "llm_embed_provider", None) or "ollama"
        )
        self._init_providers()

    @staticmethod
    def _resolve_provider(name: str) -> ProviderType:
        name = name.lower()
        if name in ("deepseek", "openai"):
            return ProviderType.DEEPSEEK
        return ProviderType.OLLAMA

    def _init_providers(self):
        # Ollama is always available as the local fallback
        self._providers[ProviderType.OLLAMA] = OllamaProvider()

        # DeepSeek is optional — requires an API key
        if settings.deepseek_api_key:
            self._providers[ProviderType.DEEPSEEK] = DeepSeekProvider()
            logger.info("LLM Router: DeepSeek provider registered (chat=%s)", self._providers[ProviderType.DEEPSEEK].chat_model)
        else:
            logger.info("LLM Router: DeepSeek API key not configured — only Ollama available")

    @property
    def chat_provider(self) -> LLMProvider:
        return self._providers.get(self._chat_provider_type, self._providers[ProviderType.OLLAMA])

    @property
    def embed_provider(self) -> LLMProvider:
        return self._providers.get(self._embed_provider_type, self._providers[ProviderType.OLLAMA])

    async def chat_with_fallback(
        self, messages: list[ChatMessage], **kwargs
    ) -> ChatResponse:
        """Chat with automatic fallback to Ollama."""
        try:
            return await self.chat_provider.chat(messages, **kwargs)
        except Exception as e:
            if self._chat_provider_type != ProviderType.OLLAMA and ProviderType.OLLAMA in self._providers:
                logger.warning(
                    f"[LLM] {self._chat_provider_type.value} chat failed: {e}, "
                    f"falling back to Ollama"
                )
                return await self._providers[ProviderType.OLLAMA].chat(messages, **kwargs)
            raise

    async def embed_with_fallback(self, text: str) -> list[float]:
        """Embed with automatic fallback to Ollama.

        Note: fallback may change embedding dimensions, which requires
        rebuilding the RAG index.
        """
        try:
            return await self.embed_provider.embed(text)
        except Exception as e:
            if self._embed_provider_type != ProviderType.OLLAMA and ProviderType.OLLAMA in self._providers:
                logger.warning(
                    f"[LLM] {self._embed_provider_type.value} embedding failed: {e}, "
                    f"falling back to Ollama (dimension change may require index rebuild)"
                )
                return await self._providers[ProviderType.OLLAMA].embed(text)
            raise

    async def health_check(self) -> dict:
        """Check health of all registered providers."""
        results = {}
        for ptype, provider in self._providers.items():
            try:
                results[ptype.value] = await provider.health_check()
            except Exception as e:
                results[ptype.value] = False
                logger.warning(f"Health check failed for {ptype.value}: {e}")
        return results

    @property
    def available_providers(self) -> list[str]:
        return [p.value for p in self._providers]


# ── Singleton ──────────────────────────────────────────────────────────────

_router: Optional[LLMProviderRouter] = None


def get_llm_router() -> LLMProviderRouter:
    """Get or create the singleton LLMProviderRouter."""
    global _router
    if _router is None:
        _router = LLMProviderRouter()
    return _router


def reset_llm_router() -> None:
    """Reset the router singleton (useful for tests)."""
    global _router
    _router = None
