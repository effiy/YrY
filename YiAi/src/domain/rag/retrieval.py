"""RAG retrieval: cache, one-shot query, file-level query."""

from __future__ import annotations

import logging
import re
import time
from typing import Any

import httpx

from domain.rag.post_processors import _NumberSourcesPostprocessor
from domain.rag.query_builder import _detect_time_sensitivity, _enhance_query_for_retrieval
from domain.rag.response_synthesizer import _get_http_client
from domain.rag.retrievers import (
    _build_postprocessors,
    _build_retriever,
    _source_dict,
)
from domain.rag.settings import ensure_settings_configured
from shared.config import settings

logger = logging.getLogger(__name__)

# ── Retrieval cache ──────────────────────────────────────────────────────────

_retrieval_cache: dict[str, tuple[float, list[dict[str, Any]]]] = {}
_RETRIEVAL_CACHE_MAX = 100
_RETRIEVAL_CACHE_TTL = 300.0


def _normalize_query(q: str) -> str:
    return re.sub(r"\s+", " ", re.sub(r"[^\w\s]", "", q.lower())).strip()


def _normalize_scores(nodes: list) -> list:
    """Normalize raw similarity scores, preserving absolute quality signal.

    Embedding models may return cosine similarity (typically [0,1] for
    Ollama) or raw dot products (unbounded). This function:
    - Keeps scores as-is when already in [0,1] (preserves quality signal)
    - Normalizes only when scores are clearly on a different scale
    - Avoids artificially inflating narrow ranges (all-similar = all-weak)
    """
    if not nodes:
        return nodes
    scores = [getattr(n, "score", None) for n in nodes]
    numeric = [s for s in scores if s is not None]
    if not numeric:
        return nodes
    min_s, max_s = min(numeric), max(numeric)

    # Already in [0,1] range — preserve the absolute quality signal.
    # A max of 0.25 is genuinely weak; a max of 0.85 is genuinely strong.
    # Don't min-max normalize these away.
    if min_s >= 0 and max_s <= 1.0:
        return nodes

    # Narrow range — all chunks are similarly relevant (or irrelevant).
    # Artificially spreading them would mislead downstream thresholds.
    if max_s - min_s < 0.05:
        for n in nodes:
            if getattr(n, "score", None) is not None:
                n.score = 0.3  # neutral — neither strong nor weak
        return nodes

    # Scores outside [0,1] — normalize to [0,1]
    spread = max_s - min_s
    for n in nodes:
        s = getattr(n, "score", None)
        if s is not None:
            n.score = (s - min_s) / spread

    return nodes


def _dedup_identical_chunks(nodes: list) -> list:
    """Remove chunks with identical normalized text (same file + same content).

    This catches the case where the same file has been indexed multiple times
    or where a file has duplicate sections that produce identical chunks.
    Uses a hash of (file_path, normalized_text) for O(1) dedup.
    """
    if len(nodes) <= 1:
        return nodes
    seen: set[tuple] = set()
    out: list = []
    for nws in nodes:
        node = getattr(nws, "node", None) or nws
        text = getattr(node, "get_content", lambda: "")() or getattr(node, "text", "") or ""
        metadata = dict(getattr(node, "metadata", {}) or {})
        fp = metadata.get("file_path", "")
        # Normalize text for comparison: lowercase, collapse whitespace
        norm = re.sub(r"\s+", " ", text.strip().lower())
        key = (fp, norm)
        if key in seen:
            continue
        seen.add(key)
        out.append(nws)
    return out


def _filter_by_keyword_overlap(nodes: list, query: str) -> list:
    """Remove nodes with zero significant-term overlap with the query.

    Even when embedding cosine is reasonable, a chunk containing none of the
    query's content words is almost certainly noise. This is a fast O(n)
    string-match filter — no LLM calls — that catches the most obvious
    embedding false positives before they reach the LLM.

    Keeps at least 50% of original nodes to avoid over-filtering.
    """
    if len(nodes) <= 2:
        return nodes

    # Extract significant query terms: words >= 2 chars, exclude stop-like chars
    q_terms = set()
    for token in re.findall(r"[\w\u4e00-\u9fff]{2,}", query.lower()):
        if token not in ("the", "and", "for", "what", "when", "where", "how", "why",
                          "this", "that", "with", "from", "your", "have", "been",
                          "的", "了", "是", "在", "和", "有", "我", "你", "他", "这", "那",
                          "什么", "怎么", "为什么", "如何", "哪个", "哪些", "可以", "需要"):
            q_terms.add(token)

    if len(q_terms) < 2:
        return nodes  # too few terms to filter reliably

    kept: list = []
    for nws in nodes:
        node = getattr(nws, "node", None) or nws
        text = (getattr(node, "get_content", lambda: "")() or getattr(node, "text", "") or "").lower()
        # At least one significant query term must appear in the chunk
        if any(t in text for t in q_terms):
            kept.append(nws)

    # Safety — never drop more than half the results
    if len(kept) < len(nodes) // 2:
        kept = nodes[:max(len(kept), len(nodes) // 2)]

    if len(kept) < len(nodes):
        logger = logging.getLogger(__name__)
        logger.debug(f"Keyword filter: {len(nodes)}→{len(kept)} nodes ({len(nodes) - len(kept)} noise removed)")

    return kept


def _boost_recent_for_time_sensitive(nodes: list, query: str) -> list:
    """Boost scores of recent documents when query asks for latest/recent info.

    For time-sensitive categories like "recent", "predictive", "just_now",
    adds a score multiplier (up to 1.3×) for documents created within the
    last 7 days. Older documents are unchanged. This pushes fresh content
    to the top when recency matters, without affecting relevance-only queries.
    """
    time_cat = _detect_time_sensitivity(query)
    if time_cat not in ("recent", "predictive", "just_now"):
        return nodes
    if not nodes:
        return nodes

    from datetime import datetime, timezone
    now = datetime.now(timezone.utc)
    boosted: list = []
    for nws in nodes:
        node = getattr(nws, "node", None) or nws
        metadata = dict(getattr(node, "metadata", {}) or {})
        date_str = metadata.get("created") or metadata.get("date") or ""
        score = getattr(nws, "score", 0) or 0
        boost = 1.0
        if date_str:
            try:
                d = datetime.fromisoformat(str(date_str).replace("Z", "+00:00"))
                if d.tzinfo is None:
                    d = d.replace(tzinfo=timezone.utc)
                age_days = (now - d).days
                if age_days <= 1:
                    boost = 1.3
                elif age_days <= 3:
                    boost = 1.2
                elif age_days <= 7:
                    boost = 1.1
            except (ValueError, TypeError):
                pass
        nws.score = score * boost
        boosted.append(nws)

    # Re-sort by boosted score
    boosted.sort(key=lambda n: getattr(n, "score", 0) or 0, reverse=True)
    logger = logging.getLogger(__name__)
    logger.debug(f"Recency boost applied to {len(boosted)} nodes for time-sensitive query")
    return boosted


def _dedup_sources_by_file(sources: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Keep only the highest-scoring source per unique file_path.

    When retrieval returns multiple chunks from the same file, the
    frontend Sources list shows duplicates. This collapses them to
    one entry per file (the highest-scoring chunk), so the user sees
    each referenced file only once.
    """
    if len(sources) <= 1:
        return sources
    best: dict[str, dict[str, Any]] = {}
    for s in sources:
        fp = s.get("file_path", "") or "__unknown__"
        if fp not in best or s.get("score", 0) > best[fp].get("score", 0):
            best[fp] = s
    return sorted(best.values(), key=lambda s: s.get("score", 0) or 0, reverse=True)


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
    file_paths: list[str] | None = None,
) -> list[dict[str, Any]]:
    from domain.rag.history import record_query
    from domain.rag.indexer import ensure_kb_index

    ensure_settings_configured()
    index = ensure_kb_index()
    if index is None:
        logger.warning("RAG query blocked — index not built")
        return []
    k = top_k or settings.rag_top_k
    h = settings.rag_hybrid_retrieval_enabled if hybrid is None else hybrid
    r = settings.rag_rerank_enabled if rerank is None else rerank
    c = settings.rag_inline_citations_enabled if citations is None else citations
    nq = num_queries if num_queries is not None and num_queries > 0 else settings.rag_num_queries
    retriever = _build_retriever(
        index, top_k=k, scope=scope, hybrid=h, num_queries=nq,
        category=category, tags=tags, file_paths=file_paths,
    )
    t0 = time.perf_counter()
    retrieval_query = _enhance_query_for_retrieval(question)

    cache_key = (
        f"{_normalize_query(retrieval_query)}|{scope or ''}|{k}|{h}|{nq}"
        f"|{category or ''}|{','.join(sorted(tags or []))}"
    )
    now = time.time()
    nodes = None

    if cache_key in _retrieval_cache:
        ts, cached_nodes = _retrieval_cache[cache_key]
        if now - ts < _RETRIEVAL_CACHE_TTL:
            logger.info(f"RAG retrieval cache hit: {retrieval_query[:60]} ({len(cached_nodes)} nodes)")
            nodes = cached_nodes
        else:
            del _retrieval_cache[cache_key]

    if nodes is None:
        if hyde:
            retrieval_query = await _hyde_expand(retrieval_query, is_chat=False)
        try:
            nodes = retriever.retrieve(retrieval_query)
        except Exception as e:
            if "Nested MetadataFilters" in str(e):
                logger.warning(
                    "Nested MetadataFilters error during rag_query — "
                    "retrying without scope/category/tag filters"
                )
                try:
                    fallback = _build_retriever(
                        index, top_k=k, scope=None, hybrid=h, num_queries=nq,
                        category=None, tags=None, file_paths=None,
                    )
                    nodes = fallback.retrieve(retrieval_query)
                except Exception:
                    logger.warning(
                        "Retry without filters also failed — "
                        "falling back to bare retriever"
                    )
                    fallback = index.as_retriever(similarity_top_k=k)
                    nodes = fallback.retrieve(retrieval_query)
            else:
                raise
        # Normalize scores to 0-1 range and dedup identical chunks
        nodes = _normalize_scores(nodes)
        nodes = _dedup_identical_chunks(nodes)
        # Remove chunks with zero keyword overlap (embedding false positives)
        nodes = _filter_by_keyword_overlap(nodes, question)
        # Boost recent documents for time-sensitive queries (applied post-cache)
        nodes = _boost_recent_for_time_sensitive(nodes, question)
        if len(_retrieval_cache) >= _RETRIEVAL_CACHE_MAX:
            oldest = next(iter(_retrieval_cache))
            del _retrieval_cache[oldest]
        _retrieval_cache[cache_key] = (now, nodes)

    postprocessors = _build_postprocessors(r, k, sentence_window=settings.rag_sentence_window_enabled)
    for pp in postprocessors:
        nodes = pp.postprocess_nodes(nodes, query_str=question)
    if c:
        nodes = _NumberSourcesPostprocessor().postprocess_nodes(nodes, query_str=question)
    sources = [_source_dict(n) for n in nodes]
    sources = _dedup_sources_by_file(sources)

    record_query(
        question=question, scope=scope or "", top_k=k, sources=sources,
        latency_ms=round((time.perf_counter() - t0) * 1000),
        hybrid=h, rerank=r, citations=c, num_queries=nq,
        category=category or "", tags=tags,
    )
    logger.info(
        f"RAG query done: top_k={k} hybrid={h} rerank={r} hyde={hyde} "
        f"sources={len(sources)} latency={round((time.perf_counter() - t0) * 1000)}ms"
    )
    return sources


def rag_file_query(question: str, abs_path: str, top_k: int | None = None) -> list[dict[str, Any]]:
    from domain.rag.indexer import build_file_index

    ensure_settings_configured()
    index = build_file_index(abs_path)
    k = top_k or settings.rag_top_k
    retriever = index.as_retriever(similarity_top_k=k)
    nodes = retriever.retrieve(question)
    return [_source_dict(n) for n in nodes]


async def _hyde_expand(retrieval_query: str, is_chat: bool = False) -> str:
    """Generate a HyDE (Hypothetical Document Embedding) query expansion.

    Returns the HyDE-generated answer if it's long enough, otherwise the original query.
    """
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
        if hyde_answer and (not is_chat or len(hyde_answer) >= 30):
            logger.info(f"HyDE query generated: {len(hyde_answer)} chars")
            return hyde_answer
        if is_chat and hyde_answer:
            logger.info(f"HyDE answer too short ({len(hyde_answer)} chars), using enhanced query")
    except Exception as e:
        logger.warning(f"HyDE generation failed, falling back: {e}")
    return retrieval_query
