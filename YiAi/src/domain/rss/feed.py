import logging
import uuid
import feedparser
import aiohttp
import gc
from typing import Dict, Any, Optional
from data.database import db
from shared.config import settings
from shared.utils import get_current_time
from shared.error_codes import ErrorCode
from shared.exceptions import BusinessException

logger = logging.getLogger(__name__)

RSS_CHUNK_SIZE = 8192  # bytes per chunk when streaming RSS feed

async def fetch_rss_feed(url: str) -> feedparser.FeedParserDict:
    """
    Fetch and parse RSS feed content.
    
    Args:
        url: RSS feed URL.
        
    Returns:
        feedparser.FeedParserDict: Parsed RSS data.
        
    Raises:
        HTTPException: Raised when fetch or parse fails.
    """
    # Limit max RSS size to 10MB to prevent memory overflow
    MAX_RSS_SIZE = 10 * 1024 * 1024
    
    try:
        async with aiohttp.ClientSession() as session:
            # Increase timeout to 60 seconds
            async with session.get(url, timeout=aiohttp.ClientTimeout(total=60)) as response:
                if response.status != 200:
                    raise BusinessException(
                        ErrorCode.INVALID_PARAMS,
                        message=f"Cannot fetch RSS feed, HTTP status code: {response.status}"
                    )
                
                # Check Content-Length
                content_length = response.headers.get('Content-Length')
                if content_length and int(content_length) > MAX_RSS_SIZE:
                    raise BusinessException(
                        ErrorCode.INVALID_PARAMS,
                        message=f"RSS feed too large (Content-Length: {content_length}), exceeds limit of {MAX_RSS_SIZE} bytes"
                    )

                # Stream read with size limit
                content = bytearray()
                async for chunk in response.content.iter_chunked(RSS_CHUNK_SIZE):
                    content.extend(chunk)
                    if len(content) > MAX_RSS_SIZE:
                        raise BusinessException(
                            ErrorCode.INVALID_PARAMS,
                            message=f"RSS feed actual content too large, exceeds limit of {MAX_RSS_SIZE} bytes"
                        )
                
                feed = feedparser.parse(bytes(content))

                if feed.bozo and feed.bozo_exception:
                    logger.warning(f"RSS parse warning: {feed.bozo_exception}")

                return feed
    except aiohttp.ClientError as e:
        logger.error(f"Failed to fetch RSS feed: {str(e)}")
        raise BusinessException(ErrorCode.INVALID_PARAMS, message=f"Failed to fetch RSS feed: {str(e)}")
    except Exception as e:
        logger.error(f"Failed to parse RSS feed: {str(e)}")
        raise BusinessException(ErrorCode.INTERNAL_ERROR, message=f"Failed to parse RSS feed: {str(e)}")

def _build_entry_data(entry, source_name: str, tags: list[str], url: str, current_time: str) -> Dict[str, Any]:
    """Build database entry data from RSS entry"""
    item_data = {
        'title': entry.get('title', ''),
        'link': entry.get('link', ''),
        'description': entry.get('description', '') or entry.get('summary', ''),
        'tags': tags,
        'source_name': source_name,
        'source_url': url,
        'published': entry.get('published', ''),
        'published_parsed': str(entry.get('published_parsed', '')) if entry.get('published_parsed') else '',
        'createdTime': current_time,
        'updatedTime': current_time,
    }
    if entry.get('author'):
        item_data['author'] = entry.get('author')
    content_list = entry.get('content', [])
    if content_list:
        item_data['content'] = content_list[0].get('value', '')
    return item_data


async def _save_or_update_entry(collection, item_data: Dict[str, Any], current_time: str) -> int:
    """Save or update a single RSS entry, returns added=1 or updated=1"""
    existing_item = await collection.find_one({'link': item_data['link']})
    if existing_item:
        item_data['key'] = existing_item.get('key', str(uuid.uuid4()))
        item_data['createdTime'] = existing_item.get('createdTime', current_time)
        result = await collection.update_one({'link': item_data['link']}, {'$set': item_data})
        return 0, 1 if result.modified_count > 0 else 0
    else:
        item_data['key'] = str(uuid.uuid4())
        await collection.insert_one(item_data)
        return 1, 0


async def process_feed_from_url(url: str, name: Optional[str] = None) -> Dict[str, Any]:
    """Fetch, parse, and save RSS feed data"""
    try:
        await db.initialize()
        feed = await fetch_rss_feed(url)
        source_name = name or feed.feed.get('title', 'Unknown Source')
        tags = [source_name] if source_name else []
        current_time = get_current_time()
        collection = db.db[settings.collection_rss]

        saved_count = updated_count = total_items = 0
        for entry in feed.entries:
            if not entry.get('link'):
                continue
            total_items += 1
            item_data = _build_entry_data(entry, source_name, tags, url, current_time)
            added, updated = await _save_or_update_entry(collection, item_data, current_time)
            saved_count += added
            updated_count += updated

        del feed
        gc.collect()
        return {
            'url': url, 'source_name': source_name, 'success': True,
            'saved_count': saved_count, 'updated_count': updated_count, 'total_items': total_items,
        }
    except Exception as e:
        logger.error(f"Failed to process RSS feed {url}: {str(e)}")
        return {'url': url, 'source_name': name or url, 'success': False, 'error': str(e)}

async def parse_feed(params: Dict[str, Any]) -> Dict[str, Any]:
    """
    Parse RSS feed and save to MongoDB (API endpoint)
    
    Args:
        params: Parameter dictionary
            - url (str): RSS feed URL.
            - name (str, optional): Feed name
            
    Returns:
        Dict[str, Any]: Parse result statistics
    """
    url = params.get("url")
    if not url:
        raise ValueError("URL is required")
    
    name = params.get("name")
    
    logger.info(f"Start parsing RSS feed: {url}")
    result = await process_feed_from_url(url, name)
    
    if not result.get('success'):
        # If this is an API call, may want to raise exception or return error info
        # To maintain API compatibility, partial info is returned here, but parse_feed was originally designed to return success bool
        pass
        
    return {
        "success": result.get('success', False),
        "url": url,
        "source": result.get('source_name', 'Unknown'),
        "saved_count": result.get('saved_count', 0),
        "updated_count": result.get('updated_count', 0),
        "total_items": result.get('total_items', 0),
        "error": result.get('error')
    }
