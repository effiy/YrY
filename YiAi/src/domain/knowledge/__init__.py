"""Knowledge base domain — public API.

Re-exports scanning + reading helpers for the ``~/YiKnowledge`` markdown tree.
Each markdown file carries a YAML frontmatter block (title / tags / category /
created / source / type …) — this module parses it lazily so the UI can render a
metadata-driven tree without pulling full file bodies.
"""
from domain.knowledge.scanner import (
    scan_knowledge,
    read_knowledge_file,
    list_stories,
    read_story_markdown,
)
from domain.knowledge.writer import (
    write_entry_markdown,
    entry_exists,
    read_entry_frontmatter,
    delete_entry_markdown,
)
from domain.knowledge.watcher import (
    init_knowledge_watcher,
    shutdown_knowledge_watcher,
    sync_knowledge_full,
    list_knowledge_files,
)

__all__ = [
    "scan_knowledge",
    "read_knowledge_file",
    "list_stories",
    "read_story_markdown",
    "write_entry_markdown",
    "entry_exists",
    "read_entry_frontmatter",
    "delete_entry_markdown",
    "init_knowledge_watcher",
    "shutdown_knowledge_watcher",
    "sync_knowledge_full",
    "list_knowledge_files",
]
