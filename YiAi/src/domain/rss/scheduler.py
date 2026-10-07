"""RSS feed scheduler — periodic fetch + persistence.

Wraps ``apscheduler`` with feedparser-based polling, writing normalized
articles into the ``rss`` collection and markdown bodies into the
knowledge tree under ``YiKnowledge/rss/<date>/<slug>.md``.
"""
from __future__ import annotations

import asyncio
import logging
import threading
from datetime import datetime, timezone
from typing import Any

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.interval import IntervalTrigger

from shared.config import settings
from shared.logging import get_logger

logger = get_logger(__name__)


class _SchedulerManager:
    """Manages RSS scheduler lifecycle and status reporting."""

    _JOB_ID = "rss_fetch_all"
    _LOCK = threading.Lock()

    def __init__(self):
        self._scheduler: AsyncIOScheduler | None = None
        self._enabled: bool = False
        self._type: str = "interval"
        self._interval: int = settings.rss_scheduler_interval
        self._cron: str | None = None
        self._last_fetch: str = ""
        self._last_error: str = ""
        self._running: bool = False

    def get_status(self) -> dict[str, Any]:
        return {
            "enabled": self._enabled,
            "type": self._type,
            "interval": self._interval,
            "cron": self._cron,
            "last_fetch": self._last_fetch,
            "last_error": self._last_error,
            "running": self._running,
        }

    def set_config(
        self,
        *,
        enabled: bool | None = None,
        interval: int | None = None,
        cron: str | None = None,
    ) -> dict[str, Any]:
        with self._LOCK:
            if enabled is not None:
                self._enabled = enabled
            if interval is not None and interval > 0:
                self._interval = interval
                self._type = "interval"
                self._cron = None
            if cron is not None:
                self._cron = cron
                self._type = "cron"
                self._interval = 0
            if self._scheduler is not None and self._scheduler.running:
                self._reschedule_job()
            return self.get_status()

    def _reschedule_job(self) -> None:
        if self._scheduler is None:
            return
        try:
            self._scheduler.remove_job(self._JOB_ID)
        except Exception:
            pass
        if not self._enabled:
            return
        if self._type == "cron" and self._cron:
            return
        trigger = IntervalTrigger(seconds=self._interval)
        self._scheduler.add_job(
            self._run_fetch_all_sync,
            trigger=trigger,
            id=self._JOB_ID,
            name="RSS fetch all enabled sources",
            replace_existing=True,
            coalesce=True,
            max_instances=1,
        )

    def start(self) -> dict[str, Any]:
        with self._LOCK:
            if self._scheduler is None:
                self._scheduler = AsyncIOScheduler(timezone=timezone.utc)
            if not self._scheduler.running:
                self._scheduler.start()
                logger.info("[RSS] Scheduler started")
            if self._enabled:
                self._reschedule_job()
            self._running = True
            return self.get_status()

    def stop(self) -> dict[str, Any]:
        with self._LOCK:
            if self._scheduler is not None and self._scheduler.running:
                self._scheduler.shutdown(wait=False)
                logger.info("[RSS] Scheduler stopped")
            self._running = False
            return self.get_status()

    def _run_fetch_all_sync(self) -> None:
        try:
            loop = asyncio.get_running_loop()
            t = loop.create_task(parse_all_enabled_rss_sources())
            self._last_fetch = _now_str()
            self._last_error = ""
        except Exception as e:
            self._last_error = str(e)
            logger.warning(f"[RSS] Scheduler fetch job failed: {e}")

    async def parse_all_now(self) -> dict[str, Any]:
        self._last_fetch = _now_str()
        try:
            result = await parse_all_enabled_rss_sources()
            self._last_error = ""
            return result
        except Exception as e:
            self._last_error = str(e)
            raise


_scheduler_manager = _SchedulerManager()


def _now_str() -> str:
    return datetime.now(timezone.utc).isoformat()


def get_scheduler_status_info() -> dict[str, Any]:
    return _scheduler_manager.get_status()


def set_scheduler_config(**kwargs: Any) -> dict[str, Any]:
    return _scheduler_manager.set_config(**kwargs)


def start_rss_scheduler() -> dict[str, Any]:
    if settings.rss_scheduler_enabled:
        _scheduler_manager._enabled = True
    return _scheduler_manager.start()


def stop_rss_scheduler() -> dict[str, Any]:
    return _scheduler_manager.stop()


async def parse_all_enabled_rss_sources() -> dict[str, Any]:
    from data.database import db

    await db.initialize()
    seed_collection = db.db[settings.collection_seeds]
    seeds = await seed_collection.find({"enabled": {"$ne": False}}).to_list(length=None)
    total = len(seeds)
    parsed = 0
    new_articles = 0
    errors: list[str] = []
    for seed in seeds:
        url = seed.get("url", "")
        name = seed.get("name", "Unknown")
        if not url:
            continue
        try:
            articles = await _parse_single_feed(url, seed)
            new_articles += articles
            parsed += 1
        except Exception as e:
            msg = f"{name}({url}): {e}"
            errors.append(msg)
            logger.warning(f"[RSS] Feed parse failed: {msg}")
    return {
        "total_sources": total,
        "parsed": parsed,
        "new_articles": new_articles,
        "errors": errors,
    }


async def _parse_single_feed(url: str, seed: dict) -> int:
    try:
        import feedparser
    except ImportError:
        return 0

    from data.database import db
    from domain.knowledge.writer import write_entry_markdown
    from domain.rss.persistence import (
        _build_entry_metadata,
        _classify_entry,
        _entry_body,
        _entry_date_dir,
        _slugify,
    )

    def _sync_parse():
        return feedparser.parse(url)

    loop = asyncio.get_running_loop()
    parsed = await loop.run_in_executor(None, _sync_parse)
    if getattr(parsed, "bozo", False) and not parsed.entries:
        raise ValueError(f"Feed parse error: {getattr(parsed, 'bozo_exception', 'unknown')}")

    source_name = seed.get("name") or parsed.feed.get("title", "Unknown")
    source_url = seed.get("url", url)
    source_category = seed.get("category")
    tags = seed.get("tags", []) or []

    rss_collection = db.db[settings.collection_rss]
    new_count = 0
    current_time = _now_str()

    for entry in parsed.entries:
        link = entry.get("link", "")
        if not link:
            continue
        existing = await rss_collection.find_one({"link": link}, {"_id": 1})
        if existing:
            continue
        title = entry.get("title", link)
        summary = entry.get("summary", entry.get("description", ""))
        category_path = _classify_entry(title, summary, source_category=source_category)
        date_dir = _entry_date_dir(entry)
        slug = _slugify(title)
        body = _entry_body(entry)
        file_path = f"rss/{date_dir}/{slug}.md"
        body_missing = not bool(body)
        metadata = _build_entry_metadata(
            entry=entry,
            source_name=source_name,
            source_url=source_url,
            tags=tags,
            current_time=current_time,
            category_path=category_path,
            file_path=file_path,
            body_missing=body_missing,
        )
        metadata["link"] = link
        if body:
            try:
                write_entry_markdown(file_path, body, metadata)
            except Exception as e:
                logger.debug(f"[RSS] Skip markdown write for {link}: {e}")
        try:
            await rss_collection.update_one(
                {"link": link},
                {"$setOnInsert": metadata},
                upsert=True,
            )
            new_count += 1
        except Exception as e:
            logger.warning(f"[RSS] DB upsert failed for {link}: {e}")

    return new_count


def init_rss_system() -> dict[str, Any]:
    _scheduler_manager._enabled = settings.rss_scheduler_enabled
    _scheduler_manager._interval = settings.rss_scheduler_interval
    _scheduler_manager._type = "interval"
    status = start_rss_scheduler()
    logger.info("[RSS] System initialized")
    return status


def shutdown_rss_system() -> dict[str, Any]:
    status = stop_rss_scheduler()
    logger.info("[RSS] System shutdown complete")
    return status
