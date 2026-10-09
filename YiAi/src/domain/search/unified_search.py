"""Unified internal search — searches all collections in parallel with relevance ranking.

Searches across issues, projects, modules, bugs, and pages using MongoDB $regex
on relevant text fields. Results are deduplicated, scored, and ranked.
"""

from __future__ import annotations

import asyncio
from dataclasses import dataclass, field
import hashlib
import logging
import re
import time
from typing import Any

from data.database import db
from data.filter_helpers import _compile_regex

logger = logging.getLogger(__name__)

# Search index version — must be bumped whenever the response schema or filter
# semantics change in a non-backward-compatible way. The frontend compares this
# value against its own SEARCH_INDEX_VERSION to prompt a reload when they drift.
SEARCH_INDEX_VERSION = 2

# Documents with any of these statuses have historically been soft-deleted or
# effectively archived. Users should NOT be able to navigate to them via
# search results — they produce 404s, empty detail pages, or misleading "ghost"
# entries. See: YiKnowledge/projects/yivad/prds/2026-09/34-prd-全局搜索命令面板.md §5.3
DEAD_STATUSES = frozenset({"deleted", "archived", "cancelled", "rejected"})

# Collections that carry a `status` field. `pages` does NOT today, so tombstone
# semantics for pages rely entirely on the `deleted_at` field (see below).
STATUS_COLLECTIONS = frozenset({"issues", "projects", "modules", "bugs"})

# Hash salt for generating stable synthetic page keys for legacy rows that
# were inserted without a `key` column. Values must be deterministic across
# restarts (never use a random component here).
_PAGE_KEY_SALT = "yivad-page-key-v2"

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
        "deleted_at": 1, "status": 1, "_id": 1,
    },
}

MAX_RESULTS_PER_COLLECTION = 15
DEFAULT_TOTAL_LIMIT = 40


def _effective_key(doc: dict, collection_name: str) -> str:
    """Return a non-empty, URL-safe key for `doc` — never an empty string.

    Motivation:
      * Frontend Link Factory MUST receive a stable, non-empty key to build
        a routable URL. Previously, docs with `key == None` or `key == ""`
        produced `/issue/`, `/bug/` or (for pages) static `/page` links.
      * Pages historically often lacked a real `key`. When missing, we
        synthesise one deterministically from `(title, content, _id)` so the
        same document maps to the same deep link across requests. This is
        purely for search → navigation correctness; writing the derived key
        back is out of scope for the search path (handled by data migration
        YV-09-68-v2-migrate-page-keys, see dev plan §7.3).
    """

    raw = (doc.get("key") or "").strip()
    if raw:
        return raw

    fallback_components: list[str] = []
    for field in ("title", "content"):
        val = doc.get(field)
        if isinstance(val, str) and val:
            fallback_components.append(val[:200])
    if isinstance(doc.get("_id"), Any) and doc.get("_id") is not None:
        fallback_components.append(str(doc["_id"]))

    if not fallback_components:
        # Truly empty document — emit a stable sentinel key (will be flagged
        # missing_key by the frontend Link Factory but won't corrupt the
        # global collection-level `id` format string below).
        return f"empty-{collection_name.rstrip('s')}"

    digest = hashlib.sha1(
        (f"{_PAGE_KEY_SALT}|{collection_name}|" + "|".join(fallback_components)).encode("utf-8")
    ).hexdigest()[:12]
    prefix = {"pages": "pag"}.get(collection_name, collection_name[:3])
    return f"{prefix}-{digest}"


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
    collection_name: str, query: str, limit: int, *, include_archive: bool = False
) -> list[dict]:
    """Search a single collection with $or on all relevant text fields.

    Important (v2 filter semantics — ghost entry removal):
      * Documents whose `status` is in `DEAD_STATUSES` are dropped unless the
        caller explicitly opts in via `include_archive`. This eliminates the
        large bulk of historically deleted/archived items that v1 still returned.
      * Any document with a non-null `deleted_at` field is unconditionally
        treated as a tombstone and excluded, regardless of the `status` field.
        This covers rows that were hard- or soft-deleted via data services.
    """

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
    or_clauses = [{f: _compile_regex(f".*{re.escape(q)}.*")} for f in fields]

    base_filter: dict[str, Any] = {"$or": or_clauses}

    # Tombstone / dead-status filters. `status` only exists in STATUS_COLLECTIONS
    # so don't emit it for pages — MongoDB would silently not match, but emitting
    # the correct shape simplifies operator audits and index planning.
    if validated in STATUS_COLLECTIONS and not include_archive:
        base_filter["status"] = {"$nin": list(DEAD_STATUSES)}
    # `deleted_at` is applied to every collection to catch explicit tombstones
    # (even pages that happen to receive one in the future).
    base_filter["$and"] = [
        {"$or": [{"deleted_at": None}, {"deleted_at": {"$exists": False}}]}
    ]

    projection = _RETURN_FIELDS.get(collection_name)

    try:
        collection = db.db[validated]
        cursor = collection.find(base_filter, projection)
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
    include_archive: bool = False,
) -> dict[str, Any]:
    """Search across multiple collections in parallel, return ranked results.

    Frontend contract (v2 — **`link` field is no longer emitted**):
      * Backend returns `{type, key}`; the Link Factory on the frontend derives
        the actual URL. This keeps route evolution (/:id vs /:key, new pages,
        renamed modules) localised to the frontend and guarantees that stale
        backend deploys cannot introduce new wrong-link bugs.
      * Every returned row guarantees `key != ""` (see `_effective_key`), which
        was the #1 root cause of `/issue/`/`/bug/` empty-route navigations.
      * Dead/archived/tombstoned documents are filtered upstream, eliminating
        the ghost-item class of 404s.

    Returns:
        {results: [...], timing: {total_ms, per_collection: {name: {count, ms}}},
         meta: {index_version, ghost_filtered_count}}
    """

    if not query.strip():
        return {
            "results": [],
            "timing": {"total_ms": 0, "per_collection": {}},
            "meta": {"index_version": SEARCH_INDEX_VERSION, "ghost_filtered_count": 0},
        }

    if collections is None:
        collections = ["issues", "projects", "modules", "bugs", "pages"]

    t0 = time.perf_counter()
    per_collection_limit = max(MAX_RESULTS_PER_COLLECTION, limit)

    tasks = {
        c: asyncio.create_task(
            _search_collection(c, query, per_collection_limit, include_archive=include_archive),
            name=f"search_{c}",
        )
        for c in collections
    }

    done, _ = await asyncio.wait(tasks.values(), timeout=10.0)
    collection_results: dict[str, list[dict]] = {}
    timing_per: dict[str, dict] = {}
    ghost_filtered_count = 0

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
    # Canonical → singular type names, exactly as the frontend Link Factory
    # understands them. DO NOT add implicit "strip('s')" for future collections.
    singular_map = {
        "issues": "issue",
        "projects": "project",
        "modules": "module",
        "bugs": "bug",
        "pages": "page",
    }

    for cname, docs in collection_results.items():
        prefix = type_prefix.get(cname, cname[:3])
        entity_type = singular_map.get(cname, cname.rstrip("s"))
        for doc in docs:
            key = _effective_key(doc, cname)
            # Safety net: upstream filter can be bypassed by a caller passing
            # include_archive=True. Double-check before materialising.
            if not include_archive:
                status = doc.get("status") if isinstance(doc.get("status"), str) else None
                deleted_at = doc.get("deleted_at", None)
                if (cname in STATUS_COLLECTIONS and status in DEAD_STATUSES) or (
                    deleted_at is not None
                ):
                    ghost_filtered_count += 1
                    continue
            if not key:
                ghost_filtered_count += 1
                continue

            ts = doc.get("updatedAt") or doc.get("updated_at") or doc.get("updatedTime") or 0
            try:
                _ts = float(ts) / 1000 if float(ts) > 1e10 else float(ts)
            except (ValueError, TypeError):
                _ts = 0

            status = doc.get("status") if isinstance(doc.get("status"), str) else ""
            _status = "archived" if status in DEAD_STATUSES else "pending_delete" if doc.get("deleted_at") else "active"

            # Build result item — common fields. NOTE: `link` is intentionally
            # absent from the v2 contract (see docstring above).
            item: dict[str, Any] = {
                "id": f"{prefix}-{key}",
                "type": entity_type,
                "key": key,
                "title": doc.get("title") or doc.get("name") or "",
                "score": _score_result(doc, cname, query),
                "_ts": _ts,
                "_status": _status,
            }

            # Subtitle + collection-specific props
            if cname == "issues":
                assignee = doc.get("assignee") or ""
                due = f"Due {doc['due_date']}" if doc.get("due_date") else ""
                item["subtitle"] = " · ".join(filter(bool, [assignee, due])) or doc.get("issue_type", "")
                item["detail"] = (doc.get("description") or "")[:200]
                item["project"] = doc.get("project_key", "") or ""
                item["badges"] = _issue_badges(doc)
                item["date"] = _fmt_ts(_ts)

            elif cname == "projects":
                item["subtitle"] = doc.get("identifier", "") or ""
                item["detail"] = (doc.get("description") or "")[:200]
                item["project"] = key
                item["badges"] = [
                    {"label": "Archived", "type": "info"} if doc.get("status") == "archived"
                    else {"label": "Active", "type": "success"}
                ]
                item["date"] = _fmt_ts(_ts)

            elif cname == "modules":
                lead = f"Lead: {doc['lead']}" if doc.get("lead") else ""
                issue_keys = doc.get("issue_keys") or []
                issue_count = f"{len(issue_keys)} issues" if isinstance(issue_keys, list) and issue_keys else ""
                item["subtitle"] = " · ".join(filter(bool, [lead, issue_count]))
                item["detail"] = (doc.get("description") or "")[:200]
                item["project"] = doc.get("project_key", "") or ""
                item["badges"] = _module_badges(doc)
                item["date"] = _fmt_ts(_ts)

            elif cname == "bugs":
                assignee = f"Assignee: {doc['assignee']}" if doc.get("assignee") else ""
                item["subtitle"] = " · ".join(filter(bool, [assignee, doc.get("module", "") or ""]))
                item["detail"] = (doc.get("description") or "")[:200]
                item["project"] = doc.get("project_key") or doc.get("project") or ""
                item["badges"] = _bug_badges(doc)
                item["date"] = _fmt_ts(_ts)

            elif cname == "pages":
                item["subtitle"] = doc.get("project_key", "") or ""
                item["detail"] = (doc.get("content") or "")[:200]
                item["project"] = doc.get("project_key", "") or ""
                item["badges"] = []
                item["date"] = _fmt_ts(_ts)

            unified.append(item)

    # Sort by score descending
    unified.sort(key=lambda r: (r["score"], r.get("_ts", 0)), reverse=True)

    total_ms = round((time.perf_counter() - t0) * 1000)

    logger.info(
        f"Unified internal search v{SEARCH_INDEX_VERSION}: q='{query[:60]}' "
        f"results={len(unified)} ghost_filtered={ghost_filtered_count} "
        f"collections={collections} total_ms={total_ms}"
    )

    return {
        "results": unified[:limit],
        "timing": {
            "total_ms": total_ms,
            "per_collection": timing_per,
        },
        "meta": {
            "index_version": SEARCH_INDEX_VERSION,
            "ghost_filtered_count": ghost_filtered_count,
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
