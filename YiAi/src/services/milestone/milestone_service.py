"""
Milestone Service — project milestone CRUD with progress auto-calculation.

RPC entry: services.milestone.milestone_service.<method>
"""
import logging
from datetime import datetime, timezone
from typing import Any

from data.database import db
from data.repository import query_documents, create_document, update_document, delete_document
from shared.error_codes import ErrorCode
from shared.exceptions import BusinessException

logger = logging.getLogger(__name__)

COLLECTION = "milestones"

HEALTH_THRESHOLDS = {
    "normal": 0.0,    # completion_pct >= time_pct
    "at_risk": 0.2,   # lag < 20%
    "delayed": 0.2,   # lag >= 20%
}


def _calc_health(target_date: str, progress: float) -> str:
    """Calculate milestone health based on time progress vs completion progress."""
    try:
        target = datetime.fromisoformat(target_date.replace("Z", "+00:00"))
        now = datetime.now(timezone.utc)
        total_days = (target - now).days
        if total_days <= 0:
            return "normal" if progress >= 1.0 else "delayed"

        elapsed_pct = 1.0  # placeholder — real calculation needs start_date
        lag = max(0, elapsed_pct - progress)
        if lag >= HEALTH_THRESHOLDS["delayed"]:
            return "delayed"
        if lag > 0:
            return "at_risk"
        return "normal"
    except (ValueError, TypeError) as e:
        logger.warning("Failed to calculate milestone health: %s", e)
        return "unknown"


async def list_milestones(parameters: dict[str, Any]) -> dict[str, Any]:
    """List milestones for a project."""
    project_key = parameters.get("project_key", "")
    filter_dict: dict[str, Any] = {}
    if project_key:
        filter_dict["project_key"] = project_key

    result = await query_documents(
        COLLECTION,
        filter_dict,
        page_size=parameters.get("pageSize", 100),
        order_by="target_date",
        order_type="asc",
    )

    # Enrich with auto-calculated health
    if result.get("data", {}).get("list"):
        for m in result["data"]["list"]:
            if "health" not in m or not m["health"]:
                m["health"] = _calc_health(m.get("target_date", ""), m.get("progress", 0))

    return result


async def create_milestone(parameters: dict[str, Any]) -> dict[str, Any]:
    """Create a milestone."""
    data = parameters.get("data", {})
    title = data.get("title", "").strip()
    project_key = data.get("project_key", "")
    if not title or not project_key:
        raise BusinessException(ErrorCode.INVALID_PARAMS, message="title and project_key are required")

    now = datetime.now(timezone.utc).isoformat()
    doc = {
        "key": data.get("key") or f"ms_{project_key}_{title.lower().replace(' ', '_')}",
        "title": title,
        "project_key": project_key,
        "description": data.get("description", ""),
        "target_date": data.get("target_date", ""),
        "start_date": data.get("start_date", ""),
        "progress": 0.0,
        "health": "normal",
        "status": data.get("status", "planned"),
        "linked_issues": data.get("linked_issues", []),
        "dependencies": data.get("dependencies", []),
        "owner": data.get("owner", ""),
        "created_at": now,
        "updated_at": now,
    }
    return await create_document(COLLECTION, doc)


async def update_milestone(parameters: dict[str, Any]) -> dict[str, Any]:
    """Update a milestone. Auto-recalculates progress from linked issues."""
    key = parameters.get("key", "")
    data = parameters.get("data", {})
    if not key:
        raise BusinessException(ErrorCode.INVALID_PARAMS, message="key is required")

    # If linked_issues changed, recalculate progress
    linked = data.get("linked_issues")
    if linked is not None:
        if linked:
            total = len(linked)
            done = await db.db["issues"].count_documents({"key": {"$in": linked}, "status": "done"})
            data["progress"] = round(done / total, 2) if total > 0 else 0.0
        else:
            data["progress"] = 0.0

    # Recalculate health
    target_date = data.get("target_date", "")
    progress = data.get("progress", 0)
    if target_date:
        data["health"] = _calc_health(target_date, progress)

    data["updated_at"] = datetime.now(timezone.utc).isoformat()
    return await update_document(COLLECTION, key, data)


async def delete_milestone(parameters: dict[str, Any]) -> dict[str, Any]:
    """Delete a milestone."""
    key = parameters.get("key", "")
    if not key:
        raise BusinessException(ErrorCode.INVALID_PARAMS, message="key is required")
    return await delete_document(COLLECTION, key)


async def recalc_progress(parameters: dict[str, Any]) -> dict[str, Any]:
    """Recalculate progress for a milestone based on current issue statuses."""
    key = parameters.get("key", "")
    if not key:
        raise BusinessException(ErrorCode.INVALID_PARAMS, message="key is required")

    ms = await db.db[COLLECTION].find_one({"key": key})
    if not ms:
        raise BusinessException(ErrorCode.RESOURCE_NOT_FOUND, message=f"Milestone {key} not found")

    linked = ms.get("linked_issues", [])
    if linked:
        total = len(linked)
        done = await db.db["issues"].count_documents({"key": {"$in": linked}, "status": "done"})
        progress = round(done / total, 2)
    else:
        progress = 0.0

    health = _calc_health(ms.get("target_date", ""), progress)
    now = datetime.now(timezone.utc).isoformat()
    await db.db[COLLECTION].update_one(
        {"key": key}, {"$set": {"progress": progress, "health": health, "updated_at": now}}
    )
    return {"code": 0, "message": "ok", "data": {"progress": progress, "health": health}}