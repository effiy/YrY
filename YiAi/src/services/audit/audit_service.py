from typing import Dict, Any

from data.database import db
from shared.config import settings


async def query_audit_logs(params: Dict[str, Any]) -> Dict[str, Any]:
    """Query audit logs with optional filters. Admin-only in production."""
    await db.initialize()
    collection = db.db[settings.audit_collection]

    filter_dict: Dict[str, Any] = {}
    for field in ("actor", "collection", "operation"):
        if params.get(field):
            filter_dict[field] = params[field]

    if params.get("start_time"):
        filter_dict.setdefault("timestamp", {})
        filter_dict["timestamp"]["$gte"] = params["start_time"]
    if params.get("end_time"):
        filter_dict.setdefault("timestamp", {})
        filter_dict["timestamp"]["$lte"] = params["end_time"]

    limit = min(params.get("limit", 50), 500)
    offset = max(params.get("offset", 0), 0)

    cursor = collection.find(filter_dict).sort("timestamp", -1).skip(offset).limit(limit)
    data = [doc async for doc in cursor]
    total = await collection.count_documents(filter_dict)

    for doc in data:
        doc.pop("_id", None)

    return {
        "list": data,
        "total": total,
        "limit": limit,
        "offset": offset,
    }
