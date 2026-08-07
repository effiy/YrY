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
    rag_decompose,
    rag_status,
    rag_categories,
    rebuild_index_async,
    resolve_safe,
    list_history,
    clear_history,
    list_chat_history,
    clear_chat_history,
)
from models.schemas import (
    RagQueryRequest,
    RagChatRequest,
    RagFileChatRequest,
    RagFileQueryRequest,
    RagDecomposeRequest,
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
        sources = await asyncio.to_thread(
            rag_query,
            request.question,
            request.top_k,
            request.scope,
            request.hybrid,
            request.rerank,
            request.citations,
            request.num_queries,
            request.category,
            request.tags,
        )
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


@router.post("/rag-history", operation_id="rag_history")
async def rag_history_route():
    """Return the in-memory ring of recent retrieval query records.

    Records are pushed by ``rag_query`` after each retrieval completes —
    newest-first, max 20 entries. Lets the aiChat Console History tab show
    what was asked, what was retrieved, and the round-trip latency without
    requiring persistence to disk.
    """
    return success(data={"records": list_history(), "max": 20})


@router.post("/rag-history-clear", operation_id="rag_history_clear")
async def rag_history_clear_route():
    clear_history()
    return success(data={"records": [], "max": 20})


@router.post("/rag-chat-history", operation_id="rag_chat_history")
async def rag_chat_history_route():
    """Return the in-memory ring of recent RAG chat turns.

    Turns are pushed by ``rag_chat_stream`` after each assistant response
    completes — newest-first, max 20. Mirrors ``/rag-history`` but for
    chat (vs one-shot retrieval). Surfaces the user question, the streamed
    answer, sources, and the retrieval config that produced the turn so
    the Console's History tab can compare chat turns alongside retrieval
    records.
    """
    return success(data={"records": list_chat_history(), "max": 20})


@router.post("/rag-chat-history-clear", operation_id="rag_chat_history_clear")
async def rag_chat_history_clear_route():
    clear_chat_history()
    return success(data={"records": [], "max": 20})


@router.post("/rag-build", operation_id="rag_build")
async def rag_build_route():
    await rebuild_index_async()
    return success(data=rag_status())


@router.post("/rag-chat", operation_id="rag_chat")
async def rag_chat_route(request: RagChatRequest):
    gen = rag_chat_stream(
        request.messages,
        scope=request.scope,
        top_k=request.top_k,
        hybrid=request.hybrid,
        rerank=request.rerank,
        citations=request.citations,
        num_queries=request.num_queries,
        chat_mode=request.chat_mode,
        category=request.category,
        tags=request.tags,
    )
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


@router.post("/rag-decompose", operation_id="rag_decompose")
async def rag_decompose_route(request: RagDecomposeRequest):
    """Sub-question decomposition — llama_index SubQuestionQueryEngine.

    Returns the original question, the synthesized answer, and each
    sub-question with its own sub-answer + sources. The frontend renders
    this as an expandable tree under the RAG Console.
    """
    try:
        result = await asyncio.to_thread(
            rag_decompose,
            request.question,
            request.scope,
            request.sub_q_top_k,
            request.citations,
            request.category,
            request.tags,
        )
        return success(data=result)
    except Exception as e:
        logger.exception(f"RAG decompose failed: {e}")
        return success(data={"original": request.question, "synthesis": "", "sub_questions": [], "error": str(e)})
