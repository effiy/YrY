"""Translation memory service — caches translations and enables reuse.

Stores translation pairs in MongoDB `translation_memory` collection.
When a source text matches a previous translation (same text, from/to),
returns the cached result instead of calling translation APIs again.
"""

from datetime import datetime, timezone
import hashlib
import logging

from data.database import db

logger = logging.getLogger(__name__)

COLLECTION = "translation_memory"


def _hash(text: str) -> str:
    return hashlib.sha256(text.encode()).hexdigest()[:16]


async def lookup(text: str, from_lang: str, to_lang: str) -> dict | None:
    """Look up cached translation. Returns None if not found."""
    try:
        await db.initialize()
        text_hash = _hash(text + from_lang + to_lang)
        doc = await db.db[COLLECTION].find_one({"text_hash": text_hash}, {"_id": 0})
        if doc:
            doc["hit"] = True
            return doc
    except Exception as e:
        logger.debug(f"Translation memory lookup failed: {e!s}")
    return None


async def store(text: str, from_lang: str, to_lang: str, result: str, provider: str) -> None:
    """Store translation in memory."""
    try:
        await db.initialize()
        text_hash = _hash(text + from_lang + to_lang)
        await db.db[COLLECTION].update_one(
            {"text_hash": text_hash},
            {"$set": {
                "source": text,
                "target": result,
                "from_lang": from_lang,
                "to_lang": to_lang,
                "provider": provider,
                "updated_at": datetime.now(timezone.utc),
            }, "$setOnInsert": {"created_at": datetime.now(timezone.utc)}},
            upsert=True,
        )
    except Exception as e:
        logger.debug(f"Translation memory store failed: {e!s}")


async def search_by_prefix(prefix: str, from_lang: str, to_lang: str, limit: int = 10) -> list[dict]:
    """Search translation memory by source prefix (for autocomplete/suggestions)."""
    try:
        await db.initialize()
        cursor = db.db[COLLECTION].find(
            {"source": {"$regex": f"^{prefix}", "$options": "i"}, "from_lang": from_lang, "to_lang": to_lang},
            {"_id": 0, "source": 1, "target": 1, "provider": 1, "updated_at": 1},
        ).sort("updated_at", -1).limit(limit)
        return await cursor.to_list(length=limit)
    except Exception as e:
        logger.debug(f"Translation memory search failed: {e!s}")
        return []


async def stats() -> dict:
    """Get translation memory statistics."""
    try:
        await db.initialize()
        total = await db.db[COLLECTION].count_documents({})
        if total == 0:
            return {"total": 0, "languages": [], "providers": {}}
        pipeline = [
            {"$group": {"_id": "$from_lang", "to_languages": {"$addToSet": "$to_lang"}}},
        ]
        langs = await db.db[COLLECTION].aggregate(pipeline).to_list(length=None)
        prov_pipeline = [{"$group": {"_id": "$provider", "count": {"$sum": 1}}}]
        provs = await db.db[COLLECTION].aggregate(prov_pipeline).to_list(length=None)
        return {
            "total": total,
            "languages": langs,
            "providers": {p["_id"]: p["count"] for p in provs},
        }
    except Exception:
        return {"total": 0, "languages": [], "providers": {}}
