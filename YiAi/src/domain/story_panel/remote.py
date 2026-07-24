"""故事面板远端文档 API 客户端。

封装 HTTP 调用与响应解析:
- ``query_remote_sessions()`` — 调远端 RPC 拿 sessions 列表。
- ``parse_story_dirs_from_remote(sessions)`` — 纯函数,把 sessions 按
  tags[0]=='故事任务面板' 聚合为目录列表。
- ``fetch_recommendations()`` — 拉远端推荐列表(无 names 参数时)。
- ``sync_from_remote(names)`` — 指定 names 时从远端下载并覆盖本地文件。

token 通过 ``API_X_TOKEN`` 环境变量传入。无 token 时各调用返回
"缺失"哨兵,由路由层决定如何响应。
"""
import logging
import os

import httpx

from domain.story_panel.local import parse_story_path, validate_name

logger = logging.getLogger(__name__)

REMOTE_API_URL = os.environ.get("IMPORT_DOCS_API_URL", "https://api.effiy.cn")
_TIMEOUT_SECONDS = 30


def _token() -> str:
    return os.environ.get("API_X_TOKEN", "")


async def query_remote_sessions() -> list[dict]:
    """调远端 RPC 拿 sessions 列表;无 token 或失败时返回 []。"""
    token = _token()
    if not token:
        return []
    try:
        async with httpx.AsyncClient(timeout=_TIMEOUT_SECONDS) as client:
            resp = await client.post(
                f"{REMOTE_API_URL}/",
                json={
                    "module_name": "services.database.data_service",
                    "method_name": "query_documents",
                    "parameters": {"cname": "sessions", "limit": 10000},
                },
                headers={
                    "X-Token": token,
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                },
            )
            data = resp.json()
        return data.get("data", {}).get("list", [])
    except Exception as e:
        logger.warning(f"remote query failed: {e}")
        return []


def parse_story_dirs_from_remote(sessions: list[dict]) -> list[dict]:
    """从远端 sessions 中提取 tags[0]=='故事任务面板' 的故事目录列表。"""
    stories = [s for s in sessions if s.get("tags") and s["tags"][0] == "故事任务面板"]

    dirs: dict[str, list[str]] = {}
    for s in stories:
        tags = s.get("tags", [])
        story_dir = tags[1] if len(tags) > 1 else "unknown"
        dirs.setdefault(story_dir, []).append(s.get("file_path", ""))

    result = []
    for dirname, file_list in sorted(dirs.items()):
        result.append({
            "directory": dirname,
            "file_count": len(file_list),
            "files": sorted(file_list),
        })
    return result


async def fetch_recommendations() -> dict:
    """无 names 参数时:返回远端推荐列表。"""
    token = _token()
    if not token:
        return {"recommendations": [], "total": 0, "reason": "API_X_TOKEN 缺失"}

    sessions = await query_remote_sessions()
    remote_dirs = parse_story_dirs_from_remote(sessions)
    recommendations = [
        {"name": d["directory"], "files": d["file_count"]} for d in remote_dirs
    ]
    return {"recommendations": recommendations, "total": len(recommendations)}


async def sync_from_remote(names: list[str]) -> dict:
    """指定 names 时:从远端下载文档覆盖本地。"""
    token = _token()
    if not token:
        return {"synced": False, "reason": "API_X_TOKEN 缺失"}

    for name in names:
        validate_name(name)

    sessions = await query_remote_sessions()
    if not sessions:
        return {"synced": False, "reason": "远端无数据"}

    results = []
    total_written = 0
    total_failed = 0

    async with httpx.AsyncClient(timeout=_TIMEOUT_SECONDS) as client:
        for name in names:
            story_files = [
                s for s in sessions
                if s.get("tags")
                and s["tags"][0] == "故事任务面板"
                and len(s["tags"]) > 1
                and s["tags"][1] == name
            ]
            if not story_files:
                results.append({
                    "name": name, "written": 0, "failed": 0,
                    "reason": "远端无此故事",
                })
                continue

            written = 0
            failed = 0
            for sf in story_files:
                remote_path = sf.get("file_path", "")
                if not remote_path:
                    failed += 1
                    continue
                local_filename = os.path.basename(remote_path)
                try:
                    resp = await client.post(
                        f"{REMOTE_API_URL}/read-file",
                        json={"target_file": remote_path},
                        headers={
                            "X-Token": token,
                            "Content-Type": "application/json",
                            "Accept": "application/json",
                        },
                    )
                    data = resp.json()
                    if data.get("code") != 0:
                        failed += 1
                        continue
                    content = data.get("data", {}).get("content", "")
                except Exception:
                    failed += 1
                    continue

                local_dir = parse_story_path(name)
                local_dir.mkdir(parents=True, exist_ok=True)
                local_path = local_dir / local_filename
                try:
                    local_path.write_text(content, encoding="utf-8")
                    written += 1
                except Exception:
                    failed += 1

            results.append({"name": name, "written": written, "failed": failed})
            total_written += written
            total_failed += failed

    return {
        "synced": True,
        "results": results,
        "total_written": total_written,
        "total_failed": total_failed,
    }
