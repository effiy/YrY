"""Dashboard RAG stats — index status and query history."""
import logging

from fastapi import APIRouter
from pydantic import BaseModel

from shared.response import success

logger = logging.getLogger(__name__)
router = APIRouter()


class RagConfigInfo(BaseModel):
    embed_model: str = ""
    llm_model: str = ""
    chunk_size: int = 0
    chunk_overlap: int = 0
    top_k: int = 0
    hybrid_retrieval: bool = False
    rerank_enabled: bool = False
    inline_citations: bool = False
    auto_rebuild: bool = False
    knowledge_base_dir: str = ""


class RagQueryHistory(BaseModel):
    id: str
    question: str
    scope: str = ""
    result_count: int = 0
    top_score: float = 0.0
    latency_ms: int = 0
    timestamp: str = ""


class RagStatsResponse(BaseModel):
    built: bool = False
    num_docs: int = 0
    last_built_at: str = ""
    persist_dir: str = ""
    persist_dir_size: int = 0
    config: RagConfigInfo
    recent_queries: list[RagQueryHistory]


@router.get("/rag-stats", operation_id="dashboard_rag_stats")
async def rag_stats():
    """Return RAG index status and recent query history."""
    try:
        from domain.rag.indexer import rag_status
        from domain.rag.history import list_history

        status = rag_status()
        config = RagConfigInfo(**status.get("config", {}))

        history = list_history()
        recent = [
            RagQueryHistory(
                id=h.get("id", ""),
                question=h.get("question", ""),
                scope=h.get("scope", ""),
                result_count=h.get("result_count", 0),
                top_score=h.get("top_score", 0.0),
                latency_ms=h.get("latency_ms", 0),
                timestamp=h.get("timestamp", ""),
            )
            for h in history[:10]
        ]

        return success(data=RagStatsResponse(
            built=bool(status.get("built", False)),
            num_docs=int(status.get("num_docs", 0)),
            last_built_at=str(status.get("last_built_at", "")),
            persist_dir=str(status.get("persist_dir", "")),
            persist_dir_size=int(status.get("persist_dir_size", 0)),
            config=config,
            recent_queries=recent,
        ).model_dump())
    except Exception as e:
        logger.warning(f"RAG stats failed: {e}")
        return success(data=RagStatsResponse(
            built=False, num_docs=0, last_built_at="", persist_dir="", persist_dir_size=0,
            config=RagConfigInfo(), recent_queries=[],
        ).model_dump())