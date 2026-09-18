"""Web search domain logic.

Uses the ``ddgs`` library (https://pypi.org/project/ddgs/) which queries
DuckDuckGo via its internal API.  Returns structured results:
  [{title, url, snippet, quality}]

Features:
  - Query refinement: strips conversational filler, adds temporal context
  - Multi-angle search: splits complex queries into parallel sub-searches
  - Quality scoring: rates each result 0-5 on authority + informativeness
  - Wikipedia fallback when DuckDuckGo returns no results
  - TTL-based in-memory cache keyed on the original (unrefined) query
  - Shared ``httpx.Client`` with connection pooling for all outbound HTTP
"""

import logging
import re
import time
from concurrent.futures import ThreadPoolExecutor, TimeoutError as FuturesTimeoutError, as_completed
from datetime import datetime
from typing import List, Dict, Any
from urllib.parse import urlparse

import httpx
from duckduckgo_search import DDGS

from shared.config import settings

logger = logging.getLogger(__name__)

_MAX_RESULTS_DEFAULT = 6
_CACHE_TTL_SECONDS = 300  # 5 minutes
_MAX_CACHE_SIZE = 200
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

# ── Quality scoring ──────────────────────────────────────────────────────

# Domains with known high authority (score +3)
_HIGH_AUTHORITY_DOMAINS = {
    "en.wikipedia.org", "github.com", "stackoverflow.com",
    "developer.mozilla.org", "arxiv.org", "ieeexplore.ieee.org",
    "nature.com", "science.org", "docs.python.org", "nodejs.org",
    "react.dev", "vuejs.org", "typescriptlang.org",
    "learn.microsoft.com", "aws.amazon.com", "cloud.google.com",
    "w3.org", "whatwg.org", "ecma-international.org",
    "dl.acm.org", "semanticscholar.org", "pnas.org", "plos.org",
}

# Domains with low authority (score +0 regardless of content)
_LOW_AUTHORITY_DOMAINS = {
    "pinterest.com", "quora.com", "answers.com", "exampledomain.com",
}


def _get_domain(url: str) -> str:
    try:
        return urlparse(url if "://" in url else f"https://{url}").hostname.lower().replace("www.", "")
    except Exception:
        return ""


def _score_quality(result: dict[str, Any], query: str) -> int:
    """Score a search result 0-5 based on authority + informativeness + recency.

    - Domain authority: 0-3 points
    - Snippet length: 0-2 points (>200 chars=2, >100=1)
    - Title relevance: 0-1 bonus if title contains query keywords
    - Recency: 0-2 bonus for fresh content (today=2, week=1, month=0.5)
    """
    score = 0
    url = result.get("url", "")
    domain = _get_domain(url)

    # Domain authority
    if domain.endswith(".gov") or domain.endswith(".edu") or domain in _HIGH_AUTHORITY_DOMAINS:
        score += 3
    elif domain in _LOW_AUTHORITY_DOMAINS:
        score += 0
    elif domain.endswith(".org"):
        score += 1
    else:
        score += 1  # neutral

    # Snippet informativeness
    snippet = result.get("snippet", "")
    snip_len = len(snippet)
    if snip_len > 200:
        score += 2
    elif snip_len > 100:
        score += 1

    # Title keyword relevance
    title = (result.get("title", "") or "").lower()
    if query:
        q_words = set(query.lower().split()) - {"the", "a", "an", "is", "are", "was", "were"}
        title_words = set(title.split())
        overlap = q_words & title_words
        if len(overlap) >= 3 or len(q_words) <= 3 and overlap:
            score += 1

    # Recency — extract dates from snippet + title, boost fresh content
    recency = _score_recency(snippet, title)
    score += recency

    return min(score, 5)


# ── Recency scoring ──────────────────────────────────────────────────────

import re as _re
from datetime import datetime as _dt, timedelta as _td, timezone as _tz

# Date patterns ordered by reliability — first match wins
_DATE_PATTERNS: list[tuple[_re.Pattern, str]] = [
    (_re.compile(r"(\d{4})-(\d{2})-(\d{2})"), "iso"),           # 2026-09-18
    (_re.compile(r"(\d{1,2})\s+(\w+)\s+(\d{4})"), "named"),     # 18 Sep 2026
    (_re.compile(r"(\w+)\s+(\d{1,2}),?\s+(\d{4})"), "named2"),  # Sep 18, 2026
    (_re.compile(r"(\d{1,2})/(\d{1,2})/(\d{4})"), "us"),        # 9/18/2026
    (_re.compile(r"(\d+)\s+(day|week|month|year)s?\s+ago"), "relative"),  # 3 days ago
]

_MONTH_NAMES = {
    "jan": 1, "january": 1, "feb": 2, "february": 2, "mar": 3, "march": 3,
    "apr": 4, "april": 4, "may": 5, "jun": 6, "june": 6, "jul": 7, "july": 7,
    "aug": 8, "august": 8, "sep": 9, "september": 9, "oct": 10, "october": 10,
    "nov": 11, "november": 11, "dec": 12, "december": 12,
}


def _extract_date(text: str) -> _dt | None:
    """Extract the most recent date from a text snippet. Returns None if no date found."""
    for pattern, kind in _DATE_PATTERNS:
        m = pattern.search(text)
        if not m:
            continue
        try:
            if kind == "iso":
                return _dt(int(m.group(1)), int(m.group(2)), int(m.group(3)), tzinfo=_tz.utc)
            elif kind in ("named", "named2"):
                if kind == "named":
                    day, month_str, year = int(m.group(1)), m.group(2).lower(), int(m.group(3))
                else:
                    month_str, day, year = m.group(1).lower(), int(m.group(2)), int(m.group(3))
                month = _MONTH_NAMES.get(month_str[:3])
                if month:
                    return _dt(year, month, day, tzinfo=_tz.utc)
            elif kind == "us":
                month, day, year = int(m.group(1)), int(m.group(2)), int(m.group(3))
                if 1 <= month <= 12 and 1 <= day <= 31:
                    return _dt(year, month, day, tzinfo=_tz.utc)
            elif kind == "relative":
                n = int(m.group(1))
                unit = m.group(2).lower()
                now = _dt.now(_tz.utc)
                if unit == "day":
                    return now - _td(days=n)
                elif unit == "week":
                    return now - _td(weeks=n)
                elif unit == "month":
                    return now - _td(days=n * 30)
                elif unit == "year":
                    return now - _td(days=n * 365)
        except (ValueError, OverflowError):
            continue
    return None


def _score_recency(snippet: str, title: str) -> float:
    """Score how recent the content is. 0-2 bonus points."""
    date = _extract_date(f"{title} {snippet}")
    if not date:
        return 0.0
    now = _dt.now(_tz.utc)
    age_days = (now - date).days
    if age_days < 0:
        return 0.0  # future date — ignore
    if age_days <= 1:
        return 2.0  # today/yesterday
    if age_days <= 7:
        return 1.0  # this week
    if age_days <= 30:
        return 0.5  # this month
    if age_days <= 365:
        return 0.25  # this year
    return 0.0


# ── Query refinement ─────────────────────────────────────────────────────

_STRIP_PREFIXES = [
    r"^(?:what|who|where|when|why|how)\s+(?:is|are|was|were|do|does|did|can|could|would|should|will|shall)\s+",
    r"^(?:please|can you|could you|would you)\s+(?:tell me|explain|describe|show|find|search for|look up)\s+",
    r"^(?:i want to|i need to|i'm looking for|i am looking for|i'd like to)\s+(?:know|find|learn|understand)\s+(?:about\s+)?",
    r"^(?:tell me|explain|describe|what about|how about)\s+(?:about\s+)?",
]

_FILLER_WORDS = {
    "um", "uh", "like", "just", "really", "basically", "actually",
    "literally", "honestly", "frankly", "apparently", "presumably",
    "the", "a", "an",
}

_TIME_SENSITIVE = re.compile(
    r"\b(latest|newest|current|recent|today|now|this year|this month|"
    r"20\d{2}|update|announce|release|breaking)\b",
    re.IGNORECASE,
)

# Patterns that indicate a multi-faceted query
_MULTI_ANGLE_SEPARATORS = re.compile(r"\b(vs\.?|versus|compared to|or)\b", re.IGNORECASE)
_COMMA_SPLIT = re.compile(r",\s+(?!(?:Inc|Ltd|LLC|Corp|etc|e\.g|i\.e)\b)")


def refine_query(query: str) -> str:
    q = (query or "").strip()
    if len(q) < 3:
        return q

    for pattern in _STRIP_PREFIXES:
        q = re.sub(pattern, "", q, count=1, flags=re.IGNORECASE).strip()

    words = q.split()
    words = [w for w in words if w.lower() not in _FILLER_WORDS]
    q = " ".join(words).strip()
    q = re.sub(r"\?+\s*$", "", q).strip()

    if _TIME_SENSITIVE.search(q) and str(datetime.now().year) not in q:
        q = f"{q} {datetime.now().year}"

    if len(q) > 120:
        q = q[:117].rsplit(" ", 1)[0]

    return q


def _split_query(refined_query: str) -> list[str]:
    """Split a complex query into multiple search angles for better coverage.

    Triggers when the query:
      - Contains "vs" / "versus" / "compared to" → search each side
      - Contains "and" joining two distinct topics
      - Has 2+ comma-separated clauses with ≥4 words each
      - Is longer than 80 characters (likely multi-faceted)
    """
    q = refined_query.strip()
    if len(q) < 20:
        return [q]

    angles: list[str] = []

    # "X vs Y" → search "X", "Y", "X vs Y"
    vs_parts = _MULTI_ANGLE_SEPARATORS.split(q)
    if len(vs_parts) >= 3:
        for part in vs_parts:
            part = part.strip()
            if part.lower() not in ("vs", "vs.", "versus", "compared to", "or") and len(part) > 3:
                angles.append(part)
        if len(angles) >= 2:
            angles.append(q)  # also search the original
            return angles[:3]

    # Comma-separated clauses with substance
    comma_parts = [p.strip() for p in _COMMA_SPLIT.split(q) if len(p.strip().split()) >= 3]
    if len(comma_parts) >= 2:
        for p in comma_parts[:3]:
            angles.append(p)
        return angles[:3]

    # Long query → split in half at natural break points
    if len(q) > 80:
        words = q.split()
        mid = len(words) // 2
        # Try to split at a natural connector
        connectors = {"and", "or", "with", "for", "in", "on", "to", "from"}
        best = mid
        for i in range(max(0, mid - 4), min(len(words), mid + 5)):
            if words[i].lower() in connectors:
                best = i
                break
        first = " ".join(words[:best])
        second = " ".join(words[best + 1:]) if best < len(words) - 1 else " ".join(words[mid:])
        if len(first) > 10 and len(second) > 10:
            angles = [first, second]
            return angles[:2]

    return [q]


# ── Wikipedia fallback ──────────────────────────────────────────────────

_WIKIPEDIA_API = "https://en.wikipedia.org/w/api.php"


def _search_wikipedia(query: str, max_results: int = 6) -> list[dict[str, Any]]:
    q = (query or "").strip()
    if not q:
        return []

    try:
        resp = _get_http().get(
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

        results: list[dict[str, Any]] = []
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


def _clean(text: str) -> str:
    return (text or "").strip()


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
            return _search_wikipedia(query, max_results)

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
        return _search_wikipedia(query, max_results)

    return results


def _merge_and_rank(
    all_results: list[list[dict[str, Any]]],
    query: str,
    max_results: int,
) -> list[dict[str, Any]]:
    """Merge results from multiple sub-searches, deduplicate, score, and rank."""
    seen_urls: set[str] = set()
    merged: list[dict[str, Any]] = []

    for batch in all_results:
        for r in batch:
            url = r.get("url", "")
            if not url or url in seen_urls:
                continue
            seen_urls.add(url)
            r["quality"] = _score_quality(r, query)
            # Attach extracted date for frontend freshness display
            d = _extract_date(f"{r.get('title', '')} {r.get('snippet', '')}")
            if d:
                r["date"] = d.strftime("%Y-%m-%d")
            merged.append(r)

    # Sort: quality desc, then recency (date), then snippet length
    merged.sort(
        key=lambda r: (
            r.get("quality", 0),
            r.get("date", "0000-00-00"),
            len(r.get("snippet", "")),
        ),
        reverse=True,
    )
    # Semantic dedup: remove near-duplicate titles across different domains.
    # Catches syndicated content (same article on multiple sites).
    merged = _deduplicate_by_title(merged)
    return merged[:max_results]


def _title_tokens(title: str) -> set[str]:
    """Tokenize a title into lowercase word tokens for similarity comparison."""
    return set(re.findall(r"\w+", title.lower()))


def _title_similarity(a: str, b: str) -> float:
    """Jaccard similarity between two title token sets."""
    ta = _title_tokens(a)
    tb = _title_tokens(b)
    if not ta or not tb:
        return 0.0
    intersection = len(ta & tb)
    union = len(ta | tb)
    return intersection / union if union > 0 else 0.0


def _deduplicate_by_title(results: list[dict[str, Any]], threshold: float = 0.65) -> list[dict[str, Any]]:
    """Remove results whose titles are too similar to a higher-ranked result.

    Two results with >65% title token overlap are considered duplicates —
    the lower-quality one is dropped. This catches syndicated content that
    domain-based dedup misses (same article on different sites).
    """
    if len(results) <= 1:
        return results
    kept: list[dict[str, Any]] = []
    for r in results:
        title = r.get("title", "")
        if not title:
            kept.append(r)
            continue
        is_dup = False
        for k in kept:
            k_title = k.get("title", "")
            if _title_similarity(title, k_title) >= threshold:
                is_dup = True
                break
        if not is_dup:
            kept.append(r)
    return kept


# ── AI-generated search queries ──────────────────────────────────────────

_AI_QUERY_PROMPT = (
    "Rewrite this into 1-2 precise search queries. "
    "Output only the queries, one per line, no numbering.\n\n"
    "{query}"
)


def _generate_search_queries(user_query: str) -> list[str]:
    """Use a fast LLM call to generate optimized search queries.

    Falls back to an empty list (triggering regex refinement) if the LLM
    is unavailable or times out. Uses minimal tokens (num_predict=40) and
    low temperature (0.1) for speed.
    """
    q = (user_query or "").strip()
    if len(q) < 30:
        return []  # short queries don't benefit from AI refinement

    try:
        resp = _get_http().post(
            f"{settings.ollama_url}/api/generate",
            json={
                "model": settings.rag_llm_model,
                "prompt": _AI_QUERY_PROMPT.format(query=q),
                "stream": False,
                "options": {"num_predict": 40, "temperature": 0.1},
            },
            timeout=3.0,
        )
        resp.raise_for_status()
        text = (resp.json().get("response", "") or "").strip()
        # Parse: each non-empty line is a query
        queries = [line.strip() for line in text.split("\n") if line.strip()]
        # Strip any leading numbering/bullets
        cleaned = []
        for line in queries:
            line = re.sub(r"^[\d.\-•*]+\s*", "", line).strip()
            if line and len(line) > 5:
                cleaned.append(line)
        if cleaned:
            logger.info(f"AI generated {len(cleaned)} search queries: {cleaned}")
        return cleaned[:2]
    except Exception as e:
        logger.debug(f"AI query generation skipped: {e}")
        return []


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


def clear_cache() -> None:
    """Clear the in-memory search cache (useful for testing)."""
    _cache.clear()
    logger.info("Web search cache cleared")
