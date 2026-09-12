"""Dashboard service stats — RPC call performance metrics."""
import logging
from collections import defaultdict

from fastapi import APIRouter
from pydantic import BaseModel

from shared.config import settings
from shared.response import success

logger = logging.getLogger(__name__)
router = APIRouter()


class ServiceCallStats(BaseModel):
    service: str
    method: str = ""
    calls: int
    success: int
    failed: int
    avg_duration_ms: float
    max_duration_ms: float
    min_duration_ms: float


class RecentServiceCall(BaseModel):
    service: str
    method: str = ""
    status: str
    duration_ms: float
    input_summary: str = ""
    timestamp: str = ""


class ServiceStatsResponse(BaseModel):
    total_calls: int
    success_rate: float
    avg_duration_ms: float
    total_success: int
    total_failed: int
    by_service: list[ServiceCallStats]
    recent: list[RecentServiceCall]


@router.get("/service-stats", operation_id="dashboard_service_stats")
async def service_stats():
    """Return service call performance stats from state_records."""
    try:
        from data.database import db

        await db.initialize()
        collection = db.db[settings.collection_state_records]
        cursor = collection.find({}, {"_id": 0})
        records = await cursor.to_list(length=None)

        by_service: dict[str, dict] = defaultdict(lambda: {
            "calls": 0, "success": 0, "failed": 0,
            "durations": [], "inputs": [],
        })
        recent_calls: list[dict] = []

        for r in records:
            svc = r.get("skill_name", "") or r.get("record_type", "")
            if not svc:
                continue

            status = r.get("status", "unknown")
            dur = float(r.get("duration_ms", 0))
            inp = str(r.get("input_summary", ""))[:100]
            ts = str(r.get("timestamp", r.get("created_time", "")))

            parts = svc.split(":")
            service_name = parts[0] if parts else svc
            method_name = parts[1] if len(parts) > 1 else ""

            stats = by_service[(service_name, method_name)]
            stats["calls"] += 1
            stats["durations"].append(dur)
            stats["inputs"].append(inp)
            if status == "success":
                stats["success"] += 1
            elif status not in ("", "?"):
                stats["failed"] += 1

            recent_calls.append({
                "service": service_name,
                "method": method_name,
                "status": status,
                "duration_ms": dur,
                "input_summary": inp,
                "timestamp": ts,
            })

        service_list = []
        total_success = 0
        total_failed = 0
        all_durations = []

        for (svc, method), stats in by_service.items():
            durs = stats["durations"]
            all_durations.extend(durs)
            total_success += stats["success"]
            total_failed += stats["failed"]
            service_list.append(ServiceCallStats(
                service=svc,
                method=method,
                calls=stats["calls"],
                success=stats["success"],
                failed=stats["failed"],
                avg_duration_ms=round(sum(durs) / len(durs), 2) if durs else 0,
                max_duration_ms=round(max(durs), 2) if durs else 0,
                min_duration_ms=round(min(durs), 2) if durs else 0,
            ))

        service_list.sort(key=lambda x: x.calls, reverse=True)

        recent = sorted(
            [c for c in recent_calls if c["timestamp"]],
            key=lambda x: x["timestamp"], reverse=True
        )[:20]
        recent_out = [RecentServiceCall(**c) for c in recent]

        total_calls = total_success + total_failed
        return success(data=ServiceStatsResponse(
            total_calls=total_calls,
            success_rate=round(total_success / total_calls * 100, 1) if total_calls else 0,
            avg_duration_ms=round(sum(all_durations) / len(all_durations), 2) if all_durations else 0,
            total_success=total_success,
            total_failed=total_failed,
            by_service=service_list,
            recent=recent_out,
        ).model_dump())
    except Exception as e:
        logger.warning(f"Service stats failed: {e}")
        return success(data=ServiceStatsResponse(
            total_calls=0, success_rate=0, avg_duration_ms=0,
            total_success=0, total_failed=0, by_service=[], recent=[],
        ).model_dump())