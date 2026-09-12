"""Chat record persistence — MongoDB-backed chat history for non-agent chat.

Pi-inspired session management: save, list, and load chat sessions so the
frontend can show conversation history and resume past conversations.
"""
from __future__ import annotations

import logging
import time
from typing import Any, Dict, List, Optional

from data.database import db
from shared.config import settings

logger = logging.getLogger(__name__)

_CHAT_HISTORY_TTL = 86400 * 7  # 7 days


async def save_chat_record(
    session_id: str,
    user_message: str,
    assistant_message: str,
    model: str = "",
    provider: str = "",
    usage: Optional[Dict[str, int]] = None,
    metadata: Optional[Dict[str, Any]] = None,
) -> None:
    """Append a chat turn to the session's message list (upsert)."""
    if not session_id:
        return
    await db.initialize()
    collection = db.db[settings.collection_chat_records]
    turn = {
        "user": user_message,
        "assistant": assistant_message,
        "model": model,
        "provider": provider,
        "usage": usage or {},
        "timestamp": time.time(),
        "metadata": metadata or {},
    }
    await collection.update_one(
        {"session_id": session_id},
        {
            "$push": {"turns": turn},
            "$set": {"updated_at": time.time()},
            "$setOnInsert": {"created_at": time.time()},
        },
        upsert=True,
    )


async def list_chat_sessions(
    limit: int = 50,
    offset: int = 0,
) -> List[Dict[str, Any]]:
    """Return recent chat sessions (newest first), excluding expired ones."""
    await db.initialize()
    collection = db.db[settings.collection_chat_records]
    now = time.time()
    cursor = collection.find().sort("updated_at", -1).skip(offset).limit(limit)
    sessions: List[Dict[str, Any]] = []
    async for doc in cursor:
        updated = doc.get("updated_at", 0)
        if now - updated > _CHAT_HISTORY_TTL:
            continue
        turns = doc.get("turns", [])
        first_msg = turns[0].get("user", "")[:100] if turns else ""
        sessions.append({
            "session_id": doc.get("session_id", ""),
            "turn_count": len(turns),
            "first_message": first_msg,
            "created_at": doc.get("created_at", 0),
            "updated_at": updated,
        })
    return sessions


async def load_chat_session(session_id: str) -> Optional[Dict[str, Any]]:
    """Return a single session's full message history, or None."""
    if not session_id:
        return None
    await db.initialize()
    collection = db.db[settings.collection_chat_records]
    doc = await collection.find_one({"session_id": session_id})
    if not doc:
        return None
    return {
        "session_id": doc.get("session_id", ""),
        "turns": doc.get("turns", []),
        "created_at": doc.get("created_at", 0),
        "updated_at": doc.get("updated_at", 0),
    }


async def delete_chat_session(session_id: str) -> bool:
    """Delete a session. Returns True if a document was removed."""
    if not session_id:
        return False
    await db.initialize()
    collection = db.db[settings.collection_chat_records]
    result = await collection.delete_one({"session_id": session_id})
    return result.deleted_count > 0
