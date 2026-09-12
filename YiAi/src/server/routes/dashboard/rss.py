"""Dashboard RSS endpoints — article statistics and source health."""
import logging
from typing import Optional

from fastapi import APIRouter
from pydantic import BaseModel

from shared.config import settings
from shared.response import success

logger = logging.getLogger(__name__)
router = APIRouter()


# ── RSS Stats ──

class RssSourceStats(BaseModel):
    name: str
    count: int


class RssCategoryStats(BaseModel):
    name: str
    count: int


class RssTimelineItem(BaseModel):
    month: str
    count: int


class RssRecentArticle(BaseModel):
    title: str
    source_name: str
    author: str = ""
    published: str = ""
    category_path: str = ""
    link: str = ""


class RssStatsResponse(BaseModel):
    total: int
    sources: list[RssSourceStats]
    categories: list[RssCategoryStats]
    timeline: list[RssTimelineItem]
    recent: list[RssRecentArticle]
    body_missing: int = 0


@router.get("/rss-stats", operation_id="dashboard_rss_stats")
async def rss_stats(start: Optional[int] = None, end: Optional[int] = None):
    """Return RSS article statistics, optionally filtered by a date range.

    ``start`` / ``end`` are millisecond-precision timestamps compared against
    ``published_parsed`` (falling back to ``createdTime`` or ``published`` when
    missing). Both ends are inclusive.
    """
    try:
        from data.database import db
        from collections import Counter
        from datetime import datetime, timezone as tz

        await db.initialize()
        collection = db.db[settings.collection_rss]
        cursor = collection.find({}, {"_id": 0})
        articles = await cursor.to_list(length=None)

        def _article_ts(a: dict) -> Optional[int]:
            ts = a.get("published_parsed") or a.get("createdTime") or a.get("published")
            if ts is None:
                return None
            if isinstance(ts, (int, float)):
                i = int(ts)
                return i * 1000 if len(str(abs(i))) <= 10 else i
            ts_str = str(ts).strip()
            if not ts_str:
                return None
            _head = ts_str.split(".")[0]
            if _head.lstrip("-").isdigit():
                i = int(_head)
                return i * 1000 if len(_head.lstrip("-")) <= 10 else i
            for fmt in ("%Y-%m-%dT%H:%M:%S.%fZ", "%Y-%m-%dT%H:%M:%S", "%Y-%m-%d %H:%M:%S", "%Y-%m-%d"):
                try:
                    return int(datetime.strptime(ts_str, fmt).replace(tzinfo=tz.utc).timestamp() * 1000)
                except ValueError:
                    continue
            try:
                return int(datetime.fromisoformat(ts_str.replace("Z", "+00:00")).timestamp() * 1000)
            except Exception:
                return None

        if start is not None or end is not None:
            filtered: list[dict] = []
            for a in articles:
                ts = _article_ts(a)
                if ts is None:
                    continue
                if start is not None and ts < start:
                    continue
                if end is not None and ts > end:
                    continue
                filtered.append(a)
            articles = filtered

        sources = Counter(a.get("source_name", "Unknown") for a in articles)
        source_stats = [RssSourceStats(name=k, count=v) for k, v in sources.most_common()]

        categories = Counter(a.get("category_path", "Uncategorized") for a in articles)
        category_stats = [RssCategoryStats(name=k, count=v) for k, v in categories.most_common()]

        months = Counter()
        for a in articles:
            ts = a.get("createdTime") or a.get("published", "")
            if ts:
                try:
                    ts_str = str(ts)
                    if ts_str.isdigit() and len(ts_str) >= 13:
                        from datetime import datetime, timezone as tz2
                        dt = datetime.fromtimestamp(int(ts_str) / 1000, tz=tz2.utc)
                        month_key = dt.strftime("%Y-%m")
                    elif "T" in ts_str or " " in ts_str:
                        month_key = ts_str[:7]
                    else:
                        month_key = ts_str[:7]
                    months[month_key] += 1
                except Exception:
                    months[str(ts)[:7]] += 1
        timeline = [RssTimelineItem(month=k, count=v) for k, v in sorted(months.items(), key=lambda x: str(x[0]))]

        body_missing = sum(1 for a in articles if a.get("body_missing"))

        def _sort_key(a: dict) -> str:
            ct = a.get("createdTime", "")
            return str(ct) if ct is not None else ""
        sorted_articles = sorted(articles, key=_sort_key, reverse=True)
        recent = [
            RssRecentArticle(
                title=a.get("title", ""),
                source_name=a.get("source_name", ""),
                author=a.get("author", ""),
                published=str(a.get("published", "")),
                category_path=a.get("category_path", ""),
                link=a.get("link", ""),
            )
            for a in sorted_articles[:10]
        ]

        return success(data=RssStatsResponse(
            total=len(articles),
            sources=source_stats,
            categories=category_stats,
            timeline=timeline,
            recent=recent,
            body_missing=body_missing,
        ).model_dump())
    except Exception as e:
        logger.warning(f"RSS stats failed: {e}")
        return success(data=RssStatsResponse(total=0, sources=[], categories=[], timeline=[], recent=[], body_missing=0).model_dump())


# ── RSS Source Health ──

class RssSourceInfo(BaseModel):
    name: str
    url: str = ""
    enabled: bool = False
    article_count: int = 0
    last_fetch: str = ""


class RssSourceHealthResponse(BaseModel):
    total_sources: int
    enabled_count: int
    disabled_count: int
    total_articles: int
    sources: list[RssSourceInfo]


@router.get("/rss-sources", operation_id="dashboard_rss_sources")
async def rss_sources():
    """Return RSS source/seed configuration with article counts."""
    try:
        from data.database import db
        from collections import Counter

        await db.initialize()

        seed_collection = db.db[settings.collection_seeds]
        seed_cursor = seed_collection.find({}, {"_id": 0})
        seeds = await seed_cursor.to_list(length=None)

        rss_collection = db.db[settings.collection_rss]
        rss_cursor = rss_collection.find({}, {"_id": 0, "source_name": 1})
        rss_articles = await rss_cursor.to_list(length=None)
        source_counts = Counter(a.get("source_name", "") for a in rss_articles)

        sources: list[RssSourceInfo] = []
        for seed in seeds:
            name = seed.get("name", "Unknown")
            sources.append(RssSourceInfo(
                name=name,
                url=seed.get("url", ""),
                enabled=seed.get("enabled", True),
                article_count=source_counts.get(name, 0),
                last_fetch=str(seed.get("updatedTime", seed.get("createdTime", ""))),
            ))

        for src_name, count in source_counts.items():
            if not any(s.name == src_name for s in sources):
                sources.append(RssSourceInfo(
                    name=src_name,
                    url="",
                    enabled=False,
                    article_count=count,
                    last_fetch="",
                ))

        enabled = sum(1 for s in sources if s.enabled)
        return success(data=RssSourceHealthResponse(
            total_sources=len(sources),
            enabled_count=enabled,
            disabled_count=len(sources) - enabled,
            total_articles=sum(s.article_count for s in sources),
            sources=sources,
        ).model_dump())
    except Exception as e:
        logger.warning(f"RSS sources health check failed: {e}")
        return success(data=RssSourceHealthResponse(total_sources=0, enabled_count=0, disabled_count=0, total_articles=0, sources=[]).model_dump())