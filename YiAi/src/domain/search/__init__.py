"""Web search domain logic.

Uses DuckDuckGo HTML search (no API key required) via aiohttp.
Returns structured results: [{title, url, snippet}].

No external parsing libraries required — uses stdlib `re` + `html.parser`.
"""

import logging
import re
from html.parser import HTMLParser
from typing import List, Dict, Any
from urllib.parse import unquote

import aiohttp

logger = logging.getLogger(__name__)

_SEARCH_URL = "https://html.duckduckgo.com/html/"
_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/120.0.0.0 Safari/537.36"
    )
}
_MAX_RESULTS_DEFAULT = 6
_TIMEOUT_SECONDS = 10.0


def _clean_text(text: str) -> str:
    """Collapse whitespace and strip."""
    return re.sub(r"\s+", " ", (text or "").strip())


class _DDGResultParser(HTMLParser):
    """Extract result titles, snippets, and URLs from DuckDuckGo HTML."""

    def __init__(self):
        super().__init__()
        self.results: List[Dict[str, Any]] = []
        self._current: Dict[str, Any] | None = None
        self._in_result = False
        self._in_title = False
        self._in_snippet = False
        self._in_link = False
        self._title_parts: List[str] = []
        self._snippet_parts: List[str] = []
        self._link_href = ""

    def handle_starttag(self, tag: str, attrs: List[tuple]):
        attr_dict = dict(attrs)
        cls = attr_dict.get("class", "")

        if tag == "div" and "result" in cls.split():
            self._in_result = True
            self._current = {"title": "", "url": "", "snippet": ""}
            self._title_parts = []
            self._snippet_parts = []
            self._link_href = ""

        if self._in_result:
            if tag == "a" and "result__a" in cls:
                self._in_title = True
                href = attr_dict.get("href", "")
                self._link_href = href
            elif tag == "a" and "result__snippet" in cls:
                self._in_snippet = True
            elif tag == "a" and not self._in_title and not self._in_snippet:
                # Could be the URL link — grab href if we don't have one yet
                if not self._link_href:
                    self._link_href = attr_dict.get("href", "")

    def handle_endtag(self, tag: str):
        if self._in_result and tag == "div":
            # Check if we're closing the result div
            if self._current is not None and self._in_result:
                title = _clean_text("".join(self._title_parts))
                snippet = _clean_text("".join(self._snippet_parts))
                url = self._link_href.strip()
                # DuckDuckGo wraps URLs with a redirect prefix
                if "uddg=" in url:
                    m = re.search(r"uddg=(https?://[^&]+)", url)
                    if m:
                        url = unquote(m.group(1))
                if title or url:
                    self._current["title"] = title or url
                    self._current["url"] = url
                    self._current["snippet"] = snippet
                    self.results.append(self._current)
            self._in_result = False
            self._in_title = False
            self._in_snippet = False
            self._current = None

        if self._in_title and tag == "a":
            self._in_title = False
        if self._in_snippet and tag == "a":
            self._in_snippet = False

    def handle_data(self, data: str):
        if self._in_title:
            self._title_parts.append(data)
        elif self._in_snippet:
            self._snippet_parts.append(data)


async def search(query: str, max_results: int = _MAX_RESULTS_DEFAULT) -> List[Dict[str, Any]]:
    """Search the web via DuckDuckGo HTML and return structured results.

    Args:
        query: Search query string.
        max_results: Max results to return (default 6, capped at 10).

    Returns:
        List of dicts with keys: title, url, snippet.
    """
    q = (query or "").strip()
    if not q:
        return []

    max_results = max(1, min(max_results, 10))

    timeout = aiohttp.ClientTimeout(total=_TIMEOUT_SECONDS)
    try:
        async with aiohttp.ClientSession(timeout=timeout, headers=_HEADERS) as session:
            form_data = aiohttp.FormData()
            form_data.add_field("q", q)
            async with session.post(_SEARCH_URL, data=form_data) as resp:
                if resp.status >= 400:
                    logger.warning(f"DuckDuckGo search returned HTTP {resp.status}")
                    return []
                html = await resp.text()
    except Exception as e:
        logger.warning(f"DuckDuckGo search failed: {e}")
        return []

    try:
        parser = _DDGResultParser()
        parser.feed(html)
        return parser.results[:max_results]
    except Exception as e:
        logger.warning(f"DuckDuckGo HTML parse failed: {e}")
        return []
