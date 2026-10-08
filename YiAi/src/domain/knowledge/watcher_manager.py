"""Knowledge file watcher — disk → MongoDB metadata sync.

RAG REFRESH KILL-SWITCH
=======================
By default this module will **never** trigger an implicit RAG index
(refresh|rebuild) call — even if ``settings.knowledge_watcher_enabled`` or
``settings.rag_auto_rebuild_enabled`` accidentally get flipped back to
``True`` in the YAML.

The only gate that can schedule a RAG refresh is ``_rag_refresh_allowed()``
and it currently returns ``False`` unconditionally.  Re-enable implicit
refreshes only on a dedicated box with enough GPU/CPU headroom and explicit
operator intent.

Everything else in this file (disk → MongoDB metadata sync) still runs as
configured: polling, full sync, snapshot diffs, bulk upsert/delete — those
operations are cheap and we need them to keep the DB populated.  Only the
``_maybe_trigger_rag_refresh`` tail-call is no-op'ed by default.
"""
from __future__ import annotations

import asyncio
from datetime import datetime, timezone
import json
import logging
import os
import time
import urllib.request

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.interval import IntervalTrigger
from pymongo import DeleteOne, UpdateOne
from pymongo.errors import BulkWriteError

from data.database import db
from domain.knowledge.scanner import _base_dir, _extract_meta
from domain.knowledge.snapshot import (
    _BULK_CHUNK,
    _build_all_snapshot,
    _build_md_snapshot,
    _now_str,
    _snapshot_diff,
)
from shared.config import settings

logger = logging.getLogger(__name__)


def _rag_refresh_allowed() -> bool:
    """Hard kill-switch for implicit RAG index refreshes.

    Override this (or flip the env var ``YIAI_ALLOW_RAG_REFRESH=1``) only on
    a dedicated box.  Out of the box we do **not** let watcher_manager,
    knowledge sync, or any timer-driven path issue a
    ``build_kb_index / refresh_index_for_changes`` call — those paths pin
    the CPU/GPU at 100% and drain laptop batteries in minutes.
    """
    env = os.getenv("YIAI_ALLOW_RAG_REFRESH", "").strip().lower()
    if env in ("1", "true", "yes", "on"):
        return bool(settings.rag_auto_rebuild_enabled)
    return False



class KnowledgeWatcherManager:
    """Encapsulates watcher state and lifecycle."""

    def __init__(self):
        self._scheduler: AsyncIOScheduler | None = None
        self._running = False
        self._last_snapshot: dict[str, tuple[int, int]] = {}
        self._last_rebuilt_snapshot: dict[str, tuple[int, int]] = {}
        self._last_meta_snapshot: dict[str, tuple[int, int]] = {}
        self._rag_rebuild_task: asyncio.Task | None = None
        self._last_scan_time: str = ""

    @property
    def is_running(self) -> bool:
        return self._running

    @property
    def last_scan_time(self) -> str:
        return self._last_scan_time

    async def sync_knowledge_full(self) -> dict:
        """Force full reconcile — bulk_write upsert every on-disk file, delete stale.

        Used by manual /knowledge-sync trigger and the bootstrap pass. Updates
        ``_last_meta_snapshot`` so subsequent diff-based ticks have a baseline.
        """
        await db.initialize()
        collection = db.db[settings.collection_knowledge_files]
        base = _base_dir()
        if not os.path.isdir(base):
            logger.warning(f"Knowledge base dir does not exist: {base}")
            return {"synced": 0, "deleted": 0}

        _dbg_trace = f"knowledge-sync-{int(time.time() * 1000)}"
        _snapshot_started = time.perf_counter()
        abs_paths, snapshot = _build_all_snapshot(base)
        # #region debug-point B:sync-snapshot
        try:
            urllib.request.urlopen(urllib.request.Request(
                "http://127.0.0.1:7777/event",
                data=json.dumps({
                    "sessionId": "knowledge-sync-slow",
                    "runId": "post-fix",
                    "hypothesisId": "B",
                    "location": "src/domain/knowledge/watcher_manager.py:sync_knowledge_full:snapshot",
                    "traceId": _dbg_trace,
                    "msg": "[DEBUG] knowledge-sync snapshot built",
                    "data": {
                        "durationMs": int((time.perf_counter() - _snapshot_started) * 1000),
                        "fileCount": len(abs_paths),
                    },
                    "ts": int(time.time() * 1000),
                }).encode(),
                headers={"Content-Type": "application/json"},
            ), timeout=0.8).read()
        except Exception:
            pass
        # #endregion
        db_snapshot = await self._load_db_snapshot(collection)
        curr_keys = set(snapshot.keys())
        prev_keys = set(db_snapshot.keys())
        changed_or_added = sorted(rel for rel in curr_keys if db_snapshot.get(rel) != snapshot.get(rel))
        removed = sorted(prev_keys - curr_keys)
        to_upsert = {rel: abs_paths[rel] for rel in changed_or_added}

        _upsert_started = time.perf_counter()
        synced = await self._bulk_upsert(collection, to_upsert)
        # #region debug-point C:sync-upsert
        try:
            urllib.request.urlopen(urllib.request.Request(
                "http://127.0.0.1:7777/event",
                data=json.dumps({
                    "sessionId": "knowledge-sync-slow",
                    "runId": "post-fix",
                    "hypothesisId": "C",
                    "location": "src/domain/knowledge/watcher_manager.py:sync_knowledge_full:upsert",
                    "traceId": _dbg_trace,
                    "msg": "[DEBUG] knowledge-sync bulk upsert done",
                    "data": {
                        "durationMs": int((time.perf_counter() - _upsert_started) * 1000),
                        "synced": synced,
                        "fileCount": len(abs_paths),
                        "upsertCandidates": len(to_upsert),
                        "dbTracked": len(db_snapshot),
                    },
                    "ts": int(time.time() * 1000),
                }).encode(),
                headers={"Content-Type": "application/json"},
            ), timeout=0.8).read()
        except Exception:
            pass
        # #endregion
        _delete_started = time.perf_counter()
        deleted = await self._bulk_delete(collection, set(abs_paths.keys()), stale_paths=removed)
        # #region debug-point C:sync-delete
        try:
            urllib.request.urlopen(urllib.request.Request(
                "http://127.0.0.1:7777/event",
                data=json.dumps({
                    "sessionId": "knowledge-sync-slow",
                    "runId": "post-fix",
                    "hypothesisId": "C",
                    "location": "src/domain/knowledge/watcher_manager.py:sync_knowledge_full:delete",
                    "traceId": _dbg_trace,
                    "msg": "[DEBUG] knowledge-sync bulk delete done",
                    "data": {
                        "durationMs": int((time.perf_counter() - _delete_started) * 1000),
                        "deleted": deleted,
                        "keepCount": len(abs_paths),
                        "deleteCandidates": len(removed),
                    },
                    "ts": int(time.time() * 1000),
                }).encode(),
                headers={"Content-Type": "application/json"},
            ), timeout=0.8).read()
        except Exception:
            pass
        # #endregion
        self._last_meta_snapshot = snapshot

        self._last_scan_time = _now_str()
        logger.info(f"Knowledge full sync: {synced} upserted, {deleted} deleted")

        await self._maybe_trigger_rag_refresh(base)
        return {"synced": synced, "deleted": deleted}

    async def _reconcile_diff(self) -> dict:
        """Periodic diff-based reconcile — only writes files that changed/added,
        only deletes files that were removed. Falls back to full sync on first
        tick (when ``_last_meta_snapshot`` is empty).
        """
        await db.initialize()
        collection = db.db[settings.collection_knowledge_files]
        base = _base_dir()
        if not os.path.isdir(base):
            return {"synced": 0, "deleted": 0}

        abs_paths, curr = _build_all_snapshot(base)

        if not self._last_meta_snapshot:
            return await self.sync_knowledge_full()

        prev = self._last_meta_snapshot
        prev_keys = set(prev.keys())
        curr_keys = set(curr.keys())
        added = sorted(curr_keys - prev_keys)
        removed = sorted(prev_keys - curr_keys)
        changed = sorted(k for k in (prev_keys & curr_keys) if prev[k] != curr[k])

        to_upsert = {rel: abs_paths[rel] for rel in (added + changed)}
        synced = await self._bulk_upsert(collection, to_upsert)
        deleted = await self._bulk_delete(collection, set(curr_keys))
        self._last_meta_snapshot = curr

        self._last_scan_time = _now_str()
        await self._maybe_trigger_rag_refresh(base)
        logger.info(
            f"Knowledge diff sync: +{len(added)} ~{len(changed)} -{len(removed)} "
            f"({synced} upserted, {deleted} deleted)"
        )
        return {"synced": synced, "deleted": deleted}

    async def _load_db_snapshot(self, collection) -> dict[str, tuple[int, int]]:
        """Load current DB mirror as ``{path: (size, updatedAt_ms)}``."""
        snap: dict[str, tuple[int, int]] = {}
        cursor = collection.find({}, {"path": 1, "size": 1, "updatedAt": 1, "_id": 0})
        async for doc in cursor:
            path = doc.get("path")
            if not path:
                continue
            snap[path] = (
                int(doc.get("size") or 0),
                int(doc.get("updatedAt") or 0),
            )
        return snap

    async def _bulk_upsert(self, collection, abs_paths: dict[str, str]) -> int:
        """Bulk_write upsert metadata for each rel → abs_path. Returns actual write count."""
        if not abs_paths:
            return 0
        now = _now_str()
        ops: list[UpdateOne] = []
        for rel, abs_path in abs_paths.items():
            try:
                meta = _extract_meta(rel, abs_path)
            except Exception as e:
                logger.warning(f"Failed to extract meta {rel}: {e}")
                continue
            # Use file mtime as updatedTime so stale detection works correctly
            updated_at = meta.get("updatedAt")
            if updated_at:
                meta["updatedTime"] = datetime.fromtimestamp(
                    updated_at / 1000, tz=timezone.utc
                ).strftime("%Y-%m-%d %H:%M:%S")
            else:
                meta["updatedTime"] = now
            ops.append(UpdateOne(
                {"path": meta["path"]},
                {
                    "$set": {**meta},
                    "$setOnInsert": {"createdTime": now},
                },
                upsert=True,
            ))
        if not ops:
            return 0
        total_upserted = 0
        total_modified = 0
        total_failed = 0
        errors: list[str] = []
        for i in range(0, len(ops), _BULK_CHUNK):
            try:
                result = await collection.bulk_write(ops[i:i + _BULK_CHUNK], ordered=False)
                total_upserted += result.upserted_count
                total_modified += result.modified_count
            except BulkWriteError as bwe:
                total_upserted += bwe.details.get("nUpserted", 0)
                total_modified += bwe.details.get("nModified", 0)
                for w_err in bwe.details.get("writeErrors", []):
                    total_failed += 1
                    errors.append(f"op[{w_err.get('index', '?')}]: {w_err.get('errmsg', 'unknown')}")
        if errors:
            logger.warning("Bulk upsert partial failure: %d failed, %d upserted, %d modified — %s",
                           total_failed, total_upserted, total_modified, errors[:5])
        return total_upserted + total_modified

    async def _bulk_delete(
        self,
        collection,
        keep_paths: set[str],
        *,
        stale_paths: list[str] | None = None,
    ) -> int:
        """Delete DB docs whose ``path`` is not in ``keep_paths``. Returns count."""
        stale = stale_paths
        if stale is None:
            cursor = collection.find({}, {"path": 1, "_id": 0})
            stale = [doc["path"] async for doc in cursor if doc.get("path") not in keep_paths]
        if not stale:
            return 0
        ops = [DeleteOne({"path": p}) for p in stale]
        for i in range(0, len(ops), _BULK_CHUNK):
            try:
                await collection.bulk_write(ops[i:i + _BULK_CHUNK], ordered=False)
            except BulkWriteError:
                logger.warning("Bulk delete partial failure for %d ops", len(ops[i:i + _BULK_CHUNK]))
        return len(stale)

    async def _maybe_trigger_rag_refresh(self, base: str) -> None:
        """Schedule an incremental RAG refresh when .md files changed.

        **DISABLED BY DEFAULT** — see ``_rag_refresh_allowed()`` and the
        module-level docstring.  Even when ``settings.rag_auto_rebuild_enabled``
        is accidentally ``True``, we refuse to schedule work unless the
        ``YIAI_ALLOW_RAG_REFRESH=1`` env var is also set.
        """
        if not _rag_refresh_allowed():
            return
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

    async def _scheduler_job(self):
        """Periodic diff-based reconcile — silent on no-op, warn on errors."""
        try:
            await self._reconcile_diff()
        except asyncio.CancelledError:
            # scheduler.shutdown(wait=False) cancels in-flight jobs mid-await;
            # not a real failure — next tick reconciles. Swallow so apscheduler's
            # executor doesn't log it as an unhandled exception.
            return
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


async def list_knowledge_files(category: str | None = None, page: int = 1, page_size: int = 0) -> dict:
    """Read metadata from DB mirror (no disk scan).

    Args:
        category: Filter by top-level role directory.
        page: 1-based page number (only used when page_size > 0).
        page_size: Page size. 0 means return all (no pagination).
    """
    await db.initialize()
    collection = db.db[settings.collection_knowledge_files]
    query = {"category": category} if category else {}
    cursor = collection.find(query, {"_id": 0}).sort("path", 1)

    if page_size > 0:
        total = await collection.count_documents(query)
        skip = (page - 1) * page_size
        cursor = cursor.skip(skip).limit(page_size)
        files = [doc async for doc in cursor]
        return {"files": files, "total": total, "page": page, "page_size": page_size}

    files = [doc async for doc in cursor]
    return {"files": files, "total": len(files)}


def get_last_scan_time() -> str:
    """Return ISO timestamp of the last completed watcher scan."""
    return _watcher_manager.last_scan_time


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
