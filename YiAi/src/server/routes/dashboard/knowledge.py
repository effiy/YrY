"""Dashboard knowledge stats — knowledge base health, quality, and drill-down."""
import logging
from datetime import datetime, timedelta, timezone
from collections import Counter, defaultdict

from fastapi import APIRouter
from pydantic import BaseModel

from shared.config import settings
from shared.response import success

logger = logging.getLogger(__name__)
router = APIRouter()


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
    total: int = 0
    no_status: int = 0
    no_type: int = 0
    no_lifecycle: int = 0
    no_review_cycle: int = 0
    no_roles: int = 0
    no_tags: int = 0
    no_benefit: int = 0
    no_title: int = 0
    complete: int = 0


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


class KnowledgeSubModuleStats(BaseModel):
    name: str
    count: int
    statuses: list[KnowledgeStatusStats] = []
    types: list[KnowledgeTypeStats] = []
    lifecycles: list[KnowledgeLifecycleStats] = []
    stale_count: int = 0
    tacit_count: int = 0
    review_coverage_pct: float = 0.0


class KnowledgeModuleStats(BaseModel):
    category: str
    name: str
    count: int
    statuses: list[KnowledgeStatusStats] = []
    types: list[KnowledgeTypeStats] = []
    lifecycles: list[KnowledgeLifecycleStats] = []
    roles: list[KnowledgeRoleStats] = []
    stale_count: int = 0
    tacit_count: int = 0
    review_coverage_pct: float = 0.0
    sub_modules: list[KnowledgeSubModuleStats] = []


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


_REVIEW_CYCLE_DAYS = {
    "weekly": 7,
    "monthly": 30,
    "quarterly": 90,
    "half-yearly": 180,
    "yearly": 365,
}


@router.get("/knowledge-stats", operation_id="dashboard_knowledge_stats")
async def knowledge_stats():
    """Return knowledge base statistics with health metrics and drill-down data."""
    try:
        from data.database import db

        await db.initialize()
        collection = db.db[settings.collection_knowledge_files]
        cursor = collection.find({}, {"_id": 0})
        files = await cursor.to_list(length=None)

        now = datetime.now(timezone.utc)

        categories = Counter(f.get("category", "") for f in files)
        category_stats = [KnowledgeCategoryStats(name=k, count=v) for k, v in categories.most_common(20)]

        statuses = Counter()
        lifecycles = Counter()
        types = Counter()
        review_cycles = Counter()
        roles = Counter()
        tacit_count = 0
        stale_count = 0
        no_review_cycle_count = 0

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
        module_map: dict[tuple[str, str], dict] = defaultdict(lambda: {
            "count": 0, "statuses": Counter(), "types": Counter(),
            "lifecycles": Counter(), "roles": Counter(), "stale": 0, "tacit": 0, "no_review": 0,
        })
        sub_module_map: dict[tuple[str, str, str], dict] = defaultdict(lambda: {
            "count": 0, "statuses": Counter(), "types": Counter(),
            "lifecycles": Counter(), "stale": 0, "tacit": 0, "no_review": 0,
        })

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
                normalized_rc = "half-yearly" if review_cycle == "semi-annual" else review_cycle
                review_cycles[normalized_rc] += 1
            else:
                no_review_cycle_count += 1

            file_tags_raw = meta.get("tags", []) or []
            if isinstance(file_tags_raw, list):
                file_tags = [t for t in file_tags_raw if isinstance(t, str)]
            elif isinstance(file_tags_raw, str):
                file_tags = [file_tags_raw]
            else:
                file_tags = []

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
                if status and ftype and lifecycle and review_cycle and file_roles and file_tags:
                    dq_complete += 1

            if isinstance(tacit, str) and tacit.strip() or tacit is True:
                tacit_count += 1

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

            parts = path.split("/")
            if len(parts) > 1 and not parts[1].endswith(".md"):
                mod_name = parts[1]
            else:
                mod_name = "__root__"

            if len(parts) > 2 and not parts[2].endswith(".md") and mod_name != "__root__":
                sub_mod_name = parts[2]
            else:
                sub_mod_name = "__root__"

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

            key = (f.get("category", ""), mod_name)
            m = module_map[key]
            m["count"] += 1
            m["statuses"][status] += 1
            m["types"][ftype] += 1
            m["lifecycles"][lifecycle] += 1
            for r in file_roles:
                m["roles"][r] += 1
            if isinstance(tacit, str) and tacit.strip() or tacit is True:
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

            sub_key = (f.get("category", ""), mod_name, sub_mod_name)
            sm = sub_module_map[sub_key]
            sm["count"] += 1
            sm["statuses"][status] += 1
            sm["types"][ftype] += 1
            sm["lifecycles"][lifecycle] += 1
            if isinstance(tacit, str) and tacit.strip() or tacit is True:
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

        review_coverage_pct = (
            round((len(files) - no_review_cycle_count) / len(files) * 100, 1)
            if files else 0.0
        )

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
            statuses=[KnowledgeStatusStats(name=k, count=v) for k, v in statuses.most_common()],
            lifecycles=[KnowledgeLifecycleStats(name=k, count=v) for k, v in lifecycles.most_common()],
            types=[KnowledgeTypeStats(name=k, count=v) for k, v in types.most_common()],
            review_cycles=[KnowledgeReviewCycleStats(name=k, count=v) for k, v in review_cycles.most_common()],
            roles=[KnowledgeRoleStats(name=k, count=v) for k, v in roles.most_common(20)],
            health=KnowledgeHealthSummary(
                tacit_count=tacit_count,
                stale_count=stale_count,
                no_review_cycle_count=no_review_cycle_count,
                review_coverage_pct=review_coverage_pct,
            ),
            data_quality=KnowledgeDataQuality(
                total=dq_total, no_status=dq_no_status, no_type=dq_no_type,
                no_lifecycle=dq_no_lifecycle, no_review_cycle=dq_no_review_cycle,
                no_roles=dq_no_roles, no_tags=dq_no_tags, no_benefit=dq_no_benefit,
                no_title=dq_no_title, complete=dq_complete,
            ),
            files=file_summaries, recent=recent, modules=module_stats,
        ).model_dump())
    except Exception as e:
        logger.warning(f"Knowledge stats failed: {e}")
        return success(data=KnowledgeStatsResponse(
            total=0, categories=[], statuses=[], lifecycles=[],
            types=[], review_cycles=[], roles=[], health=KnowledgeHealthSummary(),
            data_quality=KnowledgeDataQuality(),
            files=[], recent=[], modules=[],
        ).model_dump())