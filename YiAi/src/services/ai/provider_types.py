"""LLM provider types and ABC."""

from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from enum import Enum


class ProviderType(Enum):
    OLLAMA = "ollama"
    DEEPSEEK = "deepseek"


@dataclass
class ChatMessage:
    role: str
    content: str


@dataclass
class ChatResponse:
    content: str
    model: str
    provider: ProviderType
    usage: dict = field(default_factory=dict)
    finish_reason: str = "stop"


class LLMProvider(ABC):
    @abstractmethod
    async def chat(self, messages: list[ChatMessage], temperature: float = 0.7, max_tokens: int = 4096, **kwargs) -> ChatResponse: ...

    @abstractmethod
    async def embed(self, text: str) -> list[float]: ...

    @property
    @abstractmethod
    def provider_type(self) -> ProviderType: ...

    @property
    @abstractmethod
    def chat_model(self) -> str: ...

    @property
    @abstractmethod
    def embed_model(self) -> str: ...

    async def health_check(self) -> bool:
        try:
            await self.embed("health check")
            return True
        except Exception:
            return False
