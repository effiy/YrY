"""System management routes — menus and scheduler status.

Menus keep full CRUD backed by the `menus` MongoDB collection. The former
departments / roles / dictionaries CRUD was removed: org data lives in the
`dict_department` / `dict_role` / `dict_status` / `dict_gender` collections,
served through the RPC `queryDocuments` surface and the dashboard.
"""
import logging

from fastapi import APIRouter
from pydantic import BaseModel, Field, model_validator

from data.database import db
from data.repository import create_document, delete_document, update_document
from shared.cache import cache
from shared.cache_keys import CACHE_TTL
from shared.response import success

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/system", tags=["System"])


# ── Request schemas ──


class MenuMeta(BaseModel):
    """Menu display metadata — validated sub-model for MenuItem."""
    title: str = Field(..., min_length=1, max_length=50, description="Menu display name")
    icon: str = Field(default="Menu", max_length=50)
    is_link: str = Field(default="", max_length=500)
    is_hide: bool = False
    is_full: bool = False
    is_affix: bool = False
    is_keep_alive: bool = True


class MenuItem(BaseModel):
    path: str = Field(..., min_length=1, pattern=r"^/", description="Route path, must start with /")
    name: str = Field(..., min_length=1, max_length=100, pattern=r"^[a-zA-Z][a-zA-Z0-9_-]*$")
    component: str = Field(default="", max_length=200)
    redirect: str = Field(default="", max_length=200)
    meta: MenuMeta = Field(default_factory=MenuMeta)
    parent: str | None = Field(default=None, max_length=200)
    order: int = Field(default=0, ge=0)

    @model_validator(mode="after")
    def check_parent_not_self(self):
        if self.parent and self.parent == self.path:
            raise ValueError("parent cannot reference the menu's own path")
        return self


# ── Helpers ──


async def _list_collection(name: str, sort: str = "order") -> list[dict]:
    await db.initialize()
    cursor = db.db[name].find({}, {"_id": 0}).sort(sort, 1)
    return await cursor.to_list(length=None)


def _build_tree(docs: list[dict], parent_field: str = "parent", id_field: str = "id") -> list[dict]:
    """Build nested tree from flat documents with parent references.

    Treats ``parent == None``, ``parent == ""``, ``parent == "ROOT"``, or any
    parent value that does not resolve to an existing document as a top-level
    (root) node — so malformed or legacy parent values are surfaced instead
    of being silently dropped.
    """
    by_id: dict[str, dict] = {d[id_field]: d for d in docs}
    roots: list[dict] = []
    ROOT_TOKENS = {None, "", "ROOT", "root", "/"}
    for d in docs:
        parent = d.get(parent_field)
        if parent and parent not in ROOT_TOKENS and parent in by_id:
            by_id[parent].setdefault("children", []).append(d)
        else:
            # Either explicitly top-level (None/"" / "ROOT") or orphaned by an
            # unknown parent — promote to top-level so callers can see it.
            roots.append(d)
    return roots


# ── Menus ──


async def get_menu_tree(use_cache: bool = True) -> list[dict]:
    """Return the full menu tree from the `menus` collection.

    Single source of truth for menu reads — used by /auth/menu/list,
    /system/menus, and the app cache warmup.

    Parent-link compatibility
    -------------------------
    Seed data in ``authMenuList.json`` historically uses the **path** as the
    parent pointer (``parent: "/system"``). Once menus are written through the
    RPC CRUD (create/update_document), the stable identifier is the **key**
    (``menu_xxx`` / a uuid). We detect which convention the dataset is using
    on-the-fly by trying both join keys, so neither dataset is orphaned.
    """
    async def _fetch():
        docs = await _list_collection("menus")
        # 1) Try the legacy parent=path join first (matches seed data & bulk-reset)
        tree_by_path = _build_tree(docs, parent_field="parent", id_field="path")
        # 2) A dataset is "well-shaped by path" when: we have at least 1 root
        #    and every doc with a non-null parent actually resolved (no orphans)
        roots = [d for d in tree_by_path]
        with_parents = sum(1 for d in docs if d.get("parent"))
        orphans = []

        def _walk(nodes: list[dict], acc: list[dict]):
            for n in nodes:
                acc.append(n)
                if n.get("children"):
                    _walk(n["children"], acc)
        flat: list[dict] = []
        _walk(roots, flat)
        resolved_with_children = len(flat) - len(roots)
        if resolved_with_children == 0 and with_parents:
            orphans = [d for d in docs if d.get("parent")]
        if not orphans and roots:
            return tree_by_path
        # 3) Fallback: parent holds a document key (the RPC/CRUD style). This
        #    is the new canonical shape — keys are stable UUIDs, paths can be
        #    edited by the menu admin page.
        tree_by_key = _build_tree(docs, parent_field="parent", id_field="key")
        flat2: list[dict] = []
        _walk(tree_by_key, flat2)
        if len(flat2) >= len(flat):
            return tree_by_key
        # 4) Pick whichever join kept more nodes visible (best-effort).
        return tree_by_path if len(flat) >= len(flat2) else tree_by_key

    if use_cache:
        return await cache.get_or_set("system:menus", _fetch, ttl=CACHE_TTL["data:menus"])
    return await _fetch()


@router.get("/menus", operation_id="system_menus_list")
async def list_menus():
    data = await get_menu_tree()
    return success(data=data, cache_ttl=CACHE_TTL["data:menus"])


@router.post("/menus", operation_id="system_menus_create")
async def create_menu(body: MenuItem):
    result = await create_document({
        "collection_name": "menus",
        "data": {
            **body.model_dump(),
            "meta": _meta_dict(body.meta),
        },
    })
    await cache.delete("system:menus")
    return success(data=result, http_code=201)


@router.put("/menus/{key}", operation_id="system_menus_update")
async def update_menu(key: str, body: MenuItem):
    result = await update_document({
        "collection_name": "menus",
        "data": {
            "key": key,
            **body.model_dump(),
            "meta": _meta_dict(body.meta),
        },
    })
    await cache.delete("system:menus")
    return success(data=result)


@router.delete("/menus/{key}", operation_id="system_menus_delete")
async def delete_menu(key: str):
    result = await delete_document({"collection_name": "menus", "key": key})
    await cache.delete("system:menus")
    return success(data=result)


class BulkResetRequest(BaseModel):
    menus: list[dict] = Field(..., min_length=1)


@router.post("/menus/bulk-reset", operation_id="system_menus_bulk_reset")
async def bulk_reset_menus(body: BulkResetRequest):
    """Replace all menus with the provided list. Clears existing menus first."""
    await db.initialize()
    collection = db.db["menus"]
    await collection.delete_many({})
    if body.menus:
        await collection.insert_many(body.menus)
    await cache.delete("system:menus")
    return success(data={"count": len(body.menus)}, message=f"Reset {len(body.menus)} menus")


def _meta_dict(meta: MenuMeta) -> dict:
    """Convert MenuMeta to the dict shape expected by the frontend (camelCase keys)."""
    return {
        "icon": meta.icon,
        "title": meta.title,
        "isLink": meta.is_link,
        "isHide": meta.is_hide,
        "isFull": meta.is_full,
        "isAffix": meta.is_affix,
        "isKeepAlive": meta.is_keep_alive,
    }


# ── Scheduler status ──


@router.get("/scheduler", operation_id="system_scheduler_status")
async def scheduler_status():
    """Return RSS scheduler runtime status."""
    async def _fetch():
        from domain.rss.scheduler import get_scheduler_status_info
        return get_scheduler_status_info()
    try:
        status = await cache.get_or_set("system:scheduler", _fetch, ttl=CACHE_TTL["system:scheduler"])
        return success(data=status, cache_ttl=CACHE_TTL["system:scheduler"])
    except Exception as e:
        return success(data={"status": "unknown", "error": str(e)})
