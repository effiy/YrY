"""RAG query + chat engines built on top of ``indexer.py``.

Public surface:
    - ``rag_query(question, top_k=None, scope=None)`` → list of source dicts
    - ``rag_chat_stream(messages, scope=None)``       → async generator of SSE frames
    - ``rag_file_query(question, abs_path, top_k)``
    - ``rag_file_chat_stream(question, abs_path)``
"""
from __future__ import annotations

import asyncio
import logging
from typing import Any, Dict, List, Optional

from shared.config import settings

from domain.rag.settings import ensure_settings_configured

logger = logging.getLogger(__name__)


def _source_dict(node_with_score: Any) -> Dict[str, Any]:
    node = getattr(node_with_score, "node", None) or node_with_score
    metadata = dict(getattr(node, "metadata", {}) or {})
    text = getattr(node, "get_content", lambda: "")() or getattr(node, "text", "") or ""
    score = getattr(node_with_score, "score", None)
    file_path = metadata.get("file_path") or metadata.get("filename") or ""
    return {
        "file_path": file_path,
        "score": float(score) if score is not None else 0.0,
        "text": text,
        "metadata": metadata,
    }


def _scope_filters(scope: Optional[str]):
    """Build a MetadataFilters restricting ``file_path`` to contain ``scope``.

    Returns ``None`` when ``scope`` is empty — caller should not pass a
    filter in that case so the retriever uses its default behavior.
    """
    if not scope:
        return None
    from llama_index.core.vector_stores import MetadataFilter, MetadataFilters, FilterOperator
    return MetadataFilters(
        filters=[
            MetadataFilter(
                key="file_path",
                operator=FilterOperator.CONTAINS,
                value=scope,
            )
        ]
    )


def _build_retriever(index: Any, top_k: int, scope: Optional[str], hybrid: bool) -> Any:
    """Build a retriever over ``index``, optionally hybrid (vector + BM25).

    Hybrid uses ``QueryFusionRetriever`` with reciprocal rank fusion so
    queries with strong keywords (where BM25 excels) AND conceptual queries
    (where vector embedding excels) both surface the right docs. When hybrid
    is off, falls back to plain vector retrieval.
    """
    filters = _scope_filters(scope)
    if not hybrid:
        kwargs: Dict[str, Any] = {"similarity_top_k": top_k}
        if filters is not None:
            kwargs["filters"] = filters
        return index.as_retriever(**kwargs)
    from llama_index.core.retrievers import BM25Retriever, QueryFusionRetriever
    bm25_kwargs: Dict[str, Any] = {"similarity_top_k": top_k}
    if filters is not None:
        bm25_kwargs["filters"] = filters
    bm25 = BM25Retriever.from_defaults(index=index, **bm25_kwargs)
    vector_kwargs: Dict[str, Any] = {"similarity_top_k": top_k}
    if filters is not None:
        vector_kwargs["filters"] = filters
    vector = index.as_retriever(**vector_kwargs)
    return QueryFusionRetriever(
        retrievers=[vector, bm25],
        similarity_top_k=top_k,
        num_queries=1,
        mode="reciprocal_rerank",
    )


def _build_postprocessors(rerank_enabled: bool, top_n: int) -> list:
    """Optionally attach ``LLMRerank`` to trim the candidate set to ``top_n``.

    Rerank is off by default — it adds an LLM call per query (~1-2s on
    Ollama) and the hybrid fusion already provides good top-k ordering.
    Enable via ``rag.rerank_enabled: true`` when retrieval quality matters
    more than latency.
    """
    if not rerank_enabled:
        return []
    from llama_index.core.postprocessor import LLMRerank
    return [LLMRerank(top_n=top_n)]


def _build_chat_postprocessors(rerank_enabled: bool, citations_enabled: bool, top_n: int) -> list:
    """Compose the postprocessor chain for ``rag_chat_stream``.

    Order: rerank first (trims candidates), then citation numbering (prepends
    ``[Source N]`` to each remaining chunk so the LLM can cite by number).
    Both are optional; returns ``[]`` when both are off.
    """
    chain: list = []
    if rerank_enabled:
        from llama_index.core.postprocessor import LLMRerank
        chain.append(LLMRerank(top_n=top_n))
    if citations_enabled:
        chain.append(_NumberSourcesPostprocessor())
    return chain


class _NumberSourcesPostprocessor:
    """Prepend ``[Source N]`` (1-indexed) to each retrieved chunk's content.

    Lets the chat LLM emit ``[N]`` markers in its answer that map to the
    ranked source list. The list is sent to the frontend in the same order,
    so ``[N]`` in prose corresponds to the Nth chip in ``RagSources``.

    Clones each node into a fresh ``TextNode`` (preserving id_/metadata/
    relationships) so the docstore entry stays unmutated and future
    ``delete_ref_doc`` calls still find the original chunk.
    """

    def postprocess_nodes(self, nodes: list, query_str: str = None, query_bundle=None) -> list:
        from llama_index.core.schema import TextNode, NodeWithScore
        out: list = []
        for i, nws in enumerate(nodes, start=1):
            node = nws.node
            original = node.get_content() or ""
            new_node = TextNode(
                id_=node.node_id,
                text=f"[Source {i}]\n{original}",
                metadata=dict(getattr(node, "metadata", {}) or {}),
                start_char_idx=getattr(node, "start_char_idx", None),
                end_char_idx=getattr(node, "end_char_idx", None),
                relationships=getattr(node, "relationships", {}) or {},
            )
            out.append(NodeWithScore(node=new_node, score=getattr(nws, "score", None)))
        return out


def rag_query(question: str, top_k: Optional[int] = None, scope: Optional[str] = None) -> List[Dict[str, Any]]:
    """One-shot retrieval — returns ranked source dicts.

    Does NOT call the LLM (unless ``rag_rerank_enabled`` is on, in which case
    ``LLMRerank`` makes one LLM call to trim the candidate set). Useful for
    the "show me sources" UI affordance and for tests that don't want to
    spin up the Ollama LLM for chat.
    """
    from domain.rag.indexer import get_kb_index
    ensure_settings_configured()
    index = get_kb_index()
    k = top_k or settings.rag_top_k
    retriever = _build_retriever(
        index,
        top_k=k,
        scope=scope,
        hybrid=settings.rag_hybrid_retrieval_enabled,
    )
    nodes = retriever.retrieve(question)
    postprocessors = _build_postprocessors(settings.rag_rerank_enabled, k)
    for pp in postprocessors:
        nodes = pp.postprocess_nodes(nodes, query_str=question)
    return [_source_dict(n) for n in nodes]


async def rag_chat_stream(messages: List[Dict[str, Any]], scope: Optional[str] = None):
    """Stream a RAG-grounded chat completion.

    Yields SSE-shaped dicts mirroring ``domain/ai/chat.py:gen()``:
      ``{"data": {"message": delta}}`` for content deltas
      ``{"data": {"sources": [...]}}`` once after the final answer
      ``{"done": True}`` terminates the stream
    On error: yields ``{"error": str}``.

    Init failures (``get_kb_index`` / retriever / LLM / chat-engine
    construction) are yielded as ``{"error": ...}`` before termination.
    Without this, ``_stream_async``'s ``finally`` would emit only
    ``{"done": True}`` and the client would silently see an empty turn.
    """
    from domain.rag.indexer import get_kb_index
    from llama_index.core.chat_engine import CondensePlusContextChatEngine
    from llama_index.core.base.llms.types import ChatMessage, MessageRole

    try:
        ensure_settings_configured()
        index = get_kb_index()
        retriever = _build_retriever(
            index,
            top_k=settings.rag_top_k,
            scope=scope,
            hybrid=settings.rag_hybrid_retrieval_enabled,
        )
    except Exception as e:
        yield {"error": f"RAG chat init failed: {e}"}
        return

    role_map = {"user": MessageRole.USER, "assistant": MessageRole.ASSISTANT, "system": MessageRole.SYSTEM}
    history: List[ChatMessage] = []
    for m in messages[:-1]:
        r = role_map.get(m.get("role", "user"), MessageRole.USER)
        history.append(ChatMessage(role=r, content=m.get("content", "")))
    last_user = messages[-1] if messages else None
    user_text = (last_user or {}).get("content", "") if last_user else ""

    try:
        chat_engine = CondensePlusContextChatEngine.from_defaults(
            retriever=retriever,
            node_postprocessors=_build_chat_postprocessors(settings.rag_rerank_enabled, settings.rag_inline_citations_enabled, settings.rag_top_k),
            chat_history=history,
            system_prompt=(
                "You are a helpful assistant answering questions strictly from the "
                "provided YiKnowledge context. Each context chunk is prefixed with "
                "[Source N] where N matches the 1-indexed position of the source in "
                "the list displayed under your answer. When a factual claim is drawn "
                "from the context, append a citation marker like [1] or [2] at the "
                "end of the sentence. Do not invent citations — if a claim is not "
                "in the context, say so briefly without a marker."
            ),
        )
    except Exception as e:
        yield {"error": f"RAG chat init failed: {e}"}
        return

    loop = asyncio.get_running_loop()
    queue: asyncio.Queue = asyncio.Queue()

    def _worker():
        try:
            response = chat_engine.stream_chat(user_text)
            source_nodes = []
            for token in response.response_gen:
                if token:
                    asyncio.run_coroutine_threadsafe(queue.put({"data": {"message": token}}), loop)
            try:
                source_nodes = list(response.source_nodes or [])
            except Exception:
                source_nodes = []
            sources = [_source_dict(n) for n in source_nodes]
            asyncio.run_coroutine_threadsafe(queue.put({"data": {"sources": sources}}), loop)
        except Exception as e:
            asyncio.run_coroutine_threadsafe(queue.put({"error": f"RAG chat failed: {e}"}), loop)
        finally:
            asyncio.run_coroutine_threadsafe(queue.put(None), loop)

    asyncio.create_task(asyncio.to_thread(_worker))

    while True:
        item = await queue.get()
        if item is None:
            break
        yield item


def rag_file_query(question: str, abs_path: str, top_k: Optional[int] = None) -> List[Dict[str, Any]]:
    from domain.rag.indexer import build_file_index
    ensure_settings_configured()
    index = build_file_index(abs_path)
    k = top_k or settings.rag_top_k
    retriever = index.as_retriever(similarity_top_k=k)
    nodes = retriever.retrieve(question)
    return [_source_dict(n) for n in nodes]


async def rag_file_chat_stream(question: str, abs_path: str):
    """Stream chat grounded in a single file's index — no scope filtering needed."""
    from domain.rag.indexer import build_file_index
    from llama_index.core.chat_engine import CondensePlusContextChatEngine

    try:
        ensure_settings_configured()
        index = build_file_index(abs_path)
        retriever = index.as_retriever(similarity_top_k=settings.rag_top_k)
    except Exception as e:
        yield {"error": f"RAG file chat init failed: {e}"}
        return

    try:
        chat_engine = CondensePlusContextChatEngine.from_defaults(
            retriever=retriever,
            system_prompt="Answer the user's question from the content of the provided file only.",
        )
    except Exception as e:
        yield {"error": f"RAG file chat init failed: {e}"}
        return

    loop = asyncio.get_running_loop()
    queue: asyncio.Queue = asyncio.Queue()

    def _worker():
        try:
            response = chat_engine.stream_chat(question)
            for token in response.response_gen:
                if token:
                    asyncio.run_coroutine_threadsafe(queue.put({"data": {"message": token}}), loop)
            try:
                sources = [_source_dict(n) for n in (response.source_nodes or [])]
            except Exception:
                sources = []
            asyncio.run_coroutine_threadsafe(queue.put({"data": {"sources": sources}}), loop)
        except Exception as e:
            asyncio.run_coroutine_threadsafe(queue.put({"error": f"RAG file chat failed: {e}"}), loop)
        finally:
            asyncio.run_coroutine_threadsafe(queue.put(None), loop)

    asyncio.create_task(asyncio.to_thread(_worker))

    while True:
        item = await queue.get()
        if item is None:
            break
        yield item
