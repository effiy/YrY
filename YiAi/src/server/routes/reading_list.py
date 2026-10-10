"""Reading list REST endpoints — SSRCoT-free, envelope-aligned.

Provides the front-end ``/reading-list*`` contract consumed by
``YiVad/src/api/modules/readingListService.ts``:

  GET    /reading-list                  paginated list + filters / sort
  GET    /reading-list/counts           aggregate KPIs (statuses, dims, roles, …)
  GET    /reading-list/by-role          items grouped by ownerRole
  GET    /reading-list/by-scheduled-month items grouped by scheduledMonth
  GET    /reading-list/{item_id}        single item detail
  POST   /reading-list                  create item
  PUT    /reading-list/{item_id}        update item
  DELETE /reading-list/{item_id}        delete item
  POST   /reading-list/upload           bulk create from JSON / CSV file

The module is intentionally stateless apart from an in-process seed cache.
Storage is delegated to the standard ``data.{query,mutation}.py`` repository
layer, collection name = ``reading_list``. If the DB has not been initialised
yet (e.g. first run, MongoDB unavailable), an in-memory fallback keeps the
dashboard rendering so users never see ``404 (/reading-list)``.
"""

from __future__ import annotations

import csv
import io
import json
import logging
import uuid
from datetime import datetime, timezone
from typing import Any, Iterable

from fastapi import APIRouter, Body, File, Form, HTTPException, Query, UploadFile
from fastapi.responses import Response

from data.mutation import (
    create_document,
    delete_document,
    update_document,
)
from data.query import count_documents, get_document_detail, query_documents
from shared.error_codes import ErrorCode
from shared.exceptions import BusinessException
from shared.response import success
from shared.utils import get_current_time  # type: ignore  (utils module stable)

logger = logging.getLogger(__name__)
router = APIRouter()

# ── Contract constants (kept in sync with YiVad ReadingDimension/Role/…) ──

COLLECTION_NAME = "reading_list"

DIMENSIONS = (
    "strategy",
    "management",
    "engineering",
    "frontend",
    "sre",
    "ai",
    "product",
    "cognition",
)

ROLES = (
    "ceo",
    "cfo",
    "cpo",
    "vp-eng",
    "cto",
    "head-of-people",
    "sre-lead",
    "qa-lead",
    "sec-lead",
)

STATUSES = (
    "queued",
    "reading",
    "noted",
    "actionized",
    "distilled",
    "reviewed",
    "archived",
)

TYPES = ("book", "paper", "article")
PRIORITIES = ("high", "medium", "low")

SORT_ALIASES = {
    "rice": ("riceFinal", -1),
    "priority": ("priorityOrder", 1),
    "deadline": ("deadline", 1),
    "updatedAt": ("updatedAt", -1),
}

STATUS_ORDER = {s: i for i, s in enumerate(STATUSES)}
PRIORITY_ORDER = {"high": 0, "medium": 1, "low": 2}

# ── In-memory fallback (used only when DB layer throws) ──────────────────

_memory_store: dict[str, dict[str, Any]] = {}
_memory_bootstrapped = False


def _bootstrap_memory_if_needed() -> None:
    """Seed fallback store with a small, dashboard-friendly sample set.

    Numbers intentionally mirror the YiVad dashboard demo data so charts
    render without any DB. The list is deliberately tiny (<1 KB total).
    """
    global _memory_bootstrapped
    if _memory_bootstrapped or _memory_store:
        return

    seeds: list[dict[str, Any]] = [
        {
            "title": "卓有成效的管理者",
            "subtitle": "Drucker — 决策有效性五原则",
            "author": "Peter F. Drucker",
            "type": "book",
            "dimension": "management",
            "ownerRole": "ceo",
            "supportingRoles": ["cto", "vp-eng"],
            "priority": "high",
            "status": "distilled",
            "progress": 100,
            "rice": {"reach": 92, "impact": 95, "confidence": 98, "effort": 25},
            "okrId": "exec-003-02",
            "scheduledMonth": "2026-07",
            "noteKey": "executive/reading-list/010-阅读-读书笔记-卓有成效的管理者",
            "tags": ["决策", "时间管理", "贡献"],
            "antiSubjectSize": 14,
        },
        {
            "title": "高产出管理",
            "subtitle": "Grove — 杠杆率与 OKR 法源",
            "author": "Andrew S. Grove",
            "type": "book",
            "dimension": "management",
            "ownerRole": "vp-eng",
            "supportingRoles": ["cto", "cfo"],
            "priority": "high",
            "status": "reviewed",
            "progress": 95,
            "rice": {"reach": 85, "impact": 96, "confidence": 97, "effort": 32},
            "okrId": "exec-003-01",
            "scheduledMonth": "2026-07",
            "noteKey": "executive/reading-list/002-阅读-读书笔记-高产出管理",
            "tags": ["工程管理", "管理杠杆", "1:1"],
            "antiSubjectSize": 11,
        },
        {
            "title": "创业维艰",
            "subtitle": "Horowitz — 反模式层，决策铁三角",
            "author": "Ben Horowitz",
            "type": "book",
            "dimension": "strategy",
            "ownerRole": "ceo",
            "priority": "medium",
            "status": "noted",
            "progress": 70,
            "rice": {"reach": 72, "impact": 88, "confidence": 92, "effort": 45},
            "okrId": "exec-003-02",
            "scheduledMonth": "2026-08",
            "noteKey": "executive/reading-list/005-阅读-读书笔记-创业维艰",
            "tags": ["危机管理", "决策"],
            "antiSubjectSize": 9,
        },
        {
            "title": "西蒙学习法",
            "subtitle": "基于 Chase/Simon 实验 — 四步蒸馏",
            "author": "Herbert A. Simon 学习法",
            "type": "paper",
            "dimension": "cognition",
            "ownerRole": "cto",
            "supportingRoles": ["head-of-people"],
            "priority": "high",
            "status": "actionized",
            "progress": 80,
            "rice": {"reach": 78, "impact": 90, "confidence": 95, "effort": 28},
            "okrId": "exec-003-03",
            "scheduledMonth": "2026-09",
            "noteKey": "executive/reading-list/008-阅读-读书笔记-西蒙学习法",
            "tags": ["学习法", "认知", "模式识别"],
            "antiSubjectSize": 10,
        },
        {
            "title": "剑指前端 offer",
            "subtitle": "Front-end fundamentals & interview prep",
            "author": "陈潇潇",
            "type": "book",
            "dimension": "frontend",
            "ownerRole": "vp-eng",
            "priority": "medium",
            "status": "reading",
            "progress": 55,
            "rice": {"reach": 65, "impact": 75, "confidence": 90, "effort": 55},
            "okrId": "exec-002-02",
            "scheduledMonth": "2026-10",
            "noteKey": "executive/reading-list/009-阅读-读书笔记-剑指前端offer",
            "tags": ["前端", "基础", "面试"],
            "antiSubjectSize": 18,
        },
        {
            "title": "Site Reliability Engineering",
            "subtitle": "Google SRE — SLI/SLO/SLA, 错误预算",
            "author": "O'Reilly",
            "type": "book",
            "dimension": "sre",
            "ownerRole": "sre-lead",
            "supportingRoles": ["sec-lead", "qa-lead"],
            "priority": "high",
            "status": "queued",
            "progress": 10,
            "rice": {"reach": 80, "impact": 92, "confidence": 96, "effort": 60},
            "okrId": "exec-001-01",
            "scheduledMonth": "2026-11",
            "tags": ["SRE", "可观测性", "错误预算"],
            "antiSubjectSize": 16,
        },
        {
            "title": "Attention Is All You Need",
            "subtitle": "Transformer 原论文",
            "author": "Vaswani et al.",
            "type": "paper",
            "dimension": "ai",
            "ownerRole": "cto",
            "priority": "low",
            "status": "archived",
            "progress": 100,
            "rice": {"reach": 60, "impact": 88, "confidence": 99, "effort": 20},
            "okrId": "exec-004-01",
            "scheduledMonth": "2026-06",
            "tags": ["AI", "Transformer", "论文"],
            "antiSubjectSize": 6,
        },
        {
            "title": "Inspired — 启发用户喜爱的产品",
            "subtitle": "Marty Cagan 的产品原则",
            "author": "Marty Cagan",
            "type": "book",
            "dimension": "product",
            "ownerRole": "cpo",
            "priority": "medium",
            "status": "reading",
            "progress": 45,
            "rice": {"reach": 70, "impact": 85, "confidence": 94, "effort": 40},
            "okrId": "exec-002-01",
            "scheduledMonth": "2026-10",
            "tags": ["产品", "发现", "验证"],
            "antiSubjectSize": 12,
        },
        {
            "title": "优雅的难题",
            "subtitle": "复杂系统的工程哲学",
            "author": "Diomidis Spinellis",
            "type": "book",
            "dimension": "engineering",
            "ownerRole": "vp-eng",
            "priority": "medium",
            "status": "reviewed",
            "progress": 100,
            "rice": {"reach": 55, "impact": 78, "confidence": 88, "effort": 48},
            "okrId": "exec-002-02",
            "scheduledMonth": "2026-09",
            "noteKey": "executive/reading-list/012-阅读-读书笔记-优雅的难题",
            "tags": ["工程哲学", "代码质量"],
            "antiSubjectSize": 8,
        },
        {
            "title": "STRIDE 威胁建模实战",
            "subtitle": "从零到一构建安全思维",
            "author": "Adam Shostack 要点",
            "type": "article",
            "dimension": "ai",
            "ownerRole": "sec-lead",
            "priority": "high",
            "status": "noted",
            "progress": 60,
            "rice": {"reach": 62, "impact": 90, "confidence": 85, "effort": 30},
            "okrId": "exec-001-03",
            "scheduledMonth": "2026-11",
            "tags": ["安全", "STRIDE", "威胁建模"],
            "antiSubjectSize": 7,
        },
    ]

    now = get_current_time()
    for item in seeds:
        doc_id = f"seed-{uuid.uuid4().hex[:8]}"
        item = dict(item)
        item["_id"] = doc_id
        item["key"] = doc_id
        item.setdefault("createdAt", now)
        item.setdefault("updatedAt", now)
        rice = item.get("rice") or {}
        if isinstance(rice, dict) and "final" not in rice:
            rice["final"] = round(_calc_rice(rice), 2)
            item["rice"] = rice
        item["riceFinal"] = rice.get("final", 0)
        item["statusOrder"] = STATUS_ORDER.get(item.get("status", "queued"), 99)
        item["priorityOrder"] = PRIORITY_ORDER.get(item.get("priority", "low"), 99)
        _memory_store[doc_id] = item
    _memory_bootstrapped = True


# ── Domain helpers ────────────────────────────────────────────────────────


def _calc_rice(rice: dict[str, Any]) -> float:
    try:
        reach = float(rice.get("reach", 0))
        impact = float(rice.get("impact", 0))
        confidence = float(rice.get("confidence", 0))
        effort = max(1.0, float(rice.get("effort", 1)))
    except (TypeError, ValueError):
        return 0.0
    raw = (reach * impact * confidence) / effort
    # Squash into a 0-100 scale (the 20k divisor is the same used on the front-end fallback)
    return max(0.0, min(100.0, round(raw / 200.0, 2)))


def _now_iso() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def _coerce_rice(raw_rice: Any) -> dict[str, Any]:
    """Normalize any rice shape (int/float/dict/None) to a dict with ``final`` key.

    The reading-list collection has mixed-schema legacy entries where ``rice``
    can be a plain number (old v1/v2 documents), a partial ``{final}`` dict,
    or a full v3.2 ``{reach,impact,confidence,effort,final}`` object. This
    helper returns a single predictable shape so downstream callers never
    need to repeat the isinstance dance.
    """
    if isinstance(raw_rice, (int, float)):
        return {"final": round(float(raw_rice), 2)}
    if isinstance(raw_rice, dict):
        out = dict(raw_rice)
        if "final" not in out or not out["final"]:
            out["final"] = round(_calc_rice(out), 2)
        return out
    return {"final": 0.0}


def _normalize_item(raw: dict[str, Any]) -> dict[str, Any]:
    """Enforce the 9-field contract, strip internal order fields before returning."""
    item = dict(raw)
    if "_id" in item and "key" not in item:
        item["key"] = str(item["_id"])
    item.setdefault("key", item.get("_id") or f"rl-{uuid.uuid4().hex[:10]}")
    item.setdefault("createdAt", item.get("createdTime") or _now_iso())
    item.setdefault("updatedAt", item.get("updatedTime") or _now_iso())
    rice = _coerce_rice(item.get("rice"))
    item["rice"] = rice
    item.setdefault("riceFinal", rice["final"])
    item.pop("riceFinal", None)
    item.pop("statusOrder", None)
    item.pop("priorityOrder", None)
    item.pop("order", None)
    item.pop("createdTime", None)
    item.pop("updatedTime", None)
    return item


def _build_filter(params: dict[str, Any]) -> dict[str, Any]:
    filt: dict[str, Any] = {}
    if params.get("keyword"):
        kw = str(params["keyword"]).strip()
        if kw:
            filt["$or"] = [
                {"title": {"$regex": kw, "$options": "i"}},
                {"author": {"$regex": kw, "$options": "i"}},
                {"subtitle": {"$regex": kw, "$options": "i"}},
                {"tags": {"$regex": kw, "$options": "i"}},
                {"noteKey": {"$regex": kw, "$options": "i"}},
            ]
    for field in ("status", "type", "priority", "dimension", "ownerRole", "scheduledMonth"):
        val = params.get(field)
        if val and val != "all":
            filt[field] = val
    role = params.get("role")
    if role and role != "all":
        filt["$or"] = [
            *filt.pop("$or", []),
            {"ownerRole": role},
            {"supportingRoles": role},
        ]
    return filt


def _sort_list_for(sort_by: str | None, order: str | None) -> list[tuple[str, int]]:
    sort_by = sort_by or "updatedAt"
    order_dir = -1 if (order or "desc").lower() == "desc" else 1
    alias = SORT_ALIASES.get(sort_by)
    if alias:
        key, base_dir = alias
        return [(key, base_dir if order_dir == 1 else -base_dir)]
    return [(sort_by, order_dir)]


# ── DB-agnostic dual-layer API (primary: DB, fallback: memory) ───────────


class _DBUnavailable(Exception):
    pass


async def _db_call(fn, *args: Any, **kwargs: Any) -> Any:
    try:
        return await fn(*args, **kwargs)
    except BusinessException:
        raise
    except Exception as exc:  # pragma: no cover - defensive
        logger.warning("reading_list: DB layer unavailable, falling back to in-memory (%s)", exc)
        raise _DBUnavailable from exc


async def _list_db(params: dict[str, Any]) -> dict[str, Any]:
    return await _db_call(
        query_documents,
        {
            "cname": COLLECTION_NAME,
            "filter": _build_filter(params),
            "pageNum": int(params.get("page", 1) or 1),
            "pageSize": int(params.get("pageSize", 20) or 20),
            "orderBy": _sort_list_for(params.get("sortBy"), params.get("order"))[0][0],
            "orderType": "desc" if _sort_list_for(params.get("sortBy"), params.get("order"))[0][1] == -1 else "asc",
        },
    )


def _list_memory(params: dict[str, Any]) -> dict[str, Any]:
    _bootstrap_memory_if_needed()
    items = list(_memory_store.values())
    filt = _build_filter(params)
    items = [doc for doc in items if _match_filter(doc, filt)]

    def _sort_key(doc: dict[str, Any]) -> tuple:
        alias = SORT_ALIASES.get(params.get("sortBy") or "updatedAt")
        if alias:
            key = alias[0]
        else:
            key = params.get("sortBy") or "updatedAt"
        val = doc.get(key)
        if isinstance(val, str):
            return (0, val or "", doc.get("key", ""))
        if isinstance(val, (int, float)):
            return (0, val, doc.get("key", ""))
        return (1, str(val or ""), doc.get("key", ""))

    desc = _sort_list_for(params.get("sortBy"), params.get("order"))[0][1] == -1
    items.sort(key=_sort_key, reverse=desc)

    page = max(1, int(params.get("page", 1) or 1))
    page_size = max(1, min(500, int(params.get("pageSize", 20) or 20)))
    total = len(items)
    start = (page - 1) * page_size
    end = start + page_size
    return {
        "list": items[start:end],
        "total": total,
        "pageNum": page,
        "pageSize": page_size,
    }


def _match_filter(doc: dict[str, Any], filt: dict[str, Any]) -> bool:
    import re

    for k, v in filt.items():
        if k == "$or":
            if not any(_match_filter(doc, {kk: vv}) for cond in v for kk, vv in cond.items()):
                return False
            continue
        if k == "$and":
            if not all(_match_filter(doc, {kk: vv}) for cond in v for kk, vv in cond.items()):
                return False
            continue
        doc_val = doc.get(k)
        if isinstance(v, dict):
            if "$regex" in v:
                pat = re.compile(v["$regex"], re.IGNORECASE if v.get("$options") == "i" else 0)
                if isinstance(doc_val, list):
                    if not any(pat.search(str(s)) for s in doc_val):
                        return False
                elif not pat.search(str(doc_val or "")):
                    return False
                continue
            # Comparison operators (range filters)
            # If the stored doc value is a nested dict (e.g. rice={final, reach, ...}),
            # compare against its "final" numeric member so that rice>=50 behaves the
            # same in-memory as in Mongo (where rice can be a plain number in legacy
            # docs or {final} in v3.2 docs — _coerce_rice / _normalize_item handle
            # the coercion, but in-memory store may still hold mixed shapes).
            cmp_target = doc_val
            if isinstance(doc_val, dict) and "final" in doc_val:
                cmp_target = doc_val["final"]
            op_result = True
            hit_op = False
            if "$gte" in v:
                hit_op = True
                op_result = op_result and (cmp_target is not None and cmp_target >= v["$gte"])
            if "$lte" in v:
                hit_op = True
                op_result = op_result and (cmp_target is not None and cmp_target <= v["$lte"])
            if "$gt" in v:
                hit_op = True
                op_result = op_result and (cmp_target is not None and cmp_target > v["$gt"])
            if "$lt" in v:
                hit_op = True
                op_result = op_result and (cmp_target is not None and cmp_target < v["$lt"])
            if "$in" in v:
                hit_op = True
                op_result = op_result and (cmp_target in v["$in"])
            if hit_op and not op_result:
                return False
            continue
        if isinstance(doc_val, list):
            if v not in doc_val:
                return False
        elif doc_val != v:
            return False
    return True


async def _count_db(filter_doc: dict[str, Any], group_by: str | None = None) -> Any:
    return await _db_call(
        count_documents,
        {"cname": COLLECTION_NAME, "filter": filter_doc, "groupBy": group_by},
    )


def _count_memory(filter_doc: dict[str, Any], group_by: str | None = None) -> Any:
    _bootstrap_memory_if_needed()
    docs = [d for d in _memory_store.values() if _match_filter(d, filter_doc)]
    if group_by:
        groups: dict[Any, int] = {}
        for d in docs:
            key = d.get(group_by)
            groups[key] = groups.get(key, 0) + 1
        return {"groups": [{"value": k, "count": v} for k, v in groups.items()], "total": len(docs)}
    return {"count": len(docs)}


async def _get_db(doc_id: str) -> dict[str, Any]:
    return await _db_call(get_document_detail, {"cname": COLLECTION_NAME, "id": doc_id})


def _get_memory(doc_id: str) -> dict[str, Any]:
    _bootstrap_memory_if_needed()
    if doc_id in _memory_store:
        return dict(_memory_store[doc_id])
    raise BusinessException(ErrorCode.DATA_NOT_FOUND, message=f"Reading item {doc_id} not found")


async def _create_db(data: dict[str, Any]) -> dict[str, Any]:
    return await _db_call(create_document, {"cname": COLLECTION_NAME, "data": data})


def _create_memory(data: dict[str, Any]) -> dict[str, Any]:
    _bootstrap_memory_if_needed()
    doc_id = f"rl-{uuid.uuid4().hex[:10]}"
    now = _now_iso()
    doc = dict(data)
    doc["_id"] = doc_id
    doc["key"] = data.get("key") or doc_id
    doc.setdefault("createdAt", now)
    doc.setdefault("updatedAt", now)
    rice = doc.get("rice") or {}
    if isinstance(rice, dict):
        rice = dict(rice)
        rice.setdefault("final", round(_calc_rice(rice), 2))
        doc["rice"] = rice
        doc["riceFinal"] = rice["final"]
    doc["statusOrder"] = STATUS_ORDER.get(doc.get("status", "queued"), 99)
    doc["priorityOrder"] = PRIORITY_ORDER.get(doc.get("priority", "low"), 99)
    _memory_store[doc_id] = doc
    return {"key": doc_id}


async def _update_db(doc_id: str, data: dict[str, Any]) -> dict[str, Any]:
    payload = dict(data)
    payload.setdefault("key", doc_id)
    return await _db_call(update_document, {"cname": COLLECTION_NAME, "data": payload})


def _update_memory(doc_id: str, data: dict[str, Any]) -> dict[str, Any]:
    _bootstrap_memory_if_needed()
    if doc_id not in _memory_store:
        raise BusinessException(ErrorCode.DATA_NOT_FOUND, message=f"Reading item {doc_id} not found")
    existing = _memory_store[doc_id]
    new_doc = dict(existing)
    for k, v in data.items():
        if k in ("_id", "key"):
            continue
        new_doc[k] = v
    new_doc["updatedAt"] = _now_iso()
    rice = new_doc.get("rice") or {}
    if isinstance(rice, dict):
        rice = dict(rice)
        rice.setdefault("final", round(_calc_rice(rice), 2))
        new_doc["rice"] = rice
        new_doc["riceFinal"] = rice["final"]
    new_doc["statusOrder"] = STATUS_ORDER.get(new_doc.get("status", "queued"), 99)
    new_doc["priorityOrder"] = PRIORITY_ORDER.get(new_doc.get("priority", "low"), 99)
    _memory_store[doc_id] = new_doc
    return {"query": {"key": doc_id}, "updated": True}


async def _delete_db(doc_id: str) -> dict[str, Any]:
    return await _db_call(delete_document, {"cname": COLLECTION_NAME, "key": doc_id})


def _delete_memory(doc_id: str) -> dict[str, Any]:
    _bootstrap_memory_if_needed()
    if doc_id not in _memory_store:
        raise BusinessException(ErrorCode.DATA_NOT_FOUND, message=f"Reading item {doc_id} not found")
    del _memory_store[doc_id]
    return {"key": doc_id, "deleted": True}


# ── Aggregations ──────────────────────────────────────────────────────────


def _aggregate_stats(all_items: Iterable[dict[str, Any]]) -> dict[str, Any]:
    items = [_normalize_item(d) for d in all_items]
    total = len(items)
    status_counts = {s: 0 for s in STATUSES}
    dimension_counts = {d: 0 for d in DIMENSIONS}
    type_counts = {t: 0 for t in TYPES}
    priority_counts = {p: 0 for p in PRIORITIES}
    rice_by_tier: dict[str, int] = {"elite": 0, "strong": 0, "fair": 0, "weak": 0}
    in_progress = 0
    queued = 0
    completed = 0
    progress_sum = 0.0
    rice_sum = 0.0
    rice_entries = 0
    progress_entries = 0
    deadline_at_risk = 0
    today = datetime.now(timezone.utc).date()

    role_counts: dict[str, int] = {r: 0 for r in ROLES}
    schedule_counts: dict[str, int] = {}

    for doc in items:
        status = doc.get("status") or "queued"
        if status in status_counts:
            status_counts[status] += 1
        if status == "queued":
            queued += 1
        elif status in ("reading", "noted", "actionized", "distilled", "reviewed"):
            in_progress += 1
        if status in ("archived", "reviewed", "distilled"):
            completed += 1
        dim = doc.get("dimension")
        if dim in dimension_counts:
            dimension_counts[dim] += 1
        typ = doc.get("type")
        if typ in type_counts:
            type_counts[typ] += 1
        pri = doc.get("priority")
        if pri in priority_counts:
            priority_counts[pri] += 1
        # ── Rice normalization (handles int/float/dict/None uniformly) ──
        rice = _coerce_rice(doc.get("rice"))
        score = float(rice.get("final") or 0.0)
        if score > 0:
            rice_sum += score
            rice_entries += 1
        if score >= 80:
            rice_by_tier["elite"] += 1
        elif score >= 60:
            rice_by_tier["strong"] += 1
        elif score >= 40:
            rice_by_tier["fair"] += 1
        else:
            rice_by_tier["weak"] += 1
        progress = float(doc.get("progress") or 0)
        if status in ("reading", "noted", "actionized", "distilled", "reviewed"):
            progress_sum += progress
            progress_entries += 1
        owner = doc.get("ownerRole")
        if owner in role_counts:
            role_counts[owner] += 1
        for sup in (doc.get("supportingRoles") or []):
            role_counts[sup] = role_counts.get(sup, 0) + 1
        sched = doc.get("scheduledMonth")
        if sched:
            schedule_counts[sched] = schedule_counts.get(sched, 0) + 1
        dl = doc.get("deadline")
        if dl and status not in ("archived", "reviewed", "distilled"):
            try:
                dl_date = datetime.fromisoformat(str(dl).replace("Z", "")).date()
                if (dl_date - today).days < 14:
                    deadline_at_risk += 1
            except ValueError:
                pass

    avg_progress = round((progress_sum / progress_entries), 1) if progress_entries else 0.0
    avg_rice = round(rice_sum / rice_entries) if rice_entries else 0
    dim_non_zero = sum(1 for v in dimension_counts.values() if v > 0)
    dim_coverage = round((dim_non_zero / len(DIMENSIONS)) * 100) if DIMENSIONS else 0
    rice_tier: str
    if avg_rice >= 80:
        rice_tier = "elite"
    elif avg_rice >= 60:
        rice_tier = "strong"
    elif avg_rice >= 40:
        rice_tier = "fair"
    else:
        rice_tier = "weak"
    dim_zero_miss = [d for d, v in dimension_counts.items() if v == 0]
    funnels = [
        {"status": s, "count": status_counts.get(s, 0)} for s in STATUSES
    ]
    return {
        # ── ReadingAggregateStats contract (YiVad readingListService.ts) ──
        "total": total,
        "completedCount": completed,
        "inProgressCount": in_progress,
        "queuedCount": queued,
        "averageProgress": avg_progress,
        "averageRice": avg_rice,
        "riceTier": rice_tier,
        "dimensionCoverage": dim_coverage,
        "dimensions": {d: dimension_counts[d] for d in DIMENSIONS},
        "roles": {r: role_counts.get(r, 0) for r in ROLES},
        "schedule": dict(sorted(schedule_counts.items())),
        "statusFunnel": {s: status_counts.get(s, 0) for s in STATUSES},
        "priorities": {p: priority_counts.get(p, 0) for p in PRIORITIES},
        "types": {t: type_counts.get(t, 0) for t in TYPES},
        "riceByTier": dict(rice_by_tier),
        # Backward-compatible fields retained for callers using the list view
        "inProgress": in_progress,
        "completed": completed,
        "queued": queued,
        "deadlineAtRisk": deadline_at_risk,
        "statusFunnelList": funnels,
        "dimensionCoverageMap": {d: dimension_counts[d] for d in DIMENSIONS},
        "dimensionGap": dim_zero_miss,
    }


# ── Routes ────────────────────────────────────────────────────────────────


@router.get("/reading-list", operation_id="reading_list_list")
async def list_reading_items(
    page: int = Query(1, ge=1),
    pageSize: int = Query(20, ge=1, le=500),
    keyword: str | None = Query(None),
    status: str | None = Query(None),
    type: str | None = Query(None),
    priority: str | None = Query(None),
    dimension: str | None = Query(None),
    role: str | None = Query(None),
    scheduledMonth: str | None = Query(None),
    sortBy: str | None = Query("updatedAt"),
    order: str | None = Query("desc"),
) -> Response:
    params = {
        "page": page,
        "pageSize": pageSize,
        "keyword": keyword,
        "status": status,
        "type": type,
        "priority": priority,
        "dimension": dimension,
        "role": role,
        "scheduledMonth": scheduledMonth,
        "sortBy": sortBy,
        "order": order,
    }
    try:
        result = await _list_db(params)
    except _DBUnavailable:
        result = _list_memory(params)
    rows = [_normalize_item(d) for d in (result.get("list") or [])]
    payload = {
        "list": rows,
        "total": int(result.get("total", 0)),
        "page": int(result.get("pageNum") or page),
        "pageSize": int(result.get("pageSize") or pageSize),
    }
    return success(data=payload)


@router.get("/reading-list/counts", operation_id="reading_list_counts")
async def reading_list_counts() -> Response:
    try:
        res = await _list_db({"page": 1, "pageSize": 5000})
        items = res.get("list") or []
        if not items and int(res.get("total", 0)) > 0:
            # Paginator might be capped; fall back to a second page
            res2 = await _list_db({"page": 1, "pageSize": max(5000, int(res.get("total", 5000)))})
            items = res2.get("list") or items
    except _DBUnavailable:
        items = list(_memory_store.values())
    return success(data=_aggregate_stats(items))


@router.get("/reading-list/by-role", operation_id="reading_list_by_role")
async def reading_list_by_role() -> Response:
    try:
        db_raw = await _count_db({}, group_by="ownerRole")
        groups = db_raw.get("groups", []) if isinstance(db_raw, dict) else []
    except _DBUnavailable:
        mem_raw = _count_memory({}, group_by="ownerRole")
        groups = mem_raw.get("groups", [])
    breakdown: dict[str, int] = {r: 0 for r in ROLES}
    for g in groups:
        role = str(g.get("value") or "")
        if role in breakdown:
            breakdown[role] = int(g.get("count") or 0)
    return success(
        data={
            "byOwnerRole": [{"role": r, "count": breakdown[r]} for r in ROLES],
            "total": sum(breakdown.values()),
        }
    )


@router.get("/reading-list/by-scheduled-month", operation_id="reading_list_by_scheduled_month")
async def reading_list_by_scheduled_month() -> Response:
    try:
        db_raw = await _count_db({}, group_by="scheduledMonth")
        groups = db_raw.get("groups", []) if isinstance(db_raw, dict) else []
    except _DBUnavailable:
        mem_raw = _count_memory({}, group_by="scheduledMonth")
        groups = mem_raw.get("groups", [])
    rows: list[dict[str, Any]] = []
    for g in groups:
        m = g.get("value")
        if not m:
            continue
        rows.append({"month": str(m), "count": int(g.get("count") or 0)})
    rows.sort(key=lambda r: r["month"])
    return success(data={"byMonth": rows, "total": sum(r["count"] for r in rows)})


@router.get("/reading-list/{item_id}", operation_id="reading_list_detail")
async def get_reading_item(item_id: str) -> Response:
    try:
        doc = await _get_db(item_id)
    except _DBUnavailable:
        doc = _get_memory(item_id)
    except BusinessException as exc:
        # DB returned DATA_NOT_FOUND → maybe it's a memory-seeded id?
        if _memory_store and exc.error_code == ErrorCode.DATA_NOT_FOUND:
            try:
                doc = _get_memory(item_id)
            except BusinessException:
                raise exc
        else:
            raise
    return success(data=_normalize_item(doc))


@router.post("/reading-list", operation_id="reading_list_create")
async def create_reading_item(payload: dict[str, Any] = Body(...)) -> Response:
    required = ("title", "type", "dimension")
    for field in required:
        if not payload.get(field):
            raise HTTPException(status_code=400, detail=f"Field {field} is required")
    try:
        created = await _create_db(payload)
        doc_id = created.get("key") or ""
        doc = await _get_db(doc_id) if doc_id else None
    except _DBUnavailable:
        created = _create_memory(payload)
        doc = _get_memory(created["key"])
    return success(data=_normalize_item(doc or created))


@router.put("/reading-list/{item_id}", operation_id="reading_list_update")
async def update_reading_item(item_id: str, payload: dict[str, Any] = Body(...)) -> Response:
    try:
        await _update_db(item_id, payload)
        doc = await _get_db(item_id)
    except _DBUnavailable:
        _update_memory(item_id, payload)
        doc = _get_memory(item_id)
    return success(data=_normalize_item(doc))


@router.delete("/reading-list/{item_id}", operation_id="reading_list_delete")
async def delete_reading_item(item_id: str) -> Response:
    try:
        result = await _delete_db(item_id)
    except _DBUnavailable:
        result = _delete_memory(item_id)
    return success(data=result)


@router.post("/reading-list/upload", operation_id="reading_list_upload")
async def upload_reading_list(
    file: UploadFile = File(...),
    mode: str = Form("upsert"),
) -> Response:
    raw = await file.read()
    text = raw.decode("utf-8", errors="replace")
    records: list[dict[str, Any]] = []
    name = (file.filename or "").lower()

    try:
        if name.endswith(".json"):
            parsed = json.loads(text)
            if isinstance(parsed, list):
                records = [r for r in parsed if isinstance(r, dict)]
            elif isinstance(parsed, dict):
                nested = parsed.get("list") or parsed.get("items") or parsed.get("data") or []
                if isinstance(nested, list):
                    records = [r for r in nested if isinstance(r, dict)]
        else:
            reader = csv.DictReader(io.StringIO(text))
            for row in reader:
                if not row:
                    continue
                record: dict[str, Any] = {}
                for k, v in row.items():
                    if v is None or v == "":
                        continue
                    key = str(k).strip()
                    value: Any = str(v).strip()
                    if value.lower() in {"true", "false"}:
                        value = value.lower() == "true"
                    else:
                        try:
                            value = json.loads(value)
                        except (ValueError, TypeError):
                            pass
                    record[key] = value
                records.append(record)
    except Exception as exc:
        logger.warning("reading_list/upload: parse failed %s", exc)
        raise HTTPException(status_code=400, detail="Unparseable uploaded file — expected JSON array or CSV")

    inserted_ids: list[str] = []
    for record in records:
        # Make sure minimum contract is present; patch harmless defaults.
        record.setdefault("type", "book")
        record.setdefault("dimension", "engineering")
        record.setdefault("status", "queued")
        record.setdefault("priority", "medium")
        record.setdefault("ownerRole", "vp-eng")
        if not record.get("title"):
            continue
        try:
            if mode == "upsert" and record.get("key"):
                try:
                    await _update_db(str(record["key"]), record)
                    inserted_ids.append(str(record["key"]))
                    continue
                except BusinessException:
                    pass
                except _DBUnavailable:
                    try:
                        _update_memory(str(record["key"]), record)
                        inserted_ids.append(str(record["key"]))
                        continue
                    except BusinessException:
                        pass
            try:
                created = await _create_db(record)
            except _DBUnavailable:
                created = _create_memory(record)
            inserted_ids.append(created.get("key") or "")
        except BusinessException as exc:
            logger.info("reading_list/upload: skipped row (%s)", exc)
            continue
        except Exception as exc:  # pragma: no cover
            logger.warning("reading_list/upload: row error %s", exc)
            continue

    return success(data={"insertedIds": [x for x in inserted_ids if x], "total": len(records)})
