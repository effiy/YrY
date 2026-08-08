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
from typing import Any, Dict, List, Optional

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

# ── Confirmation store (Pi-inspired: tool requires user approval) ─────────
# Keyed by (session_id, confirmation_id = tool call id). The agent loop polls
# get_confirmation_decision while waiting; POST /agent/confirm writes here.
# Decisions are consumed once by mark_confirmation_seen after the loop reads them.
_confirmation_store: Dict[tuple, str] = {}
_confirmation_last_access: Dict[tuple, float] = {}

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
    stale_conf = [k for k, t in _confirmation_last_access.items() if now - t > 300]
    for k in stale_conf:
        _confirmation_store.pop(k, None)
        _confirmation_last_access.pop(k, None)


def set_confirmation_decision(session_id: str, confirmation_id: str, approve: bool) -> None:
    """Record the user's approve/reject decision for a pending tool call."""
    key = (session_id, confirmation_id)
    _confirmation_last_access[key] = time.time()
    _confirmation_store[key] = "approved" if approve else "rejected"


def get_confirmation_decision(session_id: str, confirmation_id: str) -> Optional[str]:
    """Return the recorded decision (\"approved\"/\"rejected\") or None if pending."""
    return _confirmation_store.get((session_id, confirmation_id))


def mark_confirmation_seen(session_id: str, confirmation_id: str) -> None:
    """Consume a decision once the agent loop has read it."""
    _confirmation_store.pop((session_id, confirmation_id), None)
    _confirmation_last_access.pop((session_id, confirmation_id), None)


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
async def agent_chat_route(request: AgentChatRequest, http_request: Request):
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

    async def _watch_disconnect() -> None:
        """Poll for client disconnect and set `abort` so the agent loop stops
        (Pi: cancellation on client disconnect). Without this, a user closing
        the chat mid-turn leaves the loop running — waiting out the 120s
        confirmation timeout or finishing long tool calls server-side.

        Polls the raw ASGI ``receive`` channel with a timeout instead of
        ``Request.is_disconnected()``: starlette's version is a non-blocking
        check that only returns True when uvicorn has *already* queued an
        ``http.disconnect`` message, which uvicorn 0.40 does not do reliably
        for a client that closes mid-stream. Awaiting ``http_request._receive``
        directly returns ``http.disconnect`` the moment uvicorn notices the
        transport close."""
        try:
            raw_receive = http_request._receive
            while not abort.is_set():
                try:
                    message = await asyncio.wait_for(raw_receive(), timeout=1.0)
                except asyncio.TimeoutError:
                    continue  # no message yet — still connected
                if message.get("type") == "http.disconnect":
                    logger.info(f"Agent client disconnected, aborting run (session={session_id!r})")
                    abort.set()
                    return
        except Exception:
            # Connection checks are best-effort; never let them crash the stream.
            pass

    async def _event_generator():
        watcher = asyncio.create_task(_watch_disconnect())
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
        finally:
            watcher.cancel()
            try:
                await watcher
            except (asyncio.CancelledError, Exception):
                pass

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


@router.post("/agent/confirm", operation_id="agent_confirm")
async def agent_confirm_route(
    session_id: str = Body(..., embed=True),
    confirmation_id: str = Body(..., embed=True),
    approve: bool = Body(..., embed=True),
):
    """Approve or reject a tool call that requires user confirmation.

    The agent loop pauses after emitting ``confirmation_required`` and polls this
    decision (see ``domain/ai/agent.py:_wait_for_confirmation``). Approving lets
    the destructive tool execute; rejecting skips it with a "Rejected by user"
    result that the agent relays back.
    """
    if not session_id or not confirmation_id:
        return {"code": 1, "message": "session_id and confirmation_id are required"}
    set_confirmation_decision(session_id, confirmation_id, approve)
    logger.info(f"Agent confirmation {confirmation_id} for session {session_id}: {'approved' if approve else 'rejected'}")
    return {"code": 0, "message": "ok", "data": {"decision": "approved" if approve else "rejected"}}


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