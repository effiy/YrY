"""File alert aggregator — unified cross-domain alerts for the YiVad file report
warning/alert analysis sidebar.

Aggregates warnings from three domains:
  - Knowledge files: stale, missing frontmatter, orphan, unknown metadata
  - Data entities:  overdue modules, stalled modules, empty modules, blocked/unassigned issues
  - Code health:   large files, low comment rate, high duplication (project-scoped only)

Used by ``POST /analytics/file-alerts``.
"""

from __future__ import annotations

from collections import defaultdict
from datetime import datetime, timedelta, timezone
import logging
from typing import Any

from data.database import db
from shared.status import CLOSED_STATUSES, Status, normalize_status_list

logger = logging.getLogger(__name__)

_STALE_DAYS = 90
_ORPHAN_MODULE = "__root__"
_MISSING_FIELDS = ["status", "type", "lifecycle", "review_cycle"]
_UNKNOWN_FIELDS = ["status", "type", "lifecycle"]


async def get_file_alerts(params: dict[str, Any]) -> dict[str, Any]:
    """Return unified file-level alerts across knowledge, data, and code domains.

    ``params``: ``{ project_key?: str }``
    """
    project_key: str | None = params.get("project_key")
    now = datetime.now(timezone.utc)

    alerts: list[dict[str, Any]] = []

    # ── Knowledge file alerts ──
    knowledge_alerts = await _knowledge_alerts(now)
    alerts.extend(knowledge_alerts)

    # ── Data entity alerts ──
    data_alerts = await _data_alerts(project_key, now)
    alerts.extend(data_alerts)

    # ── Code health alerts (project-scoped only) ──
    if project_key:
        code_alerts = await _code_alerts(project_key)
        alerts.extend(code_alerts)

    # Summary
    critical = [a for a in alerts if a["severity"] == "critical"]
    warning = [a for a in alerts if a["severity"] == "warning"]
    info = [a for a in alerts if a["severity"] == "info"]

    return {
        "alerts": alerts,
        "summary": {
            "critical": len(critical),
            "warning": len(warning),
            "info": len(info),
            "total": len(alerts),
        },
        "generated_at": now.strftime("%Y-%m-%dT%H:%M:%SZ"),
    }


# ── Knowledge file alerts ─────────────────────────────────────────────────


async def _knowledge_alerts(now: datetime) -> list[dict[str, Any]]:
    """Scan knowledge_files collection for data-quality and freshness issues."""
    alerts: list[dict[str, Any]] = []

    files_cursor = db.db["knowledge_files"].find({})
    files = await files_cursor.to_list(length=10000)
    if not files:
        return alerts

    stale_cutoff = (now - timedelta(days=_STALE_DAYS)).strftime("%Y-%m-%d")

    stale_files: list[str] = []
    missing: dict[str, list[str]] = defaultdict(list)
    unknown: dict[str, list[str]] = defaultdict(list)
    orphans: list[str] = []
    no_review: list[str] = []

    for f in files:
        path = f.get("path", "")
        if not path:
            continue

        # Stale check
        updated = f.get("updated") or f.get("updated_at", "")
        if updated and updated < stale_cutoff:
            stale_files.append(path)

        # Missing frontmatter fields
        for field in _MISSING_FIELDS:
            val = f.get(field)
            if not val or (isinstance(val, str) and not val.strip()):
                missing[field].append(path)

        # Unknown metadata values
        for field in _UNKNOWN_FIELDS:
            val = f.get(field, "")
            if val and isinstance(val, str) and val.strip().lower() == "unknown":
                unknown[field].append(path)

        # Orphan (no module assignment or __root__)
        module = f.get("module", "")
        if not module or module == _ORPHAN_MODULE:
            orphans.append(path)

        # Missing review cycle
        rc = f.get("review_cycle", "")
        if not rc or (isinstance(rc, str) and not rc.strip()):
            no_review.append(path)

    # Build alerts sorted by severity
    if stale_files:
        alerts.append({
            "severity": "warning",
            "domain": "knowledge",
            "title": "Stale Files",
            "description": f"{len(stale_files)} files not updated in {_STALE_DAYS}+ days",
            "count": len(stale_files),
            "file_paths": stale_files[:20],
        })

    for field in _MISSING_FIELDS:
        if missing[field]:
            alerts.append({
                "severity": "warning",
                "domain": "knowledge",
                "title": f"Missing {field}",
                "description": f"{len(missing[field])} files missing '{field}' in frontmatter",
                "count": len(missing[field]),
                "file_paths": missing[field][:20],
            })

    for field in _UNKNOWN_FIELDS:
        if unknown[field]:
            alerts.append({
                "severity": "info",
                "domain": "knowledge",
                "title": f"Unknown {field}",
                "description": f"{len(unknown[field])} files with '{field}=unknown'",
                "count": len(unknown[field]),
                "file_paths": unknown[field][:20],
            })

    if orphans:
        alerts.append({
            "severity": "info",
            "domain": "knowledge",
            "title": "Orphan Files",
            "description": f"{len(orphans)} files with no module assignment",
            "count": len(orphans),
            "file_paths": orphans[:20],
        })

    if no_review:
        alerts.append({
            "severity": "warning",
            "domain": "knowledge",
            "title": "No Review Cycle",
            "description": f"{len(no_review)} files without a review cycle configured",
            "count": len(no_review),
            "file_paths": no_review[:20],
        })

    return alerts


# ── Data entity alerts ────────────────────────────────────────────────────


async def _data_alerts(project_key: str | None, now: datetime) -> list[dict[str, Any]]:
    """Reuse module-level attention signals from existing module_dashboard logic."""
    alerts: list[dict[str, Any]] = []

    mod_match: dict[str, Any] = {}
    if project_key:
        mod_match["project_key"] = project_key

    mods_cursor = db.db["modules"].find(mod_match)
    modules = await mods_cursor.to_list(length=2000)
    if not modules:
        return alerts

    today = now.strftime("%Y-%m-%d")

    overdue_mods: list[str] = []
    empty_mods: list[str] = []
    stalled_mods: list[str] = []

    # Collect all issue keys from in-progress modules for batch query
    all_issue_keys: list[str] = []
    stalled_candidates: list[dict[str, Any]] = []
    for m in modules:
        key = m.get("key", "")
        name = m.get("name", key)
        status = m.get("status", "")

        # Overdue
        due = m.get("due_date")
        if status == "in_progress" and due and due < today:
            overdue_mods.append(name)

        # Empty (no issues, not completed/cancelled)
        issue_keys = m.get("issue_keys") or []
        if not issue_keys and status not in (Status.DONE, Status.CANCELLED):
            empty_mods.append(name)

        # Stalled (in_progress with issues but 0% progress)
        if status == "in_progress" and issue_keys:
            stalled_candidates.append({"name": name, "issue_keys": issue_keys})
            all_issue_keys.extend(issue_keys)

    # Batch query: check done status for all stalled candidate issues at once
    stalled_issue_done: set[str] = set()
    if all_issue_keys:
        iss_cursor = db.db["issues"].find(
            {"key": {"$in": all_issue_keys}, "status": {"$in": normalize_status_list([Status.DONE])}},
            {"key": 1}
        )
        done_issues = await iss_cursor.to_list(length=5000)
        stalled_issue_done = {i["key"] for i in done_issues if i.get("key")}

    for m in stalled_candidates:
        if not any(k in stalled_issue_done for k in m["issue_keys"]):
            stalled_mods.append(m["name"])

    # Also check blocked/unassigned across all issues
    blocked_count = 0
    unassigned_count = 0
    iss_match: dict[str, Any] = {
        "status": {"$nin": normalize_status_list(list(CLOSED_STATUSES))},
    }
    if project_key:
        iss_match["project_key"] = project_key
    iss_cursor = db.db["issues"].find(iss_match)
    open_issues = await iss_cursor.to_list(length=5000)
    for i in open_issues:
        if i.get("blocked_by"):
            blocked_count += 1
        if not i.get("assignee"):
            unassigned_count += 1

    if overdue_mods:
        alerts.append({
            "severity": "critical",
            "domain": "data",
            "title": "Overdue Modules",
            "description": f"{len(overdue_mods)} modules past their due date",
            "count": len(overdue_mods),
            "module_names": overdue_mods[:20],
        })

    if stalled_mods:
        alerts.append({
            "severity": "warning",
            "domain": "data",
            "title": "Stalled Modules",
            "description": f"{len(stalled_mods)} active modules with zero progress",
            "count": len(stalled_mods),
            "module_names": stalled_mods[:20],
        })

    if empty_mods:
        alerts.append({
            "severity": "warning",
            "domain": "data",
            "title": "Empty Modules",
            "description": f"{len(empty_mods)} modules with no linked issues",
            "count": len(empty_mods),
            "module_names": empty_mods[:20],
        })

    if blocked_count:
        alerts.append({
            "severity": "warning",
            "domain": "data",
            "title": "Blocked Issues",
            "description": f"{blocked_count} open issues are blocked by dependencies",
            "count": blocked_count,
        })

    if unassigned_count:
        alerts.append({
            "severity": "info",
            "domain": "data",
            "title": "Unassigned Issues",
            "description": f"{unassigned_count} open issues have no assignee",
            "count": unassigned_count,
        })

    return alerts


# ── Code health alerts ────────────────────────────────────────────────────


async def _code_alerts(project_key: str) -> list[dict[str, Any]]:
    """Read cached code health alerts for a specific project."""
    alerts: list[dict[str, Any]] = []
    try:
        cached = await db.db["code_health_cache"].find_one(
            {"key": f"{project_key}:src"}
        )
        if not cached or not cached.get("data"):
            return alerts

        raw_alerts = cached["data"].get("alerts") or []
        for a in raw_alerts:
            severity = a.get("level", "info")
            if severity == "danger":
                severity = "critical"
            alerts.append({
                "severity": severity,
                "domain": "code",
                "title": a.get("metric", "code_health"),
                "description": a.get("message", ""),
                "suggestion": a.get("suggestion", ""),
                "file": a.get("file"),
                "count": 1,
            })
    except Exception:
        logger.warning("Failed to read code health cache for %s", project_key, exc_info=True)
        pass

    return alerts
