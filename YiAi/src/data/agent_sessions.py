"""Agent session-log persistence — MongoDB-backed source of truth for agent run trajectories.

The agent loop persists each finished run's full trajectory (including
`tool_call_id` and `tool_result` names) so a "继续" resume survives a server
restart, not just the 1h in-memory TTL in `domain/ai/agent.py`. Read-time
expiry mirrors that TTL: a document whose `updated_at` is older than
`_SESSION_HISTORY_TTL` is ignored on load (no extra scheduler needed).
"""
import logging
import time
from typing import Any, Dict, List, Optional

from data.database import db
from shared.config import settings

logger = logging.getLogger(__name__)

_SESSION_HISTORY_TTL = 3600.0  # seconds, mirrors domain/ai/agent.py


async def save_agent_session(session_id: str, messages: List[Dict[str, Any]]) -> None:
    """Upsert a finished run's trajectory for later resume (no-op without session_id)."""
    if not session_id:
        return
    await db.initialize()
    collection = db.db[settings.collection_agent_sessions]
    document = {
        "session_id": session_id,
        "messages": messages,
        "updated_at": time.time(),
    }
    await collection.replace_one({"session_id": session_id}, document, upsert=True)


async def load_agent_session(session_id: str) -> Optional[List[Dict[str, Any]]]:
    """Return the persisted trajectory if present and not expired, else None."""
    if not session_id:
        return None
    await db.initialize()
    collection = db.db[settings.collection_agent_sessions]
    document = await collection.find_one({"session_id": session_id})
    if not document:
        return None
    updated_at = document.get("updated_at")
    if updated_at is None or time.time() - updated_at > _SESSION_HISTORY_TTL:
        logger.info(f"Agent session {session_id!r} expired — ignoring persisted trajectory")
        return None
    return document.get("messages")
