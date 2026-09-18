"""
ModelRuntime — Pi-inspired provider abstraction for LLM backends.

Each runtime handles one provider (Ollama, RAG via llama_index, etc.) and
exposes a uniform async streaming interface::

    async for chunk in runtime.stream_chat(messages, model, system):
        ...  # chunk is a {"data": {"message": str}} dict (SSE-ready)

Pattern adapted from Pi's ``ModelRuntime`` + ``ProviderStreams`` which
abstract 10+ API types behind a single ``AssistantMessageEventStream``.

Usage in route handlers::

    runtime = OllamaRuntime()
    async for frame in runtime.stream_chat(messages, model="qwen3"):
        yield frame
"""

from __future__ import annotations

from abc import ABC, abstractmethod
import asyncio
from collections.abc import AsyncIterator
import json
import logging
from typing import Any, Dict, List, Optional

import httpx

from shared.config import settings

logger = logging.getLogger(__name__)


class ModelRuntime(ABC):
    """Abstract base for LLM provider runtimes.

    Each provider implements ``stream_chat`` (async generator yielding
    SSE-ready dicts) and ``complete`` (non-streaming single response).
    """

    @abstractmethod
    async def stream_chat(
        self,
        messages: list[dict[str, Any]],
        model: str | None = None,
        system: str | None = None,
        images: list[bytes] | None = None,
    ) -> AsyncIterator[dict[str, Any]]:
        """Stream a chat response.

        Yields dicts of shape ``{"data": {"message": str}}`` for content
        deltas, or ``{"error": str}`` on failure.
        """
        ...

    @abstractmethod
    async def complete(
        self,
        messages: list[dict[str, Any]],
        model: str | None = None,
        system: str | None = None,
        images: list[bytes] | None = None,
        max_retries: int = 2,
    ) -> dict[str, Any]:
        """Non-streaming completion.

        Returns ``{"success": bool, "message": str, "model": str}`` on
        success, or ``{"success": False, "error": str}`` on failure.
        """
        ...

    def model_name(self) -> str:
        """Default model ID for this runtime."""
        return "qwen3.5:4b"


# ── Shared httpx client for Ollama streaming ─────────────────────────────

_ollama_client: httpx.AsyncClient | None = None


def _get_ollama_client(base_url: str, timeout: float) -> httpx.AsyncClient:
    """Lazy-init a shared httpx client for Ollama streaming.

    Reuses a single client with connection pooling — avoids the TCP/TLS
    handshake on every chat request. The sync ollama-python SDK creates a
    new HTTP connection per call; this eliminates that overhead entirely.
    """
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


# ── OllamaRuntime (async httpx streaming — no thread, no queue) ─────────


class OllamaRuntime(ModelRuntime):
    """Ollama-backed runtime using async httpx streaming.

    Replaces the sync ollama-python SDK + thread + asyncio.Queue pattern
    with direct ``httpx.AsyncClient.stream()``. Eliminates:
      - Thread context-switch per chunk
      - Queue intermediary
      - New HTTP connection per request (shared connection pool)
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
            headers["Authorization"] = "Basic " + _b64.b64encode(
                self._auth.encode()
            ).decode()

        client = _get_ollama_client(self._host, self._timeout)

        # Signal the frontend immediately — no more blank "thinking" without feedback
        yield {"data": {"phase": "preparing"}}

        heartbeat_interval = 8.0  # faster heartbeat for responsive phase feedback
        heartbeat_phases = ["thinking", "processing", "inference"]
        heartbeat_idx = 0
        start_time = asyncio.get_running_loop().time()

        try:
            async with client.stream(
                "POST",
                "/api/chat",
                json=body,
                headers=headers,
                timeout=httpx.Timeout(self._timeout, connect=10.0),
            ) as response:
                if response.status_code >= 400:
                    text = await response.aread()
                    yield {"error": f"Ollama HTTP {response.status_code}: {text[:500]}"}
                    return

                # chunk_done tracks whether the final chunk has been received.
                # Ollama sends a final JSON object with "done":true — this is
                # different from stream completion (which just means the TCP
                # stream closed).
                chunk_done = False
                buffer = ""

                async for raw in response.aiter_bytes():
                    if chunk_done:
                        break
                    # Decode and split into JSON lines. Ollama sends one JSON
                    # object per line (ndjson-style streaming).
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

                        # Emit usage on the final frame
                        if done_flag and (item.get("eval_count") or item.get("prompt_eval_count")):
                            yield {
                                "data": {
                                    "usage": {
                                        "prompt_tokens": item.get("prompt_eval_count", 0),
                                        "completion_tokens": item.get("eval_count", 0),
                                        "total_tokens": item.get("prompt_eval_count", 0)
                                        + item.get("eval_count", 0),
                                    }
                                }
                            }

                        if delta:
                            yield {"data": {"message": delta}}

                        if done_reason or done_flag:
                            chunk_done = True
                            if done_reason:
                                yield {"done_reason": done_reason}

                        # Heartbeat: if no chunk arrives within heartbeat_interval,
                        # send a phase frame so the frontend doesn't think it's stuck.
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

        body: dict[str, Any] = {
            "model": model_name,
            "messages": ollama_messages,
            "stream": False,
        }
        if options:
            body["options"] = options

        headers = {}
        if self._auth:
            import base64 as _b64
            headers["Authorization"] = "Basic " + _b64.b64encode(
                self._auth.encode()
            ).decode()

        client = _get_ollama_client(self._host, self._timeout)
        attempt = 0
        last_error: str | None = None

        while attempt <= max_retries:
            try:
                resp = await client.post(
                    "/api/chat",
                    json=body,
                    headers=headers,
                    timeout=httpx.Timeout(self._timeout, connect=10.0),
                )
                resp.raise_for_status()
                data = resp.json()
                msg = data.get("message") or {}
                result = msg.get("content") or ""
                return {
                    "success": True,
                    "model": model_name,
                    "message": result,
                    "usage": {
                        "prompt_tokens": data.get("prompt_eval_count", 0),
                        "completion_tokens": data.get("eval_count", 0),
                    },
                }
            except Exception as e:
                last_error = str(e)
                logger.warning(f"Ollama call failed: {last_error}, attempt={attempt}")
                attempt += 1

        return {
            "success": False,
            "error": last_error or "unknown error",
            "model": model_name,
        }


# ── RAGRuntime ──────────────────────────────────────────────────────────


class RAGRuntime(ModelRuntime):
    """RAG-backed runtime — wraps llama_index's CondensePlusContextChatEngine.

    Requires the RAG engine to be initialized (index built). Falls back to
    OllamaRuntime if the RAG engine is unavailable.
    """

    def __init__(self):
        self._fallback = OllamaRuntime()

    def model_name(self) -> str:
        return settings.rag_llm_model

    async def stream_chat(
        self,
        messages: list[dict[str, Any]],
        model: str | None = None,
        system: str | None = None,
        images: list[bytes] | None = None,
    ) -> AsyncIterator[dict[str, Any]]:
        from domain.rag.engine import rag_chat_stream

        # RAG uses the last user message as the query and preceding messages
        # as chat history
        user_text = ""
        for m in reversed(messages):
            if m.get("role") == "user":
                user_text = str(m.get("content", ""))
                break

        if not user_text:
            # No user query — fall back to direct Ollama
            async for chunk in self._fallback.stream_chat(
                messages, model, system, images
            ):
                yield chunk
            return

        # Compute scope from system prompt (extracted from ctx: paths)
        scope: str | None = None
        if system:
            import re
            paths = re.findall(r"ctx:(\S+)", system)
            if len(paths) == 1:
                scope = paths[0]
            elif len(paths) > 1:
                parts = [p.split("/") for p in paths]
                min_len = min(len(p) for p in parts)
                common: list[str] = []
                for i in range(min_len):
                    if all(p[i] == parts[0][i] for p in parts):
                        common.append(parts[0][i])
                    else:
                        break
                scope = "/".join(common) if common else None

        try:
            async for chunk in rag_chat_stream(
                messages=messages,
                scope=scope,
            ):
                yield chunk
        except Exception as e:
            logger.warning(f"RAG stream failed, falling back to Ollama: {e}")
            async for chunk in self._fallback.stream_chat(
                messages, model, system, images
            ):
                yield chunk

    async def complete(
        self,
        messages: list[dict[str, Any]],
        model: str | None = None,
        system: str | None = None,
        images: list[bytes] | None = None,
        max_retries: int = 2,
    ) -> dict[str, Any]:
        # RAG doesn't support non-streaming well; delegate to Ollama
        return await self._fallback.complete(
            messages, model, system, images, max_retries
        )


class OpenAIRuntime(ModelRuntime):
    """OpenAI-compatible runtime — supports DeepSeek and any OpenAI-compatible API.

    Uses the ``openai`` package's async client for streaming chat completions.
    Compatible with DeepSeek API, OpenAI, and any OpenAI-compatible proxy.
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
        client = AsyncOpenAI(
            api_key=self._api_key,
            base_url=self._base_url,
            timeout=float(self._timeout),
        )

        # Build OpenAI-format messages
        openai_messages = list(messages)
        if system and not any(m.get("role") == "system" for m in openai_messages):
            openai_messages.insert(0, {"role": "system", "content": system})

        # Handle images for vision models
        if images:
            last = dict(openai_messages[-1])
            content: Any = last.get("content", "")
            image_parts = [
                {
                    "type": "image_url",
                    "image_url": {
                        "url": f"data:image/png;base64,{_b64(img)}",
                        "detail": "auto",
                    },
                }
                for img in images
            ]
            last["content"] = [{"type": "text", "text": content}] + image_parts
            openai_messages[-1] = last

        try:
            stream = await client.chat.completions.create(
                model=model_name,
                messages=openai_messages,
                stream=True,
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
        client = AsyncOpenAI(
            api_key=self._api_key,
            base_url=self._base_url,
            timeout=float(self._timeout),
        )

        openai_messages = list(messages)
        if system and not any(m.get("role") == "system" for m in openai_messages):
            openai_messages.insert(0, {"role": "system", "content": system})

        attempt = 0
        last_error: str | None = None
        while attempt <= max_retries:
            try:
                response = await client.chat.completions.create(
                    model=model_name,
                    messages=openai_messages,
                )
                content = response.choices[0].message.content or ""
                return {
                    "success": True,
                    "model": model_name,
                    "message": content,
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


# ── Helpers ──────────────────────────────────────────────────────────────


def _b64(data: bytes) -> str:
    import base64
    return base64.b64encode(data).decode("ascii")


# ── Runtime factory ─────────────────────────────────────────────────────


def get_runtime(
    mode: str = "ollama",
    **kwargs: Any,
) -> ModelRuntime:
    """Create a ModelRuntime based on the desired mode.

    Args:
        mode: "ollama" | "rag" | "openai" | "deepseek"
        **kwargs: Passed to the runtime constructor.
    """
    if mode == "rag":
        return RAGRuntime(**kwargs)
    if mode in ("openai", "deepseek"):
        return OpenAIRuntime(**kwargs)
    return OllamaRuntime(**kwargs)
