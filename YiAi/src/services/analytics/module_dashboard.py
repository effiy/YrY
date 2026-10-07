"""Module dashboard aggregator — server-side weighted progress, burndown, velocity,
and data-quality signals for the YiVad /module page.

Replaces client-side computation in useModuleData.ts with a single MongoDB-backed
aggregation that is more accurate (all data, not just loaded subset) and
richer (story-point weighting, scope-creep detection, burndown/velocity charts).
"""

from __future__ import annotations

from collections import defaultdict
from datetime import datetime, timedelta, timezone
from typing import Any

from data.database import db

# Re-use existing helpers from the analytics aggregator package
from services.analytics.aggregator.helpers import _get_field, _is_done, _iso_week, _parse_dt

# ── Constants ──────────────────────────────────────────────────────────────

_BURNDOWN_DAYS = 14
_VELOCITY_WEEKS = 8
_QUALITY_DESC_MIN_LEN = 50
_SCOPE_CREEP_THRESHOLD_PCT = 20


# ── Public API ─────────────────────────────────────────────────────────────


async def get_module_dashboard(params: dict[str, Any]) -> dict[str, Any]:
    """Return module-level dashboard: per-module stats, summary, burndown, velocity.

    ``params``: ``{ project_key?: str, date?: str }``
    """
    project_key: str | None = params.get("project_key")
    date_filter: str | None = params.get("date")

    now = datetime.now(timezone.utc)
    end = now.replace(hour=23, minute=59, second=59)
    start = end - timedelta(days=max(_BURNDOWN_DAYS, _VELOCITY_WEEKS * 7))

    # ── 1. Load modules ──
    mod_match: dict[str, Any] = {}
    if project_key:
        mod_match["project_key"] = project_key
    if date_filter:
        mod_match["updated_at"] = {
            "$gte": date_filter,
            "$lt": (datetime.strptime(date_filter, "%Y-%m-%d") + timedelta(days=1)).strftime("%Y-%m-%d"),
        }

    mods_cursor = db.db["modules"].find(mod_match).sort("updated_at", -1)
    raw_modules = await mods_cursor.to_list(length=2000)
    if not raw_modules:
        return _empty_dashboard()

    # ── 2. Collect all issue keys referenced by modules ──
    all_issue_keys: list[str] = []
    for m in raw_modules:
        keys = m.get("issue_keys") or []
        all_issue_keys.extend(keys)

    all_issue_keys = list(set(all_issue_keys))

    # ── 3. Load referenced issues ──
    issues: list[dict[str, Any]] = []
    if all_issue_keys:
        iss_cursor = db.db["issues"].find({"key": {"$in": all_issue_keys}})
        issues = await iss_cursor.to_list(length=50000)

    issue_by_key: dict[str, dict[str, Any]] = {i["key"]: i for i in issues}

    # ── 4. Compute per-module metrics ──
    module_metrics: list[dict[str, Any]] = []
    all_done_issues: list[dict[str, Any]] = []

    for mod in raw_modules:
        mod_issues = [
            issue_by_key[k] for k in (mod.get("issue_keys") or []) if k in issue_by_key
        ]
        done_issues = [i for i in mod_issues if _is_done(i)]
        all_done_issues.extend(done_issues)

        total_pts, done_pts = 0.0, 0.0
        for iss in mod_issues:
            pt = _get_issue_points(iss)
            total_pts += pt
            if _is_done(iss):
                done_pts += pt

        issue_count = len(mod_issues)
        done_count = len(done_issues)
        weighted_progress = round(done_pts / total_pts * 100, 1) if total_pts > 0 else 0
        simple_progress = round(done_count / issue_count * 100, 1) if issue_count > 0 else 0

        # Quality
        desc = mod.get("description") or ""
        has_desc = len(desc.strip()) >= _QUALITY_DESC_MIN_LEN
        has_lead = bool(mod.get("lead"))
        has_dates = bool(mod.get("start_date") or mod.get("due_date"))
        quality = _compute_quality(has_desc, has_lead, has_dates, issue_count)

        # Scope creep: issues created in first 7 days vs total
        scope_creep = _compute_scope_creep(mod_issues, mod.get("created_at"))

        # Blocked / unassigned
        blocked = sum(1 for i in mod_issues if (i.get("blocked_by") or []))
        unassigned = sum(
            1 for i in mod_issues
            if not _is_done(i) and not i.get("assignee")
        )

        # Overdue
        due = mod.get("due_date")
        overdue = bool(
            mod.get("status") == "in_progress"
            and due
            and due < now.strftime("%Y-%m-%d")
        )

        # Stale days
        updated = _parse_dt(_get_field(mod, "updated_at", "updatedAt"))
        stale_days = max(0, (now - updated).days) if updated else 0

        module_metrics.append({
            "key": mod["key"],
            "name": mod.get("name", ""),
            "status": mod.get("status", "planned"),
            "lead": mod.get("lead"),
            "project_key": mod.get("project_key", ""),
            "issue_keys": mod.get("issue_keys") or [],
            "issue_count": issue_count,
            "done_count": done_count,
            "total_points": round(total_pts, 1),
            "done_points": round(done_pts, 1),
            "weighted_progress": weighted_progress,
            "simple_progress": simple_progress,
            "description_len": len(desc.strip()),
            "has_description": has_desc,
            "has_lead": has_lead,
            "has_dates": has_dates,
            "quality_score": quality,
            "scope_creep_pct": scope_creep,
            "blocked_count": blocked,
            "unassigned_count": unassigned,
            "overdue": overdue,
            "stale_days": stale_days,
            "created_at": mod.get("created_at", ""),
            "updated_at": mod.get("updated_at", ""),
        })

    # ── 5. Summary ──
    active = [m for m in module_metrics if m["status"] == "in_progress"]
    completed = [m for m in module_metrics if m["status"] == "completed"]
    cancelled = [m for m in module_metrics if m["status"] == "cancelled"]

    total_issues_all = sum(m["issue_count"] for m in module_metrics)
    total_done_all = sum(m["done_count"] for m in module_metrics)
    total_pts_all = sum(m["total_points"] for m in module_metrics)
    done_pts_all = sum(m["done_points"] for m in module_metrics)

    overall_weighted = round(done_pts_all / total_pts_all * 100, 1) if total_pts_all > 0 else 0
    overall_simple = round(total_done_all / total_issues_all * 100, 1) if total_issues_all > 0 else 0

    overdue_count = sum(1 for m in module_metrics if m["overdue"])
    empty_count = sum(
        1 for m in module_metrics
        if m["issue_count"] == 0 and m["status"] not in ("completed", "cancelled")
    )
    stalled_count = sum(
        1 for m in module_metrics
        if m["status"] == "in_progress" and m["issue_count"] > 0 and m["simple_progress"] == 0
    )

    avg_quality = round(
        sum(m["quality_score"] for m in module_metrics) / len(module_metrics), 1
    ) if module_metrics else 0

    scope_creep_mods = [m["key"] for m in module_metrics if m["scope_creep_pct"] > _SCOPE_CREEP_THRESHOLD_PCT]

    summary = {
        "total": len(module_metrics),
        "active": len(active),
        "completed": len(completed),
        "cancelled": len(cancelled),
        "planned": len([m for m in module_metrics if m["status"] == "planned"]),
        "overall_weighted_progress": overall_weighted,
        "overall_simple_progress": overall_simple,
        "total_issues": total_issues_all,
        "total_done_issues": total_done_all,
        "total_points": round(total_pts_all, 1),
        "done_points": round(done_pts_all, 1),
        "overdue_count": overdue_count,
        "empty_count": empty_count,
        "stalled_count": stalled_count,
        "blocked_total": sum(m["blocked_count"] for m in module_metrics),
        "unassigned_total": sum(m["unassigned_count"] for m in module_metrics),
        "avg_quality_score": avg_quality,
        "scope_creep_modules": scope_creep_mods,
    }

    # ── 6. Burndown (last 14 days) ──
    burndown = _build_burndown(module_metrics, all_done_issues, start, end)

    # ── 7. Velocity (last 8 weeks) ──
    velocity = _build_velocity(all_done_issues)

    return {
        "modules": module_metrics,
        "summary": summary,
        "burndown": burndown,
        "velocity": velocity,
        "period": {"start": start.strftime("%Y-%m-%d"), "end": end.strftime("%Y-%m-%d")},
        "generated_at": now.strftime("%Y-%m-%dT%H:%M:%SZ"),
    }


# ── Helpers ────────────────────────────────────────────────────────────────


def _get_issue_points(issue: dict[str, Any]) -> float:
    sp = issue.get("story_points") or issue.get("estimate_points")
    if sp is not None:
        try:
            return float(sp)
        except (ValueError, TypeError):
            return 0.0
    return 0.0


def _compute_quality(has_desc: bool, has_lead: bool, has_dates: bool, issue_count: int) -> float:
    score = 0.0
    if has_desc:
        score += 35
    if has_lead:
        score += 25
    if has_dates:
        score += 20
    if issue_count > 0:
        score += 20
    return score


def _compute_scope_creep(mod_issues: list[dict[str, Any]], created_at: Any) -> float:
    if not mod_issues or len(mod_issues) < 2:
        return 0.0
    mod_created = _parse_dt(created_at)
    if not mod_created:
        return 0.0
    cutoff = mod_created + timedelta(days=7)
    later = sum(
        1 for i in mod_issues
        if _parse_dt(_get_field(i, "created_at", "createdAt"))
        and _parse_dt(_get_field(i, "created_at", "createdAt")) > cutoff  # type: ignore[arg-type]
    )
    return round(later / len(mod_issues) * 100, 1)


def _build_burndown(
    modules: list[dict[str, Any]],
    done_issues: list[dict[str, Any]],
    start: datetime,
    end: datetime,
) -> list[dict[str, Any]]:
    total_issues = sum(m["issue_count"] for m in modules)
    if total_issues == 0:
        return []

    done_by_day: dict[str, int] = defaultdict(int)
    for iss in done_issues:
        completed = _parse_dt(_get_field(iss, "updated_at", "updatedAt"))
        created = _parse_dt(_get_field(iss, "created_at", "createdAt"))
        ref = completed or created
        if ref:
            done_by_day[ref.strftime("%Y-%m-%d")] += 1

    days = (_BURNDOWN_DAYS + 1)
    cum_done = 0
    for d, c in done_by_day.items():
        if d < start.strftime("%Y-%m-%d"):
            cum_done += c

    ideal_per_day = total_issues / max(_BURNDOWN_DAYS, 1)
    result: list[dict[str, Any]] = []
    for i in range(days):
        d = (start + timedelta(days=i)).strftime("%Y-%m-%d")
        cum_done += done_by_day.get(d, 0)
        remaining = total_issues - cum_done
        ideal = max(0, total_issues - ideal_per_day * i)
        result.append({
            "date": d,
            "remaining": remaining,
            "ideal": round(ideal, 1),
        })

    return result


def _build_velocity(done_issues: list[dict[str, Any]]) -> list[dict[str, Any]]:
    by_week: dict[str, dict[str, float]] = defaultdict(lambda: {"points": 0.0, "count": 0})

    for iss in done_issues:
        completed = _parse_dt(_get_field(iss, "updated_at", "updatedAt"))
        created = _parse_dt(_get_field(iss, "created_at", "createdAt"))
        ref = completed or created
        if not ref:
            continue
        wk = _iso_week(ref)
        by_week[wk]["points"] += _get_issue_points(iss)
        by_week[wk]["count"] += 1

    now = datetime.now(timezone.utc)
    result: list[dict[str, Any]] = []
    for i in range(_VELOCITY_WEEKS - 1, -1, -1):
        d = now - timedelta(weeks=i)
        wk = _iso_week(d)
        data = by_week.get(wk, {"points": 0.0, "count": 0})
        result.append({
            "week": wk,
            "points": round(data["points"], 1),
            "count": int(data["count"]),
        })

    return result


def _empty_dashboard() -> dict[str, Any]:
    now = datetime.now(timezone.utc)
    return {
        "modules": [],
        "summary": {
            "total": 0, "active": 0, "completed": 0, "cancelled": 0, "planned": 0,
            "overall_weighted_progress": 0, "overall_simple_progress": 0,
            "total_issues": 0, "total_done_issues": 0,
            "total_points": 0, "done_points": 0,
            "overdue_count": 0, "empty_count": 0, "stalled_count": 0,
            "blocked_total": 0, "unassigned_total": 0,
            "avg_quality_score": 0, "scope_creep_modules": [],
        },
        "burndown": [],
        "velocity": [],
        "period": {"start": "", "end": ""},
        "generated_at": now.strftime("%Y-%m-%dT%H:%M:%SZ"),
    }
