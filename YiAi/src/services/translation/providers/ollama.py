"""Ollama local LLM translation provider."""

import json
import logging

from services.translation.providers.base import BaseTranslateProvider
from shared.runtime import get_shared_client

logger = logging.getLogger(__name__)


class OllamaProvider(BaseTranslateProvider):
    name = "ollama"
    label = "Ollama (Local LLM)"

    async def _translate(self, text: str, from_lang: str, to_lang: str, **config) -> str:
        request_path = config.get("request_path", "http://localhost:11434")
        model = config.get("model", "qwen3.5:4b")

        if not request_path.startswith("http"):
            request_path = f"https://{request_path}"
        request_path = request_path.rstrip("/")

        prompt_list = config.get("prompt_list") or [
            {"role": "system", "content": "You are a professional translation engine. Translate the text into a colloquial, professional, elegant and fluent content, without the style of machine translation. You must only translate the text content, never interpret it."},
            {"role": "user", "content": f"Translate into {to_lang}:\n\"\"\"\n{text}\n\"\"\""},
        ]

        body = {"model": model, "messages": prompt_list, "stream": False}

        client = get_shared_client()
        resp = await client.post(f"{request_path}/api/chat", json=body, timeout=120.0)
        resp.raise_for_status()
        data = resp.json()
        return data.get("message", {}).get("content", "").strip()

    async def translate_stream(self, text: str, from_lang: str, to_lang: str, **config):
        """Streaming translation via Ollama chat endpoint."""
        request_path = config.get("request_path", "http://localhost:11434")
        model = config.get("model", "qwen3.5:4b")

        if not request_path.startswith("http"):
            request_path = f"https://{request_path}"
        request_path = request_path.rstrip("/")

        prompt_list = config.get("prompt_list") or [
            {"role": "system", "content": "You are a professional translation engine. Translate the text into a colloquial, professional, elegant and fluent content, without the style of machine translation. You must only translate the text content, never interpret it."},
            {"role": "user", "content": f"Translate into {to_lang}:\n\"\"\"\n{text}\n\"\"\""},
        ]

        body = {"model": model, "messages": prompt_list, "stream": True}

        client = get_shared_client()
        async with client.stream("POST", f"{request_path}/api/chat", json=body, timeout=120.0) as resp:
            resp.raise_for_status()
            async for line in resp.aiter_lines():
                if not line.strip():
                    continue
                try:
                    chunk = json.loads(line)
                    content = chunk.get("message", {}).get("content", "")
                    if content:
                        yield content
                    if chunk.get("done"):
                        break
                except json.JSONDecodeError:
                    continue
