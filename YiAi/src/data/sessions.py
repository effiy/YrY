"""Sessions maintenance service layer — encapsulates database access for use by routes"""
import logging
from typing import List, Dict, Any
from data.database import db
from shared.config import settings

logger = logging.getLogger(__name__)


async def get_all_sessions() -> List[Dict[str, Any]]:
    """Get all sessions documents"""
    await db.initialize()
    collection = db.db[settings.collection_sessions]
    sessions = []
    cursor = collection.find({})
    async for doc in cursor:
        sessions.append(doc)
    return sessions


async def delete_session_by_key(session_key: str) -> int:
    """Delete a single session by key, return delete count"""
    await db.initialize()
    collection = db.db[settings.collection_sessions]
    result = await collection.delete_one({'key': session_key})
    return result.deleted_count
