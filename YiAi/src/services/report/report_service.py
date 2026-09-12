"""Report service — template CRUD and report generation.

RPC methods:
  - list_reports(params)   → { reports }
  - save_report(params)    → { report_id }
  - generate_report(params) → { content, format }
  - delete_report(params)  → { report_id }
"""

from __future__ import annotations

import logging
from datetime import datetime
from typing import Any, Dict, List, Optional
from uuid import uuid4

from data.database import db

logger = logging.getLogger(__name__)


async def list_reports(params: Dict[str, Any]) -> Dict[str, Any]:
    """List saved reports, optionally filtered by type.

    ``params``: ``{ type?, limit?, offset? }``
    """
    report_type: Optional[str] = params.get("type")
    limit: int = params.get("limit", 50)
    offset: int = params.get("offset", 0)

    query: Dict[str, Any] = {}
    if report_type:
        query["type"] = report_type

    cursor = db.db["reports"].find(query).sort("updated_at", -1).skip(offset).limit(limit)
    docs = await cursor.to_list(length=limit)
    total = await db.db["reports"].count_documents(query)

    reports = []
    for doc in docs:
        reports.append({
            "report_id": doc.get("report_id"),
            "name": doc.get("name"),
            "type": doc.get("type", "custom"),
            "description": doc.get("description", ""),
            "created_at": doc.get("created_at"),
            "updated_at": doc.get("updated_at"),
            "schedule": doc.get("schedule"),
        })

    return {"reports": reports, "total": total}


async def save_report(params: Dict[str, Any]) -> Dict[str, Any]:
    """Save or update a report definition.

    ``params``: ``{ report_id?, name, type?, description?, layout?, components?, schedule? }``
    """
    report_id: str = params.get("report_id") or str(uuid4())[:8]
    now = datetime.utcnow().isoformat()

    existing = await db.db["reports"].find_one({"report_id": report_id})

    doc = {
        "report_id": report_id,
        "name": params.get("name", "Untitled Report"),
        "type": params.get("type", "custom"),
        "description": params.get("description", ""),
        "layout": params.get("layout", []),
        "components": params.get("components", []),
        "schedule": params.get("schedule"),
        "updated_at": now,
    }

    if existing:
        doc["created_at"] = existing.get("created_at", now)
        await db.db["reports"].update_one(
            {"report_id": report_id}, {"$set": doc}
        )
    else:
        doc["created_at"] = now
        await db.db["reports"].insert_one(doc)

    return {"report_id": report_id, "status": "saved"}


async def generate_report(params: Dict[str, Any]) -> Dict[str, Any]:
    """Generate a report from a saved definition or ad-hoc components.

    ``params``: ``{ report_id?, components[], dateRange?, format? }``
    """
    report_id: Optional[str] = params.get("report_id")
    components: List[Dict[str, Any]] = params.get("components", [])
    date_range: Optional[Dict[str, str]] = params.get("dateRange")
    fmt: str = params.get("format", "json")

    # Load report definition if report_id provided
    if report_id and not components:
        doc = await db.db["reports"].find_one({"report_id": report_id})
        if doc:
            components = doc.get("components", [])

    # Resolve each component's data binding
    results: List[Dict[str, Any]] = []
    for comp in components:
        comp_type = comp.get("type", "kpi")
        data_source = comp.get("data_source", {})
        cname = data_source.get("cname", "")
        aggr_filter = data_source.get("filter", {})

        if date_range:
            aggr_filter["dateRange"] = date_range

        result: Dict[str, Any] = {
            "component_id": comp.get("id", ""),
            "type": comp_type,
            "title": comp.get("title", ""),
        }

        try:
            if cname:
                count = await db.db[cname].count_documents(aggr_filter)
                result["data"] = {"count": count}
            else:
                result["data"] = {}
        except Exception:
            result["data"] = {}
            result["error"] = f"Failed to query {cname}"

        results.append(result)

    return {
        "report_id": report_id,
        "format": fmt,
        "generated_at": datetime.utcnow().isoformat(),
        "components": results,
    }


async def delete_report(params: Dict[str, Any]) -> Dict[str, Any]:
    """Delete a report definition.

    ``params``: ``{ report_id: str }``
    """
    report_id: str = params["report_id"]
    await db.db["reports"].delete_one({"report_id": report_id})
    return {"report_id": report_id, "status": "deleted"}