"""Web search via DuckDuckGo with multi-angle search, quality scoring, and in-memory caching.

Internal module — the public API is re-exported from ``__init__.py``.
"""

import asyncio
from concurrent.futures import ThreadPoolExecutor, as_completed
from concurrent.futures import TimeoutError as FuturesTimeoutError
import logging
import time
from typing import Any

from duckduckgo_search import DDGS
import httpx

from .ai_search import _generate_search_queries, _generate_search_queries_async, _split_query, refine_query
from .formatter import _clean, _merge_and_rank
from .wikipedia import _search_wikipedia

logger = logging.getLogger(__name__)

_MAX_RESULTS_DEFAULT = 6
_CACHE_TTL_SECONDS = 600  # 10 minutes — web results don't change that fast
_MAX_CACHE_SIZE = 300
_SEARCH_WORKERS = 3  # max parallel sub-searches

# In-memory cache: {query_lower: (timestamp, results)}
_cache: dict[str, tuple[float, list[dict[str, Any]]]] = {}

# Shared sync HTTP client with connection pooling — replaces per-call
# ``requests.get/post`` which created a new TCP connection each time.
_http: httpx.Client | None = None


def _get_http() -> httpx.Client:
    global _http
    if _http is None or _http.is_closed:
        _http = httpx.Client(
            timeout=httpx.Timeout(10.0, connect=5.0),
            limits=httpx.Limits(max_keepalive_connections=5, max_connections=20),
        )
    return _http


def _cache_put(key: str, value: tuple[float, list[dict[str, Any]]]) -> None:
    if len(_cache) >= _MAX_CACHE_SIZE:
        oldest = next(iter(_cache))
        del _cache[oldest]
    _cache[key] = value


def _search_single(query: str, max_results: int) -> list[dict[str, Any]]:
    """Run a single DDGS search with Wikipedia fallback. No caching."""
    ddgs_count = max(3, max_results + 2) if max_results <= 6 else max_results
    raw: list[dict[str, Any]] = []
    try:
        raw = list(DDGS(timeout=5).text(query, max_results=ddgs_count))
    except Exception as e:
        logger.warning(f"DuckDuckGo search failed for '{query[:60]}': {e}")
        try:
            raw = list(DDGS(timeout=6).text(query, max_results=max_results))
        except Exception as e2:
            logger.warning(f"DuckDuckGo retry also failed: {e2}")
            return _search_wikipedia(query, max_results, _get_http=_get_http)

    seen_urls: set[str] = set()
    results: list[dict[str, Any]] = []
    for r in raw:
        title = _clean(r.get("title", ""))
        url = _clean(r.get("href", ""))
        snippet = _clean(r.get("body", ""))

        if not title or not url:
            continue
        if url in seen_urls:
            continue
        seen_urls.add(url)

        results.append({"title": title, "url": url, "snippet": snippet})
        if len(results) >= max_results:
            break

    if not results:
        return _search_wikipedia(query, max_results, _get_http=_get_http)

    return results


# ── Image search ────────────────────────────────────────────────────────

_IMAGE_SEARCH_TIMEOUT = 4.0


def search_images(query: str, max_results: int = 4) -> list[dict[str, Any]]:
    """Search DuckDuckGo for images related to the query.

    Returns a list of image result dicts with: title, imageUrl, thumbnailUrl,
    sourceUrl, width, height. Runs in parallel with text search.
    """
    q = (query or "").strip()
    if not q:
        return []

    try:
        raw = list(DDGS(timeout=_IMAGE_SEARCH_TIMEOUT).images(q, max_results=max_results))
    except Exception as e:
        logger.warning(f"DuckDuckGo image search failed for '{q[:60]}': {e}")
        return []

    results: list[dict[str, Any]] = []
    for r in raw:
        image_url = _clean(r.get("image", ""))
        thumbnail = _clean(r.get("thumbnail", ""))
        if not image_url or not thumbnail:
            continue
        results.append({
            "title": _clean(r.get("title", "")),
            "imageUrl": image_url,
            "thumbnailUrl": thumbnail,
            "sourceUrl": _clean(r.get("url", "")),
            "width": r.get("width"),
            "height": r.get("height"),
        })
        if len(results) >= max_results:
            break

    if results:
        logger.info(f"Image search returned {len(results)} results for: {q[:60]}")
    return results


# ── Core search ──────────────────────────────────────────────────────────

def search(query: str, max_results: int = _MAX_RESULTS_DEFAULT) -> list[dict[str, Any]]:
    """Search the web with query refinement, multi-angle search, and quality scoring.

    For complex queries (contains "vs", commas, or >80 chars), splits into
    2-3 sub-queries and runs parallel DuckDuckGo searches. Results are merged,
    deduplicated, quality-scored, and ranked.

    Args:
        query: Raw user query (refined before searching).
        max_results: Max results to return (default 6, capped at 15).

    Returns:
        List of dicts with keys: title, url, snippet, quality (0-5).
    """
    raw_q = (query or "").strip()
    if not raw_q:
        return []

    max_results = max(1, min(max_results, 15))

    # Check cache
    cache_key = raw_q.lower()
    now = time.time()
    if cache_key in _cache:
        ts, cached = _cache[cache_key]
        if now - ts < _CACHE_TTL_SECONDS:
            logger.info(f"Web search cache hit for: {raw_q[:60]} ({len(cached)} results)")
            return cached[:max_results]

    # Refine
    q = refine_query(raw_q)
    if q != raw_q:
        logger.info(f"Query refined: {raw_q[:80]} → {q[:80]}")

    # Try AI-generated search queries (fast LLM call, ~1-2s)
    ai_queries = _generate_search_queries(raw_q)
    if ai_queries:
        sub_queries = ai_queries
        multi_angle = len(sub_queries) > 1
    else:
        # Fall back to regex-based splitting
        sub_queries = _split_query(q)
        multi_angle = len(sub_queries) > 1

    if multi_angle:
        logger.info(f"Search queries ({len(sub_queries)}): {sub_queries}")

    # Run searches — skip thread pool for single queries (faster + test-friendly)
    all_results: list[list[dict[str, Any]]] = []
    if len(sub_queries) == 1:
        per_query = max_results + 2
        all_results.append(_search_single(sub_queries[0], per_query))
    else:
        per_query = max(3, max_results // len(sub_queries) + 2)
        with ThreadPoolExecutor(max_workers=min(_SEARCH_WORKERS, len(sub_queries))) as pool:
            futures = {pool.submit(_search_single, sq, per_query): sq for sq in sub_queries}
            try:
                for future in as_completed(futures, timeout=10):
                    try:
                        all_results.append(future.result())
                    except Exception as e:
                        logger.warning(f"Sub-search failed for '{futures[future][:60]}': {e}")
            except FuturesTimeoutError:
                logger.warning(
                    f"Search timed out waiting for sub-queries: "
                    f"{len(futures) - len(all_results)}/{len(futures)} incomplete"
                )

    # Merge, score, rank
    results = _merge_and_rank(all_results, q, max_results)

    if results:
        sources = "multi-angle" if multi_angle else "single"
        logger.info(
            f"Search ({sources}): {len(sub_queries)} q → {sum(len(b) for b in all_results)} raw "
            f"→ {len(results)} ranked for: {raw_q[:60]}"
        )
        _cache_put(cache_key, (now, results))
    else:
        logger.info(f"Search returned 0 results for: {raw_q[:60]}")

    return results


# ── Async search ──────────────────────────────────────────────────────────

async def search_async(query: str, max_results: int = _MAX_RESULTS_DEFAULT) -> list[dict[str, Any]]:
    """Async version of ``search()`` — runs sub-searches concurrently via asyncio.

    Uses ``asyncio.to_thread`` for each sub-search so the event loop isn't
    blocked. Falls back to sync ``search()`` for single sub-queries (lower
    overhead).
    """
    raw_q = (query or "").strip()
    if not raw_q:
        return []

    max_results = max(1, min(max_results, 15))

    # Check cache
    cache_key = raw_q.lower()
    now = time.time()
    if cache_key in _cache:
        ts, cached = _cache[cache_key]
        if now - ts < _CACHE_TTL_SECONDS:
            logger.info(f"Web search cache hit for: {raw_q[:60]} ({len(cached)} results)")
            return cached[:max_results]

    # Refine
    q = refine_query(raw_q)
    if q != raw_q:
        logger.info(f"Query refined: {raw_q[:80]} → {q[:80]}")

    # Try AI-generated search queries (async, with fast timeout)
    ai_queries = await _generate_search_queries_async(raw_q)
    if ai_queries:
        sub_queries = ai_queries
        multi_angle = len(sub_queries) > 1
    else:
        sub_queries = _split_query(q)
        multi_angle = len(sub_queries) > 1

    if multi_angle:
        logger.info(f"Search queries ({len(sub_queries)}): {sub_queries}")

    # Run searches concurrently via asyncio
    all_results: list[list[dict[str, Any]]] = []
    if len(sub_queries) == 1:
        per_query = max_results + 2
        batch = await asyncio.to_thread(_search_single, sub_queries[0], per_query)
        all_results.append(batch)
    else:
        per_query = max(3, max_results // len(sub_queries) + 2)
        tasks = [
            asyncio.to_thread(_search_single, sq, per_query)
            for sq in sub_queries[: _SEARCH_WORKERS]
        ]
        done, _pending = await asyncio.wait(tasks, timeout=10.0)
        for t in done:
            try:
                all_results.append(t.result())
            except Exception as e:
                logger.warning(f"Sub-search failed: {e}")

    # Merge, score, rank
    results = _merge_and_rank(all_results, q, max_results)

    if results:
        sources = "multi-angle" if multi_angle else "single"
        logger.info(
            f"Search ({sources}): {len(sub_queries)} q → {sum(len(b) for b in all_results)} raw "
            f"→ {len(results)} ranked for: {raw_q[:60]}"
        )
        _cache_put(cache_key, (now, results))
    else:
        logger.info(f"Search returned 0 results for: {raw_q[:60]}")

    return results


def clear_cache() -> None:
    """Clear the in-memory search cache (useful for testing)."""
    _cache.clear()
    logger.info("Web search cache cleared")
