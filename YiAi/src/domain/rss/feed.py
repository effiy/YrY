"""RSS feed parsing + persistence.

Storage strategy (refactor 2026-08-17):
  - MongoDB ``rss`` collection stores **metadata only** — key, link, title,
    source_name, source_url, author, published, published_parsed, tags,
    category_path, file_path, createdTime, updatedTime. The full article
    body is NOT stored in MongoDB.
  - Article body is persisted as a markdown file under
    ``YiKnowledge/rss/{YYYY-MM-DD}/{slug}.md`` with YAML frontmatter. The
    date prefix comes from the article's published date (falling back to
    today). The ``category_path`` metadata field retains the
    auto-classification (e.g. ``aier/methodology``) for filtering, but
    files are no longer scattered across role subdirectories.
  - Re-parsing an existing feed is idempotent: file already on disk → skip
    the write; metadata is upserted either way.

Public API (unchanged): ``fetch_rss_feed``, ``process_feed_from_url``,
``parse_feed``. Internal helpers are private.
"""
import logging
import re
import uuid
from datetime import datetime, timezone
from typing import Any, Dict, Optional

import aiohttp
import feedparser
import gc

from data.database import db
from domain.knowledge.writer import entry_exists, write_entry_markdown
from shared.config import settings
from shared.error_codes import ErrorCode
from shared.exceptions import BusinessException
from shared.utils import get_current_time

logger = logging.getLogger(__name__)

RSS_CHUNK_SIZE = 8192  # bytes per chunk when streaming RSS feed

# ── Auto-classification rules ──
# Ordered (first match wins). Keywords are matched case-insensitively against
# title + description. ``executiver/industry`` is the fallback when nothing else
# matches.
#
# Classification determines the ``category_path`` metadata field only; all RSS
# files are written to ``YiKnowledge/rss/YYYY-MM-DD/`` regardless of classification.
_CLASSIFY_RULES: list[tuple[tuple[str, ...], str]] = [
    (("ai", "llm", "gpt", "claude", "large model", "transformer", "neural"), "aier/methodology"),
    (("ml", "machine learning", "deep learning", "training", "inference"), "aier/foundations"),
    (("data", "database", "postgres", "mongo", "vector db"), "engineer/ship"),
    (("cloud", "k8s", "kubernetes", "docker", "infra", "infrastructure", "devops"), "srer/release"),
    (("competitor", "market", "trend"), "executiver/industry"),
    (("use case", "case study", "deployment"), "executiver/industry"),
    (("report", "whitepaper"), "executiver/industry"),
    (("prompt", "rag", "agent"), "aier/methodology"),
    (("template"), "curator/templates"),
    (("method", "framework", "methodology"), "producter/frameworks"),
    (("fail", "failure", "lesson"), "engineer/learn/lessons/failures"),
    (("win", "success", "best practice"), "engineer/learn/lessons/wins"),
]
_CLASSIFY_FALLBACK = "executiver/industry"

# Source-name → category override. If a feed's source name contains any of
# these substrings, the source's configured category wins over the keyword
# heuristic. Extend via the ``seeds`` collection's ``category`` field.
_SOURCE_CATEGORY_RULES: list[tuple[tuple[str, ...], str]] = [
    # empty by default — sources opt in via the ``category`` field on the
    # seeds document; see ``_classify_entry``.
]


def _slugify(text: str) -> str:
    """Make a filesystem-safe slug from arbitrary text.

    Keeps CJK characters (YiKnowledge may have Chinese file names).
    Truncates to 60 chars. No hash suffix \u2014 the file name is the title
    slug directly. Note: two different articles with the same title (and
    the same date) collide on disk; the second is skipped as idempotent.
    """
    s = (text or "").strip().lower()
    s = re.sub(r"\s+", "-", s)
    s = re.sub(r"[^a-z0-9\u4e00-\u9fa5]+", "-", s)
    s = re.sub(r"-+", "-", s)
    s = s.strip("-")
    if not s:
        s = "untitled"
    if len(s) > 60:
        s = s[:60].rstrip("-")
    return s


def _keyword_matches(keyword: str, haystack: str) -> bool:
    """Match a keyword in haystack, case-insensitively.

    ASCII keywords require a word boundary so "ai" doesn't match "Analysis"
    or "OpenAI" (we want to match "ai" as a standalone token). CJK
    keywords don't have word boundaries in the regex sense — substring
    match is the right call there.
    """
    if not keyword:
        return False
    if re.search(r"[A-Za-z]", keyword):
        pattern = r"(?<![A-Za-z0-9])" + re.escape(keyword) + r"(?![A-Za-z0-9])"
        return re.search(pattern, haystack) is not None
    return keyword in haystack


def _classify_entry(
    title: str,
    description: str,
    source_name: str = "",
    source_category: Optional[str] = None,
) -> str:
    """Pick a category for the entry (metadata only — files go to ``rss/YYYY-MM-DD/``).

    Priority:
      1. ``source_category`` — explicitly configured on the seeds document
         (passed in from ``process_feed_from_url``).
      2. ``_SOURCE_CATEGORY_RULES`` — static keyword map on source name.
      3. ``_CLASSIFY_RULES`` — keyword heuristic on title + description.
      4. ``_CLASSIFY_FALLBACK`` — ``executiver/industry``.
    """
    if source_category and "/" in source_category:
        return source_category
    sn = (source_name or "").lower()
    for kws, cat in _SOURCE_CATEGORY_RULES:
        if any(k in sn for k in kws):
            return cat
    hay = f"{title} {description}".lower()
    for kws, cat in _CLASSIFY_RULES:
        if any(_keyword_matches(k, hay) for k in kws):
            return cat
    return _CLASSIFY_FALLBACK


def _entry_date_dir(entry) -> str:
    """Extract a ``YYYY-MM-DD`` directory name from the entry's published date.

    Falls back to today if ``published_parsed`` is missing or unparseable.
    """
    parsed = entry.get("published_parsed")
    if parsed:
        try:
            dt = datetime(*parsed[:6], tzinfo=timezone.utc)
            return dt.strftime("%Y-%m-%d")
        except Exception:
            pass
    return datetime.now(timezone.utc).strftime("%Y-%m-%d")


def _entry_body(entry) -> str:
    """Pull the richest available body from a feedparser entry."""
    content_list = entry.get("content", [])
    if content_list:
        v = content_list[0].get("value", "")
        if v:
            return v
    # ``description`` is sometimes HTML, sometimes plain text — write as-is;
    # the knowledge consumer is expected to render markdown tolerantly.
    return entry.get("description", "") or entry.get("summary", "") or ""


def _entry_published_ts(entry) -> Optional[int]:
    """Best-effort epoch-ms timestamp for the entry's published date."""
    parsed = entry.get("published_parsed")
    if parsed:
        try:
            dt = datetime(*parsed[:6], tzinfo=timezone.utc)
            return int(dt.timestamp() * 1000)
        except Exception:
            return None
    return None


def _build_meta(
    *,
    title: str,
    link: str,
    source_name: str,
    source_url: str,
    category_path: str,
    tags: list[str],
    published: str,
    author: Optional[str],
) -> dict:
    """YAML frontmatter dict — matches the YiKnowledge schema."""
    return {
        "title": title or (link or "Untitled"),
        "tags": tags,
        "category": category_path,
        "created": datetime.now(timezone.utc).strftime("%Y-%m-%d"),
        "source": link,
        "type": "rss",
        "source_name": source_name,
        "source_url": source_url,
        "published": published,
        "author": author,
    }


def _build_entry_metadata(
    entry,
    *,
    source_name: str,
    source_url: str,
    tags: list[str],
    current_time: str,
    category_path: str,
    file_path: str,
    body_missing: bool = False,
) -> Dict[str, Any]:
    """Build the MongoDB metadata doc — NO ``content`` field.

    Previously this dict carried the full article body; that now lives on
    disk under YiKnowledge. Keeping the doc lean keeps the collection cheap
    to query / scan. ``body_missing`` records whether ``file_path`` resolves
    to an actual markdown file (see ``mark_missing_bodies``).
    """
    item: Dict[str, Any] = {
        "title": entry.get("title", ""),
        "link": entry.get("link", ""),
        "tags": tags,
        "source_name": source_name,
        "source_url": source_url,
        "published": entry.get("published", ""),
        "published_parsed": _entry_published_ts(entry) or 0,
        "category_path": category_path,
        "file_path": file_path,
        "body_missing": body_missing,
        "summary": (entry.get("description") or entry.get("summary") or "")[:500],
        "createdTime": current_time,
        "updatedTime": current_time,
    }
    if entry.get("author"):
        item["author"] = entry.get("author")
    return item


def _persist_entry_to_knowledge(
    entry,
    *,
    source_name: str,
    source_url: str,
    category_path: str,
    tags: list[str],
) -> tuple[str, bool]:
    """Write the entry's body as a markdown file under YiKnowledge/rss/YYYY-MM-DD/.

    Returns (relative_path, wrote_file). ``wrote_file`` is False when the
    file already existed on disk — re-parsing the same feed shouldn't
    rewrite identical content.
    """
    title = entry.get("title", "") or "untitled"
    link = entry.get("link", "")
    slug = _slugify(title)
    date_dir = _entry_date_dir(entry)
    rel = f"rss/{date_dir}/{slug}.md"
    if entry_exists(rel):
        return rel, False
    body = _entry_body(entry)
    if not body:
        # Some feeds only ship title+link; still write a stub so the entry
        # has a presence in the knowledge base and the metadata → file link
        # resolves.
        body = f"(No body available — see source.)\n\nSource: {link}"
    published = entry.get("published", "")
    meta = _build_meta(
        title=title,
        link=link,
        source_name=source_name,
        source_url=source_url,
        category_path=category_path,
        tags=tags,
        published=published,
        author=entry.get("author"),
    )
    try:
        write_entry_markdown(rel, body, meta)
        return rel, True
    except BusinessException as e:
        # Path-escape or write failure — don't kill the whole feed parse over
        # one bad entry. The caller will still store metadata; the file just
        # won't be there.
        logger.warning(f"Failed to persist RSS entry to {rel}: {e}")
        return rel, False


async def fetch_rss_feed(url: str) -> feedparser.FeedParserDict:
    """Fetch and parse RSS feed content."""
    MAX_RSS_SIZE = 10 * 1024 * 1024
    # Browser-like User-Agent: many publishers (IGN, Condé Nast, Mayo Clinic…)
    # return 403 to aiohttp's default "Python/3.x aiohttp" UA. Oversized
    # response headers (e.g. WHO sends an 8.7 KB header value) exceed
    # aiohttp's default max_field_size of 8190, so raise it.
    headers = {
        "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "application/rss+xml, application/xml;q=0.9, text/xml;q=0.8, */*;q=0.7",
    }
    try:
        async with aiohttp.ClientSession(max_field_size=32768) as session:
            async with session.get(url, timeout=aiohttp.ClientTimeout(total=60), headers=headers) as response:
                if response.status != 200:
                    raise BusinessException(
                        ErrorCode.INVALID_PARAMS,
                        message=f"Cannot fetch RSS feed, HTTP status code: {response.status}",
                    )
                content_length = response.headers.get("Content-Length")
                if content_length and int(content_length) > MAX_RSS_SIZE:
                    raise BusinessException(
                        ErrorCode.INVALID_PARAMS,
                        message=f"RSS feed too large (Content-Length: {content_length}), exceeds limit of {MAX_RSS_SIZE} bytes",
                    )
                content = bytearray()
                async for chunk in response.content.iter_chunked(RSS_CHUNK_SIZE):
                    content.extend(chunk)
                    if len(content) > MAX_RSS_SIZE:
                        raise BusinessException(
                            ErrorCode.INVALID_PARAMS,
                            message=f"RSS feed actual content too large, exceeds limit of {MAX_RSS_SIZE} bytes",
                        )
                feed = feedparser.parse(bytes(content))
                if feed.bozo and feed.bozo_exception:
                    logger.warning(f"RSS parse warning: {feed.bozo_exception}")
                return feed
    except BusinessException:
        raise
    except aiohttp.ClientError as e:
        logger.error(f"Failed to fetch RSS feed: {str(e)}")
        raise BusinessException(ErrorCode.INVALID_PARAMS, message=f"Failed to fetch RSS feed: {str(e)}")
    except Exception as e:
        logger.error(f"Failed to parse RSS feed: {str(e)}")
        raise BusinessException(ErrorCode.INTERNAL_ERROR, message=f"Failed to parse RSS feed: {str(e)}")


async def _save_or_update_entry(
    collection,
    item_data: Dict[str, Any],
    current_time: str,
    *,
    file_wrote: bool,
) -> tuple[int, int]:
    """Upsert metadata. On existing entries, refresh metadata fields but
    preserve ``createdTime``. ``file_wrote`` controls the ``updated_count``
    accounting so the caller's stats reflect content changes, not just
    metadata touches."""
    existing = await collection.find_one({"link": item_data["link"]})
    if existing:
        item_data["key"] = existing.get("key", str(uuid.uuid4()))
        item_data["createdTime"] = existing.get("createdTime", current_time)
        result = await collection.update_one({"link": item_data["link"]}, {"$set": item_data})
        # If the file already existed (file_wrote=False) AND nothing in the
        # metadata changed, this is a no-op re-parse — count as 0 to avoid
        # inflating "updated" stats. Otherwise count as 1 update.
        return 0, 1 if (file_wrote or result.modified_count > 0) else 0
    item_data["key"] = str(uuid.uuid4())
    await collection.insert_one(item_data)
    return 1, 0


async def process_feed_from_url(url: str, name: Optional[str] = None) -> Dict[str, Any]:
    """Fetch, parse, classify, and persist an RSS feed.

    Each entry:
      1. Auto-classified into a category (stored in ``category_path`` metadata).
      2. Body written to ``YiKnowledge/rss/{date_dir}/{slug}.md`` with YAML
         frontmatter (idempotent — existing file is not re-written).
      3. Metadata-only doc upserted into the ``rss`` collection with
         ``category_path`` + ``file_path``.
    """
    try:
        await db.initialize()
        feed = await fetch_rss_feed(url)
        source_name = name or feed.feed.get("title", "Unknown Source")
        tags = [source_name] if source_name else []

        # Source-configured category — let feed sources opt into a fixed
        # YiKnowledge subtree via the ``seeds`` collection's ``category``
        # field. Looked up once per feed to avoid N round-trips.
        source_category = await _lookup_source_category(url)

        current_time = get_current_time()
        collection = db.db[settings.collection_rss]

        saved_count = updated_count = total_items = files_written = 0
        for entry in feed.entries:
            if not entry.get("link"):
                continue
            total_items += 1
            title = entry.get("title", "")
            description = entry.get("description", "") or entry.get("summary", "")
            category_path = _classify_entry(
                title=title,
                description=description,
                source_name=source_name,
                source_category=source_category,
            )
            file_path, wrote = _persist_entry_to_knowledge(
                entry,
                source_name=source_name,
                source_url=url,
                category_path=category_path,
                tags=tags,
            )
            files_written += 1 if wrote else 0
            body_missing = not entry_exists(file_path)
            item_data = _build_entry_metadata(
                entry,
                source_name=source_name,
                source_url=url,
                tags=tags,
                current_time=current_time,
                category_path=category_path,
                file_path=file_path,
                body_missing=body_missing,
            )
            added, updated = await _save_or_update_entry(
                collection,
                item_data,
                current_time,
                file_wrote=wrote,
            )
            saved_count += added
            updated_count += updated

        del feed
        gc.collect()
        return {
            "url": url,
            "source_name": source_name,
            "success": True,
            "saved_count": saved_count,
            "updated_count": updated_count,
            "total_items": total_items,
            "files_written": files_written,
        }
    except Exception as e:
        logger.error(f"Failed to process RSS feed {url}: {str(e)}")
        return {
            "url": url,
            "source_name": name or url,
            "success": False,
            "error": str(e),
        }


async def _lookup_source_category(url: str) -> Optional[str]:
    """Pull a source's configured ``category`` from the seeds collection, if any."""
    try:
        await db.initialize()
        seeds = db.db[settings.collection_seeds]
        doc = await seeds.find_one({"url": url}, {"category": 1, "_id": 0})
        cat = doc.get("category") if doc else None
        return cat if (cat and "/" in cat) else None
    except Exception as e:
        logger.warning(f"Failed to look up source category for {url}: {e}")
        return None


async def parse_feed(params: Dict[str, Any]) -> Dict[str, Any]:
    """Parse RSS feed (RPC entrypoint).

    ``parameters: { url, name? }``. Persisted body → YiKnowledge, metadata
    → MongoDB. The result envelope carries counts plus a ``files_written``
    field so callers can tell whether a re-parse actually wrote new
    content vs. refreshed metadata only.
    """
    url = params.get("url")
    if not url:
        raise ValueError("URL is required")
    name = params.get("name")
    logger.info(f"Start parsing RSS feed: {url}")
    result = await process_feed_from_url(url, name)
    return {
        "success": result.get("success", False),
        "url": url,
        "source": result.get("source_name", "Unknown"),
        "saved_count": result.get("saved_count", 0),
        "updated_count": result.get("updated_count", 0),
        "total_items": result.get("total_items", 0),
        "files_written": result.get("files_written", 0),
        "error": result.get("error"),
    }


async def mark_missing_bodies(params: Dict[str, Any]) -> Dict[str, Any]:
    """Backfill the ``body_missing`` flag on every ``rss`` record.

    Computes ``body_missing`` from whether ``file_path`` resolves to a file on
    disk under YiKnowledge, and writes it only when the stored value differs.
    Persisting the flag lets the frontend compute a metadata-only ratio via a
    cheap Mongo count instead of one file read per article.

    ``parameters: {}`` — no inputs. Returns ``{ total, body_missing,
    body_present, updated }``.
    """
    await db.initialize()
    collection = db.db[settings.collection_rss]
    cursor = collection.find({}, {"link": 1, "file_path": 1, "body_missing": 1})
    total = 0
    missing = 0
    updated = 0
    async for doc in cursor:
        total += 1
        file_path = doc.get("file_path")
        is_missing = not (file_path and entry_exists(file_path))
        if is_missing:
            missing += 1
        if doc.get("body_missing") is not is_missing:
            await collection.update_one(
                {"link": doc.get("link")}, {"$set": {"body_missing": is_missing}}
            )
            updated += 1
    return {
        "total": total,
        "body_missing": missing,
        "body_present": total - missing,
        "updated": updated,
    }
