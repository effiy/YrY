"""Ollama local inference provider."""

import logging

import httpx

from services.ai.provider_types import ChatMessage, ChatResponse, LLMProvider, ProviderType
from shared.config import settings

logger = logging.getLogger(__name__)

_shared_client: httpx.AsyncClient | None = None


def _get_http_client() -> httpx.AsyncClient:
    global _shared_client
    if _shared_client is None or _shared_client.is_closed:
        _shared_client = httpx.AsyncClient(
            timeout=httpx.Timeout(120.0, connect=10.0),
            limits=httpx.Limits(max_keepalive_connections=10, max_connections=50),
        )
    return _shared_client


async def close_http_client():
    global _shared_client
    if _shared_client is not None and not _shared_client.is_closed:
        await _shared_client.aclose()
        _shared_client = None
        logger.info("LLM provider HTTP client closed")


class OllamaProvider(LLMProvider):
    def __init__(self, base_url: str | None = None, chat_model: str | None = None, embed_model: str | None = None):
        self._base_url = (base_url or settings.ollama_url).rstrip("/")
        self._chat_model = chat_model or getattr(settings, "ollama_chat_model", "qwen3.5:latest")
        self._embed_model = embed_model or getattr(settings, "ollama_embed_model", "nomic-embed-text")

    @property
    def provider_type(self) -> ProviderType: return ProviderType.OLLAMA
    @property
    def chat_model(self) -> str: return self._chat_model
    @property
    def embed_model(self) -> str: return self._embed_model

    async def chat(self, messages: list[ChatMessage], temperature: float = 0.7, max_tokens: int = 4096, **kwargs) -> ChatResponse:
        timeout = float(getattr(settings, "ollama_chat_timeout", 120))
        client = _get_http_client()
        resp = await client.post(
            f"{self._base_url}/api/chat",
            json={"model": self._chat_model, "messages": [{"role": m.role, "content": m.content} for m in messages], "stream": False, "options": {"temperature": temperature, "num_predict": max_tokens}},
            timeout=httpx.Timeout(timeout),
        )
        resp.raise_for_status()
        data = resp.json()
        return ChatResponse(content=data["message"]["content"], model=self._chat_model, provider=ProviderType.OLLAMA, usage={"prompt_tokens": data.get("prompt_eval_count", 0), "completion_tokens": data.get("eval_count", 0)}, finish_reason=data.get("done_reason", "stop"))

    async def embed(self, text: str) -> list[float]:
        client = _get_http_client()
        resp = await client.post(f"{self._base_url}/api/embeddings", json={"model": self._embed_model, "prompt": text}, timeout=httpx.Timeout(30.0))
        resp.raise_for_status()
        return resp.json()["embedding"]
