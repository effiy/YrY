"""Web search domain logic.

Uses the ``ddgs`` library (https://pypi.org/project/ddgs/) which queries
DuckDuckGo via its internal API.  Returns structured results:
  [{title, url, snippet}]
"""

import logging
from typing import List, Dict, Any

from ddgs import DDGS

logger = logging.getLogger(__name__)

_MAX_RESULTS_DEFAULT = 6


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

    try:
        raw = list(DDGS().text(q, max_results=max_results))
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
    return results
