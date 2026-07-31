"""YiKnowledge scanner — disk walk + YAML frontmatter parser.

Walks ``settings.knowledge_base_dir`` (default ``../YiKnowledge``) and returns
a category-grouped tree of markdown files with their parsed frontmatter so the
aicr page can render a metadata-driven knowledge sidebar.

Path safety: every requested path is resolved against the knowledge base dir
and rejected if it escapes that root (no ``..`` traversal, no abs paths).
"""
from __future__ import annotations

import logging
import mimetypes
import os
import re
from datetime import datetime
from typing import Any, Iterable

import yaml

from shared.config import settings
from shared.error_codes import ErrorCode
from shared.exceptions import BusinessException

logger = logging.getLogger(__name__)

# Top-level YiKnowledge categories (per ~/YiKnowledge/MEMORY.md). Files
# outside these dirs are still surfaced under "__root__" so users can drop
# loose markdown at the top level.
_TOP_CATEGORIES = (
    "industry",
    "lessons",
    "methodology",
    "people",
    "product",
    "projects",
    "resources",
    "tech",
    "work",
)

_FRONTMATTER_RE = re.compile(
    r"^---\s*\n(?P<yaml>.*?)\n---\s*(?P<rest>.*)$",
    re.DOTALL,
)


def _base_dir() -> str:
    return os.path.realpath(os.path.abspath(settings.knowledge_base_dir))


def _resolve_safe(rel_path: str) -> str:
    """Resolve a relative path against the knowledge base dir, rejecting escapes."""
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


def _parse_frontmatter(text: str) -> tuple[dict, str]:
    """Split a markdown file into (frontmatter_dict, body_text)."""
    match = _FRONTMATTER_RE.match(text)
    if not match:
        return {}, text
    raw_yaml = match.group("yaml")
    body = match.group("rest").lstrip("\n")
    try:
        meta = yaml.safe_load(raw_yaml) if raw_yaml.strip() else {}
    except yaml.YAMLError:
        meta = {}
    if not isinstance(meta, dict):
        meta = {}
    return meta, body


def _file_meta(rel_path: str, abs_path: str) -> dict:
    """Read the first ~15 lines for frontmatter only — progressive scan."""
    try:
        with open(abs_path, "r", encoding="utf-8", errors="replace") as f:
            # Read enough for any reasonable frontmatter; cap at 8KB.
            head = f.read(8192)
    except Exception as e:
        logger.warning(f"Failed to read knowledge file {rel_path}: {e}")
        return {
            "path": rel_path,
            "name": os.path.basename(rel_path),
            "category": _categorize(rel_path),
            "meta": {},
            "size": 0,
            "updatedAt": None,
        }

    meta, _ = _parse_frontmatter(head)
    stat = os.stat(abs_path)
    return {
        "path": rel_path,
        "name": os.path.basename(rel_path),
        "category": _categorize(rel_path),
        "meta": _normalize_meta(meta),
        "size": stat.st_size,
        "updatedAt": int(stat.st_mtime * 1000) if stat.st_mtime else None,
    }


def _extract_meta(rel_path: str, abs_path: str) -> dict:
    """Generic per-file metadata for the watcher's DB mirror.

    Markdown files get frontmatter parsed; all other files get an empty
    ``meta`` dict. Always returns ``isMarkdown`` and ``mime`` so the UI can
    distinguish file types without re-reading the file.
    """
    is_markdown = rel_path.lower().endswith(".md")
    stat = os.stat(abs_path)
    mime, _ = mimetypes.guess_type(rel_path)
    meta: dict[str, Any] = {}
    if is_markdown:
        try:
            with open(abs_path, "r", encoding="utf-8", errors="replace") as f:
                head = f.read(8192)
            raw_meta, _ = _parse_frontmatter(head)
            meta = _normalize_meta(raw_meta)
        except Exception as e:
            logger.warning(f"Failed to read knowledge file {rel_path}: {e}")
    return {
        "path": rel_path,
        "name": os.path.basename(rel_path),
        "category": _categorize(rel_path),
        "isMarkdown": is_markdown,
        "mime": mime,
        "meta": meta,
        "size": stat.st_size,
        "updatedAt": int(stat.st_mtime * 1000) if stat.st_mtime else None,
    }


def _categorize(rel_path: str) -> str:
    top = rel_path.split("/", 1)[0]
    if top in _TOP_CATEGORIES:
        return top
    if top == "static":
        return "static"
    return "__root__"


def _normalize_meta(meta: dict) -> dict:
    """Coerce frontmatter values to JSON-friendly primitives."""
    out: dict[str, Any] = {}
    for k, v in (meta or {}).items():
        if v is None:
            continue
        if isinstance(v, (str, int, float, bool)):
            out[k] = v
        elif isinstance(v, list):
            out[k] = [str(x) if not isinstance(x, (str, int, float, bool)) else x for x in v]
        elif isinstance(v, datetime):
            out[k] = v.isoformat()
        else:
            out[k] = str(v)
    return out


def scan_knowledge(category: str | None = None) -> dict:
    """Walk the knowledge base and return a category → file-list map.

    If ``category`` is given (e.g. ``"tech"``, ``"projects"``), only that
    subtree is walked. ``category="__root__"`` returns only top-level loose
    markdown files.
    """
    base = _base_dir()
    if not os.path.isdir(base):
        logger.warning(f"Knowledge base dir does not exist: {base}")
        return {"categories": []}

    if category:
        target = os.path.join(base, category)
        if not os.path.isdir(target):
            return {"categories": []}
        roots: list[tuple[str, str]] = [(category, target)]
    else:
        roots = [(c, os.path.join(base, c)) for c in _TOP_CATEGORIES if os.path.isdir(os.path.join(base, c))]
        # Plus top-level loose .md files
        roots.append(("__root__", base))

    categories: list[dict] = []
    for cat, root in roots:
        files: list[dict] = []
        if cat == "__root__":
            for name in sorted(os.listdir(root)):
                p = os.path.join(root, name)
                if os.path.isfile(p) and name.lower().endswith(".md"):
                    rel = name
                    files.append(_file_meta(rel, p))
        else:
            for dirpath, _dirs, filenames in os.walk(root):
                for fn in filenames:
                    if not fn.lower().endswith(".md"):
                        continue
                    abs_path = os.path.join(dirpath, fn)
                    rel = os.path.relpath(abs_path, base).replace(os.sep, "/")
                    files.append(_file_meta(rel, abs_path))
        if files:
            files.sort(key=lambda x: x.get("path", ""))
            categories.append({"category": cat, "files": files})

    return {"categories": categories}


def read_knowledge_file(rel_path: str) -> dict:
    """Read a single knowledge file, returning parsed frontmatter + body."""
    abs_path = _resolve_safe(rel_path)
    if not os.path.exists(abs_path) or not os.path.isfile(abs_path):
        raise BusinessException(ErrorCode.DATA_NOT_FOUND, message=f"Knowledge file not found: {rel_path}")
    with open(abs_path, "r", encoding="utf-8", errors="replace") as f:
        text = f.read()
    meta, body = _parse_frontmatter(text)
    return {
        "path": rel_path,
        "name": os.path.basename(rel_path),
        "category": _categorize(rel_path),
        "meta": _normalize_meta(meta),
        "content": body,
    }


def list_stories(project: str | None = None) -> dict:
    """List story.md files under ``projects/{project}/stories/``.

    The directory layout is semantic (per YiKnowledge/projects/README.md):
    ``projects/{project}/stories/{story-name}/story.md``. Each story.md's
    frontmatter carries the database ``key`` for cross-referencing with the
    stories collection.
    """
    base = _base_dir()
    projects_root = os.path.join(base, "projects")
    if not os.path.isdir(projects_root):
        return {"stories": []}
    if project:
        targets = [(project, os.path.join(projects_root, project))]
    else:
        targets = [
            (d, os.path.join(projects_root, d))
            for d in sorted(os.listdir(projects_root))
            if os.path.isdir(os.path.join(projects_root, d)) and not d.startswith(".")
        ]

    stories: list[dict] = []
    for proj, root in targets:
        if not os.path.isdir(root):
            continue
        stories_root = os.path.join(root, "stories")
        if not os.path.isdir(stories_root):
            continue
        for name in sorted(os.listdir(stories_root)):
            story_dir = os.path.join(stories_root, name)
            if not os.path.isdir(story_dir):
                continue
            story_md = os.path.join(story_dir, "story.md")
            if not os.path.isfile(story_md):
                continue
            rel = os.path.relpath(story_md, base).replace(os.sep, "/")
            entry = _file_meta(rel, story_md)
            entry["project"] = proj
            entry["storyName"] = name
            stories.append(entry)
    return {"stories": stories}


def read_story_markdown(project: str, story_name: str) -> dict:
    """Read a story's story.md, returning parsed frontmatter + body."""
    rel = f"projects/{project}/stories/{story_name}/story.md"
    return read_knowledge_file(rel)
