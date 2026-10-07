"""llama_index indexer — public API re-exports.

All functions are imported from their canonical homes in kb_indexer.py and
file_indexer.py. External callers should continue to import from domain.rag.indexer.
"""

from domain.rag.file_indexer import (  # noqa: F401
    build_file_index,
    rag_categories,
)
from domain.rag.kb_indexer import (  # noqa: F401
    build_kb_index,
    ensure_kb_index,
    get_kb_index,
    is_index_available,
    is_index_building,
    load_kb_index,
    preload_kb_index,
    rag_status,
    rebuild_index,
    rebuild_index_async,
    refresh_index_async,
    refresh_index_for_changes,
    trigger_background_build,
)
