"""Unified internal search — searches all collections in parallel with relevance ranking.

Searches across issues, projects, modules, bugs, and pages using MongoDB $regex
on relevant text fields. Results are deduplicated, scored, and ranked.
"""

from __future__ import annotations

import asyncio
from dataclasses import dataclass, field
import logging
import re
import time
from typing import Any

from data.database import db
from data.filter_helpers import _compile_regex

logger = logging.getLogger(__name__)

# Fields to search per collection — ordered by relevance priority
_SEARCH_FIELDS: dict[str, list[str]] = {
    "issues": ["title", "description", "key", "assignee"],
    "projects": ["name", "identifier", "description", "key"],
    "modules": ["name", "description", "key", "lead"],
    "bugs": ["title", "description", "key", "assignee", "module"],
    "pages": ["title", "content", "key"],
}

# Fields to return per collection (projection)
_RETURN_FIELDS: dict[str, dict[str, int]] = {
    "issues": {
        "title": 1, "description": 1, "key": 1, "project_key": 1,
        "status": 1, "priority": 1, "issue_type": 1, "assignee": 1,
        "due_date": 1, "updated_at": 1, "updatedTime": 1, "created_at": 1,
    },
    "projects": {
        "name": 1, "identifier": 1, "description": 1, "key": 1,
        "status": 1, "updated_at": 1, "updatedTime": 1,
    },
    "modules": {
        "name": 1, "description": 1, "key": 1, "project_key": 1,
        "status": 1, "lead": 1, "issue_keys": 1, "updated_at": 1, "updatedTime": 1,
    },
    "bugs": {
        "title": 1, "description": 1, "key": 1, "project_key": 1,
        "project": 1, "severity": 1, "status": 1, "priority": 1,
        "assignee": 1, "module": 1, "updatedAt": 1, "updated_at": 1, "updatedTime": 1,
    },
    "pages": {
        "title": 1, "content": 1, "key": 1, "project_key": 1,
        "updated_at": 1, "updatedTime": 1,
    },
}

MAX_RESULTS_PER_COLLECTION = 15
DEFAULT_TOTAL_LIMIT = 40


def _score_result(doc: dict, collection: str, query: str) -> float:
    """Score a result 0-100 based on field match quality and recency."""
    score = 0.0
    q = query.lower().strip()
    fields = _SEARCH_FIELDS.get(collection, [])

    for i, fname in enumerate(fields):
        val = str(doc.get(fname, "")).lower()
        if not val:
            continue
        # Exact match
        if q == val:
            score += 50 - i * 5
        # Starts with
        elif val.startswith(q):
            score += 30 - i * 5
        # Word boundary match
        elif re.search(rf"\b{re.escape(q)}", val):
            score += 20 - i * 3
        # Contains
        elif q in val:
            score += 10 - i * 2

    # Recency boost: newer docs score higher
    ts = doc.get("updatedAt") or doc.get("updated_at") or doc.get("updatedTime")
    if ts:
        try:
            if isinstance(ts, str):
                from datetime import datetime
                ts = datetime.fromisoformat(ts.replace("Z", "+00:00")).timestamp()
            age_days = (time.time() - (float(ts) / 1000 if float(ts) > 1e10 else float(ts))) / 86400
            if age_days < 0:
                pass
            elif age_days <= 1:
                score += 5
            elif age_days <= 7:
                score += 3
            elif age_days <= 30:
                score += 1
        except (ValueError, TypeError, OverflowError):
            pass

    return min(score, 100)


@dataclass
class UnifiedSearchResult:
    id: str
    type: str
    title: str
    subtitle: str = ""
    detail: str = ""
    project: str = ""
    link: str = ""
    badges: list[dict] = field(default_factory=list)
    date: str = ""
    score: float = 0.0
    _ts: float = 0.0


async def _search_collection(
    collection_name: str, query: str, limit: int
) -> list[dict]:
    """Search a single collection with $or on all relevant text fields."""
    q = query.strip()
    if not q:
        return []

    await db.initialize()
    validated = collection_name
    try:
        from data.helpers import _validate_collection_name
        validated = _validate_collection_name(collection_name)
    except Exception:
        pass

    fields = _SEARCH_FIELDS.get(collection_name, ["title", "name", "description"])
    or_clauses = [
        {f: _compile_regex(f".*{re.escape(q)}.*")} for f in fields
    ]

    projection = _RETURN_FIELDS.get(collection_name)

    try:
        collection = db.db[validated]
        cursor = collection.find({"$or": or_clauses}, projection)
        cursor = cursor.sort("updated_at", -1).limit(limit)
        docs = await cursor.to_list(length=limit)
        return docs
    except Exception as e:
        logger.warning(f"Search failed for collection {collection_name}: {e}")
        return []


async def unified_search(
    query: str,
    *,
    collections: list[str] | None = None,
    limit: int = DEFAULT_TOTAL_LIMIT,
) -> dict[str, Any]:
    """Search across multiple collections in parallel, return ranked results.

    Returns:
        {results: [...], timing: {total_ms, per_collection: {name: {count, ms}}}}
    """
    if not query.strip():
        return {"results": [], "timing": {"total_ms": 0, "per_collection": {}}}

    if collections is None:
        collections = ["issues", "projects", "modules", "bugs", "pages"]

    t0 = time.perf_counter()
    per_collection_limit = max(MAX_RESULTS_PER_COLLECTION, limit)

    tasks = {
        c: asyncio.create_task(
            _search_collection(c, query, per_collection_limit),
            name=f"search_{c}",
        )
        for c in collections
    }

    done, _ = await asyncio.wait(tasks.values(), timeout=10.0)
    collection_results: dict[str, list[dict]] = {}
    timing_per: dict[str, dict] = {}

    for t in done:
        cname = t.get_name().replace("search_", "")
        try:
            docs = t.result()
            collection_results[cname] = docs
            timing_per[cname] = {"count": len(docs), "ms": 0}
        except Exception as e:
            logger.warning(f"Search task failed for {cname}: {e}")
            collection_results[cname] = []
            timing_per[cname] = {"count": 0, "ms": 0}

    # Build unified results
    unified: list[dict] = []
    type_prefix = {"issues": "iss", "projects": "proj", "modules": "mod", "bugs": "bug", "pages": "pag"}

    for cname, docs in collection_results.items():
        prefix = type_prefix.get(cname, cname[:3])
        for doc in docs:
            key = doc.get("key", "")
            ts = doc.get("updatedAt") or doc.get("updated_at") or doc.get("updatedTime") or 0
            try:
                _ts = float(ts) / 1000 if float(ts) > 1e10 else float(ts)
            except (ValueError, TypeError):
                _ts = 0

            # Build result item
            item: dict[str, Any] = {
                "id": f"{prefix}-{key}",
                "type": cname.rstrip("s"),  # "issue", "project", "module", "bug", "page"
                "title": doc.get("title") or doc.get("name") or "",
                "score": _score_result(doc, cname, query),
                "_ts": _ts,
            }

            # Subtitle
            if cname == "issues":
                item["subtitle"] = " · ".join(filter(bool, [
                    doc.get("assignee", ""),
                    f"Due {doc['due_date']}" if doc.get("due_date") else "",
                ])) or doc.get("issue_type", "")
                item["detail"] = (doc.get("description") or "")[:200]
                item["project"] = doc.get("project_key", "")
                item["link"] = f"/issue/{key}"
                item["badges"] = _issue_badges(doc)
                item["date"] = _fmt_ts(_ts)

            elif cname == "projects":
                item["subtitle"] = doc.get("identifier", "")
                item["detail"] = (doc.get("description") or "")[:200]
                item["project"] = key
                item["link"] = f"/project/{key}"
                item["badges"] = [
                    {"label": "Archived", "type": "info"} if doc.get("status") == "archived"
                    else {"label": "Active", "type": "success"}
                ]
                item["date"] = _fmt_ts(_ts)

            elif cname == "modules":
                lead = f"Lead: {doc['lead']}" if doc.get("lead") else ""
                issue_count = f"{len(doc['issue_keys'])} issues" if doc.get("issue_keys") else ""
                item["subtitle"] = " · ".join(filter(bool, [lead, issue_count]))
                item["detail"] = (doc.get("description") or "")[:200]
                item["project"] = doc.get("project_key", "")
                item["link"] = f"/module/{key}"
                item["badges"] = _module_badges(doc)
                item["date"] = _fmt_ts(_ts)

            elif cname == "bugs":
                assignee = f"Assignee: {doc['assignee']}" if doc.get("assignee") else ""
                item["subtitle"] = " · ".join(filter(bool, [assignee, doc.get("module", "")]))
                item["detail"] = (doc.get("description") or "")[:200]
                item["project"] = doc.get("project_key") or doc.get("project", "")
                item["link"] = f"/bug/{key}"
                item["badges"] = _bug_badges(doc)
                item["date"] = _fmt_ts(_ts)

            elif cname == "pages":
                item["subtitle"] = doc.get("project_key", "")
                item["detail"] = (doc.get("content") or "")[:200]
                item["project"] = doc.get("project_key", "")
                item["link"] = "/page"
                item["badges"] = []
                item["date"] = _fmt_ts(_ts)

            unified.append(item)

    # Sort by score descending
    unified.sort(key=lambda r: (r["score"], r.get("_ts", 0)), reverse=True)

    total_ms = round((time.perf_counter() - t0) * 1000)

    logger.info(
        f"Unified internal search: q='{query[:60]}' results={len(unified)} "
        f"collections={collections} total_ms={total_ms}"
    )

    return {
        "results": unified[:limit],
        "timing": {
            "total_ms": total_ms,
            "per_collection": timing_per,
        },
    }


# ── Badge helpers ──────────────────────────────────────────────────────────

def _issue_badges(doc: dict) -> list[dict]:
    badges = []
    if doc.get("issue_type"):
        badges.append({"label": doc["issue_type"], "type": _issue_type_tag(doc["issue_type"])})
    if doc.get("status"):
        badges.append({"label": doc["status"].replace("_", " "), "type": _issue_status_tag(doc["status"])})
    if doc.get("priority") and doc["priority"] != "none":
        p = doc["priority"]
        badges.append({"label": p, "type": "danger" if p == "urgent" else "warning" if p == "high" else "info"})
    return badges


def _issue_type_tag(t: str) -> str:
    return {"bug": "danger", "task": "info", "feature": "success", "improvement": "primary", "requirement": "warning"}.get(t, "info")


def _issue_status_tag(s: str) -> str:
    return {"backlog": "info", "todo": "", "in_progress": "primary", "in_review": "warning", "done": "success", "cancelled": "danger"}.get(s, "info")


def _bug_badges(doc: dict) -> list[dict]:
    badges = []
    if doc.get("severity"):
        t = {"critical": "danger", "major": "warning", "minor": "info", "trivial": ""}.get(doc["severity"], "")
        badges.append({"label": doc["severity"], "type": t, "effect": "dark"})
    if doc.get("status"):
        t = {"open": "danger", "in_progress": "warning", "resolved": "success", "closed": "info", "rejected": "danger", "reopened": "warning"}.get(doc["status"], "info")
        badges.append({"label": doc["status"].replace("_", " "), "type": t})
    if doc.get("priority"):
        p = doc["priority"]
        badges.append({"label": p, "type": "danger" if p == "p0" else "warning" if p == "p1" else "info"})
    return badges


def _module_badges(doc: dict) -> list[dict]:
    if doc.get("status"):
        t = {"planned": "info", "in_progress": "primary", "completed": "success", "cancelled": "danger"}.get(doc["status"], "info")
        return [{"label": doc["status"].replace("_", " "), "type": t}]
    return []


def _fmt_ts(ts: float) -> str:
    """Format timestamp to ISO date string."""
    if not ts:
        return ""
    from datetime import datetime
    try:
        return datetime.fromtimestamp(ts).strftime("%Y-%m-%d")
    except (ValueError, OSError):
        return ""
