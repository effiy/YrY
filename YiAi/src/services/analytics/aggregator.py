"""Pre-computed analytics metrics — efficiency, quality, and team performance.

RPC methods:
  - get_efficiency_metrics(params) → { cycleTime, leadTime, throughput, wip, cfd }
  - get_quality_metrics(params)     → { bugRate, reworkRate, defectDensity, score }
"""

from __future__ import annotations

from typing import Any, Dict, List

from data.database import db


async def get_efficiency_metrics(params: Dict[str, Any]) -> Dict[str, Any]:
    """Return pre-aggregated efficiency metrics for a project.

    ``params``: ``{ project_key?: str, dateRange?: { start, end } }``
    """
    project_key: str | None = params.get("project_key")
    date_range: Dict[str, Any] | None = params.get("dateRange")

    match: Dict[str, Any] = {}
    if project_key:
        match["project_key"] = project_key
    if date_range:
        match["createdAt"] = {
            "$gte": date_range.get("start", "2000-01-01"),
            "$lte": date_range.get("end", "2099-12-31"),
        }

    pipeline = [{"$match": match}]

    # Cycle time: avg duration from "in_progress" to "done" status
    pipeline.append({
        "$group": {
            "_id": "$status",
            "count": {"$sum": 1},
        }
    })

    status_counts = {}
    async for doc in db.db["issues"].aggregate(pipeline):
        status_counts[doc["_id"]] = doc.get("count", 0)

    done_count = status_counts.get("Done", 0) + status_counts.get("done", 0)
    total_issues = sum(status_counts.values())

    # Throughput: completed in date range
    throughput_pipeline = [
        {"$match": {
            **match,
            "status": {"$in": ["Done", "done"]},
        }},
        {"$count": "done"},
    ]
    throughput_cursor = db.db["issues"].aggregate(throughput_pipeline)
    throughput_docs = await throughput_cursor.to_list(length=1)
    throughput = throughput_docs[0]["done"] if throughput_docs else 0

    return {
        "cycle_time": None,    # Requires status transition timestamps
        "lead_time_days": None,  # Requires creation → completion timestamps
        "throughput": throughput,
        "wip": status_counts,
        "total_issues": total_issues,
        "done_count": done_count,
        "cfd": [],  # Cumulative Flow Diagram data — computed on-demand
    }


async def get_quality_metrics(params: Dict[str, Any]) -> Dict[str, Any]:
    """Return pre-aggregated quality metrics for a project.

    ``params``: ``{ project_key?: str, dateRange?: { start, end } }``
    """
    project_key: str | None = params.get("project_key")
    date_range: Dict[str, Any] | None = params.get("dateRange")

    match: Dict[str, Any] = {}
    if project_key:
        match["project_key"] = project_key
    if date_range:
        match["createdAt"] = {
            "$gte": date_range.get("start", "2000-01-01"),
            "$lte": date_range.get("end", "2099-12-31"),
        }

    # Bug rate: bugs / total issues
    bug_count = await db.db["bugs"].count_documents(match)
    issue_count = await db.db["issues"].count_documents(match)

    bug_rate = (bug_count / issue_count * 100) if issue_count > 0 else 0.0

    # Rework rate: reopened issues
    reopened = await db.db["issues"].count_documents({**match, "reopened": True})
    rework_rate = (reopened / issue_count * 100) if issue_count > 0 else 0.0

    # Defect density by module
    density_pipeline = [
        {"$match": match},
        {"$group": {"_id": "$module", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
        {"$limit": 20},
    ]
    defect_density: List[Dict[str, Any]] = []
    async for doc in db.db["bugs"].aggregate(density_pipeline):
        defect_density.append({"module": doc["_id"], "bugs": doc["count"]})

    # Quality score (0-100)
    quality_score = _compute_quality_score(bug_rate, rework_rate)

    return {
        "bug_rate": round(bug_rate, 2),
        "bug_count": bug_count,
        "rework_rate": round(rework_rate, 2),
        "reopened_count": reopened,
        "defect_density": defect_density,
        "quality_score": quality_score,
    }


def _compute_quality_score(bug_rate: float, rework_rate: float) -> float:
    """Compute a 0-100 quality score from bug and rework rates."""
    score = 100.0
    score -= min(bug_rate * 5, 40)     # max 40 point penalty for bugs
    score -= min(rework_rate * 3, 30)   # max 30 point penalty for rework
    return round(max(0.0, score), 1)