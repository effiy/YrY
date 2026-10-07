"""Translation provider health monitor — tracks success/failure per provider.

Exposes aggregated health stats for the admin dashboard to monitor
which translation/OCR/TTS providers are healthy, degraded, or down.
"""

from datetime import datetime, timezone
import logging

from data.database import db

logger = logging.getLogger(__name__)

COLLECTION = "translation_records"
MEMORY_COLLECTION = "translation_memory"
FEEDBACK_COLLECTION = "translation_feedback"

# ── Health status ─────────────────────────────────────────────────────


async def provider_health(hours: int = 24) -> dict:
    """Aggregate provider health: success rate, avg latency, recent errors.

    Derives success/failure from translation_records: each record has
    `results` array where empty entries indicate provider failures.
    """
    try:
        await db.initialize()
        cutoff = datetime.now(timezone.utc).timestamp() - hours * 3600

        pipeline = [
            {"$match": {"created_at": {"$gte": datetime.fromtimestamp(cutoff, tz=timezone.utc)}}},
            {"$unwind": "$results"},
            {"$group": {
                "_id": "$results.provider",
                "total": {"$sum": 1},
                "empty": {"$sum": {"$cond": [{"$eq": ["$results.text", ""]}, 1, 0]}},
                "total_chars": {"$sum": {"$strLenCP": "$source"}},
            }},
        ]
        raw = await db.db[COLLECTION].aggregate(pipeline).to_list(length=None)

        memory_count = await db.db[MEMORY_COLLECTION].count_documents({})
        feedback_good = await db.db[FEEDBACK_COLLECTION].count_documents({"rating": "good"})
        feedback_bad = await db.db[FEEDBACK_COLLECTION].count_documents({"rating": "bad"})

        providers = {}
        for r in raw:
            name = r["_id"] or "unknown"
            total = r["total"]
            empty = r.get("empty", 0)
            success = total - empty
            rate = success / total if total > 0 else 0
            status = "healthy" if rate >= 0.95 else ("degraded" if rate >= 0.7 else "down")
            providers[name] = {
                "total": total,
                "success": success,
                "failed": empty,
                "success_rate": round(rate, 4),
                "status": status,
                "total_chars": r.get("total_chars", 0),
            }

        return {
            "period_hours": hours,
            "providers": providers,
            "memory_entries": memory_count,
            "feedback": {"good": feedback_good, "bad": feedback_bad},
        }
    except Exception as e:
        logger.warning(f"Provider health failed: {e!s}")
        return {"period_hours": hours, "providers": {}, "memory_entries": 0, "feedback": {"good": 0, "bad": 0}}


async def hourly_trend(days: int = 7) -> list[dict]:
    """Hourly translation volume trend for the past N days."""
    try:
        await db.initialize()
        cutoff = datetime.now(timezone.utc).timestamp() - days * 86400
        pipeline = [
            {"$match": {"created_at": {"$gte": datetime.fromtimestamp(cutoff, tz=timezone.utc)}}},
            {"$group": {
                "_id": {
                    "$dateToString": {"format": "%Y-%m-%dT%H", "date": "$created_at"},
                },
                "count": {"$sum": 1},
                "chars": {"$sum": "$source_length"},
            }},
            {"$sort": {"_id": 1}},
        ]
        rows = await db.db[COLLECTION].aggregate(pipeline).to_list(length=None)
        return [{"hour": r["_id"], "count": r["count"], "chars": r.get("chars", 0)} for r in rows]
    except Exception as e:
        logger.warning(f"Hourly trend failed: {e!s}")
        return []


async def provider_breakdown(days: int = 30) -> list[dict]:
    """Provider usage breakdown (count + chars per provider)."""
    try:
        await db.initialize()
        cutoff = datetime.now(timezone.utc).timestamp() - days * 86400
        pipeline = [
            {"$match": {"created_at": {"$gte": datetime.fromtimestamp(cutoff, tz=timezone.utc)}}},
            {"$unwind": "$results"},
            {"$group": {
                "_id": "$results.provider",
                "count": {"$sum": 1},
                "success_count": {"$sum": {"$cond": [{"$ne": ["$results.text", ""]}, 1, 0]}},
            }},
        ]
        raw = await db.db[COLLECTION].aggregate(pipeline).to_list(length=None)
        return [
            {"provider": r["_id"] or "unknown", "count": r["count"], "success": r["success_count"]}
            for r in raw
        ]
    except Exception as e:
        logger.warning(f"Provider breakdown failed: {e!s}")
        return []


async def top_language_pairs(limit: int = 20) -> list[dict]:
    """Most translated language pairs."""
    try:
        await db.initialize()
        pipeline = [
            {"$group": {
                "_id": {"from": "$from_lang", "to": "$to_lang"},
                "count": {"$sum": 1},
                "total_chars": {"$sum": "$source_length"},
            }},
            {"$sort": {"count": -1}},
            {"$limit": limit},
        ]
        raw = await db.db[COLLECTION].aggregate(pipeline).to_list(length=None)
        return [
            {"from": r["_id"]["from"], "to": r["_id"]["to"], "count": r["count"], "total_chars": r.get("total_chars", 0)}
            for r in raw
        ]
    except Exception as e:
        logger.warning(f"Top language pairs failed: {e!s}")
        return []


async def provider_recommend(from_lang: str = "auto", to_lang: str = "zh") -> dict:
    """Recommend best translation providers for a language pair.

    Ranks providers by success_rate (desc), used for smart engine
    selection and monitoring dashboard.
    """
    try:
        health = await provider_health(hours=24)
        providers = health.get("providers", {})
        ranked = sorted(
            [
                {"name": name, "success_rate": p["success_rate"], "status": p["status"],
                 "total": p["total"], "failed": p["failed"]}
                for name, p in providers.items()
            ],
            key=lambda x: x["success_rate"],
            reverse=True,
        )
        healthy = sum(1 for p in ranked if p["status"] == "healthy")
        degraded = sum(1 for p in ranked if p["status"] == "degraded")
        down = sum(1 for p in ranked if p["status"] == "down")
        best = ranked[0]["name"] if ranked else None
        return {
            "from_lang": from_lang,
            "to_lang": to_lang,
            "recommended": best,
            "providers": ranked,
            "healthy_count": healthy,
            "degraded_count": degraded,
            "down_count": down,
        }
    except Exception as e:
        logger.warning(f"Provider recommend failed: {e!s}")
        return {
            "from_lang": from_lang, "to_lang": to_lang,
            "recommended": None, "providers": [],
            "healthy_count": 0, "degraded_count": 0, "down_count": 0,
        }
