"""Web search and fetch tools for the agent — web_search, web_fetch."""

import logging
import re
from typing import Any

import aiohttp

from domain.ai.tools.core import ToolDefinition, ToolRegistry, _is_url_allowed
from shared.url_guard import is_private_url

logger = logging.getLogger(__name__)


def register_web_tools(registry: ToolRegistry) -> None:
    """Register web search and fetch tools."""

    # ── web_search ──────────────────────────────────────────────────────
    async def _web_search(args: dict[str, Any]) -> dict[str, Any]:
        from domain.search import search_async
        query = str(args.get("query", "")).strip()
        max_results = min(int(args.get("max_results", 6)), 10)
        if not query:
            return {"content": "", "error": "No query provided"}
        results = await search_async(query, max_results=max_results)
        if not results:
            return {"content": f"No results found for: {query}"}
        lines = [f"Web search results for '{query}':"]
        for i, r in enumerate(results, 1):
            lines.append(f"{i}. {r.get('title', '')} — {r.get('url', '')}")
            if r.get("snippet"):
                lines.append(f"   {r['snippet']}")
        return {"content": "\n".join(lines), "details": results}

    registry.register(ToolDefinition(
        name="web_search",
        description="Search the web for current information. Returns titles, URLs, and descriptions.",
        parameters={
            "type": "object",
            "properties": {
                "query": {"type": "string", "description": "The search query"},
                "max_results": {"type": "integer", "description": "Max results (1-10, default 6)"},
            },
            "required": ["query"],
        },
        execute=_web_search,
    ))

    # ── web_fetch ───────────────────────────────────────────────────────
    async def _web_fetch(args: dict[str, Any], on_progress=None) -> dict[str, Any]:
        url = str(args.get("url", "")).strip()
        if not url:
            return {"content": "", "error": "No URL provided"}
        if not url.startswith(("http://", "https://")):
            url = "https://" + url
        if not _is_url_allowed(url):
            return {"content": "", "error": f"Access denied: URL '{url}' is not in the allowed domains list"}
        if is_private_url(url):
            return {"content": "", "error": f"Access denied: URL '{url}' resolves to a private/internal address"}

        async def _progress(msg: str) -> None:
            if on_progress:
                await on_progress({"content": msg, "url": url})

        from domain.search.fetch import (
            FETCH_HEADERS,
            FETCH_MAX_BYTES,
            FETCH_OUTPUT_MAX_CHARS,
            extract_text_bs,
            fetch_via_jina,
        )

        # Try Jina Reader first
        await _progress("Fetching via Jina Reader...")
        jina_text, jina_err = await fetch_via_jina(url)
        if jina_text is not None:
            await _progress(f"Jina fetched {len(jina_text)} chars")
            return {"content": jina_text, "details": {"url": url, "source": "jina"}}

        # Fallback to direct fetch
        await _progress("Jina unavailable, trying direct fetch...")
        timeout = aiohttp.ClientTimeout(total=15.0)
        try:
            async with aiohttp.ClientSession(timeout=timeout, headers=FETCH_HEADERS) as session, session.get(url) as resp:
                if resp.status >= 400:
                    return {"content": "", "error": f"HTTP {resp.status}"}
                ct = (resp.headers.get("Content-Type") or "").lower()
                await _progress(f"Downloading (Content-Type: {ct})...")
                chunks: list[str] = []
                total = 0
                async for chunk, _ in resp.content.iter_chunks():
                    try:
                        chunks.append(chunk.decode("utf-8", errors="replace"))
                    except UnicodeDecodeError:
                        logger.debug("Failed to decode chunk", exc_info=True)
                    total += len(chunk)
                    if total >= FETCH_MAX_BYTES:
                        break
                await _progress(f"Downloaded {total} bytes, extracting text...")
                html = "".join(chunks)
                if "text/html" in ct:
                    text = extract_text_bs(html)
                    await _progress(f"Extracted {len(text)} chars of text")
                    return {"content": text, "details": {"url": url, "source": "beautifulsoup"}}
                text = re.sub(r"\s+", " ", html).strip()
                if len(text) > FETCH_OUTPUT_MAX_CHARS:
                    text = text[:FETCH_OUTPUT_MAX_CHARS]
                await _progress(f"Plaintext: {len(text)} chars")
                return {"content": text, "details": {"url": url, "source": "plaintext"}}
        except Exception as e:
            return {"content": "", "error": f"Fetch failed: {e}"}

    registry.register(ToolDefinition(
        name="web_fetch",
        description="Fetch and extract text content from a URL. Returns clean markdown or plain text.",
        parameters={
            "type": "object",
            "properties": {
                "url": {"type": "string", "description": "The URL to fetch content from"},
            },
            "required": ["url"],
        },
        execute=_web_fetch,
    ))
