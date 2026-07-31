"""System management routes — menus, departments, roles, dictionaries.

Each resource has full CRUD backed by its MongoDB collection.
"""
import logging
from typing import Optional

from fastapi import APIRouter
from pydantic import BaseModel

from data.database import db
from data.repository import create_document, delete_document, update_document
from shared.error_codes import ErrorCode
from shared.exceptions import BusinessException
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


class DepartmentItem(BaseModel):
    id: str  # e.g. "1", "1-1"
    name: str
    parent: Optional[str] = None


class RoleItem(BaseModel):
    id: str
    name: str
    parent: Optional[str] = None


class DictItem(BaseModel):
    label: str
    value: str
    tag_type: str = ""


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


# ── Departments ──


@router.get("/departments", operation_id="system_departments_list")
async def list_departments():
    docs = await _list_collection("departments")
    tree = _build_tree(docs, parent_field="parent", id_field="id")
    return success(data=tree)


@router.post("/departments", operation_id="system_departments_create")
async def create_department(body: DepartmentItem):
    result = await create_document({
        "collection_name": "departments",
        "data": body.model_dump(),
    })
    return success(data=result, http_code=201)


@router.put("/departments/{key}", operation_id="system_departments_update")
async def update_department(key: str, body: DepartmentItem):
    result = await update_document({
        "collection_name": "departments",
        "data": {"key": key, **body.model_dump(exclude_none=True)},
    })
    return success(data=result)


@router.delete("/departments/{key}", operation_id="system_departments_delete")
async def delete_department(key: str):
    result = await delete_document({"collection_name": "departments", "key": key})
    return success(data=result)


# ── Roles ──


@router.get("/roles", operation_id="system_roles_list")
async def list_roles():
    docs = await _list_collection("roles")
    tree = _build_tree(docs, parent_field="parent", id_field="id")
    return success(data=tree)


@router.post("/roles", operation_id="system_roles_create")
async def create_role(body: RoleItem):
    result = await create_document({
        "collection_name": "roles",
        "data": body.model_dump(),
    })
    return success(data=result, http_code=201)


@router.put("/roles/{key}", operation_id="system_roles_update")
async def update_role(key: str, body: RoleItem):
    result = await update_document({
        "collection_name": "roles",
        "data": {"key": key, **body.model_dump(exclude_none=True)},
    })
    return success(data=result)


@router.delete("/roles/{key}", operation_id="system_roles_delete")
async def delete_role(key: str):
    result = await delete_document({"collection_name": "roles", "key": key})
    return success(data=result)


# ── Dictionaries ──


@router.get("/dicts", operation_id="system_dicts_list")
async def list_dicts():
    """Return all dictionary collections with their items."""
    await db.initialize()
    dict_collections = ["status_dict", "gender_dict"]
    result: dict[str, list] = {}
    for cname in dict_collections:
        docs = await db.db[cname].find({}, {"_id": 0}).to_list(length=None)
        result[cname] = docs
    return success(data=result)


@router.get("/dicts/{name}", operation_id="system_dicts_get")
async def get_dict(name: str):
    await db.initialize()
    docs = await db.db[name].find({}, {"_id": 0}).to_list(length=None)
    if not docs:
        raise BusinessException(ErrorCode.DATA_NOT_FOUND, message=f"Dictionary '{name}' not found")
    return success(data=docs)


@router.post("/dicts/{name}", operation_id="system_dicts_create")
async def create_dict_item(name: str, body: DictItem):
    await db.initialize()
    import uuid
    from datetime import datetime, timezone
    now = datetime.now(timezone.utc).isoformat()
    doc = {**body.model_dump(), "key": str(uuid.uuid4()), "createdTime": now, "updatedTime": now}
    await db.db[name].insert_one(doc)
    return success(data=doc, http_code=201)


@router.put("/dicts/{name}/{key}", operation_id="system_dicts_update")
async def update_dict_item(name: str, key: str, body: DictItem):
    await db.initialize()
    from datetime import datetime, timezone
    now = datetime.now(timezone.utc).isoformat()
    result = await db.db[name].update_one(
        {"key": key}, {"$set": {**body.model_dump(), "updatedTime": now}}
    )
    if result.matched_count == 0:
        raise BusinessException(ErrorCode.DATA_NOT_FOUND, message="Item not found")
    return success(data={"key": key, "updated": True})


@router.delete("/dicts/{name}/{key}", operation_id="system_dicts_delete")
async def delete_dict_item(name: str, key: str):
    await db.initialize()
    result = await db.db[name].delete_one({"key": key})
    if result.deleted_count == 0:
        raise BusinessException(ErrorCode.DATA_NOT_FOUND, message="Item not found")
    return success(data={"key": key, "deleted": True})


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
