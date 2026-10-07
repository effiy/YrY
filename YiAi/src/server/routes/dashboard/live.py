"""Dashboard live — real-time key metrics pushed via SSE.

A lightweight endpoint that streams aggregated dashboard KPIs to connected
clients every few seconds, avoiding the need for continuous polling.
"""
import asyncio
from collections.abc import AsyncIterator
import logging
import time

from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from shared.response import success
from shared.sse_utils import format_sse
from shared.status import ACTIVE_STATUSES, CLOSED_STATUSES, OPEN_BUG_STATUSES, Status, normalize_status_list

logger = logging.getLogger(__name__)
router = APIRouter()

_SSE_PUSH_INTERVAL = 5  # seconds between metric pushes


class LiveMetrics(BaseModel):
    active_issues: int = 0
    open_bugs: int = 0
    today_done: int = 0
    today_created: int = 0
    overdue_count: int = 0
    blocked_count: int = 0
    total_issues: int = 0
    total_bugs: int = 0
    server_uptime: float = 0
    timestamp: float = 0


async def _count(cname: str, extra_filter: dict | None = None) -> int:
    """Count documents in a collection, returning 0 on any failure."""
    try:
        from data.database import db

        await db.initialize()
        flt = dict(extra_filter) if extra_filter else {}
        return await db.db[cname].count_documents(flt)
    except Exception:
        return 0


def _today_range() -> tuple[str, str]:
    today = time.strftime("%Y-%m-%d")
    return today, today


async def _snapshot() -> LiveMetrics:
    today, _ = _today_range()
    today_ms_start = int(
        time.mktime(time.strptime(today, "%Y-%m-%d")) * 1000
    )

    NOT_DONE = normalize_status_list(list(CLOSED_STATUSES))
    ACTIVE = normalize_status_list(list(ACTIVE_STATUSES))
    DONE = normalize_status_list([Status.DONE])
    OPEN_BUGS = normalize_status_list(list(OPEN_BUG_STATUSES))

    counts = await asyncio.gather(
        _count("issues", {"status": {"$nin": NOT_DONE}}),
        _count("bugs", {"status": {"$in": OPEN_BUGS}}),
        _count("issues", {"status": {"$in": DONE}, "updatedAt": {"$gte": today_ms_start}}),
        _count("issues", {"createdTime": {"$gte": today_ms_start}}),
        _count("issues", {"status": {"$in": ACTIVE}, "due_date": {"$lt": today, "$ne": ""}}),
        _count("issues", {"status": {"$nin": NOT_DONE}, "blocked_by": {"$ne": [], "$exists": True}}),
        _count("issues"),
        _count("bugs"),
        return_exceptions=True,
    )

    return LiveMetrics(
        active_issues=counts[0] if not isinstance(counts[0], BaseException) else 0,
        open_bugs=counts[1] if not isinstance(counts[1], BaseException) else 0,
        today_done=counts[2] if not isinstance(counts[2], BaseException) else 0,
        today_created=counts[3] if not isinstance(counts[3], BaseException) else 0,
        overdue_count=counts[4] if not isinstance(counts[4], BaseException) else 0,
        blocked_count=counts[5] if not isinstance(counts[5], BaseException) else 0,
        total_issues=counts[6] if not isinstance(counts[6], BaseException) else 0,
        total_bugs=counts[7] if not isinstance(counts[7], BaseException) else 0,
        server_uptime=0,
        timestamp=time.time(),
    )


async def _live_stream(start_time: float) -> AsyncIterator[bytes]:
    """Push live metrics every _SSE_PUSH_INTERVAL seconds."""
    while True:
        try:
            metrics = await _snapshot()
            metrics.server_uptime = time.monotonic() - start_time
            yield format_sse({"data": metrics.model_dump()})
        except Exception as e:
            logger.warning(f"Live metrics snapshot failed: {e}")
            yield format_sse({"error": str(e)})
        await asyncio.sleep(_SSE_PUSH_INTERVAL)


@router.get("/live", operation_id="dashboard_live")
async def dashboard_live():
    """Stream real-time dashboard KPIs via Server-Sent Events.

    Pushes {active_issues, open_bugs, today_done, today_created,
    overdue_count, blocked_count, total_issues, total_bugs,
    server_uptime, timestamp} every 5 seconds.
    """
    start_time = time.monotonic()
    return StreamingResponse(
        _live_stream(start_time),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


@router.get("/live-snapshot", operation_id="dashboard_live_snapshot")
async def dashboard_live_snapshot():
    """Return a single snapshot of live KPIs (non-streaming)."""
    metrics = await _snapshot()
    return success(data=metrics.model_dump())
