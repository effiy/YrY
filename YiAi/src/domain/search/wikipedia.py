"""Wikipedia fallback search.

Uses the Wikipedia ``opensearch`` API as a fallback when DuckDuckGo returns no results.

Internal module — imported by ``web_search.py``. Not part of the public API.
"""

import logging
from typing import Callable

import httpx

logger = logging.getLogger(__name__)

_WIKIPEDIA_API = "https://en.wikipedia.org/w/api.php"


def _search_wikipedia(
    query: str,
    max_results: int = 6,
    *,
    _get_http: Callable[[], httpx.Client] | None = None,
) -> list[dict[str, any]]:
    q = (query or "").strip()
    if not q:
        return []

    try:
        if _get_http is not None:
            client = _get_http()
        else:
            client = httpx.Client(
                timeout=httpx.Timeout(10.0, connect=5.0),
                limits=httpx.Limits(max_keepalive_connections=5, max_connections=20),
            )

        resp = client.get(
            _WIKIPEDIA_API,
            params={
                "action": "opensearch",
                "search": q,
                "limit": max_results,
                "namespace": 0,
                "format": "json",
            },
        )
        resp.raise_for_status()
        data = resp.json()
        titles = data[1] if len(data) > 1 else []
        snippets = data[2] if len(data) > 2 else []
        urls = data[3] if len(data) > 3 else []

        results: list[dict[str, any]] = []
        for i in range(min(len(titles), len(urls))):
            title = (titles[i] or "").strip()
            url = (urls[i] or "").strip()
            snippet = (snippets[i] or "").strip() if i < len(snippets) else ""
            if title and url:
                results.append({"title": title, "url": url, "snippet": snippet})

        if results:
            logger.info(f"Wikipedia fallback returned {len(results)} results for: {q[:60]}")
        return results[:max_results]

    except Exception as e:
        logger.warning(f"Wikipedia fallback failed for '{q[:60]}': {e}")
        return []
