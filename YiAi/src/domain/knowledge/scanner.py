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

# Well-known YiKnowledge categories — surfaced first in the UI for stable ordering.
# Updated 2026-08-05: YiKnowledge migrated from 9 legacy category dirs
# (industry/lessons/methodology/people/product/projects/resources/tech/work)
# to 7 canonical role dirs. Additional top-level directories discovered on disk
# are appended alphabetically after these.
_WELL_KNOWN_CATEGORIES = (
    "producter",
    "leader",
    "engineer",
    "srer",
    "executiver",
    "aier",
    "curator",
)

# Directories that should never be surfaced as knowledge categories.
_SKIP_DIRS = frozenset({".git", "__pycache__", "node_modules", ".DS_Store"})

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
    """Map a relative path to its top-level category.

    Root-level files (no directory component) → ``"__root__"``.
    Files inside a known top-level directory → that directory name.
    """
    parts = rel_path.split("/", 1)
    top = parts[0]
    # Single-segment path → root-level file
    if len(parts) == 1:
        return "__root__"
    # Top-level directory — use its name as the category
    return top


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


def _discover_category_dirs(base: str) -> list[str]:
    """Return sorted top-level directory names under *base*, well-known first."""
    try:
        entries = sorted(os.listdir(base))
    except OSError:
        return []
    dirs = [
        e for e in entries
        if os.path.isdir(os.path.join(base, e))
        and not e.startswith(".")
        and e not in _SKIP_DIRS
    ]
    # Well-known categories first (stable order), then any newly discovered ones
    known = [d for d in _WELL_KNOWN_CATEGORIES if d in dirs]
    extra = [d for d in dirs if d not in _WELL_KNOWN_CATEGORIES]
    return known + extra


def scan_knowledge(category: str | None = None) -> dict:
    """Walk the knowledge base and return a category → file-list map.

    If ``category`` is given (e.g. ``"tech"``, ``"projects"``), only that
    subtree is walked. ``category="__root__"`` returns only top-level loose
    markdown files.

    Categories are discovered dynamically from top-level directories so new
    directories (brd, notes, static, …) appear automatically.
    """
    base = _base_dir()
    if not os.path.isdir(base):
        logger.warning(f"Knowledge base dir does not exist: {base}")
        return {"categories": []}

    if category:
        if category == "__root__":
            roots: list[tuple[str, str]] = [("__root__", base)]
        else:
            target = os.path.join(base, category)
            if not os.path.isdir(target):
                return {"categories": []}
            roots = [(category, target)]
    else:
        cat_dirs = _discover_category_dirs(base)
        roots = [(c, os.path.join(base, c)) for c in cat_dirs]
        # Plus top-level loose files
        roots.append(("__root__", base))

    categories: list[dict] = []
    for cat, root in roots:
        files: list[dict] = []
        if cat == "__root__":
            for name in sorted(os.listdir(root)):
                p = os.path.join(root, name)
                if os.path.isfile(p) and not name.startswith("."):
                    rel = name
                    files.append(_file_meta(rel, p))
        else:
            for dirpath, _dirs, filenames in os.walk(root):
                for fn in filenames:
                    if fn.startswith("."):
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
    # Directory link (e.g. README's "Top-level tree" role column) →
    # resolve to README.md inside the directory.
    if os.path.isdir(abs_path):
        readme = os.path.join(abs_path, "README.md")
        if os.path.isfile(readme):
            abs_path = readme
            rel_path = f"{rel_path.rstrip('/')}/README.md"
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


def _resolve_project_dir(projects_root: str, project: str) -> str | None:
    """Resolve a project name to its on-disk directory under projects_root.

    YiKnowledge directory names are lowercase (``yiai``, ``yipet``, …) but
    MongoDB story records typically store the user-facing project name with
    original casing (``YiAi``, ``YiPet``). Try exact match first, then
    case-insensitive match against the actual directory listing.
    """
    exact = os.path.join(projects_root, project)
    if os.path.isdir(exact):
        return exact
    target = project.lower()
    try:
        for name in os.listdir(projects_root):
            if name.lower() == target and os.path.isdir(os.path.join(projects_root, name)):
                return os.path.join(projects_root, name)
    except OSError:
        pass
    return None


def list_stories(project: str | None = None) -> dict:
    """List story.md files under ``engineer/learn/projects/{project}/stories/``.

    The directory layout is semantic (per YiKnowledge/engineer/learn/projects/README.md):
    ``engineer/learn/projects/{project}/stories/{story-name}/story.md``. Each story.md's
    frontmatter carries the database ``key`` for cross-referencing with the
    stories collection.

    Updated 2026-08-05: ``projects/`` migrated under the ``engineer/learn/``
    role directory as part of the category-dir restructure. Legacy
    ``projects/`` root no longer exists.
    """
    base = _base_dir()
    projects_root = os.path.join(base, "engineer", "learn", "projects")
    if not os.path.isdir(projects_root):
        return {"stories": []}
    if project:
        resolved = _resolve_project_dir(projects_root, project)
        targets = [(project, resolved)] if resolved else []
    else:
        targets = [
            (d, os.path.join(projects_root, d))
            for d in sorted(os.listdir(projects_root))
            if os.path.isdir(os.path.join(projects_root, d)) and not d.startswith(".")
        ]

    stories: list[dict] = []
    for proj, root in targets:
        if not root or not os.path.isdir(root):
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
    base = _base_dir()
    projects_root = os.path.join(base, "engineer", "learn", "projects")
    resolved = _resolve_project_dir(projects_root, project)
    if not resolved:
        raise BusinessException(ErrorCode.DATA_NOT_FOUND, message=f"Project not found: {project}")
    rel = f"engineer/learn/projects/{os.path.basename(resolved)}/stories/{story_name}/story.md"
    return read_knowledge_file(rel)
