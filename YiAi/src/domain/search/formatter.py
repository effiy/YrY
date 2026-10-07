"""Result formatting, quality scoring, deduplication, and ranking for web search results.

Internal module — imported by ``web_search.py``. Not part of the public API.
"""

from datetime import datetime as _dt
from datetime import timedelta as _td
from datetime import timezone as _tz
import logging
import re
from typing import Any
from urllib.parse import urlparse

logger = logging.getLogger(__name__)

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

# Date patterns ordered by reliability — first match wins
_DATE_PATTERNS: list[tuple[re.Pattern, str]] = [
    (re.compile(r"(\d{4})-(\d{2})-(\d{2})"), "iso"),           # 2026-09-18
    (re.compile(r"(\d{1,2})\s+(\w+)\s+(\d{4})"), "named"),     # 18 Sep 2026
    (re.compile(r"(\w+)\s+(\d{1,2}),?\s+(\d{4})"), "named2"),  # Sep 18, 2026
    (re.compile(r"(\d{1,2})/(\d{1,2})/(\d{4})"), "us"),        # 9/18/2026
    (re.compile(r"(\d+)\s+(day|week|month|year)s?\s+ago"), "relative"),  # 3 days ago
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
    """Score how recent the content is. 0-2 bonus points for fresh, penalty for stale."""
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
    # Stale penalty: content older than 1 year loses points
    if age_days > 365:
        return -1.0
    return 0.0


def _clean(text: str) -> str:
    return (text or "").strip()


# ── Title deduplication ──────────────────────────────────────────────────

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
    """Remove results whose titles or content are too similar to a higher-ranked result.

    Two results with >65% title token overlap OR >50% snippet word overlap
    are considered duplicates — the lower-quality one is dropped. This catches:
      - Syndicated content (same article on different sites)
      - Mirrors/archives of the same page
      - Near-duplicate content with slightly different titles
    """
    if len(results) <= 1:
        return results
    kept: list[dict[str, Any]] = []
    kept_snippet_words: list[set[str]] = []
    for r in results:
        title = r.get("title", "")
        snippet = r.get("snippet", "")
        if not title:
            kept.append(r)
            kept_snippet_words.append(set())
            continue
        is_dup = False
        snippet_words = set(re.findall(r"\w+", snippet.lower())) if snippet else set()
        for i, k in enumerate(kept):
            k_title = k.get("title", "")
            if _title_similarity(title, k_title) >= threshold:
                is_dup = True
                break
            # Also check snippet content overlap (>50% word overlap)
            if snippet_words and kept_snippet_words[i]:
                intersection = len(snippet_words & kept_snippet_words[i])
                union = len(snippet_words | kept_snippet_words[i])
                if union > 0 and intersection / union > 0.5:
                    is_dup = True
                    break
        if not is_dup:
            kept.append(r)
            kept_snippet_words.append(snippet_words)
    return kept


# ── Merge and rank ───────────────────────────────────────────────────────

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
    # Filter: drop very low-quality results (quality < 2)
    # unless they're the only results we have
    filtered = [r for r in merged if r.get("quality", 0) >= 2]
    if len(filtered) < 2 and len(merged) > len(filtered):
        # Keep at least 2 results if available, even if low quality
        merged.sort(key=lambda r: r.get("quality", 0), reverse=True)
        filtered = merged[:max(2, len(filtered))]
    else:
        merged = filtered
    # Semantic dedup: remove near-duplicate titles across different domains.
    # Catches syndicated content (same article on multiple sites).
    merged = _deduplicate_by_title(merged)
    return merged[:max_results]
