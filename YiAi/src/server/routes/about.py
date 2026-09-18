"""About route — returns project metadata."""
from fastapi import APIRouter
from pydantic import BaseModel

from shared.cache import cache
from shared.cache_keys import CACHE_TTL
from shared.response import success

router = APIRouter(prefix="/about", tags=["About"])


class AboutResponse(BaseModel):
    """Project metadata for YiAi."""

    name: str
    version: str
    description: str
    features: list[str]
    architecture: str
    tech_stack: list[str]
    runtime: str
    related_projects: list[dict[str, str]]


@router.get("/index", operation_id="about_index")
async def about_index():
    """Return project metadata with features, architecture, and related projects."""
    cache_key = "about:index"

    async def _build():
        data = AboutResponse(
            name="YiAi",
            version="1.0.0",
            description=(
                "FastAPI-based backend server providing AI-powered services "
                "(Ollama chat), file management with dual-write persistence, "
                "WeCom bot messaging, RSS feed aggregation, a generic "
                "module-execution engine, and a state-store for arbitrary "
                "key-value records."
            ),
            features=[
                "Ollama-powered LLM chat with streaming SSE responses",
                "File management with dual-write persistence (disk + MongoDB)",
                "WeCom bot messaging integration",
                "RSS feed aggregation and management",
                "Generic module-execution engine for extensible workflows",
                "State-store for arbitrary key-value records",
                "MCP (Model Context Protocol) server integration",
                "Unified API response envelope with error codes",
            ],
            architecture=(
                "Domain-driven modular architecture: routes/ → services/ → domain/. "
                "Each domain sub-package (ai, files, rss, wework, execution) owns its "
                "logic and exposes a clean public API via __init__.py. MongoDB access "
                "via Motor (async) with repository-pattern CRUD helpers."
            ),
            tech_stack=[
                "Python 3",
                "FastAPI",
                "Motor (async MongoDB)",
                "Ollama",
                "uvicorn",
                "pydantic",
            ],
            runtime="Python 3 / uvicorn (ASGI), port 10086",
            related_projects=[
                {
                    "name": "YiPet",
                    "description": "Chrome MV3 extension — interactive browser companion",
                    "url": "https://github.com/your-org/YiPet",
                },
                {
                    "name": "YiVad",
                    "description": "Vue 3 admin dashboard with Element Plus",
                    "url": "https://github.com/your-org/YiVad",
                },
            ],
        )
        return data.model_dump()

    data = await cache.get_or_set(cache_key, _build, ttl=CACHE_TTL["about:index"])
    return success(data=data, cache_ttl=CACHE_TTL["about:index"])
