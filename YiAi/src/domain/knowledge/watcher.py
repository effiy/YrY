"""Knowledge file watcher — disk → MongoDB metadata sync.

Walks ``settings.knowledge_base_dir`` periodically and reconciles the
``knowledge_files`` collection against disk: upserts every on-disk file by
relative ``path``, deletes DB docs whose path no longer exists.

Why polling instead of FSEvents/inotify: macOS FSEvents is unreliable for
this dev box (both ``watchfiles`` and ``watchdog`` silently miss events),
so we use periodic polling via ``apscheduler`` — same library the RSS
scheduler uses, works everywhere, and the walk is cheap (≈ tens of ms
for a few hundred files).
"""
from __future__ import annotations

import asyncio
import logging
import os
from datetime import datetime, timezone
from typing import Optional

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.interval import IntervalTrigger

from data.database import db
from domain.knowledge.scanner import _base_dir, _extract_meta
from shared.config import settings

logger = logging.getLogger(__name__)


def _now_str() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S")


def _rel_from_abs(abs_path: str, base: str) -> str:
    return os.path.relpath(abs_path, base).replace(os.sep, "/")


def _should_skip(filename: str) -> bool:
    """Skip hidden files and other artifacts that don't belong in the DB."""
    return filename.startswith(".")


def _build_md_snapshot(base: str) -> dict[str, tuple[int, int]]:
    """Walk ``base`` and return ``{rel_path: (size_bytes, mtime_ms)}`` for .md only.

    Used by the watcher to detect changes that warrant a RAG rebuild — non-md
    files don't enter the llama_index store, so their changes are ignored.
    """
    snap: dict[str, tuple[int, int]] = {}
    for dirpath, _dirs, filenames in os.walk(base):
        for fn in filenames:
            if _should_skip(fn):
                continue
            if not fn.lower().endswith(".md"):
                continue
            abs_path = os.path.join(dirpath, fn)
            try:
                st = os.stat(abs_path)
            except OSError:
                continue
            rel = _rel_from_abs(abs_path, base)
            snap[rel] = (st.st_size, int(st.st_mtime * 1000))
    return snap


def _snapshot_diff(prev: dict[str, tuple[int, int]], curr: dict[str, tuple[int, int]]) -> dict[str, list[str]]:
    """Compute added/removed/changed .md paths between two snapshots."""
    prev_keys = set(prev.keys())
    curr_keys = set(curr.keys())
    added = sorted(curr_keys - prev_keys)
    removed = sorted(prev_keys - curr_keys)
    changed = sorted(k for k in (prev_keys & curr_keys) if prev[k] != curr[k])
    return {"added": added, "removed": removed, "changed": changed}


class KnowledgeWatcherManager:
    """Encapsulates watcher state and lifecycle."""

    def __init__(self):
        self._scheduler: Optional[AsyncIOScheduler] = None
        self._running = False
        self._last_snapshot: dict[str, tuple[int, int]] = {}
        self._last_rebuilt_snapshot: dict[str, tuple[int, int]] = {}
        self._rag_rebuild_task: Optional[asyncio.Task] = None

    @property
    def is_running(self) -> bool:
        return self._running

    async def sync_knowledge_full(self) -> dict:
        """Reconcile DB against disk: upsert every on-disk file, delete stale.

        Also snapshots .md files' (size, mtime) and schedules a debounced
        incremental RAG refresh when the snapshot differs from the last
        rebuild.
        """
        await db.initialize()
        collection = db.db[settings.collection_knowledge_files]
        base = _base_dir()
        if not os.path.isdir(base):
            logger.warning(f"Knowledge base dir does not exist: {base}")
            return {"synced": 0, "deleted": 0}

        on_disk: dict[str, str] = {}
        for dirpath, _dirs, filenames in os.walk(base):
            for fn in filenames:
                if _should_skip(fn):
                    continue
                abs_path = os.path.join(dirpath, fn)
                rel = _rel_from_abs(abs_path, base)
                on_disk[rel] = abs_path

        synced = 0
        for rel, abs_path in on_disk.items():
            try:
                meta = _extract_meta(rel, abs_path)
                await self._upsert(collection, meta)
                synced += 1
            except Exception as e:
                logger.warning(f"Failed to sync {rel}: {e}")

        deleted = 0
        cursor = collection.find({}, {"path": 1, "_id": 0})
        stale_paths = [doc["path"] async for doc in cursor if doc.get("path") not in on_disk]
        for p in stale_paths:
            await collection.delete_one({"path": p})
            deleted += 1

        logger.info(f"Knowledge full sync: {synced} upserted, {deleted} deleted")

        await self._maybe_trigger_rag_refresh(base)
        return {"synced": synced, "deleted": deleted}

    async def _maybe_trigger_rag_refresh(self, base: str) -> None:
        """Schedule an incremental RAG refresh when .md files changed.

        - First tick: establish baseline, no refresh (the index auto-builds
          lazily via ``load_kb_index`` on first query).
        - Subsequent ticks: diff against ``_last_rebuilt_snapshot``. If any
          added/removed/changed path, schedule a debounced refresh.
        - Coalesces bursts: if a refresh is already scheduled/in-flight,
          further ticks within the window are ignored. The refresh recomputes
          the diff at fire time, so changes that arrived during the wait are
          captured.
        """
        if not settings.rag_auto_rebuild_enabled:
            return
        curr = _build_md_snapshot(base)
        self._last_snapshot = curr
        if not self._last_rebuilt_snapshot:
            self._last_rebuilt_snapshot = curr
            return
        diff = _snapshot_diff(self._last_rebuilt_snapshot, curr)
        if not (diff["added"] or diff["removed"] or diff["changed"]):
            return
        if self._rag_rebuild_task is not None and not self._rag_rebuild_task.done():
            return
        debounce = settings.rag_auto_rebuild_debounce_seconds

        async def _run():
            await asyncio.sleep(debounce)
            try:
                latest = self._last_snapshot
                d = _snapshot_diff(self._last_rebuilt_snapshot, latest)
                if not (d["added"] or d["removed"] or d["changed"]):
                    return
                from domain.rag import refresh_index_async
                result = await refresh_index_async(
                    added=d["added"], removed=d["removed"], changed=d["changed"]
                )
                self._last_rebuilt_snapshot = latest
                logger.info(f"RAG incremental refresh: {result}")
            except Exception as e:
                logger.warning(f"RAG incremental refresh failed: {e}", exc_info=True)

        self._rag_rebuild_task = asyncio.create_task(_run())

    async def _upsert(self, collection, meta: dict) -> None:
        now = _now_str()
        await collection.update_one(
            {"path": meta["path"]},
            {
                "$set": {**meta, "updatedTime": now},
                "$setOnInsert": {"createdTime": now},
            },
            upsert=True,
        )

    async def _scheduler_job(self):
        """Periodic reconciliation — silent on no-op, warn on errors."""
        try:
            await self.sync_knowledge_full()
        except Exception as e:
            logger.warning(f"Knowledge periodic sync failed: {e}", exc_info=True)

    def start(self) -> None:
        if self._running:
            logger.warning("Knowledge watcher already running")
            return
        scheduler = AsyncIOScheduler()
        scheduler.add_job(
            self._scheduler_job,
            trigger=IntervalTrigger(seconds=settings.knowledge_watcher_poll_seconds),
            id="knowledge_watch_job",
            replace_existing=True,
        )
        scheduler.start()
        self._scheduler = scheduler
        self._running = True
        logger.info(
            f"Knowledge watcher started (poll every {settings.knowledge_watcher_poll_seconds}s)"
        )

    async def stop(self) -> None:
        if not self._running:
            return
        if self._scheduler and self._scheduler.running:
            self._scheduler.shutdown(wait=False)
            self._scheduler = None
        if self._rag_rebuild_task is not None and not self._rag_rebuild_task.done():
            self._rag_rebuild_task.cancel()
            self._rag_rebuild_task = None
        self._running = False
        logger.info("Knowledge watcher stopped")


_watcher_manager = KnowledgeWatcherManager()


async def sync_knowledge_full() -> dict:
    """Trigger a full resync (exposed via /knowledge-sync)."""
    return await _watcher_manager.sync_knowledge_full()


async def list_knowledge_files(category: Optional[str] = None) -> dict:
    """Read metadata from DB mirror (no disk scan)."""
    await db.initialize()
    collection = db.db[settings.collection_knowledge_files]
    query = {"category": category} if category else {}
    cursor = collection.find(query, {"_id": 0})
    files = [doc async for doc in cursor]
    files.sort(key=lambda x: x.get("path", ""))
    return {"files": files, "total": len(files)}


async def init_knowledge_watcher() -> None:
    """Start the watcher (called from FastAPI lifespan).

    Performs an initial full sync on startup so the DB is immediately
    consistent, then schedules periodic reconciliation.
    """
    if not settings.knowledge_watcher_enabled:
        return
    try:
        await db.initialize()
        await _watcher_manager.sync_knowledge_full()
        _watcher_manager.start()
    except Exception as e:
        logger.warning(f"Failed to start knowledge watcher: {e}", exc_info=True)


async def shutdown_knowledge_watcher() -> None:
    """Stop the watcher (called from FastAPI lifespan)."""
    if not settings.knowledge_watcher_enabled:
        return
    try:
        await _watcher_manager.stop()
    except Exception as e:
        logger.warning(f"Failed to stop knowledge watcher: {e}")
