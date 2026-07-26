"""Auth routes — login, logout, menu, and button-permission endpoints."""
import logging
from typing import Optional

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
    """Return the full menu tree from the ``menus`` collection.

    The menus collection stores each menu node as a flat document with
    an optional ``parent`` field referencing the parent's ``path``.
    The tree is assembled on the server before returning.
    """
    await db.initialize()
    collection = db.db["menus"]

    docs = await collection.find({}, {"_id": 0}).sort("order", 1).to_list(length=None)
    if not docs:
        return success(data=[])

    # Build lookup by path, then assemble tree
    by_path: dict[str, dict] = {d["path"]: d for d in docs}
    roots: list[dict] = []

    for d in docs:
        parent = d.get("parent")
        if parent and parent in by_path:
            by_path[parent].setdefault("children", []).append(d)
        else:
            roots.append(d)

    return success(data=roots)


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
