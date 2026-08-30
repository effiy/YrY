"""Dashboard health aggregation endpoint — returns live status of all subsystems."""
import asyncio
import json
import logging
import time
import urllib.request
from datetime import datetime, timedelta, timezone
from typing import Optional

from fastapi import APIRouter
from pydantic import BaseModel

from shared.config import settings
from shared.response import success

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

_START_TIME = time.monotonic()


# ── Response models ──


class ServerStatus(BaseModel):
    running: bool = True
    version: str = "1.0.0"
    uptime_seconds: float


class MongoStatus(BaseModel):
    connected: bool
    database: str


class SchedulerStatus(BaseModel):
    enabled: bool
    type: str
    interval: Optional[int] = None
    cron: Optional[dict] = None


class WatcherStatus(BaseModel):
    running: bool


class OllamaStatus(BaseModel):
    connected: bool
    model_count: int = 0
    url: str


class ObserverStatus(BaseModel):
    throttle_enabled: bool
    sampler_enabled: bool
    sandbox_enabled: bool
    guard_enabled: bool


class CollectionCounts(BaseModel):
    menus: int = 0
    users: int = 0
    roles: int = 0
    departments: int = 0
    sessions: int = 0
    knowledge_files: int = 0
    rss_sources: int = 0


class DashboardHealthResponse(BaseModel):
    server: ServerStatus
    mongodb: MongoStatus
    scheduler: SchedulerStatus
    knowledge_watcher: WatcherStatus
    ollama: OllamaStatus
    observer: ObserverStatus
    collections: CollectionCounts


# ── Helpers ──


async def _get_mongo_status() -> MongoStatus:
    try:
        from data.database import db

        await db.initialize()
        return MongoStatus(connected=True, database=settings.mongodb_db_name)
    except Exception as e:
        logger.warning(f"MongoDB health check failed: {e}")
        return MongoStatus(connected=False, database=settings.mongodb_db_name)


def _get_scheduler_status() -> SchedulerStatus:
    try:
        from domain.rss.scheduler import _scheduler_manager

        s = _scheduler_manager.get_status()
        return SchedulerStatus(
            enabled=s["enabled"],
            type=s["type"],
            interval=s.get("interval"),
            cron=s.get("cron"),
        )
    except Exception as e:
        logger.warning(f"Scheduler health check failed: {e}")
        return SchedulerStatus(enabled=False, type="unknown")


def _get_watcher_status() -> WatcherStatus:
    try:
        from domain.knowledge.watcher import _watcher_manager

        return WatcherStatus(running=_watcher_manager.is_running)
    except Exception as e:
        logger.warning(f"Knowledge watcher health check failed: {e}")
        return WatcherStatus(running=False)


async def _get_ollama_status() -> OllamaStatus:
    url = settings.ollama_url or "http://localhost:11434"
    loop = asyncio.get_event_loop()

    def _check():
        try:
            req = urllib.request.Request(f"{url}/api/tags")
            with urllib.request.urlopen(req, timeout=5) as resp:
                data = json.loads(resp.read().decode())
                models = data.get("models", [])
                return OllamaStatus(connected=True, model_count=len(models), url=url)
        except Exception as e:
            logger.warning(f"Ollama health check failed: {e}")
            return OllamaStatus(connected=False, model_count=0, url=url)

    return await loop.run_in_executor(None, _check)


def _get_observer_status() -> ObserverStatus:
    return ObserverStatus(
        throttle_enabled=settings.observer_throttle_enabled,
        sampler_enabled=settings.observer_sampler_enabled,
        sandbox_enabled=settings.observer_sandbox_enabled,
        guard_enabled=settings.observer_guard_enabled,
    )


async def _get_collection_counts() -> CollectionCounts:
    try:
        from data.database import db

        await db.initialize()
        counts = {}
        for name in ["menus", "users", "dict_role", "dict_department", "sessions", "knowledge_files"]:
            try:
                counts[name] = await db.db[name].count_documents({})
            except Exception:
                counts[name] = 0

        rss_count = 0
        try:
            rss_count = await db.db[settings.collection_seeds].count_documents({})
        except Exception:
            pass

        return CollectionCounts(
            menus=counts.get("menus", 0),
            users=counts.get("users", 0),
            roles=counts.get("dict_role", 0),
            departments=counts.get("dict_department", 0),
            sessions=counts.get("sessions", 0),
            knowledge_files=counts.get("knowledge_files", 0),
            rss_sources=rss_count,
        )
    except Exception as e:
        logger.warning(f"Collection counts failed: {e}")
        return CollectionCounts()


# ── Route ──


@router.get("/health", operation_id="dashboard_health")
async def dashboard_health():
    """Return aggregated health status of all subsystems."""
    server = ServerStatus(
        running=True,
        version="1.0.0",
        uptime_seconds=time.monotonic() - _START_TIME,
    )

    mongo, ollama, collections = await asyncio.gather(
        _get_mongo_status(), _get_ollama_status(), _get_collection_counts()
    )

    scheduler = _get_scheduler_status()
    watcher = _get_watcher_status()
    observer = _get_observer_status()

    response = DashboardHealthResponse(
        server=server,
        mongodb=mongo,
        scheduler=scheduler,
        knowledge_watcher=watcher,
        ollama=ollama,
        observer=observer,
        collections=collections,
    )
    return success(data=response.model_dump())


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

        # Date-range filtering — use ``published_parsed`` first (already normalised
        # to ms timestamps by the RSS pipeline), then gracefully fall back to
        # ``createdTime`` and ``published`` for older documents so the filter
        # still works across the full corpus.
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
            # Numeric string — strip fractional parts first so "1724900000.5"
            # and "1724900000000.0" both parse correctly.
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

        # Source distribution
        sources = Counter(a.get("source_name", "Unknown") for a in articles)
        source_stats = [RssSourceStats(name=k, count=v) for k, v in sources.most_common()]

        # Category distribution
        categories = Counter(a.get("category_path", "Uncategorized") for a in articles)
        category_stats = [RssCategoryStats(name=k, count=v) for k, v in categories.most_common()]

        # Timeline by month
        months = Counter()
        for a in articles:
            ts = a.get("createdTime") or a.get("published", "")
            if ts:
                try:
                    ts_str = str(ts)
                    if ts_str.isdigit() and len(ts_str) >= 13:
                        # Millisecond timestamp
                        from datetime import datetime, timezone as tz
                        dt = datetime.fromtimestamp(int(ts_str) / 1000, tz=tz.utc)
                        month_key = dt.strftime("%Y-%m")
                    elif "T" in ts_str or " " in ts_str:
                        month_key = ts_str[:7]  # "2026-08"
                    else:
                        month_key = ts_str[:7]
                    months[month_key] += 1
                except Exception:
                    months[str(ts)[:7]] += 1
        timeline = [RssTimelineItem(month=k, count=v) for k, v in sorted(months.items(), key=lambda x: str(x[0]))]

        # Metadata-only articles (file_path resolves to no file on disk)
        body_missing = sum(1 for a in articles if a.get("body_missing"))

        # Recent 10 articles
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


# ── Knowledge Stats ──


class KnowledgeCategoryStats(BaseModel):
    name: str
    count: int


class KnowledgeStatusStats(BaseModel):
    name: str
    count: int


class KnowledgeLifecycleStats(BaseModel):
    name: str
    count: int


class KnowledgeTypeStats(BaseModel):
    name: str
    count: int


class KnowledgeReviewCycleStats(BaseModel):
    name: str
    count: int


class KnowledgeHealthSummary(BaseModel):
    tacit_count: int = 0
    stale_count: int = 0
    no_review_cycle_count: int = 0
    review_coverage_pct: float = 0.0


class KnowledgeDataQuality(BaseModel):
    """Per-field metadata completeness counts — files missing each key field."""
    total: int = 0  # number of markdown files (only .md files can have frontmatter)
    no_status: int = 0
    no_type: int = 0
    no_lifecycle: int = 0
    no_review_cycle: int = 0
    no_roles: int = 0
    no_tags: int = 0
    no_benefit: int = 0
    no_title: int = 0
    complete: int = 0  # files with all six key fields (status/type/lifecycle/review_cycle/roles/tags) present


class KnowledgeFileSummary(BaseModel):
    path: str
    title: str = ""
    category: str = ""
    module: str = ""
    sub_module: str = ""
    size: int = 0
    status: str = ""
    lifecycle: str = ""
    type: str = ""
    review_cycle: str = ""
    updated: str = ""
    tacit: bool = False
    roles: list[str] = []
    tags: list[str] = []
    benefit: str = ""
    related_count: int = 0
    related: list[str] = []


class KnowledgeRecentFile(BaseModel):
    title: str
    path: str
    status: str = ""
    lifecycle: str = ""
    review_cycle: str = ""
    updated: str = ""


class KnowledgeRoleStats(BaseModel):
    name: str
    count: int


class KnowledgeModuleStats(BaseModel):
    """Per-module (subdirectory) aggregation within a category."""
    category: str
    name: str  # subdirectory name, or "__root__" for root-level files
    count: int
    statuses: list[KnowledgeStatusStats] = []
    types: list[KnowledgeTypeStats] = []
    lifecycles: list[KnowledgeLifecycleStats] = []
    roles: list[KnowledgeRoleStats] = []
    stale_count: int = 0
    tacit_count: int = 0
    review_coverage_pct: float = 0.0
    sub_modules: list["KnowledgeSubModuleStats"] = []

class KnowledgeSubModuleStats(BaseModel):
    """Per-sub-module aggregation within a module."""
    name: str  # subdirectory name, or "__root__"
    count: int
    statuses: list[KnowledgeStatusStats] = []
    types: list[KnowledgeTypeStats] = []
    lifecycles: list[KnowledgeLifecycleStats] = []
    stale_count: int = 0
    tacit_count: int = 0
    review_coverage_pct: float = 0.0


class KnowledgeStatsResponse(BaseModel):
    total: int
    categories: list[KnowledgeCategoryStats]
    statuses: list[KnowledgeStatusStats]
    lifecycles: list[KnowledgeLifecycleStats]
    types: list[KnowledgeTypeStats]
    review_cycles: list[KnowledgeReviewCycleStats] = []
    roles: list[KnowledgeRoleStats] = []
    health: KnowledgeHealthSummary = KnowledgeHealthSummary()
    data_quality: KnowledgeDataQuality = KnowledgeDataQuality()
    files: list[KnowledgeFileSummary] = []
    recent: list[KnowledgeRecentFile]
    modules: list[KnowledgeModuleStats] = []


@router.get("/knowledge-stats", operation_id="dashboard_knowledge_stats")
async def knowledge_stats():
    """Return knowledge base statistics with health metrics and drill-down data."""
    try:
        from data.database import db
        from collections import Counter

        await db.initialize()
        collection = db.db[settings.collection_knowledge_files]
        cursor = collection.find({}, {"_id": 0})
        files = await cursor.to_list(length=None)

        now = datetime.now(timezone.utc)

        # Review-cycle → max age (days) for stale detection
        _REVIEW_CYCLE_DAYS = {
            "weekly": 7,
            "monthly": 30,
            "quarterly": 90,
            "half-yearly": 180,
            "yearly": 365,
        }

        # Category (role) distribution
        categories = Counter(f.get("category", "") for f in files)
        category_stats = [KnowledgeCategoryStats(name=k, count=v) for k, v in categories.most_common(20)]

        # Meta-driven distributions
        statuses = Counter()
        lifecycles = Counter()
        types = Counter()
        review_cycles = Counter()
        roles = Counter()
        tacit_count = 0
        stale_count = 0
        no_review_cycle_count = 0

        # Data quality counters (only .md files — non-markdown files can't have frontmatter)
        dq_total = 0
        dq_no_status = 0
        dq_no_type = 0
        dq_no_lifecycle = 0
        dq_no_review_cycle = 0
        dq_no_roles = 0
        dq_no_tags = 0
        dq_no_benefit = 0
        dq_no_title = 0
        dq_complete = 0

        file_summaries = []

        for f in files:
            meta = f.get("meta", {}) or {}
            status = meta.get("status", "")
            lifecycle = meta.get("lifecycle", "")
            ftype = meta.get("type", "")
            review_cycle = meta.get("review_cycle", "")
            tacit = meta.get("tacit", False)
            file_roles_raw = meta.get("roles", []) or []
            if isinstance(file_roles_raw, str):
                file_roles = [file_roles_raw]
            elif isinstance(file_roles_raw, list):
                file_roles = [r for r in file_roles_raw if isinstance(r, str)]
            else:
                file_roles = []

            statuses[status] += 1
            lifecycles[lifecycle] += 1
            types[ftype] += 1

            for r in file_roles:
                roles[r] += 1

            if review_cycle:
                # Normalize semi-annual → half-yearly
                normalized_rc = "half-yearly" if review_cycle == "semi-annual" else review_cycle
                review_cycles[normalized_rc] += 1
            else:
                no_review_cycle_count += 1

            # Resolve tags
            file_tags_raw = meta.get("tags", []) or []
            if isinstance(file_tags_raw, list):
                file_tags = [t for t in file_tags_raw if isinstance(t, str)]
            elif isinstance(file_tags_raw, str):
                file_tags = [file_tags_raw]
            else:
                file_tags = []

            # Data quality counts (fields available here)
            path = f.get("path", "")
            if path.endswith(".md") and ftype != "rss":
                dq_total += 1
                if not status:
                    dq_no_status += 1
                if not ftype:
                    dq_no_type += 1
                if not lifecycle:
                    dq_no_lifecycle += 1
                if not review_cycle:
                    dq_no_review_cycle += 1
                if not file_roles:
                    dq_no_roles += 1
                if not meta.get("benefit"):
                    dq_no_benefit += 1
                if not meta.get("title") and not f.get("name"):
                    dq_no_title += 1
                if not file_tags:
                    dq_no_tags += 1
                # Complete = all six key fields present (non-empty)
                if status and ftype and lifecycle and review_cycle and file_roles and file_tags:
                    dq_complete += 1

            # Tacit knowledge: boolean True or non-empty string
            if isinstance(tacit, str) and tacit.strip():
                tacit_count += 1
            elif tacit is True:
                tacit_count += 1

            # Stale detection: check if file is past its review cycle
            if review_cycle in _REVIEW_CYCLE_DAYS:
                max_age = _REVIEW_CYCLE_DAYS[review_cycle]
                updated_str = str(f.get("updatedTime", f.get("updatedAt", "")))
                if updated_str:
                    try:
                        updated_dt = datetime.fromisoformat(updated_str.replace("Z", "+00:00"))
                        if now - updated_dt > timedelta(days=max_age):
                            stale_count += 1
                    except (ValueError, TypeError):
                        pass

            # Resolve module (subdirectory)
            path = f.get("path", "")
            parts = path.split("/")
            if len(parts) > 1 and not parts[1].endswith(".md"):
                mod_name = parts[1]
            else:
                mod_name = "__root__"

            # Resolve sub-module (third-level subdirectory)
            if len(parts) > 2 and not parts[2].endswith(".md") and mod_name != "__root__":
                sub_mod_name = parts[2]
            else:
                sub_mod_name = "__root__"

            # Build file summary for drill-down
            if path.endswith(".md"):
                file_summaries.append(KnowledgeFileSummary(
                    path=path,
                    title=(meta.get("title", "")) or f.get("name", ""),
                    category=f.get("category", ""),
                    module=mod_name,
                    sub_module=sub_mod_name,
                    size=f.get("size", 0),
                    status=status,
                    lifecycle=lifecycle,
                    type=ftype,
                    review_cycle=review_cycle,
                    updated=str(f.get("updatedTime", f.get("updatedAt", ""))),
                    tacit=bool(tacit),
                    roles=file_roles,
                    tags=file_tags,
                    benefit=str(meta.get("benefit", "")) if meta.get("benefit") else "",
                    related_count=len(meta.get("related", [])) if isinstance(meta.get("related"), list) else 0,
                    related=meta.get("related", []) if isinstance(meta.get("related"), list) else [],
                ))

        # Module-level aggregation: group by (category, subdirectory)
        from collections import defaultdict
        module_map: dict[tuple[str, str], dict] = defaultdict(lambda: {
            "count": 0, "statuses": Counter(), "types": Counter(),
            "lifecycles": Counter(), "roles": Counter(), "stale": 0, "tacit": 0, "no_review": 0,
        })
        # Sub-module aggregation: group by (category, module, sub_module)
        sub_module_map: dict[tuple[str, str, str], dict] = defaultdict(lambda: {
            "count": 0, "statuses": Counter(), "types": Counter(),
            "lifecycles": Counter(), "stale": 0, "tacit": 0, "no_review": 0,
        })

        for f in files:
            cat = f.get("category", "")
            path = f.get("path", "")
            meta = f.get("meta", {}) or {}
            status = meta.get("status", "")
            ftype = meta.get("type", "")
            lifecycle = meta.get("lifecycle", "")
            review_cycle = meta.get("review_cycle", "")
            tacit = meta.get("tacit", False)

            parts = path.split("/")
            if len(parts) > 1 and not parts[1].endswith(".md"):
                mod_name = parts[1]
            else:
                mod_name = "__root__"

            if len(parts) > 2 and not parts[2].endswith(".md") and mod_name != "__root__":
                sub_mod_name = parts[2]
            else:
                sub_mod_name = "__root__"

            key = (cat, mod_name)
            m = module_map[key]
            m["count"] += 1
            m["statuses"][status] += 1
            m["types"][ftype] += 1
            m["lifecycles"][lifecycle] += 1
            mod_roles_raw = (meta.get("roles") or [])
            if isinstance(mod_roles_raw, str):
                mod_roles = [mod_roles_raw]
            elif isinstance(mod_roles_raw, list):
                mod_roles = [r for r in mod_roles_raw if isinstance(r, str)]
            else:
                mod_roles = []
            for r in mod_roles:
                m["roles"][r] += 1

            if isinstance(tacit, str) and tacit.strip():
                m["tacit"] += 1
            elif tacit is True:
                m["tacit"] += 1

            if not review_cycle:
                m["no_review"] += 1

            if review_cycle in _REVIEW_CYCLE_DAYS:
                max_age = _REVIEW_CYCLE_DAYS[review_cycle]
                updated_str = str(f.get("updatedTime", f.get("updatedAt", "")))
                if updated_str:
                    try:
                        updated_dt = datetime.fromisoformat(updated_str.replace("Z", "+00:00"))
                        if now - updated_dt > timedelta(days=max_age):
                            m["stale"] += 1
                    except (ValueError, TypeError):
                        pass

            # Sub-module aggregation
            sub_key = (cat, mod_name, sub_mod_name)
            sm = sub_module_map[sub_key]
            sm["count"] += 1
            sm["statuses"][status] += 1
            sm["types"][ftype] += 1
            sm["lifecycles"][lifecycle] += 1
            if isinstance(tacit, str) and tacit.strip():
                sm["tacit"] += 1
            elif tacit is True:
                sm["tacit"] += 1
            if not review_cycle:
                sm["no_review"] += 1
            if review_cycle in _REVIEW_CYCLE_DAYS:
                max_age = _REVIEW_CYCLE_DAYS[review_cycle]
                updated_str = str(f.get("updatedTime", f.get("updatedAt", "")))
                if updated_str:
                    try:
                        updated_dt = datetime.fromisoformat(updated_str.replace("Z", "+00:00"))
                        if now - updated_dt > timedelta(days=max_age):
                            sm["stale"] += 1
                    except (ValueError, TypeError):
                        pass

        module_stats = []
        for (cat, name), m in module_map.items():
            # Build sub-module list for this module
            sub_stats = []
            for (scat, smod, sname), sm in sub_module_map.items():
                if scat == cat and smod == name:
                    sub_stats.append(KnowledgeSubModuleStats(
                        name=sname,
                        count=sm["count"],
                        statuses=[KnowledgeStatusStats(name=k, count=v) for k, v in sm["statuses"].most_common()],
                        types=[KnowledgeTypeStats(name=k, count=v) for k, v in sm["types"].most_common()],
                        lifecycles=[KnowledgeLifecycleStats(name=k, count=v) for k, v in sm["lifecycles"].most_common()],
                        stale_count=sm["stale"],
                        tacit_count=sm["tacit"],
                        review_coverage_pct=round((sm["count"] - sm["no_review"]) / sm["count"] * 100, 1) if sm["count"] else 0.0,
                    ))
            sub_stats.sort(key=lambda x: x.count, reverse=True)
            module_stats.append(KnowledgeModuleStats(
                category=cat,
                name=name,
                count=m["count"],
                statuses=[KnowledgeStatusStats(name=k, count=v) for k, v in m["statuses"].most_common()],
                types=[KnowledgeTypeStats(name=k, count=v) for k, v in m["types"].most_common()],
                lifecycles=[KnowledgeLifecycleStats(name=k, count=v) for k, v in m["lifecycles"].most_common()],
                roles=[KnowledgeRoleStats(name=k, count=v) for k, v in m["roles"].most_common(5)],
                stale_count=m["stale"],
                tacit_count=m["tacit"],
                review_coverage_pct=round((m["count"] - m["no_review"]) / m["count"] * 100, 1) if m["count"] else 0.0,
                sub_modules=sub_stats,
            ))

        status_stats = [KnowledgeStatusStats(name=k, count=v) for k, v in statuses.most_common()]
        lifecycle_stats = [KnowledgeLifecycleStats(name=k, count=v) for k, v in lifecycles.most_common()]
        type_stats = [KnowledgeTypeStats(name=k, count=v) for k, v in types.most_common()]
        review_cycle_stats = [KnowledgeReviewCycleStats(name=k, count=v) for k, v in review_cycles.most_common()]

        role_stats = [KnowledgeRoleStats(name=k, count=v) for k, v in roles.most_common(20)]

        review_coverage_pct = (
            round((len(files) - no_review_cycle_count) / len(files) * 100, 1)
            if files else 0.0
        )

        health = KnowledgeHealthSummary(
            tacit_count=tacit_count,
            stale_count=stale_count,
            no_review_cycle_count=no_review_cycle_count,
            review_coverage_pct=review_coverage_pct,
        )

        data_quality = KnowledgeDataQuality(
            total=dq_total,
            no_status=dq_no_status,
            no_type=dq_no_type,
            no_lifecycle=dq_no_lifecycle,
            no_review_cycle=dq_no_review_cycle,
            no_roles=dq_no_roles,
            no_tags=dq_no_tags,
            no_benefit=dq_no_benefit,
            no_title=dq_no_title,
            complete=dq_complete,
        )

        # Recent 10 files
        def _k_sort_key(f: dict) -> str:
            u = f.get("updatedAt", f.get("updated", 0))
            return str(u) if u is not None else ""

        sorted_files = sorted(files, key=_k_sort_key, reverse=True)
        recent = [
            KnowledgeRecentFile(
                title=((f.get("meta") or {}).get("title", "")) or f.get("name", ""),
                path=f.get("path", ""),
                status=(f.get("meta") or {}).get("status", ""),
                lifecycle=(f.get("meta") or {}).get("lifecycle", ""),
                review_cycle=(f.get("meta") or {}).get("review_cycle", ""),
                updated=str(f.get("updatedTime", f.get("updatedAt", ""))),
            )
            for f in sorted_files[:10]
        ]

        return success(data=KnowledgeStatsResponse(
            total=len(file_summaries),
            categories=category_stats,
            statuses=status_stats,
            lifecycles=lifecycle_stats,
            types=type_stats,
            review_cycles=review_cycle_stats,
            roles=role_stats,
            health=health,
            data_quality=data_quality,
            files=file_summaries,
            recent=recent,
            modules=module_stats,
        ).model_dump())
    except Exception as e:
        logger.warning(f"Knowledge stats failed: {e}")
        return success(data=KnowledgeStatsResponse(
            total=0, categories=[], statuses=[], lifecycles=[],
            types=[], review_cycles=[], roles=[], health=KnowledgeHealthSummary(),
            data_quality=KnowledgeDataQuality(),
            files=[], recent=[], modules=[],
        ).model_dump())


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

        # Get seed configs (RSS source definitions)
        seed_collection = db.db[settings.collection_seeds]
        seed_cursor = seed_collection.find({}, {"_id": 0})
        seeds = await seed_cursor.to_list(length=None)

        # Get article counts per source
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

        # Add sources that have articles but no seed config
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


# ── Organization Stats ──


class OrgDepartmentInfo(BaseModel):
    name: str
    id: str = ""
    user_count: int = 0


class OrgRoleInfo(BaseModel):
    name: str
    id: str = ""
    parent: str = ""


class OrgUserStats(BaseModel):
    total: int
    active: int
    inactive: int
    by_department: list[OrgDepartmentInfo]
    by_gender: dict[str, int]


class OrgStatsResponse(BaseModel):
    users: OrgUserStats
    roles: list[OrgRoleInfo]
    departments: list[OrgDepartmentInfo]


@router.get("/organization", operation_id="dashboard_organization")
async def organization():
    """Return organization statistics."""
    try:
        from data.database import db
        from collections import Counter

        await db.initialize()

        # Users
        users_coll = db.db["users"]
        users_cursor = users_coll.find({}, {"_id": 0, "password": 0})
        users = await users_cursor.to_list(length=None)

        active = sum(1 for u in users if u.get("status") == 1)
        gender_map = {"1": "Male", "2": "Female", 1: "Male", 2: "Female"}
        genders = Counter(gender_map.get(u.get("gender", "unknown"), "Unknown") for u in users)

        # Department counts
        dept_counter = Counter()
        for u in users:
            dept_id = u.get("departmentId", "unknown")
            dept_counter[dept_id] += 1

        # Departments — canonical source is the nested `dict_department` tree;
        # flatten it back to a flat list for the org table.
        def _flatten_tree(nodes: list[dict], parent: str = "") -> list[dict]:
            flat: list[dict] = []
            for node in nodes or []:
                flat.append({"id": node.get("id", ""), "name": node.get("name", ""), "parent": parent})
                flat.extend(_flatten_tree(node.get("children") or [], node.get("id", "")))
            return flat

        depts_coll = db.db["dict_department"]
        depts = await depts_coll.find({}, {"_id": 0}).to_list(length=None)
        dept_info = [
            OrgDepartmentInfo(name=d["name"] or d["id"], id=d["id"], user_count=dept_counter.get(d["id"], 0))
            for d in _flatten_tree(depts)
        ]

        # Roles — same canonical nested source, flattened with parent ids.
        roles_coll = db.db["dict_role"]
        roles = await roles_coll.find({}, {"_id": 0}).to_list(length=None)
        role_info = [
            OrgRoleInfo(name=r["name"] or r["id"], id=r["id"], parent=r["parent"])
            for r in _flatten_tree(roles)
        ]

        return success(data=OrgStatsResponse(
            users=OrgUserStats(
                total=len(users),
                active=active,
                inactive=len(users) - active,
                by_department=dept_info,
                by_gender=dict(genders),
            ),
            roles=role_info,
            departments=dept_info,
        ).model_dump())
    except Exception as e:
        logger.warning(f"Organization stats failed: {e}")
        return success(data=OrgStatsResponse(
            users=OrgUserStats(total=0, active=0, inactive=0, by_department=[], by_gender={}),
            roles=[],
            departments=[],
        ).model_dump())


# ── AI Chat Stats ──


class AiModelUsage(BaseModel):
    model: str
    count: int


class AiDailyStats(BaseModel):
    date: str
    sessions: int
    messages: int


class AiRecentSession(BaseModel):
    title: str
    key: str = ""
    message_count: int = 0
    updated: str = ""


class AiStatsResponse(BaseModel):
    total_sessions: int
    total_messages: int
    avg_messages_per_session: float
    active_sessions_today: int
    messages_today: int
    model_usage: list[AiModelUsage]
    daily: list[AiDailyStats]
    recent: list[AiRecentSession]


@router.get("/ai-stats", operation_id="dashboard_ai_stats")
async def ai_stats():
    """Return AI chat usage statistics."""
    try:
        from data.database import db
        from collections import Counter, defaultdict
        from datetime import datetime, timezone as tz

        await db.initialize()
        collection = db.db[settings.collection_sessions]
        cursor = collection.find({}, {"_id": 0})
        sessions = await cursor.to_list(length=None)

        now = datetime.now(tz.utc)
        today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)

        total_messages = 0
        messages_today = 0
        active_sessions_today = 0
        models = Counter()
        daily_sessions: dict[str, int] = defaultdict(int)
        daily_messages: dict[str, int] = defaultdict(int)

        def _safe_ts(val) -> float:
            try:
                return float(val)
            except (TypeError, ValueError):
                return 0.0

        for s in sessions:
            msgs = s.get("messages", []) or []
            msg_count = len(msgs)
            total_messages += msg_count

            for m in msgs:
                model = m.get("model", "")
                if model:
                    models[model] += 1

            updated = _safe_ts(s.get("updatedAt", s.get("createdAt", 0)))
            if updated:
                dt = (
                    datetime.fromtimestamp(updated / 1000, tz=tz.utc)
                    if updated > 1e12
                    else datetime.fromtimestamp(updated, tz=tz.utc)
                )
                day_key = dt.strftime("%Y-%m-%d")
                daily_sessions[day_key] += 1
                daily_messages[day_key] += msg_count
                if dt >= today_start:
                    active_sessions_today += 1
                    messages_today += msg_count

        sorted_days = sorted(daily_sessions.keys())[-30:]
        daily = [
            AiDailyStats(date=d, sessions=daily_sessions[d], messages=daily_messages.get(d, 0))
            for d in sorted_days
        ]

        model_usage = [AiModelUsage(model=k, count=v) for k, v in models.most_common(10)]

        avg = round(total_messages / len(sessions), 1) if sessions else 0.0

        def _sort_key(s: dict) -> float:
            return _safe_ts(s.get("updatedAt", s.get("createdAt", 0)))

        sorted_sessions = sorted(sessions, key=_sort_key, reverse=True)
        recent = [
            AiRecentSession(
                title=s.get("title", "Untitled"),
                key=s.get("key", ""),
                message_count=len(s.get("messages", []) or []),
                updated=str(s.get("updatedAt", s.get("createdAt", ""))),
            )
            for s in sorted_sessions[:10]
        ]

        return success(data=AiStatsResponse(
            total_sessions=len(sessions),
            total_messages=total_messages,
            avg_messages_per_session=avg,
            active_sessions_today=active_sessions_today,
            messages_today=messages_today,
            model_usage=model_usage,
            daily=daily,
            recent=recent,
        ).model_dump())
    except Exception as e:
        logger.warning(f"AI stats failed: {e}")
        return success(data=AiStatsResponse(
            total_sessions=0, total_messages=0, avg_messages_per_session=0.0,
            active_sessions_today=0, messages_today=0,
            model_usage=[], daily=[], recent=[],
        ).model_dump())


# ── RAG Stats ──


class RagConfigInfo(BaseModel):
    embed_model: str = ""
    llm_model: str = ""
    chunk_size: int = 0
    chunk_overlap: int = 0
    top_k: int = 0
    hybrid_retrieval: bool = False
    rerank_enabled: bool = False
    inline_citations: bool = False
    auto_rebuild: bool = False
    knowledge_base_dir: str = ""


class RagQueryHistory(BaseModel):
    id: str
    question: str
    scope: str = ""
    result_count: int = 0
    top_score: float = 0.0
    latency_ms: int = 0
    timestamp: str = ""


class RagStatsResponse(BaseModel):
    built: bool = False
    num_docs: int = 0
    last_built_at: str = ""
    persist_dir: str = ""
    persist_dir_size: int = 0
    config: RagConfigInfo
    recent_queries: list[RagQueryHistory]


@router.get("/rag-stats", operation_id="dashboard_rag_stats")
async def rag_stats():
    """Return RAG index status and recent query history."""
    try:
        from domain.rag.indexer import rag_status
        from domain.rag.history import list_history

        status = rag_status()
        config = RagConfigInfo(**status.get("config", {}))

        history = list_history()
        recent = [
            RagQueryHistory(
                id=h.get("id", ""),
                question=h.get("question", ""),
                scope=h.get("scope", ""),
                result_count=h.get("result_count", 0),
                top_score=h.get("top_score", 0.0),
                latency_ms=h.get("latency_ms", 0),
                timestamp=h.get("timestamp", ""),
            )
            for h in history[:10]
        ]

        return success(data=RagStatsResponse(
            built=bool(status.get("built", False)),
            num_docs=int(status.get("num_docs", 0)),
            last_built_at=str(status.get("last_built_at", "")),
            persist_dir=str(status.get("persist_dir", "")),
            persist_dir_size=int(status.get("persist_dir_size", 0)),
            config=config,
            recent_queries=recent,
        ).model_dump())
    except Exception as e:
        logger.warning(f"RAG stats failed: {e}")
        return success(data=RagStatsResponse(
            built=False, num_docs=0, last_built_at="", persist_dir="", persist_dir_size=0,
            config=RagConfigInfo(), recent_queries=[],
        ).model_dump())


# ── System Performance Stats ──


class ServiceCallStats(BaseModel):
    service: str
    method: str = ""
    calls: int
    success: int
    failed: int
    avg_duration_ms: float
    max_duration_ms: float
    min_duration_ms: float


class RecentServiceCall(BaseModel):
    service: str
    method: str = ""
    status: str
    duration_ms: float
    input_summary: str = ""
    timestamp: str = ""


class ServiceStatsResponse(BaseModel):
    total_calls: int
    success_rate: float
    avg_duration_ms: float
    total_success: int
    total_failed: int
    by_service: list[ServiceCallStats]
    recent: list[RecentServiceCall]


@router.get("/service-stats", operation_id="dashboard_service_stats")
async def service_stats():
    """Return service call performance stats from state_records."""
    try:
        from data.database import db
        from collections import defaultdict

        await db.initialize()
        collection = db.db[settings.collection_state_records]
        cursor = collection.find({}, {"_id": 0})
        records = await cursor.to_list(length=None)

        by_service: dict[str, dict] = defaultdict(lambda: {
            "calls": 0, "success": 0, "failed": 0,
            "durations": [], "inputs": [],
        })
        recent_calls: list[dict] = []

        for r in records:
            svc = r.get("skill_name", "") or r.get("record_type", "")
            if not svc:
                continue

            status = r.get("status", "unknown")
            dur = float(r.get("duration_ms", 0))
            inp = str(r.get("input_summary", ""))[:100]
            ts = str(r.get("timestamp", r.get("created_time", "")))

            parts = svc.split(":")
            service_name = parts[0] if parts else svc
            method_name = parts[1] if len(parts) > 1 else ""

            stats = by_service[(service_name, method_name)]
            stats["calls"] += 1
            stats["durations"].append(dur)
            stats["inputs"].append(inp)
            if status == "success":
                stats["success"] += 1
            elif status not in ("", "?"):
                stats["failed"] += 1

            recent_calls.append({
                "service": service_name,
                "method": method_name,
                "status": status,
                "duration_ms": dur,
                "input_summary": inp,
                "timestamp": ts,
            })

        service_list = []
        total_success = 0
        total_failed = 0
        all_durations = []

        for (svc, method), stats in by_service.items():
            durs = stats["durations"]
            all_durations.extend(durs)
            total_success += stats["success"]
            total_failed += stats["failed"]
            service_list.append(ServiceCallStats(
                service=svc,
                method=method,
                calls=stats["calls"],
                success=stats["success"],
                failed=stats["failed"],
                avg_duration_ms=round(sum(durs) / len(durs), 2) if durs else 0,
                max_duration_ms=round(max(durs), 2) if durs else 0,
                min_duration_ms=round(min(durs), 2) if durs else 0,
            ))

        service_list.sort(key=lambda x: x.calls, reverse=True)

        recent = sorted(
            [c for c in recent_calls if c["timestamp"]],
            key=lambda x: x["timestamp"], reverse=True
        )[:20]
        recent_out = [
            RecentServiceCall(**c) for c in recent
        ]

        total_calls = total_success + total_failed
        return success(data=ServiceStatsResponse(
            total_calls=total_calls,
            success_rate=round(total_success / total_calls * 100, 1) if total_calls else 0,
            avg_duration_ms=round(sum(all_durations) / len(all_durations), 2) if all_durations else 0,
            total_success=total_success,
            total_failed=total_failed,
            by_service=service_list,
            recent=recent_out,
        ).model_dump())
    except Exception as e:
        logger.warning(f"Service stats failed: {e}")
        return success(data=ServiceStatsResponse(
            total_calls=0, success_rate=0, avg_duration_ms=0,
            total_success=0, total_failed=0,
            by_service=[], recent=[],
        ).model_dump())


class DiskUsage(BaseModel):
    path: str
    total_gb: float
    used_gb: float
    free_gb: float
    percent: float


class MemoryInfo(BaseModel):
    total_gb: float
    used_gb: float
    free_gb: float
    percent: float


class ProcessInfo(BaseModel):
    pid: int
    memory_mb: float
    cpu_percent: float
    threads: int


class PerformanceResponse(BaseModel):
    disk: DiskUsage
    memory: MemoryInfo
    process: ProcessInfo


@router.get("/performance", operation_id="dashboard_performance")
async def performance():
    """Return system performance metrics (disk, memory, process)."""
    import os
    import psutil

    try:
        # Disk usage for the working directory
        cwd = os.getcwd()
        disk = psutil.disk_usage(cwd)
        disk_info = DiskUsage(
            path=cwd,
            total_gb=round(disk.total / (1024**3), 1),
            used_gb=round(disk.used / (1024**3), 1),
            free_gb=round(disk.free / (1024**3), 1),
            percent=disk.percent,
        )

        # Virtual memory
        mem = psutil.virtual_memory()
        memory_info = MemoryInfo(
            total_gb=round(mem.total / (1024**3), 1),
            used_gb=round(mem.used / (1024**3), 1),
            free_gb=round(mem.available / (1024**3), 1),
            percent=mem.percent,
        )

        # Current process
        proc = psutil.Process(os.getpid())
        proc_info = ProcessInfo(
            pid=proc.pid,
            memory_mb=round(proc.memory_info().rss / (1024**2), 1),
            cpu_percent=proc.cpu_percent(interval=0.1),
            threads=proc.num_threads(),
        )

        return success(data=PerformanceResponse(
            disk=disk_info, memory=memory_info, process=proc_info,
        ).model_dump())
    except Exception as e:
        logger.warning(f"Performance stats failed: {e}")
        return success(data=PerformanceResponse(
            disk=DiskUsage(path="", total_gb=0, used_gb=0, free_gb=0, percent=0),
            memory=MemoryInfo(total_gb=0, used_gb=0, free_gb=0, percent=0),
            process=ProcessInfo(pid=0, memory_mb=0, cpu_percent=0, threads=0),
        ).model_dump())
