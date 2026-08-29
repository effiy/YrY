"""System management routes — menus (plus legacy scheduler status).

Menus keep full CRUD backed by the `menus` MongoDB collection. The former
departments / roles / dictionaries CRUD was removed: org data lives in the
`dict_department` / `dict_role` / `dict_status` / `dict_gender` collections,
served through the RPC `queryDocuments` surface and the dashboard.
"""
import logging
from typing import Optional

from fastapi import APIRouter
from pydantic import BaseModel

from data.database import db
from data.repository import create_document, delete_document, update_document
from shared.response import success

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/system", tags=["System"])


# ── Request schemas ──


class MenuItem(BaseModel):
    path: str
    name: str
    component: str = ""
    redirect: str = ""
    meta: dict = {}
    parent: Optional[str] = None
    order: int = 0


# ── Helpers ──


async def _list_collection(name: str, sort: str = "order") -> list[dict]:
    await db.initialize()
    cursor = db.db[name].find({}, {"_id": 0}).sort(sort, 1)
    return await cursor.to_list(length=None)


def _build_tree(docs: list[dict], parent_field: str = "parent", id_field: str = "id") -> list[dict]:
    """Build nested tree from flat documents with parent references."""
    by_id: dict[str, dict] = {d[id_field]: d for d in docs}
    roots: list[dict] = []
    for d in docs:
        parent = d.get(parent_field)
        if parent and parent in by_id:
            by_id[parent].setdefault("children", []).append(d)
        elif not parent:
            roots.append(d)
    return roots


# ── Menus ──


@router.get("/menus", operation_id="system_menus_list")
async def list_menus():
    docs = await _list_collection("menus")
    has_parent = any(d.get("parent") for d in docs)
    if has_parent:
        tree = _build_tree(docs, parent_field="parent", id_field="path")
        return success(data=tree)
    return success(data=docs)


@router.post("/menus", operation_id="system_menus_create")
async def create_menu(body: MenuItem):
    result = await create_document({
        "collection_name": "menus",
        "data": {**body.model_dump(), "parent": body.parent},
    })
    return success(data=result, http_code=201)


@router.put("/menus/{key}", operation_id="system_menus_update")
async def update_menu(key: str, body: MenuItem):
    result = await update_document({
        "collection_name": "menus",
        "data": {"key": key, **body.model_dump(exclude_none=True)},
    })
    return success(data=result)


@router.delete("/menus/{key}", operation_id="system_menus_delete")
async def delete_menu(key: str):
    result = await delete_document({"collection_name": "menus", "key": key})
    return success(data=result)


# ── Scheduler status ──


@router.get("/scheduler", operation_id="system_scheduler_status")
async def scheduler_status():
    """Return RSS scheduler runtime status."""
    try:
        from domain.rss.scheduler import get_scheduler_status_info
        status = get_scheduler_status_info()
        return success(data=status)
    except Exception as e:
        return success(data={"status": "unknown", "error": str(e)})
