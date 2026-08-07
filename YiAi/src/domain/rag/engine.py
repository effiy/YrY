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


def _scope_filters(scope: Optional[str], category: Optional[str] = None, tags: Optional[List[str]] = None):
    """Build a MetadataFilters restricting retrieved chunks by frontmatter.

    Combines (AND) any of:
      - ``file_path`` CONTAINS ``scope`` (substring on path)
      - ``category`` TEXT_MATCH ``category`` (exact category)
      - ``tags`` TEXT_MATCH each tag (one filter per tag, AND-combined)

    Returns ``None`` when no filters apply — caller should not pass a
    filter in that case so the retriever uses its default behavior.
    """
    filters: List[Any] = []
    if scope:
        from llama_index.core.vector_stores import MetadataFilter, FilterOperator
        filters.append(MetadataFilter(
            key="file_path",
            operator=FilterOperator.CONTAINS,
            value=scope,
        ))
    if category:
        from llama_index.core.vector_stores import MetadataFilter, FilterOperator
        filters.append(MetadataFilter(
            key="category",
            operator=FilterOperator.TEXT_MATCH,
            value=category,
        ))
    if tags:
        from llama_index.core.vector_stores import MetadataFilter, FilterOperator
        for t in tags:
            filters.append(MetadataFilter(
                key="tags",
                operator=FilterOperator.TEXT_MATCH,
                value=t,
            ))
    if not filters:
        return None
    from llama_index.core.vector_stores import MetadataFilters
    return MetadataFilters(filters=filters)


def _build_retriever(index: Any, top_k: int, scope: Optional[str], hybrid: bool, num_queries: int = 1, category: Optional[str] = None, tags: Optional[List[str]] = None) -> Any:
    """Build a retriever over ``index``, optionally hybrid (vector + BM25).

    Hybrid uses ``QueryFusionRetriever`` with reciprocal rank fusion so
    queries with strong keywords (where BM25 excels) AND conceptual queries
    (where vector embedding excels) both surface the right docs.

    When a scope/category/tag filter is active, hybrid is disabled because
    BM25Retriever does not support metadata filters — falling back to pure
    vector retrieval ensures only documents matching the filters are returned.

    ``num_queries`` controls LLM-generated query variants inside the fusion
    retriever (llama_index's multi-query expansion). ``1`` = no variant
    generation (just the user's query). ``>1`` makes the LLM produce N
    paraphrases which are fused via reciprocal rank — useful for ambiguous
    or under-specified questions. Only honored when hybrid is active and
    no metadata filter is applied; ignored otherwise (mirrors the hybrid guard).
    """
    filters = _scope_filters(scope, category, tags)
    # BM25 doesn't support metadata filters — fall back to vector-only when filtered
    if not hybrid or filters is not None:
        kwargs: Dict[str, Any] = {"similarity_top_k": top_k}
        if filters is not None:
            kwargs["filters"] = filters
        return index.as_retriever(**kwargs)
    from llama_index.core.retrievers import QueryFusionRetriever
    from llama_index.retrievers.bm25 import BM25Retriever
    bm25 = BM25Retriever.from_defaults(index=index, similarity_top_k=top_k)
    vector = index.as_retriever(similarity_top_k=top_k)
    nq = max(1, int(num_queries or 1))
    return QueryFusionRetriever(
        retrievers=[vector, bm25],
        similarity_top_k=top_k,
        num_queries=nq,
        mode="reciprocal_rerank",
        use_async=True,
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


def rag_query(
    question: str,
    top_k: Optional[int] = None,
    scope: Optional[str] = None,
    hybrid: Optional[bool] = None,
    rerank: Optional[bool] = None,
    citations: Optional[bool] = None,
    num_queries: Optional[int] = None,
    category: Optional[str] = None,
    tags: Optional[List[str]] = None,
) -> List[Dict[str, Any]]:
    """One-shot retrieval — returns ranked source dicts.

    Does NOT call the LLM (unless ``rerank`` is on or ``num_queries`` > 1,
    in which case the LLM is invoked for reranking / query expansion). Useful
    for the "show me sources" UI affordance and for tests that don't want to
    spin up the Ollama LLM for chat.

    ``hybrid``/``rerank``/``citations`` overrides are per-call booleans that
    fall back to ``settings.*`` when ``None`` — lets the RAG Console toggle
    retrieval behaviour at query time without touching config.yaml.
    ``num_queries`` overrides QueryFusionRetriever's LLM query-variant count
    (default 1 = no expansion). Only honored when hybrid is active and no
    metadata filter is applied — silently ignored otherwise.
    ``category``/``tags`` build additional MetadataFilters (AND-combined
    with scope) so the user can narrow retrieval by frontmatter. Like scope,
    metadata filters disable hybrid (BM25 doesn't support them).
    """
    from domain.rag.indexer import get_kb_index
    from domain.rag.history import record_query
    ensure_settings_configured()
    index = get_kb_index()
    k = top_k or settings.rag_top_k
    h = settings.rag_hybrid_retrieval_enabled if hybrid is None else hybrid
    r = settings.rag_rerank_enabled if rerank is None else rerank
    c = settings.rag_inline_citations_enabled if citations is None else citations
    nq = num_queries if num_queries is not None and num_queries > 0 else 1
    retriever = _build_retriever(
        index,
        top_k=k,
        scope=scope,
        hybrid=h,
        num_queries=nq,
        category=category,
        tags=tags,
    )
    t0 = __import__("time").perf_counter()
    nodes = retriever.retrieve(question)
    postprocessors = _build_postprocessors(r, k)
    for pp in postprocessors:
        nodes = pp.postprocess_nodes(nodes, query_str=question)
    if c:
        # Inline-citation numbering for the standalone query path mirrors
        # the chat engine's _NumberSourcesPostprocessor so [Source N]
        # markers in displayed snippets match what the chat LLM would see.
        nodes = _NumberSourcesPostprocessor().postprocess_nodes(nodes, query_str=question)
    sources = [_source_dict(n) for n in nodes]
    record_query(
        question=question,
        scope=scope or "",
        top_k=k,
        sources=sources,
        latency_ms=round((__import__("time").perf_counter() - t0) * 1000),
        hybrid=h,
        rerank=r,
        citations=c,
        num_queries=nq,
        category=category or "",
        tags=tags,
    )
    return sources


async def rag_chat_stream(
    messages: List[Dict[str, Any]],
    scope: Optional[str] = None,
    top_k: Optional[int] = None,
    hybrid: Optional[bool] = None,
    rerank: Optional[bool] = None,
    citations: Optional[bool] = None,
    num_queries: Optional[int] = None,
    chat_mode: Optional[str] = None,
    category: Optional[str] = None,
    tags: Optional[List[str]] = None,
):
    """Stream a RAG-grounded chat completion.

    Yields SSE-shaped dicts mirroring ``domain/ai/chat.py:gen()``:
      ``{"data": {"message": delta}}`` for content deltas
      ``{"data": {"sources": [...]}}`` once after the final answer
      ``{"data": {"phase": "retrieving"}}`` before retrieval starts
      ``{"done": True}`` terminates the stream
    On error: yields ``{"error": str}``.

    Init failures (``get_kb_index`` / retriever / LLM / chat-engine
    construction) are yielded as ``{"error": ...}`` before termination.
    Without this, ``_stream_async``'s ``finally`` would emit only
    ``{"done": True}`` and the client would silently see an empty turn.

    ``hybrid``/``rerank``/``citations``/``top_k``/``num_queries`` overrides
    are per-call and fall back to ``settings.*`` (or 1 for num_queries) when
    ``None``.

    ``chat_mode`` selects the llama_index chat engine:
      - ``condense_plus_context`` (default): multi-turn condense + context
      - ``condense_question``: condense history to a single query, then retrieve
      - ``context``: last-user + context only (no condense of history)
      - ``simple``: plain LLM, no retrieval — useful as a baseline
    """
    from domain.rag.indexer import get_kb_index
    from llama_index.core.chat_engine import (
        CondensePlusContextChatEngine,
        CondenseQuestionChatEngine,
        ContextChatEngine,
        SimpleChatEngine,
    )
    from llama_index.core.base.llms.types import ChatMessage, MessageRole

    try:
        ensure_settings_configured()
        index = get_kb_index()
        k = top_k or settings.rag_top_k
        h = settings.rag_hybrid_retrieval_enabled if hybrid is None else hybrid
        r = settings.rag_rerank_enabled if rerank is None else rerank
        c = settings.rag_inline_citations_enabled if citations is None else citations
        nq = num_queries if num_queries is not None and num_queries > 0 else 1
        retriever = _build_retriever(
            index,
            top_k=k,
            scope=scope,
            hybrid=h,
            num_queries=nq,
            category=category,
            tags=tags,
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

    mode = (chat_mode or "condense_plus_context").strip().lower()
    citation_system_prompt = (
        "You are a helpful assistant answering questions strictly from the "
        "provided YiKnowledge context. Each context chunk is prefixed with "
        "[Source N] where N matches the 1-indexed position of the source in "
        "the list displayed under your answer. When a factual claim is drawn "
        "from the context, append a citation marker like [1] or [2] at the "
        "end of the sentence. Do not invent citations — if a claim is not "
        "in the context, say so briefly without a marker."
    )

    try:
        if mode == "simple":
            # Plain LLM, no retrieval — baseline for A/B comparison.
            chat_engine = SimpleChatEngine.from_defaults(chat_history=history)
        elif mode == "context":
            # Last-user + context only, no condense of history.
            chat_engine = ContextChatEngine.from_defaults(
                retriever=retriever,
                node_postprocessors=_build_chat_postprocessors(r, c, k),
                chat_history=history,
                system_prompt=citation_system_prompt,
            )
        elif mode == "condense_question":
            # Condense history to a single query, then retrieve + answer.
            chat_engine = CondenseQuestionChatEngine.from_defaults(
                retriever=retriever,
                node_postprocessors=_build_chat_postprocessors(r, c, k),
                chat_history=history,
                system_prompt=citation_system_prompt,
            )
        else:
            # Default: multi-turn condense + context.
            chat_engine = CondensePlusContextChatEngine.from_defaults(
                retriever=retriever,
                node_postprocessors=_build_chat_postprocessors(r, c, k),
                chat_history=history,
                system_prompt=citation_system_prompt,
            )
    except Exception as e:
        yield {"error": f"RAG chat init failed: {e}"}
        return

    loop = asyncio.get_running_loop()
    queue: asyncio.Queue = asyncio.Queue()

    def _worker():
        try:
            # Signal "retrieval + synthesis about to start" so the frontend
            # can refine the "thinking" phase into "retrieving". The actual
            # retrieval happens lazily on the first iteration of
            # response_gen below, so this frame is emitted just before.
            # SimpleChatEngine doesn't retrieve — skip the frame so the UI
            # stays in "thinking" until the first token arrives.
            if mode != "simple":
                asyncio.run_coroutine_threadsafe(queue.put({"data": {"phase": "retrieving"}}), loop)
            import time as _time
            _t0 = _time.perf_counter()
            response = chat_engine.stream_chat(user_text)
            source_nodes = []
            answer_buf: List[str] = []
            for token in response.response_gen:
                if token:
                    answer_buf.append(token)
                    asyncio.run_coroutine_threadsafe(queue.put({"data": {"message": token}}), loop)
            _latency_ms = round((_time.perf_counter() - _t0) * 1000)
            try:
                source_nodes = list(response.source_nodes or [])
            except Exception:
                source_nodes = []
            sources = [_source_dict(n) for n in source_nodes]
            asyncio.run_coroutine_threadsafe(queue.put({"data": {"sources": sources}}), loop)
            # Record the completed turn for the Chat History tab. Mirrors
            # ``history.record_query`` for retrieval; only fires after the
            # stream finishes so partial/aborted turns don't pollute the ring.
            try:
                from domain.rag.chat_history import record_chat_turn

                record_chat_turn(
                    question=user_text,
                    answer="".join(answer_buf),
                    sources=sources,
                    scope=scope or "",
                    chat_mode=mode,
                    latency_ms=_latency_ms,
                    hybrid=h,
                    rerank=r,
                    citations=c,
                    num_queries=nq,
                    category=category or "",
                    tags=tags,
                )
            except Exception:
                logger.warning("Failed to record chat turn", exc_info=True)
        except Exception as e:
            asyncio.run_coroutine_threadsafe(queue.put({"error": f"RAG chat failed: {e}"}), loop)
        finally:
            asyncio.run_coroutine_threadsafe(queue.put(None), loop)

    asyncio.create_task(asyncio.to_thread(_worker))

    timeout = getattr(settings, "rag_chat_timeout", 300) or 300
    while True:
        try:
            item = await asyncio.wait_for(queue.get(), timeout=timeout)
        except asyncio.TimeoutError:
            yield {"error": f"RAG chat request timed out after {timeout}s"}
            break
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


def rag_decompose(
    question: str,
    scope: Optional[str] = None,
    sub_q_top_k: Optional[int] = None,
    citations: Optional[bool] = None,
    category: Optional[str] = None,
    tags: Optional[List[str]] = None,
) -> Dict[str, Any]:
    """Sub-question decomposition via ``SubQuestionQueryEngine``.

    Breaks a complex question into sub-questions, runs each through the
    retriever, and returns the synthesized sub-answers with their source
    citations. Synthesis runs synchronously (no streaming) since the
    engine composes multiple LLM calls internally and structured output
    parsing is easier without a token stream.

    Returns:
        ``{
            "original": str,
            "synthesis": str | None,      # final combined answer
            "sub_questions": [
                {"sub_q": str, "answer": str, "sources": List[Dict]}
            ]
        }``

    ``citations`` overrides settings.rag_inline_citations_enabled; when on,
    `_NumberSourcesPostprocessor` is attached to the inner query engine so
    each sub-question's chunks carry `[Source N]` prefixes that the
    synthesis LLM can cite by number.
    """
    from domain.rag.indexer import get_kb_index
    from llama_index.core.tools import QueryEngineTool, ToolMetadata
    from llama_index.core.query_engine import SubQuestionQueryEngine

    ensure_settings_configured()
    index = get_kb_index()
    k = sub_q_top_k or settings.rag_top_k
    c = settings.rag_inline_citations_enabled if citations is None else citations

    # Scope + category + tags filters — same MetadataFilters plumbing as
    # rag_query / rag_chat_stream. The sub-question engine handles its own
    # multi-query fan-out; hybrid is not wired in here.
    filters = _scope_filters(scope, category=category, tags=tags)
    postprocessors: list = []
    if c:
        postprocessors.append(_NumberSourcesPostprocessor())
    if filters is not None:
        query_engine = index.as_query_engine(
            similarity_top_k=k, filters=filters, node_postprocessors=postprocessors
        )
    else:
        query_engine = index.as_query_engine(
            similarity_top_k=k, node_postprocessors=postprocessors
        )

    tool = QueryEngineTool(
        query_engine=query_engine,
        metadata=ToolMetadata(
            name="yiknowledge",
            description="YiKnowledge markdown tree — project docs, lessons, templates, reports.",
        ),
    )
    sub_engine = SubQuestionQueryEngine.from_defaults(query_engine_tools=[tool])

    response = sub_engine.query(question)
    sub_q_responses = getattr(response, "sub_q_responses", None) or []
    sub_questions: List[Dict[str, Any]] = []
    for sr in sub_q_responses:
        sub_q = getattr(sr, "sub_q", "") or ""
        answer = getattr(sr, "response", None)
        answer_text = ""
        if answer is not None:
            answer_text = getattr(answer, "response", None) or str(answer)
        nodes = getattr(sr, "source_nodes", None) or []
        sources = [_source_dict(n) for n in nodes]
        sub_questions.append({
            "sub_q": sub_q,
            "answer": answer_text,
            "sources": sources,
        })

    return {
        "original": question,
        "synthesis": getattr(response, "response", None) or "",
        "sub_questions": sub_questions,
    }


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
            asyncio.run_coroutine_threadsafe(queue.put({"data": {"phase": "retrieving"}}), loop)
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

    timeout = getattr(settings, "rag_chat_timeout", 300) or 300
    while True:
        try:
            item = await asyncio.wait_for(queue.get(), timeout=timeout)
        except asyncio.TimeoutError:
            yield {"error": f"RAG chat request timed out after {timeout}s"}
            break
        if item is None:
            break
        yield item
