"""User management routes — CRUD backed by data_service internally."""
import csv
import io
import json
import logging
from typing import Any, Optional

from fastapi import APIRouter, UploadFile
from pydantic import BaseModel

from data.database import db
from data.repository import (
    create_document,
    delete_document,
    query_documents,
    update_document,
)
from domain.auth import hash_password
from shared.error_codes import ErrorCode
from shared.exceptions import BusinessException
from shared.response import success

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/users", tags=["Users"])

_COLLECTION = "users"

# ── Request schemas ──


class UserQuery(BaseModel):
    model_config = {"extra": "allow"}

    pageNum: int = 1
    pageSize: int = 10
    username: Optional[str] = None
    gender: Optional[int] = None
    status: Optional[int] = None
    email: Optional[str] = None
    filter: Optional[dict[str, Any]] = None


class UserCreate(BaseModel):
    username: str
    password: str
    gender: int = 1
    email: str = ""
    status: int = 1
    avatar: str = ""


class UserUpdate(BaseModel):
    username: Optional[str] = None
    password: Optional[str] = None
    gender: Optional[int] = None
    email: Optional[str] = None
    status: Optional[int] = None
    avatar: Optional[str] = None


# ── Helpers ──


def _build_tree(docs: list[dict], id_field: str, name_field: str) -> list[dict]:
    """Build a tree from flat documents using optional ``children`` field."""
    result: list[dict] = []
    for doc in docs:
        node = {
            id_field: doc.get("id", doc.get("key", "")),
            name_field: doc.get("name", ""),
        }
        if "children" in doc and doc["children"]:
            node["children"] = _build_tree(doc["children"], id_field, name_field)
        result.append(node)
    return result


# ── CRUD routes ──


@router.post("/list", operation_id="users_list")
async def list_users(body: UserQuery):
    """Paginated user query."""
    params: dict[str, Any] = {
        "collection_name": _COLLECTION,
        "pageNum": body.pageNum,
        "pageSize": body.pageSize,
        # Exclude the bcrypt password hash from list responses — the
        # column would otherwise leak the hash to every user-list call
        # (anyone with a token, since auth is optional in dev), enabling
        # offline brute-force. tree_users already projects password:0 at
        # the Mongo layer; list_users goes through query_documents and
        # must opt out via excludeFields. export_users was fixed in
        # a2d8196 but list_users was missed.
        "excludeFields": "password",
    }
    # Build filter from known + extra fields
    extra = body.model_dump(exclude={"pageNum", "pageSize", "username", "gender", "status", "email", "filter"}, exclude_none=True)
    filters: dict[str, Any] = {}
    if body.username:
        filters["username"] = body.username
    if body.gender is not None:
        filters["gender"] = body.gender
    if body.status is not None:
        filters["status"] = body.status
    if body.email:
        filters["email"] = body.email
    if body.filter:
        filters.update(body.filter)
    # Pass extra fields (e.g. startTime, endTime, departmentId, type) as filters
    for k, v in extra.items():
        if k not in ("pageNum", "pageSize"):
            filters[k] = v
    if filters:
        params["filter"] = filters

    result = await query_documents(params)
    return success(data=result)


@router.post("/tree", operation_id="users_tree")
async def tree_users(body: UserQuery):
    """User tree query — returns users grouped by department as a tree.

    Each department node has its users as ``children`` so the table
    can expand/collapse department groups.
    """
    await db.initialize()

    # Fetch all users
    filters: dict[str, Any] = {}
    if body.username:
        filters["username"] = body.username
    if body.gender is not None:
        filters["gender"] = body.gender
    if body.status is not None:
        filters["status"] = body.status

    extra = body.model_dump(exclude={"pageNum", "pageSize", "username", "gender", "status", "email", "filter"}, exclude_none=True)
    for k, v in extra.items():
        if k not in ("pageNum", "pageSize"):
            filters[k] = v

    users = await db.db[_COLLECTION].find(filters, {"_id": 0, "password": 0}).to_list(length=None)

    # Fetch all departments (canonical source: dict_department nested tree)
    deps = await db.db["dict_department"].find({}, {"_id": 0}).to_list(length=None)

    def _build_user_tree(dep_nodes: list[dict]) -> list[dict]:
        result: list[dict] = []
        for dep in dep_nodes:
            dep_users = [u for u in users if u.get("departmentId") == dep.get("id")]
            node = {
                "id": dep.get("id", ""),
                "name": dep.get("name", ""),
                "username": dep.get("name", ""),
                "children": dep_users + _build_user_tree(dep.get("children", [])),
            }
            result.append(node)
        return result

    tree = _build_user_tree(deps)
    # Flatten: top-level departments with users as children
    return success(data={"list": tree, "total": len(tree)})


@router.post("", operation_id="users_create")
async def create_user(body: UserCreate):
    """Create a new user."""
    user_data = body.model_dump()
    user_data["password"] = hash_password(body.password)
    result = await create_document({
        "collection_name": _COLLECTION,
        "data": user_data,
    })
    # Set `id` alias for backward compat with YiVad views
    key = result.get("key", "")
    if key:
        await db.db[_COLLECTION].update_one({"key": key}, {"$set": {"id": key}})
    return success(data=result, http_code=201)


@router.put("/{key}", operation_id="users_update")
async def update_user(key: str, body: UserUpdate):
    """Update a user by key."""
    data = body.model_dump(exclude_none=True)
    if not data:
        raise BusinessException(ErrorCode.INVALID_PARAMS, message="No fields to update")
    if "password" in data:
        data["password"] = hash_password(data["password"])
    result = await update_document({
        "collection_name": _COLLECTION,
        "data": {"key": key, **data},
    })
    return success(data=result)


@router.delete("/{key}", operation_id="users_delete")
async def delete_user(key: str):
    """Delete a user by key."""
    result = await delete_document({
        "collection_name": _COLLECTION,
        "key": key,
    })
    return success(data=result)


@router.post("/batch", operation_id="users_batch")
async def batch_import(file: UploadFile):
    """Batch import users from a file (CSV or JSON)."""
    content = await file.read()
    text = content.decode("utf-8")

    if file.filename and file.filename.endswith(".json"):
        rows = json.loads(text)
        if isinstance(rows, dict):
            rows = [rows]
    else:
        reader = csv.DictReader(io.StringIO(text))
        rows = list(reader)

    created = 0
    for row in rows:
        if not row.get("username"):
            continue
        pwd = row.get("password", "123456")
        await create_document({
            "collection_name": _COLLECTION,
            "data": {
                "username": row["username"],
                "password": hash_password(pwd),
                "gender": int(row.get("gender", 1)),
                "email": row.get("email", ""),
                "status": int(row.get("status", 1)),
                "avatar": row.get("avatar", ""),
            },
        })
        created += 1

    return success(data={"imported": created})


@router.post("/export", operation_id="users_export")
async def export_users(body: UserQuery):
    """Export all matching users as CSV."""
    params: dict[str, Any] = {
        "collection_name": _COLLECTION,
        "pageNum": 1,
        "pageSize": 100000,
        # Exclude the bcrypt password hash from the export — the column
        # would otherwise leak the hash to anyone downloading the CSV,
        # enabling offline brute-force. tree_users projects password:0
        # at the Mongo layer; the export path goes through query_documents
        # and must opt out via excludeFields.
        "excludeFields": "password",
    }
    if body.username:
        params["filter"] = {"username": body.username}
    result = await query_documents(params)
    rows = result.get("list", [])

    # Defensive: strip any password field that slipped through (e.g. if
    # query_documents ignored excludeFields or the column was renamed).
    for r in rows:
        r.pop("password", None)

    output = io.StringIO()
    if rows:
        # DictWriter requires every row's keys ⊆ fieldnames. Mongo is
        # schema-less, so collect the union of all row keys first.
        all_keys: list[str] = []
        seen = set()
        for r in rows:
            for k in r.keys():
                if k not in seen:
                    seen.add(k)
                    all_keys.append(k)
        writer = csv.DictWriter(output, fieldnames=all_keys, extrasaction="ignore")
        writer.writeheader()
        writer.writerows(rows)

    from fastapi.responses import Response

    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=users.csv"},
    )


# ── Dictionary routes ──


async def _dict_list(collection_name: str) -> list[dict]:
    """Return flat list from a dictionary collection."""
    await db.initialize()
    collection = db.db[collection_name]
    docs = await collection.find({}, {"_id": 0}).to_list(length=None)
    return docs


@router.get("/dict/status", operation_id="users_dict_status")
async def dict_status():
    docs = await _dict_list("dict_status")
    return success(data=docs)


@router.get("/dict/gender", operation_id="users_dict_gender")
async def dict_gender():
    docs = await _dict_list("dict_gender")
    return success(data=docs)


@router.get("/dict/department", operation_id="users_dict_department")
async def dict_department():
    docs = await _dict_list("dict_department")
    tree = _build_tree(docs, "id", "name")
    return success(data={"list": tree, "total": len(tree)})


@router.get("/dict/role", operation_id="users_dict_role")
async def dict_role():
    docs = await _dict_list("dict_role")
    return success(data=_build_tree(docs, "id", "name"))
