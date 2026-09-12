"""RAG domain — public API.

Re-exports the indexer + engine surface so callers (services, routes) don't
reach into internal modules.
"""
from domain.rag.indexer import (
    build_kb_index,
    get_kb_index,
    load_kb_index,
    preload_kb_index,
    rebuild_index,
    rebuild_index_async,
    refresh_index_for_changes,
    refresh_index_async,
    rag_status,
    rag_categories,
    build_file_index,
)
from domain.rag.engine import (
    rag_query,
    rag_chat_stream,
    rag_file_query,
    rag_file_chat_stream,
    rag_decompose,
)
from domain.rag.history import record_query, list_history, clear_history
from domain.rag.chat_history import (
    record_chat_turn,
    list_chat_history,
    clear_chat_history,
)
from domain.rag.paths import resolve_safe, base_dir
from domain.rag.settings import ensure_settings_configured

__all__ = [
    "base_dir",
    "build_file_index",
    "build_kb_index",
    "clear_chat_history",
    "clear_history",
    "ensure_settings_configured",
    "get_kb_index",
    "list_chat_history",
    "list_history",
    "load_kb_index",
    "preload_kb_index",
    "rag_categories",
    "rag_chat_stream",
    "rag_decompose",
    "rag_file_chat_stream",
    "rag_file_query",
    "rag_query",
    "rag_status",
    "rebuild_index",
    "rebuild_index_async",
    "record_chat_turn",
    "record_query",
    "refresh_index_async",
    "refresh_index_for_changes",
    "resolve_safe",
]
