"""Web search and URL fetch endpoints.

POST /web-search  { query: str, max_results?: int }  → search results
POST /web-fetch   { url: str }                        → page text content

Content extraction uses a multi-layer pipeline inspired by Pi's web tools
(``coctostan/pi-web-tools``):
  1. Jina Reader (primary) — clean markdown, handles JS-heavy sites
  2. Direct HTTP fetch + BeautifulSoup + html2text (fallback)
  3. Error with helpful message (if both fail)

Results are cached in-memory with a TTL of 300s to avoid redundant fetches.
"""

import asyncio
import logging
import re
import time
from typing import Dict, Optional, Tuple
from urllib.parse import urlparse, urlunparse

import aiohttp
from bs4 import BeautifulSoup
from fastapi import APIRouter, Body
import html2text as h2t

from domain.search import refine_query, search_images
from domain.search import search as do_search
from domain.search.fetch import (
    FETCH_HEADERS as _FETCH_HEADERS,
)
from domain.search.fetch import (
    FETCH_MAX_BYTES as _FETCH_MAX_BYTES,
)
from domain.search.fetch import (
    FETCH_OUTPUT_MAX_CHARS as _FETCH_OUTPUT_MAX_CHARS,
)
from domain.search.fetch import (
    FETCH_TIMEOUT as _FETCH_TIMEOUT,
)
from domain.search.fetch import (
    _get_session,
)
from domain.search.fetch import (
    extract_text_bs as _extract_text_bs,
)
from domain.search.fetch import (
    fetch_via_jina as _fetch_via_jina,
)
from shared.response import success

logger = logging.getLogger(__name__)
router = APIRouter()

_CACHE_TTL_SECONDS = 300  # 5 minutes

# ── In-memory fetch cache ──────────────────────────────────────────────

_MAX_CACHE_SIZE = 200

# {normalized_url: (timestamp, data_dict)}
_fetch_cache: dict[str, tuple[float, dict]] = {}

def _cache_put(key: str, value: tuple[float, dict]) -> None:
    """Add to cache with LRU eviction when exceeding _MAX_CACHE_SIZE."""
    if len(_fetch_cache) >= _MAX_CACHE_SIZE:
        oldest = next(iter(_fetch_cache))
        del _fetch_cache[oldest]
    _fetch_cache[key] = value


def _normalize_url(url: str) -> str:
    """Lowercase scheme+host, strip trailing slash, drop default ports."""
    try:
        p = urlparse(url.strip())
        scheme = p.scheme.lower()
        host = p.hostname.lower() if p.hostname else ""
        port = p.port
        # Drop default ports
        if (scheme == "http" and port == 80) or (scheme == "https" and port == 443):
            port = None
        netloc = f"{host}:{port}" if port else host
        path = p.path.rstrip("/") if p.path != "/" else p.path
        # Rebuild canonical URL without fragment
        return urlunparse((scheme, netloc, path, p.params, p.query, ""))
    except Exception:
        return url.strip().rstrip("/")



@router.post("/web-search", operation_id="web_search")
async def web_search_route(
    query: str = Body(..., embed=True),
    max_results: int = Body(6, embed=True),
):
    """Search the web via DuckDuckGo (ddgs library) and return results."""
    try:
        # Run text + image search in parallel
        text_task = asyncio.to_thread(do_search, query, max_results=max_results)
        image_task = asyncio.to_thread(search_images, query, max_results=4)
        results, images = await asyncio.wait_for(
            asyncio.gather(text_task, image_task, return_exceptions=True),
            timeout=8.0,
        )
        if isinstance(results, BaseException):
            results = []
        if isinstance(images, BaseException):
            images = []
        refined = refine_query(query) if query else ""
        return success(data={"results": results, "images": images, "query": refined if refined != query else query})
    except asyncio.TimeoutError:
        logger.warning(f"Web search timed out for: {query[:60]}")
        return success(data={"results": [], "images": [], "query": query, "error": "Search timed out"})
    except Exception as e:
        logger.exception(f"Web search failed: {e}")
        return success(data={"results": [], "images": [], "query": query, "error": str(e)})


@router.post("/web-fetch", operation_id="web_fetch")
async def web_fetch_route(
    url: str = Body(..., embed=True),
):
    """Fetch a URL and return extracted text content.

    Extraction pipeline (each layer tried in order):
      1. Jina Reader (``https://r.jina.ai/<url>``) — clean markdown
      2. Direct HTTP fetch + BeautifulSoup + html2text — improved HTML → Markdown
      3. Error — if all layers fail

    Results are cached in-memory for 5 minutes.
    """
    u = (url or "").strip()
    if not u:
        return success(data={"text": "", "url": u, "error": "No URL provided"})

    # Basic URL validation
    if not u.startswith(("http://", "https://")):
        u = "https://" + u

    # Check cache
    cache_key = _normalize_url(u)
    now = time.time()
    if cache_key in _fetch_cache:
        ts, cached = _fetch_cache[cache_key]
        if now - ts < _CACHE_TTL_SECONDS:
            logger.info(f"Web fetch cache hit for: {u[:80]}")
            return success(data=cached)

    result: dict = {"text": "", "url": u, "error": None}
    errors: list[str] = []

    # ── Layer 1: Jina Reader ──────────────────────────────────────────
    jina_text, jina_err = await _fetch_via_jina(u)
    if jina_text is not None:
        result = {"text": jina_text, "url": u, "source": "jina", "error": None}
        _cache_put(cache_key, (now, result))
        return success(data=result)
    if jina_err:
        errors.append(f"Jina: {jina_err}")

    # ── Layer 2: Direct HTTP fetch + BeautifulSoup extraction ─────────
    timeout = aiohttp.ClientTimeout(total=_FETCH_TIMEOUT)
    try:
        async with _get_session().get(u, headers=_FETCH_HEADERS, timeout=timeout) as resp:
            if resp.status >= 400:
                errors.append(f"HTTP {resp.status}")
                raise aiohttp.ClientResponseError(
                    resp.request_info, resp.history, status=resp.status
                )
            ct = (resp.headers.get("Content-Type") or "").lower()
            if "text/html" not in ct and "text/plain" not in ct:
                errors.append(f"Unsupported content type: {ct}")
                raise ValueError(f"Unsupported content type: {ct}")

            chunks: list[str] = []
            total = 0
            async for chunk, _ in resp.content.iter_chunks():
                try:
                    chunks.append(chunk.decode("utf-8", errors="replace"))
                except Exception:
                    logger.debug("Failed to decode chunk in search fetch", exc_info=True)
                total += len(chunk)
                if total >= _FETCH_MAX_BYTES:
                    break
            html = "".join(chunks)

            if "text/html" in ct:
                text = _extract_text_bs(html)
                source = "beautifulsoup"
            else:
                # Plain text — keep as-is
                text = re.sub(r"\s+", " ", html).strip()
                if len(text) > _FETCH_OUTPUT_MAX_CHARS:
                    text = text[:_FETCH_OUTPUT_MAX_CHARS] + "\n\n... (truncated)"
                source = "plaintext"

            result = {"text": text, "url": u, "source": source, "error": None}
            _cache_put(cache_key, (now, result))
            return success(data=result)

    except (asyncio.TimeoutError, aiohttp.ClientResponseError, ValueError) as e:
        err_msg = str(e) if str(e) else type(e).__name__
        errors.append(err_msg)
        logger.warning(f"Direct fetch failed for {u[:80]}: {err_msg}")
    except Exception as e:
        errors.append(str(e))
        logger.warning(f"Direct fetch failed for {u[:80]}: {e}")

    # ── All layers failed ─────────────────────────────────────────────
    error_summary = "; ".join(errors) if errors else "All extraction methods failed"
    result = {"text": "", "url": u, "source": None, "error": error_summary}
    # Cache error results too, so we don't retry immediately
    _cache_put(cache_key, (now, result))
    return success(data=result)


# ── Compaction endpoint ──────────────────────────────────────────────────


@router.post("/compact", operation_id="compact_conversation")
async def compact_route(
    messages: list = Body(..., embed=True),
    keep_last: int = Body(4, embed=True),
):
    """Summarize older messages to keep the conversation within context limits.

    Pi-inspired: ``shouldCompact()`` + ``compact_messages()`` pattern.
    Returns the compacted message list (summary + recent messages).
    """
    try:
        from services.ai.compaction import compact_messages

        compacted = await compact_messages(
            messages,
            keep_last=keep_last,
        )
        return success(data={"messages": compacted, "original_count": len(messages), "compacted_count": len(compacted)})
    except Exception as e:
        logger.exception(f"Compaction failed: {e}")
        return success(data={"messages": messages, "error": str(e)})
