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

Implementation split across sub-modules:
  - ``web_search.py`` — DuckDuckGo search, image search, cache
  - ``ai_search.py`` — Query refinement + AI-generated search queries
  - ``wikipedia.py`` — Wikipedia fallback search
  - ``formatter.py`` — Quality scoring, recency scoring, dedup, ranking
  - ``fetch.py`` — Web page fetching, HTML extraction, Jina Reader
"""

from .web_search import search, search_async, search_images, clear_cache
from .ai_search import refine_query
from .formatter import _clean
from .router import classify_query, unified_search
