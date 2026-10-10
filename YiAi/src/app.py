"""Application entry point — FastAPI app factory + uvicorn runner.

Analytics aggregators patched 2026-09-24 for multi-format time fields.
"""

import logging
import os
import sys
from pathlib import Path

# Configure bytecode generation and path
sys.dont_write_bytecode = True
_src_dir = Path(__file__).resolve().parent
if str(_src_dir) not in sys.path:
    sys.path.insert(0, str(_src_dir))

try:
    import uvloop
    uvloop.install()
except ImportError:
    pass

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from server.gzip_middleware import FastGZipMiddleware
from server.lifespan import _build_lifespan
from shared.config import settings
from shared.logging import setup_logging
from server.errors import register_exception_handlers
from server.middleware import (
    AuthMiddleware, BodySizeLimitMiddleware, GracefulShutdownMiddleware,
    RequestIdMiddleware, ResponseTimeMiddleware,
)
from server.routes import (
    about, auth, files, execution, wework, maintenance, state, health,
    users, system, knowledge, rag, search, mcp, notification,
    openai_compat, backup, metrics, bridge, dashboard, debug, analytics,
    reading_list,
)
from shared.response import ORJSONResponse

logger = logging.getLogger(__name__)


def create_app(
    *,
    enable_auth: bool | None = None,
    init_db: bool | None = None,
    init_rss: bool | None = None,
    init_knowledge: bool | None = None,
) -> FastAPI:
    setup_logging()

    auth_enabled = enable_auth if enable_auth is not None else settings.middleware_auth_enabled
    db_init_enabled = init_db if init_db is not None else True
    rss_init_enabled = init_rss if init_rss is not None else True
    knowledge_init_enabled = init_knowledge if init_knowledge is not None else True

    app = FastAPI(
        title="YiAi API", description="Yi Family Backend — RPC envelope API serving YiVad and YiPet", version="1.0.0",
        lifespan=_build_lifespan(db_init_enabled, rss_init_enabled, knowledge_init_enabled),
        default_response_class=ORJSONResponse,
    )

    register_exception_handlers(app)

    if settings.observer_enabled:
        try:
            from observer import ThrottleMiddleware, SamplerMiddleware, TailSampler
        except ImportError:
            logger.warning("Observer middleware enabled but package not installed — skipping")
        else:
            if settings.observer_sampler_enabled:
                sampler = TailSampler(max_size=settings.observer_sampler_max_size, slow_threshold_ms=settings.observer_sampler_slow_threshold_ms)
                app.add_middleware(SamplerMiddleware, sampler=sampler)
                logger.info("Observer Sampler middleware registered")
            if settings.observer_throttle_enabled:
                app.add_middleware(ThrottleMiddleware, max_requests=settings.observer_throttle_max_requests, window_seconds=settings.observer_throttle_window_seconds, whitelist=settings.get_throttle_whitelist())
                logger.info("Observer Throttle middleware registered")

    routers = [
        (about.router, "About"), (auth.router, "Auth"), (users.router, "Users"),
        (system.router, "System"), (files.router, "Upload"), (execution.router, "Execution"),
        (wework.router, "WeWork"), (maintenance.router, "Maintenance"), (state.router, "State"),
        (health.router, "Observer"), (knowledge.router, "Knowledge"), (rag.router, "RAG"),
        (search.router, "Search"), (mcp.router, "MCP"), (notification.router, "Notification"),
        (openai_compat.router, "OpenAI Compat"), (backup.router, "Backup"),
        (metrics.router, "Metrics"), (bridge.router, "Bridge"), (debug.router, "Debug"),
        (analytics.router, "Analytics"), (reading_list.router, "ReadingList"),
    ]
    for router, tag in routers:
        app.include_router(router, tags=[tag])
    # YiVad's axios baseURL is "/api", and the dev proxy usually strips that
    # prefix before forwarding. However the exact path "/api/" (e.g. the RPC
    # envelope POST "" from the frontend → resolves to "/api/" in the browser)
    # can fail to match some proxy context patterns, so we mount the
    # execution router a second time under "/api" to guarantee reachability.
    app.include_router(execution.router, prefix="/api", tags=["ExecutionCompat"])
    app.include_router(dashboard.router, prefix="/dashboard", tags=["Dashboard"])

    origins = settings.get_cors_origins()
    app.add_middleware(CORSMiddleware, allow_origins=origins, allow_credentials=(origins != ["*"]), allow_methods=["*"], allow_headers=["*"], expose_headers=["*"], max_age=3600)
    logger.info(f"CORS config: enabled, Origins: {origins}")

    app.add_middleware(FastGZipMiddleware, minimum_size=512, compression_level=1)
    app.add_middleware(BodySizeLimitMiddleware)
    app.add_middleware(ResponseTimeMiddleware)
    app.add_middleware(RequestIdMiddleware)

    if auth_enabled:
        app.add_middleware(AuthMiddleware, enabled=True)
        logger.info("Auth middleware enabled")
    else:
        logger.info("Auth middleware disabled")

    app.add_middleware(GracefulShutdownMiddleware)

    from server.mcp_server import mount_to_app
    mount_to_app(app)

    static_dir = settings.static_base_dir
    if not os.path.isabs(static_dir):
        static_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", static_dir))
    app.mount("/static", StaticFiles(directory=static_dir), name="static")

    return app


app = create_app()

if __name__ == "__main__":
    host = settings.server_host
    port = settings.server_port
    reload = settings.server_reload
    logger.info(f"Starting server: http://{host}:{port}")
    logger.info(f"Auto-reload: {'enabled' if reload else 'disabled'}")

    import uvicorn
    uvicorn.run(
        "app:app", host=host, port=port, reload=reload,
        log_level=settings.logging_level.lower(),
        limit_concurrency=settings.uvicorn_limit_concurrency,
        limit_max_requests=settings.uvicorn_limit_max_requests,
        timeout_keep_alive=settings.uvicorn_timeout_keep_alive,
    )
