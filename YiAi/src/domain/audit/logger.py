import asyncio
import logging
import uuid
from datetime import datetime, timezone
from typing import Dict, Any

from data.database import db
from shared.config import settings

logger = logging.getLogger(__name__)


class AuditLogger:
    """Async audit-log writer. Fire-and-forget — never blocks the caller."""

    _initialized: bool = False

    @classmethod
    async def _ensure_indexes(cls) -> None:
        if cls._initialized:
            return
        await db.initialize()
        coll = db.db[settings.audit_collection]
        await coll.create_index([("timestamp", -1)])
        await coll.create_index([("actor", 1), ("timestamp", -1)])
        await coll.create_index([("collection", 1), ("timestamp", -1)])
        await coll.create_index([("operation", 1), ("timestamp", -1)])
        expire_seconds = settings.audit_retention_days * 86400
        await coll.create_index(
            [("timestamp", 1)],
            expireAfterSeconds=expire_seconds,
            background=True,
        )
        cls._initialized = True
        logger.info("Audit log indexes ensured (TTL=%dd)", settings.audit_retention_days)

    @classmethod
    async def write(cls, entry: Dict[str, Any]) -> None:
        try:
            await cls._ensure_indexes()
            entry.setdefault("log_id", str(uuid.uuid4()))
            entry.setdefault("timestamp", datetime.now(timezone.utc))
            await db.db[settings.audit_collection].insert_one(entry)
        except Exception as e:
            logger.error("Audit log write failed: %s", e)

    @classmethod
    def write_async(cls, entry: Dict[str, Any]) -> None:
        _task = asyncio.create_task(cls.write(entry))
