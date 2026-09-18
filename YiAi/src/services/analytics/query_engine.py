"""Analytics query engine — translates {dimensions, metrics, filters, dateRange}
into MongoDB aggregation pipelines and returns tabular results.

RPC methods (callable via the executor):
  - run_aggregation(params)   → { columns, rows, total }
  - get_available_fields(params) → { dimensions, metrics }
"""

from __future__ import annotations

import logging
import re
from typing import Any, Dict, List, Optional

from data.database import db

logger = logging.getLogger(__name__)


async def run_aggregation(params: dict[str, Any]) -> dict[str, Any]:
    """Execute an aggregation query against a MongoDB collection.

    ``params`` shape::

        {
          cname: str,
          dimensions: list[str],
          metrics: list[{ field: str, agg: "count"|"sum"|"avg"|"max"|"min"|"distinct_count", alias?: str }],
          filters?: list[{ field: str, op: str, value: any }],
          dateRange?: { start: str, end: str },
          sort?: { field: str, order: "asc"|"desc" },
          limit?: int,
        }
    """
    cname: str = params["cname"]
    dimensions: list[str] = params.get("dimensions", [])
    metrics: list[dict[str, str]] = params.get("metrics", [])
    filters: list[dict[str, Any]] | None = params.get("filters")
    date_range: dict[str, str] | None = params.get("dateRange")
    sort: dict[str, Any] | None = params.get("sort")
    limit: int = params.get("limit", 500)

    pipeline: list[dict[str, Any]] = []

    # ── $match stage ──
    match: dict[str, Any] = {}
    if filters:
        for f in filters:
            field, op, value = f["field"], f.get("op", "eq"), f["value"]
            match[field] = _build_op(op, value)

    if date_range and "start" in date_range and "end" in date_range:
        match.setdefault("createdAt", {})
        match["createdAt"]["$gte"] = _parse_date(date_range["start"])
        match["createdAt"]["$lte"] = _parse_date(date_range["end"])

    if match:
        pipeline.append({"$match": match})

    # ── $group stage ──
    group_id: dict[str, str] = {}
    for dim in dimensions:
        group_id[dim] = f"${dim}"

    group_stage: dict[str, Any] = {"_id": group_id if group_id else None}
    for m in metrics:
        alias = m.get("alias") or m["field"]
        agg = m.get("agg", "count")
        group_stage[alias] = _build_accumulator(agg, m["field"])

    pipeline.append({"$group": group_stage})

    # ── $sort stage ──
    if sort:
        direction = -1 if sort.get("order") == "desc" else 1
        pipeline.append({"$sort": {sort["field"]: direction}})
    elif group_id:
        first_dim = dimensions[0]
        pipeline.append({"$sort": {f"_id.{first_dim}": 1}})

    # ── $limit stage ──
    if limit > 0:
        pipeline.append({"$limit": limit})

    # ── Execute ──
    collection = db.db[cname]
    cursor = collection.aggregate(pipeline)
    raw = await cursor.to_list(length=limit)

    # ── Format output ──
    columns: list[str] = []
    for dim in dimensions:
        columns.append(dim)
    for m in metrics:
        columns.append(m.get("alias") or m["field"])

    rows: list[list[Any]] = []
    for doc in raw:
        row: list[Any] = []
        if group_id:
            gid = doc["_id"]
            for dim in dimensions:
                row.append(gid.get(dim, None))
        for m in metrics:
            alias = m.get("alias") or m["field"]
            val = doc.get(alias, 0)
            row.append(val)
        rows.append(row)

    return {"columns": columns, "rows": rows, "total": len(rows)}


async def get_available_fields(params: dict[str, Any]) -> dict[str, Any]:
    """Return filterable/groupable fields and aggregatable metrics for a collection.

    ``params`` shape: ``{ cname: str }``
    """
    cname: str = params["cname"]
    dimensions: list[str] = []
    metrics: list[dict[str, str]] = []

    if cname in ("issues", "bugs", "projects"):
        dimensions = ["status", "project_key", "assignee", "type", "priority", "severity"]
        metrics = [
            {"field": "_id", "agg": "count", "alias": "count"},
            {"field": "cycle_time", "agg": "avg", "alias": "avg_cycle_time"},
            {"field": "lead_time", "agg": "avg", "alias": "avg_lead_time"},
        ]
    elif cname in ("sessions", "analytics_events"):
        dimensions = ["event_type", "user", "page"]
        metrics = [
            {"field": "_id", "agg": "count", "alias": "count"},
        ]
    else:
        # Generic fallback — query a sample doc to infer fields
        doc = await db.db[cname].find_one({})
        if doc:
            for key in doc:
                if key not in ("_id",):
                    dimensions.append(key)
        if not dimensions:
            logger.warning(f"No schema inferred for collection '{cname}' — returning empty schema")
        metrics = [{"field": "_id", "agg": "count", "alias": "count"}]

    return {"dimensions": dimensions, "metrics": metrics}


# ── Helpers ──

def _build_op(op: str, value: Any) -> Any:
    if op == "eq":
        return value
    if op in ("gt", "gte", "lt", "lte", "ne"):
        return {f"${op}": value}
    if op in ("in", "nin"):
        if not isinstance(value, list):
            value = [value]
        return {f"${op}": value}
    if op == "regex":
        return {"$regex": re.escape(str(value)), "$options": "i"}
    return value


def _build_accumulator(agg: str, field: str) -> Any:
    if agg == "count":
        return {"$sum": 1}
    if agg == "distinct_count":
        return {"$addToSet": f"${field}"}
    return {f"${agg}": f"${field}"}


def _parse_date(val: Any) -> Any:
    """Accept ISO string or numeric timestamp (ms). Return a datetime for MongoDB."""
    if isinstance(val, int | float):
        from datetime import datetime
        return datetime.utcfromtimestamp(val / 1000)
    return val
