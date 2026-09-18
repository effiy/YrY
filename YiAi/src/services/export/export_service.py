"""Export service — async export tasks with background processing.

RPC methods:
  - create_export_task(params) → { task_id, status }
  - get_export_status(params) → { status, progress, file_url }
  - list_export_history(params) → { tasks }
"""

from __future__ import annotations

import asyncio
import csv
from datetime import datetime
import io
import json
import logging
from typing import Any
from uuid import uuid4

logger = logging.getLogger(__name__)

_EXPORT_BATCH_SIZE = 500
_MAX_RETRIES = 3


async def _process_export_task(task_id: str, cname: str, export_filter: dict, fields: list[str] | None, fmt: str, limit: int):
    """Background coroutine that processes an export task in batches."""
    from data.database import db

    collection = db.db[cname]
    tasks_coll = db.db["export_tasks"]

    try:
        await tasks_coll.update_one(
            {"task_id": task_id},
            {"$set": {"status": "processing", "progress": 0}}
        )

        # Count total matching documents
        total = await collection.count_documents(export_filter)
        actual_limit = min(limit, total) if total > 0 else limit

        # Query in batches and accumulate
        projection = None
        if fields:
            projection = {f: 1 for f in fields}
            projection["_id"] = 0

        all_docs: list[dict] = []
        for skip in range(0, actual_limit, _EXPORT_BATCH_SIZE):
            cursor = collection.find(export_filter, projection).skip(skip).limit(_EXPORT_BATCH_SIZE)
            batch = await cursor.to_list(length=_EXPORT_BATCH_SIZE)
            all_docs.extend(batch)
            progress = min(90, int((len(all_docs) / actual_limit) * 90)) if actual_limit > 0 else 90
            await tasks_coll.update_one(
                {"task_id": task_id},
                {"$set": {"progress": progress, "row_count": len(all_docs)}}
            )
            if len(batch) < _EXPORT_BATCH_SIZE:
                break

        # Generate export content
        now = datetime.utcnow().isoformat()
        file_content: str = ""
        file_name = f"{cname}_{now[:10]}.{fmt}"

        if fmt == "json":
            file_content = json.dumps(all_docs, ensure_ascii=False, indent=2, default=str)
        elif fmt == "csv":
            output = io.StringIO()
            if all_docs:
                all_keys: list[str] = fields or list(all_docs[0].keys())
                if "_id" in all_keys and not fields:
                    all_keys.remove("_id")
                writer = csv.DictWriter(output, fieldnames=all_keys, extrasaction="ignore")
                writer.writeheader()
                writer.writerows(all_docs)
            file_content = output.getvalue()
        elif fmt == "xlsx":
            # xlsx rendering is done client-side; store JSON as intermediate
            file_content = json.dumps(all_docs, ensure_ascii=False, default=str)
            file_name = f"{cname}_{now[:10]}.json"
        elif fmt == "pdf":
            file_content = json.dumps(all_docs, ensure_ascii=False, default=str)
            file_name = f"{cname}_{now[:10]}.json"

        await tasks_coll.update_one(
            {"task_id": task_id},
            {"$set": {
                "status": "completed",
                "progress": 100,
                "row_count": len(all_docs),
                "file_content": file_content,
                "file_name": file_name,
                "completed_at": now,
            }}
        )
        logger.info(f"Export task {task_id} completed: {len(all_docs)} rows, {fmt}")

    except Exception:
        logger.exception(f"Export task {task_id} failed")
        await tasks_coll.update_one(
            {"task_id": task_id},
            {"$set": {"status": "failed", "error": "Export processing failed"}}
        )


async def create_export_task(params: dict[str, Any]) -> dict[str, Any]:
    """Create an async export task with background processing.

    ``params``: ``{ cname, filter?, fields?, format, limit? }``
    """
    cname: str = params["cname"]
    export_filter: dict[str, Any] = params.get("filter", {})
    fields: list[str] | None = params.get("fields")
    fmt: str = params.get("format", "csv")
    limit: int = params.get("limit", 10000)

    task_id = str(uuid4())[:8]
    now = datetime.utcnow().isoformat()

    from data.database import db

    # Create task record
    task_doc = {
        "task_id": task_id,
        "status": "pending",
        "format": fmt,
        "cname": cname,
        "filter": export_filter,
        "fields": fields,
        "limit": limit,
        "row_count": 0,
        "progress": 0,
        "file_content": None,
        "file_name": None,
        "created_at": now,
        "retries": 0,
    }
    await db.db["export_tasks"].insert_one(task_doc)

    # Schedule background processing
    asyncio.create_task(_process_export_task(task_id, cname, export_filter, fields, fmt, limit))

    return {
        "task_id": task_id,
        "status": "pending",
        "row_count": 0,
    }


async def get_export_status(params: dict[str, Any]) -> dict[str, Any]:
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


async def list_export_history(params: dict[str, Any]) -> dict[str, Any]:
    """List export history with optional filters.

    ``params``: ``{ cname?, limit?, offset? }``
    """
    from data.database import db

    cname: str | None = params.get("cname")
    limit: int = params.get("limit", 50)
    offset: int = params.get("offset", 0)

    query: dict[str, Any] = {}
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
