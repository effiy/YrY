"""Web search domain logic.

Uses the ``ddgs`` library (https://pypi.org/project/ddgs/) which queries
DuckDuckGo via its internal API.  Returns structured results:
  [{title, url, snippet}]

Includes a simple TTL-based in-memory cache for repeated queries.
"""

import logging
import time
from typing import List, Dict, Any

from duckduckgo_search import DDGS

logger = logging.getLogger(__name__)

_MAX_RESULTS_DEFAULT = 6
_CACHE_TTL_SECONDS = 300  # 5 minutes

# In-memory cache: {query_lower: (timestamp, results)}
_cache: Dict[str, tuple[float, List[Dict[str, Any]]]] = {}


def _clean(text: str) -> str:
    return (text or "").strip()


def search(query: str, max_results: int = _MAX_RESULTS_DEFAULT) -> List[Dict[str, Any]]:
    """Search the web via DuckDuckGo (ddgs library).

    Args:
        query: Search query string.
        max_results: Max results to return (default 6, capped at 15).

    Returns:
        List of dicts with keys: title, url, snippet.
    """
    q = (query or "").strip()
    if not q:
        return []

    max_results = max(1, min(max_results, 15))

    # Check cache
    cache_key = q.lower()
    now = time.time()
    if cache_key in _cache:
        ts, cached = _cache[cache_key]
        if now - ts < _CACHE_TTL_SECONDS:
            logger.info(f"Web search cache hit for: {q[:60]} ({len(cached)} results)")
            return cached[:max_results]

    try:
        raw = list(DDGS(timeout=5).text(q, max_results=max_results))
    except Exception as e:
        logger.warning(f"DuckDuckGo search failed: {e}")
        return []

    results: List[Dict[str, Any]] = []
    for r in raw:
        title = _clean(r.get("title", ""))
        url = _clean(r.get("href", ""))
        snippet = _clean(r.get("body", ""))
        if not title and not url:
            continue
        results.append({
            "title": title or url,
            "url": url,
            "snippet": snippet,
        })

    if results:
        logger.info(f"DuckDuckGo returned {len(results)} results for: {q[:60]}")
        _cache[cache_key] = (now, results)

    return results


def clear_cache() -> None:
    """Clear the in-memory search cache (useful for testing)."""
    _cache.clear()
    logger.info("Web search cache cleared")
