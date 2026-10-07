"""Search router — classifies queries and runs RAG + web search in parallel.

Decides whether a query needs internal knowledge (RAG), external web search,
or both, then executes the appropriate searches concurrently.
"""

from __future__ import annotations

import asyncio
import logging
import re
from typing import Any

logger = logging.getLogger(__name__)

# Patterns that indicate the query needs web search (time-sensitive, news, external)
_WEB_SEARCH_PATTERNS = [
    re.compile(r"最新|最近.*新闻|刚刚|今天|昨日|本周|这周", re.IGNORECASE),
    re.compile(r"weather|stock|price|crypto|bitcoin|exchange rate|汇率|股价|天气"),
    re.compile(r"\d{4}年.*\d{4}年|compared to \d{4}"),
    re.compile(r"(latest|current|recent|news|today|this week|breaking)", re.IGNORECASE),
    re.compile(r"(what is the|who is|define|meaning of)"),
    re.compile(r"(announced|released|launched|published) (today|this week|recently)"),
    # General knowledge / external reference patterns
    re.compile(r"(how (does|to|do|can|should|would)|what (are|happens|makes|causes)|why (is|does|are|do))", re.IGNORECASE),
    re.compile(r"(history of|origin of|background of|introduction to)"),
    re.compile(r"(best|top|popular|famous|notable|recommended).*(?:practices?|ways?|methods?|tools?|frameworks?|libraries?)"),
    re.compile(r"(comparison|compare|difference between|vs\.?|versus)", re.IGNORECASE),
    re.compile(r"(example|tutorial|guide|how-to|walkthrough|explanation)"),
    re.compile(r"(202[0-9]|current year|recently|these days|nowadays|at present)"),
    re.compile(r"(statistics|data|numbers|percentage|rate of|number of|how many|how much)", re.IGNORECASE),
]

# Patterns that indicate internal KB is sufficient
_KB_PATTERNS = [
    re.compile(r"项目|代码|系统|模块|配置|架构|接口|api|数据库|前端|后端", re.IGNORECASE),
    re.compile(r"YiAi|YiVad|YiPet|YiKnowledge|YrY|RAG|MongoDB|Ollama"),
    re.compile(r"开发|部署|测试|调试|优化|重构|bug|fix|feature"),
    re.compile(r"规范|约定|命名|格式|frontmatter|kebab-case|snake_case"),
    re.compile(r"(how to|怎么|如何).*(configure|配置|setup|安装|部署|运行|run|build)"),
]

# Knowledge-domain indicators — queries about the project itself
_KNOWLEDGE_DOMAIN = re.compile(
    r"YiAi|YiVad|YiPet|YiKnowledge|YrY|"
    r"RAG|llama_index|Ollama|MongoDB|FastAPI|Vue|Chrome|"
    r"项目|代码库|模块|组件|服务|接口|API|架构|配置|部署|测试",
    re.IGNORECASE,
)


def classify_query(question: str) -> tuple[str, float]:
    """Classify a query and return (category, confidence).

    Categories:
      - "kb": internal knowledge base is sufficient (RAG only)
      - "web": needs external/web search (web only)
      - "hybrid": benefits from both KB + web search

    Returns (category, confidence 0.0-1.0).

    Most queries default to "hybrid" for broader coverage — KB provides
    deep/cached context, web provides fresh/broad information. Only purely
    project-internal queries (about code structure, config, conventions)
    stay KB-only, and only real-time queries (weather, stock) stay web-only.
    """
    q = (question or "").strip()
    if not q:
        return ("kb", 0.0)
    if len(q) < 10:
        return ("hybrid", 0.4)

    web_score = 0.0
    kb_score = 0.0

    for pattern in _WEB_SEARCH_PATTERNS:
        if pattern.search(q):
            web_score += 1.0

    for pattern in _KB_PATTERNS:
        if pattern.search(q):
            kb_score += 1.0

    # Normalize
    web_score = min(web_score / 3.0, 1.0)
    kb_score = min(kb_score / 3.0, 1.0)

    # Pure web: strong web signal with zero KB signal
    if web_score > 0.5 and kb_score < 0.1:
        return ("web", web_score)
    # Pure KB: strong KB signal with zero web signal (project-internal)
    if kb_score > 0.3 and web_score < 0.1:
        return ("kb", kb_score)
    # Hybrid: any overlap or moderate signals — default for most queries
    if web_score > 0.1 or kb_score > 0.1:
        return ("hybrid", max(web_score, kb_score, 0.4))
    # Default: no strong signal either way → hybrid for broad coverage
    return ("hybrid", 0.3)


async def unified_search(
    question: str,
    *,
    top_k: int = 6,
    scope: str | None = None,
    web_results: int = 4,
    timeout: float = 15.0,
) -> dict[str, Any]:
    """Run RAG and web search in parallel, returning merged results.

    Returns:
        {"rag": [...], "web": [...], "category": "kb|web|hybrid", "timing": {...}}
    """
    category, confidence = classify_query(question)
    timing: dict[str, float] = {}

    rag_task = None
    web_task = None

    async def _do_rag():
        from domain.rag.engine import rag_query
        try:
            return await rag_query(question, top_k=top_k, scope=scope)
        except Exception as e:
            logger.warning(f"Unified search RAG failed: {e}")
            return []

    async def _do_web():
        from domain.search import search_async
        try:
            return await search_async(question, max_results=web_results)
        except Exception as e:
            logger.warning(f"Unified search web failed: {e}")
            return []

    import time
    t0 = time.perf_counter()

    if category == "kb":
        rag_task = asyncio.create_task(_do_rag())
        rag_sources = await asyncio.wait_for(rag_task, timeout=timeout)
        web_sources = []
    elif category == "web":
        web_task = asyncio.create_task(_do_web())
        web_sources = await asyncio.wait_for(web_task, timeout=timeout)
        rag_sources = []
    else:  # hybrid — run both in parallel
        rag_task = asyncio.create_task(_do_rag())
        web_task = asyncio.create_task(_do_web())
        done, _pending = await asyncio.wait(
            [rag_task, web_task], timeout=timeout,
        )
        rag_sources = []
        web_sources = []
        for t in done:
            try:
                result = t.result()
                if t is rag_task:
                    rag_sources = result or []
                else:
                    web_sources = result or []
            except Exception as e:
                logger.warning(f"Unified search sub-task failed: {e}")

    timing["total_ms"] = round((time.perf_counter() - t0) * 1000)
    timing["rag_count"] = len(rag_sources)
    timing["web_count"] = len(web_sources)

    logger.info(
        f"Unified search: category={category} confidence={confidence:.2f} "
        f"rag={len(rag_sources)} web={len(web_sources)} "
        f"total={timing['total_ms']}ms"
    )

    return {
        "rag": rag_sources,
        "web": web_sources,
        "category": category,
        "confidence": confidence,
        "timing": timing,
    }
