"""Application entry point and lifecycle management
- Handles app startup/shutdown flow, dynamic route registration, CORS and auth middleware configuration
- Run directly as startup script
"""
import json
import logging
import uvicorn
import os
import sys
from contextlib import asynccontextmanager
from pathlib import Path

# Configure bytecode generation and path
sys.dont_write_bytecode = True
sys.path.append(os.getcwd())

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware

from data.database import db
from shared.config import settings
from server.middleware import header_verification_middleware
from shared.logging import setup_logging
from server.errors import register_exception_handlers
from server.routes import about, agent, auth, files, execution, wework, maintenance, state, health, users, system, knowledge, rag, search, mcp, dashboard, openai_compat

# Import service modules
from domain.rss import init_rss_system, shutdown_rss_system
from domain.knowledge import init_knowledge_watcher, shutdown_knowledge_watcher

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
]


async def _seed_collection_if_empty(cname: str, fname: str, lookup_field: str) -> None:
    """Seed a collection from a bundled JSON file when the collection is empty."""
    try:
        count = await db.db[cname].count_documents({})
        if count > 0:
            return
    except Exception:
        return

    path = _SEED_DIR / fname
    if not path.exists():
        logger.warning(f"Seed file not found: {path}")
        return

    with open(path, "r", encoding="utf-8") as f:
        docs = json.load(f)

    if not docs:
        return

    for doc in docs:
        if lookup_field not in doc:
            logger.warning(f"  skip doc without '{lookup_field}' in {fname}: {doc}")
            continue
        await db.db[cname].replace_one(
            {lookup_field: doc[lookup_field]}, doc, upsert=True
        )
    logger.info(f"Seeded {len(docs)} docs into '{cname}' from {fname}")


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
            if init_db and settings.startup_init_database:
                await db.initialize()
                logger.info("Database initialized successfully")
                await _seed_all_if_empty()
            if init_rss and settings.startup_init_rss_system:
                init_rss_system()
            if init_knowledge and settings.knowledge_watcher_enabled:
                await init_knowledge_watcher()
            logger.info("Application startup complete")
            # Preload RAG index in the background — fire-and-forget so it
            # never blocks the app from accepting requests. The first
            # /rag-chat call will load it lazily if the background task
            # hasn't finished yet.
            try:
                from domain.rag import preload_kb_index
                import asyncio
                asyncio.ensure_future(preload_kb_index())
            except Exception:
                logger.warning("RAG index preload failed — first request will load it", exc_info=True)
            logger.info("Application startup complete")
        except Exception as e:
            logger.error(f"Application startup failed: {str(e)}", exc_info=True)
            raise

        yield

        logger.info("Shutting down application...")
        try:
            if init_knowledge and settings.knowledge_watcher_enabled:
                await shutdown_knowledge_watcher()
            if init_rss and settings.startup_init_rss_system:
                shutdown_rss_system()
            if init_db and settings.startup_init_database:
                await db.close()
            logger.info("Application shutdown complete")
        except Exception as e:
            logger.error(f"Error during application shutdown: {str(e)}", exc_info=True)
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
        lifespan=_build_lifespan(db_init_enabled, rss_init_enabled, knowledge_init_enabled)
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
    app.include_router(agent.router, tags=["Agent"])
    app.include_router(health.router, tags=["Observer"])
    app.include_router(knowledge.router, tags=["Knowledge"])
    app.include_router(rag.router, tags=["RAG"])
    app.include_router(search.router, tags=["Search"])
    app.include_router(mcp.router, tags=["MCP"])
    app.include_router(dashboard.router, tags=["Dashboard"])
    app.include_router(openai_compat.router, tags=["OpenAI Compat"])

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

    if auth_enabled:
        app.middleware("http")(header_verification_middleware)
        logger.info("Auth middleware enabled")
    else:
        logger.info("Auth middleware disabled")

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

    print(f"Starting server: http://{host}:{port}")
    print(f"Auto-reload: {'enabled' if reload else 'disabled'}")

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
