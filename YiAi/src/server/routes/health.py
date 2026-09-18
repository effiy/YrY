"""Observer health check routes — application + dependency liveness."""
import logging
import os
import time

from fastapi import APIRouter
from pydantic import BaseModel

from shared.config import settings
from shared.response import success

logger = logging.getLogger(__name__)
router = APIRouter()


class DependencyHealth(BaseModel):
    status: str  # "ok" | "degraded" | "unavailable"
    latency_ms: float
    error: str = ""


class ObserverHealth(BaseModel):
    throttle_enabled: bool
    throttle_active_ips: int
    sampler_enabled: bool
    sampler_buffer_size: int
    sampler_buffer_max: int
    sandbox_enabled: bool
    sandbox_violations_total: int
    guard_enabled: bool
    guard_current_max_depth: int


class AppHealth(BaseModel):
    status: str  # "ok" | "degraded" | "unavailable"
    uptime_seconds: float
    version: str
    dependencies: dict[str, DependencyHealth]
    observer: ObserverHealth | None


_start_time = time.monotonic()


async def _check_mongodb() -> DependencyHealth:
    t0 = time.perf_counter()
    try:
        from data.database import db
        await db.initialize()
        await db.db.command("ping")
        return DependencyHealth(
            status="ok",
            latency_ms=round((time.perf_counter() - t0) * 1000, 2),
        )
    except Exception as e:
        return DependencyHealth(
            status="unavailable",
            latency_ms=round((time.perf_counter() - t0) * 1000, 2),
            error=str(e),
        )


async def _check_ollama() -> DependencyHealth:
    t0 = time.perf_counter()
    try:
        import httpx
        async with httpx.AsyncClient(timeout=httpx.Timeout(5.0)) as client:
            r = await client.get(f"{settings.ollama_url}/api/tags")
            r.raise_for_status()
        return DependencyHealth(
            status="ok",
            latency_ms=round((time.perf_counter() - t0) * 1000, 2),
        )
    except Exception as e:
        return DependencyHealth(
            status="unavailable",
            latency_ms=round((time.perf_counter() - t0) * 1000, 2),
            error=str(e),
        )


async def _check_disk() -> DependencyHealth:
    t0 = time.perf_counter()
    try:
        stat = os.statvfs(settings.knowledge_base_dir)
        free_mb = (stat.f_bavail * stat.f_frsize) / (1024 * 1024)
        status = "ok" if free_mb > 100 else "degraded"
        return DependencyHealth(
            status=status,
            latency_ms=round((time.perf_counter() - t0) * 1000, 2),
            error="" if status == "ok" else f"Low disk space: {free_mb:.0f}MB free",
        )
    except Exception as e:
        return DependencyHealth(
            status="unavailable",
            latency_ms=round((time.perf_counter() - t0) * 1000, 2),
            error=str(e),
        )


@router.get("/health/observer", tags=["Observer"], operation_id="get_observer_health")
async def observer_health():
    """Get Observer runtime status (lightweight, no dependency checks)."""
    health = ObserverHealth(
        throttle_enabled=settings.observer_throttle_enabled,
        throttle_active_ips=0,
        sampler_enabled=settings.observer_sampler_enabled,
        sampler_buffer_size=0,
        sampler_buffer_max=settings.observer_sampler_max_size,
        sandbox_enabled=settings.observer_sandbox_enabled,
        sandbox_violations_total=0,
        guard_enabled=settings.observer_guard_enabled,
        guard_current_max_depth=0,
    )
    return success(data=health.model_dump())


@router.get("/health", operation_id="health_full")
async def health_full():
    """Full health check — application liveness + all dependency probes."""
    deps = {}
    deps["mongodb"] = (await _check_mongodb()).model_dump()
    deps["ollama"] = (await _check_ollama()).model_dump()
    deps["disk"] = (await _check_disk()).model_dump()

    statuses = [d["status"] for d in deps.values()]
    if "unavailable" in statuses:
        overall = "degraded"
    else:
        overall = "ok"

    health = AppHealth(
        status=overall,
        uptime_seconds=round(time.monotonic() - _start_time, 1),
        version="1.0.0",
        dependencies={k: DependencyHealth(**v) for k, v in deps.items()},
        observer=None,
    )
    return success(data=health.model_dump())


@router.get("/health/live", operation_id="health_live")
async def health_live():
    """Kubernetes-style liveness probe — minimal, no dependency checks."""
    return success(data={"status": "ok", "uptime": round(time.monotonic() - _start_time, 1)})


@router.get("/health/ready", operation_id="health_ready")
async def health_ready():
    """Kubernetes-style readiness probe — confirms DB is reachable."""
    mongo = await _check_mongodb()
    ready = mongo.status == "ok"
    return success(
        data={"status": "ready" if ready else "not_ready", "mongodb": mongo.model_dump()},
        http_code=200 if ready else 503,
    )
