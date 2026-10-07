"""LLM provider router — config-driven with automatic fallback to Ollama."""

import logging

from services.ai.provider_deepseek import DeepSeekProvider
from services.ai.provider_ollama import OllamaProvider
from services.ai.provider_types import ChatMessage, ChatResponse, LLMProvider, ProviderType
from shared.config import settings
from shared.error_codes import ErrorCode
from shared.exceptions import BusinessException

logger = logging.getLogger(__name__)


class LLMProviderRouter:
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
        self._providers[ProviderType.OLLAMA] = OllamaProvider()
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

    async def chat_with_fallback(self, messages: list[ChatMessage], **kwargs) -> ChatResponse:
        from shared.circuit_breaker import CircuitBreakerOpen, get_circuit_breaker
        primary = self.chat_provider
        primary_cb = get_circuit_breaker(f"llm:chat:{primary.provider_type.value}")
        if not primary_cb.allow():
            if self._chat_provider_type != ProviderType.OLLAMA and ProviderType.OLLAMA in self._providers:
                logger.warning(f"[LLM] Circuit breaker open for {primary.provider_type.value}, falling back to Ollama")
                return await self._providers[ProviderType.OLLAMA].chat(messages, **kwargs)
            raise CircuitBreakerOpen(f"llm:chat:{primary.provider_type.value}")
        try:
            result = await primary.chat(messages, **kwargs)
            primary_cb.record_success()
            return result
        except Exception as e:
            primary_cb.record_failure()
            if self._chat_provider_type != ProviderType.OLLAMA and ProviderType.OLLAMA in self._providers:
                logger.warning(f"[LLM] {self._chat_provider_type.value} chat failed: {e}, falling back to Ollama")
                return await self._providers[ProviderType.OLLAMA].chat(messages, **kwargs)
            raise BusinessException(ErrorCode.AI_UNAVAILABLE, message=f"All LLM providers failed: {e}")

    async def embed_with_fallback(self, text: str) -> list[float]:
        from shared.circuit_breaker import CircuitBreakerOpen, get_circuit_breaker
        primary = self.embed_provider
        primary_cb = get_circuit_breaker(f"llm:embed:{primary.provider_type.value}")
        if not primary_cb.allow():
            if self._embed_provider_type != ProviderType.OLLAMA and ProviderType.OLLAMA in self._providers:
                logger.warning(f"[LLM] Circuit breaker open for {primary.provider_type.value} embed, falling back to Ollama")
                return await self._providers[ProviderType.OLLAMA].embed(text)
            raise CircuitBreakerOpen(f"llm:embed:{primary.provider_type.value}")
        try:
            result = await primary.embed(text)
            primary_cb.record_success()
            return result
        except Exception as e:
            primary_cb.record_failure()
            if self._embed_provider_type != ProviderType.OLLAMA and ProviderType.OLLAMA in self._providers:
                logger.warning(f"[LLM] {self._embed_provider_type.value} embedding failed: {e}, falling back to Ollama (dimension change may require index rebuild)")
                return await self._providers[ProviderType.OLLAMA].embed(text)
            raise BusinessException(ErrorCode.AI_UNAVAILABLE, message=f"All LLM providers failed for embedding: {e}")

    async def health_check(self) -> dict:
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
