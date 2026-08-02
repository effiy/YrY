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
import html2text as h2t
from bs4 import BeautifulSoup
from fastapi import APIRouter, Body

from domain.search import search as do_search
from shared.response import success

logger = logging.getLogger(__name__)
router = APIRouter()

_FETCH_TIMEOUT = 15.0
_FETCH_MAX_BYTES = 512 * 1024  # 512KB
_FETCH_OUTPUT_MAX_CHARS = 8000
_CACHE_TTL_SECONDS = 300  # 5 minutes

_FETCH_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/120.0.0.0 Safari/537.36"
    )
}

# ── In-memory fetch cache ──────────────────────────────────────────────

# {normalized_url: (timestamp, data_dict)}
_fetch_cache: Dict[str, Tuple[float, dict]] = {}


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


# ── Jina Reader extraction ─────────────────────────────────────────────

_JINA_URL = "https://r.jina.ai/"

_JINA_HEADERS = {
    "Accept": "text/markdown",
    "X-No-Cache": "true",
}

# Noise elements stripped from HTML before text conversion
_NOISE_TAGS = {"script", "style", "nav", "footer", "header", "aside", "noscript", "iframe", "form", "button"}

# CSS selectors for elements to remove (cookie banners, auth prompts, etc.)
# Be careful NOT to include content-wrapper classes like ".application-main" (GitHub).
_NOISE_SELECTORS = [
    "[role='banner']",
    "[role='navigation']",
    ".Header", ".header", ".Header-old",
    ".gh-header", ".gh-header-sticky",
    "#github-header", "#header",
    ".signup-prompt", ".signup-prompt-bg",
    ".js-header-wrapper", ".Header-wrapper",
    ".cookie-consent", ".consent-banner",
    ".notification-shelf", ".flash",
    ".AppHeader", ".AppHeader-globalBar",
    ".js-notification-shelf", ".top-0",
]

# Selectors for finding the main content area
_CONTENT_SELECTORS = [
    "main",
    "article",
    "[role='main']",
    ".markdown-body",
    ".main-content",
    "#main-content",
    ".content",
    "#content",
    ".post-content",
    ".entry-content",
    ".article-content",
    "#readme",
    ".Box-row",
    ".repository-content",
]


# ── HTML extraction (BeautifulSoup + html2text) ──────────────────────────


def _extract_text_bs(html: str, max_chars: int = _FETCH_OUTPUT_MAX_CHARS) -> str:
    """Extract readable text from HTML, targeting the main content area.

    Strategy:
      1. Find ``<main>``, ``<article>``, or content-class divs — extract only that.
      2. Remove nav headers, cookie banners, GitHub auth prompts, etc.
      3. Convert remaining HTML to Markdown via ``html2text``.
      4. Collapse long link lists (e.g. language selectors).
    """
    try:
        soup = BeautifulSoup(html, "lxml")
    except Exception:
        soup = BeautifulSoup(html, "html.parser")

    # ── Remove noise by tag ──
    for tag in soup(_NOISE_TAGS):
        tag.decompose()

    # ── Remove noise by CSS selector ──
    for selector in _NOISE_SELECTORS:
        try:
            for el in soup.select(selector):
                el.decompose()
        except Exception:
            pass

    # ── Find main content area ──
    content_root = None
    for selector in _CONTENT_SELECTORS:
        try:
            found = soup.select_one(selector)
            if found:
                # Heuristic: the content area should have meaningful text
                text_sample = found.get_text(strip=True)
                if len(text_sample) > 200:  # Reasonable minimum
                    content_root = found
                    break
        except Exception:
            continue

    if content_root is None:
        content_root = soup.body if soup.body else soup

    # ── Collapse long link lists ──
    # Detect sequences of many consecutive links (like language selectors)
    # and truncate them to save character budget for real content.
    _collapse_link_lists(content_root)

    # ── Convert to markdown ──
    converter = h2t.HTML2Text()
    converter.ignore_links = False
    converter.ignore_images = True
    converter.body_width = 0
    converter.skip_internal_links = True
    converter.mark_code = True
    try:
        text = converter.handle(str(content_root))
    except Exception:
        text = content_root.get_text(separator="\n", strip=True)

    # ── Post-process ──
    text = re.sub(r"\n{3,}", "\n\n", text)
    text = text.strip()

    if len(text) > max_chars:
        text = text[:max_chars] + f"\n\n... (truncated at {max_chars} chars)"

    return text


def _collapse_link_lists(root) -> None:
    """Detect long runs of consecutive links and collapse them.

    When a parent element contains 20+ ``<a>`` tags as its primary children,
    the links are removed to save character budget for real content.
    This handles cases like GitHub's language selector (100+ links).
    """
    from bs4 import Tag

    for parent in list(root.descendants):
        if not isinstance(parent, Tag):
            continue
        children = [c for c in parent.children if isinstance(c, Tag)]
        if len(children) < 20:
            continue
        link_count = sum(1 for c in children if c.name == "a")
        if link_count < 20:
            continue
        # Remove all direct-child <a> tags to collapse the list
        for child in children:
            if child.name == "a":
                child.decompose()


async def _fetch_via_jina(url: str) -> Tuple[Optional[str], Optional[str]]:
    """Fetch URL content via Jina Reader (https://r.jina.ai/).

    Returns (content, error). Content is clean Markdown on success.
    Error is None on success, or a string describing the failure.
    Returns (None, error) if Jina Reader fails.
    """
    jina_url = f"{_JINA_URL}{url}"
    timeout = aiohttp.ClientTimeout(total=_FETCH_TIMEOUT)
    try:
        async with aiohttp.ClientSession(
            timeout=timeout, headers=_JINA_HEADERS
        ) as session:
            async with session.get(jina_url) as resp:
                if resp.status >= 400:
                    return None, f"Jina Reader HTTP {resp.status}"
                text = await resp.text()

        # Jina returns markdown with a "Markdown Content:" marker
        marker = "Markdown Content:"
        idx = text.find(marker)
        content = text[idx + len(marker):].strip() if idx >= 0 else text.strip()

        # Heuristic: Jina failed if content is too short or a loading message
        if len(content) < 100:
            return None, "Jina Reader returned too little content"
        if content.startswith("Loading...") or "Please enable JavaScript" in content[:200]:
            return None, "Jina Reader could not render page"

        # Truncate if needed
        if len(content) > _FETCH_OUTPUT_MAX_CHARS:
            content = content[:_FETCH_OUTPUT_MAX_CHARS] + "\n\n... (truncated)"

        logger.info(f"Jina Reader success for: {url[:80]}")
        return content, None

    except asyncio.TimeoutError:
        return None, "Jina Reader timed out"
    except Exception as e:
        logger.warning(f"Jina Reader failed for {url[:80]}: {e}")
        return None, str(e)


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
        _fetch_cache[cache_key] = (now, result)
        return success(data=result)
    if jina_err:
        errors.append(f"Jina: {jina_err}")

    # ── Layer 2: Direct HTTP fetch + BeautifulSoup extraction ─────────
    timeout = aiohttp.ClientTimeout(total=_FETCH_TIMEOUT)
    try:
        async with aiohttp.ClientSession(
            timeout=timeout, headers=_FETCH_HEADERS
        ) as session:
            async with session.get(u) as resp:
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
                        pass
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
                _fetch_cache[cache_key] = (now, result)
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
    _fetch_cache[cache_key] = (now, result)
    return success(data=result)
