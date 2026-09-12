"""
Tag Service — global tag management with hierarchy, merge, and cleanup.

RPC entry: services.tags.tag_service.<method>
"""
import logging
from datetime import datetime, timezone
from typing import Any

from data.database import db
from data.repository import query_documents, create_document, update_document, delete_document
from shared.error_codes import ErrorCode
from shared.exceptions import BusinessException

logger = logging.getLogger(__name__)

COLLECTION = "tags"


async def list_tags(parameters: dict[str, Any]) -> dict[str, Any]:
    """List all tags, optionally filtered by parent_id or category."""
    filter_dict: dict[str, Any] = {}
    if "parent_id" in parameters:
        filter_dict["parent_id"] = parameters["parent_id"]
    if "category" in parameters:
        filter_dict["category"] = parameters["category"]

    return await query_documents(
        COLLECTION,
        filter_dict,
        page_size=parameters.get("pageSize", 500),
        order_by="name",
        order_type="asc",
    )


async def create_tag(parameters: dict[str, Any]) -> dict[str, Any]:
    """Create a new tag."""
    data = parameters.get("data", {})
    name = data.get("name", "").strip()
    if not name:
        raise BusinessException(ErrorCode.INVALID_PARAMS, message="name is required")

    now = datetime.now(timezone.utc).isoformat()
    doc = {
        "key": data.get("key") or f"tag_{name.lower().replace(' ', '_')}",
        "name": name,
        "parent_id": data.get("parent_id"),
        "color": data.get("color", "#409eff"),
        "icon": data.get("icon", ""),
        "category": data.get("category", ""),
        "description": data.get("description", ""),
        "usage_count": 0,
        "created_at": now,
        "updated_at": now,
    }
    return await create_document(COLLECTION, doc)


async def update_tag(parameters: dict[str, Any]) -> dict[str, Any]:
    """Update a tag."""
    key = parameters.get("key", "")
    data = parameters.get("data", {})
    if not key:
        raise BusinessException(ErrorCode.INVALID_PARAMS, message="key is required")

    data["updated_at"] = datetime.now(timezone.utc).isoformat()
    return await update_document(COLLECTION, key, data)


async def delete_tag(parameters: dict[str, Any]) -> dict[str, Any]:
    """Delete a tag and update children to have no parent."""
    key = parameters.get("key", "")
    if not key:
        raise BusinessException(ErrorCode.INVALID_PARAMS, message="key is required")

    # Unlink children
    await db.db[COLLECTION].update_many(
        {"parent_id": key}, {"$set": {"parent_id": None, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )

    return await delete_document(COLLECTION, key)


async def merge_tags(parameters: dict[str, Any]) -> dict[str, Any]:
    """Merge source tag into target tag. All references to source are updated to target."""
    source_key = parameters.get("source_key", "")
    target_key = parameters.get("target_key", "")
    if not source_key or not target_key:
        raise BusinessException(ErrorCode.INVALID_PARAMS, message="source_key and target_key are required")
    if source_key == target_key:
        raise BusinessException(ErrorCode.INVALID_PARAMS, message="source and target must differ")

    target_doc = await db.db[COLLECTION].find_one({"key": target_key})
    if not target_doc:
        raise BusinessException(ErrorCode.RESOURCE_NOT_FOUND, message=f"Target tag {target_key} not found")

    # Update all documents that reference the source tag
    target_name = target_doc.get("name", "")
    for cname in ["issues", "bugs", "projects", "knowledge_files"]:
        result = await db.db[cname].update_many(
            {"tags": source_key},
            {"$set": {"tags.$[elem]": target_key, "updated_at": datetime.now(timezone.utc).isoformat()}},
            array_filters=[{"elem": source_key}],
        )
        logger.info(f"Updated {result.modified_count} docs in {cname}: {source_key} → {target_key}")

    # Update usage count on target
    total_count = 0
    for cname in ["issues", "bugs", "projects", "knowledge_files"]:
        total_count += await db.db[cname].count_documents({"tags": target_key})
    await db.db[COLLECTION].update_one(
        {"key": target_key}, {"$set": {"usage_count": total_count, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )

    # Delete source tag
    await db.db[COLLECTION].delete_one({"key": source_key})
    return {"code": 0, "message": f"Merged {source_key} → {target_key}", "data": {"target": target_key}}


async def cleanup_unused(parameters: dict[str, Any]) -> dict[str, Any]:
    """Find and delete tags with zero usage count."""
    _ = parameters
    unused = await db.db[COLLECTION].find({"usage_count": 0}).to_list(length=None)
    if unused:
        keys = [doc["key"] for doc in unused]
        result = await db.db[COLLECTION].delete_many({"key": {"$in": keys}})
        return {"code": 0, "message": "ok", "data": {"deleted": result.deleted_count, "keys": keys}}
    return {"code": 0, "message": "ok", "data": {"deleted": 0, "keys": []}}


async def tag_usage_stats(parameters: dict[str, Any]) -> dict[str, Any]:
    """Return usage statistics for all tags."""
    _ = parameters
    tags = await db.db[COLLECTION].find({}).sort("usage_count", -1).to_list(length=None)
    total = await db.db[COLLECTION].count_documents({})
    unused = await db.db[COLLECTION].count_documents({"usage_count": 0})
    return {
        "code": 0,
        "message": "ok",
        "data": {
            "total": total,
            "unused": unused,
            "top_tags": tags[:20],
        },
    }