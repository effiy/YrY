"""Bug markdown scanning — list and read bug entries under projects/*/bugs/.

Bug markdown files live under ``projects/{project_key}/bugs/{date}/{typeDir}/{key}.md``.
This module parses their frontmatter into BugDocument-like dicts and reads
the markdown body for BugContent (description, steps, expected, etc.).
"""
from __future__ import annotations

import logging
import os
import re

from domain.knowledge.frontmatter import normalize_meta, parse_frontmatter

logger = logging.getLogger(__name__)

_BUG_TYPE_DIR_REVERSE: dict[str, str] = {
    "logic": "functional",
    "performance": "performance",
    "style": "ui",
    "security": "security",
    "compatibility": "compatibility",
    "regression": "regression",
    "data": "data",
    "other": "other",
    # YiKnowledge custom classification directories
    "template": "functional",
    "validation": "functional",
    "code-quality": "other",
}


def parse_bug_frontmatter(meta: dict, rel_path: str, abs_path: str) -> dict:
    """Coerce a bug markdown's YAML frontmatter + file stat into a BugDocument-like dict."""
    stat = os.stat(abs_path)
    mtime = int(stat.st_mtime * 1000) if stat.st_mtime else 0
    ctime = int(stat.st_ctime * 1000) if stat.st_ctime else 0

    # Extract project / date / typeDir from the path.
    # 6-level: projects/{project}/bugs/{date}/{typeDir}/{key}.md (canonical)
    # 5-level: projects/{project}/bugs/{typeDir}/{key}.md (no date segment)
    parts = rel_path.split("/")
    project_key = ""
    type_dir = ""
    key_from_name = ""
    if len(parts) >= 5 and parts[0] == "projects" and parts[2] == "bugs":
        project_key = parts[1]
        if len(parts) >= 6:
            type_dir = parts[4]
            key_from_name = os.path.splitext(parts[5])[0]
        else:
            type_dir = parts[3]
            key_from_name = os.path.splitext(parts[4])[0]

    # Prefer frontmatter fields; fall back to path-derived values
    bug_type = _BUG_TYPE_DIR_REVERSE.get(type_dir, "other")

    def _as_int(v) -> int | None:
        if v is None or v == "":
            return None
        if isinstance(v, int | float):
            return int(v)
        if isinstance(v, str):
            try:
                s = v.strip()
                if len(s) >= 10 and "-" in s:  # ISO date → timestamp (ms)
                    import datetime as _dt

                    try:
                        dt = _dt.datetime.fromisoformat(s.replace("Z", "+00:00"))
                        return int(dt.timestamp() * 1000)
                    except (ValueError, OverflowError, OSError):
                        return None
                return int(s)
            except ValueError:
                return None
        return None

    def _ts_from_iso(field: str) -> int | None:
        v = meta.get(field)
        if not v:
            return None
        if isinstance(v, int | float):
            return int(v)
        if isinstance(v, str) and "-" in v:
            import datetime as _dt

            try:
                dt = _dt.datetime.fromisoformat(v.replace("Z", "+00:00"))
                return int(dt.timestamp() * 1000)
            except (ValueError, OverflowError, OSError):
                return None
        return _as_int(v)

    created_ts = _ts_from_iso("created") or ctime
    updated_ts = _ts_from_iso("updated") or mtime
    resolved_ts = _ts_from_iso("resolvedAt") or (
        updated_ts if str(meta.get("status", "")).lower() in {"resolved", "closed"} else None
    )
    closed_ts = _ts_from_iso("closedAt") or (
        updated_ts if str(meta.get("status", "")).lower() == "closed" else None
    )

    key = str(meta.get("key") or key_from_name or "")
    tags = meta.get("tags")
    if isinstance(tags, list):
        tags = [str(t) for t in tags]
    elif isinstance(tags, str):
        tags = [t.strip() for t in tags.split(",") if t.strip()]
    else:
        tags = []

    return {
        "key": key,
        "title": str(meta.get("title") or key_from_name or ""),
        "project": str(meta.get("project") or project_key or ""),
        "project_key": str(meta.get("project_key") or project_key or ""),
        "issue_key": str(meta.get("issue_key") or meta.get("issueKey") or ""),
        "module": str(meta.get("module") or ""),
        "iteration": str(meta.get("iteration") or ""),
        "defectUrl": str(meta.get("defectUrl") or meta.get("defect_url") or ""),
        "severity": str(meta.get("severity") or "minor"),
        "priority": str(meta.get("priority") or "p2"),
        "status": str(meta.get("status") or "open"),
        "type": bug_type if (str(meta.get("type") or "") in {"", "bug"}) else str(meta.get("type")),
        "frequency": str(meta.get("frequency") or "sometimes"),
        "assignee": str(meta.get("assignee") or ""),
        "reporter": str(meta.get("reporter") or ""),
        "environment": str(meta.get("environment") or ""),
        "affectedVersion": str(meta.get("affectedVersion") or meta.get("affected_version") or ""),
        "fixedVersion": str(meta.get("fixedVersion") or meta.get("fixed_version") or ""),
        "tags": tags,
        "dueDate": _as_int(meta.get("dueDate") or meta.get("due_date")),
        "contentPath": rel_path,
        "createdAt": created_ts,
        "updatedAt": updated_ts,
        "resolvedAt": resolved_ts,
        "closedAt": closed_ts,
    }


def list_bugs(project: str | None = None) -> dict:
    """List bug markdown files under ``projects/{project}/bugs/{date}/{type}/``.

    Directory layout (mirrors :func:`contentPathFor` on the YiVad side):
        ``projects/{project_key}/bugs/{YYYY-MM-DD}/{typeDir}/{key}.md``

    The frontmatter of each file carries the full ``BugDocument`` fields so the
    list view can be rendered entirely from disk — no MongoDB lookup needed.
    Legacy ``type: bug`` in frontmatter is coerced via the ``typeDir`` segment
    of the path (logic → functional, style → ui, …).
    """
    from domain.knowledge.scanner import _base_dir, _resolve_project_dir

    base = _base_dir()
    projects_root = os.path.join(base, "projects")
    if not os.path.isdir(projects_root):
        return {"bugs": [], "total": 0}

    # Resolve target project dir(s) — match the case-insensitive pattern used by stories
    if project:
        resolved = _resolve_project_dir(projects_root, project)
        targets = [(project, resolved)] if resolved else []
    else:
        targets = [
            (d, os.path.join(projects_root, d))
            for d in sorted(os.listdir(projects_root))
            if os.path.isdir(os.path.join(projects_root, d)) and not d.startswith(".")
        ]

    bugs: list[dict] = []
    for proj, proj_dir in targets:
        if not proj_dir or not os.path.isdir(proj_dir):
            continue
        bugs_root = os.path.join(proj_dir, "bugs")
        if not os.path.isdir(bugs_root):
            continue
        for dirpath, _dirs, filenames in os.walk(bugs_root):
            for fn in sorted(filenames):
                if not fn.lower().endswith(".md") or fn.startswith("."):
                    continue
                abs_path = os.path.join(dirpath, fn)
                rel = os.path.relpath(abs_path, base).replace(os.sep, "/")
                # Read frontmatter — cap at 16KB head for progressivity
                try:
                    with open(abs_path, encoding="utf-8", errors="replace") as f:
                        head = f.read(16384)
                except Exception as e:
                    logger.warning(f"Failed to read bug file {rel}: {e}")
                    continue
                raw_meta, _body = parse_frontmatter(head)
                # Skip non-bug files (README.md, index files, etc.)
                if str(raw_meta.get("type", "")).lower() != "bug":
                    continue
                doc = parse_bug_frontmatter(normalize_meta(raw_meta), rel, abs_path)
                doc["project_key"] = doc.get("project_key") or proj
                bugs.append(doc)

    # Sort by updatedAt desc (newest first) — same order as the MongoDB query
    bugs.sort(key=lambda b: b.get("updatedAt") or 0, reverse=True)
    return {"bugs": bugs, "total": len(bugs)}


def read_bug_markdown(content_path: str) -> dict:
    """Read a single bug markdown file.

    ``content_path`` is the relative path stored on the BugDocument (e.g.
    ``projects/yivad/bugs/2026-08-21/logic/issue-detail-comment.md``). The
    frontmatter is coerced to the ``BugDocument`` shape via
    :func:`parse_bug_frontmatter` and the body is parsed into
    ``BugContent`` (description / steps / expected / actual / cause / solution).
    """
    from domain.knowledge.scanner import read_knowledge_file, resolve_safe

    file_entry = read_knowledge_file(content_path)
    abs_path = resolve_safe(content_path)
    doc = parse_bug_frontmatter(
        normalize_meta(file_entry.get("meta") or {}), content_path, abs_path
    )
    body = file_entry.get("content") or ""
    sections: dict[str, str] = {}
    current: str | None = None
    buf: list[str] = []
    for line in body.split("\n"):
        m = re.match(r"^##\s+(.+?)\s*$", line)
        if m:
            if current:
                sections[current] = "\n".join(buf).strip()
            current = m.group(1).strip()
            buf = []
        elif current:
            buf.append(line)
    if current:
        sections[current] = "\n".join(buf).strip()

    def _strip_placeholder(s: str) -> str:
        placeholders = {
            "_No description provided._",
            "_No steps recorded._",
            "_Not specified._",
            "_Root cause not yet recorded._",
            "_Solution not yet recorded._",
        }
        return "" if s.strip() in placeholders else s

    steps: list[str] = []
    raw_steps = sections.get("Steps to Reproduce", "")
    for line in raw_steps.split("\n"):
        cleaned = re.sub(r"^\s*\d+\.\s*", "", line).strip()
        if cleaned:
            steps.append(cleaned)

    content = {
        "description": _strip_placeholder(sections.get("Description", "")),
        "stepsToReproduce": steps,
        "expectedResult": _strip_placeholder(sections.get("Expected Result", "")),
        "actualResult": _strip_placeholder(sections.get("Actual Result", "")),
        "causeProblem": _strip_placeholder(sections.get("Cause", "")),
        "solution": _strip_placeholder(sections.get("Solution", "")),
    }
    return {"bug": doc, "content": content}
