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
    tech_stack: list[str]
    runtime: str


@router.get("/index", operation_id="about_index")
async def about_index():
    """Return static project metadata."""
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
        tech_stack=[
            "Python 3",
            "FastAPI",
            "Motor (async MongoDB)",
            "Ollama",
            "uvicorn",
            "pydantic",
        ],
        runtime="Python 3 / uvicorn (ASGI), port 10086",
    )
    return success(data=data.model_dump())
