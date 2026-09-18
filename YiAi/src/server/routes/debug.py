"""Debug and performance profiling endpoints.

``GET /debug/performance`` — runtime stats for production monitoring.
``GET /debug/health``     — deep health check (DB, cache, LLM, disk).
"""
from __future__ import annotations

import logging
import os
import time

from fastapi import APIRouter
import httpx

from shared.cache import cache
from shared.response import success
from shared.runtime import get_runtime_stats

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/debug", tags=["Debug"])


@router.get("/performance", operation_id="debug_performance")
async def performance_profile():
    """Return real-time performance stats.

    Includes:
      - Python runtime (GC stats, asyncio debug state)
      - Cache backend + memory usage
      - Circuit breaker states (LLM providers)
      - In-flight request count (graceful drain)
    """
    t0 = time.perf_counter()
    runtime = get_runtime_stats()
    cache_stats = await cache.stats()

    from shared.circuit_breaker import get_all_circuit_breaker_stats
    circuit_breakers = get_all_circuit_breaker_stats()

    from server.middleware import GracefulShutdownMiddleware
    inflight = GracefulShutdownMiddleware.inflight()

    return success(data={
        "runtime": runtime,
        "cache": cache_stats,
        "circuit_breakers": circuit_breakers,
        "inflight": inflight,
        "elapsed_ms": round((time.perf_counter() - t0) * 1000),
    })


@router.get("/health", operation_id="debug_health")
async def deep_health():
    """Deep health check beyond the simple /health ping.

    Checks:
      - MongoDB connectivity
      - Cache backend status
      - Ollama availability (best-effort)
      - Disk space on the static/knowledge directories
    """
    checks: dict[str, dict] = {}

    # MongoDB
    try:
        from data.database import db
        await db.initialize()
        await db.db.command("ping")
        checks["mongodb"] = {"ok": True}
    except Exception as e:
        checks["mongodb"] = {"ok": False, "error": str(e)}

    # Cache
    try:
        cs = await cache.stats()
        checks["cache"] = {"ok": True, **cs}
    except Exception as e:
        checks["cache"] = {"ok": False, "error": str(e)}

    # Ollama
    try:
        from shared.config import settings
        async with httpx.AsyncClient(timeout=5.0) as client:
            r = await client.get(f"{settings.ollama_url}/api/tags")
            r.raise_for_status()
            models = [m.get("name", "") for m in (r.json().get("models", []) or [])]
            checks["ollama"] = {"ok": True, "models": len(models)}
    except Exception as e:
        checks["ollama"] = {"ok": False, "error": str(e)}

    # Disk
    try:
        from shared.config import settings
        for name, path in [("static", settings.static_base_dir), ("knowledge", settings.knowledge_base_dir)]:
            if os.path.isdir(path):
                s = os.statvfs(path)
                free_mb = (s.f_frsize * s.f_bavail) // (1024 * 1024)
                checks[f"disk_{name}"] = {"ok": True, "free_mb": free_mb}
            else:
                checks[f"disk_{name}"] = {"ok": False, "error": "directory not found"}
    except Exception as e:
        checks["disk"] = {"ok": False, "error": str(e)}

    all_ok = all(c.get("ok", False) for c in checks.values())
    http_code = 200 if all_ok else 503
    return success(data={"healthy": all_ok, "checks": checks}, http_code=http_code)
