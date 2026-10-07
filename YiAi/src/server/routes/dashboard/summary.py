"""Dashboard summary — lightweight stats for cross-project consumption.

A single compact JSON response designed for YiPet popup and external
clients that need at-a-glance health data without the full dashboard payload.
"""
import asyncio
import logging

from fastapi import APIRouter
from pydantic import BaseModel

from shared.response import success
from shared.status import ACTIVE_STATUSES, CLOSED_STATUSES, OPEN_BUG_STATUSES, Status, normalize_status_list

logger = logging.getLogger(__name__)
router = APIRouter()


class ProjectSummary(BaseModel):
    key: str = ""
    name: str = ""
    open_issues: int = 0
    open_bugs: int = 0
    health: str = "unknown"  # healthy | warning | critical


class SummaryResponse(BaseModel):
    active_projects: int = 0
    total_issues: int = 0
    open_issues: int = 0
    open_bugs: int = 0
    today_done: int = 0
    overdue: int = 0
    blocked: int = 0
    chat_sessions: int = 0
    knowledge_files: int = 0
    server_uptime: float = 0
    projects: list[ProjectSummary] = []


async def _count(cname: str, extra_filter: dict | None = None) -> int:
    try:
        from data.database import db

        await db.initialize()
        return await db.db[cname].count_documents(extra_filter or {})
    except Exception:
        return 0


@router.get("/summary", operation_id="dashboard_summary")
async def dashboard_summary():
    """Lightweight project health summary — ideal for YiPet popup widgets.

    Returns a compact JSON payload with key metrics and per-project stats.
    Designed for < 100ms response time with parallel MongoDB queries.
    """
    import time

    try:
        NOT_DONE = normalize_status_list(list(CLOSED_STATUSES))
        ACTIVE = normalize_status_list(list(ACTIVE_STATUSES))
        DONE = normalize_status_list([Status.DONE])
        OPEN_BUGS = normalize_status_list(list(OPEN_BUG_STATUSES))
        today = time.strftime("%Y-%m-%d")
        today_ms = int(time.mktime(time.strptime(today, "%Y-%m-%d")) * 1000)

        counts = await asyncio.gather(
            _count("projects", {"status": "active"}),
            _count("issues"),
            _count("issues", {"status": {"$nin": NOT_DONE}}),
            _count("bugs", {"status": {"$in": OPEN_BUGS}}),
            _count("issues", {"status": {"$in": DONE}, "updatedAt": {"$gte": today_ms}}),
            _count("issues", {"status": {"$in": ACTIVE}, "due_date": {"$lt": today, "$ne": ""}}),
            _count("issues", {"status": {"$nin": NOT_DONE}, "blocked_by": {"$ne": [], "$exists": True}}),
            _count("sessions"),
            _count("knowledge_files"),
            return_exceptions=True,
        )

        def v(i: int) -> int:
            return counts[i] if not isinstance(counts[i], BaseException) else 0

        # Per-project summary
        projects: list[ProjectSummary] = []
        try:
            from data.database import db

            await db.initialize()
            proj_cursor = db.db["projects"].find({"status": "active"}, {"key": 1, "name": 1})
            proj_list = await proj_cursor.to_list(length=50)
            for p in proj_list:
                key = p.get("key", "")
                name = p.get("name", key)
                open_issues = await _count("issues", {"project_key": key, "status": {"$nin": NOT_DONE}})
                open_bugs = await _count("bugs", {"project_key": key, "status": {"$in": OPEN_BUGS}})
                overdue = await _count(
                    "issues",
                    {"project_key": key, "status": {"$in": ACTIVE}, "due_date": {"$lt": today, "$ne": ""}},
                )
                health = "critical" if overdue > 3 else ("warning" if overdue > 1 else ("healthy" if open_bugs == 0 else "warning"))
                projects.append(
                    ProjectSummary(key=key, name=name, open_issues=open_issues, open_bugs=open_bugs, health=health)
                )
        except Exception as e:
            logger.warning(f"Project summary failed: {e!s}")

        return success(
            data=SummaryResponse(
                active_projects=v(0),
                total_issues=v(1),
                open_issues=v(2),
                open_bugs=v(3),
                today_done=v(4),
                overdue=v(5),
                blocked=v(6),
                chat_sessions=v(7),
                knowledge_files=v(8),
                server_uptime=0,
                projects=projects,
            ).model_dump(),
            cache_ttl=15,
        )
    except Exception as e:
        logger.warning(f"Summary failed: {e!s}")
        return success(data=SummaryResponse().model_dump())
