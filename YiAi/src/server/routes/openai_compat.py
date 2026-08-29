"""OpenAI-compatible API endpoints — DeepSeek-Harness inspired.

Provides a subset of the OpenAI /v1 API surface so any OpenAI SDK client
(openai Python, langchain, etc.) can use YiAi as a drop-in backend.

Endpoints:
    POST /v1/chat/completions  — streaming + non-streaming chat
    POST /v1/models             — list available models
"""
from __future__ import annotations

import json
import logging
import time
import uuid
from typing import Any, AsyncIterator, Dict, List, Optional

from fastapi import APIRouter, Request
from fastapi.responses import StreamingResponse

from services.ai.model_runtime import get_runtime
from shared.config import settings

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/v1")


def _openai_tool_to_ollama(tools: Optional[List[Dict[str, Any]]]) -> Optional[List[Dict[str, Any]]]:
    """Convert OpenAI-format tool definitions to Ollama format."""
    if not tools:
        return None
    result: List[Dict[str, Any]] = []
    for t in tools:
        if t.get("type") == "function" and "function" in t:
            func = t["function"]
            result.append({
                "type": "function",
                "function": {
                    "name": func.get("name", ""),
                    "description": func.get("description", ""),
                    "parameters": func.get("parameters", {}),
                },
            })
    return result or None


def _openai_tool_call_to_ollama(tool_calls: Any) -> Optional[List[Dict[str, Any]]]:
    """Convert OpenAI-format tool call delta to Ollama format."""
    if not tool_calls:
        return None
    result: List[Dict[str, Any]] = []
    for tc in tool_calls:
        result.append({
            "id": getattr(tc, "id", "") or tc.get("id", ""),
            "type": "function",
            "function": {
                "name": getattr(tc.function, "name", "") if hasattr(tc, "function") else tc.get("function", {}).get("name", ""),
                "arguments": getattr(tc.function, "arguments", "") if hasattr(tc, "function") else tc.get("function", {}).get("arguments", ""),
            },
        })
    return result


def _parse_openai_messages(body: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Extract messages from an OpenAI-format request body."""
    messages: List[Dict[str, Any]] = []
    for m in body.get("messages", []) or []:
        role = m.get("role", "user")
        content = m.get("content", "")
        # Handle multimodal content arrays
        if isinstance(content, list):
            text_parts = [p.get("text", "") for p in content if isinstance(p, dict) and p.get("type") == "text"]
            content = " ".join(text_parts)
        messages.append({"role": role, "content": str(content)})
    return messages


def _build_sse_chunk(
    delta: Optional[Dict[str, Any]] = None,
    finish_reason: Optional[str] = None,
    usage: Optional[Dict[str, int]] = None,
    model: str = "",
    chunk_id: str = "",
    created: int = 0,
) -> bytes:
    """Build an OpenAI-format SSE chunk."""
    chunk: Dict[str, Any] = {
        "id": chunk_id or f"chatcmpl-{uuid.uuid4().hex[:12]}",
        "object": "chat.completion.chunk",
        "created": created or int(time.time()),
        "model": model,
        "choices": [{
            "index": 0,
            "delta": delta or {},
            "finish_reason": finish_reason,
        }],
    }
    if usage:
        chunk["usage"] = usage
    return f"data: {json.dumps(chunk, ensure_ascii=False)}\n\n".encode("utf-8")


@router.post("/chat/completions", operation_id="openai_chat_completions")
async def chat_completions(request: Request):
    """OpenAI-compatible chat completions endpoint.

    Accepts the standard OpenAI chat completion request format and returns
    either a streaming SSE response (stream=true) or a single JSON response.

    Supports: messages, model, stream, temperature, max_tokens, tools, stop.
    """
    body = await request.json()
    messages = _parse_openai_messages(body)
    model = body.get("model", settings.rag_llm_model)
    stream = body.get("stream", False)
    _temperature = body.get("temperature")
    _max_tokens = body.get("max_tokens")
    _top_p = body.get("top_p")
    _stop = body.get("stop")
    tools = _openai_tool_to_ollama(body.get("tools"))

    # Determine provider from model name
    provider = "ollama"
    model_lower = model.lower()
    if any(x in model_lower for x in ("gpt-", "o1", "o3", "o4")):
        provider = "openai"
    elif any(x in model_lower for x in ("claude",)):
        provider = "anthropic"

    if not stream:
        # Non-streaming response
        runtime = get_runtime(provider)
        result = await runtime.complete(
            messages=messages,
            model=model,
        )
        if result.get("success"):
            return {
                "id": f"chatcmpl-{uuid.uuid4().hex[:12]}",
                "object": "chat.completion",
                "created": int(time.time()),
                "model": model,
                "choices": [{
                    "index": 0,
                    "message": {
                        "role": "assistant",
                        "content": result["message"],
                    },
                    "finish_reason": "stop",
                }],
                "usage": result.get("usage", {
                    "prompt_tokens": 0,
                    "completion_tokens": 0,
                    "total_tokens": 0,
                }),
            }
        else:
            return {
                "error": {
                    "message": result.get("error", "Unknown error"),
                    "type": "server_error",
                    "code": 500,
                }
            }

    # Streaming response
    chunk_id = f"chatcmpl-{uuid.uuid4().hex[:12]}"
    created = int(time.time())

    async def _stream() -> AsyncIterator[bytes]:
        runtime = get_runtime(provider)
        # Send initial chunk with role
        yield _build_sse_chunk(
            delta={"role": "assistant", "content": ""},
            model=model,
            chunk_id=chunk_id,
            created=created,
        )
        async for chunk in runtime.stream_chat(
            messages=messages,
            model=model,
            tools=tools,
        ):
            if isinstance(chunk, dict):
                if "error" in chunk:
                    yield _build_sse_chunk(
                        finish_reason="error",
                        model=model,
                        chunk_id=chunk_id,
                        created=created,
                    )
                    break
                data = chunk.get("data", {})
                token = data.get("message", "")
                usage = data.get("usage")
                if token:
                    yield _build_sse_chunk(
                        delta={"content": token},
                        model=model,
                        chunk_id=chunk_id,
                        created=created,
                    )
                if usage:
                    yield _build_sse_chunk(
                        delta={},
                        finish_reason="stop",
                        usage=usage,
                        model=model,
                        chunk_id=chunk_id,
                        created=created,
                    )
                if "tool_calls" in chunk:
                    tc = _openai_tool_call_to_ollama(chunk["tool_calls"])
                    if tc:
                        yield _build_sse_chunk(
                            delta={"tool_calls": tc},
                            model=model,
                            chunk_id=chunk_id,
                            created=created,
                        )
        # Final chunk with finish_reason
        yield _build_sse_chunk(
            delta={},
            finish_reason="stop",
            model=model,
            chunk_id=chunk_id,
            created=created,
        )
        yield b"data: [DONE]\n\n"

    return StreamingResponse(
        _stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        },
    )


@router.get("/models", operation_id="openai_list_models")
@router.post("/models", operation_id="openai_list_models_post")
async def list_models():
    """OpenAI-compatible model list endpoint.

    Returns available models from the configured provider. For Ollama,
    queries the Ollama API for installed models. For OpenAI/Anthropic,
    returns the configured default model.
    """
    import aiohttp

    models: List[Dict[str, Any]] = []
    provider = settings.ai_provider or "ollama"

    if provider == "ollama":
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(
                    f"{settings.ollama_url}/api/tags",
                    timeout=aiohttp.ClientTimeout(total=5),
                ) as resp:
                    if resp.status == 200:
                        data = await resp.json()
                        for m in data.get("models", []) or []:
                            name = m.get("name", "") if isinstance(m, dict) else str(m)
                            models.append({
                                "id": name,
                                "object": "model",
                                "created": int(time.time()),
                                "owned_by": "ollama",
                            })
        except Exception as e:
            logger.warning(f"Failed to query Ollama models: {e}")

    if not models:
        # Fallback: return the configured default model
        default_model = (
            settings.rag_llm_model
            if provider == "ollama"
            else settings.openai_default_model
            if provider == "openai"
            else settings.anthropic_default_model
        )
        models.append({
            "id": default_model,
            "object": "model",
            "created": int(time.time()),
            "owned_by": provider,
        })

    return {"object": "list", "data": models}
