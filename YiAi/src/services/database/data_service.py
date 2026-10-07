import asyncio
import logging

from data.repository import (  # noqa: F401
    count_documents,
    get_document_detail,
    list_story_task_dirs,
    query_documents,
)
from data.repository import (
    create_document as _create_document,
)
from data.repository import (
    delete_document as _delete_document,
)
from data.repository import (
    delete_project_cascade as _delete_project_cascade,
)
from data.repository import (
    update_document as _update_document,
)
from data.repository import (
    upsert_document as _upsert_document,
)
from domain.audit.decorator import audit_write
from shared.cache import cache

logger = logging.getLogger(__name__)


async def _invalidate_doc_cache(collection: str, doc_key: str | None = None):
    """Invalidate cache entries for a collection after a write.

    Retries on transient failures — stale cache after a write can cause the
    caller to read old data for the full TTL duration.
    """
    for attempt in range(3):
        try:
            if doc_key:
                await cache.delete(f"data:doc:{collection}:{doc_key}")
            await cache.delete_pattern(f"data:query:{collection}:*")
            await cache.delete_pattern(f"data:count:{collection}:*")
            return
        except Exception:
            if attempt < 2:
                await asyncio.sleep(0.1 * (attempt + 1))
            else:
                logger.warning(
                    f"Cache invalidation failed after 3 retries: "
                    f"collection={collection} doc_key={doc_key}",
                    exc_info=True,
                )


def _invalidate_analytics_cache():
    """Clear efficiency and quality metric module-level caches after writes."""
    try:
        from services.analytics.aggregator.efficiency import _cache as eff_cache
        from services.analytics.aggregator.quality import _cache as qual_cache
        eff_cache.clear()
        qual_cache.clear()
    except Exception:
        pass


def _fire_invalidate(collection: str, doc_key: str | None = None):
    """Fire-and-forget cache invalidation — doesn't block the write response."""
    try:
        loop = asyncio.get_running_loop()
        loop.create_task(_invalidate_doc_cache(collection, doc_key))
        if collection in ("issues", "bugs"):
            loop.create_task(asyncio.to_thread(_invalidate_analytics_cache))
    except RuntimeError:
        pass


@audit_write("CREATE")
async def create_document(params):
    result = await _create_document(params)
    cname = params.get("collection_name") or params.get("cname", "")
    doc_key = result.get("key") if isinstance(result, dict) else None
    _fire_invalidate(cname, doc_key)
    return result


@audit_write("UPDATE")
async def update_document(params):
    result = await _update_document(params)
    cname = params.get("collection_name") or params.get("cname", "")
    data = params.get("data", {})
    doc_key = data.get("key") if isinstance(data, dict) else None
    _fire_invalidate(cname, doc_key)
    return result


@audit_write("DELETE")
async def delete_document(params):
    result = await _delete_document(params)
    cname = params.get("collection_name") or params.get("cname", "")
    doc_key = params.get("key") or params.get("id", "")
    _fire_invalidate(cname, doc_key)
    return result


@audit_write("DELETE")
async def delete_project_cascade(params):
    """Delete a project and all related entities (issues, bugs, modules, milestones)."""
    result = await _delete_project_cascade(params)
    project_key = params.get("key", "")
    for cname in ("projects", "issues", "bugs", "modules", "milestones"):
        _fire_invalidate(cname, project_key)
    return result


@audit_write("UPSERT")
async def upsert_document(params):
    result = await _upsert_document(params)
    cname = params.get("collection_name") or params.get("cname", "")
    filter_doc = params.get("filter", {})
    doc_key = filter_doc.get("key", "") if isinstance(filter_doc, dict) else ""
    _fire_invalidate(cname, doc_key)
    return result
