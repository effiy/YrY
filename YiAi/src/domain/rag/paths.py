"""Path safety for the RAG domain.

Reuses the scanner's ``_resolve_safe`` pattern: every requested relative
path is anchored at ``settings.knowledge_base_dir`` and rejected on escape.
Single-purpose helper so ``indexer.py`` / ``engine.py`` don't each roll
their own.
"""
from __future__ import annotations

import os

from shared.config import settings
from shared.error_codes import ErrorCode
from shared.exceptions import BusinessException


def base_dir() -> str:
    return os.path.realpath(os.path.abspath(settings.knowledge_base_dir))


def resolve_safe(rel_path: str) -> str:
    """Resolve a relative path against the knowledge base dir, rejecting escapes."""
    cleaned = (rel_path or "").strip().replace("\\", "/")
    if not cleaned:
        raise BusinessException(ErrorCode.INVALID_PARAMS, message="Empty path")
    if cleaned.startswith("/"):
        raise BusinessException(ErrorCode.INVALID_PARAMS, message="Absolute paths not allowed")
    norm = os.path.normpath(cleaned)
    if norm.startswith("..") or os.path.isabs(norm):
        raise BusinessException(ErrorCode.INVALID_PARAMS, message="Invalid path")
    base = base_dir()
    abs_path = os.path.realpath(os.path.abspath(os.path.join(base, norm)))
    if os.path.commonpath([base, abs_path]) != base:
        raise BusinessException(ErrorCode.INVALID_PARAMS, message="Path escapes knowledge base")
    return abs_path
