"""Retriever builders for the RAG engine.

Pure retrieval construction — no HTTP, no LLM calls. Builds vector, hybrid
(vector+BM25), and metadata-filtered retrievers over a llama_index index.

Public surface (used by engine.py):
    - ``_build_retriever(index, top_k, scope, hybrid, num_queries, category, tags, file_paths)``
    - ``_build_postprocessors(rerank_enabled, top_n, sentence_window)``
    - ``_scope_filters(scope, category, tags, file_paths)``
    - ``_source_dict(node_with_score)``
    - ``_cached_bm25(index, top_k)``
    - ``_flatten_metadata_filters(filters)`` — defensive flatten against nested MetadataFilters
"""
from __future__ import annotations

import logging
from typing import Any

from llama_index.core.vector_stores import MetadataFilters

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


def _source_dict(node_with_score: Any) -> dict[str, Any]:
    node = getattr(node_with_score, "node", None) or node_with_score
    metadata = dict(getattr(node, "metadata", {}) or {})
    text = getattr(node, "get_content", lambda: "")() or getattr(node, "text", "") or ""
    score = getattr(node_with_score, "score", None)
    file_path = metadata.get("file_path") or metadata.get("filename") or ""
    title = metadata.get("title", "")
    category = metadata.get("category", "")
    doc_date = metadata.get("created") or metadata.get("date") or ""

    # Authority level for frontend display
    authority = _classify_authority(file_path, category)

    # Relative time for frontend display
    rel_time = _compute_relative_time(str(doc_date)) if doc_date else ""

    return {
        "file_path": file_path,
        "score": float(score) if score is not None else 0.0,
        "text": text,
        "metadata": metadata,
        "title": title,
        "category": category,
        "date": doc_date,
        "authority": authority,
        "rel_time": rel_time,
    }


def _classify_authority(file_path: str, category: str) -> str:
    """Classify source authority: authoritative | empirical | process | report | reference."""
    fp = (file_path or "").lower()
    cat = (category or "").lower()
    if any(p in fp for p in ("/specs/", "/spec/", "/architecture/", "/governance/")) or \
       cat in ("spec", "specification", "architecture", "governance", "standard"):
        return "authoritative"
    if any(p in fp for p in ("/lessons/", "/lesson/", "/gotchas/", "/failures/")) or \
       cat in ("lesson", "gotcha", "failure", "bug", "incident", "postmortem"):
        return "empirical"
    if any(p in fp for p in ("/workflows/", "/workflow/", "/process/")) or \
       cat in ("workflow", "process", "procedure", "guide", "how-to"):
        return "process"
    if any(p in fp for p in ("/reports/", "/report/", "/dashboard/", "/analytics/")) or \
       cat in ("report", "dashboard", "analytics", "metrics", "kpi"):
        return "report"
    return "reference"


def _compute_relative_time(date_str: str) -> str:
    """Compute relative time label: 'today', '3d ago', '2w ago', 'stale'."""
    if not date_str:
        return ""
    from datetime import datetime, timezone
    try:
        d = datetime.fromisoformat(date_str.replace("Z", "+00:00"))
        if d.tzinfo is None:
            d = d.replace(tzinfo=timezone.utc)
        delta = datetime.now(timezone.utc) - d
        days = delta.days
        if days < 0:
            return ""
        if days == 0:
            return "today"
        if days == 1:
            return "yesterday"
        if days < 7:
            return f"{days}d ago"
        if days < 30:
            return f"{days // 7}w ago"
        if days < 365:
            return f"{days // 30}mo ago"
        return "stale"
    except (ValueError, TypeError):
        return ""


def _flatten_metadata_filters(filters):
    """Recursively flatten nested MetadataFilters into a flat list of MetadataFilter.

    llama_index's MetadataFilters.filters is ``List[Union[MetadataFilter,
    MetadataFilters]]`` — nested structures can arise from Pydantic Union
    coercion, internal retriever wrapping, or callers accidentally passing
    MetadataFilters where MetadataFilter is expected. The default vector
    store's ``build_metadata_filter_fn`` raises ``"Nested MetadataFilters
    are not supported"`` when any item in the list is a MetadataFilters
    instance. This utility guarantees a flat list, safe for any vector store.

    Returns a flat ``list[MetadataFilter]``, or ``None`` when *filters* is
    None/empty.
    """
    if filters is None:
        return None

    flat: list = []
    stack: list = []
    # Accept both a MetadataFilters container and a raw list of items.
    if isinstance(filters, MetadataFilters):
        stack.extend(filters.filters)
    elif isinstance(filters, list):
        stack.extend(filters)
    else:
        stack.append(filters)

    while stack:
        item = stack.pop(0)
        if isinstance(item, MetadataFilters):
            # Nested MetadataFilters — unfold into the stack
            stack.extend(item.filters)
            logger.debug(f"Flattening nested MetadataFilters with {len(item.filters)} items")
        else:
            flat.append(item)

    return flat if flat else None


def _scope_filters(scope: str | None, category: str | None = None, tags: list[str] | None = None, file_paths: list[str] | None = None):
    """Build a MetadataFilters restricting retrieved chunks by frontmatter.

    Combines (AND) any of:
      - ``file_path`` CONTAINS ``scope`` (substring on path)
      - ``file_path`` CONTAINS each path in ``file_paths`` (OR-combined within file_paths, AND with other filters)
      - ``category`` TEXT_MATCH ``category`` (exact category)
      - ``tags`` CONTAINS each tag (one filter per tag, AND-combined)

    Returns ``None`` when no filters apply — caller should not pass a
    filter in that case so the retriever uses its default behavior.
    """
    from llama_index.core.vector_stores import FilterOperator, MetadataFilter, MetadataFilters

    filters: list[Any] = []
    if scope:
        filters.append(MetadataFilter(
            key="file_path",
            operator=FilterOperator.CONTAINS,
            value=scope,
        ))
    if file_paths:
        if len(file_paths) == 1:
            filters.append(MetadataFilter(
                key="file_path", operator=FilterOperator.CONTAINS, value=file_paths[0],
            ))
        else:
            # ANY checks whether metadata's file_path contains any of the
            # specified paths (substring match) — same semantics as CONTAINS
            # OR-combined, without nesting MetadataFilters.
            filters.append(MetadataFilter(
                key="file_path", operator=FilterOperator.ANY, value=file_paths,
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
                operator=FilterOperator.CONTAINS,
                value=t,
            ))
    if not filters:
        return None
    # Defensive flatten — guard against nested MetadataFilters from any edge case
    flat_filters = _flatten_metadata_filters(filters)
    if not flat_filters:
        return None
    return MetadataFilters(filters=flat_filters)


def _patch_retriever_filters(retriever: Any) -> None:
    """Flatten *retriever*'s internal ``_filters`` in-place.

    llama_index's ``VectorIndexRetriever`` stores filters as ``self._filters``
    and passes them through to the vector store.  Even when we provide a flat
    ``MetadataFilters`` to ``index.as_retriever()``, internal wrapping can
    re-nest them.  This function reaches into the retriever and replaces any
    nested structure with a flat ``MetadataFilters`` so the vector store's
    ``build_metadata_filter_fn`` never raises ``"Nested MetadataFilters are
    not supported"``.
    """
    stored = getattr(retriever, "_filters", None)
    if stored is None:
        return
    flat = _flatten_metadata_filters(stored)
    if flat is not None:
        retriever._filters = MetadataFilters(filters=flat)


def _build_retriever(index: Any, top_k: int, scope: str | None, hybrid: bool, num_queries: int = 1, category: str | None = None, tags: list[str] | None = None, file_paths: list[str] | None = None) -> Any:
    """Build a retriever over ``index``, optionally hybrid (vector + BM25).

    Hybrid uses ``QueryFusionRetriever`` with relative score fusion so
    queries with strong keywords (where BM25 excels) AND conceptual queries
    (where vector embedding excels) both surface the right docs.
    Relative score preserves each retriever's confidence magnitude — a
    strong BM25 keyword match and a strong semantic match both contribute
    proportionally, unlike reciprocal rank which discards score information.

    When a scope/category/tag filter is active, hybrid is disabled because
    BM25Retriever does not support metadata filters — falling back to pure
    vector retrieval ensures only documents matching the filters are returned.

    ``num_queries`` controls LLM-generated query variants inside the fusion
    retriever (llama_index's multi-query expansion). ``1`` = no variant
    generation (just the user's query). ``>1`` makes the LLM produce N
    paraphrases which are fused via relative score — useful for ambiguous
    or under-specified questions. Only honored when hybrid is active and
    no metadata filter is applied; ignored otherwise (mirrors the hybrid guard).
    """
    filters = _scope_filters(scope, category, tags, file_paths)
    # Second line of defense — flatten any nested MetadataFilters that may have
    # been introduced by Pydantic Union coercion or internal index wrapping.
    if filters is not None:
        flat = _flatten_metadata_filters(filters)
        if flat is not None:
            filters = MetadataFilters(filters=flat)
    # BM25 doesn't support metadata filters — fall back to vector-only when filtered
    if not hybrid or filters is not None:
        kwargs: dict[str, Any] = {"similarity_top_k": top_k}
        if filters is not None:
            kwargs["filters"] = filters
        retriever = index.as_retriever(**kwargs)
        # Patch the retriever's internal _filters in case llama_index re-wrapped them
        if filters is not None:
            _patch_retriever_filters(retriever)
        return retriever
    from llama_index.core.retrievers import QueryFusionRetriever
    bm25 = _cached_bm25(index, top_k)
    vector = index.as_retriever(similarity_top_k=top_k)
    nq = max(1, int(num_queries or 1))
    return QueryFusionRetriever(
        retrievers=[vector, bm25],
        similarity_top_k=top_k,
        num_queries=nq,
        mode="relative_score",
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
