"""Live OKR goal progress — derive from knowledge_files DB mirror.

Queries the ``knowledge_files`` collection (kept in sync with disk by the
knowledge watcher) for OKR goal and KR-evidence files. Reads frontmatter
``progress`` fields to compute live, accurate goal progress instead of
relying on static seed data.

The watcher already opened and parsed every file's frontmatter into the
``meta`` field, so this query stays fast regardless of knowledge base size.
"""

from __future__ import annotations

from collections import defaultdict
import logging

from data.database import db
from data.helpers import _validate_collection_name
from shared.config import settings

logger = logging.getLogger(__name__)

_OKR_TYPES = {"okr-goal", "okr-kr-evidence", "okr-metric"}


async def list_goals(year: str | None = None, period: str | None = None) -> dict:
    """Return live OKR goals with progress derived from knowledge_files.

    Args:
        year: Filter by year, e.g. ``"2026"``. Defaults to current year.
        period: Filter by period, e.g. ``"Q3"``, ``"Q4"``, ``"annual"``.

    Returns ``{ goals, roles, last_scan }`` where ``goals`` is a list of goal
    dicts with live ``keyResults`` progress and ``last_scan`` is the ISO
    timestamp of the last watcher scan.
    """
    from datetime import datetime, timezone

    if year is None:
        year = str(datetime.now(timezone.utc).year)

    await db.initialize()
    collection = db.db[_validate_collection_name(settings.collection_knowledge_files)]

    # Fetch all OKR-type files in one query
    or_clauses = [{"meta.type": t} for t in _OKR_TYPES]
    cursor = collection.find({"$or": or_clauses}, {"_id": 0, "path": 1, "meta": 1})
    docs = [doc async for doc in cursor]

    # Partition: goal files vs KR evidence files
    goal_docs: list[dict] = []
    kr_docs: list[dict] = []
    role_set: dict[str, dict] = {}

    for doc in docs:
        meta = doc.get("meta") or {}
        ft = meta.get("type", "")
        if ft == "okr-goal":
            goal_docs.append(doc)
        elif ft == "okr-kr-evidence":
            kr_docs.append(doc)

    # Build KR lookup: parent_goal → list of KR dicts
    kr_by_goal: dict[str, list[dict]] = defaultdict(list)
    for doc in kr_docs:
        meta = doc.get("meta") or {}
        parent = meta.get("parent_goal", "")
        if parent:
            kr_by_goal[parent].append(
                {
                    "text": meta.get("title", ""),
                    "progress": _int_progress(meta.get("progress")),
                    "file": doc.get("path", ""),
                }
            )

    # Also extract KRs embedded in goal frontmatter (kr_list / key_results)
    goals: list[dict] = []
    for doc in goal_docs:
        meta = doc.get("meta") or {}
        goal_id = str(meta.get("id") or "")

        # Period filter
        goal_period = str(meta.get("period") or "")
        if period and period.lower() != "annual":
            q = period.upper()
            if not (year in goal_period and q in goal_period.upper()):
                continue
        elif period and period.lower() == "annual":
            if year not in goal_period:
                continue
        elif year and year not in goal_period:
            continue

        # Status: prefer frontmatter status, fall back to lifecycle
        status = str(meta.get("status") or "active").strip()
        if status in ("stable", "review"):
            status = "active"
        elif status in ("archived", "deprecated", "superseded"):
            status = "done"

        # Collect KRs — prefer evidence files, fall back to embedded list
        krs = kr_by_goal.get(goal_id, [])
        if not krs:
            kr_list = meta.get("key_results") or meta.get("kr_list") or []
            if isinstance(kr_list, list):
                for kr in kr_list:
                    if isinstance(kr, dict):
                        krs.append(
                            {
                                "text": kr.get("text", kr.get("title", "")),
                                "progress": _int_progress(kr.get("progress", 0)),
                                "file": kr.get("file", ""),
                            }
                        )

        # Derive role from path: {role}/okr/...
        path = doc.get("path", "")
        role = path.split("/")[0] if "/" in path else ""

        # Track roles for the response
        if role and role not in role_set:
            role_set[role] = {
                "key": role,
                "name": _role_display_name(role),
                "icon": _role_icon(role),
                "description": _role_description(role),
            }

        goals.append(
            {
                "key": goal_id,
                "role": role,
                "icon": str(meta.get("icon") or _role_icon(role)),
                "title": str(meta.get("title") or ""),
                "status": status,
                "description": str(meta.get("description") or ""),
                "period": goal_period,
                "owner": str(meta.get("owner") or ""),
                "project": str(meta.get("project") or ""),
                "keyResults": krs,
            }
        )

    # Sort goals by role then title
    goals.sort(key=lambda g: (g["role"], g["title"]))

    from domain.knowledge.watcher_manager import get_last_scan_time

    return {
        "goals": goals,
        "roles": list(role_set.values()),
        "last_scan": get_last_scan_time(),
    }


def _int_progress(val) -> int:
    """Normalize progress value to int 0-100."""
    if val is None:
        return 0
    try:
        v = int(float(str(val).replace("%", "").strip()))
        return max(0, min(100, v))
    except (ValueError, TypeError):
        return 0


_ROLE_NAMES: dict[str, str] = {
    "executive": "Executive",
    "product": "Product",
    "leader": "Leader",
    "engineer": "Engineer",
    "sre": "SRE",
    "aier": "AI Engineer",
    "curator": "Curator",
}

_ROLE_ICONS: dict[str, str] = {
    "executive": "🏢",
    "product": "📋",
    "leader": "🧭",
    "engineer": "⚡",
    "sre": "🔧",
    "aier": "🤖",
    "curator": "📦",
}

_ROLE_DESCRIPTIONS: dict[str, str] = {
    "executive": "经营战略拥有者：市场情报、经营战略与组织路线、经营阅读。",
    "product": "需求评审拥有者：PRD、验收标准与 WSJF 优先级。",
    "leader": "技术评审拥有者：ADR 与架构决策，保证决策可回溯。",
    "engineer": "代码编写与调试拥有者：实现为可构建代码，0 新增类型错误。",
    "sre": "测试与上线拥有者：测试报告与上线记录，门禁通过才上线。",
    "aier": "编排与 Agent 可靠拥有者：skill/agent/mcp 三要素，任务可复现。",
    "curator": "流程记录知识化拥有者：模板与整合索引，frontmatter 合规。",
}


def _role_display_name(role_id: str) -> str:
    return _ROLE_NAMES.get(role_id, role_id)


def _role_icon(role_id: str) -> str:
    return _ROLE_ICONS.get(role_id, "📄")


def _role_description(role_id: str) -> str:
    return _ROLE_DESCRIPTIONS.get(role_id, "")
