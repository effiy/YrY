"""Dashboard organization stats — users, roles, departments."""
import logging
from collections import Counter

from fastapi import APIRouter
from pydantic import BaseModel

from shared.response import success

logger = logging.getLogger(__name__)
router = APIRouter()


class OrgDepartmentInfo(BaseModel):
    name: str
    id: str = ""
    user_count: int = 0


class OrgRoleInfo(BaseModel):
    name: str
    id: str = ""
    parent: str = ""


class OrgUserStats(BaseModel):
    total: int
    active: int
    inactive: int
    by_department: list[OrgDepartmentInfo]
    by_gender: dict[str, int]


class OrgStatsResponse(BaseModel):
    users: OrgUserStats
    roles: list[OrgRoleInfo]
    departments: list[OrgDepartmentInfo]


@router.get("/organization", operation_id="dashboard_organization")
async def organization():
    """Return organization statistics."""
    try:
        from data.database import db

        await db.initialize()

        users_coll = db.db["users"]
        users_cursor = users_coll.find({}, {"_id": 0, "password": 0})
        users = await users_cursor.to_list(length=None)

        active = sum(1 for u in users if u.get("status") == 1)
        gender_map = {"1": "Male", "2": "Female", 1: "Male", 2: "Female"}
        genders = Counter(gender_map.get(u.get("gender", "unknown"), "Unknown") for u in users)

        dept_counter = Counter()
        for u in users:
            dept_id = u.get("departmentId", "unknown")
            dept_counter[dept_id] += 1

        def _flatten_tree(nodes: list[dict], parent: str = "") -> list[dict]:
            flat: list[dict] = []
            for node in nodes or []:
                flat.append({"id": node.get("id", ""), "name": node.get("name", ""), "parent": parent})
                flat.extend(_flatten_tree(node.get("children") or [], node.get("id", "")))
            return flat

        depts_coll = db.db["dict_department"]
        depts = await depts_coll.find({}, {"_id": 0}).to_list(length=None)
        dept_info = [
            OrgDepartmentInfo(name=d["name"] or d["id"], id=d["id"], user_count=dept_counter.get(d["id"], 0))
            for d in _flatten_tree(depts)
        ]

        roles_coll = db.db["dict_role"]
        roles = await roles_coll.find({}, {"_id": 0}).to_list(length=None)
        role_info = [
            OrgRoleInfo(name=r["name"] or r["id"], id=r["id"], parent=r["parent"])
            for r in _flatten_tree(roles)
        ]

        return success(data=OrgStatsResponse(
            users=OrgUserStats(
                total=len(users),
                active=active,
                inactive=len(users) - active,
                by_department=dept_info,
                by_gender=dict(genders),
            ),
            roles=role_info,
            departments=dept_info,
        ).model_dump())
    except Exception as e:
        logger.warning(f"Organization stats failed: {e}")
        return success(data=OrgStatsResponse(
            users=OrgUserStats(total=0, active=0, inactive=0, by_department=[], by_gender={}),
            roles=[], departments=[],
        ).model_dump())