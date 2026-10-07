"""Repository query operations: query_documents, get_document_detail, count_documents."""

import logging
from typing import Any
import uuid

from data.database import db
from data.date_helpers import apply_rss_date_filters, rss_doc_published_ms
from data.filter_helpers import build_filter
from data.helpers import _QUERY_MAX_TIME_MS, _validate_collection_name
from shared.cache_keys import CACHE_TTL
from shared.config import settings
from shared.error_codes import ErrorCode
from shared.exceptions import BusinessException

logger = logging.getLogger(__name__)


async def query_documents(params: dict[str, Any]) -> dict[str, Any]:
    collection_name = params.get("collection_name") or params.get("cname")
    if not collection_name:
        raise BusinessException(ErrorCode.INVALID_PARAMS, message="Collection name (collection_name/cname) is required")

    query_params = params.copy()
    query_params.pop("cname", None)
    query_params.pop("collection_name", None)

    filter_param = query_params.pop("filter", None)
    if filter_param and isinstance(filter_param, dict):
        query_params.update(filter_param)

    await db.initialize()
    collection_name = _validate_collection_name(collection_name)

    fields_param = query_params.pop("fields", None) or query_params.pop("select", None)
    exclude_fields_param = query_params.pop("excludeFields", None) or query_params.pop("exclude", None)

    try:
        page_num = max(1, int(query_params.pop("pageNum", 1)))
        page_size = min(
            settings.pagination_max_size,
            max(settings.pagination_min_size, int(query_params.pop("pageSize", settings.pagination_default_size))),
        )
    except ValueError as exc:
        raise BusinessException(ErrorCode.INVALID_PARAMS, message="Pagination parameters must be valid integers") from exc

    sort_param = query_params.pop("orderBy", "timestamp" if collection_name == "apis" else "order")
    sort_order = -1 if query_params.pop("orderType", "asc").lower() == "desc" else 1

    rss_date_range: dict[str, Any] | None = None
    if collection_name == "rss":
        rss_date_range = apply_rss_date_filters(query_params)
    filter_dict = build_filter(query_params)

    logger.debug(f"Querying collection: {collection_name}, Filter: {filter_dict}, rssDateRange: {rss_date_range}")
    sort_list = _build_sort_list(sort_param, sort_order)

    projection = _build_projection(collection_name, fields_param, exclude_fields_param)
    collection = db.db[collection_name]

    if rss_date_range is not None:
        data, total = await _query_with_rss_date_filter(
            collection, filter_dict, projection, sort_list, rss_date_range, page_num, page_size
        )
    else:
        data, total = await _query_with_facet(
            collection, collection_name, filter_dict, projection, sort_list, page_num, page_size
        )

    total_pages = (total + page_size - 1) // page_size

    for doc in data:
        if "key" not in doc:
            if "_id" in doc:
                doc["key"] = str(doc["_id"])
            else:
                doc["key"] = str(uuid.uuid4())
            logger.warning(f"Document missing key field, auto-generated: {doc['key']}")

    return {
        "list": data,
        "total": total,
        "pageNum": page_num,
        "pageSize": page_size,
        "totalPages": total_pages,
    }


async def get_document_detail(params: dict[str, Any]) -> dict[str, Any]:
    collection_name = params.get("collection_name") or params.get("cname")
    doc_id = params.get("id")

    if not collection_name or not doc_id:
        raise BusinessException(ErrorCode.INVALID_PARAMS, message="collection_name/cname and id are required")

    await db.initialize()
    collection = db.db[collection_name]
    projection = {"_id": 0}
    if collection_name == "sessions":
        projection["pageContent"] = 0
    if collection_name == "users":
        projection["password"] = 0

    from shared.cache import cache

    cache_key = f"data:doc:{collection_name}:{doc_id}"

    async def _fetch():
        doc = await collection.find_one({"key": doc_id}, projection)
        if not doc:
            raise BusinessException(ErrorCode.DATA_NOT_FOUND, message=f"Data with ID {doc_id} not found")
        return doc

    try:
        return await cache.get_or_set(cache_key, _fetch, ttl=CACHE_TTL.get("data:document", 60))
    except BusinessException:
        raise
    except Exception:
        return await _fetch()


async def count_documents(params: dict[str, Any]) -> dict[str, Any]:
    collection_name = params.get("collection_name") or params.get("cname")
    if not collection_name:
        raise BusinessException(ErrorCode.INVALID_PARAMS, message="Collection name (collection_name/cname) is required")

    query_params = params.copy()
    query_params.pop("cname", None)
    query_params.pop("collection_name", None)

    filter_param = query_params.pop("filter", None)
    if filter_param and isinstance(filter_param, dict):
        query_params.update(filter_param)

    group_by = query_params.pop("groupBy", None)

    await db.initialize()
    collection = db.db[collection_name]
    filter_dict = build_filter(query_params)

    if group_by:
        pipeline = [
            {"$match": filter_dict},
            {"$group": {"_id": f"${group_by}", "count": {"$sum": 1}}},
        ]
        cursor = collection.aggregate(pipeline)
        groups = [{"value": doc["_id"], "count": doc["count"]} async for doc in cursor]
        return {"groups": groups, "total": sum(g["count"] for g in groups)}
    total = await collection.count_documents(filter_dict)
    return {"count": total}


# ── Private helpers ──────────────────────────────────────────────────────────


def _build_sort_list(sort_param: str, sort_order: int) -> list[tuple]:
    """Build MongoDB sort list with a tiebreaker on 'order'.

    The primary sort field plus a stable 'order' tiebreaker so pagination
    stays deterministic across pages.
    """
    if sort_param == "order":
        return [("order", sort_order)]
    return [(sort_param, sort_order), ("order", 1)]


def _build_projection(
    collection_name: str,
    fields_param: str | None,
    exclude_fields_param: str | None,
) -> dict[str, int]:
    """Build MongoDB projection dict from fields/excludeFields params."""
    if fields_param:
        fields = [f.strip() for f in str(fields_param).split(",") if f.strip()]
        if "key" not in fields:
            fields.append("key")
        if collection_name == "sessions":
            fields = [f for f in fields if f != "pageContent"]
        if collection_name == "users":
            fields = [f for f in fields if f != "password"]
        return {"_id": 0, **{f: 1 for f in fields}}
    elif exclude_fields_param:
        exclude_fields = [f.strip() for f in str(exclude_fields_param).split(",") if f.strip()]
        if "key" in exclude_fields:
            exclude_fields.remove("key")
        if collection_name == "sessions" and "pageContent" not in exclude_fields:
            exclude_fields.append("pageContent")
        if collection_name == "users" and "password" not in exclude_fields:
            exclude_fields.append("password")
        return {"_id": 0, **{f: 0 for f in exclude_fields}}
    elif collection_name == "sessions":
        return {"_id": 0, "pageContent": 0}
    elif collection_name == "users":
        return {"_id": 0, "password": 0}
    return {"_id": 0}


async def _query_with_rss_date_filter(
    collection, filter_dict, projection, sort_list, rss_date_range, page_num, page_size
) -> tuple[list[dict[str, Any]], int]:
    start_ms = rss_date_range.get("start_ms")
    end_ms = rss_date_range.get("end_ms")
    cursor = collection.find(filter_dict, projection).sort(sort_list)
    all_docs: list[dict[str, Any]] = []
    async for doc in cursor:
        ts = rss_doc_published_ms(doc)
        if ts is None:
            continue
        if start_ms is not None and ts < start_ms:
            continue
        if end_ms is not None and ts > end_ms:
            continue
        all_docs.append(doc)
    total = len(all_docs)
    start_idx = (page_num - 1) * page_size
    end_idx = start_idx + page_size
    return all_docs[start_idx:end_idx], total


async def _query_with_facet(
    collection, collection_name, filter_dict, projection, sort_list, page_num, page_size
) -> tuple[list[dict[str, Any]], int]:
    sort_dict = {k: v for k, v in sort_list}
    pipeline: list[dict[str, Any]] = [{"$match": filter_dict}]
    if sort_dict:
        pipeline.append({"$sort": sort_dict})
    pipeline.append(
        {
            "$facet": {
                "data": [
                    {"$skip": (page_num - 1) * page_size},
                    {"$limit": page_size},
                    {"$project": projection},
                ],
                "total": [{"$count": "count"}],
            }
        }
    )
    try:
        cursor = collection.aggregate(pipeline, maxTimeMS=_QUERY_MAX_TIME_MS)
        results = await cursor.to_list(length=1)
        if results:
            data = results[0].get("data", [])
            total_counts = results[0].get("total", [])
            total = total_counts[0]["count"] if total_counts else 0
        else:
            data, total = [], 0
    except Exception as e:
        logger.warning(f"$facet query failed, falling back to find+count: {e}")
        cursor = (
            collection.find(filter_dict, projection)
            .sort(sort_list)
            .skip((page_num - 1) * page_size)
            .limit(page_size)
            .max_time_ms(_QUERY_MAX_TIME_MS)
        )
        data = [doc async for doc in cursor]
        total = await collection.count_documents(filter_dict, maxTimeMS=_QUERY_MAX_TIME_MS)
    return data, total
