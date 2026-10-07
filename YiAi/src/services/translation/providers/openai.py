"""OpenAI / OpenAI-compatible translation provider.

Supports: OpenAI, ChatGLM, Gemini Pro, and any OpenAI-compatible API.
Streaming translation available via translate_stream method.
"""

import json
import logging

from services.translation.providers.base import BaseTranslateProvider
from shared.runtime import get_shared_client

logger = logging.getLogger(__name__)


class OpenAIProvider(BaseTranslateProvider):
    name = "openai"
    label = "OpenAI / Compatible"

    async def _translate(self, text: str, from_lang: str, to_lang: str, **config) -> str:
        request_path = config.get("request_path", "https://api.openai.com")
        model = config.get("model", "gpt-3.5-turbo")
        api_key = config.get("api_key", "")
        service = config.get("service", "openai")

        if not request_path.startswith("http"):
            request_path = f"https://{request_path}"

        url = request_path.rstrip("/")
        if service == "openai" and not url.endswith("/chat/completions"):
            url = f"{url}/v1/chat/completions"

        headers = {"Content-Type": "application/json"}
        if service == "openai":
            headers["Authorization"] = f"Bearer {api_key}"
        else:
            headers["api-key"] = api_key

        prompt_list = config.get("prompt_list") or [
            {"role": "system", "content": "You are a professional translation engine. Translate the text into a colloquial, professional, elegant and fluent content, without the style of machine translation. You must only translate the text content, never interpret it."},
            {"role": "user", "content": f"Translate into {to_lang}:\n\"\"\"\n{text}\n\"\"\""},
        ]

        body = {
            "model": model,
            "messages": prompt_list,
            "stream": False,
        }
        extra_args = config.get("request_arguments", "{}")
        if isinstance(extra_args, str):
            extra_args = json.loads(extra_args)
        body.update(extra_args)

        client = get_shared_client()
        resp = await client.post(url, json=body, headers=headers, timeout=60.0)
        resp.raise_for_status()
        data = resp.json()

        choices = data.get("choices", [])
        if choices:
            target = choices[0].get("message", {}).get("content", "").strip()
            return target.strip('"')
        raise RuntimeError(f"Unexpected response: {json.dumps(data, ensure_ascii=False)[:200]}")

    async def translate_stream(self, text: str, from_lang: str, to_lang: str, **config):
        """Streaming translation via SSE — yields text chunks."""
        request_path = config.get("request_path", "https://api.openai.com")
        model = config.get("model", "gpt-3.5-turbo")
        api_key = config.get("api_key", "")
        service = config.get("service", "openai")

        if not request_path.startswith("http"):
            request_path = f"https://{request_path}"

        url = request_path.rstrip("/")
        if service == "openai" and not url.endswith("/chat/completions"):
            url = f"{url}/v1/chat/completions"

        headers = {"Content-Type": "application/json"}
        if service == "openai":
            headers["Authorization"] = f"Bearer {api_key}"
        else:
            headers["api-key"] = api_key

        prompt_list = config.get("prompt_list") or [
            {"role": "system", "content": "You are a professional translation engine. Translate the text into a colloquial, professional, elegant and fluent content, without the style of machine translation. You must only translate the text content, never interpret it."},
            {"role": "user", "content": f"Translate into {to_lang}:\n\"\"\"\n{text}\n\"\"\""},
        ]

        body = {"model": model, "messages": prompt_list, "stream": True}
        extra_args = config.get("request_arguments", "{}")
        if isinstance(extra_args, str):
            extra_args = json.loads(extra_args)
        body.update(extra_args)

        client = get_shared_client()
        async with client.stream("POST", url, json=body, headers=headers, timeout=120.0) as resp:
            resp.raise_for_status()
            async for line in resp.aiter_lines():
                if line.startswith("data: "):
                    data_str = line[6:]
                    if data_str.strip() == "[DONE]":
                        break
                    try:
                        chunk = json.loads(data_str)
                        choices = chunk.get("choices")
                        if not choices:
                            continue
                        delta = choices[0].get("delta", {})
                        content = delta.get("content", "")
                        if content:
                            yield content
                    except json.JSONDecodeError:
                        continue
