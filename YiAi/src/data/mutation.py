"""Repository mutation operations: create, update, upsert, delete, list_story_task_dirs."""

import logging
import os
import shutil
from typing import Any
import uuid

from bson import ObjectId

from data.database import db, write_concern
from data.helpers import _QUERY_MAX_TIME_MS, _resolve_bug_markdown_path, _resolve_issue_markdown_path, _validate_collection_name
from domain.knowledge.writer import delete_entry_markdown
from shared.config import settings
from shared.error_codes import ErrorCode
from shared.exceptions import BusinessException
from shared.utils import get_current_time

logger = logging.getLogger(__name__)


async def create_document(params: dict[str, Any]) -> dict[str, Any]:
    collection_name = params.get("collection_name") or params.get("cname")
    data = params.get("data")

    if not collection_name:
        raise BusinessException(ErrorCode.INVALID_PARAMS, message="Collection name (collection_name/cname) is required")

    if data is None:
        data = params.copy()
        data.pop("cname", None)
        data.pop("collection_name", None)

    await db.initialize()
    collection_name = _validate_collection_name(collection_name)
    if not data:
        raise BusinessException(ErrorCode.INVALID_PARAMS, message="Create data cannot be empty")

    collection = db.db[collection_name]

    if collection_name == "rss":
        link = data.get("link")
        if link:
            existing_item = await collection.find_one({"link": link})
            if existing_item:
                raise BusinessException(ErrorCode.BUSINESS_ERROR, message=f"Link field value '{link}' already exists, cannot create duplicate")

    data_copy = {k: (str(v) if isinstance(v, ObjectId) else v) for k, v in data.items()}
    current_time = get_current_time()
    if not data_copy.get("key"):
        data_copy["key"] = str(uuid.uuid4())
    data_copy.setdefault("createdTime", current_time)
    data_copy["updatedTime"] = current_time
    if collection_name == "sessions":
        data_copy.pop("pageContent", None)

    try:
        max_order_doc = await collection.find_one(sort=[("order", -1)], projection={"order": 1})
        max_order = max_order_doc.get("order", 0) if max_order_doc else 0
        data_copy["order"] = max_order + 1
    except Exception as e:
        logger.warning(f"Failed to get maximum sort value: {e!s}")
        data_copy["order"] = 1

    try:
        await collection.with_options(write_concern=write_concern(collection_name)).insert_one(data_copy)
    except Exception as e:
        if "duplicate key" in str(e).lower() or "E11000" in str(e):
            if collection_name == "rss":
                raise BusinessException(
                    ErrorCode.BUSINESS_ERROR,
                    message=f"Link field value '{data_copy.get('link', '')}' already exists, cannot create duplicate",
                ) from e
            raise BusinessException(ErrorCode.BUSINESS_ERROR, message="Data creation failed: unique constraint violation") from e
        raise

    return {"key": data_copy["key"]}


async def update_document(params: dict[str, Any]) -> dict[str, Any]:
    collection_name = params.get("collection_name") or params.get("cname")
    data = params.get("data")
    file_path = params.get("file_path")

    if not collection_name:
        raise BusinessException(ErrorCode.INVALID_PARAMS, message="Collection name (collection_name/cname) is required")
    if data is None:
        data = params.copy()
        data.pop("cname", None)
        data.pop("collection_name", None)
        data.pop("file_path", None)

    await db.initialize()
    collection_name = _validate_collection_name(collection_name)

    if collection_name == "sessions" and file_path:
        query_filter = {"file_path": file_path}
    else:
        doc_id = data.get("key")
        if not doc_id:
            raise BusinessException(ErrorCode.INVALID_PARAMS, message="Update data must contain key field")
        query_filter = {"key": doc_id}

    collection = db.db[collection_name]

    existing_doc = await collection.find_one(query_filter)
    if not existing_doc:
        insert_data = data.copy()
        insert_data.pop("_id", None)
        insert_data["createdTime"] = get_current_time()
        insert_data["updatedTime"] = get_current_time()
        if collection_name == "sessions":
            insert_data.pop("pageContent", None)
        await collection.with_options(write_concern=write_concern(collection_name)).insert_one(insert_data)
        return {"query": query_filter, "created": True}

    update_data = data.copy()
    update_data.pop("_id", None)
    update_data.pop("key", None)
    update_data.pop("createdTime", None)
    if collection_name == "sessions":
        update_data.pop("pageContent", None)

    update_data["updatedTime"] = get_current_time()

    await collection.with_options(write_concern=write_concern(collection_name)).update_one(
        query_filter, {"$set": update_data}
    )

    return {"query": query_filter, "updated": True}


async def upsert_document(params: dict[str, Any]) -> dict[str, Any]:
    collection_name = params.get("collection_name") or params.get("cname")
    filter_doc = params.get("filter")
    update_doc = params.get("update")

    if not collection_name:
        raise BusinessException(ErrorCode.INVALID_PARAMS, message="Collection name (collection_name/cname) is required")
    if not filter_doc:
        raise BusinessException(ErrorCode.INVALID_PARAMS, message="Filter (filter) is required")
    if not update_doc:
        raise BusinessException(ErrorCode.INVALID_PARAMS, message="Update data (update) is required")

    await db.initialize()
    collection_name = _validate_collection_name(collection_name)
    collection = db.db[collection_name]

    if not any(k.startswith("$") for k in update_doc):
        update_doc = {"$set": update_doc}

    if "$set" not in update_doc:
        update_doc["$set"] = {}
    update_doc["$set"]["updatedTime"] = get_current_time()

    if "$setOnInsert" not in update_doc:
        update_doc["$setOnInsert"] = {}
    update_doc["$setOnInsert"]["createdTime"] = get_current_time()

    if "key" not in update_doc["$setOnInsert"]:
        update_doc["$setOnInsert"]["key"] = str(uuid.uuid4())
    if collection_name == "sessions":
        if isinstance(update_doc.get("$set"), dict):
            update_doc["$set"].pop("pageContent", None)
            if "messages" in update_doc["$set"] and update_doc["$set"]["messages"] == []:
                update_doc["$set"].pop("messages", None)
        if isinstance(update_doc.get("$setOnInsert"), dict):
            update_doc["$setOnInsert"].pop("pageContent", None)

    result = await collection.with_options(write_concern=write_concern(collection_name)).update_one(
        filter_doc, update_doc, upsert=True
    )

    return {
        "matched_count": result.matched_count,
        "modified_count": result.modified_count,
        "upserted_id": str(result.upserted_id) if result.upserted_id else None,
    }


async def delete_document(params: dict[str, Any]) -> dict[str, Any]:
    collection_name = params.get("collection_name") or params.get("cname")
    doc_id = params.get("key") or params.get("id")

    if not collection_name or not doc_id:
        raise BusinessException(ErrorCode.INVALID_PARAMS, message="collection_name/cname and key are required")

    await db.initialize()
    collection_name = _validate_collection_name(collection_name)
    collection = db.db[collection_name]

    existing_doc = await collection.find_one({"key": doc_id})
    if not existing_doc:
        raise BusinessException(ErrorCode.DATA_NOT_FOUND, message=f"Data with ID {doc_id} not found")

    markdown_path: str | None = None
    if collection_name == "bugs":
        markdown_path = _resolve_bug_markdown_path(existing_doc, doc_id)
    elif collection_name == "issues":
        markdown_path = _resolve_issue_markdown_path(existing_doc, doc_id)

    result = await collection.with_options(write_concern=write_concern(collection_name)).delete_one({"key": doc_id})
    if result.deleted_count == 0:
        raise BusinessException(ErrorCode.DATA_NOT_FOUND, message=f"Data with ID {doc_id} not found")

    if markdown_path:
        try:
            deleted_file = delete_entry_markdown(markdown_path)
            if deleted_file:
                logger.info(f"Deleted markdown file: {markdown_path}")
            else:
                logger.warning(f"Markdown file not found: {markdown_path}")
        except Exception as e:
            logger.warning(f"Failed to delete markdown for key={doc_id}: {e}")

    return {"key": doc_id, "deleted": True}


async def delete_project_cascade(params: dict[str, Any]) -> dict[str, Any]:
    """Delete a project and all related entities (issues, bugs, modules, milestones,
    knowledge files, code health cache, YiKnowledge directories).

    params: { key: str } — the project key.
    """
    project_key = params.get("key")
    if not project_key:
        raise BusinessException(ErrorCode.INVALID_PARAMS, message="key (project key) is required")

    await db.initialize()

    deleted: dict[str, int] = {}

    # 1. Delete all issues with matching project_key
    issues_coll = db.db["issues"]
    issue_keys = [doc["key"] async for doc in issues_coll.find(
        {"project_key": project_key}, {"key": 1}
    )]
    if issue_keys:
        result = await issues_coll.delete_many({"project_key": project_key})
        deleted["issues"] = result.deleted_count
        for ikey in issue_keys:
            try:
                existing = {"project_key": project_key}
                mp = _resolve_issue_markdown_path(existing, ikey)
                if mp:
                    delete_entry_markdown(mp)
            except Exception as e:
                logger.warning(f"Failed to delete issue markdown for key={ikey}: {e}")
    else:
        deleted["issues"] = 0

    # 2. Delete all bugs with matching project_key
    bugs_coll = db.db["bugs"]
    bug_keys = [doc["key"] async for doc in bugs_coll.find(
        {"project_key": project_key}, {"key": 1}
    )]
    if bug_keys:
        result = await bugs_coll.delete_many({"project_key": project_key})
        deleted["bugs"] = result.deleted_count
        for bkey in bug_keys:
            try:
                existing = {"project_key": project_key}
                mp = _resolve_bug_markdown_path(existing, bkey)
                if mp:
                    delete_entry_markdown(mp)
            except Exception as e:
                logger.warning(f"Failed to delete bug markdown for key={bkey}: {e}")
    else:
        deleted["bugs"] = 0

    # 3. Delete all modules with matching project_key
    modules_coll = db.db["modules"]
    result = await modules_coll.delete_many({"project_key": project_key})
    deleted["modules"] = result.deleted_count

    # 4. Delete all milestones with matching project_key
    milestones_coll = db.db["milestones"]
    result = await milestones_coll.delete_many({"project_key": project_key})
    deleted["milestones"] = result.deleted_count

    # 5. Delete YiKnowledge project directories
    knowledge_base = os.path.realpath(os.path.abspath(settings.knowledge_base_dir))
    yik_proj_dir = os.path.join(knowledge_base, "projects", project_key)
    if os.path.isdir(yik_proj_dir):
        try:
            shutil.rmtree(yik_proj_dir)
            deleted["knowledge_files"] = 1
            logger.info(f"Deleted YiKnowledge project directory: {yik_proj_dir}")
        except Exception as e:
            logger.warning(f"Failed to delete YiKnowledge project dir {yik_proj_dir}: {e}")

    # Also clean legacy story paths under engineer/learn/projects/
    yik_story_dir = os.path.join(knowledge_base, "engineer", "learn", "projects", project_key)
    if os.path.isdir(yik_story_dir):
        try:
            shutil.rmtree(yik_story_dir)
            deleted["knowledge_stories"] = 1
            logger.info(f"Deleted YiKnowledge story directory: {yik_story_dir}")
        except Exception as e:
            logger.warning(f"Failed to delete YiKnowledge story dir {yik_story_dir}: {e}")

    # 6. Delete knowledge_files collection entries for this project
    try:
        kf_coll = db.db[settings.collection_knowledge_files]
        kf_result = await kf_coll.delete_many({
            "path": {"$regex": f"^projects/{project_key}/"}
        })
        deleted["knowledge_file_entries"] = kf_result.deleted_count
    except Exception as e:
        logger.warning(f"Failed to delete knowledge_files entries for {project_key}: {e}")

    # 7. Delete code health cache entries
    try:
        ch_coll = db.db["code_health_cache"]
        ch_result = await ch_coll.delete_many({"project_key": project_key})
        deleted["code_health_cache"] = ch_result.deleted_count
    except Exception as e:
        logger.warning(f"Failed to delete code health cache for {project_key}: {e}")

    # 8. Delete the project document itself
    projects_coll = db.db["projects"]
    proj_result = await projects_coll.delete_one({"key": project_key})
    if proj_result.deleted_count == 0:
        raise BusinessException(ErrorCode.DATA_NOT_FOUND, message=f"Project {project_key} not found")
    deleted["project"] = 1

    logger.info(f"Cascade deleted project {project_key}: {deleted}")
    return {"key": project_key, "deleted": deleted}


async def list_story_task_dirs(params: dict[str, Any]) -> dict[str, Any]:
    await db.initialize()
    collection_name = settings.collection_sessions
    collection = db.db[collection_name]

    page_num = max(1, int(params.get("pageNum", params.get("page_num", 1))))
    page_size = min(8000, max(1, int(params.get("pageSize", params.get("page_size", 2000)))))
    project_filter = params.get("project_name", params.get("projectName"))

    match_stage: dict[str, Any] = {
        "projectName": {"$exists": True, "$nin": [None, ""]},
    }
    if project_filter:
        match_stage["projectName"] = project_filter

    pipeline: list[dict[str, Any]] = [
        {"$match": match_stage},
        {
            "$group": {
                "_id": {"projectName": "$projectName", "storyName": "$storyName"},
                "session_count": {"$sum": 1},
                "latest_time": {"$max": "$updatedTime"},
            },
        },
        {"$sort": {"_id.projectName": 1, "_id.storyName": 1}},
        {"$skip": (page_num - 1) * page_size},
        {"$limit": page_size},
    ]

    cursor = collection.aggregate(pipeline, maxTimeMS=_QUERY_MAX_TIME_MS)
    raw = [doc async for doc in cursor]

    dirs = []
    for doc in raw:
        proj = doc["_id"]["projectName"]
        story = doc["_id"].get("storyName", "")
        dirs.append(
            {
                "project_name": proj,
                "story_name": story,
                "dir_path": f"docs/StoryTaskPanel/{proj}/{story}",
                "session_count": doc["session_count"],
                "latest_time": doc["latest_time"],
            }
        )

    count_pipeline: list[dict[str, Any]] = [
        {"$match": match_stage},
        {"$group": {"_id": {"projectName": "$projectName", "storyName": "$storyName"}}},
        {"$count": "total"},
    ]
    count_cursor = collection.aggregate(count_pipeline)
    count_result = [c async for c in count_cursor]
    total = count_result[0]["total"] if count_result else 0

    return {
        "list": dirs,
        "total": total,
        "pageNum": page_num,
        "pageSize": page_size,
        "totalPages": (total + page_size - 1) // page_size if total else 0,
    }
