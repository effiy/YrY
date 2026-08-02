"""Web search endpoint.

POST /web-search  { query: str, max_results?: int }
Returns  { code: 0, data: { results: [{title, url, snippet}] } }
"""

import asyncio
import logging

from fastapi import APIRouter, Body

from domain.search import search as do_search
from shared.response import success

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/web-search", operation_id="web_search")
async def web_search_route(
    query: str = Body(..., embed=True),
    max_results: int = Body(6, embed=True),
):
    """Search the web via DuckDuckGo (ddgs library) and return results."""
    try:
        results = await asyncio.wait_for(
            asyncio.to_thread(do_search, query, max_results=max_results),
            timeout=25.0,
        )
        return success(data={"results": results})
    except asyncio.TimeoutError:
        logger.warning(f"Web search timed out for: {query[:60]}")
        return success(data={"results": [], "error": "Search timed out"})
    except Exception as e:
        logger.exception(f"Web search failed: {e}")
        return success(data={"results": [], "error": str(e)})
