"""Quality metrics — bug rate, rework rate, defect density, severity distribution, trends,
inflow/outflow, MTTR, SLA compliance, multi-dimensional quality score, and real-time indicators."""

from __future__ import annotations

import asyncio
from datetime import datetime, timedelta, timezone
import time
from typing import Any

from data.database import db
from shared.status import CLOSED_STATUSES, normalize_status_list

from .helpers import _cache_key

# Module-level TTL cache
_cache: dict[str, tuple[float, Any]] = {}
_CACHE_TTL = 30

QUALITY_WEIGHTS = {
    "bug_rate": 0.25,
    "rework_rate": 0.15,
    "severity": 0.15,
    "mttr": 0.20,
    "sla_compliance": 0.25,
}

SLA_TARGETS: dict[str, int] = {
    "critical": 24,
    "major": 72,
    "minor": 168,
    "trivial": 336,
}

# Status groups imported from shared/status.py (canonical source of truth)
# CLOSED_STATUSES = frozenset({done, closed, resolved, cancelled})
# ACTIVE_STATUSES = frozenset({todo, in_progress, in_review})
# normalize_status_list() expands to include legacy variants for MongoDB queries


async def get_quality_metrics(params: dict[str, Any]) -> dict[str, Any]:
    """Return quality metrics with trends, distributions, real-time indicators, and period comparison."""
    cache_key = _cache_key("qual", params)
    now_ts = time.time()
    bypass_cache = params.get("_nocache") in (True, "true", "1", 1)
    if not bypass_cache and cache_key in _cache:
        expires, val = _cache[cache_key]
        if now_ts < expires:
            return val

    project_key: str | None = params.get("project_key")
    date_range: dict[str, Any] | None = params.get("dateRange")

    now = datetime.utcnow()
    start_str = date_range.get("start") if date_range else None
    end_str = date_range.get("end") if date_range else None
    start = datetime.fromisoformat(start_str) if start_str else now - timedelta(days=30)
    end = datetime.fromisoformat(end_str) if end_str else now
    end = end.replace(hour=23, minute=59, second=59)
    days = max((end - start).days + 1, 1)

    match: dict[str, Any] = {}
    if project_key:
        match["project_key"] = project_key
    else:
        match["project_key"] = {"$exists": True}

    def _in_range(base: dict[str, Any]) -> dict[str, Any]:
        m = {**base}
        m["createdAt"] = {"$gte": start.isoformat(), "$lte": end.isoformat()}
        return m

    bug_match = _in_range(match)
    issue_match = dict(match)

    bug_count = await db.db["bugs"].count_documents(bug_match)
    issue_count = await db.db["issues"].count_documents(issue_match)
    reopened = await db.db["issues"].count_documents({**issue_match, "reopened": True})

    bug_rate = round(bug_count / issue_count * 100, 2) if issue_count > 0 else 0.0
    rework_rate = round(reopened / issue_count * 100, 2) if issue_count > 0 else 0.0

    # Distributions
    severity_dist = await _aggregate_counts("bugs", bug_match, "severity")
    status_breakdown = await _aggregate_counts("bugs", bug_match, "status")
    age_dist = await _compute_bug_ages(bug_match, now)

    # Resolution metrics
    avg_resolution_hours, resolved_count = await _compute_resolution_time(bug_match, now)

    # Trends
    bug_trend = await _build_daily_trend("bugs", bug_match, start, days)
    rework_trend = await _build_daily_trend("issues", {**issue_match, "reopened": True}, start, days)

    # Flow metrics
    inflow_outflow = await _build_inflow_outflow(bug_match, start, days)
    mttr_data = await _compute_mttr_trend(bug_match, start, days)
    sla_compliance = await _compute_sla_compliance(bug_match, now)

    # Previous period comparison
    prev = await _compute_prev_period_quality(match, start, end)

    # Defect density
    density_pipeline = [
        {"$match": bug_match},
        {"$group": {"_id": "$module", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
        {"$limit": 20},
    ]
    defect_density: list[dict[str, Any]] = []
    async for doc in db.db["bugs"].aggregate(density_pipeline):
        defect_density.append({"module": doc["_id"] or "unknown", "bugs": doc["count"]})

    # Quality score
    quality_score, score_breakdown = _compute_quality_score(
        bug_rate, rework_rate, severity_dist,
        mttr_data["overall"], sla_compliance,
    )

    # ── Enhanced: real-time & actionable metrics ──

    # Real-time freshness: seconds since latest bug activity
    freshness_seconds = await _compute_freshness(bug_match, now)

    # Recent activity (last 24h) for real-time feel
    recent = await _compute_recent_activity(match, now)

    # Quality trend direction and delta
    prev_score, __ = _compute_quality_score(
        prev["bug_rate"], prev["rework_rate"], severity_dist,
        mttr_data["overall"], prev.get("sla_compliance", sla_compliance),
    )
    trend_delta = round(quality_score - prev_score, 1) if prev_score > 0 else 0.0
    trend_direction = _classify_trend(trend_delta)

    # Open critical bugs (most actionable KPI)
    critical_open = await db.db["bugs"].count_documents({
        **{k: v for k, v in bug_match.items() if k != "createdAt"},
        "severity": "critical",
        "status": {"$nin": normalize_status_list(CLOSED_STATUSES)},
    })

    # Per-module quality scores
    module_quality = await _compute_module_quality(bug_match, issue_match, start, end)

    # Bug resolution velocity (bugs resolved per day in period)
    velocity = round(resolved_count / days, 1) if days > 0 else 0.0

    # MTTR breakdown by severity
    mttr_by_severity = await _compute_mttr_by_severity(bug_match)

    # Reopen analysis by module
    reopen_by_module = await _compute_reopen_by_module(issue_match)

    # ── Sidebar attention & data-quality metrics ──
    open_non_done: dict[str, Any] = {
        k: v for k, v in bug_match.items() if k != "createdAt"
    }
    open_non_done["status"] = {"$nin": normalize_status_list(CLOSED_STATUSES)}

    unassigned_open = await db.db["bugs"].count_documents({
        **open_non_done,
        "$or": [{"assignee": None}, {"assignee": ""}],
    })

    stale_cutoff = (now - timedelta(days=30)).isoformat()
    stale_open = await db.db["bugs"].count_documents({
        **open_non_done,
        "updatedAt": {"$lt": stale_cutoff},
    })

    completeness = await _compute_completeness(bug_match)

    result = {
        # Core metrics (backward compatible)
        "bug_rate": bug_rate,
        "bug_count": bug_count,
        "rework_rate": rework_rate,
        "reopened_count": reopened,
        "issue_count": issue_count,
        "defect_density": defect_density,
        "quality_score": quality_score,
        "quality_score_breakdown": score_breakdown,
        "severity_distribution": severity_dist,
        "status_breakdown": status_breakdown,
        "bug_age_distribution": age_dist,
        "avg_resolution_hours": avg_resolution_hours,
        "resolved_count": resolved_count,
        "bug_trend": bug_trend,
        "rework_trend": rework_trend,
        "inflow_outflow": inflow_outflow,
        "mttr_hours": mttr_data["overall"],
        "mttr_trend": mttr_data["trend"],
        "sla_compliance": sla_compliance,
        "prev_period": prev,
        "period": {"start": start.strftime("%Y-%m-%d"), "end": end.strftime("%Y-%m-%d")},
        "generated_at": now.strftime("%Y-%m-%dT%H:%M:%SZ"),
        # Enhanced metrics
        "freshness_seconds": freshness_seconds,
        "trend_direction": trend_direction,
        "trend_delta": trend_delta,
        "critical_open": critical_open,
        "module_quality": module_quality,
        "recent_activity": recent,
        "resolution_velocity": velocity,
        "mttr_by_severity": mttr_by_severity,
        "reopen_by_module": reopen_by_module,
            # Sidebar attention & data-quality
            "unassigned_open": unassigned_open,
            "stale_open": stale_open,
            "completeness": completeness,
    }

    _cache[cache_key] = (now_ts + _CACHE_TTL, result)

    # Trigger alert check for critical quality issues (fire-and-forget)
    _maybe_trigger_alerts(result)

    return result


# ── Enhanced metric helpers ──

async def _compute_freshness(bug_match: dict[str, Any], now: datetime) -> int | None:
    """Seconds since the most recent bug activity (created or updated)."""
    match: dict[str, Any] = {k: v for k, v in bug_match.items() if k != "createdAt"}
    latest = await db.db["bugs"].find_one(
        match, sort=[("updatedAt", -1)], projection={"updatedAt": 1, "createdAt": 1}
    )
    if not latest:
        return None
    ts_str = latest.get("updatedAt") or latest.get("createdAt")
    if not ts_str:
        return None
    try:
        if isinstance(ts_str, int | float):
            ts = datetime.fromtimestamp(ts_str / 1000 if ts_str > 1e12 else ts_str)
        else:
            ts = datetime.fromisoformat(str(ts_str).replace("Z", "+00:00").replace("+00:00", ""))
        return int((now - ts.replace(tzinfo=None)).total_seconds())
    except (ValueError, TypeError):
        return None


async def _compute_recent_activity(
    match: dict[str, Any], now: datetime
) -> dict[str, Any]:
    """Bugs created and resolved in the last 24 hours."""
    since = (now - timedelta(hours=24)).isoformat()
    base: dict[str, Any] = {**match}

    created_24h = await db.db["bugs"].count_documents({
        **base, "createdAt": {"$gte": since, "$lte": now.isoformat()}
    })
    resolved_24h = await db.db["bugs"].count_documents({
        **base, "resolvedAt": {"$gte": since, "$lte": now.isoformat()},
        "status": {"$in": normalize_status_list(CLOSED_STATUSES)},
    })
    return {"created_24h": created_24h, "resolved_24h": resolved_24h}


async def _compute_module_quality(
    bug_match: dict[str, Any], issue_match: dict[str, Any],
    start: datetime, end: datetime
) -> list[dict[str, Any]]:
    """Per-module quality scores combining defect count, severity, and rework."""
    # Get bugs per module with severity breakdown
    bug_pipeline = [
        {"$match": bug_match},
        {"$group": {
            "_id": "$module",
            "total_bugs": {"$sum": 1},
            "critical": {"$sum": {"$cond": [{"$eq": ["$severity", "critical"]}, 1, 0]}},
            "major": {"$sum": {"$cond": [{"$eq": ["$severity", "major"]}, 1, 0]}},
        }},
        {"$sort": {"total_bugs": -1}},
        {"$limit": 15},
    ]
    module_bugs: dict[str, dict[str, int]] = {}
    async for doc in db.db["bugs"].aggregate(bug_pipeline):
        mod = doc["_id"] or "unknown"
        module_bugs[mod] = {
            "total": doc["total_bugs"],
            "critical": doc.get("critical", 0),
            "major": doc.get("major", 0),
        }

    # Get issues per module for rate calculation
    issue_pipeline = [
        {"$match": issue_match},
        {"$group": {"_id": "$module", "total_issues": {"$sum": 1}}},
    ]
    module_issues: dict[str, int] = {}
    async for doc in db.db["issues"].aggregate(issue_pipeline):
        module_issues[doc["_id"] or "unknown"] = doc["total_issues"]

    # Compute per-module quality score
    result: list[dict[str, Any]] = []
    for mod_name, bugs in module_bugs.items():
        issues = module_issues.get(mod_name, 1)
        bug_rate_mod = round(bugs["total"] / issues * 100, 2) if issues > 0 else 0.0
        severity_penalty = bugs["critical"] * 5 + bugs["major"] * 2
        score = max(0.0, round(100.0 - bug_rate_mod * 3 - min(severity_penalty, 40), 1))
        result.append({
            "module": mod_name,
            "bugs": bugs["total"],
            "critical": bugs["critical"],
            "issues": issues,
            "bug_rate": bug_rate_mod,
            "quality_score": score,
        })

    result.sort(key=lambda x: x["quality_score"])
    return result


def _classify_trend(delta: float) -> str:
    if delta > 2:
        return "improving"
    if delta < -2:
        return "declining"
    return "stable"


# ── Original helpers (preserved) ──

async def _aggregate_counts(cname: str, match: dict[str, Any], field: str) -> dict[str, int]:
    result: dict[str, int] = {}
    pipeline = [
        {"$match": match},
        {"$group": {"_id": f"${field}", "count": {"$sum": 1}}},
    ]
    async for doc in db.db[cname].aggregate(pipeline):
        key = (doc["_id"] or "unknown").strip().lower()
        result[key] = doc["count"]
    return result


async def _compute_bug_ages(match: dict[str, Any], now: datetime) -> dict[str, int]:
    buckets = {"lt_1d": 0, "1_3d": 0, "3_7d": 0, "7_30d": 0, "gt_30d": 0}
    pipeline = [
        {"$match": {**match, "status": {"$nin": normalize_status_list(CLOSED_STATUSES)}}},
        {"$project": {
            "age_hours": {
                "$divide": [
                    {"$subtract": [now, {"$toDate": "$createdAt"}]},
                    3600000,
                ]
            }
        }},
        {"$group": {
            "_id": None,
            "lt_1d": {"$sum": {"$cond": [{"$lt": ["$age_hours", 24]}, 1, 0]}},
            "1_3d": {"$sum": {"$cond": [
                {"$and": [{"$gte": ["$age_hours", 24]}, {"$lt": ["$age_hours", 72]}]}, 1, 0
            ]}},
            "3_7d": {"$sum": {"$cond": [
                {"$and": [{"$gte": ["$age_hours", 72]}, {"$lt": ["$age_hours", 168]}]}, 1, 0
            ]}},
            "7_30d": {"$sum": {"$cond": [
                {"$and": [{"$gte": ["$age_hours", 168]}, {"$lt": ["$age_hours", 720]}]}, 1, 0
            ]}},
            "gt_30d": {"$sum": {"$cond": [{"$gte": ["$age_hours", 720]}, 1, 0]}},
        }},
    ]
    async for doc in db.db["bugs"].aggregate(pipeline):
        for k in buckets:
            buckets[k] = doc.get(k, 0)
    return buckets


async def _compute_resolution_time(match: dict[str, Any], now: datetime) -> tuple[float | None, int]:
    pipeline = [
        {"$match": {**match, "status": {"$in": normalize_status_list(CLOSED_STATUSES)}, "resolvedAt": {"$exists": True}}},
        {"$project": {
            "hours": {
                "$divide": [
                    {"$subtract": [{"$toDate": "$resolvedAt"}, {"$toDate": "$createdAt"}]},
                    3600000,
                ]
            }
        }},
        {"$group": {"_id": None, "avg_hours": {"$avg": "$hours"}, "count": {"$sum": 1}}},
    ]
    async for doc in db.db["bugs"].aggregate(pipeline):
        avg = round(doc["avg_hours"], 1) if doc.get("avg_hours") else None
        return avg, doc.get("count", 0)
    return None, 0


async def _build_daily_trend(
    cname: str, match: dict[str, Any], start: datetime, days: int
) -> list[dict[str, Any]]:
    pipeline = [
        {"$match": match},
        {"$group": {
            "_id": {"$substr": ["$createdAt", 0, 10]},
            "value": {"$sum": 1},
        }},
        {"$sort": {"_id": 1}},
    ]
    trend_map: dict[str, int] = {}
    async for doc in db.db[cname].aggregate(pipeline):
        trend_map[doc["_id"]] = doc["value"]

    return [
        {"date": (start + timedelta(days=i)).strftime("%Y-%m-%d"), "value": trend_map.get(
            (start + timedelta(days=i)).strftime("%Y-%m-%d"), 0
        )}
        for i in range(days)
    ]


async def _build_inflow_outflow(
    bug_match: dict[str, Any], start: datetime, days: int
) -> dict[str, list[dict[str, Any]]]:
    """Build daily inflow (created) and outflow (resolved) data."""
    inflow_pipeline = [
        {"$match": bug_match},
        {"$group": {
            "_id": {"$substr": ["$createdAt", 0, 10]},
            "value": {"$sum": 1},
        }},
        {"$sort": {"_id": 1}},
    ]
    inflow_map: dict[str, int] = {}
    async for doc in db.db["bugs"].aggregate(inflow_pipeline):
        inflow_map[doc["_id"]] = doc["value"]

    outflow_match: dict[str, Any] = {
        k: v for k, v in bug_match.items() if k != "createdAt"
    }
    outflow_match["status"] = {"$in": normalize_status_list(CLOSED_STATUSES)}
    outflow_match["resolvedAt"] = {
        "$gte": start.isoformat(),
        "$lte": (start + timedelta(days=days)).isoformat(),
    }
    outflow_pipeline = [
        {"$match": outflow_match},
        {"$group": {
            "_id": {"$substr": ["$resolvedAt", 0, 10]},
            "value": {"$sum": 1},
        }},
        {"$sort": {"_id": 1}},
    ]
    outflow_map: dict[str, int] = {}
    async for doc in db.db["bugs"].aggregate(outflow_pipeline):
        outflow_map[doc["_id"]] = doc["value"]

    inflow = []
    outflow = []
    for i in range(days):
        date_str = (start + timedelta(days=i)).strftime("%Y-%m-%d")
        inflow.append({"date": date_str, "value": inflow_map.get(date_str, 0)})
        outflow.append({"date": date_str, "value": outflow_map.get(date_str, 0)})

    return {"inflow": inflow, "outflow": outflow}


async def _compute_mttr_trend(
    bug_match: dict[str, Any], start: datetime, days: int
) -> dict[str, Any]:
    """Compute overall MTTR and daily MTTR trend."""
    trend_match: dict[str, Any] = {
        k: v for k, v in bug_match.items() if k != "createdAt"
    }
    trend_match["status"] = {"$in": normalize_status_list(CLOSED_STATUSES)}
    trend_match["resolvedAt"] = {
        "$gte": start.isoformat(),
        "$lte": (start + timedelta(days=days)).isoformat(),
    }
    pipeline = [
        {"$match": trend_match},
        {"$project": {
            "date": {"$substr": ["$resolvedAt", 0, 10]},
            "hours": {
                "$divide": [
                    {"$subtract": [{"$toDate": "$resolvedAt"}, {"$toDate": "$createdAt"}]},
                    3600000,
                ]
            }
        }},
        {"$group": {
            "_id": "$date",
            "avg_hours": {"$avg": "$hours"},
            "count": {"$sum": 1},
        }},
        {"$sort": {"_id": 1}},
    ]
    trend_map: dict[str, float] = {}
    total_hours = 0.0
    total_count = 0
    async for doc in db.db["bugs"].aggregate(pipeline):
        if doc.get("avg_hours"):
            trend_map[doc["_id"]] = round(doc["avg_hours"], 1)
            total_hours += doc["avg_hours"] * doc["count"]
            total_count += doc["count"]

    overall = round(total_hours / total_count, 1) if total_count > 0 else 0.0
    trend = [
        {
            "date": (start + timedelta(days=i)).strftime("%Y-%m-%d"),
            "value": trend_map.get((start + timedelta(days=i)).strftime("%Y-%m-%d"), 0.0),
        }
        for i in range(days)
    ]

    return {"overall": overall, "trend": trend}


async def _compute_mttr_by_severity(
    bug_match: dict[str, Any]
) -> dict[str, float]:
    """Compute avg resolution time broken down by severity level."""
    mttr_match: dict[str, Any] = {
        k: v for k, v in bug_match.items() if k != "createdAt"
    }
    mttr_match["status"] = {"$in": normalize_status_list(CLOSED_STATUSES)}
    mttr_match["resolvedAt"] = {"$exists": True}

    pipeline = [
        {"$match": mttr_match},
        {"$project": {
            "severity": {"$ifNull": ["$severity", "trivial"]},
            "hours": {
                "$divide": [
                    {"$subtract": [{"$toDate": "$resolvedAt"}, {"$toDate": "$createdAt"}]},
                    3600000,
                ]
            }
        }},
        {"$group": {
            "_id": "$severity",
            "avg_hours": {"$avg": "$hours"},
            "count": {"$sum": 1},
        }},
    ]

    result: dict[str, float] = {}
    async for doc in db.db["bugs"].aggregate(pipeline):
        sev = (doc["_id"] or "trivial").strip().lower()
        if doc.get("avg_hours"):
            result[sev] = round(doc["avg_hours"], 1)
    return result


async def _compute_reopen_by_module(
    issue_match: dict[str, Any]
) -> list[dict[str, Any]]:
    """Count reopened issues by module."""
    pipeline = [
        {"$match": {**issue_match, "reopened": True}},
        {"$group": {"_id": "$module", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
        {"$limit": 10},
    ]
    result: list[dict[str, Any]] = []
    async for doc in db.db["issues"].aggregate(pipeline):
        result.append({"module": doc["_id"] or "unknown", "count": doc["count"]})
    return result


async def _compute_sla_compliance(bug_match: dict[str, Any], now: datetime) -> float:
    """Compute the percentage of resolved bugs that met their SLA target."""
    sla_match: dict[str, Any] = {
        k: v for k, v in bug_match.items() if k != "createdAt"
    }
    sla_match["status"] = {"$in": normalize_status_list(CLOSED_STATUSES)}
    sla_match["resolvedAt"] = {"$exists": True}

    pipeline = [
        {"$match": sla_match},
        {"$project": {
            "severity": {"$ifNull": ["$severity", "trivial"]},
            "hours": {
                "$divide": [
                    {"$subtract": [{"$toDate": "$resolvedAt"}, {"$toDate": "$createdAt"}]},
                    3600000,
                ]
            }
        }},
    ]

    total = 0
    within_sla = 0
    async for doc in db.db["bugs"].aggregate(pipeline):
        total += 1
        sev = doc.get("severity", "trivial").strip().lower()
        target = SLA_TARGETS.get(sev, SLA_TARGETS["trivial"])
        if (doc.get("hours") or 0) <= target:
            within_sla += 1

    return round(within_sla / total * 100, 1) if total > 0 else 100.0


async def _compute_prev_period_quality(
    base_match: dict[str, Any], start: datetime, end: datetime
) -> dict[str, Any]:
    period_span = end - start
    prev_end = start - timedelta(seconds=1)
    prev_start = prev_end - period_span
    date_filter = {"createdAt": {"$gte": prev_start.isoformat(), "$lte": prev_end.isoformat()}}

    prev_bug_match = {**base_match, **date_filter}
    prev_issue_match = {**base_match, **date_filter}

    prev_bugs = await db.db["bugs"].count_documents(prev_bug_match)
    prev_issues = await db.db["issues"].count_documents(prev_issue_match)
    prev_reopened = await db.db["issues"].count_documents({**prev_issue_match, "reopened": True})

    # Also compute SLA for prev period
    prev_sla = await _compute_sla_compliance(prev_bug_match, start)

    return {
        "bug_count": prev_bugs,
        "bug_rate": round(prev_bugs / prev_issues * 100, 2) if prev_issues > 0 else 0.0,
        "rework_rate": round(prev_reopened / prev_issues * 100, 2) if prev_issues > 0 else 0.0,
        "reopened_count": prev_reopened,
        "sla_compliance": prev_sla,
    }


def _compute_quality_score(
    bug_rate: float,
    rework_rate: float,
    severity_dist: dict[str, int] | None = None,
    mttr_hours: float = 0.0,
    sla_compliance: float = 100.0,
) -> tuple[float, dict[str, float]]:
    """Compute a weighted multi-dimensional quality score (0-100)."""
    bug_rate_score = max(0.0, 100.0 - bug_rate * 5)
    rework_score = max(0.0, 100.0 - rework_rate * 3.33)

    if severity_dist:
        critical = severity_dist.get("critical", 0)
        total = sum(severity_dist.values()) or 1
        critical_ratio = critical / total * 100
        severity_score = max(0.0, 100.0 - critical_ratio * 2)
    else:
        severity_score = 100.0

    mttr_score = max(0.0, 100.0 - min(mttr_hours, 168) / 168 * 100)
    sla_score = sla_compliance

    breakdown = {
        "bug_rate_score": round(bug_rate_score, 1),
        "rework_score": round(rework_score, 1),
        "severity_score": round(severity_score, 1),
        "mttr_score": round(mttr_score, 1),
        "sla_score": round(sla_score, 1),
    }

    score = (
        bug_rate_score * QUALITY_WEIGHTS["bug_rate"]
        + rework_score * QUALITY_WEIGHTS["rework_rate"]
        + severity_score * QUALITY_WEIGHTS["severity"]
        + mttr_score * QUALITY_WEIGHTS["mttr"]
        + sla_score * QUALITY_WEIGHTS["sla_compliance"]
    )

    return round(max(0.0, min(100.0, score)), 1), breakdown


async def _compute_completeness(bug_match: dict[str, Any]) -> dict[str, Any]:
    """Compute data-quality completeness: pct of bugs with non-empty key fields."""
    pipeline = [
        {"$match": bug_match},
        {"$group": {
            "_id": None,
            "total": {"$sum": 1},
            "has_description": {"$sum": {"$cond": [{"$and": [
                {"$ne": ["$description", None]}, {"$ne": ["$description", ""]}
            ]}, 1, 0]}},
            "has_assignee": {"$sum": {"$cond": [{"$and": [
                {"$ne": ["$assignee", None]}, {"$ne": ["$assignee", ""]}
            ]}, 1, 0]}},
            "has_environment": {"$sum": {"$cond": [{"$and": [
                {"$ne": ["$environment", None]}, {"$ne": ["$environment", ""]}
            ]}, 1, 0]}},
            "has_fixedVersion": {"$sum": {"$cond": [{"$and": [
                {"$ne": ["$fixedVersion", None]}, {"$ne": ["$fixedVersion", ""]}
            ]}, 1, 0]}},
        }},
    ]
    total = 0
    has_desc = 0
    has_assignee = 0
    has_env = 0
    has_fixed = 0
    async for doc in db.db["bugs"].aggregate(pipeline):
        total = doc.get("total", 0)
        has_desc = doc.get("has_description", 0)
        has_assignee = doc.get("has_assignee", 0)
        has_env = doc.get("has_environment", 0)
        has_fixed = doc.get("has_fixedVersion", 0)

    def _pct(n: int) -> int:
        return round(n / total * 100) if total > 0 else 0

    return {
        "total": total,
        "description_pct": _pct(has_desc),
        "assignee_pct": _pct(has_assignee),
        "environment_pct": _pct(has_env),
        "fixedVersion_pct": _pct(has_fixed),
    }


def _maybe_trigger_alerts(result: dict[str, Any]) -> None:
    """Fire-and-forget alert check for critical quality regressions.

    Thresholds are configurable via ``config.yaml`` → ``alert:`` section.
    """
    from shared.config import settings

    quality_score = result.get("quality_score", 100)
    critical_open = result.get("critical_open", 0)
    sla_compliance = result.get("sla_compliance", 100)
    trend_direction = result.get("trend_direction", "stable")

    score_threshold = getattr(settings, "alert_quality_score_critical", None) or 50
    sla_threshold = getattr(settings, "alert_sla_critical_pct", None) or 50
    open_threshold = getattr(settings, "alert_critical_open_max", None) or 5

    issues: list[str] = []
    if quality_score < score_threshold:
        issues.append(f"Quality Score dropped to {quality_score} (threshold: {score_threshold})")
    if critical_open > open_threshold:
        issues.append(f"{critical_open} critical bugs still open (threshold: {open_threshold})")
    if sla_compliance < sla_threshold:
        issues.append(f"SLA Compliance at {sla_compliance}% (threshold: {sla_threshold}%)")
    if trend_direction == "declining":
        issues.append(f"Quality trend declining ({result.get('trend_delta', 0)} pts)")

    if issues:
        try:
            from services.alert.alert_service import alert_service
            asyncio.ensure_future(alert_service.send_alert(
                title="Quality Alert",
                message="\n".join(f"- {i}" for i in issues),
                severity="critical" if quality_score < score_threshold else "warning",
            ))
        except Exception:
            pass  # alert failure must not block metrics response
