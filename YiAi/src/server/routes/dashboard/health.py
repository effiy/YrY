"""Dashboard health check — live status of all subsystems."""
import asyncio
import json
import logging
import time
import urllib.request
from typing import Optional

from fastapi import APIRouter
from pydantic import BaseModel

from shared.config import settings
from shared.response import success

logger = logging.getLogger(__name__)
router = APIRouter()

_START_TIME = time.monotonic()


class ServerStatus(BaseModel):
    running: bool = True
    version: str = "1.0.0"
    uptime_seconds: float


class MongoStatus(BaseModel):
    connected: bool
    database: str


class SchedulerStatus(BaseModel):
    enabled: bool
    type: str
    interval: Optional[int] = None
    cron: Optional[dict] = None


class WatcherStatus(BaseModel):
    running: bool


class OllamaStatus(BaseModel):
    connected: bool
    model_count: int = 0
    url: str


class ObserverStatus(BaseModel):
    throttle_enabled: bool
    sampler_enabled: bool
    sandbox_enabled: bool
    guard_enabled: bool


class CollectionCounts(BaseModel):
    menus: int = 0
    users: int = 0
    roles: int = 0
    departments: int = 0
    sessions: int = 0
    knowledge_files: int = 0
    rss_sources: int = 0


class DashboardHealthResponse(BaseModel):
    server: ServerStatus
    mongodb: MongoStatus
    scheduler: SchedulerStatus
    knowledge_watcher: WatcherStatus
    ollama: OllamaStatus
    observer: ObserverStatus
    collections: CollectionCounts


async def _get_mongo_status() -> MongoStatus:
    try:
        from data.database import db

        await db.initialize()
        return MongoStatus(connected=True, database=settings.mongodb_db_name)
    except Exception as e:
        logger.warning(f"MongoDB health check failed: {e}")
        return MongoStatus(connected=False, database=settings.mongodb_db_name)


def _get_scheduler_status() -> SchedulerStatus:
    try:
        from domain.rss.scheduler import _scheduler_manager

        s = _scheduler_manager.get_status()
        return SchedulerStatus(
            enabled=s["enabled"],
            type=s["type"],
            interval=s.get("interval"),
            cron=s.get("cron"),
        )
    except Exception as e:
        logger.warning(f"Scheduler health check failed: {e}")
        return SchedulerStatus(enabled=False, type="unknown")


def _get_watcher_status() -> WatcherStatus:
    try:
        from domain.knowledge.watcher import _watcher_manager

        return WatcherStatus(running=_watcher_manager.is_running)
    except Exception as e:
        logger.warning(f"Knowledge watcher health check failed: {e}")
        return WatcherStatus(running=False)


async def _get_ollama_status() -> OllamaStatus:
    url = settings.ollama_url or "http://localhost:11434"
    loop = asyncio.get_event_loop()

    def _check():
        try:
            req = urllib.request.Request(f"{url}/api/tags")
            with urllib.request.urlopen(req, timeout=5) as resp:
                data = json.loads(resp.read().decode())
                models = data.get("models", [])
                return OllamaStatus(connected=True, model_count=len(models), url=url)
        except Exception as e:
            logger.warning(f"Ollama health check failed: {e}")
            return OllamaStatus(connected=False, model_count=0, url=url)

    return await loop.run_in_executor(None, _check)


def _get_observer_status() -> ObserverStatus:
    return ObserverStatus(
        throttle_enabled=settings.observer_throttle_enabled,
        sampler_enabled=settings.observer_sampler_enabled,
        sandbox_enabled=settings.observer_sandbox_enabled,
        guard_enabled=settings.observer_guard_enabled,
    )


async def _get_collection_counts() -> CollectionCounts:
    try:
        from data.database import db

        await db.initialize()
        counts = {}
        for name in ["menus", "users", "dict_role", "dict_department", "sessions", "knowledge_files"]:
            try:
                counts[name] = await db.db[name].count_documents({})
            except Exception:
                counts[name] = 0

        rss_count = 0
        try:
            rss_count = await db.db[settings.collection_seeds].count_documents({})
        except Exception:
            logger.debug("Failed to count rss seeds", exc_info=True)

        return CollectionCounts(
            menus=counts.get("menus", 0),
            users=counts.get("users", 0),
            roles=counts.get("dict_role", 0),
            departments=counts.get("dict_department", 0),
            sessions=counts.get("sessions", 0),
            knowledge_files=counts.get("knowledge_files", 0),
            rss_sources=rss_count,
        )
    except Exception as e:
        logger.warning(f"Collection counts failed: {e}")
        return CollectionCounts()


@router.get("/health", operation_id="dashboard_health")
async def dashboard_health():
    """Return aggregated health status of all subsystems."""
    server = ServerStatus(
        running=True,
        version="1.0.0",
        uptime_seconds=time.monotonic() - _START_TIME,
    )

    mongo, ollama, collections = await asyncio.gather(
        _get_mongo_status(), _get_ollama_status(), _get_collection_counts(),
        return_exceptions=True,
    )
    mongo = mongo if not isinstance(mongo, BaseException) else MongoStatus(connected=False, database=settings.mongodb_db_name)
    ollama = ollama if not isinstance(ollama, BaseException) else OllamaStatus(connected=False, model_count=0, url="")
    collections = collections if not isinstance(collections, BaseException) else CollectionCounts()

    scheduler = _get_scheduler_status()
    watcher = _get_watcher_status()
    observer = _get_observer_status()

    response = DashboardHealthResponse(
        server=server,
        mongodb=mongo,
        scheduler=scheduler,
        knowledge_watcher=watcher,
        ollama=ollama,
        observer=observer,
        collections=collections,
    )
    return success(data=response.model_dump())