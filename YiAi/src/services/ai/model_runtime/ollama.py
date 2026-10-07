"""OllamaRuntime — direct httpx streaming (no thread, no queue)."""

from __future__ import annotations

import asyncio
from collections.abc import AsyncIterator
import json
import logging
from typing import Any

import httpx

from shared.config import settings

from .base import ModelRuntime

logger = logging.getLogger(__name__)

# ── Shared httpx client ────────────────────────────────────────────────────

_ollama_client: httpx.AsyncClient | None = None


def _get_ollama_client(base_url: str, timeout: float) -> httpx.AsyncClient:
    global _ollama_client
    if _ollama_client is None or _ollama_client.is_closed:
        _ollama_client = httpx.AsyncClient(
            base_url=base_url,
            timeout=httpx.Timeout(timeout, connect=10.0),
            limits=httpx.Limits(max_keepalive_connections=20, max_connections=100),
        )
    return _ollama_client


async def _close_ollama_client():
    global _ollama_client
    if _ollama_client is not None and not _ollama_client.is_closed:
        await _ollama_client.aclose()
        _ollama_client = None


# ── OllamaRuntime ──────────────────────────────────────────────────────────


class OllamaRuntime(ModelRuntime):
    """Ollama-backed runtime using async httpx streaming.

    Replaces the sync ollama-python SDK + thread + asyncio.Queue pattern
    with direct ``httpx.AsyncClient.stream()``.
    """

    def __init__(self, host: str | None = None, auth: str | None = None):
        self._host = (host or settings.ollama_url).rstrip("/")
        self._auth = auth or settings.ollama_auth
        self._timeout = float(settings.ollama_chat_timeout or 300)

    def model_name(self) -> str:
        return "qwen3.5:4b"

    async def stream_chat(
        self,
        messages: list[dict[str, Any]],
        model: str | None = None,
        system: str | None = None,
        images: list[bytes] | None = None,
    ) -> AsyncIterator[dict[str, Any]]:
        model_name = model or self.model_name()

        ollama_messages = list(messages)
        if images and ollama_messages:
            last = dict(ollama_messages[-1])
            last["images"] = images
            ollama_messages[-1] = last

        options: dict[str, Any] = {}
        if getattr(settings, "ollama_num_ctx", None):
            options["num_ctx"] = int(settings.ollama_num_ctx)
        if getattr(settings, "ollama_num_predict", None):
            options["num_predict"] = int(settings.ollama_num_predict)
        temp = getattr(settings, "ollama_temperature", None)
        if temp is not None:
            options["temperature"] = float(temp)

        body: dict[str, Any] = {
            "model": model_name,
            "messages": ollama_messages,
            "stream": True,
        }
        if options:
            body["options"] = options

        headers = {}
        if self._auth:
            import base64 as _b64
            headers["Authorization"] = "Basic " + _b64.b64encode(self._auth.encode()).decode()

        client = _get_ollama_client(self._host, self._timeout)
        yield {"data": {"phase": "preparing"}}

        heartbeat_interval = 8.0
        heartbeat_phases = ["thinking", "processing", "inference"]
        heartbeat_idx = 0
        start_time = asyncio.get_running_loop().time()

        try:
            async with client.stream(
                "POST", "/api/chat", json=body, headers=headers,
                timeout=httpx.Timeout(self._timeout, connect=10.0),
            ) as response:
                if response.status_code >= 400:
                    text = await response.aread()
                    yield {"error": f"Ollama HTTP {response.status_code}: {text[:500]}"}
                    return

                chunk_done = False
                buffer = ""

                async for raw in response.aiter_bytes():
                    if chunk_done:
                        break
                    buffer += raw.decode("utf-8", errors="replace")
                    while "\n" in buffer:
                        line, buffer = buffer.split("\n", 1)
                        line = line.strip()
                        if not line:
                            continue
                        try:
                            item = json.loads(line)
                        except json.JSONDecodeError:
                            continue

                        done_flag = item.get("done", False)
                        msg = item.get("message") or {}
                        delta = msg.get("content") or ""
                        done_reason = item.get("done_reason")

                        if done_flag and (item.get("eval_count") or item.get("prompt_eval_count")):
                            yield {
                                "data": {
                                    "usage": {
                                        "prompt_tokens": item.get("prompt_eval_count", 0),
                                        "completion_tokens": item.get("eval_count", 0),
                                        "total_tokens": item.get("prompt_eval_count", 0) + item.get("eval_count", 0),
                                    }
                                }
                            }

                        if delta:
                            yield {"data": {"message": delta}}

                        if done_reason or done_flag:
                            chunk_done = True
                            if done_reason:
                                yield {"done_reason": done_reason}

                        now = asyncio.get_running_loop().time()
                        if now - start_time > heartbeat_interval:
                            start_time = now
                            phase = heartbeat_phases[heartbeat_idx % len(heartbeat_phases)]
                            heartbeat_idx += 1
                            yield {"data": {"phase": phase}}

        except httpx.TimeoutException:
            yield {"error": f"Chat request timed out after {self._timeout}s"}
        except httpx.ConnectError as e:
            yield {"error": f"Cannot connect to Ollama at {self._host}: {e}"}
        except Exception as e:
            logger.error(f"Ollama stream failed: {e}")
            yield {"error": f"Ollama request failed: {e}"}

    async def complete(
        self,
        messages: list[dict[str, Any]],
        model: str | None = None,
        system: str | None = None,
        images: list[bytes] | None = None,
        max_retries: int = 2,
    ) -> dict[str, Any]:
        model_name = model or self.model_name()

        ollama_messages = list(messages)
        if images and ollama_messages:
            last = dict(ollama_messages[-1])
            last["images"] = images
            ollama_messages[-1] = last

        options: dict[str, Any] = {}
        if getattr(settings, "ollama_num_ctx", None):
            options["num_ctx"] = int(settings.ollama_num_ctx)

        body: dict[str, Any] = {"model": model_name, "messages": ollama_messages, "stream": False}
        if options:
            body["options"] = options

        headers = {}
        if self._auth:
            import base64 as _b64
            headers["Authorization"] = "Basic " + _b64.b64encode(self._auth.encode()).decode()

        client = _get_ollama_client(self._host, self._timeout)
        attempt = 0
        last_error: str | None = None

        while attempt <= max_retries:
            try:
                resp = await client.post(
                    "/api/chat", json=body, headers=headers,
                    timeout=httpx.Timeout(self._timeout, connect=10.0),
                )
                resp.raise_for_status()
                data = resp.json()
                msg = data.get("message") or {}
                result = msg.get("content") or ""
                return {
                    "success": True, "model": model_name, "message": result,
                    "usage": {
                        "prompt_tokens": data.get("prompt_eval_count", 0),
                        "completion_tokens": data.get("eval_count", 0),
                    },
                }
            except httpx.HTTPStatusError as e:
                if e.response.status_code >= 500:
                    last_error = str(e)
                    logger.warning(f"Ollama server error (retryable): {last_error}, attempt={attempt}")
                    attempt += 1
                else:
                    return {"success": False, "error": f"HTTP {e.response.status_code}: {e}", "model": model_name}
            except (httpx.TimeoutException, httpx.ConnectError) as e:
                last_error = str(e)
                logger.warning(f"Ollama transient error: {last_error}, attempt={attempt}")
                attempt += 1
            except Exception as e:
                last_error = str(e)
                logger.warning(f"Ollama call failed: {last_error}")
                return {"success": False, "error": last_error, "model": model_name}
