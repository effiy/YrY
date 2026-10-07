"""File alert analysis — scan knowledge_files for health warnings: stale, missing
metadata, orphan, unmaintained, and quality issues. Produces structured alerts for
the file report warning analysis page across YiVad/YiPet.

Thresholds are configurable via ``config.yaml`` → ``alert:`` section.
"""

from __future__ import annotations

from collections import defaultdict
from datetime import datetime, timedelta, timezone
import logging
import os
import time
from typing import Any

from data.database import db
from shared.config import settings

logger = logging.getLogger(__name__)

# Module-level TTL cache
_cache: dict[str, tuple[float, Any]] = {}
_CACHE_TTL = 60


def _review_cycle_days() -> dict[str, int]:
    return {
        "weekly": 7,
        "monthly": 30,
        "quarterly": 90,
        "half-yearly": 180,
        "yearly": 365,
    }


def _required_fields() -> list[str]:
    val = getattr(settings, "alert_metadata_min_fields", None)
    return val if val is not None else ["status", "type", "lifecycle", "review_cycle", "roles", "tags"]


def _stale_critical_days() -> int:
    val = getattr(settings, "alert_stale_critical_days", None)
    return val if val is not None else 180


def _unmaintained_days() -> int:
    val = getattr(settings, "alert_unmaintained_days", None)
    return val if val is not None else 90


def _metadata_warn_threshold() -> int:
    val = getattr(settings, "alert_metadata_warn_missing", None)
    return val if val is not None else 3


async def get_file_alerts(params: dict[str, Any]) -> dict[str, Any]:
    """Return file health alerts with summary.

    ``params``: ``{ project?: str, min_severity?: str, limit?: int }``
    """
    project_filter = params.get("project")
    min_severity = params.get("min_severity", "info")
    limit = params.get("limit", 200)
    bypass_cache = params.get("_nocache") in (True, "true", "1", 1)

    # Cache key includes project filter since results differ
    cache_key = f"fa:{project_filter or 'all'}:{min_severity}"
    now_ts = time.time()
    if not bypass_cache and cache_key in _cache:
        expires, val = _cache[cache_key]
        if now_ts < expires:
            return val

    await db.initialize()
    collection = db.db[settings.collection_knowledge_files]
    cursor = collection.find({}, {"_id": 0})
    files = await cursor.to_list(length=None)

    now = datetime.now(timezone.utc)
    base = os.path.realpath(os.path.abspath(settings.knowledge_base_dir))

    severity_rank = {"critical": 0, "warning": 1, "info": 2}
    min_rank = severity_rank.get(min_severity, 2)

    alerts: list[dict[str, Any]] = []

    for f in files:
        path = f.get("path", "")
        meta = f.get("meta", {}) or {}

        # Skip non-markdown or RSS files
        if not path.endswith(".md"):
            continue
        ftype = meta.get("type", "")
        if ftype == "rss":
            continue

        title = (meta.get("title", "")) or f.get("name", "")
        category = f.get("category", "")
        parts = path.split("/")
        module_name = parts[1] if len(parts) > 1 and not parts[1].endswith(".md") else "__root__"

        # Project filter
        if project_filter:
            proj_key = _extract_project_key(path)
            if proj_key != project_filter:
                continue

        updated_str = str(f.get("updatedTime", f.get("updatedAt", "")))
        meta.get("status", "")
        meta.get("lifecycle", "")
        review_cycle = meta.get("review_cycle", "")
        meta.get("tacit", False)

        # ── Stale detection ──
        is_stale = False
        stale_detail = ""
        if updated_str:
            try:
                updated_dt = datetime.fromisoformat(updated_str.replace("Z", "+00:00"))
                days_since = (now - updated_dt).days
                review_days = _review_cycle_days()
                if review_cycle in review_days:
                    max_age = review_days[review_cycle]
                    if days_since > max_age:
                        is_stale = True
                        stale_detail = f"{days_since}d since update (review: {review_cycle}, max: {max_age}d)"
                elif ftype != "rss" and days_since > _unmaintained_days():
                    is_stale = True
                    stale_detail = f"{days_since}d since update (unmaintained, no review cycle)"
            except (ValueError, TypeError):
                pass

        # ── Orphan detection ──
        abs_path = os.path.realpath(os.path.join(base, path)) if path else ""
        is_orphan = bool(path and not os.path.isfile(abs_path))

        # ── Missing metadata detection ──
        required = _required_fields()
        missing_fields = [fld for fld in required if not meta.get(fld)]
        file_roles = meta.get("roles", []) or []
        if isinstance(file_roles, str):
            file_roles = [file_roles]
        if not file_roles and "roles" not in missing_fields:
            missing_fields.append("roles")
        file_tags = meta.get("tags", []) or []
        if isinstance(file_tags, str):
            file_tags = [file_tags]
        if not file_tags and "tags" not in missing_fields:
            missing_fields.append("tags")

        # ── Classify alerts ──
        if is_orphan:
            alerts.append(_alert(path, title, category, module_name, "critical", "orphan",
                                 "File in DB but missing on disk", updated_str))
        elif is_stale:
            severity = "critical" if (updated_str and _days_since(updated_str, now) > _stale_critical_days()) else "warning"
            alerts.append(_alert(path, title, category, module_name, severity, "stale",
                                 stale_detail, updated_str))
        elif len(missing_fields) >= _metadata_warn_threshold():
            alerts.append(_alert(path, title, category, module_name, "warning", "missing_metadata",
                                 f"Missing: {', '.join(missing_fields)}", updated_str))
        elif missing_fields:
            alerts.append(_alert(path, title, category, module_name, "info", "missing_metadata",
                                 f"Missing: {', '.join(missing_fields)}", updated_str))
        elif not review_cycle:
            alerts.append(_alert(path, title, category, module_name, "info", "no_review",
                                 "No review cycle set", updated_str))

    # Filter by severity
    alerts = [a for a in alerts if severity_rank.get(a["severity"], 2) <= min_rank]
    alerts.sort(key=lambda a: (severity_rank.get(a["severity"], 2), a["path"]))

    # ── Aggregate into domain-level alert summaries ──
    domain_alerts = _aggregate_domain_alerts(alerts)

    # ── Data domain: module health ──
    data_alerts = await _compute_data_alerts()
    domain_alerts.extend(data_alerts)

    # ── Code domain: health metrics ──
    code_alerts = await _compute_code_alerts(project_filter)
    domain_alerts.extend(code_alerts)

    # ── Build summary ──
    total = len(domain_alerts)
    critical = sum(1 for a in domain_alerts if a["severity"] == "critical")
    warning = sum(1 for a in domain_alerts if a["severity"] == "warning")
    info = sum(1 for a in domain_alerts if a["severity"] == "info")

    by_kind: dict[str, int] = defaultdict(int)
    by_module: dict[str, int] = defaultdict(int)
    for a in domain_alerts:
        by_kind[a.get("domain", "unknown")] += 1
        by_module[a.get("title", "unknown")] += 1

    top_modules = sorted(
        [{"module": k, "count": v} for k, v in by_module.items()],
        key=lambda x: x["count"], reverse=True
    )[:10]

    result = {
        "alerts": domain_alerts[:limit],
        "summary": {
            "total": total,
            "critical": critical,
            "warning": warning,
            "info": info,
            "by_kind": dict(by_kind),
            "top_modules": top_modules,
        },
        "generated_at": now.strftime("%Y-%m-%dT%H:%M:%SZ"),
    }

    _cache[cache_key] = (now_ts + _CACHE_TTL, result)
    return result


async def _compute_data_alerts() -> list[dict[str, Any]]:
    """Compute module-level health alerts from the modules collection."""
    from datetime import datetime as dt
    now = dt.now(timezone.utc)
    result: list[dict[str, Any]] = []

    try:
        cursor = db.db["modules"].find({})
        modules = await cursor.to_list(length=2000)
        if not modules:
            return result

        # Empty modules (active but no issues)
        empty = [m for m in modules
                 if m.get("status") not in ("completed", "cancelled")
                 and not (m.get("issue_keys") or [])]
        if empty:
            result.append({
                "domain": "data", "severity": "warning",
                "title": f"{len(empty)} Empty Modules",
                "description": f"{len(empty)} active modules have no linked issues.",
                "suggestion": "Add issues to these modules or mark them as completed/cancelled.",
                "count": len(empty),
            })

        # Stalled modules (in_progress, not updated in 14 days)
        stale_cutoff = (now - timedelta(days=14)).strftime("%Y-%m-%d")
        stalled = [m for m in modules
                   if m.get("status") == "in_progress"
                   and (m.get("issue_keys") or [])
                   and m.get("updated_at", m.get("updatedAt", "")) < stale_cutoff]
        if stalled:
            result.append({
                "domain": "data", "severity": "warning",
                "title": f"{len(stalled)} Stalled Modules",
                "description": "Modules in progress with zero completed issues.",
                "suggestion": "Review blockers and reassign priorities.",
                "count": len(stalled),
            })

        # Overdue modules
        today = now.strftime("%Y-%m-%d")
        overdue = [m for m in modules
                   if m.get("status") == "in_progress"
                   and m.get("due_date") and m["due_date"] < today]
        if overdue:
            result.append({
                "domain": "data", "severity": "critical",
                "title": f"{len(overdue)} Overdue Modules",
                "description": "Modules past their due date with work still in progress.",
                "suggestion": "Escalate or renegotiate deadlines.",
                "count": len(overdue),
            })

        # Modules lacking ownership
        no_lead = [m for m in modules
                   if m.get("status") not in ("completed", "cancelled")
                   and not m.get("lead")]
        if no_lead:
            result.append({
                "domain": "data", "severity": "info",
                "title": f"{len(no_lead)} Modules Without Lead",
                "description": "Active modules have no lead assigned.",
                "suggestion": "Assign a lead to accountable ownership.",
                "count": len(no_lead),
            })

    except Exception:
        pass  # data alerts are best-effort; don't fail the whole endpoint

    return result


async def _compute_code_alerts(project_key: str | None = None) -> list[dict[str, Any]]:
    """Bridge code health alerts into the unified alert format."""
    try:
        from services.code_health.alerts import _generate_alerts
        from services.code_health.constants import (
            COMMENT_RATE_DANGER,
            COMMENT_RATE_WARN,
            DUP_RATE_DANGER,
            DUP_RATE_WARN,
            MAX_FILE_DANGER,
            MAX_FILE_WARN,
            REUSE_RATE_DANGER,
            REUSE_RATE_WARN,
        )
        from services.code_health.service import analyze

        health = analyze(project_key)
        raw_alerts = _generate_alerts(
            health.get("scale", {}), health.get("density", {}),
            health.get("reuse", {}), health.get("duplication", {}),
            MAX_FILE_WARN, MAX_FILE_DANGER,
            COMMENT_RATE_WARN, COMMENT_RATE_DANGER,
            REUSE_RATE_WARN, REUSE_RATE_DANGER,
            DUP_RATE_WARN, DUP_RATE_DANGER,
        )

        severity_map = {"danger": "critical", "warn": "warning"}
        return [{
            "domain": "code",
            "severity": severity_map.get(a.get("level", ""), "info"),
            "title": a.get("message", ""),
            "description": a.get("suggestion", ""),
            "suggestion": a.get("suggestion", ""),
            "count": 1,
        } for a in raw_alerts]
    except Exception:
        return []  # code analysis is best-effort


def _aggregate_domain_alerts(file_alerts: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Aggregate per-file alerts into domain-level summaries."""
    result: list[dict[str, Any]] = []

    for kind, severity, title, description, suggestion in [
        ("stale", "critical", "Stale Files (Critical)", "Files beyond review cycle by > 180 days.", "Update content or adjust review_cycle frontmatter."),
        ("stale", "warning", "Stale Files", "Files past their review cycle.", "Schedule a review or update review_cycle field."),
        ("orphan", "critical", "Orphan Files", "Files in DB but missing on disk.", "Run knowledge sync to reconcile database with filesystem."),
        ("missing_metadata", "warning", "Files Missing Metadata", "Files missing 3+ required frontmatter fields.", "Add status, type, lifecycle, review_cycle, roles, and tags."),
        ("missing_metadata", "info", "Files With Incomplete Metadata", "Files missing some frontmatter fields.", "Complete the missing fields for better data quality."),
        ("no_review", "info", "Files Without Review Cycle", "Files have no review_cycle set.", "Assign a review_cycle to each file."),
    ]:
        count = sum(1 for a in file_alerts if a["kind"] == kind and a["severity"] == severity)
        if count:
            result.append({
                "domain": "knowledge",
                "severity": severity,
                "title": title,
                "description": f"{count} {description}",
                "suggestion": suggestion,
                "count": count,
            })

    return result


def _alert(path: str, title: str, category: str, module: str,
           severity: str, kind: str, message: str, updated: str = "") -> dict[str, Any]:
    return {
        "path": path,
        "title": title,
        "category": category,
        "module": module,
        "severity": severity,
        "kind": kind,
        "message": message,
        "updated": updated,
    }


def _days_since(iso_str: str, now: datetime) -> int:
    try:
        dt = datetime.fromisoformat(iso_str.replace("Z", "+00:00"))
        return (now - dt).days
    except (ValueError, TypeError):
        return 0


def _extract_project_key(path: str) -> str:
    """Extract project key from YiKnowledge/projects/{key}/... path."""
    parts = path.split("/")
    if len(parts) >= 3 and parts[0] == "projects":
        return parts[1]
    return ""
