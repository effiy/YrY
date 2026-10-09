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
from urllib.parse import urlparse, urlunparse

import aiohttp
from fastapi import APIRouter, Body

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
from shared.url_guard import is_private_url

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

    # SSRF guard — block requests to private/reserved IPs
    if is_private_url(u):
        logger.warning(f"Blocked SSRF attempt: {u[:100]}")
        return success(data={"text": "", "url": u, "error": "URL resolves to a private/internal address"})

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


@router.post("/search/unified", operation_id="unified_search")
async def unified_search_route(
    query: str = Body(..., embed=True),
    collections: list[str] | None = Body(None, embed=True),
    limit: int = Body(40, embed=True),
    version: int = Body(2, embed=True),
    include_archive: bool = Body(False, embed=True),
):
    """Search across internal collections (issues, projects, modules, bugs, pages).

    Runs all collection searches in parallel with relevance scoring.
    Returns ranked, deduplicated results with timing metadata.

    Response contract (version >= 2):
      * Backend does NOT emit `link`. The frontend Link Factory derives the URL
        from `{type, key}` using `authMenuList` as the source of truth. This
        decouples route refactors (:id vs :key renames, new detail pages,
        renamed modules) from backend redeploys — the #1 historical root cause
        of search → 404 drift in v1.
      * Every row guarantees `key != ""` (stable synthetic keys for legacy pages
        without real keys). Deleted/archived/tombstoned documents are filtered
        upstream, so "ghost" entries that 404 on click stop reaching the user.

    Version 1 (legacy): preserved for pre-v2.3 frontend builds. Returns the
    original `link`-carrying envelope (wrong-links-and-all — callers accept the
    contract in exchange for zero code change). Deployments are expected to
    migrate to `version=2` once their frontend ships the Link Factory.
    """

    try:
        from domain.search.unified_search import unified_search, SEARCH_INDEX_VERSION

        data = await asyncio.wait_for(
            unified_search(
                query,
                collections=collections,
                limit=limit,
                include_archive=include_archive,
            ),
            timeout=12.0,
        )
        if (version or 2) < 2:
            # Legacy envelope — DO NOT add new fields here. Keep the shape
            # identical to what older YiVad frontends expect.
            legacy: dict[str, Any] = {"results": list(data.get("results", [])), "timing": data.get("timing", {})}
            # Backfill `link` for v1 callers. The synthetic URLs below are
            # intentionally minimal; v1 callers already accept wrong-links as a
            # known class of bugs. Newer callers must use version >= 2.
            legacy_map = {
                "issue": "issue",
                "project": "project",
                "module": "module",
                "bug": "bug",
                "page": "page",
            }
            for row in legacy["results"]:
                row_type = str(row.get("type") or "")
                key = str(row.get("key") or "")
                row["link"] = f"/{legacy_map.get(row_type, row_type)}/{key}" if key else "/"
            return success(data=legacy)

        # Normal v2 envelope — `link` is intentionally absent. Stash index
        # version in `meta` so the frontend can detect drift and prompt a
        # reload when we ship contract-breaking search updates.
        envelope = dict(data)
        envelope.setdefault("meta", {})
        envelope["meta"]["index_version"] = (envelope.get("meta") or {}).get("index_version") or SEARCH_INDEX_VERSION
        return success(data=envelope)
    except asyncio.TimeoutError:
        logger.warning(f"Unified search timed out for: {query[:60]}")
        return success(
            data={
                "results": [],
                "timing": {"total_ms": 0, "error": "Search timed out"},
                "meta": {"index_version": 2, "ghost_filtered_count": 0},
            }
        )
    except Exception as e:
        logger.exception(f"Unified search failed: {e}")
        return success(
            data={
                "results": [],
                "timing": {"total_ms": 0, "error": str(e)},
                "meta": {"index_version": 2, "ghost_filtered_count": 0},
            }
        )
