"""RSS feed parsing + persistence — public API re-exports + fetching + entrypoints."""

import gc
import logging
from typing import Any, Dict, Optional

import aiohttp
import feedparser

from data.database import db
from domain.rss.persistence import (
    _build_entry_metadata,
    _classify_entry,
    _persist_entry_to_knowledge,
    _save_or_update_entry,
    _lookup_source_category,
    _slugify,
)
from domain.knowledge.writer import entry_exists
from shared.config import settings
from shared.error_codes import ErrorCode
from shared.exceptions import BusinessException
from shared.utils import get_current_time

logger = logging.getLogger(__name__)

RSS_CHUNK_SIZE = 8192


async def fetch_rss_feed(url: str) -> feedparser.FeedParserDict:
    MAX_RSS_SIZE = 10 * 1024 * 1024
    headers = {
        "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "application/rss+xml, application/xml;q=0.9, text/xml;q=0.8, */*;q=0.7",
    }
    try:
        async with aiohttp.ClientSession(max_field_size=32768) as session:
            async with session.get(url, timeout=aiohttp.ClientTimeout(total=60), headers=headers) as response:
                if response.status != 200:
                    raise BusinessException(ErrorCode.INVALID_PARAMS, message=f"Cannot fetch RSS feed, HTTP status code: {response.status}")
                content_length = response.headers.get("Content-Length")
                if content_length and int(content_length) > MAX_RSS_SIZE:
                    raise BusinessException(ErrorCode.INVALID_PARAMS, message=f"RSS feed too large (Content-Length: {content_length}), exceeds limit of {MAX_RSS_SIZE} bytes")
                content = bytearray()
                async for chunk in response.content.iter_chunked(RSS_CHUNK_SIZE):
                    content.extend(chunk)
                    if len(content) > MAX_RSS_SIZE:
                        raise BusinessException(ErrorCode.INVALID_PARAMS, message=f"RSS feed actual content too large, exceeds limit of {MAX_RSS_SIZE} bytes")
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


async def process_feed_from_url(url: str, name: Optional[str] = None) -> Dict[str, Any]:
    try:
        await db.initialize()
        feed = await fetch_rss_feed(url)
        source_name = name or feed.feed.get("title", "Unknown Source")
        tags = [source_name] if source_name else []
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
            category_path = _classify_entry(title=title, description=description, source_name=source_name, source_category=source_category)
            file_path, wrote = _persist_entry_to_knowledge(entry, source_name=source_name, source_url=url, category_path=category_path, tags=tags)
            files_written += 1 if wrote else 0
            body_missing = not entry_exists(file_path)
            item_data = _build_entry_metadata(entry, source_name=source_name, source_url=url, tags=tags, current_time=current_time, category_path=category_path, file_path=file_path, body_missing=body_missing)
            added, updated = await _save_or_update_entry(collection, item_data, current_time, file_wrote=wrote)
            saved_count += added
            updated_count += updated

        del feed
        gc.collect()
        return {"url": url, "source_name": source_name, "success": True, "saved_count": saved_count, "updated_count": updated_count, "total_items": total_items, "files_written": files_written}
    except Exception as e:
        logger.error(f"Failed to process RSS feed {url}: {str(e)}")
        return {"url": url, "source_name": name or url, "success": False, "error": str(e)}


async def parse_feed(params: Dict[str, Any]) -> Dict[str, Any]:
    url = params.get("url")
    if not url:
        raise BusinessException(ErrorCode.INVALID_PARAMS, message="URL is required")
    name = params.get("name")
    logger.info(f"Start parsing RSS feed: {url}")
    result = await process_feed_from_url(url, name)
    return {"success": result.get("success", False), "url": url, "source": result.get("source_name", "Unknown"), "saved_count": result.get("saved_count", 0), "updated_count": result.get("updated_count", 0), "total_items": result.get("total_items", 0), "files_written": result.get("files_written", 0), "error": result.get("error")}


async def mark_missing_bodies(params: Dict[str, Any]) -> Dict[str, Any]:
    await db.initialize()
    collection = db.db[settings.collection_rss]
    cursor = collection.find({}, {"link": 1, "file_path": 1, "body_missing": 1})
    total = missing = updated = 0
    async for doc in cursor:
        total += 1
        file_path = doc.get("file_path")
        is_missing = not (file_path and entry_exists(file_path))
        if is_missing:
            missing += 1
        if doc.get("body_missing") is not is_missing:
            await collection.update_one({"link": doc.get("link")}, {"$set": {"body_missing": is_missing}})
            updated += 1
    return {"total": total, "body_missing": missing, "body_present": total - missing, "updated": updated}