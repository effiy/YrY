"""OpenAIRuntime — OpenAI-compatible API (DeepSeek, OpenAI, any compatible proxy)."""

from __future__ import annotations

from collections.abc import AsyncIterator
import logging
from typing import Any

from shared.config import settings

from .base import ModelRuntime

logger = logging.getLogger(__name__)

# Shared AsyncOpenAI client — created once and reused across requests for
# connection-pool reuse (same pattern as OllamaRuntime's _get_ollama_client).
_openai_client: Any = None


def _get_openai_client() -> Any:
    global _openai_client
    if _openai_client is None:
        from openai import AsyncOpenAI
        _openai_client = AsyncOpenAI(
            api_key=settings.deepseek_api_key,
            base_url=settings.deepseek_base_url,
            timeout=float(settings.deepseek_chat_timeout),
        )
    return _openai_client


def _b64(data: bytes) -> str:
    import base64
    return base64.b64encode(data).decode("ascii")


class OpenAIRuntime(ModelRuntime):
    """OpenAI-compatible runtime — supports DeepSeek and any OpenAI-compatible API.

    Uses the ``openai`` package's async client for streaming chat completions.
    Client is shared across requests for connection reuse.
    """

    def __init__(
        self,
        api_key: str | None = None,
        base_url: str | None = None,
        model: str | None = None,
    ):
        self._api_key = api_key or settings.deepseek_api_key
        self._base_url = base_url or settings.deepseek_base_url
        self._model = model or settings.deepseek_default_model
        self._timeout = settings.deepseek_chat_timeout

    def model_name(self) -> str:
        return self._model

    async def stream_chat(
        self,
        messages: list[dict[str, Any]],
        model: str | None = None,
        system: str | None = None,
        images: list[bytes] | None = None,
    ) -> AsyncIterator[dict[str, Any]]:
        try:
            from openai import AsyncOpenAI
        except ImportError:
            yield {"error": "openai package not installed — run: pip install openai"}
            return

        model_name = model or self._model
        client = _get_openai_client()

        openai_messages = list(messages)
        if system and not any(m.get("role") == "system" for m in openai_messages):
            openai_messages.insert(0, {"role": "system", "content": system})

        if images:
            last = dict(openai_messages[-1])
            content: Any = last.get("content", "")
            image_parts = [
                {"type": "image_url", "image_url": {"url": f"data:image/png;base64,{_b64(img)}", "detail": "auto"}}
                for img in images
            ]
            last["content"] = [{"type": "text", "text": content}] + image_parts
            openai_messages[-1] = last

        try:
            stream = await client.chat.completions.create(
                model=model_name, messages=openai_messages, stream=True,
                stream_options={"include_usage": True},
            )
            async for chunk in stream:
                if not chunk.choices:
                    continue
                delta = chunk.choices[0].delta
                if delta.content:
                    yield {"data": {"message": delta.content}}
                if hasattr(chunk, "usage") and chunk.usage:
                    yield {
                        "data": {
                            "usage": {
                                "prompt_tokens": chunk.usage.prompt_tokens,
                                "completion_tokens": chunk.usage.completion_tokens,
                                "total_tokens": chunk.usage.total_tokens,
                            }
                        }
                    }
        except Exception as e:
            logger.error(f"OpenAI stream failed: {e}")
            yield {"error": f"OpenAI request failed: {e}"}

    async def complete(
        self,
        messages: list[dict[str, Any]],
        model: str | None = None,
        system: str | None = None,
        images: list[bytes] | None = None,
        max_retries: int = 2,
    ) -> dict[str, Any]:
        try:
            from openai import AsyncOpenAI
        except ImportError:
            return {"success": False, "error": "openai package not installed"}

        model_name = model or self._model
        client = _get_openai_client()

        openai_messages = list(messages)
        if system and not any(m.get("role") == "system" for m in openai_messages):
            openai_messages.insert(0, {"role": "system", "content": system})

        attempt = 0
        last_error: str | None = None
        while attempt <= max_retries:
            try:
                response = await client.chat.completions.create(
                    model=model_name, messages=openai_messages,
                )
                content = response.choices[0].message.content or ""
                return {
                    "success": True, "model": model_name, "message": content,
                    "usage": {
                        "prompt_tokens": response.usage.prompt_tokens if response.usage else 0,
                        "completion_tokens": response.usage.completion_tokens if response.usage else 0,
                        "total_tokens": response.usage.total_tokens if response.usage else 0,
                    },
                }
            except Exception as e:
                last_error = str(e)
                logger.warning(f"OpenAI call failed: {last_error}, attempt={attempt}")
                attempt += 1
        return {"success": False, "error": last_error or "unknown error", "model": model_name}
