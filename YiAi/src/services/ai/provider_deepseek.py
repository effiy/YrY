"""DeepSeek cloud provider — OpenAI-compatible API."""

import logging
from typing import Any

from services.ai.provider_types import ChatMessage, ChatResponse, LLMProvider, ProviderType
from shared.config import settings

logger = logging.getLogger(__name__)


class DeepSeekProvider(LLMProvider):
    def __init__(self, api_key: str | None = None, base_url: str | None = None, chat_model: str | None = None, embed_model: str | None = None):
        self._api_key = api_key or settings.deepseek_api_key
        self._base_url = base_url or settings.deepseek_base_url
        self._chat_model = chat_model or settings.deepseek_default_model
        self._embed_model = embed_model or getattr(settings, "deepseek_embed_model", None) or "deepseek-embed"
        self._client: Any = None

    def _get_openai_client(self):
        if self._client is None:
            from openai import AsyncOpenAI
            self._client = AsyncOpenAI(api_key=self._api_key, base_url=self._base_url, timeout=float(getattr(settings, "deepseek_chat_timeout", 300)))
        return self._client

    @property
    def provider_type(self) -> ProviderType: return ProviderType.DEEPSEEK
    @property
    def chat_model(self) -> str: return self._chat_model
    @property
    def embed_model(self) -> str: return self._embed_model

    async def chat(self, messages: list[ChatMessage], temperature: float = 0.7, max_tokens: int = 4096, **kwargs) -> ChatResponse:
        client = self._get_openai_client()
        response = await client.chat.completions.create(model=self._chat_model, messages=[{"role": m.role, "content": m.content} for m in messages], temperature=temperature, max_tokens=max_tokens, **kwargs)
        choice = response.choices[0]
        return ChatResponse(content=choice.message.content or "", model=self._chat_model, provider=ProviderType.DEEPSEEK, usage={"prompt_tokens": response.usage.prompt_tokens if response.usage else 0, "completion_tokens": response.usage.completion_tokens if response.usage else 0}, finish_reason=choice.finish_reason or "stop")

    async def embed(self, text: str) -> list[float]:
        client = self._get_openai_client()
        response = await client.embeddings.create(model=self._embed_model, input=text)
        return response.data[0].embedding
