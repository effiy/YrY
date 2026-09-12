"""Notification service — RPC-callable methods for the YiVad notification center.

The YiVad frontend calls these via the RPC dispatcher:
  POST /  body: {module_name: "services.notification.notification_service", method_name: "...", parameters: {...}}

SSE streaming is provided through a dedicated route (/notification/stream) for clean
URL-based EventSource connections that carry the auth token via query parameter.
"""
import logging
import asyncio
import json
from typing import Dict, Any, Optional
from datetime import datetime, timezone

from data.database import db

logger = logging.getLogger(__name__)

COLLECTION = "notifications"

# ── helpers ──

def _now() -> str:
    return datetime.now(timezone.utc).isoformat()

async def _ensure_collection():
    await db.initialize()

# ── Notification CRUD ──

async def get_notifications(params: Dict[str, Any]) -> Dict[str, Any]:
    """Query notifications with pagination, type filter, and search.

    Called via RPC: method_name="get_notifications", parameters={filter: {page, size, type, read, search}}
    """
    await _ensure_collection()
    filter_param = params.get("filter", {})
    page = max(1, int(filter_param.get("page", 1)))
    size = min(100, max(1, int(filter_param.get("size", 20))))

    query: Dict[str, Any] = {}
    if filter_param.get("type"):
        query["type"] = filter_param["type"]
    if "read" in filter_param and filter_param["read"] is not None:
        query["read"] = filter_param["read"]
    if filter_param.get("search"):
        q = filter_param["search"]
        query["$or"] = [
            {"title": {"$regex": q, "$options": "i"}},
            {"message": {"$regex": q, "$options": "i"}},
        ]

    collection = db.db[COLLECTION]
    total = await collection.count_documents(query)
    cursor = collection.find(query, {"_id": 0}).sort("createdAt", -1) \
        .skip((page - 1) * size).limit(size)
    items = [doc async for doc in cursor]

    return {
        "list": items,
        "total": total,
        "page": page,
        "size": size,
        "totalPages": (total + size - 1) // size if total else 0,
    }

async def mark_as_read(params: Dict[str, Any]) -> Dict[str, Any]:
    """Mark a single notification as read."""
    await _ensure_collection()
    notification_id = params.get("notification_id")
    if not notification_id:
        raise ValueError("notification_id is required")
    await db.db[COLLECTION].update_one(
        {"id": notification_id}, {"$set": {"read": True}}
    )
    return {"ok": True}

async def mark_all_as_read(params: Dict[str, Any]) -> Dict[str, Any]:
    """Mark all notifications as read."""
    await _ensure_collection()
    await db.db[COLLECTION].update_many(
        {"read": False}, {"$set": {"read": True}}
    )
    return {"ok": True}

async def delete_notification(params: Dict[str, Any]) -> Dict[str, Any]:
    """Delete a notification by id."""
    await _ensure_collection()
    notification_id = params.get("notification_id")
    if not notification_id:
        raise ValueError("notification_id is required")
    await db.db[COLLECTION].delete_one({"id": notification_id})
    return {"ok": True}

# ── Preferences ──

async def get_preferences(params: Dict[str, Any]) -> Dict[str, Any]:
    """Return default notification preferences (stored client-side)."""
    return {
        "preferences": {
            "system": True,
            "user_action": True,
            "ai": True,
            "error": True,
        },
        "quietHours": {"enabled": False, "start": "22:00", "end": "08:00"},
    }

async def save_preferences(params: Dict[str, Any]) -> Dict[str, Any]:
    """Acknowledge saved preferences (actual storage is client-side localStorage)."""
    return {"ok": True}

# ── SSE notification stream (RPC-callable async generator) ──

async def stream_notifications(params: Dict[str, Any]) -> None:
    """Async generator: poll DB for new notifications and yield SSE frames.

    Called via RPC POST / with streaming response.
    The RPC dispatcher detects the async generator and returns a StreamingResponse.

    Parameters:
        token: auth token (validated if auth is enabled)
        poll_interval: seconds between polls (default 2)
    """
    await _ensure_collection()
    poll_interval = float(params.get("poll_interval", 2))
    collection = db.db[COLLECTION]

    # Start from the newest notification timestamp
    last_seen = _now()

    logger.info("Notification SSE stream started")

    try:
        while True:
            query = {"createdAt": {"$gt": last_seen}}
            cursor = collection.find(query, {"_id": 0}).sort("createdAt", 1)
            new_docs = [doc async for doc in cursor]

            for doc in new_docs:
                yield doc
                if doc.get("createdAt", "") > last_seen:
                    last_seen = doc["createdAt"]

            # Send heartbeat to keep connection alive
            yield {"type": "heartbeat", "timestamp": _now()}

            await asyncio.sleep(poll_interval)
    except asyncio.CancelledError:
        logger.info("Notification SSE stream cancelled")
        raise
    except Exception as e:
        logger.error(f"Notification SSE error: {e}", exc_info=True)
        yield {"type": "error", "message": str(e)}

# ── Notification creation (called by other modules) ──

async def create_notification(
    type: str,
    title: str,
    message: str,
    priority: str = "medium",
    action_url: Optional[str] = None,
    action_label: Optional[str] = None,
    source: Optional[str] = None,
    metadata: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    """Create a notification document. Called by other backend modules when events occur."""
    await _ensure_collection()
    import uuid

    doc = {
        "id": f"notif_{uuid.uuid4().hex[:12]}",
        "type": type,
        "priority": priority,
        "title": title,
        "message": message,
        "read": False,
        "createdAt": _now(),
    }
    if action_url:
        doc["actionUrl"] = action_url
    if action_label:
        doc["actionLabel"] = action_label
    if source:
        doc["source"] = source
    if metadata:
        doc["metadata"] = metadata

    await db.db[COLLECTION].insert_one(doc)
    logger.info(f"Notification created: {doc['id']} — {title}")
    return doc