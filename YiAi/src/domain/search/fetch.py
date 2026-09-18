"""Web fetch utilities — shared by the search route and agent tools.

Extracted from ``server/routes/search.py`` so that ``domain/ai/tools/builtin.py``
can import fetch helpers without depending on the server layer.

Constants, HTML extraction, and Jina Reader live here. Caching and HTTP-routing
concerns stay in the route layer.
"""

from __future__ import annotations

import asyncio
import logging
import re
from typing import Optional, Tuple

import aiohttp
from bs4 import BeautifulSoup, Tag
import html2text as h2t

logger = logging.getLogger(__name__)

# ── Constants ───────────────────────────────────────────────────────────────

FETCH_TIMEOUT = 10.0
FETCH_MAX_BYTES = 512 * 1024  # 512KB
FETCH_OUTPUT_MAX_CHARS = 8000

FETCH_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/120.0.0.0 Safari/537.36"
    )
}

# ── Shared HTTP session ─────────────────────────────────────────────────────

_session: aiohttp.ClientSession | None = None


def _get_session() -> aiohttp.ClientSession:
    """Get or create a reusable aiohttp session with connection pooling."""
    global _session
    if _session is None or _session.closed:
        connector = aiohttp.TCPConnector(limit=10, limit_per_host=5, ttl_dns_cache=300)
        _session = aiohttp.ClientSession(connector=connector)
    return _session


# ── Jina Reader ─────────────────────────────────────────────────────────────

_JINA_URL = "https://r.jina.ai/"

_JINA_HEADERS = {
    "Accept": "text/markdown",
    "X-No-Cache": "true",
}


async def fetch_via_jina(url: str) -> tuple[str | None, str | None]:
    """Fetch URL content via Jina Reader (https://r.jina.ai/).

    Returns (content, error). Content is clean Markdown on success.
    Error is None on success, or a string describing the failure.
    Returns (None, error) if Jina Reader fails.
    """
    jina_url = f"{_JINA_URL}{url}"
    timeout = aiohttp.ClientTimeout(total=FETCH_TIMEOUT)
    try:
        async with _get_session().get(jina_url, headers=_JINA_HEADERS, timeout=timeout) as resp:
            if resp.status >= 400:
                return None, f"Jina Reader HTTP {resp.status}"
            text = await resp.text()

        marker = "Markdown Content:"
        idx = text.find(marker)
        content = text[idx + len(marker):].strip() if idx >= 0 else text.strip()

        if len(content) < 100:
            return None, "Jina Reader returned too little content"
        if content.startswith("Loading...") or "Please enable JavaScript" in content[:200]:
            return None, "Jina Reader could not render page"

        if len(content) > FETCH_OUTPUT_MAX_CHARS:
            content = content[:FETCH_OUTPUT_MAX_CHARS] + "\n\n... (truncated)"

        logger.info(f"Jina Reader success for: {url[:80]}")
        return content, None

    except asyncio.TimeoutError:
        return None, "Jina Reader timed out"
    except Exception as e:
        logger.warning(f"Jina Reader failed for {url[:80]}: {e}")
        return None, str(e)


# ── HTML extraction ─────────────────────────────────────────────────────────

_NOISE_TAGS = {"script", "style", "nav", "footer", "header", "aside", "noscript", "iframe", "form", "button"}

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


def _collapse_link_lists(root) -> None:
    """Detect long runs of consecutive <a> tags and collapse them."""
    for parent in list(root.descendants):
        if not isinstance(parent, Tag):
            continue
        children = [c for c in parent.children if isinstance(c, Tag)]
        if len(children) < 20:
            continue
        link_count = sum(1 for c in children if c.name == "a")
        if link_count < 20:
            continue
        for child in children:
            if child.name == "a":
                child.decompose()


def extract_text_bs(html: str, max_chars: int = FETCH_OUTPUT_MAX_CHARS) -> str:
    """Extract readable text from HTML, targeting the main content area.

    Strategy:
      1. Find <main>, <article>, or content-class divs — extract only that.
      2. Remove nav headers, cookie banners, auth prompts, etc.
      3. Convert remaining HTML to Markdown via html2text.
      4. Collapse long link lists (e.g. language selectors).
    """
    try:
        soup = BeautifulSoup(html, "lxml")
    except Exception:
        soup = BeautifulSoup(html, "html.parser")

    for tag in soup(_NOISE_TAGS):
        tag.decompose()

    for selector in _NOISE_SELECTORS:
        try:
            for el in soup.select(selector):
                el.decompose()
        except Exception:
            logger.debug("Failed to remove HTML element with selector", exc_info=True)

    content_root = None
    for selector in _CONTENT_SELECTORS:
        try:
            found = soup.select_one(selector)
            if found:
                text_sample = found.get_text(strip=True)
                if len(text_sample) > 200:
                    content_root = found
                    break
        except Exception:
            logger.debug("Failed to extract text, skipping selector", exc_info=True)
            continue

    if content_root is None:
        content_root = soup.body if soup.body else soup

    _collapse_link_lists(content_root)

    converter = h2t.HTML2Text()
    converter.ignore_links = False
    converter.ignore_images = True
    converter.body_width = 0
    converter.skip_internal_links = True
    try:
        text = converter.handle(str(content_root))
    except Exception:
        text = content_root.get_text(separator="\n", strip=True)

    text = re.sub(r"\n{3,}", "\n\n", text)
    text = text.strip()

    if len(text) > max_chars:
        text = text[:max_chars] + f"\n\n... (truncated at {max_chars} chars)"

    return text
