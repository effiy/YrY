"""MongoDB Data Access Layer (Singleton)
- Manages connections, indexes, and common CRUD wrappers
- Includes slow-query monitoring via PyMongo CommandListener
"""
from datetime import datetime, timezone
import logging
import threading
import time
from typing import Any, Dict, List, Optional

from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import monitoring

from shared.config import settings

logger = logging.getLogger(__name__)

# Query timeout for find/aggregate operations (ms). Prevents slow queries
# from holding connections indefinitely.
_QUERY_MAX_TIME_MS = getattr(settings, 'mongodb_query_timeout_ms', 30000)

# Motor cursor batch_size — default is 101 documents which means ~10
# round-trips for a 1000-doc result. Increasing to 500 reduces round-trips
# by 5× at the cost of ~50KB more memory per batch.
_CURSOR_BATCH_SIZE = getattr(settings, 'mongodb_cursor_batch_size', 500)

# Slow query log threshold (ms) — queries exceeding this emit a WARNING.
_SLOW_QUERY_THRESHOLD_MS = getattr(settings, 'mongodb_slow_query_threshold_ms', 200)


class _SlowQueryLogger(monitoring.CommandListener):
    """Log a WARNING when any MongoDB command exceeds ``_SLOW_QUERY_THRESHOLD_MS``.

    Registers with PyMongo's global monitoring so it applies to all
    ``AsyncIOMotorClient`` instances — no per-client wiring needed.
    """

    def __init__(self, threshold_ms: int = _SLOW_QUERY_THRESHOLD_MS):
        self._threshold = threshold_ms
        self._starts: dict[int, float] = {}

    def started(self, event: monitoring.CommandStartedEvent):
        self._starts[event.request_id] = time.monotonic()

    def succeeded(self, event: monitoring.CommandSucceededEvent):
        t0 = self._starts.pop(event.request_id, None)
        if t0 is None:
            return
        elapsed_ms = (time.monotonic() - t0) * 1000
        if elapsed_ms >= self._threshold:
            cmd = event.command_name
            coll = getattr(event, "command", {}).get(event.command_name, "")
            if hasattr(coll, "startswith"):
                pass  # command value is the collection name for find/insert etc.
            logger.warning(
                f"Slow query: {cmd} {coll} — {elapsed_ms:.0f}ms "
                f"(threshold={self._threshold}ms)"
            )

    def failed(self, event: monitoring.CommandFailedEvent):
        self._starts.pop(event.request_id, None)


# Register once at import time — PyMongo global listener, applies to all clients.
_monitor = _SlowQueryLogger()
monitoring.register(_monitor)

# Collections where writes use w=0 (fire-and-forget) for lower latency.
# These collections store non-critical data where occasional write loss is
# acceptable: audit trails, state snapshots, chat history.
_LIGHTWRITE_COLLECTIONS: frozenset[str] = frozenset({
    settings.audit_collection,          # "audit_logs"
    settings.collection_state_records,  # "state_records"
    settings.collection_chat_records,   # "chat_records"
})

# Configurable from config.yaml: mongodb_lightwrite_enabled (default True)
_LIGHTWRITE_ENABLED: bool = getattr(settings, 'mongodb_lightwrite_enabled', True)


def _write_concern(collection_name: str) -> int:
    """Return w=0 for non-critical collections, w=1 for critical ones."""
    return 0 if (_LIGHTWRITE_ENABLED and collection_name in _LIGHTWRITE_COLLECTIONS) else 1


class MongoDB:
    """
    MongoDB Database Handler (Singleton)
    """
    _instance: Optional['MongoDB'] = None
    _lock: threading.Lock = threading.Lock()
    _client: AsyncIOMotorClient | None = None
    _db = None
    _initialized: bool = False

    def __new__(cls):
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    cls._instance = super().__new__(cls)
        return cls._instance

    async def initialize(self):
        """
        Initialize database connection and indexes

        Example:
            >>> await db.initialize()
        """
        if self._initialized:
            return

        if self._client is None:
            try:
                mongodb_url = settings.mongodb_url
                database_name = settings.mongodb_db_name

                # Configure connection pool
                self._client = AsyncIOMotorClient(
                    mongodb_url,
                    appname="YiAi",
                    maxPoolSize=settings.mongodb_max_pool_size,
                    minPoolSize=settings.mongodb_pool_size,
                    maxIdleTimeMS=30000,  # 30s idle connection lifetime
                    waitQueueTimeoutMS=10000,  # 10s queue wait for connection
                    socketTimeoutMS=30000,  # 30s socket I/O timeout
                    connectTimeoutMS=5000,  # 5s initial connection timeout
                    serverSelectionTimeoutMS=5000,  # 5s server selection
                    retryWrites=True,
                    retryReads=True,
                    maxConnecting=2,  # limit concurrent connection attempts
                )
                self._db = self._client[database_name]
                logger.info(f"MongoDB connected: {database_name}")

                # Ensure indexes
                await self._ensure_indexes()

                self._initialized = True
            except Exception as e:
                logger.error(f"MongoDB initialization failed: {e!s}")
                raise

    async def close(self):
        """
        Close database connection

        Example:
            >>> await db.close()
        """
        if self._client:
            self._client.close()
            self._client = None
            self._initialized = False
            logger.info("MongoDB connection closed")

    @property
    def db(self):
        if self._db is None:
            raise RuntimeError("Database not initialized. Call initialize() first.")
        return self._db

    async def _ensure_indexes(self):
        """
        Create necessary indexes for query performance.

        Each compound index is designed for a specific query pattern observed
        in the route handlers and repository layer. Background builds avoid
        blocking startup.
        """
        try:
            # RSS Link Unique Index
            await self._ensure_unique_index(settings.collection_rss, 'link')
            # Knowledge Files path Unique Index
            await self._ensure_unique_index(settings.collection_knowledge_files, 'path')
            # Knowledge Files category+path compound index — /knowledge-files?category=projects
            await self.db[settings.collection_knowledge_files].create_index(
                [("category", 1), ("path", 1)],
                background=True,
            )
            # State Records TTL index — auto-delete expired records
            await self.db[settings.collection_state_records].create_index(
                [("expiresAt", 1)],
                expireAfterSeconds=0,
                background=True,
            )
            # ── Compound indexes for common sort/filter patterns ──
            # sessions: sorted by updatedTime DESC (most list views)
            await self.db["sessions"].create_index(
                [("updatedTime", -1)], background=True,
            )
            # sessions: filtered by projectName + storyName (story task panel)
            await self.db["sessions"].create_index(
                [("projectName", 1), ("storyName", 1)], background=True,
            )
            # bugs: filtered by status + severity, sorted by updatedTime
            await self.db["bugs"].create_index(
                [("status", 1), ("severity", 1)], background=True,
            )
            # bugs: filtered by project, sorted by createdTime
            await self.db["bugs"].create_index(
                [("project", 1), ("createdTime", -1)], background=True,
            )
            # issues: filtered by project_key + status
            await self.db["issues"].create_index(
                [("project_key", 1), ("status", 1)], background=True,
            )
            # rss: sorted by createdTime DESC (feed list views)
            await self.db[settings.collection_rss].create_index(
                [("createdTime", -1)], background=True,
            )
            # menus: sorted by order (menu tree building)
            await self.db["menus"].create_index(
                [("order", 1)], background=True,
            )
            # chat_records: sorted by createdTime DESC
            await self.db[settings.collection_chat_records].create_index(
                [("createdTime", -1)], background=True,
            )
            # state_records: filtered by skill_name, sorted by createdTime
            await self.db[settings.collection_state_records].create_index(
                [("skill_name", 1), ("createdTime", -1)], background=True,
            )
            # audit_logs: filtered by collection + action, sorted by timestamp
            await self.db[settings.audit_collection].create_index(
                [("collection", 1), ("action", 1)], background=True,
            )
            logger.info("All indexes ensured")
        except Exception as e:
            logger.error(f"Index creation failed: {e!s}")

    async def _ensure_unique_index(self, collection_name: str, field: str):
        collection = self.db[collection_name]
        await collection.create_index([(field, 1)], unique=True, background=True)
        logger.info(f"Ensured unique index for {collection_name}.{field}")

    # Helper methods wrapper
    async def insert_one(self, collection_name: str, document: dict[str, Any]) -> str:
        """
        Insert a single document

        Args:
            collection_name: Collection name
            document: Document to insert

        Returns:
            str: Inserted document ID

        Example:
            >>> id = await db.insert_one("users", {"name": "test"})
        """
        if 'createdTime' not in document:
            document['createdTime'] = datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S')
        result = await self.db[collection_name].with_options(
            write_concern=_write_concern(collection_name)
        ).insert_one(document)
        return str(result.inserted_id)

    async def insert_many(self, collection_name: str, documents: list[dict[str, Any]]) -> list[str]:
        """
        Insert multiple documents

        Args:
            collection_name: Collection name
            documents: List of documents to insert

        Returns:
            List[str]: List of inserted document IDs

        Example:
            >>> ids = await db.insert_many("users", [{"name": "test1"}, {"name": "test2"}])
        """
        for doc in documents:
            if 'createdTime' not in doc:
                doc['createdTime'] = datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S')
        result = await self.db[collection_name].with_options(
            write_concern=_write_concern(collection_name)
        ).insert_many(documents)
        return [str(id) for id in result.inserted_ids]

    async def find_one(self, collection_name: str, query: dict[str, Any]) -> dict[str, Any] | None:
        """
        Find a single document

        Args:
            collection_name: Collection name
            query: Query criteria

        Returns:
            Optional[Dict[str, Any]]: Found document or None

        Example:
            >>> user = await db.find_one("users", {"name": "test"})
        """
        return await self.db[collection_name].find_one(query)

    async def find_many(
        self,
        collection_name: str,
        query: dict[str, Any],
        projection: dict[str, Any] | None = None,
    ) -> list[dict[str, Any]]:
        """
        Find multiple documents

        Args:
            collection_name: Collection name
            query: Query criteria
            projection: Optional projection

        Returns:
            List[Dict[str, Any]]: Matching documents
        """
        cursor = self.db[collection_name].find(query, projection).batch_size(_CURSOR_BATCH_SIZE)
        return [doc async for doc in cursor]

    async def delete_one(self, collection_name: str, query: dict[str, Any]) -> int:
        """
        Delete a single document

        Args:
            collection_name: Collection name
            query: Query criteria

        Returns:
            int: Number of deleted documents
        """
        result = await self.db[collection_name].delete_one(query)
        return result.deleted_count

# Global instance
db = MongoDB()

