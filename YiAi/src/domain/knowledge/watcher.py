"""Knowledge file watcher — public API re-exports.

All logic lives in:
- snapshot.py: file system snapshot utilities
- watcher_manager.py: KnowledgeWatcherManager class + public lifecycle functions
"""

from domain.knowledge.snapshot import (  # noqa: F401
    _build_all_snapshot,
    _build_md_snapshot,
    _now_str,
    _rel_from_abs,
    _should_skip,
    _snapshot_diff,
)
from domain.knowledge.watcher_manager import (  # noqa: F401
    KnowledgeWatcherManager,
    get_last_scan_time,
    init_knowledge_watcher,
    list_knowledge_files,
    shutdown_knowledge_watcher,
    sync_knowledge_full,
)
