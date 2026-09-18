"""Application entry point and lifecycle management
- Handles app startup/shutdown flow, dynamic route registration, CORS and auth middleware configuration
- Run directly as startup script
"""
import json
import logging
import asyncio
import importlib
import uvicorn
import os
import sys
from contextlib import asynccontextmanager
from pathlib import Path

import aiofiles

# Configure bytecode generation and path
sys.dont_write_bytecode = True
_src_dir = Path(__file__).resolve().parent
if str(_src_dir) not in sys.path:
    sys.path.insert(0, str(_src_dir))

# Install uvloop if available — 2-4× asyncio speedup. Must be called
# before the event loop is created (i.e. before uvicorn.run()).
try:
    import uvloop
    uvloop.install()
except ImportError:
    pass

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from server.gzip_middleware import FastGZipMiddleware

from data.database import db
from shared.config import settings
from server.middleware import AuthMiddleware, BodySizeLimitMiddleware, GracefulShutdownMiddleware, RequestIdMiddleware, ResponseTimeMiddleware
from shared.logging import setup_logging
from server.errors import register_exception_handlers
from server.routes import about, auth, files, execution, wework, maintenance, state, health, users, system, knowledge, rag, search, mcp, notification, openai_compat, backup, metrics, bridge, dashboard, debug
from shared.response import ORJSONResponse

# Import service modules
from domain.rss import init_rss_system, shutdown_rss_system
from domain.knowledge import init_knowledge_watcher, shutdown_knowledge_watcher
from shared.cache import cache
from shared.runtime import configure_runtime

logger = logging.getLogger(__name__)

_SEED_DIR = Path(__file__).parent / "data" / "seeds"

# (collection_name, seed_file, lookup_field) — lookup_field is the unique key
# used for upsert (must be present in every doc of the seed file).
_SEED_SPECS: list[tuple[str, str, str]] = [
    ("menus", "menus.json", "path"),
    ("users", "users.json", "key"),
    ("dict_status", "dict_status.json", "key"),
    ("dict_gender", "dict_gender.json", "key"),
    ("dict_department", "dict_department.json", "key"),
    ("dict_role", "dict_role.json", "key"),
    # Project Management collections (YiVad PM pages)
    ("projects", "projects.json", "key"),
    ("issues", "issues.json", "key"),
    ("cycles", "cycles.json", "key"),
    ("releases", "releases.json", "key"),
    ("modules", "modules.json", "key"),
    ("pages", "pages.json", "key"),
    ("labels", "labels.json", "key"),
    ("bugs", "bugs.json", "key"),
]


async def _seed_collection_if_empty(cname: str, fname: str, lookup_field: str) -> None:
    """Seed a collection from a bundled JSON file.

    Previously this skipped non-empty collections entirely — which meant new
    seed entries (e.g. newly added routes like /project/:key) were never
    written to an already-populated database. Now we always upsert every
    document by its lookup_field so additions and edits to seeds are
    reflected after restart, without ever deleting user-created documents
    that do not exist in the seed file.
    """
    path = _SEED_DIR / fname
    if not path.exists():
        logger.warning(f"Seed file not found: {path}")
        return

    async with aiofiles.open(path, encoding="utf-8") as f:
        docs = json.loads(await f.read())

    if not docs:
        return

    upserted = 0
    for doc in docs:
        if lookup_field not in doc:
            logger.warning(f"  skip doc without '{lookup_field}' in {fname}: {doc}")
            continue
        result = await db.db[cname].replace_one(
            {lookup_field: doc[lookup_field]}, doc, upsert=True
        )
        if result.upserted_id is not None or result.modified_count > 0:
            upserted += 1
    logger.info(f"Seeded '{cname}': {upserted}/{len(docs)} docs upserted from {fname}")


async def _seed_all_if_empty() -> None:
    """Seed all registered collections when empty."""
    for spec in _SEED_SPECS:
        await _seed_collection_if_empty(*spec)


def _build_lifespan(init_db: bool, init_rss: bool, init_knowledge: bool):
    @asynccontextmanager
    async def lifespan(app: FastAPI):
        """
        Application lifecycle management
        """
        logger.info("Starting application...")
        try:
            # ── Apply runtime optimisations before any I/O ──
            configure_runtime()
            if init_db and settings.startup_init_database:
                await db.initialize()
                logger.info("Database initialized successfully")
                await _seed_all_if_empty()
            if init_rss and settings.startup_init_rss_system:
                init_rss_system()
            if init_knowledge and settings.knowledge_watcher_enabled:
                await init_knowledge_watcher()
            # Initialize cache layer (Redis or memory fallback)
            await cache.initialize()
            # Start backup scheduler if enabled
            if settings.backup_enabled:
                from services.backup import setup_backup_scheduler
                setup_backup_scheduler()
                logger.info("Backup scheduler started")
            logger.info("Application startup complete")
            # RAG index is loaded lazily on the first /rag-chat or /rag-query
            # request. Preload on startup only if it's already built (persisted),
            # so the first request doesn't pay the disk I/O penalty. Don't trigger
            # a rebuild — that takes 15+ min with Ollama embeddings.

            # Warm up cache for frequently-accessed endpoints in the background.
            # None of these should block startup — failures are logged and the
            # first request will populate the cache lazily.
            async def _warmup_cache():
                from shared.cache import cache as _c
                try:
                    from server.routes.system import get_menu_tree
                    menus = await get_menu_tree(use_cache=False)
                    await _c.set("yiai:system:menus", menus, ttl=3600)
                    logger.info("Cache warmed: system:menus")
                except Exception:
                    logger.debug("Cache warmup menus skipped", exc_info=True)
                try:
                    from domain.knowledge import scan_knowledge
                    tree = await asyncio.to_thread(scan_knowledge)
                    await _c.set("yiai:knowledge:scan:all", tree, ttl=30)
                    logger.info("Cache warmed: knowledge:scan:all")
                except Exception:
                    logger.debug("Cache warmup knowledge scan skipped", exc_info=True)
                try:
                    from domain.rag.indexer import is_index_available, preload_kb_index
                    if is_index_available():
                        await preload_kb_index()
                        logger.info("Cache warmed: rag index preloaded")
                except Exception:
                    logger.debug("Cache warmup rag index skipped", exc_info=True)
                # Pre-import hot service modules so the first RPC call doesn't
                # pay the importlib cost. Each import is isolated so one failure
                # doesn't block the rest.
                _HOT_MODULES = [
                    "services.database.data_service",
                    "services.ai.chat_service",
                    "services.knowledge.knowledge_service",
                    "services.rag.rag_service",
                    "data.repository",
                ]
                for mod_name in _HOT_MODULES:
                    try:
                        importlib.import_module(mod_name)
                        logger.debug(f"Pre-warmed module: {mod_name}")
                    except Exception:
                        logger.debug(f"Pre-warm skipped: {mod_name}", exc_info=True)
                # Pre-warm Ollama HTTP connection pool — establishes TCP/TLS
                # and verifies the server is reachable before the first chat request.
                try:
                    import httpx
                    from services.ai.model_runtime import _get_ollama_client
                    from shared.config import settings as _s
                    client = _get_ollama_client(
                        _s.ollama_url.rstrip("/") if hasattr(_s, 'ollama_url') else "http://localhost:11434",
                        float(getattr(_s, 'ollama_chat_timeout', 300) or 300)
                    )
                    # Fire a lightweight request to establish the connection
                    resp = await client.get("/api/tags", timeout=httpx.Timeout(10.0))
                    if resp.status_code == 200:
                        data = resp.json()
                        models = data.get("models", [])
                        logger.info(f"Ollama pre-warmed: {len(models)} model(s) available")
                    else:
                        logger.warning(f"Ollama pre-warm: HTTP {resp.status_code}")
                except Exception:
                    logger.debug("Ollama pre-warm skipped (server may not be running)", exc_info=True)

            _warmup_task = asyncio.ensure_future(_warmup_cache())
            logger.info("Application startup complete")
        except Exception as e:
            logger.error(f"Application startup failed: {e!s}", exc_info=True)
            raise

        yield

        logger.info("Shutting down application...")
        # Cancel background warmup if still running
        if not _warmup_task.done():
            _warmup_task.cancel()
            try:
                await _warmup_task
            except asyncio.CancelledError:
                pass
        # ── Graceful drain: stop accepting new requests, wait for inflight ──
        try:
            from server.middleware import GracefulShutdownMiddleware
            drain_start = asyncio.get_running_loop().time()
            drain_timeout = 30.0  # max seconds to wait for inflight requests
            while GracefulShutdownMiddleware.inflight() > 0:
                if asyncio.get_running_loop().time() - drain_start > drain_timeout:
                    logger.warning(
                        f"Graceful drain timed out after {drain_timeout}s — "
                        f"{GracefulShutdownMiddleware.inflight()} requests still in flight"
                    )
                    break
                await asyncio.sleep(0.1)
            logger.info("Graceful drain complete — inflight=0")
        except Exception:
            logger.debug("Graceful drain skipped", exc_info=True)

        try:
            if init_knowledge and settings.knowledge_watcher_enabled:
                await shutdown_knowledge_watcher()
            if init_rss and settings.startup_init_rss_system:
                shutdown_rss_system()
            if settings.backup_enabled:
                from services.backup import shutdown_backup_scheduler
                shutdown_backup_scheduler()
            if init_db and settings.startup_init_database:
                await db.close()
            # Close shared httpx clients (used by RAG engine + LLM providers for Ollama calls)
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
            logger.info("Application shutdown complete")
        except Exception as e:
            logger.error(f"Error during application shutdown: {e!s}", exc_info=True)
    return lifespan


def create_app(
    *,
    enable_auth: bool | None = None,
    init_db: bool | None = None,
    init_rss: bool | None = None,
    init_knowledge: bool | None = None,
) -> FastAPI:
    """
    Create FastAPI application instance
    """
    # Configure logging
    setup_logging()

    auth_enabled = enable_auth if enable_auth is not None else settings.middleware_auth_enabled
    db_init_enabled = init_db if init_db is not None else True
    rss_init_enabled = init_rss if init_rss is not None else True
    knowledge_init_enabled = init_knowledge if init_knowledge is not None else True

    app = FastAPI(
        title="YiAi API",
        description="YiPet AI Service API",
        version="1.0.0",
        lifespan=_build_lifespan(db_init_enabled, rss_init_enabled, knowledge_init_enabled),
        default_response_class=ORJSONResponse,
    )

    # Register global exception handlers
    register_exception_handlers(app)

    # Register Observer middleware (only when enabled)
    if settings.observer_enabled:
        from observer import ThrottleMiddleware, SamplerMiddleware, TailSampler

        if settings.observer_sampler_enabled:
            sampler = TailSampler(
                max_size=settings.observer_sampler_max_size,
                slow_threshold_ms=settings.observer_sampler_slow_threshold_ms,
            )
            app.add_middleware(SamplerMiddleware, sampler=sampler)
            logger.info("Observer Sampler middleware registered")

        if settings.observer_throttle_enabled:
            app.add_middleware(
                ThrottleMiddleware,
                max_requests=settings.observer_throttle_max_requests,
                window_seconds=settings.observer_throttle_window_seconds,
                whitelist=settings.get_throttle_whitelist(),
            )
            logger.info("Observer Throttle middleware registered")

    # Register API routes
    app.include_router(about.router, tags=["About"])
    app.include_router(auth.router, tags=["Auth"])
    app.include_router(users.router, tags=["Users"])
    app.include_router(system.router, tags=["System"])
    app.include_router(files.router, tags=["Upload"])
    app.include_router(execution.router, tags=["Execution"])
    app.include_router(wework.router, tags=["WeWork"])
    app.include_router(maintenance.router, tags=["Maintenance"])
    app.include_router(state.router, tags=["State"])
    app.include_router(health.router, tags=["Observer"])
    app.include_router(knowledge.router, tags=["Knowledge"])
    app.include_router(rag.router, tags=["RAG"])
    app.include_router(search.router, tags=["Search"])
    app.include_router(mcp.router, tags=["MCP"])
    app.include_router(notification.router, tags=["Notification"])
    app.include_router(openai_compat.router, tags=["OpenAI Compat"])
    app.include_router(backup.router, tags=["Backup"])
    app.include_router(metrics.router, tags=["Metrics"])
    app.include_router(bridge.router, tags=["Bridge"])
    app.include_router(dashboard.router, prefix="/dashboard", tags=["Dashboard"])
    app.include_router(debug.router, tags=["Debug"])

    origins = settings.get_cors_origins()
    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=(origins != ["*"]),
        allow_methods=["*"],
        allow_headers=["*"],
        expose_headers=["*"],
        max_age=3600,
    )
    logger.info(f"CORS config: enabled, Origins: {origins}")

    # Fast GZip compression — zlib level 1, 3-4× faster than Starlette's gzip level 9
    app.add_middleware(FastGZipMiddleware, minimum_size=512, compression_level=1)
    logger.info("Fast GZip compression enabled (zlib level 1, min 512 bytes)")

    # Reject requests exceeding the configured body size limit before they hit route handlers
    app.add_middleware(BodySizeLimitMiddleware)

    # Response time tracking — adds X-Response-Time-Ms header to every response
    app.add_middleware(ResponseTimeMiddleware)

    # Request ID — adds X-Request-ID for distributed tracing
    app.add_middleware(RequestIdMiddleware)

    if auth_enabled:
        app.add_middleware(AuthMiddleware, enabled=True)
        logger.info("Auth middleware enabled")
    else:
        logger.info("Auth middleware disabled")

    # Graceful shutdown tracking — outermost middleware, always last
    app.add_middleware(GracefulShutdownMiddleware)
    logger.info("Graceful shutdown middleware registered")

    # Mount MCP server (before static to avoid route shadowing)
    from server.mcp_server import mount_to_app
    mount_to_app(app)

    # Mount static files
    static_dir = settings.static_base_dir
    if not os.path.isabs(static_dir):
        static_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", static_dir))
    app.mount("/static", StaticFiles(directory=static_dir), name="static")

    return app

# Default app instance (for production and compatibility with existing imports)
app = create_app()

if __name__ == "__main__":
    # Get from config
    host = settings.server_host
    port = settings.server_port
    reload = settings.server_reload

    logger.info(f"Starting server: http://{host}:{port}")
    logger.info(f"Auto-reload: {'enabled' if reload else 'disabled'}")

    # Get uvicorn config parameters
    log_level = settings.logging_level.lower()
    limit_concurrency = settings.uvicorn_limit_concurrency
    limit_max_requests = settings.uvicorn_limit_max_requests
    timeout_keep_alive = settings.uvicorn_timeout_keep_alive

    uvicorn.run(
        "app:app",
        host=host,
        port=port,
        reload=reload,
        log_level=log_level,
        limit_concurrency=limit_concurrency,
        limit_max_requests=limit_max_requests,
        timeout_keep_alive=timeout_keep_alive
    )
