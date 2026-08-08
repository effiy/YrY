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

import asyncio
import functools
import logging
from abc import ABC, abstractmethod
from typing import Any, AsyncIterator, Dict, List, Optional

from ollama import Client

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
        messages: List[Dict[str, Any]],
        model: str | None = None,
        system: str | None = None,
        images: List[bytes] | None = None,
    ) -> AsyncIterator[Dict[str, Any]]:
        """Stream a chat response.

        Yields dicts of shape ``{"data": {"message": str}}`` for content
        deltas, or ``{"error": str}`` on failure.
        """
        ...

    @abstractmethod
    async def complete(
        self,
        messages: List[Dict[str, Any]],
        model: str | None = None,
        system: str | None = None,
        images: List[bytes] | None = None,
        max_retries: int = 2,
    ) -> Dict[str, Any]:
        """Non-streaming completion.

        Returns ``{"success": bool, "message": str, "model": str}`` on
        success, or ``{"success": False, "error": str}`` on failure.
        """
        ...

    def model_name(self) -> str:
        """Default model ID for this runtime."""
        return "qwen3.5"


# ── OllamaRuntime ───────────────────────────────────────────────────────


class OllamaRuntime(ModelRuntime):
    """Ollama-backed runtime — the primary local LLM provider."""

    def __init__(self, host: str | None = None, auth: str | None = None):
        self._host = host or settings.ollama_url
        self._auth = auth or settings.ollama_auth
        self._timeout = settings.ollama_chat_timeout

    def _get_client(self) -> Client:
        kwargs: Dict[str, Any] = {"host": self._host}
        if self._auth:
            username, _, password = self._auth.partition(":")
            kwargs["auth"] = (username, password)
        if self._timeout:
            kwargs["timeout"] = self._timeout
        return Client(**kwargs)

    def model_name(self) -> str:
        return "qwen3.5"

    async def stream_chat(
        self,
        messages: List[Dict[str, Any]],
        model: str | None = None,
        system: str | None = None,
        images: List[bytes] | None = None,
        tools: Optional[List[Dict[str, Any]]] = None,
    ) -> AsyncIterator[Dict[str, Any]]:
        model_name = model or self.model_name()

        # Build Ollama-format messages
        ollama_messages = list(messages)
        if images and ollama_messages:
            last = dict(ollama_messages[-1])
            last["images"] = images
            ollama_messages[-1] = last

        loop = asyncio.get_running_loop()
        queue: asyncio.Queue[Optional[Any]] = asyncio.Queue()

        def _worker() -> None:
            try:
                client = self._get_client()
                for item in client.chat(
                    model=model_name, messages=ollama_messages, stream=True,
                    tools=tools,
                ):
                    try:
                        delta = ""
                        tool_calls = None
                        done_reason = None
                        if isinstance(item, dict):
                            msg = item.get("message") or {}
                            delta = msg.get("content") or msg.get("thinking") or ""
                            tool_calls = msg.get("tool_calls") or None
                            done_reason = item.get("done_reason")
                        else:
                            msg = getattr(item, "message", {}) or {}
                            delta = getattr(msg, "content", "") or getattr(msg, "thinking", "") or ""
                            tool_calls = getattr(msg, "tool_calls", None) or None
                            done_reason = getattr(item, "done_reason", None)
                        # Forward native tool calls so the agent loop can execute
                        # them (Pi: structured tool calling instead of XML parsing).
                        if tool_calls:
                            asyncio.run_coroutine_threadsafe(
                                queue.put({"tool_calls": tool_calls}), loop
                            )
                        if delta:
                            asyncio.run_coroutine_threadsafe(
                                queue.put(str(delta)), loop
                            )
                        # Forward the final done_reason (Pi: failToolCallsFromTruncatedMessage).
                        # "length" means the model hit its output token limit, so any
                        # tool calls in this response may carry truncated arguments.
                        if done_reason:
                            asyncio.run_coroutine_threadsafe(
                                queue.put({"done_reason": done_reason}), loop
                            )
                    except Exception:
                        continue
            except Exception as e:
                asyncio.run_coroutine_threadsafe(
                    queue.put({"error": f"Ollama request failed: {e}"}), loop
                )
            finally:
                asyncio.run_coroutine_threadsafe(queue.put(None), loop)

        asyncio.create_task(asyncio.to_thread(_worker))

        timeout = self._timeout or 300
        # Send heartbeat events every 15s to keep the SSE connection alive
        # through proxies/load-balancers while the model is generating.
        heartbeat_interval = 15.0
        start_time = asyncio.get_running_loop().time()
        while True:
            try:
                item = await asyncio.wait_for(queue.get(), timeout=heartbeat_interval)
            except asyncio.TimeoutError:
                # No chunk yet — check overall timeout, then send heartbeat
                now = asyncio.get_running_loop().time()
                if now - start_time > timeout:
                    yield {"error": f"Chat request timed out after {timeout}s"}
                    break
                yield {"data": {"phase": "thinking"}}
                continue
            if item is None:
                break
            if isinstance(item, dict) and "error" in item:
                yield item
            elif isinstance(item, dict) and "tool_calls" in item:
                yield item
            elif isinstance(item, dict) and "done_reason" in item:
                yield item
            else:
                yield {"data": {"message": item}}

    async def complete(
        self,
        messages: List[Dict[str, Any]],
        model: str | None = None,
        system: str | None = None,
        images: List[bytes] | None = None,
        max_retries: int = 2,
    ) -> Dict[str, Any]:
        model_name = model or self.model_name()

        ollama_messages = list(messages)
        if images and ollama_messages:
            last = dict(ollama_messages[-1])
            last["images"] = images
            ollama_messages[-1] = last

        loop = asyncio.get_running_loop()

        def _call() -> Dict[str, Any]:
            client = self._get_client()
            attempt = 0
            last_error: str | None = None
            while attempt <= max_retries:
                try:
                    response = client.chat(model=model_name, messages=ollama_messages)
                    if isinstance(response, dict):
                        msg = response.get("message", {}) or {}
                        result = msg.get("content") or msg.get("thinking") or ""
                    else:
                        msg = getattr(response, "message", {}) or {}
                        result = getattr(msg, "content", "") or getattr(msg, "thinking", "") or ""
                    return {"success": True, "model": model_name, "message": result}
                except Exception as e:
                    last_error = str(e)
                    logger.warning(
                        f"Ollama call failed: {last_error}, attempt={attempt}"
                    )
                    attempt += 1
            return {
                "success": False,
                "error": last_error or "unknown error",
                "model": model_name,
            }

        timeout = self._timeout or 300
        try:
            return await asyncio.wait_for(
                loop.run_in_executor(None, _call), timeout=timeout
            )
        except asyncio.TimeoutError:
            return {
                "success": False,
                "error": f"Chat request timed out after {timeout}s",
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
        messages: List[Dict[str, Any]],
        model: str | None = None,
        system: str | None = None,
        images: List[bytes] | None = None,
    ) -> AsyncIterator[Dict[str, Any]]:
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
        messages: List[Dict[str, Any]],
        model: str | None = None,
        system: str | None = None,
        images: List[bytes] | None = None,
        max_retries: int = 2,
    ) -> Dict[str, Any]:
        # RAG doesn't support non-streaming well; delegate to Ollama
        return await self._fallback.complete(
            messages, model, system, images, max_retries
        )


# ── Runtime factory ─────────────────────────────────────────────────────


def get_runtime(
    mode: str = "ollama",
    **kwargs: Any,
) -> ModelRuntime:
    """Create a ModelRuntime based on the desired mode.

    Args:
        mode: "ollama" | "rag"
        **kwargs: Passed to the runtime constructor.
    """
    if mode == "rag":
        return RAGRuntime(**kwargs)
    return OllamaRuntime(**kwargs)
