"""RAG query + chat engines built on top of ``indexer.py``.

Public surface:
    - ``rag_query(question, top_k=None, scope=None)`` → list of source dicts
    - ``rag_chat_stream(messages, scope=None)``       → async generator of SSE frames
    - ``rag_file_query(question, abs_path, top_k)``
    - ``rag_file_chat_stream(question, abs_path)``
"""
from __future__ import annotations

import asyncio
from collections.abc import AsyncIterator
import json
import logging
import re
import time
from typing import Any, Dict, List, Optional

import httpx
from llama_index.core.vector_stores import FilterOperator, MetadataFilter, MetadataFilters

from domain.rag.settings import ensure_settings_configured
from shared.config import settings

logger = logging.getLogger(__name__)

# BM25 retriever cache — building from all nodes is O(N) and was done on every
# request. Cache keyed by id(index) so a rebuild (new index object) invalidates.
_bm25_cache: dict[int, Any] = {}
_bm25_cache_top_k: dict[int, int] = {}


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


def _source_dict(node_with_score: Any) -> dict[str, Any]:
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


def _scope_filters(scope: str | None, category: str | None = None, tags: list[str] | None = None):
    """Build a MetadataFilters restricting retrieved chunks by frontmatter.

    Combines (AND) any of:
      - ``file_path`` CONTAINS ``scope`` (substring on path)
      - ``category`` TEXT_MATCH ``category`` (exact category)
      - ``tags`` TEXT_MATCH each tag (one filter per tag, AND-combined)

    Returns ``None`` when no filters apply — caller should not pass a
    filter in that case so the retriever uses its default behavior.
    """
    filters: list[Any] = []
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


def _build_retriever(index: Any, top_k: int, scope: str | None, hybrid: bool, num_queries: int = 1, category: str | None = None, tags: list[str] | None = None) -> Any:
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
        kwargs: dict[str, Any] = {"similarity_top_k": top_k}
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
        use_async=False,  # must be False — retrieve() is called via asyncio.to_thread
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


async def close_http_client():
    """Close the shared httpx client — call during app shutdown."""
    global _http_client
    if _http_client is not None and not _http_client.is_closed:
        await _http_client.aclose()
        _http_client = None
        logger.info("HTTP client closed")


# ── Async Ollama helpers ──────────────────────────────────────────────────


async def _stream_ollama_chat(
    model: str,
    messages: list[dict[str, Any]],
    base_url: str,
    timeout: float = 120.0,
) -> AsyncIterator[dict[str, Any]]:
    """Stream chat completion from Ollama via the shared httpx client.

    Uses the same connection pool as the rest of the RAG engine (``_get_http_client()``)
    instead of creating a new ``ollama.AsyncClient`` per call. Raw HTTP streaming to
    Ollama's ``/api/chat`` endpoint with ``stream: true`` — each line is a JSON chunk.

    Yields ``{"data": {"message": str}}`` for content deltas and
    ``{"data": {"usage": {...}}}`` for the final token-usage frame.
    """
    client = _get_http_client()
    try:
        async with client.stream(
            "POST",
            f"{base_url}/api/chat",
            json={
                "model": model,
                "messages": messages,
                "stream": True,
                "options": {
                    "temperature": settings.rag_temperature,
                    "num_predict": settings.rag_num_predict,
                    "num_ctx": settings.ollama_num_ctx,
                },
            },
            timeout=httpx.Timeout(timeout, connect=10.0),
        ) as response:
            response.raise_for_status()
            async for line in response.aiter_lines():
                if not line:
                    continue
                try:
                    chunk = json.loads(line)
                except json.JSONDecodeError:
                    continue
                msg = chunk.get("message") or {}
                # Qwen3 models emit response in 'thinking' field, 'content' empty.
                # Prefer content, fall back to thinking for Qwen3 compatibility.
                content = msg.get("content") or msg.get("thinking", "")
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
        logger.error(f"Ollama stream chat failed: {e}")
        raise


# Preflight check result cache (600s TTL, per model+base_url).
# Model availability doesn't change during a session — 10 min cache
# eliminates redundant HTTP calls on consecutive RAG turns.
_ollama_check_cache: dict[tuple, tuple[float, bool, str]] = {}


async def _check_ollama(model: str, base_url: str) -> tuple[bool, str]:
    """Check if Ollama is reachable and the model is loaded.

    Result cached for 600s — model availability doesn't change rapidly.
    Consecutive RAG turns skip the redundant HTTP call entirely.
    """
    cache_key = (model, base_url)
    now = time.monotonic()
    if cache_key in _ollama_check_cache:
        ts, ok, info = _ollama_check_cache[cache_key]
        if now - ts < 600.0:
            return ok, info

    try:
        client = _get_http_client()
        r = await client.get(f"{base_url}/api/tags", timeout=httpx.Timeout(5.0))
        r.raise_for_status()
        models = [m.get("name", "") for m in (r.json().get("models", []) or [])]
        base = model.split(":")[0]
        for m in models:
            if m == model or m.startswith(f"{base}:"):
                _ollama_check_cache[cache_key] = (now, True, m)
                return True, m
        _ollama_check_cache[cache_key] = (now, False, f"model {model} not found in {models}")
        return False, f"model {model} not found in {models}"
    except Exception as e:
        _ollama_check_cache[cache_key] = (now, False, str(e))
        return False, str(e)


# ── Context builder ───────────────────────────────────────────────────────

# Professional system prompt for RAG chat — delivers concise, well-cited,
# structured answers grounded purely in retrieved knowledge-base documents.
RAG_SYSTEM_PROMPT = (
    "You are a senior analyst. Current date: {current_date}. "
    "Answer using ONLY the excerpts below.\n"
    "Structure your answer as:\n"
    "## 综述\n"
    "1-2 sentence summary.\n"
    "## 关键发现\n"
    "### 主题名\n"
    "- Finding with source [N]. Include specific numbers and dates.\n"
    "- Compare related sources. Note contradictions.\n"
    "\n"
    "Rules:\n"
    "- Cite every claim with [N] from the excerpts.\n"
    "- Use precise dates from labels: '9月17日[1]消息...'\n"
    "- If excerpts insufficient: '当前知识库中暂无相关信息。'\n"
    "- No external knowledge. Respond in the question's language."
)

# Date-aware variant — current date is injected so the model can interpret
# time references correctly. Also handles predictive questions professionally.
RAG_SYSTEM_PROMPT_DATE_AWARE = (
    "You are a senior analyst with access to a curated knowledge base. "
    "Current date: {current_date}. Answer using ONLY the context below.\n"
    "\n"
    "Output structure:\n"
    "## 综述\n"
    "1-2 sentence executive summary framed against the current date. "
    "Note what's new, what's changed, or what's upcoming.\n"
    "\n"
    "## 关键发现\n"
    "### 主题一\n"
    "- Finding with source citation [1], [2]. Compare document dates with current date to establish recency.\n"
    "- Flag outdated information: '⚠️ [3]的信息来自9月10日（8天前），可能已过期'\n"
    "- Cross-reference sources — note agreements, conflicts, or timeline gaps.\n"
    "\n"
    "Rules:\n"
    "- Use relative time when helpful: '昨日', '三天前', '上周'\n"
    "- For predictive questions: distinguish between factual trends and speculative implications.\n"
    "- If context insufficient: '当前知识库中暂无相关信息。'\n"
    "- Respond in the question's language. No boilerplate."
)

# Planning variant — for "帮我安排今天的计划" style requests.
# Structures the output as a time-blocked daily schedule grounded in recent context.
RAG_SYSTEM_PROMPT_PLANNING = (
    "You are a senior executive assistant. Current date: {current_date}. "
    "Create a daily plan using ONLY the context below.\n"
    "\n"
    "Output structure:\n"
    "## 今日概况\n"
    "Date-anchored intro using context dates: e.g. '基于昨日（9月17日）信息，今日（9月18日）安排如下：'\n"
    "\n"
    "## 上午 (09:00-12:00)\n"
    "- **09:00** — Item title [1]。Why: connect the context to this action.\n"
    "- **10:30** — Item title [2]。Why: ...\n"
    "\n"
    "## 下午 (13:00-18:00)\n"
    "- **14:00** — Item title [1][3]。Why: ...\n"
    "\n"
    "## 备注\n"
    "Key assumptions, context gaps, or risks to watch. Skip if none.\n"
    "\n"
    "Rules:\n"
    "- Priority: time-sensitive or deadline-bound items first.\n"
    "- Cross-reference sources for conflicting priorities — note trade-offs.\n"
    "- If context truly insufficient: '当前知识库中暂无足够信息制定计划。'\n"
    "- No generic disclaimers. Be specific and actionable.\n"
    "- Respond in the question's language."
)

# Planning intent patterns — detect when the user wants a schedule/plan.
_PLANNING_PATTERNS = [
    re.compile(r"安排.*计划|计划.*安排|帮我安排|制定.*计划|规划|日程"),
    re.compile(r"(今天|明天|今日|明日).*(做什么|干什么|安排|计划|日程)"),
    re.compile(r"根据.*(昨天|最近|近期).*(安排|计划)"),
]

def _is_planning_request(question: str) -> bool:
    """Check if the question is asking for a schedule or daily plan."""
    for pattern in _PLANNING_PATTERNS:
        if pattern.search(question):
            return True
    return False

# Time-sensitive query patterns for query enhancement + date-aware prompt.
# Ordered from most specific to least specific — first match wins.
_TIME_PATTERNS = [
    (re.compile(r"今天|今日|\btoday\b"), "today"),
    (re.compile(r"昨天|昨日|\byesterday\b"), "yesterday"),
    (re.compile(r"明天|明日|\btomorrow\b"), "tomorrow"),
    (re.compile(r"后天|the day after tomorrow"), "day_after_tomorrow"),
    (re.compile(r"最近|近期|近来|\brecently\b|\blately\b|过去几天|这几天|近几天|近[三日]天"), "recent"),
    (re.compile(r"本周|这周|这个星期|这星期|\bthis week\b"), "this_week"),
    (re.compile(r"上周|上个星期|上星期|\blast week\b"), "last_week"),
    (re.compile(r"下周|下个星期|下星期|\bnext week\b"), "next_week"),
    (re.compile(r"本月|这个月|这月|\bthis month\b"), "this_month"),
    (re.compile(r"上月|上个月|上月份|\blast month\b"), "last_month"),
    (re.compile(r"今年|今年来|本年|\bthis year\b"), "this_year"),
    (re.compile(r"刚[刚才]|刚刚|just now|不久前"), "just_now"),
    (re.compile(r"可能发生|可能会|预测|将会|未来|前景|趋势|展望|预期|预计"), "predictive"),
    (re.compile(r"(?:最近|近期|过去)(?:有什么|有哪些|什么)新(?:消息|进展|动态|变化|情况)"), "recent"),
    (re.compile(r"最新|最近更新|最新消息|最新进展|最新动态"), "recent"),
]


def _get_date_context() -> dict[str, str]:
    """Return current date information for prompt injection."""
    from datetime import datetime, timedelta
    now = datetime.now()
    yesterday = now - timedelta(days=1)
    last_week = now - timedelta(days=7)
    # first day of last month
    if now.month == 1:
        last_month_start = datetime(now.year - 1, 12, 1)
    else:
        last_month_start = datetime(now.year, now.month - 1, 1)
    weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    weekday = weekdays[now.weekday()]
    return {
        "current_date": f"{now.strftime('%Y-%m-%d')} ({weekday})",
        "iso_date": now.strftime("%Y-%m-%d"),
        "year": str(now.year),
        "month": now.strftime("%Y-%m"),
        "yesterday": yesterday.strftime("%Y-%m-%d"),
        "last_week": last_week.strftime("%Y-%m-%d"),
        "last_month": last_month_start.strftime("%Y-%m"),
    }


def _detect_time_sensitivity(question: str) -> str | None:
    """Detect if a question has time-sensitive or predictive intent.

    Returns None if no patterns detected, or a category string like
    "today", "predictive", "this_week", etc.
    """
    text = question.lower()
    for pattern, category in _TIME_PATTERNS:
        if pattern.search(text):
            return category
    return None


def _enhance_query_for_retrieval(question: str) -> str:
    """Enhance the retrieval query with date context for time-sensitive questions.

    When the user asks "今天发生了什么？", the retrieval query becomes
    "2026-09-18 今天发生了什么？" so vector search finds time-appropriate content.
    Predictive queries are not date-prefixed but benefit from the date-aware prompt.
    Planning requests default to yesterday+today range for actionable context.
    """
    time_cat = _detect_time_sensitivity(question)
    is_planning = _is_planning_request(question)

    # Planning without specific time reference → default to recent (yesterday+today)
    if is_planning and not time_cat:
        date_ctx = _get_date_context()
        return f"{date_ctx['yesterday']} {date_ctx['iso_date']} {question}"

    if not time_cat:
        return question

    date_ctx = _get_date_context()
    if time_cat in ("today", "just_now"):
        prefix = f"{date_ctx['yesterday']} {date_ctx['iso_date']}" if is_planning else date_ctx['current_date']
        return f"{prefix} {question}"
    elif time_cat == "yesterday":
        return f"{date_ctx['yesterday']} {question}"
    elif time_cat in ("recent", "this_week", "this_month"):
        return f"{date_ctx['month']} {question}"
    elif time_cat == "last_week":
        return f"{date_ctx['last_week']} {question}"
    elif time_cat == "last_month":
        return f"{date_ctx['last_month']} {question}"
    elif time_cat in ("tomorrow", "day_after_tomorrow", "next_week"):
        return f"{date_ctx['month']} upcoming {question}"
    elif time_cat == "this_year":
        return f"{date_ctx['year']} {question}"
    elif time_cat == "predictive":
        return f"{date_ctx['month']} trends forecast {question}"
    return question


def _is_time_sensitive(question: str) -> bool:
    """Check if question contains time-sensitive or predictive language."""
    return _detect_time_sensitivity(question) is not None


async def _condense_question_llm(
    question: str,
    history: list[dict[str, Any]],
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
            timeout=httpx.Timeout(20.0),
        )
        r.raise_for_status()
        condensed = (r.json().get("response") or r.json().get("thinking") or "").strip()
        return condensed if condensed else question
    except Exception:
        return question


def _text_signature(text: str, n: int = 3) -> str:
    """Compact signature for near-duplicate detection — sorted char trigrams.

    Two chunks with >70% trigram overlap on their first 300 chars are
    treated as duplicates. Using sorted trigrams (not raw text) keeps
    the signature small and O(1) to hash."""
    if len(text) < n:
        return text
    trigrams = [text[i:i+n] for i in range(len(text) - n + 1)]
    return "|".join(sorted(set(trigrams)))


def _build_context_messages(
    question: str,
    nodes: list,
    history: list[dict[str, Any]] | None,
    citations: bool,
    context_chunks: int = 4,
    snippet_chars: int = 600,
    history_msgs: int = 6,
    history_chars: int = 500,
) -> list[dict[str, Any]]:
    """Build a context-rich prompt — system prompt + history + retrieved chunks + question.

    Configurable chunk count, snippet length, and history window so callers
    can tune for model size. Defaults are balanced for 7B-class models.

    Filters out low-relevance chunks (score < 20% of top score) and
    near-duplicate chunks (Jaccard > 0.7 on first 300 chars) to avoid
    wasting context window on noise.
    """
    # Filter: drop chunks with very low scores relative to the top result
    scores = []
    for nws in nodes[:context_chunks]:
        s = getattr(nws, "score", None)
        if s is not None:
            scores.append(s)
    min_score = max(scores) * 0.2 if scores else 0.0

    # Two-pass selection: first prefer unique files (source diversity),
    # then fill remaining slots from any file (most relevant first).
    def _pick_chunks(candidates: list, max_count: int, prefer_unique: bool) -> list:
        out: list = []
        seen_files: set[str] = set()
        seen_sigs: set[str] = set()
        for nws in candidates:
            if len(out) >= max_count:
                break
            score = getattr(nws, "score", None)
            if score is not None and score < min_score:
                continue
            node = getattr(nws, "node", None) or nws
            text = getattr(node, "get_content", lambda: "")() or getattr(node, "text", "") or ""
            sig = _text_signature(text[:300])
            if sig in seen_sigs:
                continue
            metadata = dict(getattr(node, "metadata", {}) or {})
            fp = metadata.get("file_path", "")
            if prefer_unique and fp and fp in seen_files:
                continue
            seen_sigs.add(sig)
            if fp:
                seen_files.add(fp)
            out.append(nws)
        return out

    # Pass 1: up to context_chunks from unique files
    selected = _pick_chunks(nodes, context_chunks, prefer_unique=True)
    # Pass 2: fill remaining slots from any file
    if len(selected) < context_chunks:
        already = {id(n) for n in selected}
        selected += _pick_chunks(
            [n for n in nodes if id(n) not in already],
            context_chunks - len(selected),
            prefer_unique=False,
        )

    # Build context from selected chunks
    context_parts: list[str] = []
    for nws in selected:
        node = getattr(nws, "node", None) or nws
        text = getattr(node, "get_content", lambda: "")() or getattr(node, "text", "") or ""
        metadata = dict(getattr(node, "metadata", {}) or {})
        file_path = metadata.get("file_path", "")
        title = metadata.get("title", "")
        doc_date = metadata.get("created") or metadata.get("date") or ""
        category = metadata.get("category", "")
        tags_val = metadata.get("tags", "")
        score = getattr(nws, "score", None)
        score_str = f" (relevance: {score:.2f})" if score is not None else ""
        date_str = f" [{doc_date}]" if doc_date else ""
        cat_str = f" [{category}]" if category else ""
        tag_str = f" tags:{tags_val}" if tags_val else ""
        label_parts = [f"[{len(context_parts) + 1}]{date_str}{cat_str}"]
        if title:
            label_parts.append(f" {title}")
        if file_path:
            label_parts.append(f" ({file_path})")
        label = "".join(label_parts) + tag_str + score_str
        snippet = text[:snippet_chars] if len(text) > snippet_chars else text
        context_parts.append(f"{label}\n{snippet}")

    context = "\n\n---\n\n".join(context_parts)

    messages: list[dict[str, Any]] = []

    # System prompt — planning variant for schedule/plan requests, date-aware
    # for time-sensitive questions, otherwise standard professional prompt.
    # All three variants receive current date context for temporal grounding.
    date_ctx = _get_date_context()
    if _is_planning_request(question):
        sys_prompt = RAG_SYSTEM_PROMPT_PLANNING.format(**date_ctx)
    elif _is_time_sensitive(question):
        sys_prompt = RAG_SYSTEM_PROMPT_DATE_AWARE.format(**date_ctx)
    else:
        sys_prompt = RAG_SYSTEM_PROMPT.format(**date_ctx)
    messages.append({"role": "system", "content": sys_prompt})

    # Chat history (for multi-turn awareness)
    if history:
        for m in history[-history_msgs:]:
            role = m.get("role", "user")
            if role in ("user", "assistant"):
                content = m.get("content", "")
                msg_text = content[:history_chars] if len(content) > history_chars else content
                messages.append({"role": role, "content": msg_text})

    # Final user message — instruction BEFORE context so the model
    # knows what to do while reading. This "context sandwich" pattern
    # (instruction → context → question → answer) improves citation
    # accuracy and reduces hallucination vs. the standard RAG format
    # where context comes first.
    cite_instruction = "Cite every claim with [N] markers matching the source numbers above." if citations else ""
    messages.append({
        "role": "user",
        "content": (
            f"Answer the question using ONLY the excerpts below. "
            f"{cite_instruction}\n\n"
            f"{context}\n\n"
            f"Question: {question}\n\n"
            f"If the excerpts don't contain the answer, say so directly. "
            f"Do not use prior knowledge.\n\n"
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
        from llama_index.core.schema import NodeWithScore, TextNode
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


# ── Retrieval cache ──────────────────────────────────────────────────────

# Cache retrieval results by (normalized_query, scope, top_k). LRU eviction
# with 300s TTL — repeated queries skip the 200-500ms retrieval entirely.
_retrieval_cache: dict[str, tuple[float, list[dict[str, Any]]]] = {}
_RETRIEVAL_CACHE_MAX = 100
_RETRIEVAL_CACHE_TTL = 300.0


def _normalize_query(q: str) -> str:
    """Normalize a query for cache key — lowercase, strip punctuation, collapse whitespace."""
    return re.sub(r"\s+", " ", re.sub(r"[^\w\s]", "", q.lower())).strip()


async def rag_query(
    question: str,
    top_k: int | None = None,
    scope: str | None = None,
    hybrid: bool | None = None,
    rerank: bool | None = None,
    citations: bool | None = None,
    num_queries: int | None = None,
    category: str | None = None,
    tags: list[str] | None = None,
    hyde: bool = False,
) -> list[dict[str, Any]]:
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
    from domain.rag.history import record_query
    from domain.rag.indexer import get_kb_index, is_index_available
    ensure_settings_configured()
    if not is_index_available():
        logger.warning("RAG query blocked — index not built")
        return []
    index = get_kb_index()
    k = top_k or settings.rag_top_k
    h = settings.rag_hybrid_retrieval_enabled if hybrid is None else hybrid
    r = settings.rag_rerank_enabled if rerank is None else rerank
    c = settings.rag_inline_citations_enabled if citations is None else citations
    nq = num_queries if num_queries is not None and num_queries > 0 else settings.rag_num_queries
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
    retrieval_query = _enhance_query_for_retrieval(question)

    # Check retrieval cache — skip the 200-500ms retrieval for repeated queries
    cache_key = f"{_normalize_query(retrieval_query)}|{scope or ''}|{k}|{h}|{nq}|{category or ''}|{','.join(sorted(tags or []))}"
    now = time.time()
    if cache_key in _retrieval_cache:
        ts, cached_nodes = _retrieval_cache[cache_key]
        if now - ts < _RETRIEVAL_CACHE_TTL:
            logger.info(f"RAG retrieval cache hit: {retrieval_query[:60]} ({len(cached_nodes)} nodes)")
            nodes = cached_nodes
        else:
            del _retrieval_cache[cache_key]
            nodes = None
    else:
        nodes = None

    if nodes is None:
        if hyde:
            try:
                client = _get_http_client()
                hyde_prompt = (
                    f"Write a detailed, factual passage (150-300 words) that directly answers "
                    f"the question below, as if excerpted from a professional knowledge base. "
                    f"Include specific dates, names, numbers, and technical details. "
                    f"Do not preface — just write the content.\n\n"
                    f"Question: {retrieval_query}\n\n"
                    f"Passage:"
                )
                r = await client.post(
                    f"{settings.ollama_url}/api/generate",
                    json={"model": settings.rag_hyde_model, "prompt": hyde_prompt, "stream": False},
                    timeout=httpx.Timeout(60.0),
                )
                r.raise_for_status()
                hyde_answer = (r.json().get("response") or r.json().get("thinking") or "").strip()
                if hyde_answer:
                    retrieval_query = hyde_answer
                    logger.info(f"HyDE query generated for rag_query: {len(retrieval_query)} chars")
            except Exception as e:
                logger.warning(f"HyDE rag_query generation failed, falling back: {e}")
        nodes = retriever.retrieve(retrieval_query)
        # Cache the retrieval result
        if len(_retrieval_cache) >= _RETRIEVAL_CACHE_MAX:
            oldest = next(iter(_retrieval_cache))
            del _retrieval_cache[oldest]
        _retrieval_cache[cache_key] = (now, nodes)
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
    heartbeat = 10.0
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
    messages: list[dict[str, Any]],
    scope: str | None = None,
    top_k: int | None = None,
    hybrid: bool | None = None,
    rerank: bool | None = None,
    citations: bool | None = None,
    num_queries: int | None = None,
    chat_mode: str | None = None,
    category: str | None = None,
    tags: list[str] | None = None,
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
    mode = (chat_mode or "condense_plus_context").strip().lower()
    try:
        ensure_settings_configured()
        k = top_k or settings.rag_top_k
        h = settings.rag_hybrid_retrieval_enabled if hybrid is None else hybrid
        r = settings.rag_rerank_enabled if rerank is None else rerank
        c = settings.rag_inline_citations_enabled if citations is None else citations
        nq = num_queries if num_queries is not None and num_queries > 0 else settings.rag_num_queries
        # Only load index when retrieval is needed (non-simple modes).
        # Index loading reads the persisted llama_index from disk and is
        # wasted work in simple mode. When no index exists yet, return an
        # immediate error instead of blocking the SSE stream on a full build.
        index = None
        if mode != "simple":
            from domain.rag.indexer import is_index_available
            if not is_index_available():
                yield {"error": "RAG index not built yet. Please trigger a build via /rag-build or enable auto_rebuild in config.yaml."}
                return
            index = get_kb_index()
    except Exception as e:
        yield {"error": f"RAG init failed: {e}"}
        return
    t_init_done = time.perf_counter()

    history = messages[:-1]
    last_msg = messages[-1] if messages else {}
    question = last_msg.get("content", "")

    if not question.strip():
        yield {"error": "Empty question"}
        return

    timing: dict[str, float] = {}
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

    answer_buf: list[str] = []
    sources: list[dict[str, Any]] = []
    source_nodes: list = []
    timing["init_ms"] = round((t_init_done - t_init) * 1000)

    try:
        # ── Preflight: check Ollama (skip for simple mode — unnecessary overhead) ──
        if mode != "simple":
            t_pre = time.perf_counter()
            ok, info = await _check_ollama(settings.rag_llm_model, settings.ollama_url)
            timing["ollama_check_ms"] = round((time.perf_counter() - t_pre) * 1000)
            if not ok:
                yield {"error": f"Ollama not available: {info}"}
                return

        # ── HyDE: generate hypothetical answer for better retrieval ──
        retrieval_query = _enhance_query_for_retrieval(question)
        if retrieval_query != question:
            logger.info(
                f"RAG chat query enhanced for time: '%s' → '%s'",
                question[:80], retrieval_query[:120],
            )
        if hyde_enabled and mode != "simple":
            try:
                # Use the enhanced query (with date prefixes) so HyDE
                # generates a time-aware hypothetical answer.  Previously
                # the raw question was used, so time-sensitive queries
                # like "今天有什么新闻" produced generic HyDE answers
                # that matched the wrong date range during retrieval.
                hyde_prompt = (
                    f"Write a detailed, factual passage (150-300 words) that directly answers "
                    f"the question below, as if excerpted from a professional knowledge base. "
                    f"Include: specific dates, names, numbers, and technical details where "
                    f"applicable. Use clear, authoritative language. Do not preface with "
                    f"'Here is a passage' or similar — just write the content.\n\n"
                    f"Question: {retrieval_query}\n\n"
                    f"Passage:"
                )
                hyde_answer = ""
                client = _get_http_client()
                r = await client.post(
                    f"{settings.ollama_url}/api/generate",
                    json={
                        "model": settings.rag_hyde_model,
                        "prompt": hyde_prompt,
                        "stream": False,
                        "options": {"num_predict": 256, "temperature": 0.0},
                    },
                    timeout=httpx.Timeout(60.0),
                )
                r.raise_for_status()
                hyde_answer = (r.json().get("response") or r.json().get("thinking") or "").strip()
                if hyde_answer and len(hyde_answer) >= 30:
                    retrieval_query = hyde_answer
                    logger.info(f"HyDE query generated: {len(retrieval_query)} chars")
                elif hyde_answer:
                    logger.info(f"HyDE answer too short ({len(hyde_answer)} chars), using enhanced query")
            except Exception as e:
                logger.warning(f"HyDE generation failed, falling back to enhanced query: {e}")

        # ── Retrieve ──
        if mode != "simple":
            yield {"data": {"phase": "retrieving"}}
            t_ret = time.perf_counter()
            retriever = _build_retriever(index, k, scope, h, nq, category, tags)
            nodes = await asyncio.to_thread(retriever.retrieve, retrieval_query)
            # Apply postprocessors: sentence window expansion, then optional re-rank
            postprocessors = _build_postprocessors(r, k, sentence_window=settings.rag_sentence_window_enabled)
            for pp in postprocessors:
                nodes = await asyncio.to_thread(pp.postprocess_nodes, nodes, query_str=question)
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


def rag_file_query(question: str, abs_path: str, top_k: int | None = None) -> list[dict[str, Any]]:
    from domain.rag.indexer import build_file_index
    ensure_settings_configured()
    index = build_file_index(abs_path)
    k = top_k or settings.rag_top_k
    retriever = index.as_retriever(similarity_top_k=k)
    nodes = retriever.retrieve(question)
    return [_source_dict(n) for n in nodes]


def rag_decompose(
    question: str,
    scope: str | None = None,
    sub_q_top_k: int | None = None,
    citations: bool | None = None,
    category: str | None = None,
    tags: list[str] | None = None,
) -> dict[str, Any]:
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
    from llama_index.core.query_engine import SubQuestionQueryEngine
    from llama_index.core.tools import QueryEngineTool, ToolMetadata

    from domain.rag.indexer import get_kb_index, is_index_available

    ensure_settings_configured()
    if not is_index_available():
        return {"original": question, "synthesis": "", "sub_questions": [], "error": "RAG index not built yet"}
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
    sub_questions: list[dict[str, Any]] = []
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
    from llama_index.core.chat_engine import CondensePlusContextChatEngine

    from domain.rag.indexer import build_file_index

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
