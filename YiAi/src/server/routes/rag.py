"""RAG endpoints — route layer.

Four flat POST routes mirroring ``knowledge.py``'s style:
  - /rag-query   → one-shot retrieval (no LLM)
  - /rag-status  → index build status
  - /rag-build   → trigger rebuild (async, runs in thread)
  - /rag-chat    → SSE streaming chat with sources frame
  - /rag-file-query → single-file retrieval
  - /rag-file-chat  → SSE single-file chat
"""
import json
import logging
import asyncio
from typing import Any, AsyncIterator

from fastapi import APIRouter
from fastapi.responses import StreamingResponse

from domain.rag import (
    rag_query,
    rag_chat_stream,
    rag_file_query,
    rag_file_chat_stream,
    rag_status,
    rag_categories,
    rebuild_index_async,
    resolve_safe,
)
from models.schemas import (
    RagQueryRequest,
    RagChatRequest,
    RagFileChatRequest,
    RagFileQueryRequest,
)
from shared.response import success

logger = logging.getLogger(__name__)
router = APIRouter()


def _format_sse(data: Any) -> bytes:
    """Mirror ``routes/execution.py:_format_sse`` — str → message frame, dict → passthrough."""
    if isinstance(data, (bytes, bytearray)):
        try:
            data = data.decode("utf-8")
        except Exception:
            data = str(data)
    if isinstance(data, str):
        payload: Any = {"data": {"message": data}}
    else:
        payload = data
    return f"data: {json.dumps(payload, ensure_ascii=False)}\n\n".encode("utf-8")


async def _stream_async(gen: AsyncIterator[Any]):
    try:
        async for item in gen:
            yield _format_sse(item)
    finally:
        yield _format_sse({"done": True})


@router.post("/rag-query", operation_id="rag_query")
async def rag_query_route(request: RagQueryRequest):
    try:
        sources = await asyncio.to_thread(rag_query, request.question, top_k=request.top_k, scope=request.scope)
        return success(data={"sources": sources})
    except Exception as e:
        logger.exception(f"RAG query failed: {e}")
        return success(data={"sources": [], "error": str(e)})


@router.post("/rag-status", operation_id="rag_status")
async def rag_status_route():
    return success(data=rag_status())


@router.post("/rag-categories", operation_id="rag_categories")
async def rag_categories_route():
    data = await asyncio.to_thread(rag_categories)
    return success(data=data)


@router.post("/rag-build", operation_id="rag_build")
async def rag_build_route():
    await rebuild_index_async()
    return success(data=rag_status())


@router.post("/rag-chat", operation_id="rag_chat")
async def rag_chat_route(request: RagChatRequest):
    gen = rag_chat_stream(request.messages, scope=request.scope)
    return StreamingResponse(
        _stream_async(gen),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "Connection": "keep-alive"},
    )


@router.post("/rag-file-query", operation_id="rag_file_query")
async def rag_file_query_route(request: RagFileQueryRequest):
    abs_path = resolve_safe(request.target_file)
    sources = rag_file_query(request.question, abs_path, top_k=request.top_k)
    return success(data={"sources": sources})


@router.post("/rag-file-chat", operation_id="rag_file_chat")
async def rag_file_chat_route(request: RagFileChatRequest):
    abs_path = resolve_safe(request.target_file)
    gen = rag_file_chat_stream(request.question, abs_path)
    return StreamingResponse(
        _stream_async(gen),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "Connection": "keep-alive"},
    )
