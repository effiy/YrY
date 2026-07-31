"""YiKnowledge writer — persist RSS entries (and other auto-curated content)
as markdown files with YAML frontmatter under the knowledge base dir.

Mirror of the scanner's path-safety rules: every path must resolve under
``settings.knowledge_base_dir``; escapes are rejected.
"""
from __future__ import annotations

import logging
import os
import re
from typing import Any

import yaml

from shared.config import settings
from shared.error_codes import ErrorCode
from shared.exceptions import BusinessException

logger = logging.getLogger(__name__)

_FRONTMATTER_RE = re.compile(r"^---\s*\n(?P<yaml>.*?)\n---\s*(?P<rest>.*)$", re.DOTALL)


def _base_dir() -> str:
    return os.path.realpath(os.path.abspath(settings.knowledge_base_dir))


def _resolve_safe(rel_path: str) -> str:
    cleaned = (rel_path or "").strip().replace("\\", "/")
    if not cleaned:
        raise BusinessException(ErrorCode.INVALID_PARAMS, message="Empty path")
    if cleaned.startswith("/"):
        raise BusinessException(ErrorCode.INVALID_PARAMS, message="Absolute paths not allowed")
    norm = os.path.normpath(cleaned)
    if norm.startswith("..") or os.path.isabs(norm):
        raise BusinessException(ErrorCode.INVALID_PARAMS, message="Invalid path")
    base = _base_dir()
    abs_path = os.path.realpath(os.path.abspath(os.path.join(base, norm)))
    if os.path.commonpath([base, abs_path]) != base:
        raise BusinessException(ErrorCode.INVALID_PARAMS, message="Path escapes knowledge base")
    return abs_path


def _normalize_meta(meta: dict) -> dict:
    """Drop None values and coerce non-scalar types to strings so YAML round-trips cleanly."""
    out: dict[str, Any] = {}
    for k, v in (meta or {}).items():
        if v is None or v == "":
            continue
        if isinstance(v, (str, int, float, bool)):
            out[k] = v
        elif isinstance(v, list):
            out[k] = [str(x) if not isinstance(x, (str, int, float, bool)) else x for x in v if x is not None and x != ""]
        else:
            out[k] = str(v)
    return out


def write_entry_markdown(rel_path: str, content: str, meta: dict) -> str:
    """Write a markdown file with YAML frontmatter under the knowledge base.

    Idempotent: overwrites the file if it already exists. Returns the relative
    path written (same as ``rel_path``). The body is appended verbatim after
    the frontmatter block.
    """
    abs_path = _resolve_safe(rel_path)
    os.makedirs(os.path.dirname(abs_path) or _base_dir(), exist_ok=True)
    front = yaml.safe_dump(_normalize_meta(meta), allow_unicode=True, sort_keys=False, default_flow_style=False).strip()
    text = f"---\n{front}\n---\n\n{content.lstrip()}"
    with open(abs_path, "w", encoding="utf-8") as f:
        f.write(text)
    return rel_path


def entry_exists(rel_path: str) -> bool:
    """True if a knowledge file already exists at the relative path."""
    try:
        abs_path = _resolve_safe(rel_path)
    except BusinessException:
        return False
    return os.path.isfile(abs_path)


def delete_entry_markdown(rel_path: str) -> bool:
    """Delete a knowledge markdown file at the relative path.

    Returns True if a file was removed, False if it did not exist. Mirrors
    ``entry_exists`` for path-safety. Used by callers that persist bug/issue
    metadata in MongoDB but keep the long-form body under YiKnowledge — when
    the metadata doc is deleted, the markdown file must go too.
    """
    try:
        abs_path = _resolve_safe(rel_path)
    except BusinessException:
        return False
    if not os.path.isfile(abs_path):
        return False
    os.remove(abs_path)
    return True


def read_entry_frontmatter(rel_path: str) -> dict:
    """Return parsed frontmatter for an existing file, or empty dict on miss."""
    try:
        abs_path = _resolve_safe(rel_path)
    except BusinessException:
        return {}
    if not os.path.isfile(abs_path):
        return {}
    with open(abs_path, "r", encoding="utf-8", errors="replace") as f:
        head = f.read(8192)
    m = _FRONTMATTER_RE.match(head)
    if not m:
        return {}
    try:
        meta = yaml.safe_load(m.group("yaml")) if m.group("yaml").strip() else {}
    except yaml.YAMLError:
        return {}
    return meta if isinstance(meta, dict) else {}
