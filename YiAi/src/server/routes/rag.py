"""RAG endpoints — route layer.

Four flat POST routes mirroring ``knowledge.py``'s style:
  - /rag-query   → one-shot retrieval (no LLM)
  - /rag-status  → index build status
  - /rag-build   → trigger rebuild (async, runs in thread)
  - /rag-chat    → SSE streaming chat with sources frame
  - /rag-file-query → single-file retrieval
  - /rag-file-chat  → SSE single-file chat
"""
import asyncio
import logging

from fastapi import APIRouter, Body
from fastapi.responses import StreamingResponse

from domain.rag import (
    clear_chat_history,
    clear_history,
    list_chat_history,
    list_history,
    rag_categories,
    rag_chat_stream,
    rag_decompose,
    rag_file_chat_stream,
    rag_file_query,
    rag_query,
    rag_status,
    rebuild_index,
    resolve_safe,
)
from models.schemas import (
    RagChatRequest,
    RagDecomposeRequest,
    RagFileChatRequest,
    RagFileQueryRequest,
    RagQueryRequest,
)
from shared.cache import cache
from shared.cache_keys import CACHE_TTL
from shared.config import settings
from shared.response import success
from shared.sse_utils import stream_async as _stream_async

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/rag-query", operation_id="rag_query")
async def rag_query_route(request: RagQueryRequest):
    try:
        sources = await rag_query(
            request.question,
            request.top_k,
            request.scope,
            request.hybrid,
            request.rerank,
            request.citations,
            request.num_queries,
            request.category,
            request.tags,
            hyde=request.hyde if request.hyde is not None else settings.rag_hyde_enabled,
            file_paths=request.file_paths,
        )
        return success(data={"sources": sources})
    except Exception as e:
        logger.exception(f"RAG query failed: {e}")
        return success(data={"sources": [], "error": str(e)})


@router.post("/rag-status", operation_id="rag_status")
async def rag_status_route():
    cache_key = "rag:status"
    data = await cache.get_or_set(cache_key, rag_status, ttl=CACHE_TTL["rag:status"])
    return success(data=data, cache_ttl=CACHE_TTL["rag:status"])


@router.post("/rag-categories", operation_id="rag_categories")
async def rag_categories_route():
    cache_key = "rag:categories"

    async def _factory():
        return await asyncio.to_thread(rag_categories)

    data = await cache.get_or_set(cache_key, _factory, ttl=CACHE_TTL["knowledge:scan"])
    return success(data=data, cache_ttl=CACHE_TTL["knowledge:scan"])


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


@router.post("/rag-history-persistent", operation_id="rag_history_persistent")
async def rag_history_persistent_route(
    limit: int = Body(50, embed=True),
    before_ts: float | None = Body(None, embed=True),
    scope: str = Body("", embed=True),
    record_type: str = Body("retrieval", embed=True),
):
    """Paginated RAG history from MongoDB — survives server restarts.

    Supports cursor-based pagination via ``before_ts`` (Unix timestamp).
    ``record_type``: "retrieval" | "chat".
    """
    from data.rag_history import list_chat_history, list_retrieval_history
    try:
        if record_type == "chat":
            records = await list_chat_history(limit=min(limit, 200), before_ts=before_ts, scope=scope)
        else:
            records = await list_retrieval_history(limit=min(limit, 200), before_ts=before_ts, scope=scope)
        return success(data={"records": records, "limit": limit, "type": record_type})
    except Exception as e:
        logger.exception(f"Failed to list persistent RAG history: {e}")
        return success(data={"records": [], "error": str(e)})


@router.post("/rag-analytics", operation_id="rag_analytics")
async def rag_analytics_route(
    window: str = Body("7d", embed=True),
):
    """Aggregated RAG quality metrics over a time window.

    ``window``: "24h" | "7d" | "30d". Returns avg latency, avg top_score,
    query count, zero-result rate, and source grade distribution.
    """
    from data.rag_history import get_rag_analytics
    cache_key = f"rag:analytics:{window}"
    data = await cache.get_or_set(cache_key, lambda: get_rag_analytics(window), ttl=300)
    return success(data=data)


@router.post("/rag-config-update", operation_id="rag_config_update")
async def rag_config_update_route(
    top_k: int | None = Body(None, embed=True),
    hybrid_retrieval_enabled: bool | None = Body(None, embed=True),
    rerank_enabled: bool | None = Body(None, embed=True),
    inline_citations_enabled: bool | None = Body(None, embed=True),
    hyde_enabled: bool | None = Body(None, embed=True),
    chunk_size: int | None = Body(None, embed=True),
    chunk_overlap: int | None = Body(None, embed=True),
    auto_rebuild_enabled: bool | None = Body(None, embed=True),
):
    """Update RAG configuration at runtime without editing config.yaml.

    Only the provided fields are updated; others remain unchanged. Changes
    take effect on the next RAG request (settings are read per-request).
    """
    updated: list[str] = []
    if top_k is not None and 1 <= top_k <= 50:
        settings.rag_top_k = top_k
        updated.append("top_k")
    if hybrid_retrieval_enabled is not None:
        settings.rag_hybrid_retrieval_enabled = hybrid_retrieval_enabled
        updated.append("hybrid_retrieval_enabled")
    if rerank_enabled is not None:
        settings.rag_rerank_enabled = rerank_enabled
        updated.append("rerank_enabled")
    if inline_citations_enabled is not None:
        settings.rag_inline_citations_enabled = inline_citations_enabled
        updated.append("inline_citations_enabled")
    if hyde_enabled is not None:
        settings.rag_hyde_enabled = hyde_enabled
        updated.append("hyde_enabled")
    if chunk_size is not None and 128 <= chunk_size <= 4096:
        settings.rag_chunk_size = chunk_size
        updated.append("chunk_size")
    if chunk_overlap is not None and 0 <= chunk_overlap <= 1024:
        settings.rag_chunk_overlap = chunk_overlap
        updated.append("chunk_overlap")
    if auto_rebuild_enabled is not None:
        settings.rag_auto_rebuild_enabled = auto_rebuild_enabled
        updated.append("auto_rebuild_enabled")
    await cache.delete("rag:status")
    return success(data={"updated": updated, "config": rag_status()["config"]})


@router.post("/rag-build", operation_id="rag_build")
async def rag_build_route():
    # Fire-and-forget via thread — the index build can take 10+ minutes
    # with local nomic-embed-text. The frontend polls /rag-status.
    await cache.delete("rag:status")
    await cache.delete("rag:categories")
    import threading
    threading.Thread(target=rebuild_index, daemon=True).start()
    return success(data=rag_status())


@router.post("/rag-chat", operation_id="rag_chat")
async def rag_chat_route(request: RagChatRequest):
    gen = rag_chat_stream(
        request.messages,
        model=request.model,
        scope=request.scope,
        file_paths=request.file_paths,
        context_notes=request.context_notes,
        top_k=request.top_k,
        hybrid=request.hybrid,
        rerank=request.rerank,
        citations=request.citations,
        num_queries=request.num_queries,
        chat_mode=request.chat_mode.value if request.chat_mode else None,
        category=request.category,
        tags=request.tags,
        hyde_enabled=request.hyde if request.hyde is not None else settings.rag_hyde_enabled,
        web_search=request.web_search,
        fast=request.fast,
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
            request.file_paths,
        )
        return success(data=result)
    except Exception as e:
        logger.exception(f"RAG decompose failed: {e}")
        return success(data={"original": request.question, "synthesis": "", "sub_questions": [], "error": str(e)})


# ── Chat session persistence (Pi-inspired session management) ──────────────


@router.post("/chat-sessions", operation_id="chat_sessions_list")
async def chat_sessions_list():
    """List recent chat sessions (newest first)."""
    from data.chat_records import list_chat_sessions
    try:
        sessions = await list_chat_sessions()
        return success(data={"sessions": sessions})
    except Exception as e:
        logger.exception(f"Failed to list chat sessions: {e}")
        return success(data={"sessions": [], "error": str(e)})


@router.post("/chat-session-load", operation_id="chat_session_load")
async def chat_session_load(session_id: str = Body("", embed=True)):
    """Load a single chat session's full message history."""
    from data.chat_records import load_chat_session
    try:
        if not session_id:
            return success(data={"session": None, "error": "session_id required"})
        session = await load_chat_session(session_id)
        return success(data={"session": session})
    except Exception as e:
        logger.exception(f"Failed to load chat session: {e}")
        return success(data={"session": None, "error": str(e)})


@router.post("/chat-session-delete", operation_id="chat_session_delete")
async def chat_session_delete(session_id: str = Body("", embed=True)):
    """Delete a chat session."""
    from data.chat_records import delete_chat_session
    try:
        if not session_id:
            return success(data={"deleted": False, "error": "session_id required"})
        deleted = await delete_chat_session(session_id)
        return success(data={"deleted": deleted})
    except Exception as e:
        logger.exception(f"Failed to delete chat session: {e}")
        return success(data={"deleted": False, "error": str(e)})
