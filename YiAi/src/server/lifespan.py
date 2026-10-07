"""Application lifespan management — startup/shutdown lifecycle."""

import asyncio
from contextlib import asynccontextmanager
import importlib
import logging

from fastapi import FastAPI
import httpx

from data.database import db
from shared.cache import cache
from shared.config import settings
from shared.runtime import configure_runtime

logger = logging.getLogger(__name__)

_HOT_MODULES = [
    "services.database.data_service",
    "services.ai.chat_service",
    "services.knowledge.knowledge_service",
    "services.rag.rag_service",
    "data.repository",
]


async def _run_knowledge_warmup():
    """Run knowledge scan in background without blocking startup."""
    try:
        from domain.knowledge import scan_knowledge
        tree = await asyncio.to_thread(scan_knowledge)
        await cache.set("yiai:knowledge:scan:all", tree, ttl=30)
        logger.info("Cache warmed: knowledge:scan:all")
    except Exception:
        logger.debug("Knowledge scan warmup failed", exc_info=True)


async def _warmup_cache():
    try:
        from server.routes.system import get_menu_tree
        menus = await get_menu_tree(use_cache=False)
        await cache.set("yiai:system:menus", menus, ttl=3600)
        logger.info("Cache warmed: system:menus")
    except Exception:
        logger.debug("Cache warmup menus skipped", exc_info=True)
    try:
        asyncio.create_task(_run_knowledge_warmup())
        logger.info("Knowledge scan warmup scheduled in background")
    except Exception:
        logger.debug("Cache warmup knowledge scan skipped", exc_info=True)
    try:
        from domain.rag.indexer import is_index_available, preload_kb_index, trigger_background_build
        if is_index_available():
            await preload_kb_index()
            logger.info("Cache warmed: rag index preloaded")
        elif settings.rag_auto_rebuild_enabled:
            trigger_background_build()
            logger.info("RAG index background build triggered on startup")
    except Exception:
        logger.debug("Cache warmup rag index skipped", exc_info=True)
    for mod_name in _HOT_MODULES:
        try:
            importlib.import_module(mod_name)
            logger.debug(f"Pre-warmed module: {mod_name}")
        except Exception:
            logger.debug(f"Pre-warm skipped: {mod_name}", exc_info=True)
    try:
        from services.ai.model_runtime import _get_ollama_client
        client = _get_ollama_client(
            settings.ollama_url.rstrip("/") if hasattr(settings, "ollama_url") else "http://localhost:11434",
            float(getattr(settings, "ollama_chat_timeout", 300) or 300),
        )
        resp = await client.get("/api/tags", timeout=httpx.Timeout(10.0))
        if resp.status_code == 200:
            models = resp.json().get("models", [])
            logger.info(f"Ollama pre-warmed: {len(models)} model(s) available")
        else:
            logger.warning(f"Ollama pre-warm: HTTP {resp.status_code}")
    except Exception:
        logger.debug("Ollama pre-warm skipped (server may not be running)", exc_info=True)


def _build_lifespan(init_db: bool, init_rss: bool, init_knowledge: bool):
    @asynccontextmanager
    async def lifespan(app: FastAPI):
        logger.info("Starting application...")
        _warmup_task: asyncio.Task | None = None
        try:
            configure_runtime()
            if init_db and settings.startup_init_database:
                await db.initialize()
                logger.info("Database initialized successfully")
            if init_rss and settings.startup_init_rss_system:
                from domain.rss import init_rss_system
                init_rss_system()
            if init_knowledge and settings.knowledge_watcher_enabled:
                from domain.knowledge import init_knowledge_watcher
                await init_knowledge_watcher()
            await cache.initialize()
            if settings.backup_enabled:
                from services.backup import setup_backup_scheduler
                setup_backup_scheduler()
                logger.info("Backup scheduler started")
            _warmup_task = asyncio.ensure_future(_warmup_cache())
            logger.info("Application startup complete")
        except Exception as e:
            logger.error(f"Application startup failed: {e!s}", exc_info=True)
            raise

        yield

        logger.info("Shutting down application...")
        if _warmup_task and not _warmup_task.done():
            _warmup_task.cancel()
            try:
                await _warmup_task
            except asyncio.CancelledError:
                pass
        try:
            from server.middleware import GracefulShutdownMiddleware
            drain_start = asyncio.get_running_loop().time()
            drain_timeout = 30.0
            while GracefulShutdownMiddleware.inflight() > 0:
                if asyncio.get_running_loop().time() - drain_start > drain_timeout:
                    logger.warning(f"Graceful drain timed out after {drain_timeout}s")
                    break
                await asyncio.sleep(0.1)
            logger.info("Graceful drain complete — inflight=0")
        except Exception:
            logger.debug("Graceful drain skipped", exc_info=True)
        try:
            if init_knowledge and settings.knowledge_watcher_enabled:
                from domain.knowledge import shutdown_knowledge_watcher
                await shutdown_knowledge_watcher()
            if init_rss and settings.startup_init_rss_system:
                from domain.rss import shutdown_rss_system
                shutdown_rss_system()
            if settings.backup_enabled:
                from services.backup import shutdown_backup_scheduler
                shutdown_backup_scheduler()
            if init_db and settings.startup_init_database:
                await db.close()
            try:
                from domain.rag import close_http_client
                await close_http_client()
            except Exception:
                logger.debug("HTTP client close skipped", exc_info=True)
            try:
                from services.ai.llm_provider import close_http_client
                await close_http_client()
            except Exception:
                logger.debug("LLM provider HTTP client close skipped", exc_info=True)
            try:
                from services.ai.model_runtime import _close_ollama_client
                await _close_ollama_client()
            except Exception:
                logger.debug("Ollama runtime HTTP client close skipped", exc_info=True)
            try:
                from shared.runtime import close_shared_client
                await close_shared_client()
            except Exception:
                logger.debug("Shared HTTP client close skipped", exc_info=True)
            logger.info("Application shutdown complete")
        except Exception as e:
            logger.error(f"Error during application shutdown: {e!s}", exc_info=True)
    return lifespan
