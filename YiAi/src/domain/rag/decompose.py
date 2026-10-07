"""RAG sub-question decomposition via SubQuestionQueryEngine."""

from __future__ import annotations

import logging
from typing import Any

from domain.rag.post_processors import _NumberSourcesPostprocessor
from domain.rag.retrievers import _flatten_metadata_filters, _patch_retriever_filters, _scope_filters, _source_dict
from domain.rag.settings import ensure_settings_configured
from shared.config import settings

logger = logging.getLogger(__name__)


def rag_decompose(
    question: str,
    scope: str | None = None,
    sub_q_top_k: int | None = None,
    citations: bool | None = None,
    category: str | None = None,
    tags: list[str] | None = None,
    file_paths: list[str] | None = None,
) -> dict[str, Any]:
    from llama_index.core.query_engine import SubQuestionQueryEngine
    from llama_index.core.tools import QueryEngineTool, ToolMetadata
    from llama_index.core.vector_stores import MetadataFilters

    from domain.rag.indexer import ensure_kb_index

    ensure_settings_configured()
    index = ensure_kb_index()
    if index is None:
        return {"original": question, "synthesis": "", "sub_questions": [], "error": "RAG index not built yet"}
    k = sub_q_top_k or settings.rag_top_k
    c = settings.rag_inline_citations_enabled if citations is None else citations

    filters = _scope_filters(scope, category=category, tags=tags, file_paths=file_paths)
    # Flatten before passing to as_query_engine — same defense as _build_retriever
    if filters is not None:
        flat = _flatten_metadata_filters(filters)
        if flat is not None:
            filters = MetadataFilters(filters=flat)
    postprocessors: list = []
    if c:
        postprocessors.append(_NumberSourcesPostprocessor())
    if filters is not None:
        query_engine = index.as_query_engine(
            similarity_top_k=k, filters=filters, node_postprocessors=postprocessors,
        )
        # Patch the query engine's internal retriever _filters in case
        # as_query_engine re-wrapped them
        if hasattr(query_engine, "_retriever"):
            _patch_retriever_filters(query_engine._retriever)
    else:
        query_engine = index.as_query_engine(
            similarity_top_k=k, node_postprocessors=postprocessors,
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
