"""Project dashboard aggregator — unified endpoint returning efficiency, quality, and
basic stats in a single lightweight payload. Used by the YiVad /project page to replace
4 client-side data fetches + in-browser computation with one server-side aggregation."""

from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Any

from data.database import db

from .aggregator.efficiency import get_efficiency_metrics
from .aggregator.quality import get_quality_metrics


async def get_project_dashboard(params: dict[str, Any]) -> dict[str, Any]:
    """Return a unified dashboard payload for the project list or a single project.

    ``params``: ``{ project_key?: str, dateRange?: { start, end } }``
    """
    project_key: str | None = params.get("project_key")
    date_range: dict[str, Any] | None = params.get("dateRange")

    now = datetime.utcnow()
    start = now - timedelta(days=30)
    end = now
    if date_range:
        start = datetime.fromisoformat(date_range["start"]) if date_range.get("start") else start
        if date_range.get("end"):
            end = datetime.fromisoformat(date_range["end"])
    end = end.replace(hour=23, minute=59, second=59)

    match: dict[str, Any] = {}
    if project_key:
        match["project_key"] = project_key

    # ── Basic stats (per-project rollup via aggregation) ──
    basic = await _compute_basic_stats(match, project_key, start, end)

    # ── Efficiency + quality (reuse existing aggregators) ──
    eff_params = {**params}
    if not params.get("dateRange"):
        eff_params["dateRange"] = {"start": start.isoformat(), "end": end.isoformat()}
    efficiency = await get_efficiency_metrics(eff_params)
    quality = await get_quality_metrics(eff_params)

    return {
        "basic": basic,
        "efficiency": efficiency,
        "quality": quality,
        "period": {"start": start.strftime("%Y-%m-%d"), "end": end.strftime("%Y-%m-%d")},
        "generated_at": now.strftime("%Y-%m-%dT%H:%M:%SZ"),
    }


async def _compute_basic_stats(
    match: dict[str, Any], project_key: str | None, start: datetime, end: datetime
) -> dict[str, Any]:
    """Compute per-project issue/bug/module counts and status breakdowns.

    Counts are all-time (no date filter) — matching the bug and module pipelines.
    The ``end`` parameter is only used for the overdue calculation.
    """
    issue_match = {**match}

    # Closed/open statuses — include Title Case variants from external imports.
    from shared.status import CLOSED_STATUSES, normalize_status_list

    CLOSED = normalize_status_list(list(CLOSED_STATUSES))

    # Per-project issue counts
    issue_by_project: dict[str, dict[str, Any]] = {}
    pipeline = [
        {"$match": issue_match},
        {"$group": {
            "_id": "$project_key",
            "total": {"$sum": 1},
            "done": {"$sum": {"$cond": [{"$in": ["$status", CLOSED]}, 1, 0]}},
            "open": {"$sum": {"$cond": [
                {"$not": {"$in": ["$status", CLOSED]}},
                1, 0,
            ]}},
            "overdue": {"$sum": {"$cond": [
                {"$and": [
                    {"$not": {"$in": ["$status", CLOSED]}},
                    {"$gte": ["$due_date", "1970-01-01"]},
                    {"$lt": ["$due_date", end.strftime("%Y-%m-%d")]},
                ]},
                1, 0,
            ]}},
            "unassigned": {"$sum": {"$cond": [
                {"$and": [
                    {"$not": {"$in": ["$status", CLOSED]}},
                    {"$in": ["$assignee", [None, ""]]},
                ]},
                1, 0,
            ]}},
        }},
    ]
    async for doc in db.db["issues"].aggregate(pipeline):
        key = doc["_id"] or ""
        issue_by_project[key] = {
            "issues": doc["total"],
            "done": doc["done"],
            "open": doc["open"],
            "overdue": doc["overdue"],
            "unassigned": doc["unassigned"],
        }

    # Per-project bug counts
    bug_match = {**match}
    bug_by_project: dict[str, int] = {}
    pipeline = [
        {"$match": bug_match},
        {"$group": {"_id": "$project_key", "count": {"$sum": 1}}},
    ]
    async for doc in db.db["bugs"].aggregate(pipeline):
        bug_by_project[doc["_id"] or ""] = doc["count"]

    # Per-project module counts
    mod_match = {**match}
    mod_by_project: dict[str, int] = {}
    pipeline = [
        {"$match": mod_match},
        {"$group": {"_id": "$project_key", "count": {"$sum": 1}}},
    ]
    async for doc in db.db["modules"].aggregate(pipeline):
        mod_by_project[doc["_id"] or ""] = doc["count"]

    # Total project count
    project_count = await db.db["projects"].count_documents(
        {"status": "active"} if not project_key else match
    )

    # Merge per-project — normalize keys to lowercase to handle casing mismatches
    # (imported data may use "YiVad" while the frontend queries "yivad").
    all_keys = set(issue_by_project) | set(bug_by_project) | set(mod_by_project)
    merged: dict[str, dict[str, Any]] = {}
    for key in all_keys:
        if not key:
            continue
        nk = key.lower()
        iss = issue_by_project.get(key, {"issues": 0, "done": 0, "open": 0, "overdue": 0, "unassigned": 0})
        bugs = bug_by_project.get(key, 0)
        mods = mod_by_project.get(key, 0)
        if nk in merged:
            m = merged[nk]
            m["issues"] += iss["issues"]
            m["done"] += iss["done"]
            m["open"] += iss["open"]
            m["overdue"] += iss["overdue"]
            m["unassigned"] += iss["unassigned"]
            m["bugs"] += bugs
            m["modules"] += mods
        else:
            merged[nk] = {
                "project_key": nk,
                "issues": iss["issues"],
                "done": iss["done"],
                "open": iss["open"],
                "overdue": iss["overdue"],
                "unassigned": iss["unassigned"],
                "bugs": bugs,
                "modules": mods,
            }
    projects = list(merged.values())

    # Global totals
    total_issues = sum(p["issues"] for p in projects)
    total_done = sum(p["done"] for p in projects)
    total_open = sum(p["open"] for p in projects)
    total_bugs = sum(p["bugs"] for p in projects)

    return {
        "project_count": project_count,
        "total_issues": total_issues,
        "total_done": total_done,
        "total_open": total_open,
        "total_bugs": total_bugs,
        "completion_pct": round(total_done / total_issues * 100, 1) if total_issues else 0,
        "by_project": projects,
    }
