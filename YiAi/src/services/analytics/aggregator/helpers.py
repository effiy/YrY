"""Shared helpers for analytics aggregation.

Pure utility functions used by both efficiency and quality metric computations.
"""

from __future__ import annotations

from datetime import datetime
import hashlib
import json
from statistics import mean
import time
from typing import Any

from shared.status import CLOSED_STATUSES as DONE_STATUSES

_TIMESTAMP_CANDIDATES = ("updatedAt", "updated_at", "createdAt", "created_at")

# TTL cache for expensive aggregation results
_cache: dict[str, tuple[float, Any]] = {}
DEFAULT_TTL = 60  # seconds


def _cache_key(prefix: str, params: dict[str, Any]) -> str:
    raw = json.dumps(params, sort_keys=True, default=str)
    return f"{prefix}:{hashlib.md5(raw.encode()).hexdigest()[:12]}"


def _cached(ttl: float = DEFAULT_TTL):
    """Decorator: cache async function results with TTL."""

    def deco(fn):
        async def wrapper(*args: Any, **kwargs: Any) -> Any:
            key = _cache_key(fn.__name__, {"args": str(args), "kwargs": kwargs})
            now = time.time()
            if key in _cache:
                expires, val = _cache[key]
                if now < expires:
                    return val
            result = await fn(*args, **kwargs)
            _cache[key] = (now + ttl, result)
            return result

        return wrapper

    return deco


def _iso_week(dt: datetime) -> str:
    return dt.strftime("%G-W%V")


def _parse_dt(val: Any) -> datetime | None:
    """Parse a datetime from ISO string, numeric timestamp (ms), or datetime object."""
    if val is None:
        return None
    if isinstance(val, datetime):
        return val.replace(tzinfo=None) if val.tzinfo else val
    if isinstance(val, int | float):
        try:
            return datetime.utcfromtimestamp(val / 1000 if val > 1e10 else val)
        except (OSError, ValueError):
            return None
    try:
        s = str(val).replace("Z", "+00:00")
        return datetime.fromisoformat(s).replace(tzinfo=None)
    except (ValueError, TypeError):
        return None


def _get_field(doc: dict[str, Any], *names: str, default: Any = None) -> Any:
    """Get first matching field from doc across multiple naming conventions."""
    for name in names:
        val = doc.get(name)
        if val is not None:
            return val
    return default


def _is_done(doc: dict[str, Any]) -> bool:
    s = _get_field(doc, "status", default="").strip().lower()
    return s in DONE_STATUSES


def _empty_response() -> dict[str, Any]:
    return {
        # Cycle time
        "avg_cycle_time": 0, "cycle_time_p50": 0, "cycle_time_p80": 0, "cycle_time_p95": 0,
        "cycle_time_std": 0, "cycle_time_cv": 0.0,
        "cycle_time_ucl": 0, "cycle_time_lcl": 0,
        "cycle_time_histogram": {},
        "cycle_time_source": "estimated",
        # Lead time
        "avg_lead_time": 0, "lead_time_p50": 0, "lead_time_p80": 0, "lead_time_p95": 0,
        "lead_time_std": 0, "lead_time_cv": 0.0,
        "lead_time_histogram": {},
        # Throughput
        "throughput": 0, "throughput_per_day": 0, "throughput_per_week": 0,
        "throughput_std": 0, "throughput_cv": 0.0,
        "velocity_per_week": 0, "arrival_rate_per_week": 0,
        # WIP
        "current_wip": 0, "total_issues": 0, "done_count": 0,
        "wip_breakdown": {}, "wip_aging": {},
        "wip_age_p50": 0, "wip_age_p85": 0, "wip_age_p95": 0,
        # Flow
        "flow_efficiency": 0, "flow_efficiency_confidence": "estimated",
        "predictability": 0,
        # Charts
        "cfd": [], "cfd_confidence": "estimated",
        "weekly_throughput": [],
        "cycle_time_trend": [], "lead_time_trend": [],
        "control_chart": [],
        "bottlenecks": [],
        # Trends
        "trends": {"cycle_time_pct": None, "throughput_pct": None, "wip_pct": None},
    }


def _percentiles(values: list[float]) -> dict[str, float]:
    from statistics import stdev as _stdev
    if not values:
        return {"avg": 0, "p50": 0, "p80": 0, "p85": 0, "p95": 0, "std": 0}
    srt = sorted(values)
    n = len(srt)
    return {
        "avg": round(mean(srt), 1),
        "p50": round(srt[n // 2], 1),
        "p80": round(srt[int(n * 0.8)], 1) if n >= 5 else round(mean(srt) * 1.3, 1),
        "p85": round(srt[int(n * 0.85)], 1) if n >= 7 else round(mean(srt) * 1.5, 1),
        "p95": round(srt[int(n * 0.95)], 1) if n >= 20 else round(mean(srt) * 1.8, 1),
        "std": round(_stdev(srt), 2) if n >= 2 else 0,
    }
