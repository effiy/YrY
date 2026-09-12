"""RAG service layer — thin RPC-friendly wrappers.

Mirrors ``services/knowledge/knowledge_service.py`` — accepts a single
``params`` dict, delegates to the domain. Chat streaming bypasses this and
goes through ``/rag-chat`` directly because the SSE response can't fit the
unified ``{code,message,data}`` envelope.
"""
from __future__ import annotations

from typing import Any, Dict

from domain.rag import rag_query, rag_status, rebuild_index


def query(params: Dict[str, Any]) -> Dict[str, Any]:
    """RPC entry point for one-shot retrieval.

    ``params``: ``{ question, top_k?, scope? }``. Returns ``{ sources: [...] }``.
    """
    question = params.get("question") or ""
    if not question.strip():
        return {"sources": []}
    top_k = params.get("top_k")
    scope = params.get("scope")
    sources = rag_query(question, top_k=top_k, scope=scope)
    return {"sources": sources}


def status(_params: Dict[str, Any] | None = None) -> Dict[str, Any]:
    """RPC entry point — returns index build status."""
    return rag_status()


def rebuild(_params: Dict[str, Any] | None = None) -> Dict[str, Any]:
    """RPC entry point — synchronously rebuild the index.

    Callers that can wait should use the ``/rag-build`` route instead, which
    wraps ``rebuild_index_async`` and runs in a thread.
    """
    rebuild_index()
    return rag_status()
