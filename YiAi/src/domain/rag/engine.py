"""RAG query + chat engines built on top of ``indexer.py``.

Public surface:
    - ``rag_query(question, top_k=None, scope=None)`` → list of source dicts
    - ``rag_chat_stream(messages, scope=None)``       → async generator of SSE frames
    - ``rag_file_query(question, abs_path, top_k)``
    - ``rag_file_chat_stream(question, abs_path)``
"""
from __future__ import annotations

import asyncio
import json
import logging
import time
from typing import Any, AsyncIterator, Dict, List, Optional

import httpx
from shared.config import settings

from domain.rag.settings import ensure_settings_configured

from llama_index.core.vector_stores import MetadataFilter, MetadataFilters, FilterOperator

logger = logging.getLogger(__name__)

# BM25 retriever cache — building from all nodes is O(N) and was done on every
# request. Cache keyed by id(index) so a rebuild (new index object) invalidates.
_bm25_cache: Dict[int, Any] = {}
_bm25_cache_top_k: Dict[int, int] = {}


def _cached_bm25(index: Any, top_k: int) -> Any:
    """Return a cached BM25Retriever for *index*, rebuilding only when the index
    object changes or *top_k* differs from the cached value."""
    idx_id = id(index)
    if idx_id in _bm25_cache and _bm25_cache_top_k.get(idx_id) == top_k:
        return _bm25_cache[idx_id]
    from llama_index.retrievers.bm25 import BM25Retriever
    bm25 = BM25Retriever.from_defaults(index=index, similarity_top_k=top_k)
    _bm25_cache[idx_id] = bm25
    _bm25_cache_top_k[idx_id] = top_k
    # Prune old entries when the index was rebuilt (keep only current)
    stale = [k for k in _bm25_cache if k != idx_id]
    for k in stale:
        _bm25_cache.pop(k, None)
        _bm25_cache_top_k.pop(k, None)
    return bm25


def _safe_put(queue: asyncio.Queue, item: Any, loop: asyncio.AbstractEventLoop) -> bool:
    """Thread-safe queue put that silently drops when the event loop is closed.

    Returns ``True`` if the item was enqueued, ``False`` if it was dropped
    (loop closed — the client disconnected and the stream generator already
    exited). Callers in worker threads should prefer this over raw
    ``run_coroutine_threadsafe`` so a late-arriving result doesn't crash
    the worker on a closed loop.
    """
    try:
        asyncio.run_coroutine_threadsafe(queue.put(item), loop)
        return True
    except RuntimeError:
        return False


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
        filters.append(MetadataFilter(
            key="file_path",
            operator=FilterOperator.CONTAINS,
            value=scope,
        ))
    if category:
        filters.append(MetadataFilter(
            key="category",
            operator=FilterOperator.TEXT_MATCH,
            value=category,
        ))
    if tags:
        for t in tags:
            filters.append(MetadataFilter(
                key="tags",
                operator=FilterOperator.TEXT_MATCH,
                value=t,
            ))
    if not filters:
        return None
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
    bm25 = _cached_bm25(index, top_k)
    vector = index.as_retriever(similarity_top_k=top_k)
    nq = max(1, int(num_queries or 1))
    return QueryFusionRetriever(
        retrievers=[vector, bm25],
        similarity_top_k=top_k,
        num_queries=nq,
        mode="reciprocal_rerank",
        use_async=True,
    )


def _build_postprocessors(rerank_enabled: bool, top_n: int, sentence_window: bool = False) -> list:
    """Optionally attach ``LLMRerank`` and/or ``MetadataReplacementPostProcessor``.

    Rerank is off by default — it adds an LLM call per query (~1-2s on
    Ollama) and the hybrid fusion already provides good top-k ordering.
    Enable via ``rag.rerank_enabled: true`` when retrieval quality matters
    more than latency.

    ``MetadataReplacementPostProcessor`` expands sentence-window nodes to
    their full context window — each embedding is a single sentence, but the
    LLM sees the surrounding sentences. Only added when the index was built
    with ``SentenceWindowNodeParser``.
    """
    postprocessors: list = []
    if sentence_window:
        from llama_index.core.postprocessor import MetadataReplacementPostProcessor
        postprocessors.append(MetadataReplacementPostProcessor(
            target_metadata_key="window"
        ))
    if rerank_enabled:
        from llama_index.core.postprocessor import LLMRerank
        postprocessors.append(LLMRerank(top_n=top_n))
    return postprocessors


# ── Shared HTTP client (connection pooling) ───────────────────────────────

_http_client: httpx.AsyncClient | None = None


def _get_http_client() -> httpx.AsyncClient:
    """Lazy-init a shared httpx client with connection pooling."""
    global _http_client
    if _http_client is None or _http_client.is_closed:
        _http_client = httpx.AsyncClient(
            timeout=httpx.Timeout(120.0, connect=10.0),
            limits=httpx.Limits(max_keepalive_connections=5, max_connections=20),
        )
    return _http_client


# ── Async Ollama helpers ──────────────────────────────────────────────────


async def _stream_ollama_chat(
    model: str,
    messages: List[Dict[str, Any]],
    base_url: str,
    timeout: float = 120.0,
) -> AsyncIterator[Dict[str, Any]]:
    """Stream chat completion from Ollama via ``AsyncClient``.

    Yields ``{"data": {"message": str}}`` for content deltas and
    ``{"data": {"usage": {...}}}`` for the final token-usage frame.
    """
    from ollama import AsyncClient

    client = AsyncClient(host=base_url)
    try:
        async for chunk in await client.chat(
            model=model,
            messages=messages,
            stream=True,
            options={
                "temperature": settings.rag_temperature,
                "num_predict": settings.rag_num_predict,
            },
        ):
            msg = chunk.get("message") or {}
            content = msg.get("content") or msg.get("thinking") or ""
            if content:
                yield {"data": {"message": content}}
            if chunk.get("done") and (chunk.get("eval_count") or chunk.get("prompt_eval_count")):
                yield {
                    "data": {
                        "usage": {
                            "prompt_tokens": chunk.get("prompt_eval_count", 0),
                            "completion_tokens": chunk.get("eval_count", 0),
                            "total_tokens": chunk.get("prompt_eval_count", 0) + chunk.get("eval_count", 0),
                        }
                    }
                }
    except Exception as e:
        logger.error(f"Ollama AsyncClient.chat failed: {e}")
        raise


async def _check_ollama(model: str, base_url: str) -> tuple[bool, str]:
    """Quick preflight check — is Ollama reachable and the model loaded?"""
    try:
        client = _get_http_client()
        r = await client.get(f"{base_url}/api/tags", timeout=httpx.Timeout(5.0))
        r.raise_for_status()
        models = [m.get("name", "") for m in (r.json().get("models", []) or [])]
        # Model name may include tag suffix like "qwen3.5:4b" or "qwen3.5:latest"
        base = model.split(":")[0]
        for m in models:
            if m == model or m.startswith(f"{base}:"):
                return True, m
        return False, f"model {model} not found in {models}"
    except Exception as e:
        return False, str(e)


# ── Context builder ───────────────────────────────────────────────────────

# Default system prompt for RAG chat — instructs the model to ground answers
# in retrieved context, cite sources, and acknowledge knowledge gaps.
# Inspired by llama_index's CondensePlusContextChatEngine system prompt.
RAG_SYSTEM_PROMPT = (
    "You are a knowledgeable assistant that answers questions based on the "
    "provided context. Follow these rules:\n"
    "1. Answer using ONLY information from the context below.\n"
    "2. If the context doesn't contain enough information, say so clearly.\n"
    "3. Cite sources using [N] markers when referencing specific chunks.\n"
    "4. Keep answers concise and well-structured.\n"
    "5. When the context is in Chinese, answer in Chinese. When in English, "
    "answer in English."
)


async def _condense_question_llm(
    question: str,
    history: List[Dict[str, Any]],
    model: str,
    base_url: str,
) -> str:
    """Use LLM to condense chat history + question into a standalone query.

    Mirrors llama_index's ``CondensePlusContextChatEngine._condense_question``.
    Resolves pronouns (it/they/this) and incorporates relevant details from
    earlier turns so the retrieval query is self-contained.
    Only called when ``chat_mode == "condense"`` (opt-in, adds ~1-2s latency).
    """
    if not history:
        return question

    history_text = ""
    for m in history[-6:]:
        role = m.get("role", "user")
        if role in ("user", "assistant"):
            content = str(m.get("content", ""))[:300]
            history_text += f"{role}: {content}\n"

    condense_prompt = (
        "Given the conversation history and the latest user question, "
        "rewrite the question into a standalone query that captures all "
        "necessary context. Resolve pronouns (it/they/this/that) and include "
        "relevant details from the history.\n\n"
        f"Conversation:\n{history_text}\n"
        f"Latest question: {question}\n\n"
        "Standalone question:"
    )

    try:
        client = _get_http_client()
        r = await client.post(
            f"{base_url}/api/generate",
            json={
                "model": model,
                "prompt": condense_prompt,
                "stream": False,
                "options": {"num_predict": 128, "temperature": 0.0},
            },
            timeout=httpx.Timeout(30.0),
        )
        r.raise_for_status()
        condensed = (r.json().get("response") or "").strip()
        return condensed if condensed else question
    except Exception:
        return question


def _build_context_messages(
    question: str,
    nodes: list,
    history: Optional[List[Dict[str, Any]]],
    citations: bool,
    context_chunks: int = 4,
    snippet_chars: int = 600,
    history_msgs: int = 6,
    history_chars: int = 500,
) -> List[Dict[str, Any]]:
    """Build a context-rich prompt — system prompt + history + retrieved chunks + question.

    Configurable chunk count, snippet length, and history window so callers
    can tune for model size. Defaults are balanced for 7B-class models.
    """
    # Build context from retrieved chunks
    context_parts: List[str] = []
    for i, nws in enumerate(nodes[:context_chunks], start=1):
        node = getattr(nws, "node", None) or nws
        text = getattr(node, "get_content", lambda: "")() or getattr(node, "text", "") or ""
        metadata = dict(getattr(node, "metadata", {}) or {})
        file_path = metadata.get("file_path", "")
        title = metadata.get("title", "")
        score = getattr(nws, "score", None)
        score_str = f" (relevance: {score:.2f})" if score is not None else ""
        label_parts = [f"[{i}]"]
        if title:
            label_parts.append(f" {title}")
        if file_path:
            label_parts.append(f" ({file_path})")
        label = "".join(label_parts) + score_str
        snippet = text[:snippet_chars] if len(text) > snippet_chars else text
        context_parts.append(f"{label}\n{snippet}")

    context = "\n\n---\n\n".join(context_parts)

    messages: List[Dict[str, Any]] = []

    # System prompt — instructs the model how to use the context
    messages.append({"role": "system", "content": RAG_SYSTEM_PROMPT})

    # Chat history (for multi-turn awareness)
    if history:
        for m in history[-history_msgs:]:
            role = m.get("role", "user")
            if role in ("user", "assistant"):
                content = m.get("content", "")
                msg_text = content[:history_chars] if len(content) > history_chars else content
                messages.append({"role": role, "content": msg_text})

    # Final user message with context + question
    cite_instruction = "Cite sources with [N] markers." if citations else ""
    messages.append({
        "role": "user",
        "content": (
            f"Context information is below.\n\n"
            f"{context}\n\n"
            f"Given the context information and not prior knowledge, "
            f"answer the question. {cite_instruction}\n\n"
            f"Question: {question}\n\n"
            f"Answer:"
        ),
    })
    return messages


# ── Postprocessors ────────────────────────────────────────────────────────


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
    hyde: bool = False,
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
    t0 = time.perf_counter()
    retrieval_query = question
    if hyde:
        try:
            import requests
            hyde_prompt = f"Write a short passage that answers the question.\n\nQuestion: {question}\n\nPassage:"
            r = requests.post(
                f"{settings.ollama_url}/api/generate",
                json={"model": settings.rag_llm_model, "prompt": hyde_prompt, "stream": False},
                timeout=30,
            )
            r.raise_for_status()
            hyde_answer = (r.json().get("response") or "").strip()
            if hyde_answer:
                retrieval_query = hyde_answer
                logger.info(f"HyDE query generated for rag_query: {len(retrieval_query)} chars")
        except Exception as e:
            logger.warning(f"HyDE rag_query generation failed, falling back: {e}")
    nodes = retriever.retrieve(retrieval_query)
    postprocessors = _build_postprocessors(r, k, sentence_window=settings.rag_sentence_window_enabled)
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
        latency_ms=round((time.perf_counter() - t0) * 1000),
        hybrid=h,
        rerank=r,
        citations=c,
        num_queries=nq,
        category=category or "",
        tags=tags,
    )
    logger.info(
        f"RAG query done: top_k={k} hybrid={h} rerank={r} hyde={hyde} "
        f"sources={len(sources)} latency={round((time.perf_counter() - t0) * 1000)}ms"
    )
    return sources


async def _stream_queue(queue: asyncio.Queue, worker_task: asyncio.Task, timeout: float):
    """Yield items from *queue* with heartbeat keep-alive and overall *timeout*.

    Mirrors ``services/ai/model_runtime.py`` — waits for each queue item with
    a short heartbeat interval (15 s), sends ``phase: thinking`` pings to keep
    the SSE connection alive through proxies, and cancels the worker task when
    the overall *timeout* is exceeded.

    The per-iteration wait is capped at ``min(heartbeat, remaining)`` so the
    overall timeout is respected even when it is shorter than the heartbeat
    interval.
    """
    heartbeat = 15.0
    t0 = asyncio.get_running_loop().time()
    while True:
        remaining = timeout - (asyncio.get_running_loop().time() - t0)
        if remaining <= 0:
            if not worker_task.done():
                worker_task.cancel()
            yield {"error": f"RAG chat request timed out after {timeout}s"}
            return
        wait = min(heartbeat, remaining)
        try:
            item = await asyncio.wait_for(queue.get(), timeout=wait)
        except asyncio.TimeoutError:
            if asyncio.get_running_loop().time() - t0 > timeout:
                if not worker_task.done():
                    worker_task.cancel()
                yield {"error": f"RAG chat request timed out after {timeout}s"}
                return
            yield {"data": {"phase": "thinking"}}
            continue
        if item is None:
            break
        yield item


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
    hyde_enabled: bool = False,
):
    """Stream a RAG-grounded chat completion — minimal latency design.

    - 0-latency multi-turn heuristic (no LLM condense)
    - Top 2 chunks, truncated to 300 chars, num_predict=256
    - Ollama preflight check before streaming
    - Per-step timing in the response for diagnostics
    """
    from domain.rag.indexer import get_kb_index

    # ── Init ──
    t_init = time.perf_counter()
    try:
        ensure_settings_configured()
        index = get_kb_index()
        k = top_k or settings.rag_top_k
        h = settings.rag_hybrid_retrieval_enabled if hybrid is None else hybrid
        r = settings.rag_rerank_enabled if rerank is None else rerank
        c = settings.rag_inline_citations_enabled if citations is None else citations
        nq = num_queries if num_queries is not None and num_queries > 0 else 1
    except Exception as e:
        yield {"error": f"RAG init failed: {e}"}
        return
    t_init_done = time.perf_counter()

    mode = (chat_mode or "condense_plus_context").strip().lower()
    history = messages[:-1]
    last_msg = messages[-1] if messages else {}
    question = last_msg.get("content", "")

    if not question.strip():
        yield {"error": "Empty question"}
        return

    timing: Dict[str, float] = {}
    # Multi-turn question resolution
    if history:
        if mode == "condense":
            # LLM-based condense — rewrites question with history context.
            # Resolves pronouns and implicit references for better retrieval.
            # Adds ~1-2s latency but significantly improves multi-turn quality.
            t_cond = time.perf_counter()
            try:
                condensed = await _condense_question_llm(
                    question, history,
                    model=settings.rag_llm_model,
                    base_url=settings.ollama_url,
                )
                if condensed and condensed.strip():
                    logger.info(
                        f"Condensed question: '{question[:50]}...' → "
                        f"'{condensed[:80]}...'"
                    )
                    question = condensed.strip()
            except Exception as e:
                logger.warning(f"Condense failed, using original question: {e}")
            timing["condense_ms"] = round((time.perf_counter() - t_cond) * 1000)
        elif mode in ("condense_plus_context", "condense_question"):
            # 0-latency heuristic — merge short questions with previous user message
            if len(question) < 30:
                for m in reversed(history):
                    if m.get("role") == "user":
                        question = f"{m.get('content', '')} {question}"
                        break

    # context mode: retrieve based on all user messages combined
    if mode == "context" and history:
        all_user = [m.get("content", "") for m in messages if m.get("role") == "user"]
        question = " ".join(all_user)

    answer_buf: List[str] = []
    sources: List[Dict[str, Any]] = []
    source_nodes: list = []
    timing["init_ms"] = round((t_init_done - t_init) * 1000)

    try:
        # ── Preflight: check Ollama ──
        t_pre = time.perf_counter()
        ok, info = await _check_ollama(settings.rag_llm_model, settings.ollama_url)
        timing["ollama_check_ms"] = round((time.perf_counter() - t_pre) * 1000)
        if not ok:
            yield {"error": f"Ollama not available: {info}"}
            return

        # ── HyDE: generate hypothetical answer for better retrieval ──
        retrieval_query = question
        if hyde_enabled and mode != "simple":
            try:
                hyde_prompt = f"Write a short passage that answers the question.\n\nQuestion: {question}\n\nPassage:"
                hyde_answer = ""
                async for chunk in _stream_ollama_chat(
                    model=settings.rag_llm_model,
                    messages=[{"role": "user", "content": hyde_prompt}],
                    base_url=settings.ollama_url,
                    timeout=30,
                ):
                    if isinstance(chunk, dict):
                        token = chunk.get("data", {}).get("message", "")
                        if token:
                            hyde_answer += token
                if hyde_answer.strip():
                    retrieval_query = hyde_answer.strip()
                    logger.info(f"HyDE query generated: {len(retrieval_query)} chars")
            except Exception as e:
                logger.warning(f"HyDE generation failed, falling back to original query: {e}")

        # ── Retrieve ──
        if mode != "simple":
            yield {"data": {"phase": "retrieving"}}
            t_ret = time.perf_counter()
            retriever = _build_retriever(index, k, scope, h, nq, category, tags)
            nodes = await asyncio.to_thread(retriever.retrieve, retrieval_query)
            # Apply postprocessors: sentence window expansion, then optional re-rank
            postprocessors = _build_postprocessors(r, k, sentence_window=settings.rag_sentence_window_enabled)
            for pp in postprocessors:
                nodes = await asyncio.to_thread(pp.postprocess_nodes, nodes, question)
            timing["retrieve_ms"] = round((time.perf_counter() - t_ret) * 1000)
            source_nodes = nodes
            sources = [_source_dict(n) for n in source_nodes]

        # ── Build messages ──
        if mode == "simple":
            llm_messages = [dict(m) for m in messages]
        else:
            llm_messages = _build_context_messages(
                question, source_nodes,
                history if mode in ("condense_plus_context", "context") else None,
                c,
                context_chunks=k,
                snippet_chars=settings.rag_snippet_chars,
                history_msgs=settings.rag_history_msgs,
                history_chars=settings.rag_history_chars,
            )
        prompt_chars = sum(len(m.get("content", "")) for m in llm_messages)
        timing["prompt_chars"] = prompt_chars
        if prompt_chars > 8000:
            logger.warning(f"RAG prompt is large ({prompt_chars} chars) — may exceed model context window")

        # ── Stream from Ollama ──
        yield {"data": {"phase": "thinking"}}
        t_llm = time.perf_counter()
        logger.info(
            f"RAG chat calling Ollama: model={settings.rag_llm_model} "
            f"url={settings.ollama_url} prompt_chars={prompt_chars}"
        )
        async for chunk in _stream_ollama_chat(
            model=settings.rag_llm_model,
            messages=llm_messages,
            base_url=settings.ollama_url,
            timeout=float(settings.rag_chat_timeout),
        ):
            if isinstance(chunk, dict):
                msg_data = chunk.get("data", {})
                token = msg_data.get("message", "")
                if token:
                    answer_buf.append(token)
                    yield {"data": {"message": token}}
                if "usage" in msg_data:
                    yield {"data": {"usage": msg_data["usage"]}}
            else:
                answer_buf.append(str(chunk))
                yield {"data": {"message": str(chunk)}}
        timing["llm_ms"] = round((time.perf_counter() - t_llm) * 1000)

        # Fallback — if the LLM produced no tokens, surface a visible error
        # so the frontend doesn't show an empty answer with only sources.
        if not answer_buf:
            yield {"data": {"message": "_(模型未生成回复，请重试)_"}}

        # ── Emit sources + timing ──
        timing["total_ms"] = round((time.perf_counter() - t_init) * 1000)
        timing["sources"] = len(sources)
        timing["tokens"] = len("".join(answer_buf))
        if mode != "simple":
            yield {"data": {"sources": sources, "timing": timing}}
        else:
            yield {"data": {"timing": timing}}

        logger.info(
            f"RAG chat done: mode={mode} top_k={k} hybrid={h} rerank={r} hyde={hyde_enabled} "
            f"sources={len(sources)} tokens={len(''.join(answer_buf))} "
            f"retrieve={timing.get('retrieve_ms',0)}ms llm={timing.get('llm_ms',0)}ms total={timing.get('total_ms',0)}ms "
            f"prompt_chars={timing.get('prompt_chars',0)}"
        )
        try:
            from domain.rag.chat_history import record_chat_turn
            record_chat_turn(
                question=last_msg.get("content", ""),
                answer="".join(answer_buf),
                sources=sources,
                scope=scope or "",
                chat_mode=mode,
                latency_ms=timing["total_ms"],
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
        logger.exception(f"RAG chat failed: {e}")
        yield {"error": f"RAG chat failed: {e}"}


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
            _safe_put(queue, {"data": {"phase": "retrieving"}}, loop)
            response = chat_engine.stream_chat(question)
            for token in response.response_gen:
                if token:
                    _safe_put(queue, {"data": {"message": token}}, loop)
            try:
                sources = [_source_dict(n) for n in (response.source_nodes or [])]
            except Exception:
                sources = []
            _safe_put(queue, {"data": {"sources": sources}}, loop)
        except Exception as e:
            _safe_put(queue, {"error": f"RAG file chat failed: {e}"}, loop)
        finally:
            _safe_put(queue, None, loop)

    worker_task = asyncio.create_task(asyncio.to_thread(_worker))

    timeout = float(settings.rag_chat_timeout)
    async for item in _stream_queue(queue, worker_task, timeout):
        yield item
