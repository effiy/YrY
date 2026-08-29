"""Knowledge service layer — public API.

Thin RPC-friendly wrappers around ``domain.knowledge`` write/delete helpers.
"""
from services.knowledge.knowledge_service import (
    delete_entry_markdown,
    entry_exists,
    write_entry_markdown,
)

__all__ = [
    "delete_entry_markdown",
    "entry_exists",
    "write_entry_markdown",
]
