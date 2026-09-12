"""Dashboard package — aggregated health, stats, and performance endpoints.

Each sub-module defines its own router. This package re-exports a single
``router`` that includes all sub-routers so ``app.py`` can register them
with ``prefix="/dashboard"``.
"""
from fastapi import APIRouter

from .health import router as health_router
from .rss import router as rss_router
from .knowledge import router as knowledge_router
from .organization import router as organization_router
from .ai import router as ai_router
from .rag import router as rag_router
from .service import router as service_router
from .performance import router as performance_router

router = APIRouter()
router.include_router(health_router)
router.include_router(rss_router)
router.include_router(knowledge_router)
router.include_router(organization_router)
router.include_router(ai_router)
router.include_router(rag_router)
router.include_router(service_router)
router.include_router(performance_router)