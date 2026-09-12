"""Notification SSE route — dedicated endpoint for EventSource connections.

The YiVad frontend uses the native EventSource API, which does not support
custom headers (Authorization). We pass the auth token as a query parameter
instead, and validate it here.

URL: GET /notification/stream?token=<jwt>
"""
import logging
import asyncio
from fastapi import APIRouter, Query, Request
from fastapi.responses import StreamingResponse
import json

from shared.config import settings
from shared.response import success
from data.database import db

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/notification", tags=["Notification"])

COLLECTION = "notifications"


def _now() -> str:
    from datetime import datetime, timezone
    return datetime.now(timezone.utc).isoformat()


@router.get("/stream")
async def notification_stream(
    request: Request,
    token: str = Query(default=""),
    poll_interval: float = Query(default=2.0, ge=1.0, le=30.0),
):
    """SSE endpoint for real-time notification delivery.

    The client connects via EventSource:
        const es = new EventSource('/notification/stream?token=xxx')
        es.onmessage = (e) => { const notif = JSON.parse(e.data); ... }

    Authentication (when enabled) validates the token from the query parameter.
    """
    # Optional auth validation
    if settings.middleware_auth_enabled and token:
        try:
            from domain.auth.core import verify_token
            verify_token(token)
        except Exception:
            from shared.response import fail
            from shared.error_codes import ErrorCode
            return fail(ErrorCode.UNAUTHORIZED, message="Invalid or expired token")

    async def event_generator():
        await db.initialize()
        collection = db.db[COLLECTION]
        last_seen = _now()

        logger.info("Notification SSE stream connected")

        try:
            # Send initial connection event
            yield f"event: connected\ndata: {json.dumps({'ok': True})}\n\n".encode()

            while True:
                # Check for client disconnect
                if await request.is_disconnected():
                    logger.info("Notification SSE client disconnected")
                    break

                query = {"createdAt": {"$gt": last_seen}}
                cursor = collection.find(query, {"_id": 0}).sort("createdAt", 1)
                new_docs = [doc async for doc in cursor]

                for doc in new_docs:
                    yield f"data: {json.dumps(doc, ensure_ascii=False)}\n\n".encode()
                    if doc.get("createdAt", "") > last_seen:
                        last_seen = doc["createdAt"]

                # Heartbeat keeps the connection alive
                yield f": heartbeat {_now()}\n\n".encode()

                await asyncio.sleep(poll_interval)
        except asyncio.CancelledError:
            logger.info("Notification SSE stream cancelled")
        except Exception as e:
            logger.error(f"Notification SSE error: {e}", exc_info=True)
            yield f"event: error\ndata: {json.dumps({'message': str(e)})}\n\n".encode()

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


@router.get("/unread-count")
async def unread_count():
    """Return the number of unread notifications."""
    await db.initialize()
    count = await db.db[COLLECTION].count_documents({"read": False})
    return success(data={"count": count})