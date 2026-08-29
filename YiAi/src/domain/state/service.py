"""State store service — CRUD for state records in MongoDB."""
import logging
from typing import Any, Optional

from data.database import db

logger = logging.getLogger(__name__)


class StateStoreService:
    """Minimal state record service backed by MongoDB."""

    _collection_name = "state_records"

    async def _collection(self):
        await db.initialize()
        return db.db[self._collection_name]

    async def create(self, data: dict) -> dict:
        col = await self._collection()
        from shared.utils import get_current_time

        now = get_current_time()
        if "key" not in data:
            import uuid
            data["key"] = str(uuid.uuid4())
        data.setdefault("createdTime", now)
        data.setdefault("updatedTime", now)
        await col.insert_one(data)
        return data

    async def query(
        self,
        record_type: Optional[str] = None,
        tags: Optional[list[str]] = None,
        title_contains: Optional[str] = None,
        created_after: Optional[str] = None,
        created_before: Optional[str] = None,
        page_num: int = 1,
        page_size: int = 2000,
    ) -> dict:
        col = await self._collection()
        filter_dict: dict[str, Any] = {}
        if record_type:
            filter_dict["record_type"] = record_type
        if tags:
            filter_dict["tags"] = {"$in": tags}
        if title_contains:
            filter_dict["title"] = {"$regex": title_contains, "$options": "i"}
        if created_after or created_before:
            time_filter: dict = {}
            if created_after:
                time_filter["$gte"] = created_after
            if created_before:
                time_filter["$lte"] = created_before
            filter_dict["createdTime"] = time_filter

        total = await col.count_documents(filter_dict)
        cursor = col.find(filter_dict, {"_id": 0}).sort("createdTime", -1).skip((page_num - 1) * page_size).limit(page_size)
        data = [doc async for doc in cursor]

        return {
            "list": data,
            "total": total,
            "pageNum": page_num,
            "pageSize": page_size,
        }

    async def get(self, key: str) -> Optional[dict]:
        col = await self._collection()
        return await col.find_one({"key": key}, {"_id": 0})

    async def update(self, key: str, data: dict) -> dict:
        col = await self._collection()
        from shared.utils import get_current_time

        data["updatedTime"] = get_current_time()
        data.pop("key", None)
        result = await col.update_one({"key": key}, {"$set": data})
        if result.matched_count == 0:
            raise ValueError(f"Record with key {key} not found")
        return await self.get(key)

    async def delete(self, key: str) -> dict:
        col = await self._collection()
        result = await col.delete_one({"key": key})
        if result.deleted_count == 0:
            raise ValueError(f"Record with key {key} not found")
        return {"key": key, "deleted": True}
