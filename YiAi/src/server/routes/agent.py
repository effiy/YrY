"""Agent API routes — streaming agent chat with tool calling and observability.

POST /agent/chat  { messages, model?, system_prompt?, max_turns? }  → SSE stream
POST /agent/steer  { session_id, message }  → push a steering message
POST /agent/follow-up  { session_id, message }  → push a follow-up message
"""

import asyncio
import json
import logging
import time
from collections import defaultdict
from typing import Any, Dict, List

from fastapi import APIRouter, Body, Request
from fastapi.responses import StreamingResponse

from models.schemas import AgentChatRequest
from domain.ai.agent import agent_chat_stream, AgentEvent

logger = logging.getLogger(__name__)
router = APIRouter()

# ── Steering store (Pi-inspired: Agent.steer message queue) ──────────────
# In-memory store keyed by session_id. The agent loop drains this queue
# between turns, injecting steering messages as system prompts.
# Auto-expires entries older than 5 minutes.
_steering_store: Dict[str, List[Dict[str, Any]]] = defaultdict(list)
_steering_last_access: Dict[str, float] = {}
_follow_up_store: Dict[str, List[Dict[str, Any]]] = defaultdict(list)
_follow_up_last_access: Dict[str, float] = {}

def _cleanup_steering_store() -> None:
    """Remove entries older than 5 minutes."""
    now = time.time()
    stale = [k for k, t in _steering_last_access.items() if now - t > 300]
    for k in stale:
        _steering_store.pop(k, None)
        _steering_last_access.pop(k, None)
    stale_fu = [k for k, t in _follow_up_last_access.items() if now - t > 300]
    for k in stale_fu:
        _follow_up_store.pop(k, None)
        _follow_up_last_access.pop(k, None)


def get_steering_messages(session_id: str) -> List[Dict[str, Any]]:
    """Drain and return steering messages for a session."""
    _cleanup_steering_store()
    msgs = list(_steering_store.get(session_id, []))
    if msgs:
        _steering_store[session_id] = []
    return msgs


def push_steering_message(session_id: str, message: str) -> None:
    """Push a steering message into the session's queue."""
    _steering_last_access[session_id] = time.time()
    _steering_store[session_id].append({
        "role": "user",
        "content": f"[STEERING] {message}",
        "timestamp": time.time(),
    })


def get_follow_up_messages(session_id: str) -> List[Dict[str, Any]]:
    """Drain and return follow-up messages for a session."""
    _cleanup_steering_store()
    msgs = list(_follow_up_store.get(session_id, []))
    if msgs:
        _follow_up_store[session_id] = []
    return msgs


def push_follow_up_message(session_id: str, message: str) -> None:
    """Push a follow-up message into the session's queue."""
    _follow_up_last_access[session_id] = time.time()
    _follow_up_store[session_id].append({
        "role": "user",
        "content": f"[FOLLOW_UP] {message}",
        "timestamp": time.time(),
    })


def _format_sse(data: Any) -> bytes:
    """Serialize an agent event or content delta to SSE format."""
    if isinstance(data, AgentEvent):
        return data.to_sse().encode("utf-8")
    if isinstance(data, dict):
        return f"data: {json.dumps(data, ensure_ascii=False)}\n\n".encode("utf-8")
    if isinstance(data, str):
        return f"data: {json.dumps({'data': {'message': data}}, ensure_ascii=False)}\n\n".encode("utf-8")
    return f"data: {json.dumps(data, ensure_ascii=False)}\n\n".encode("utf-8")


@router.post("/agent/chat", operation_id="agent_chat")
async def agent_chat_route(request: AgentChatRequest):
    """Stream an agent chat response with tool calling.

    The agent loop emits structured events for high observability:
    - ``agent_start`` / ``agent_end`` — lifecycle boundaries
    - ``turn_start`` / ``turn_end`` — per-turn boundaries with tool results
    - ``thinking`` — streaming deltas
    - ``error`` — error events

    Each SSE frame is a JSON object with a ``type`` field for events or
    ``data.message`` for content deltas. The stream ends with ``{"done": true}``.
    """
    abort = asyncio.Event()
    session_id = request.session_id or ""

    async def _check_disconnect() -> None:
        """Poll for client disconnect so we can abort the agent loop."""
        pass  # FastAPI handles this via request.is_disconnected()

    async def _event_generator():
        try:
            async for frame in agent_chat_stream(
                messages=request.messages,
                model=request.model or "qwen3.5",
                system_prompt=request.system_prompt or "",
                max_turns=request.max_turns or 10,
                signal=abort,
                images=request.images,
                session_id=session_id,
                model_rotation=request.model_rotation,
            ):
                yield _format_sse(frame)
        except Exception as e:
            logger.exception("Agent chat stream failed")
            yield _format_sse({"error": str(e), "done": True})

    return StreamingResponse(
        _event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


@router.post("/agent/steer", operation_id="agent_steer")
async def agent_steer_route(
    session_id: str = Body(..., embed=True),
    message: str = Body(..., embed=True),
):
    """Push a steering message into the agent's message queue.

    The agent loop drains this queue between turns, injecting the message
    so the agent can adjust its behavior mid-execution.
    """
    if not session_id or not message.strip():
        return {"code": 1, "message": "session_id and message are required"}
    push_steering_message(session_id, message.strip())
    logger.info(f"Steering message queued for session {session_id}: {message[:80]}")
    return {"code": 0, "message": "ok", "data": {"queued": True}}


@router.post("/agent/follow-up", operation_id="agent_follow_up")
async def agent_follow_up_route(
    session_id: str = Body(..., embed=True),
    message: str = Body(..., embed=True),
):
    """Push a follow-up message that runs after the agent would otherwise stop.

    Unlike steering (which interrupts mid-run), follow-up messages wait until
    the agent finishes its current reasoning chain, then trigger a new turn.
    """
    if not session_id or not message.strip():
        return {"code": 1, "message": "session_id and message are required"}
    push_follow_up_message(session_id, message.strip())
    logger.info(f"Follow-up message queued for session {session_id}: {message[:80]}")
    return {"code": 0, "message": "ok", "data": {"queued": True}}


@router.post("/agent/tools", operation_id="agent_tools")
async def agent_tools_route():
    """List available agent tools with their schemas."""
    from domain.ai.tools import get_tool_registry
    registry = get_tool_registry()
    tools = registry.get_function_definitions()
    return {"code": 0, "message": "ok", "data": {"tools": tools}}


@router.get("/models", operation_id="list_models")
async def list_models_route():
    """List available Ollama models from the YiAi server."""
    try:
        from domain.ai.chat import OllamaService
        service = OllamaService()
        result = service.list_models()
        if result.get("success"):
            return {"code": 0, "message": "ok", "data": {"models": result.get("models", [])}}
        return {"code": 1, "message": result.get("error", "Failed to list models"), "data": {"models": []}}
    except Exception as e:
        logger.exception("Failed to list models")
        return {"code": 1, "message": str(e), "data": {"models": []}}