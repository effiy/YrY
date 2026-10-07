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
from typing import Any

from domain.knowledge.frontmatter import (
    normalize_meta as _normalize_meta,
)
from domain.knowledge.frontmatter import (
    parse_frontmatter as _parse_frontmatter,
)
from shared.config import settings
from shared.error_codes import ErrorCode
from shared.exceptions import BusinessException

logger = logging.getLogger(__name__)

# Well-known YiKnowledge categories — surfaced first in the UI for stable ordering.
# Updated 2026-08-05: YiKnowledge restructured from category dirs
# (industry/lessons/methodology/people/product/projects/resources/tech/work)
# to 7 canonical role dirs. Additional top-level directories discovered on disk
# are appended alphabetically after these.
_WELL_KNOWN_CATEGORIES = (
    "product",
    "leader",
    "engineer",
    "sre",
    "executive",
    "aier",
    "curator",
)

# Directories that should never be surfaced as knowledge categories.
_SKIP_DIRS = frozenset({".git", "__pycache__", "node_modules", ".DS_Store", "rss"})


def _base_dir() -> str:
    return os.path.realpath(os.path.abspath(settings.knowledge_base_dir))


def resolve_safe(rel_path: str) -> str:
    """Resolve a relative path against the knowledge base dir, rejecting escapes."""
    cleaned = (rel_path or "").strip().replace("\\", "/")
    if not cleaned:
        raise BusinessException(ErrorCode.INVALID_PARAMS, message="Empty path")
    if cleaned.startswith("/"):
        raise BusinessException(ErrorCode.INVALID_PARAMS, message="Absolute paths not allowed")
    norm = os.path.normpath(cleaned)
    if os.path.isabs(norm):
        raise BusinessException(ErrorCode.INVALID_PARAMS, message="Invalid path")
    base = _base_dir()
    abs_path = os.path.realpath(os.path.abspath(os.path.join(base, norm)))
    if os.path.commonpath([base, abs_path]) != base:
        raise BusinessException(ErrorCode.INVALID_PARAMS, message="Path escapes knowledge base")
    return abs_path


def _file_meta(rel_path: str, abs_path: str) -> dict:
    """Read the first ~15 lines for frontmatter only — progressive scan."""
    try:
        with open(abs_path, encoding="utf-8", errors="replace") as f:
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

    raw_meta, body = _parse_frontmatter(head)
    meta = _normalize_meta(raw_meta)
    _enrich_body_fields(body, meta)
    stat = os.stat(abs_path)
    return {
        "path": rel_path,
        "name": os.path.basename(rel_path),
        "category": _categorize(rel_path),
        "meta": meta,
        "size": stat.st_size,
        "updatedAt": int(stat.st_mtime * 1000) if stat.st_mtime else None,
    }


def _enrich_body_fields(body: str, meta: dict) -> None:
    """Extract description / due_date / acceptance_criteria from markdown body.

    Only fills fields that are missing from frontmatter (frontmatter always wins).
    Modifies ``meta`` in-place.
    """
    if not body:
        return

    lines = body.split("\n")

    # ── due_date ── scan for patterns like "截止日期：2026-09-30" / "Due: 2026-09-30"
    if not meta.get("due_date") and not meta.get("dueDate"):
        for line in lines:
            m = re.search(
                r"(?:截止日期|截止|Due\s*Date|due_date|Due)[：:]\s*(\d{4}-\d{2}-\d{2})",
                line,
            )
            if m:
                meta["due_date"] = m.group(1)
                break

    # ── acceptance_criteria ── extract section containing 验收标准 / Acceptance Criteria
    if not meta.get("acceptance_criteria"):
        in_section = False
        buf: list[str] = []
        for line in lines:
            if re.match(r"^##\s+.*(?:验收标准|Acceptance\s+Criteria)", line, re.IGNORECASE):
                in_section = True
                continue
            if in_section:
                if line.startswith("## "):
                    break
                buf.append(line)
        text = "\n".join(buf).strip()
        if text:
            meta["acceptance_criteria"] = text

    # ── description ── first substantive paragraph after title/blockquote/separator
    if not meta.get("description"):
        desc_parts: list[str] = []
        started = False
        for line in lines:
            s = line.strip()
            if not started:
                if s.startswith("# "):  # title heading
                    continue
                if s.startswith("> "):  # metadata blockquote
                    continue
                if s == "---":  # horizontal rule
                    continue
                if not s:  # blank line
                    continue
                started = True
            # Stop at any ## heading — this is the first section, not a description
            if s.startswith("## "):
                break
            if s:
                desc_parts.append(s)
            elif desc_parts:
                break  # blank line after content = end of first paragraph
        if desc_parts:
            meta["description"] = " ".join(desc_parts)[:500]
        elif not desc_parts:
            # Fallback: use first section body as description (skip its heading)
            in_first_section = False
            for line in lines:
                s = line.strip()
                if not in_first_section:
                    if s.startswith("# "):  # title
                        continue
                    if s.startswith("> "):  # blockquote
                        continue
                    if s == "---":  # separator
                        continue
                    if not s:  # blank
                        continue
                    if s.startswith("## "):
                        in_first_section = True
                        continue
                else:
                    if s.startswith("## "):
                        break
                    if s:
                        desc_parts.append(s)
            if desc_parts:
                meta["description"] = " ".join(desc_parts)[:500]


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
            with open(abs_path, encoding="utf-8", errors="replace") as f:
                head = f.read(8192)
            raw_meta, body = _parse_frontmatter(head)
            meta = _normalize_meta(raw_meta)
            _enrich_body_fields(body, meta)
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


def _discover_category_dirs(base: str) -> list[str]:
    """Return sorted top-level directory names under *base*, well-known first."""
    try:
        entries = sorted(os.listdir(base))
    except OSError:
        return []
    dirs = [e for e in entries if os.path.isdir(os.path.join(base, e)) and not e.startswith(".") and e not in _SKIP_DIRS]
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
    directories (notes, static, …) appear automatically.
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
    abs_path = resolve_safe(rel_path)
    # Directory link (e.g. README's "Top-level tree" role column) →
    # resolve to README.md inside the directory.
    if os.path.isdir(abs_path):
        readme = os.path.join(abs_path, "README.md")
        if os.path.isfile(readme):
            abs_path = readme
            rel_path = f"{rel_path.rstrip('/')}/README.md"
    if not os.path.exists(abs_path) or not os.path.isfile(abs_path):
        raise BusinessException(ErrorCode.DATA_NOT_FOUND, message=f"Knowledge file not found: {rel_path}")
    with open(abs_path, encoding="utf-8", errors="replace") as f:
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


def get_project_knowledge_stats(project: str | None = None) -> dict:
    """Count .md files per category per project under YiKnowledge/projects/.

    Returns ``{ projects: { project_key: { category: count } } }``.
    Categories are the immediate subdirectories under each project dir
    (okrs, prds, devs, tests, bugs, workflows, requires).
    Template directories (``/模板/``) are excluded from counts.
    """
    base = _base_dir()
    projects_root = os.path.join(base, "projects")
    if not os.path.isdir(projects_root):
        return {"projects": {}}

    project_dirs: list[str]
    if project:
        resolved = _resolve_project_dir(projects_root, project)
        project_dirs = [os.path.basename(resolved)] if resolved else []
    else:
        try:
            project_dirs = sorted(
                d
                for d in os.listdir(projects_root)
                if os.path.isdir(os.path.join(projects_root, d)) and not d.startswith(".")
            )
        except OSError:
            return {"projects": {}}

    # Categories to count — subdirectories under each project dir
    _count_categories = {"okrs", "prds", "devs", "tests", "bugs", "workflows", "requires"}
    result: dict[str, dict[str, int]] = {}

    for proj in project_dirs:
        proj_root = os.path.join(projects_root, proj)
        if not os.path.isdir(proj_root):
            continue
        counts: dict[str, int] = {}
        try:
            entries = os.listdir(proj_root)
        except OSError:
            continue
        for entry in entries:
            if entry not in _count_categories:
                continue
            cat_dir = os.path.join(proj_root, entry)
            if not os.path.isdir(cat_dir):
                continue
            # Count .md files recursively, skipping template dirs
            n = 0
            for _root, _dirs, files in os.walk(cat_dir):
                _dirs[:] = [d for d in _dirs if d != "模板"]
                n += sum(1 for f in files if f.endswith(".md") and not f.startswith("."))
            if n:
                counts[entry] = n
        if counts:
            result[proj] = counts

    return {"projects": result}


# Re-export bug functions from the bugs module for backward compatibility.
# Other modules (knowledge_service.py, routes/knowledge.py, __init__.py)
# import list_bugs and read_bug_markdown from scanner.
from domain.knowledge.bugs import list_bugs, read_bug_markdown  # noqa: E402, F401
