"""Export service — async export tasks with progress tracking.

RPC methods:
  - create_export_task(params) → { task_id }
  - get_export_status(params) → { status, progress, file_url }
  - list_export_history(params) → { tasks }
"""

from __future__ import annotations

import json
import logging
import csv
import io
from datetime import datetime
from typing import Any, Dict, List, Optional
from uuid import uuid4

logger = logging.getLogger(__name__)


async def create_export_task(params: Dict[str, Any]) -> Dict[str, Any]:
    """Create an async export task.

    ``params``: ``{ cname, filter?, fields?, format, limit? }``
    """
    cname: str = params["cname"]
    export_filter: Dict[str, Any] = params.get("filter", {})
    fields: Optional[List[str]] = params.get("fields")
    fmt: str = params.get("format", "csv")
    limit: int = params.get("limit", 10000)

    task_id = str(uuid4())[:8]
    now = datetime.utcnow().isoformat()

    # Query data in batches
    from data.database import db

    try:
        cursor = db.db[cname].find(export_filter, limit=limit)
        if fields:
            projection = {f: 1 for f in fields}
            projection["_id"] = 0
            cursor = db.db[cname].find(export_filter, projection, limit=limit)

        docs = await cursor.to_list(length=limit)
    except Exception as e:
        logger.exception(f"Export query failed for {cname}")
        return {"task_id": task_id, "status": "failed", "error": str(e)}

    # Generate export file
    file_content: str = ""
    file_name = f"{cname}_{now[:10]}.{fmt}"

    try:
        if fmt == "json":
            file_content = json.dumps(docs, ensure_ascii=False, indent=2, default=str)
        elif fmt == "csv":
            output = io.StringIO()
            if docs:
                all_keys: List[str] = fields or list(docs[0].keys())
                if "_id" in all_keys and (not fields):
                    all_keys.remove("_id")
                writer = csv.DictWriter(output, fieldnames=all_keys, extrasaction="ignore")
                writer.writeheader()
                writer.writerows(docs)
            file_content = output.getvalue()
        else:
            # For xlsx/pdf, store as JSON for now (frontend handles conversion)
            file_content = json.dumps(docs, ensure_ascii=False, default=str)
            file_name = f"{cname}_{now[:10]}.json"

    except Exception as e:
        logger.exception(f"Export file generation failed for {cname}")
        return {"task_id": task_id, "status": "failed", "error": str(e)}

    # Store task record
    task_doc = {
        "task_id": task_id,
        "status": "completed",
        "format": fmt,
        "cname": cname,
        "row_count": len(docs),
        "file_content": file_content,
        "file_name": file_name,
        "created_at": now,
        "progress": 100,
    }

    try:
        await db.db["export_tasks"].insert_one(task_doc)
    except Exception:
        logger.exception("Failed to save export task")

    return {
        "task_id": task_id,
        "status": "completed",
        "row_count": len(docs),
        "file_name": file_name,
        "file_content": file_content,
    }


async def get_export_status(params: Dict[str, Any]) -> Dict[str, Any]:
    """Get the status of an export task.

    ``params``: ``{ task_id: str }``
    """
    from data.database import db

    task_id: str = params["task_id"]
    doc = await db.db["export_tasks"].find_one({"task_id": task_id})
    if not doc:
        return {"task_id": task_id, "status": "not_found"}
    return {
        "task_id": doc.get("task_id"),
        "status": doc.get("status"),
        "progress": doc.get("progress", 0),
        "file_name": doc.get("file_name"),
        "file_content": doc.get("file_content"),
    }


async def list_export_history(params: Dict[str, Any]) -> Dict[str, Any]:
    """List export history with optional filters.

    ``params``: ``{ cname?, limit?, offset? }``
    """
    from data.database import db

    cname: Optional[str] = params.get("cname")
    limit: int = params.get("limit", 50)
    offset: int = params.get("offset", 0)

    query: Dict[str, Any] = {}
    if cname:
        query["cname"] = cname

    cursor = db.db["export_tasks"].find(query).sort("created_at", -1).skip(offset).limit(limit)
    docs = await cursor.to_list(length=limit)
    total = await db.db["export_tasks"].count_documents(query)

    tasks = []
    for doc in docs:
        tasks.append({
            "task_id": doc.get("task_id"),
            "status": doc.get("status"),
            "format": doc.get("format"),
            "cname": doc.get("cname"),
            "row_count": doc.get("row_count", 0),
            "file_name": doc.get("file_name"),
            "created_at": doc.get("created_at"),
        })

    return {"tasks": tasks, "total": total, "limit": limit, "offset": offset}