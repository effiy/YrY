"""RAG domain — public API.

Re-exports the indexer + engine surface so callers (services, routes) don't
reach into internal modules.
"""
from domain.rag.indexer import (
    build_kb_index,
    get_kb_index,
    load_kb_index,
    rebuild_index,
    rebuild_index_async,
    refresh_index_for_changes,
    refresh_index_async,
    rag_status,
    build_file_index,
)
from domain.rag.engine import (
    rag_query,
    rag_chat_stream,
    rag_file_query,
    rag_file_chat_stream,
)
from domain.rag.paths import resolve_safe, base_dir
from domain.rag.settings import ensure_settings_configured

__all__ = [
    "build_kb_index",
    "get_kb_index",
    "load_kb_index",
    "rebuild_index",
    "rebuild_index_async",
    "refresh_index_for_changes",
    "refresh_index_async",
    "rag_status",
    "build_file_index",
    "rag_query",
    "rag_chat_stream",
    "rag_file_query",
    "rag_file_chat_stream",
    "resolve_safe",
    "base_dir",
    "ensure_settings_configured",
]
