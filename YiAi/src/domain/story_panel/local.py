"""故事面板本地文件系统 + git 分支查询。

纯本地操作:列出故事目录、推断状态/类型、统计文件、读
``.memory/yry-state.json``、查 git 分支。所有 HTTP 远端在
``remote.py``。

故事目录约定:``docs/故事任务面板/<name-kebab>/``。
"""
import json
import logging
import os
import re
import subprocess
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

from shared.error_codes import ErrorCode
from shared.exceptions import BusinessException

logger = logging.getLogger(__name__)

PANEL_ROOT = Path("docs/故事任务面板")
NAME_KEBAB_RE = re.compile(r"^[a-z][a-z0-9]*(-[a-z][a-z0-9]*)*$")


def validate_name(name: str) -> None:
    if name != os.path.basename(name) or name.startswith(".") or ".." in name:
        raise BusinessException(
            ErrorCode.INVALID_PARAMS, message=f"name 含非法路径字符: {name}"
        )
    if not NAME_KEBAB_RE.match(name):
        raise BusinessException(
            ErrorCode.INVALID_PARAMS, message=f"name 必须为 kebab-case: {name}"
        )


def parse_story_path(name: str) -> Path:
    return PANEL_ROOT / name


def list_story_dirs() -> list[Path]:
    if not PANEL_ROOT.exists():
        return []
    return sorted(p for p in PANEL_ROOT.iterdir() if p.is_dir())


def _file_ends_with(story_dir: Path, suffix: str) -> bool:
    """检查目录下是否存在以 suffix 结尾的 .md 文件(兼容有无 project 前缀的旧命名)。"""
    return any(
        f.name.endswith(suffix) for f in story_dir.iterdir() if f.suffix == ".md"
    )


def _read_story_type(path: Path) -> str:
    try:
        data = json.loads(path.read_text())
        return data.get("type", "meta")
    except Exception:
        return "meta"


def determine_status(story_dir: Path) -> str:
    if not _file_ends_with(story_dir, "01-故事任务.md"):
        return "not_started"

    has_02 = _file_ends_with(story_dir, "02-用户使用场景.md")
    has_05 = _file_ends_with(story_dir, "05-测试用例评审.md")
    has_03 = _file_ends_with(story_dir, "03-后端技术评审.md")
    has_04 = _file_ends_with(story_dir, "04-前端技术评审.md")
    docs_baseline = has_02 and has_05

    type_file = story_dir / ".memory" / "story-type.json"
    story_type = _read_story_type(type_file)
    if story_type in ("backend", "fullstack"):
        docs_baseline = docs_baseline and has_03
    if story_type in ("frontend", "fullstack"):
        docs_baseline = docs_baseline and has_04

    if not docs_baseline:
        return "docs_in_progress"

    has_06 = _file_ends_with(story_dir, "06-后端实施报告.md")
    has_07 = _file_ends_with(story_dir, "07-前端实施报告.md")
    has_impl_report = has_06 or has_07

    if not has_impl_report:
        return "docs_done"

    has_08 = _file_ends_with(story_dir, "08-测试用例报告.md")
    if not has_08:
        return "code_in_progress"

    state_file = story_dir / ".memory" / "yry-state.json"
    if state_file.exists():
        try:
            state = json.loads(state_file.read_text())
            if state.get("blocked"):
                return "blocked"
        except Exception:
            pass

    return "code_done"


def infer_type(story_dir: Path) -> str:
    has_03 = _file_ends_with(story_dir, "03-后端技术评审.md")
    has_04 = _file_ends_with(story_dir, "04-前端技术评审.md")
    has_06 = _file_ends_with(story_dir, "06-后端实施报告.md")
    has_07 = _file_ends_with(story_dir, "07-前端实施报告.md")
    if (has_03 or has_06) and (has_04 or has_07):
        return "fullstack"
    if has_03 or has_06:
        return "backend"
    if has_04 or has_07:
        return "frontend"
    return "meta"


def count_md_files(story_dir: Path) -> int:
    return len([f for f in story_dir.iterdir() if f.suffix == ".md"])


def last_modified(story_dir: Path) -> str:
    max_mtime = 0.0
    for f in story_dir.rglob("*"):
        if f.is_file():
            mtime = f.stat().st_mtime
            if mtime > max_mtime:
                max_mtime = mtime
    if max_mtime == 0.0:
        return ""
    return datetime.fromtimestamp(max_mtime, tz=timezone.utc).isoformat()


def get_branch(name: str) -> Optional[str]:
    branch_name = f"feat/{name}"
    try:
        result = subprocess.run(
            ["git", "branch", "--list", branch_name],
            capture_output=True, text=True, timeout=5,
        )
        output = result.stdout.strip()
        if output:
            return output.lstrip("*").strip()
    except Exception:
        pass
    return None


def list_story_files(story_dir: Path) -> list[dict]:
    """``.md`` 文件清单(含 size/modified),按文件名排序。"""
    files = []
    for f in sorted(story_dir.iterdir()):
        if f.is_file() and f.suffix == ".md":
            stat = f.stat()
            files.append({
                "name": f.name,
                "size": stat.st_size,
                "modified": datetime.fromtimestamp(
                    stat.st_mtime, tz=timezone.utc
                ).isoformat(),
            })
    return files


def read_state_metadata(story_dir: Path) -> dict:
    """读 ``.memory/yry-state.json`` 拿 stage / block_reason。"""
    metadata = {"stage": None, "block_reason": None}
    state_file = story_dir / ".memory" / "yry-state.json"
    if state_file.exists():
        try:
            state = json.loads(state_file.read_text())
            metadata["stage"] = state.get("current_stage")
            metadata["block_reason"] = state.get("block_reason")
        except Exception:
            pass
    return metadata


# ---------------------------------------------------------------------------
# aggregate builders (one per list/detail route)
# ---------------------------------------------------------------------------

_STATUS_KEYS = (
    "code_done", "code_in_progress", "docs_done",
    "docs_in_progress", "not_started", "blocked",
)


def build_overview() -> dict:
    """状态概览:按状态聚合 + 最近 5 个活动故事。"""
    stories = []
    for sdir in list_story_dirs():
        stories.append({
            "name": sdir.name,
            "status": determine_status(sdir),
            "modified": last_modified(sdir),
        })

    summary = {k: 0 for k in _STATUS_KEYS}
    for s in stories:
        if s["status"] in summary:
            summary[s["status"]] += 1
    summary["total"] = len(stories)

    stories.sort(key=lambda s: s["modified"] or "", reverse=True)
    return {"summary": summary, "recent": stories[:5]}


def build_stories_list() -> list[dict]:
    """进度全景:所有故事详情。"""
    items = []
    for sdir in list_story_dirs():
        name = sdir.name
        items.append({
            "name": name,
            "status": determine_status(sdir),
            "files": count_md_files(sdir),
            "last_modified": last_modified(sdir),
            "type": infer_type(sdir),
            "branch": get_branch(name),
        })
    items.sort(key=lambda s: s["last_modified"] or "", reverse=True)
    return items


def build_story_detail(name: str) -> Optional[dict]:
    """单故事详情;故事不存在时返回 None(由路由层转 404 响应)。"""
    validate_name(name)
    sdir = parse_story_path(name)
    if not sdir.is_dir():
        return None

    metadata = read_state_metadata(sdir)
    metadata["status"] = determine_status(sdir)

    return {
        "name": name,
        "directory": str(sdir) + "/",
        "type": infer_type(sdir),
        "files": list_story_files(sdir),
        "branch": get_branch(name),
        "metadata": metadata,
    }


def list_local_dirs() -> list[dict]:
    """``/api/story-panel/remote?source=local`` 用的本地目录清单。"""
    dirs = []
    for sdir in list_story_dirs():
        files = sorted([f.name for f in sdir.iterdir() if f.suffix == ".md"])
        dirs.append({
            "directory": sdir.name,
            "file_count": len(files),
            "files": files,
        })
    return dirs
