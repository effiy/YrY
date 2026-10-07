"""YiKnowledge issue scanner — query knowledge_files DB mirror for Issue records.

Reads the ``knowledge_files`` collection (kept in sync with disk by the
knowledge watcher every ~60s) and maps frontmatter metadata to a unified
Issue format. Because the watcher already opened and parsed every file,
this avoids disk I/O on each request — the query stays fast regardless of
knowledge base size.
"""

from __future__ import annotations

import logging
import re
from typing import Any

logger = logging.getLogger(__name__)

# Subdirectories under projects/{project}/ that we scan for issue-like files
_ISSUE_DIRS = ("bugs", "devs", "prds", "tests", "requires")

# directory → issue_type
_DIR_TYPE: dict[str, str] = {
    "bugs": "bug",
    "devs": "task",
    "prds": "requirement",
    "tests": "task",
    "requires": "requirement",
}

# Chinese → English status
_STATUS_MAP: dict[str, str] = {
    "进行中": "in_progress",
    "in_progress": "in_progress",
    "已完成": "done",
    "已合并": "done",
    "done": "done",
    "未开始": "todo",
    "待开始": "todo",
    "todo": "todo",
    "部分完成": "in_progress",
    "已取消": "cancelled",
    "cancelled": "cancelled",
    "待评审": "in_review",
    "in_review": "in_review",
    "待排期": "backlog",
    "backlog": "backlog",
    "需求已编写": "done",
    "需求已编写，待开发排期": "backlog",
    "open": "todo",
    "resolved": "done",
    "closed": "done",
    "reopened": "in_progress",
    "active": "in_progress",
    "stable": "done",
    "in-progress": "in_progress",
}

# Priority normalization
_PRIORITY_MAP: dict[str, str] = {
    "p0": "urgent",
    "p1": "high",
    "p2": "medium",
    "p3": "low",
    "p4": "none",
    "紧急": "urgent",
    "高": "high",
    "中": "medium",
    "低": "low",
    "urgent": "urgent",
    "high": "high",
    "medium": "medium",
    "low": "low",
    "none": "none",
}

_SOURCE_MAP: dict[str, str] = {
    "内部": "internal",
    "internal": "internal",
    "客户": "customer",
    "customer": "customer",
    "市场": "market",
    "market": "market",
    "合规": "compliance",
    "compliance": "compliance",
}

_REVIEW_MAP: dict[str, str] = {
    "pending": "pending",
    "approved": "approved",
    "rejected": "rejected",
    "in_review": "in_review",
    "审核中": "in_review",
    "已通过": "approved",
    "已拒绝": "rejected",
    "待审核": "pending",
}

# Path separators that could contain templates (skip these)
_SKIP_PATTERN = re.compile(r"/模板/")


def _dir_issue_type(rel_path: str) -> str:
    """Derive issue_type from directory segment: projects/{proj}/{subdir}/..."""
    parts = rel_path.split("/")
    if len(parts) >= 3 and parts[0] == "projects":
        return _DIR_TYPE.get(parts[2], "task")
    return "task"


def _map_status(raw: str) -> str:
    if not raw:
        return "todo"
    return _STATUS_MAP.get(raw.strip(), raw.strip())


def _map_priority(raw: str) -> str:
    if not raw:
        return "medium"
    return _PRIORITY_MAP.get(raw.strip().lower(), _PRIORITY_MAP.get(raw.strip(), "medium"))


def _doc_to_issue(doc: dict) -> dict | None:
    """Convert a knowledge_files document to an Issue dict, or None if unsuitable."""
    path = doc.get("path", "")
    if _SKIP_PATTERN.search(path):
        return None

    # Only project files in known content dirs
    parts = path.split("/")
    if len(parts) < 4 or parts[0] != "projects" or parts[2] not in _ISSUE_DIRS:
        return None

    project_key = parts[1]
    meta = doc.get("meta") or {}

    issue_type = _dir_issue_type(path)

    # Key: prefer frontmatter key/prd_task_id, fall back to filename stem
    key = str(meta.get("key") or meta.get("prd_task_id") or "")
    if not key:
        key = ".".join(path.rsplit("/", 1)[-1].rsplit(".", 1)[:-1]) if "." in path.rsplit("/", 1)[-1] else path.rsplit("/", 1)[-1]

    title = str(meta.get("title") or "")

    status = _map_status(str(meta.get("status") or "todo"))
    priority = _map_priority(str(meta.get("priority") or "medium"))

    # Tags/labels
    tags = meta.get("tags")
    if isinstance(tags, list):
        labels = [str(t) for t in tags]
    elif isinstance(tags, str):
        labels = [t.strip() for t in tags.split(",") if t.strip()]
    else:
        labels = []

    # Assignee
    assignee = str(meta.get("owner") or meta.get("assignee") or "")

    # Estimate
    est = meta.get("estimate_frontend") or meta.get("estimate_points")
    try:
        estimate_points = float(est) if est is not None else None
    except (ValueError, TypeError):
        estimate_points = None

    # Dates (from frontmatter or file mtime)
    def _iso(v: Any, fallback_ms: int | None = None) -> str:
        if v is None and fallback_ms:
            from datetime import datetime, timezone

            try:
                return datetime.fromtimestamp(fallback_ms / 1000, tz=timezone.utc).isoformat()
            except (ValueError, OSError):
                return ""
        if v is None:
            return ""
        if isinstance(v, int | float):
            from datetime import datetime, timezone

            try:
                return datetime.fromtimestamp(v / 1000, tz=timezone.utc).isoformat()
            except (ValueError, OSError):
                return str(v)
        s = str(v).strip()
        if s.endswith("Z"):
            s = s[:-1] + "+00:00"
        return s

    updated_at_ms = doc.get("updatedAt")
    created_at = _iso(meta.get("created"), updated_at_ms)
    updated_at = _iso(meta.get("updated"), updated_at_ms)

    # Source
    source_raw = str(meta.get("source") or "internal").strip()
    source = _SOURCE_MAP.get(source_raw, _SOURCE_MAP.get(source_raw.lower(), "internal"))

    # Review
    review_raw = str(meta.get("review_status") or "").strip()
    review_status = _REVIEW_MAP.get(review_raw, _REVIEW_MAP.get(review_raw.lower(), "pending")) if review_raw else "pending"

    # Severity
    sev = str(meta.get("severity") or "").strip().lower()
    if sev not in {"critical", "major", "minor", "trivial"}:
        sev = "minor"

    # Goal / OKR link
    goal_id = str(meta.get("goal_id") or meta.get("source_okr") or "")
    if not goal_id:
        sp = meta.get("source_prds") or meta.get("source_prd")
        if isinstance(sp, list):
            goal_id = ",".join(str(p) for p in sp)
        elif sp:
            goal_id = str(sp)

    # due_date: meta → body enrichment → prd_month fallback
    due_date = str(meta.get("due_date") or meta.get("dueDate") or "")
    if not due_date:
        pm = str(meta.get("prd_month") or "")
        if pm and len(pm) == 6 and pm.isdigit():
            due_date = f"{pm[:4]}-{pm[4:]}-01"
    # start_date: key prefix or prd_month fallback
    start_date = str(meta.get("start_date") or meta.get("startDate") or "")
    if not start_date and due_date:
        start_date = due_date

    return {
        "key": key,
        "project_key": project_key,
        "sequence_id": 0,
        "title": title,
        "description": str(meta.get("description") or ""),
        "status": status,
        "priority": priority,
        "issue_type": issue_type,
        "assignee": assignee,
        "labels": labels,
        "estimate_points": estimate_points,
        "start_date": start_date,
        "due_date": due_date,
        "acceptance_criteria": str(meta.get("acceptance_criteria") or ""),
        "source": source,
        "review_status": review_status,
        "goal_id": goal_id,
        "kb_file_path": path,
        "severity": sev,
        "created_at": created_at,
        "updated_at": updated_at,
    }


async def list_issues(
    project: str | None = None,
    issue_type: str | None = None,
    status: str | None = None,
    priority: str | None = None,
    search: str | None = None,
    page_num: int = 1,
    page_size: int = 50,
) -> dict:
    """Query the knowledge_files DB mirror for Issue records.

    The knowledge watcher keeps ``knowledge_files`` in sync with disk (polled
    every ~60s), so this query returns real-time metadata without any disk I/O.

    Filters are applied via path prefix matching + frontmatter field checks.
    Template directories (``/模板/``) are excluded.

    Returns ``{ list, total, pageNum, pageSize, totalPages }``.
    """
    issues = await _query_issues(project, issue_type, status, priority, search)

    # Sort by updated_at desc
    issues.sort(key=lambda i: i["updated_at"], reverse=True)

    total = len(issues)
    total_pages = max(1, (total + page_size - 1) // page_size) if page_size > 0 else 1
    start = (page_num - 1) * page_size
    page = issues[start : start + page_size] if page_size > 0 else issues

    return {
        "list": page,
        "total": total,
        "pageNum": page_num,
        "pageSize": page_size,
        "totalPages": total_pages,
    }


async def _query_issues(
    project: str | None = None,
    issue_type: str | None = None,
    status: str | None = None,
    priority: str | None = None,
    search: str | None = None,
) -> list[dict]:
    """Shared query + conversion — fetches matching knowledge_files docs and
    maps them to Issue dicts. Extracted so both list_issues and issue_stats
    reuse the same filtering logic."""
    from data.database import db
    from data.helpers import _validate_collection_name
    from shared.config import settings

    await db.initialize()
    collection = db.db[_validate_collection_name(settings.collection_knowledge_files)]

    subdirs = list(_ISSUE_DIRS)
    if issue_type:
        subdirs = [d for d, t in _DIR_TYPE.items() if t == issue_type]

    if project:
        prefixes = "|".join(f"projects/{re.escape(project)}/{re.escape(d)}/" for d in subdirs)
    else:
        prefixes = "|".join(f"projects/[^/]+/{re.escape(d)}/" for d in subdirs)

    path_filter: dict[str, Any] = {"path": {"$regex": f"^({prefixes})"}}
    template_filter: dict[str, Any] = {"path": {"$not": re.compile(r"/模板/")}}

    query: dict[str, Any] = {"$and": [path_filter, template_filter]}

    if status:
        status_values = [s.strip() for s in status.split(",") if s.strip()]
        or_clauses: list[dict] = []
        for s in status_values:
            or_clauses.append({"meta.status": s})
            eng = _STATUS_MAP.get(s)
            if eng and eng != s:
                or_clauses.append({"meta.status": eng})
        if or_clauses:
            query["$and"].append({"$or": or_clauses})  # type: ignore[union-attr]

    if priority:
        pri_values = [p.strip() for p in priority.split(",") if p.strip()]
        or_clauses = []
        for p in pri_values:
            or_clauses.append({"meta.priority": p})
            eng = _PRIORITY_MAP.get(p.lower(), "")
            if eng and eng != p.lower():
                or_clauses.append({"meta.priority": eng})
        if or_clauses:
            query["$and"].append({"$or": or_clauses})  # type: ignore[union-attr]

    if search:
        query["$and"].append({"meta.title": {"$regex": re.escape(search), "$options": "i"}})  # type: ignore[union-attr]

    cursor = collection.find(query, {"_id": 0})
    issues: list[dict] = []
    async for doc in cursor:
        issue = _doc_to_issue(doc)
        if issue:
            issues.append(issue)

    return issues


async def issue_stats(
    project: str | None = None,
    issue_type: str | None = None,
    status: str | None = None,
    priority: str | None = None,
    search: str | None = None,
) -> dict:
    """Pre-aggregated stats for the issue list — computed server-side so the
    frontend doesn't need to fetch every record just to count them.

    Returns status/priority/type/assignee distributions, trend data,
    completeness scores, and attention flags (overdue, unassigned, blocked).
    """

    issues = await _query_issues(project, issue_type, status, priority, search)

    total = len(issues)

    # Status distribution
    status_counts: dict[str, int] = {}
    for i in issues:
        s = i["status"]
        status_counts[s] = status_counts.get(s, 0) + 1

    def _sc(key: str) -> int:
        return status_counts.get(key, 0)

    stats = {
        "total": total,
        "todo": _sc("todo"),
        "in_progress": _sc("in_progress"),
        "in_review": _sc("in_review"),
        "done": _sc("done"),
        "backlog": _sc("backlog"),
        "cancelled": _sc("cancelled"),
    }

    # Priority distribution
    priority_dist: dict[str, int] = {}
    for i in issues:
        p = i["priority"]
        if p:
            priority_dist[p] = priority_dist.get(p, 0) + 1

    # Type distribution
    type_dist: dict[str, int] = {}
    for i in issues:
        t = i["issue_type"]
        if t:
            type_dist[t] = type_dist.get(t, 0) + 1

    # Assignee distribution
    assignee_dist: dict[str, int] = {}
    for i in issues:
        a = i["assignee"]
        if a:
            assignee_dist[a] = assignee_dist.get(a, 0) + 1

    # Created-by-day trend
    created_by_day: dict[str, int] = {}
    for i in issues:
        d = (i.get("created_at") or "")[:10]
        if d:
            created_by_day[d] = created_by_day.get(d, 0) + 1

    # Completeness — what % of issues have each key field filled
    def _pct(n: int) -> int:
        return round(n / total * 100) if total else 0

    completeness = [
        {
            "key": "assignee",
            "label": "Assignee",
            "filled": sum(1 for i in issues if i.get("assignee")),
            "pct": _pct(sum(1 for i in issues if i.get("assignee"))),
            "missing": total - sum(1 for i in issues if i.get("assignee")),
        },
        {
            "key": "due_date",
            "label": "Due Date",
            "filled": sum(1 for i in issues if i.get("due_date")),
            "pct": _pct(sum(1 for i in issues if i.get("due_date"))),
            "missing": total - sum(1 for i in issues if i.get("due_date")),
        },
        {
            "key": "labels",
            "label": "Labels",
            "filled": sum(1 for i in issues if i.get("labels")),
            "pct": _pct(sum(1 for i in issues if i.get("labels"))),
            "missing": total - sum(1 for i in issues if i.get("labels")),
        },
        {
            "key": "description",
            "label": "Description",
            "filled": sum(1 for i in issues if i.get("description")),
            "pct": _pct(sum(1 for i in issues if i.get("description"))),
            "missing": total - sum(1 for i in issues if i.get("description")),
        },
        {
            "key": "acceptance",
            "label": "Acceptance",
            "filled": sum(1 for i in issues if i.get("acceptance_criteria")),
            "pct": _pct(sum(1 for i in issues if i.get("acceptance_criteria"))),
            "missing": total - sum(1 for i in issues if i.get("acceptance_criteria")),
        },
        {
            "key": "estimate",
            "label": "Estimate",
            "filled": sum(1 for i in issues if i.get("estimate_points") is not None),
            "pct": _pct(sum(1 for i in issues if i.get("estimate_points") is not None)),
            "missing": total - sum(1 for i in issues if i.get("estimate_points") is not None),
        },
    ]

    # Attention flags
    now_ts: float = __import__("time").time()
    overdue = sum(1 for i in issues if i.get("due_date") and i["status"] != "done" and _parse_due_date(i["due_date"]) < now_ts)
    unassigned = sum(1 for i in issues if not i.get("assignee") and i["status"] not in ("done", "cancelled"))
    blocked = sum(1 for i in issues if i.get("blocked_by"))

    return {
        "stats": stats,
        "statusDist": status_counts,
        "priorityDist": priority_dist,
        "typeDist": type_dist,
        "assigneeDist": assignee_dist,
        "createdByDay": created_by_day,
        "completeness": completeness,
        "attention": {
            "overdue": overdue,
            "unassigned": unassigned,
            "blocked": blocked,
        },
    }


def _parse_due_date(raw: str) -> float:
    """Parse a due_date string to a Unix timestamp (seconds). Returns 0 on failure."""

    if not raw:
        return 0
    try:
        from datetime import datetime, timezone

        # ISO format: 2026-09-21 or 2026-09-21T00:00:00
        if "T" in raw:
            dt = datetime.fromisoformat(raw.replace("Z", "+00:00"))
        else:
            dt = datetime.strptime(raw[:10], "%Y-%m-%d")
        return dt.replace(tzinfo=timezone.utc).timestamp()
    except (ValueError, OverflowError):
        return 0
