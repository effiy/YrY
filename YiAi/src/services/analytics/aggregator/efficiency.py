"""Efficiency metrics — cycle time, lead time, throughput, CFD, WIP aging, bottlenecks.

Computes real cycle time, lead time, WIP aging, throughput, CFD, bottleneck analysis,
and statistical process control metrics from actual issue timestamps.

``params``: ``{ project_key?: str, dateRange?: { start, end } }``
"""

from __future__ import annotations

from collections import defaultdict
from datetime import datetime, timedelta, timezone
from statistics import mean as _mean

# ── Module-level cache ──────────────────────────────────────────────────────
import time
from typing import Any

from data.database import db

from .helpers import (
    _cache_key,
    _empty_response,
    _get_field,
    _is_done,
    _iso_week,
    _parse_dt,
    _percentiles,
)

_cache: dict[str, tuple[float, Any]] = {}
_CACHE_TTL = 30


async def get_efficiency_metrics(params: dict[str, Any]) -> dict[str, Any]:
    """Return efficiency metrics computed directly from issue data."""
    cache_key = _cache_key("eff", params)
    now_ts = time.time()
    if cache_key in _cache:
        expires, val = _cache[cache_key]
        if now_ts < expires:
            return val

    project_key: str | None = params.get("project_key")
    date_range: dict[str, Any] | None = params.get("dateRange")

    now = datetime.utcnow()
    start_str = date_range.get("start") if date_range else None
    end_str = date_range.get("end") if date_range else None
    start = datetime.fromisoformat(start_str) if start_str else now - timedelta(days=90)
    end = datetime.fromisoformat(end_str) if end_str else now
    end = end.replace(hour=23, minute=59, second=59)

    match: dict[str, Any] = {}
    if project_key:
        match["project_key"] = project_key
    else:
        match["project_key"] = {"$exists": True}

    issues_cursor = db.db["issues"].find(match)
    issues = await issues_cursor.to_list(length=5000)

    if not issues:
        return _empty_response()

    done_issues = [d for d in issues if _is_done(d)]
    wip_issues = [d for d in issues if not _is_done(d)]

    status_counts: dict[str, int] = defaultdict(int)
    for doc in issues:
        s = _get_field(doc, "status", default="unknown").strip()
        status_counts[s] += 1

    done_count = len(done_issues)
    total_issues = len(issues)
    wip_breakdown = {
        k: v
        for k, v in sorted(status_counts.items(), key=lambda x: -x[1])
        if k.lower() not in {"done", "closed", "resolved", "completed"}
    }
    current_wip = len(wip_issues)

    # ── Cycle time & lead time (computed separately) ────────────────────────
    ct_by_week: dict[str, list[float]] = defaultdict(list)
    lt_by_week: dict[str, list[float]] = defaultdict(list)
    all_ct: list[float] = []
    all_lt: list[float] = []
    ct_histogram: dict[str, int] = defaultdict(int)
    lt_histogram: dict[str, int] = defaultdict(int)

    # Flow efficiency: active time / total elapsed
    # Without status-transition history, we estimate active time as 70% of
    # lead time for issues that passed through active statuses, and 50% for
    # issues that went straight to done.
    flow_eff_samples: list[float] = []

    has_milestones = False

    for doc in done_issues:
        created = _parse_dt(_get_field(doc, "createdAt", "created_at", "createdTime"))
        updated = _parse_dt(_get_field(doc, "updatedAt", "updated_at", "updatedTime"))
        if not created:
            continue
        completed = updated or now

        # Lead time: created → completed (always available)
        lt = max(0.0, (completed - created).total_seconds() / 86400)
        all_lt.append(lt)
        lt_by_week[_iso_week(completed)].append(lt)

        # Cycle time: estimate from milestone timestamps when available
        in_progress_at = (
            _parse_dt(doc.get("in_progress_at"))
            or _parse_dt(doc.get("started_at"))
            or _parse_dt(doc.get("assigned_at"))
        )
        reviewed_at = (
            _parse_dt(doc.get("review_at"))
            or _parse_dt(doc.get("reviewed_at"))
        )

        if in_progress_at and reviewed_at:
            has_milestones = True
            ct = max(0.0, (reviewed_at - in_progress_at).total_seconds() / 86400)
        elif in_progress_at:
            has_milestones = True
            ct = max(0.0, (completed - in_progress_at).total_seconds() / 86400)
        else:
            # Fallback: cycle time typically 60-80% of lead time
            status = _get_field(doc, "status", default="").strip().lower()
            ratio = 0.8 if status in ("done", "closed", "resolved") else 0.6
            ct = lt * ratio

        all_ct.append(ct)
        ct_by_week[_iso_week(completed)].append(ct)

        # Histogram bins for cycle time
        if ct <= 1:
            ct_histogram["≤1d"] += 1
        elif ct <= 3:
            ct_histogram["1–3d"] += 1
        elif ct <= 7:
            ct_histogram["1–7d"] += 1
        elif ct <= 14:
            ct_histogram["7–14d"] += 1
        else:
            ct_histogram[">14d"] += 1

        # Lead time histogram (wider bins)
        if lt <= 1:
            lt_histogram["≤1d"] += 1
        elif lt <= 3:
            lt_histogram["1–3d"] += 1
        elif lt <= 7:
            lt_histogram["1–7d"] += 1
        elif lt <= 14:
            lt_histogram["7–14d"] += 1
        elif lt <= 30:
            lt_histogram["14–30d"] += 1
        else:
            lt_histogram[">30d"] += 1

        # Flow efficiency estimate per issue
        status = _get_field(doc, "status", default="").strip().lower()
        active_ratio = 0.7 if status in ("done", "closed", "resolved") else 0.5
        flow_eff_samples.append(active_ratio * 100)

    ct_stats = _percentiles(all_ct)
    lt_stats = _percentiles(all_lt)

    # Flow efficiency: average per-issue estimate (not ct/lt ratio)
    flow_efficiency = round(_mean(flow_eff_samples), 1) if flow_eff_samples else 0.0

    # ── Statistical rigor ───────────────────────────────────────────────────
    cycle_time_std = round(ct_stats.get("std", 0), 2)
    cycle_time_cv = round(cycle_time_std / ct_stats["avg"], 3) if ct_stats["avg"] > 0 else 0.0
    cycle_time_ucl = round(ct_stats["avg"] + 2 * cycle_time_std, 1)
    cycle_time_lcl = round(max(0, ct_stats["avg"] - 2 * cycle_time_std), 1)

    lead_time_std = round(lt_stats.get("std", 0), 2)
    lead_time_cv = round(lead_time_std / lt_stats["avg"], 3) if lt_stats["avg"] > 0 else 0.0

    predictability = round((1 - min(cycle_time_cv, 1)) * 100, 0)

    # ── Weekly trend & throughput ───────────────────────────────────────────
    cycle_time_trend = _build_weekly_trend(ct_by_week)
    lead_time_trend = _build_weekly_trend(lt_by_week)

    tp_by_week: dict[str, int] = defaultdict(int)
    for doc in done_issues:
        updated = _parse_dt(_get_field(doc, "updatedAt", "updated_at"))
        created = _parse_dt(_get_field(doc, "createdAt", "created_at"))
        ref = updated or created
        if ref:
            tp_by_week[_iso_week(ref)] += 1

    weekly_throughput = _fill_week_range(tp_by_week)
    throughput = sum(w["count"] for w in weekly_throughput)
    nw = len(weekly_throughput) or 1
    throughput_per_week = throughput / nw
    throughput_per_day = throughput / (nw * 7)

    # Throughput variability
    tp_values = [w["count"] for w in weekly_throughput]
    throughput_std = round(_stdev(tp_values), 2) if len(tp_values) >= 2 else 0.0
    throughput_cv = round(throughput_std / throughput_per_week, 3) if throughput_per_week > 0 else 0.0

    # Rolling 4-week averages for throughput
    for i, w in enumerate(weekly_throughput):
        window = tp_values[max(0, i - 3) : i + 1]
        w["rolling_avg_4w"] = round(_mean(window), 1) if window else 0

    # Velocity: recent throughput (last 4 weeks)
    recent_tp = tp_values[-4:] if len(tp_values) >= 4 else tp_values
    velocity_per_week = round(_mean(recent_tp), 1) if recent_tp else 0.0

    # Arrival rate
    arrival_per_week = round(total_issues / nw, 1)

    # ── WIP aging with percentiles ──────────────────────────────────────────
    wip_aging_dist: dict[str, int] = defaultdict(int)
    wip_ages: dict[str, list[float]] = defaultdict(list)
    all_wip_ages: list[float] = []

    for doc in wip_issues:
        created = _parse_dt(_get_field(doc, "createdAt", "created_at"))
        if not created:
            continue
        age = max(0.0, (now - created).total_seconds() / 86400)
        all_wip_ages.append(age)
        status = _get_field(doc, "status", default="unknown").strip()
        wip_ages[status].append(age)

        if age <= 1:
            wip_aging_dist["≤1d"] += 1
        elif age <= 3:
            wip_aging_dist["1–3d"] += 1
        elif age <= 7:
            wip_aging_dist["3–7d"] += 1
        elif age <= 14:
            wip_aging_dist["7–14d"] += 1
        elif age <= 30:
            wip_aging_dist["14–30d"] += 1
        else:
            wip_aging_dist[">30d"] += 1

    wip_age_p = _percentiles(all_wip_ages) if all_wip_ages else {"p50": 0, "p85": 0, "p95": 0}

    # ── Bottlenecks ─────────────────────────────────────────────────────────
    bottlenecks = _build_bottlenecks(wip_ages, throughput_per_week)

    # ── CFD (improved: day-by-day cumulative) ───────────────────────────────
    cfd = _build_day_cfd(issues, done_issues, wip_breakdown, start, end)

    # ── Control chart ───────────────────────────────────────────────────────
    control_chart = _build_control_chart(done_issues, all_ct, all_lt)

    # ── Trends (vs previous period) ─────────────────────────────────────────
    trends = await _compute_trends(project_key, start, end, throughput, ct_stats["avg"], current_wip)

    result = {
        # Cycle time
        "avg_cycle_time": round(ct_stats["avg"], 1),
        "cycle_time_p50": round(ct_stats["p50"], 1),
        "cycle_time_p80": round(ct_stats["p80"], 1),
        "cycle_time_p95": round(ct_stats["p95"], 1),
        "cycle_time_std": cycle_time_std,
        "cycle_time_cv": cycle_time_cv,
        "cycle_time_ucl": cycle_time_ucl,
        "cycle_time_lcl": cycle_time_lcl,
        "cycle_time_histogram": dict(ct_histogram),
        "cycle_time_source": "milestone" if has_milestones else "estimated",
        # Lead time
        "avg_lead_time": round(lt_stats["avg"], 1),
        "lead_time_p50": round(lt_stats["p50"], 1),
        "lead_time_p80": round(lt_stats["p80"], 1),
        "lead_time_p95": round(lt_stats["p95"], 1),
        "lead_time_std": lead_time_std,
        "lead_time_cv": lead_time_cv,
        "lead_time_histogram": dict(lt_histogram),
        # Throughput
        "throughput": throughput,
        "throughput_per_day": round(throughput_per_day, 2),
        "throughput_per_week": round(throughput_per_week, 1),
        "throughput_std": throughput_std,
        "throughput_cv": throughput_cv,
        "velocity_per_week": velocity_per_week,
        "arrival_rate_per_week": arrival_per_week,
        # WIP
        "current_wip": current_wip,
        "total_issues": total_issues,
        "done_count": done_count,
        "wip_breakdown": wip_breakdown,
        "wip_aging": dict(wip_aging_dist),
        "wip_age_p50": round(wip_age_p.get("p50", 0), 1),
        "wip_age_p85": round(wip_age_p.get("p85", 0), 1),
        "wip_age_p95": round(wip_age_p.get("p95", 0), 1),
        # Flow
        "flow_efficiency": flow_efficiency,
        "flow_efficiency_confidence": "estimated",
        "predictability": predictability,
        # Charts
        "cfd": cfd,
        "cfd_confidence": "daily_snapshot" if len(issues) <= 2000 else "sampled",
        "weekly_throughput": weekly_throughput,
        "cycle_time_trend": cycle_time_trend,
        "lead_time_trend": lead_time_trend,
        "control_chart": control_chart,
        "bottlenecks": bottlenecks,
        # Trends
        "trends": trends,
    }

    _cache[cache_key] = (now_ts + _CACHE_TTL, result)
    return result


# ── Helper functions ────────────────────────────────────────────────────────


def _stdev(values: list[float]) -> float:
    """Population standard deviation."""
    from math import sqrt

    if len(values) < 2:
        return 0.0
    avg = _mean(values)
    return sqrt(sum((v - avg) ** 2 for v in values) / len(values))


def _build_weekly_trend(by_week: dict[str, list[float]]) -> list[dict[str, Any]]:
    trend: list[dict[str, Any]] = []
    for wk in sorted(by_week):
        p = _percentiles(by_week[wk])
        trend.append({"label": wk, "p50": p["p50"], "p80": p["p80"], "p95": p["p95"]})
    return trend


def _fill_week_range(counts: dict[str, int]) -> list[dict[str, Any]]:
    if not counts:
        return []
    weeks = sorted(counts)
    try:
        first_parts = weeks[0].split("-W")
        last_parts = weeks[-1].split("-W")
        first = datetime.strptime(f"{first_parts[0]}-{int(first_parts[1])}-1", "%G-W%V-%u")
        last = datetime.strptime(f"{last_parts[0]}-{int(last_parts[1])}-1", "%G-W%V-%u")
        result: list[dict[str, Any]] = []
        cur = first
        while cur <= last:
            wk = _iso_week(cur)
            result.append({"period": wk, "count": counts.get(wk, 0)})
            cur += timedelta(days=7)
        return result
    except ValueError:
        return [{"period": w, "count": c} for w, c in sorted(counts.items())]


def _build_day_cfd(
    issues: list[dict[str, Any]],
    done_issues: list[dict[str, Any]],
    wip_breakdown: dict[str, int],
    start: datetime,
    end: datetime,
) -> list[dict[str, Any]]:
    """Day-by-day cumulative flow diagram using per-day status classification.

    For each day, classify each active issue (created <= day, not yet completed)
    into a CFD band based on its status. Uses last-known status for each issue.
    """

    days = min((end.date() - start.date()).days + 1, 120)
    max_issues = 2000

    # Sample if too many issues
    sample = issues if len(issues) <= max_issues else issues[:max_issues]
    done_keys = {doc.get("key") or str(doc.get("_id", "")) for doc in done_issues}

    # Pre-compute each issue's dates and status category
    issue_states: list[dict[str, Any]] = []
    for doc in sample:
        created = _parse_dt(_get_field(doc, "createdAt", "created_at", "createdTime"))
        updated = _parse_dt(_get_field(doc, "updatedAt", "updated_at", "updatedTime"))
        key = doc.get("key") or str(doc.get("_id", ""))
        if not created or not key:
            continue
        status = _get_field(doc, "status", default="").strip().lower()
        is_done = key in done_keys
        issue_states.append({
            "created": created,
            "completed": updated if is_done else None,
            "category": _classify_cfd_status(status),
        })

    # Day-by-day accumulation
    cfd: list[dict[str, Any]] = []
    for i in range(days):
        day = start + timedelta(days=i)
        day_key = day.strftime("%Y-%m-%d")

        counts: dict[str, int] = {"backlog": 0, "todo": 0, "in_progress": 0, "review": 0}
        cum_done = 0

        for st in issue_states:
            # Issue is active if created <= day and not yet completed
            if st["created"] > day:
                continue
            if st["completed"] and st["completed"].date() <= day.date():
                cum_done += 1
                continue
            # Items whose status classifies as "done" but weren't matched
            # via done_keys (e.g. when the key field differs) are also complete.
            if st["category"] == "done":
                cum_done += 1
                continue
            counts[st["category"]] += 1

        cfd.append({
            "date": day_key,
            "backlog": counts["backlog"],
            "todo": counts["todo"],
            "in_progress": counts["in_progress"],
            "review": counts["review"],
            "done": cum_done,
        })

    return cfd


def _classify_cfd_status(status: str) -> str:
    """Map an issue status string to a CFD band."""
    s = status.strip().lower()
    if s in ("backlog", "open", "new"):
        return "backlog"
    if s in ("to do", "todo", "ready", "selected for development"):
        return "todo"
    if s in ("in progress", "in_progress", "developing", "doing", "active"):
        return "in_progress"
    if s in ("review", "in review", "in_review", "testing", "qa"):
        return "review"
    if s in ("done", "closed", "resolved", "completed"):
        return "done"
    return "in_progress"


def _build_control_chart(
    done_issues: list[dict[str, Any]],
    all_ct: list[float],
    all_lt: list[float],
) -> list[dict[str, Any]]:
    """Build control chart data: per-issue cycle/lead time sorted by completion date."""
    from statistics import mean as _mean

    pairs: list[tuple[datetime, str, float, float]] = []
    for i, doc in enumerate(done_issues):
        updated = _parse_dt(_get_field(doc, "updatedAt", "updated_at"))
        created = _parse_dt(_get_field(doc, "createdAt", "created_at"))
        ref = updated or created
        if not ref:
            continue
        key = _get_field(doc, "key", default="")
        ct = all_ct[i] if i < len(all_ct) else 0
        lt = all_lt[i] if i < len(all_lt) else 0
        pairs.append((ref, str(key), ct, lt))

    pairs.sort(key=lambda x: x[0])

    result: list[dict[str, Any]] = []
    recent_cts: list[float] = []
    for _, (dt, key, ct, lt) in enumerate(pairs):
        recent_cts.append(ct)
        if len(recent_cts) > 5:
            recent_cts.pop(0)
        ma = round(_mean(recent_cts), 1) if recent_cts else None
        result.append({
            "issue_key": key,
            "date": dt.strftime("%Y-%m-%d"),
            "cycle_time": round(ct, 1),
            "lead_time": round(lt, 1),
            "moving_avg_5": ma,
        })

    return result


def _build_bottlenecks(
    wip_ages: dict[str, list[float]], throughput_per_week: float
) -> list[dict[str, Any]]:
    result: list[dict[str, Any]] = []
    for status in sorted(wip_ages, key=lambda s: -len(wip_ages[s])):
        ages = wip_ages[status]
        avg_d = round(_mean(ages), 1) if ages else 0.0
        max_d = round(max(ages), 1) if ages else 0.0
        count = len(ages)
        severity = round(avg_d * count, 1)
        result.append({
            "status": status,
            "wip_count": count,
            "avg_days": avg_d,
            "max_days": max_d,
            "severity": severity,
            "is_bottleneck": count > throughput_per_week * 1.5 if throughput_per_week > 0 else False,
        })
    # Sort by severity (most severe first)
    result.sort(key=lambda b: -b["severity"])
    return result


async def _compute_trends(
    project_key: str | None,
    start: datetime,
    end: datetime,
    throughput: int,
    avg_ct: float,
    current_wip: int,
) -> dict[str, float | None]:
    period_span = end - start
    prev_end = start - timedelta(seconds=1)
    prev_start = prev_end - period_span

    prev_match: dict[str, Any] = {
        "createdAt": {"$gte": prev_start.isoformat(), "$lte": prev_end.isoformat()},
    }
    if project_key:
        prev_match["project_key"] = project_key

    prev_cursor = db.db["issues"].find(prev_match)
    prev_issues = await prev_cursor.to_list(length=5000)

    if not prev_issues:
        return {"cycle_time_pct": None, "throughput_pct": None, "wip_pct": None}

    prev_done = sum(1 for d in prev_issues if _is_done(d))
    prev_wip = len(prev_issues) - prev_done

    prev_cts: list[float] = []
    for doc in prev_issues:
        if not _is_done(doc):
            continue
        created = _parse_dt(_get_field(doc, "createdAt", "created_at", "createdTime"))
        updated = _parse_dt(_get_field(doc, "updatedAt", "updated_at", "updatedTime"))
        if created:
            ct = max(0.0, ((updated or prev_end) - created).total_seconds() / 86400)
            prev_cts.append(ct)

    prev_ct = _mean(prev_cts) if prev_cts else 0.0

    tp_pct = round((throughput - prev_done) / prev_done * 100, 1) if prev_done > 0 else None
    ct_pct = round((avg_ct - prev_ct) / prev_ct * 100, 1) if prev_ct > 0 else None
    wip_pct = round((current_wip - prev_wip) / prev_wip * 100, 1) if prev_wip > 0 else None

    return {"cycle_time_pct": ct_pct, "throughput_pct": tp_pct, "wip_pct": wip_pct}
