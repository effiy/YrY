"""About route — returns project metadata."""
from fastapi import APIRouter
from pydantic import BaseModel

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
            "WeCom (企业微信) bot messaging integration",
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
    return success(data=data.model_dump())
