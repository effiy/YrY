"""Auth routes — login, logout, menu, and button-permission endpoints."""
import logging
from pathlib import Path

from fastapi import APIRouter
from pydantic import BaseModel

from data.database import db
from domain.auth import create_jwt, verify_password
from shared.config import settings
from shared.error_codes import ErrorCode
from shared.exceptions import BusinessException
from shared.response import success

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/auth", tags=["Auth"])

# Business directories under YiVad src/views/ that appear in the sidebar.
# Pure-template dirs (form, echarts, directives, assembly, etc.) are skipped.
BUSINESS_DIRS = ["home", "aiChat", "brd", "code-review", "rag", "story", "system", "tech-leadership"]
SKIP_SUBDIRS = {"components", "composables", "styles", "constants", "utils", "hooks", "meta"}


# ── Request / Response schemas ──────────────────────────────


class LoginRequest(BaseModel):
    username: str
    password: str


class LoginResponse(BaseModel):
    access_token: str
    username: str


# ── Routes ──────────────────────────────────────────────────


@router.post("/login", operation_id="auth_login")
async def login(body: LoginRequest):
    """Verify credentials and return a JWT access token."""
    await db.initialize()
    collection = db.db["users"]

    user = await collection.find_one({"username": body.username})
    if not user:
        raise BusinessException(
            ErrorCode.UNAUTHORIZED, message="Incorrect username or password"
        )

    hashed = user.get("password", "")
    if not verify_password(body.password, hashed):
        raise BusinessException(
            ErrorCode.UNAUTHORIZED, message="Incorrect username or password"
        )

    token = create_jwt(str(user.get("key", "")), body.username)
    return success(
        data={
            "access_token": token,
            "username": body.username,
        }
    )


@router.post("/logout", operation_id="auth_logout")
async def logout():
    """Placeholder logout — token invalidation is client-side for now."""
    return success(data=None, message="Logged out")


@router.get("/menu/list", operation_id="auth_menu_list")
async def menu_list():
    """Return the sidebar menu tree.

    Source of truth is the `menus` MongoDB collection (managed by the
    /system/menuMange page). Falls back to filesystem auto-scan only when
    the collection is empty (fresh deploy).

    DB docs use the shape written by `createMenu`:
        { key, path, name, component, redirect, parent (path or null),
          order, meta: { title, icon, isLink, isHide, isFull, isAffix, isKeepAlive } }

    The tree is built by grouping on `parent`: docs with `parent == null`
    are top-level; docs with `parent == "/<top>"` are children of that top.
    """
    await db.initialize()
    collection = db.db["menus"]

    docs = await collection.find({}, {"_id": 0}).to_list(length=None)
    if docs:
        return success(data=_build_menu_tree(docs))

    # Fallback: auto-scan views dir (preserves zero-config behavior on fresh deploys).
    menu = _scan_views_dir()
    return success(data=menu)


def _build_menu_tree(docs: list[dict]) -> list[dict]:
    """Build a nested menu tree from flat menu documents."""
    by_path: dict[str, dict] = {}
    for d in docs:
        path = d.get("path") or ""
        if not path:
            continue
        node = {
            "path": path,
            "name": d.get("name") or path.lstrip("/"),
            "component": d.get("component") or "",
            "redirect": d.get("redirect") or "",
            "meta": d.get("meta") or _default_meta(d.get("name") or path),
            "parent": d.get("parent"),
            "order": d.get("order") or 0,
            "children": [],
        }
        by_path[path] = node

    roots: list[dict] = []
    for path, node in by_path.items():
        parent = node.get("parent")
        if not parent:
            roots.append(node)
        else:
            parent_node = by_path.get(parent)
            if parent_node is not None:
                parent_node["children"].append(node)
            else:
                # Orphan: parent path not present — promote to top-level so it isn't lost.
                roots.append(node)

    def _sort(nodes: list[dict]) -> list[dict]:
        nodes.sort(key=lambda n: (n.get("order") or 0, n.get("path") or ""))
        for n in nodes:
            if n.get("children"):
                n["children"] = _sort(n["children"])
        return nodes

    return _sort(roots)


def _scan_views_dir() -> list[dict]:
    """Filesystem auto-scan — original menu generation logic, kept as fallback."""
    views_dir = Path(settings.menu_views_base_dir)
    if not views_dir.is_dir():
        logger.warning(f"Menu views dir not found: {views_dir}")
        return []

    menu: list[dict] = []
    for top in BUSINESS_DIRS:
        top_dir = views_dir / top
        if not top_dir.is_dir():
            continue

        children: list[dict] = []
        for sub in sorted(p for p in top_dir.iterdir() if p.is_dir()):
            if sub.name in SKIP_SUBDIRS or sub.name == "index":
                continue
            if not (sub / "index.vue").exists():
                continue
            children.append(_menu_node(top, sub.name, is_child=True))

        index_subdir = top_dir / "index"
        has_index_subdir = index_subdir.is_dir() and (index_subdir / "index.vue").exists()
        top_index = (top_dir / "index.vue").exists()

        if children:
            if has_index_subdir:
                children.insert(0, _menu_node(top, "index", is_child=True))
            node = _menu_node(top, top, has_children=True, redirect=children[0]["path"])
            node["children"] = children
            menu.append(node)
        elif top_index:
            menu.append(_menu_node(top, top, has_children=False))
        # else: dir exists but no index.vue and no child pages — skip silently

    return menu


def _to_camel(s: str) -> str:
    """kebab-case → camelCase (e.g. 'brd-documents' → 'brdDocuments')."""
    parts = s.split("-")
    return parts[0] + "".join(p[:1].upper() + p[1:] for p in parts[1:] if p)


def _title(s: str) -> str:
    """Capitalize first char only (e.g. 'aiChat' → 'AiChat', 'brd' → 'Brd')."""
    return s[:1].upper() + s[1:] if s else s


def _default_meta(title: str) -> dict:
    return {
        "icon": "Menu",
        "title": title,
        "isLink": "",
        "isHide": False,
        "isFull": False,
        "isAffix": False,
        "isKeepAlive": True,
    }


def _menu_node(top: str, name_src: str, *, is_child: bool = False, has_children: bool = False, redirect: str = "") -> dict:
    """Build a menu node. Children should pass is_child=True so parent path is set.

    Flat top-level entries use path="/<top>/index" to match the Geeker HOME_URL
    convention (e.g. HOME_URL='/home/index'). Parent entries use path="/<top>".
    """
    if is_child:
        path = f"/{top}/{name_src}"
        component = f"{path}/index"
    elif has_children:
        path = f"/{top}"
        component = ""
    else:
        # Flat entry — path includes /index to match HOME_URL convention
        path = f"/{top}/index"
        component = path  # maps to views/<top>/index.vue
    node = {
        "path": path,
        "name": _to_camel(f"{top}-{name_src}") if name_src == "index" else _to_camel(name_src),
        "component": component,
        "redirect": redirect,
        "meta": _default_meta(_title(name_src)),
        "parent": f"/{top}" if is_child else None,
        "order": 0,
    }
    if not is_child:
        node["children"] = []
    return node


@router.get("/buttons", operation_id="auth_buttons")
async def button_permissions():
    """Return button-permission map read from ``button_permissions`` collection.

    Expected document shape:
        { "key": "pageName", "buttons": ["add", "edit", ...] }

    Returns a dict keyed by page name.
    """
    await db.initialize()
    collection = db.db["button_permissions"]

    docs = await collection.find({}, {"_id": 0}).to_list(length=None)
    result: dict[str, list[str]] = {}
    for d in docs:
        result[d.get("key", "")] = d.get("buttons", [])

    return success(data=result)
