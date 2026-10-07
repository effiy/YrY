"""AI-powered search query generation and query refinement.

Internal module — imported by ``web_search.py``. Not part of the public API.
"""

from datetime import datetime, timezone
import logging
import re

import httpx

from shared.config import settings

logger = logging.getLogger(__name__)

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

    if _TIME_SENSITIVE.search(q) and str(datetime.now(timezone.utc).year) not in q:
        q = f"{q} {datetime.now(timezone.utc).year}"

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


# ── AI-generated search queries ──────────────────────────────────────────

_AI_QUERY_PROMPT = (
    "Rewrite this into 1-2 precise search queries. "
    "Output only the queries, one per line, no numbering.\n\n"
    "{query}"
)

# Fast variant — fewer tokens, lower timeout, for async use
_AI_QUERY_PROMPT_FAST = (
    "Generate 1-2 search queries for: {query}\n"
    "One per line, no numbering:"
)


def _generate_search_queries(user_query: str) -> list[str]:
    """Use a fast LLM call to generate optimized search queries.

    Falls back to an empty list (triggering regex refinement) if the LLM
    is unavailable or times out. Uses minimal tokens (num_predict=30) and
    low temperature (0.0) for speed.
    """
    q = (user_query or "").strip()
    if len(q) < 15:  # only skip very short queries
        return []

    try:
        with httpx.Client(
            timeout=httpx.Timeout(10.0, connect=5.0),
            limits=httpx.Limits(max_keepalive_connections=5, max_connections=20),
        ) as client:
            resp = client.post(
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


async def _generate_search_queries_async(user_query: str) -> list[str]:
    """Async version — uses httpx.AsyncClient with connection pooling.

    Falls back to empty list on any error (triggers regex-based refinement).
    Uses a smaller prompt and shorter timeout for speed.
    """
    q = (user_query or "").strip()
    if len(q) < 15:  # only skip very short queries (< 15 chars)
        return []

    try:
        async with httpx.AsyncClient(
            timeout=httpx.Timeout(5.0, connect=3.0),
            limits=httpx.Limits(max_keepalive_connections=3, max_connections=10),
        ) as client:
            resp = await client.post(
                f"{settings.ollama_url}/api/generate",
                json={
                    "model": settings.rag_llm_model,
                    "prompt": _AI_QUERY_PROMPT_FAST.format(query=q),
                    "stream": False,
                    "options": {"num_predict": 30, "temperature": 0.0},
                },
                timeout=3.0,
            )
            resp.raise_for_status()
            text = (resp.json().get("response", "") or "").strip()
        queries = [line.strip() for line in text.split("\n") if line.strip()]
        cleaned = []
        for line in queries:
            line = re.sub(r"^[\d.\-•*]+\s*", "", line).strip()
            if line and len(line) > 5:
                cleaned.append(line)
        if cleaned:
            logger.info(f"AI generated {len(cleaned)} search queries (async): {cleaned}")
        return cleaned[:2]
    except Exception as e:
        logger.debug(f"AI query generation (async) skipped: {e}")
        return []
