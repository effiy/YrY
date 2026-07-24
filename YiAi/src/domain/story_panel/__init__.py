"""故事任务面板业务层。

两层:
- ``local.py``  — 本地文件系统 + git 分支查询 + 聚合构建器。
- ``remote.py`` — 远端文档 API 客户端(HTTP + 解析)。

路由层只解析 request 并包装 success 响应;所有 IO 在这里。
"""
from domain.story_panel.local import (
    build_overview,
    build_stories_list,
    build_story_detail,
    list_local_dirs,
    validate_name,
)
from domain.story_panel.remote import (
    REMOTE_API_URL,
    fetch_recommendations,
    parse_story_dirs_from_remote,
    query_remote_sessions,
    sync_from_remote,
)

__all__ = [
    # local
    "build_overview",
    "build_stories_list",
    "build_story_detail",
    "list_local_dirs",
    "validate_name",
    # remote
    "REMOTE_API_URL",
    "fetch_recommendations",
    "parse_story_dirs_from_remote",
    "query_remote_sessions",
    "sync_from_remote",
]
