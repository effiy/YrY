"""故事任务面板接口 — 路由层。

只负责 request 解析 + 调 domain.story_panel + 包装 success 响应。
所有磁盘 / git / 远端 HTTP IO 都在 ``domain.story_panel`` 里。
"""
import logging
import os

from fastapi import APIRouter, Query
from pydantic import BaseModel, Field
from typing import Optional

from domain.story_panel import (
    REMOTE_API_URL,
    build_overview,
    build_stories_list,
    build_story_detail,
    fetch_recommendations,
    list_local_dirs,
    parse_story_dirs_from_remote,
    query_remote_sessions,
    sync_from_remote,
)
from shared.error_codes import ErrorCode
from shared.response import fail, success

logger = logging.getLogger(__name__)
router = APIRouter()


class SyncRequest(BaseModel):
    names: Optional[list[str]] = Field(
        default=None,
        description="故事名列表 (kebab-case),为空时返回推荐列表",
    )


@router.get("/api/story-panel/overview")
async def overview():
    """状态概览:按状态聚合 + 最近 5 个活动故事。"""
    return success(data=build_overview())


@router.get("/api/story-panel/stories")
async def list_stories():
    """进度全景:所有故事详情表格。"""
    return success(data={"stories": build_stories_list()})


@router.get("/api/story-panel/stories/{name}")
async def show_story(name: str):
    """单故事详情。"""
    detail = build_story_detail(name)
    if detail is None:
        return fail(error=ErrorCode.DATA_NOT_FOUND, message=f"故事不存在: {name}")
    return success(data=detail)


@router.post("/api/story-panel/stories/sync")
async def sync_stories(body: SyncRequest = SyncRequest()):
    """文档同步:指定 names 时从远端下载覆盖本地;未指定返回推荐列表。"""
    if body.names:
        return success(data=await sync_from_remote(body.names))
    return success(data=await fetch_recommendations())


@router.get("/api/story-panel/remote")
async def remote_stories(
    source: str = Query(
        default="all", description="数据源: local(本地), remote(远端API), all(全部)"
    ),
):
    """远端故事查询:从文档 API 查询 tags[0]='故事任务面板' 的故事目录列表。"""
    local_dirs = []
    remote_dirs = []

    if source in ("local", "all"):
        local_dirs = list_local_dirs()

    if source in ("remote", "all"):
        token = os.environ.get("API_X_TOKEN", "")
        if not token:
            if source == "remote":
                return success(data={
                    "source": "remote", "api_url": REMOTE_API_URL,
                    "total_sessions": 0, "filtered_stories": 0,
                    "story_directories": [], "remote_available": False,
                    "reason": "API_X_TOKEN 缺失",
                })
            return success(data={
                "source": source, "local": local_dirs,
                "remote": [], "remote_available": False,
                "reason": "API_X_TOKEN 缺失",
            })

        sessions = await query_remote_sessions()
        if sessions:
            remote_dirs = parse_story_dirs_from_remote(sessions)

        if source == "remote":
            return success(data={
                "source": "remote",
                "api_url": REMOTE_API_URL,
                "total_sessions": len(sessions),
                "filtered_stories": sum(d["file_count"] for d in remote_dirs),
                "story_directories": remote_dirs,
            })

    return success(data={
        "source": source,
        "local": local_dirs,
        "remote": remote_dirs,
        "remote_api": REMOTE_API_URL if remote_dirs else None,
    })


@router.get("/api/story-panel/help")
async def help_info():
    """API 帮助信息。"""
    return success(data={
        "description": "故事任务面板管理 API — 查询与同步",
        "namespace": "docs/故事任务面板/",
        "naming": "kebab-case(如 yry-story)",
        "endpoints": {
            "GET /api/story-panel/overview": "状态概览:按六状态聚合计数 + 最近活动故事列表",
            "GET /api/story-panel/stories": "进度全景:所有故事详情表格(状态/文件数/最后修改/类型/分支)",
            "GET /api/story-panel/stories/{name}": "单故事详情:文件清单/状态/元数据/关联分支(name 为 kebab-case)",
            "POST /api/story-panel/stories/sync": "文档同步:指定 names[] 时从远端下载覆盖本地文件;不指定时返回远端推荐列表",
            "GET /api/story-panel/remote": "远端故事查询:从文档 API 查询 tags[0]='故事任务面板' 的故事目录列表。?source=local|remote|all(默认 all)",
            "GET /api/story-panel/help": "本帮助信息",
        },
        "status_model": {
            "not_started": "01-故事任务.md 不存在",
            "docs_in_progress": "01 存在,文档基线不完整",
            "docs_done": "文档基线齐全,实施报告不存在",
            "code_in_progress": "06 或 07 存在,08 不存在",
            "code_done": "08 存在,未阻断",
            "blocked": ".memory/yry-state.json 含 blocked=true",
        },
        "boundaries": {
            "allowed": ["查询故事状态与进度", "从远端同步文档到本地(批量)"],
            "forbidden": [
                "创建故事文档内容(使用 /rui doc)",
                "修改源码(使用 /rui code)",
                "创建/切换 git 分支",
            ],
        },
    })
