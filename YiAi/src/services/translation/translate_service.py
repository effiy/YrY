"""Translation service — multi-engine parallel translation via RPC.

RPC methods (callable via execution module):
  translate              — parallel multi-engine translation (with memory cache)
  translate_stream       — SSE streaming translation for LLM providers
  translate_with_context — RAG-enhanced domain-aware translation
  translate_with_context_detailed — RAG-enhanced translation with source listing
  translation_memory_search — search memory by prefix (for autocomplete)
  translation_memory_stats — get memory statistics
  provider_health        — provider success/failure health monitoring
  provider_recommend     — smart provider recommendation by language pair
  hourly_trend           — hourly translation volume trend
  provider_breakdown     — per-provider usage breakdown
  top_language_pairs     — most translated language pairs
  translation_feedback   — record user quality feedback
"""

import asyncio
from datetime import datetime, timezone
import logging
from typing import AsyncGenerator

from data.database import db
from services.translation.providers import (
    TRANSLATE_PROVIDERS,
    _init_translate_providers,
)

logger = logging.getLogger(__name__)

COLLECTION = "translation_records"


async def translate(params: dict) -> list[dict]:
    """Parallel multi-engine translation with optional memory cache.

    RPC parameters: text, from_lang, to_lang, providers, provider_config, use_memory
    When use_memory=True, checks the translation memory before calling
    external APIs. Cached results include a ``cached: true`` flag.
    """
    _init_translate_providers()
    text = params.get("text", "")
    from_lang = params.get("from_lang", "auto")
    to_lang = params.get("to_lang", "zh")
    providers = params.get("providers") or None
    provider_config = params.get("provider_config") or {}
    use_memory = params.get("use_memory", True)
    selected = providers or list(TRANSLATE_PROVIDERS.keys())

    # Check translation memory first
    memory_hits = []
    if use_memory:
        try:
            from services.translation.memory_service import lookup
            cached = await lookup(text, from_lang, to_lang)
            if cached:
                memory_hits.append({
                    "provider": cached.get("provider", "memory"),
                    "text": cached.get("target", ""),
                    "from_lang": from_lang,
                    "to_lang": to_lang,
                    "cached": True,
                })
                # If we already have a cached result, still call selected providers
                # but mark the cached one. For single-provider mode, return immediately.
                if len(selected) <= 1 and selected[0] == cached.get("provider"):
                    return memory_hits
        except Exception as e:
            logger.debug(f"Memory lookup skipped: {e!s}")

    tasks = []
    for name in selected:
        p = TRANSLATE_PROVIDERS.get(name)
        if p is None:
            logger.warning(f"Unknown translate provider: {name}")
            continue
        config = provider_config.get(name, {})
        tasks.append(_translate_one(p, text, from_lang, to_lang, config))

    results = await asyncio.gather(*tasks, return_exceptions=True)
    output = list(memory_hits)
    for result in results:
        if isinstance(result, Exception):
            output.append({"provider": "unknown", "text": "", "error": str(result)})
        else:
            entry = {
                "provider": result.get("provider", "unknown"),
                "text": result.get("text", ""),
                "from_lang": result.get("from_lang", from_lang),
                "to_lang": result.get("to_lang", to_lang),
                "error": result.get("error"),
            }
            output.append(entry)
            # Store successful translations in memory
            if use_memory and entry["text"] and not entry.get("error"):
                try:
                    from services.translation.memory_service import store as mem_store
                    await mem_store(text, from_lang, to_lang, entry["text"], entry["provider"])
                except Exception:
                    logger.debug("Translation memory store failed for %s", entry.get("provider", "unknown"), exc_info=True)

    # Log translation record
    try:
        await _log_record(text, from_lang, to_lang, [r.get("text", "") for r in output])
    except Exception:
        logger.debug("Translation record logging call failed", exc_info=True)

    return output


async def _translate_one(provider, text: str, from_lang: str, to_lang: str, config: dict) -> dict:
    """Translate with a single provider, catching errors."""
    try:
        result = await provider.translate(text, from_lang, to_lang, **config)
        return {"provider": provider.name, "text": result.text, "from_lang": result.from_lang, "to_lang": result.to_lang}
    except Exception as e:
        logger.warning(f"Provider {provider.name} failed: {e!s}")
        return {"provider": provider.name, "text": "", "error": str(e)}


async def translate_stream(params: dict):
    """Streaming translation via SSE — yields text chunks.

    RPC parameters: text, from_lang, to_lang, provider, config
    Only supported by LLM-based providers (openai, ollama, chatglm, gemini).
    """
    _init_translate_providers()
    text = params.get("text", "")
    from_lang = params.get("from_lang", "auto")
    to_lang = params.get("to_lang", "zh")
    provider = params.get("provider", "openai")
    config = params.get("config") or {}
    p = TRANSLATE_PROVIDERS.get(provider)
    if p is None:
        yield f"Error: unknown provider '{provider}'"
        return

    stream_method = getattr(p, "translate_stream", None)
    if stream_method is None:
        yield f"Error: provider '{provider}' does not support streaming"
        return

    try:
        async for chunk in stream_method(text, from_lang, to_lang, **config):
            yield chunk
    except Exception as e:
        logger.error(f"Streaming translation failed for {provider}: {e!s}")
        yield f"\n[Error: {e!s}]"


# ── Helpers ──────────────────────────────────────────────────────────


async def _log_record(source: str, from_lang: str, to_lang: str, results: list[str]) -> None:
    """Log translation to MongoDB for analytics."""
    try:
        await db.initialize()
        await db.db[COLLECTION].insert_one({
            "source": source,
            "from_lang": from_lang,
            "to_lang": to_lang,
            "results": results,
            "source_length": len(source),
            "created_at": datetime.now(timezone.utc),
        })
    except Exception as e:
        logger.debug(f"Translation record logging failed: {e!s}")


async def translation_memory_search(prefix: str, from_lang: str = "auto", to_lang: str = "zh", limit: int = 10) -> list[dict]:
    """Search translation memory by source text prefix."""
    from services.translation.memory_service import search_by_prefix
    return await search_by_prefix(prefix, from_lang, to_lang, limit)


async def translation_memory_stats() -> dict:
    """Get translation memory statistics."""
    from services.translation.memory_service import stats
    return await stats()


async def translation_analytics(days: int = 30) -> dict:
    """Get translation usage analytics for YiVad Dashboard."""
    try:
        await db.initialize()
        cutoff = datetime.now(timezone.utc).timestamp() - days * 86400
        total = await db.db[COLLECTION].count_documents({"created_at": {"$gte": datetime.fromtimestamp(cutoff, tz=timezone.utc)}})
        pipeline = [
            {"$match": {"created_at": {"$gte": datetime.fromtimestamp(cutoff, tz=timezone.utc)}}},
            {"$group": {"_id": "$to_lang", "count": {"$sum": 1}, "total_chars": {"$sum": "$source_length"}}},
        ]
        by_lang = await db.db[COLLECTION].aggregate(pipeline).to_list(length=None)
        return {
            "total_translations": total,
            "period_days": days,
            "by_target_language": [{"language": lang["_id"], "count": lang["count"], "total_chars": lang["total_chars"]} for lang in by_lang],
        }
    except Exception as e:
        logger.warning(f"Translation analytics failed: {e!s}")
        return {"total_translations": 0, "period_days": days, "by_target_language": []}


async def translation_feedback(params: dict) -> dict:
    """Record user quality feedback for a translation.

    RPC parameters: source, target, rating, provider, from_lang, to_lang
    rating: 'good' | 'bad'
    Stored in MongoDB translation_feedback collection for quality analysis.
    """
    source = params.get("source", "")
    target = params.get("target", "")
    rating = params.get("rating", "")
    provider = params.get("provider", "")
    from_lang = params.get("from_lang", "")
    to_lang = params.get("to_lang", "")
    try:
        await db.initialize()
        await db.db["translation_feedback"].insert_one({
            "source": source,
            "target": target,
            "rating": rating,
            "provider": provider,
            "from_lang": from_lang,
            "to_lang": to_lang,
            "created_at": datetime.now(timezone.utc),
        })
        return {"success": True}
    except Exception as e:
        logger.warning(f"Feedback storage failed: {e!s}")
        return {"success": False, "error": str(e)}


# ── Health & Analytics ──────────────────────────────────────────────


async def provider_health(hours: int = 24) -> dict:
    """Provider health monitoring: success rates and status per provider."""
    from services.translation.provider_health import provider_health as _health
    return await _health(hours)


async def hourly_trend(days: int = 7) -> list[dict]:
    """Hourly translation volume trend."""
    from services.translation.provider_health import hourly_trend as _trend
    return await _trend(days)


async def provider_breakdown(days: int = 30) -> list[dict]:
    """Per-provider usage breakdown."""
    from services.translation.provider_health import provider_breakdown as _bd
    return await _bd(days)


async def top_language_pairs(limit: int = 20) -> list[dict]:
    """Most translated language pairs."""
    from services.translation.provider_health import top_language_pairs as _top
    return await _top(limit)


async def provider_recommend(params: dict) -> dict:
    """Recommend the best provider(s) for a given language pair.

    RPC parameters: from_lang, to_lang, limit
    Client apps call this to intelligently select a translation engine based on
    real-time health data. Returns providers ranked by: health status
    (healthy > degraded > down), then success rate.
    """
    from_lang = params.get("from_lang", "auto")
    to_lang = params.get("to_lang", "zh")
    limit = params.get("limit", 5)
    try:
        health = await provider_health(hours=24)
        providers = health.get("providers", {})

        # Rank by status tier (healthy=3, degraded=2, down=1), then success rate
        STATUS_TIER = {"healthy": 3, "degraded": 2, "down": 1}

        ranked = sorted(
            [
                {
                    "name": name,
                    "success_rate": info["success_rate"],
                    "status": info["status"],
                    "total": info["total"],
                    "failed": info["failed"],
                }
                for name, info in providers.items()
            ],
            key=lambda p: (STATUS_TIER.get(p["status"], 0), p["success_rate"]),
            reverse=True,
        )

        return {
            "from_lang": from_lang,
            "to_lang": to_lang,
            "recommended": ranked[0]["name"] if ranked else None,
            "providers": ranked[:limit],
            "healthy_count": sum(1 for p in ranked if p["status"] == "healthy"),
            "degraded_count": sum(1 for p in ranked if p["status"] == "degraded"),
            "down_count": sum(1 for p in ranked if p["status"] == "down"),
        }
    except Exception as e:
        logger.warning(f"Provider recommendation failed: {e!s}")
        return {"from_lang": from_lang, "to_lang": to_lang, "recommended": None, "providers": [], "healthy_count": 0, "degraded_count": 0, "down_count": 0}


# ── RAG Context Translation ──────────────────────────────────────────

async def translate_with_context_detailed(
    text: str,
    from_lang: str = "auto",
    to_lang: str = "zh",
    provider: str = "openai",
    provider_config: dict | None = None,
    domain: str | None = None,
) -> dict:
    """RAG-enhanced translation returning translation + sources list."""
    from services.translation.context_service import translate_with_context_detailed as _impl
    return await _impl(
        text=text, from_lang=from_lang, to_lang=to_lang,
        provider=provider, provider_config=provider_config, domain=domain,
    )
