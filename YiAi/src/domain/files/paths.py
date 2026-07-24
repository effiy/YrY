"""路径规范化与安全验证 helpers。

纯函数(只读 settings),不触碰磁盘 IO 也不触碰 MongoDB。所有
filesystem / OSS / Mongo 操作在 ``local.py`` / ``storage.py`` 里。
"""
import os
import re

from shared.config import settings
from shared.error_codes import ErrorCode
from shared.exceptions import BusinessException

_IMAGE_EXTENSIONS = (
    ".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg", ".bmp", ".ico",
)


def is_image_file(filename: str) -> bool:
    """判断是否是图片文件。"""
    if not filename:
        return False
    n = str(filename).lower()
    return n.endswith(_IMAGE_EXTENSIONS)


def normalize_no_spaces(value: str) -> str:
    return re.sub(r"\s+", "_", (value or "").strip())


def normalize_db_key(target_file: str) -> str:
    """将 target_file 规范化为统一的 DB 键(去掉 static/ 前缀)。"""
    key = (target_file or "").strip().replace("\\", "/")
    if key.startswith("static/"):
        key = key[7:]
    return key.lstrip("/")


def validate_path(path: str, param_name: str = "路径") -> str:
    """验证路径安全性,返回规范化的相对路径。

    使用 realpath 防止编码绕过。
    """
    if not path:
        raise BusinessException(ErrorCode.INVALID_PARAMS, message=f"非法{param_name}")
    cleaned = path.strip().replace("\\", "/")
    if cleaned.startswith("/"):
        raise BusinessException(ErrorCode.INVALID_PARAMS, message=f"非法{param_name}")
    norm = os.path.normpath(cleaned)
    if norm.startswith("..") or os.path.isabs(norm):
        raise BusinessException(ErrorCode.INVALID_PARAMS, message=f"非法{param_name}")
    return norm


def resolve_static_path(target_file: str) -> str:
    """将相对路径解析为安全的绝对路径。"""
    rel = (target_file or "").strip().replace("\\", "/")
    if rel.startswith("static/"):
        rel = rel[7:]
    if not rel or rel.startswith("/") or ".." in rel:
        raise BusinessException(ErrorCode.INVALID_PARAMS, message="非法路径")

    base_dir = os.path.realpath(os.path.abspath(settings.static_base_dir))
    abs_path = os.path.realpath(
        os.path.abspath(os.path.join(base_dir, os.path.normpath(rel)))
    )

    if os.path.commonpath([base_dir, abs_path]) != base_dir:
        raise BusinessException(ErrorCode.INVALID_PARAMS, message="非法路径")

    return abs_path


def safe_rename(old_path: str, new_path: str, is_dir: bool = False) -> tuple[str, str]:
    """安全地重命名文件或目录,返回 (旧绝对路径, 新绝对路径)。"""
    base_dir = os.path.abspath(settings.static_base_dir)

    abs_old = os.path.join(base_dir, old_path)
    abs_new = os.path.join(base_dir, new_path)

    if not os.path.abspath(abs_old).startswith(base_dir):
        raise BusinessException(ErrorCode.INVALID_PARAMS, message="非法旧路径")
    if not os.path.abspath(abs_new).startswith(base_dir):
        raise BusinessException(ErrorCode.INVALID_PARAMS, message="非法新路径")

    if not os.path.exists(abs_old):
        kind = "目录" if is_dir else "文件"
        raise BusinessException(
            ErrorCode.DATA_NOT_FOUND, message=f"原{kind}不存在: {old_path}"
        )

    if is_dir and not os.path.isdir(abs_old):
        raise BusinessException(
            ErrorCode.INVALID_PARAMS, message=f"路径不是一个目录: {old_path}"
        )
    if not is_dir and not os.path.isfile(abs_old):
        raise BusinessException(
            ErrorCode.INVALID_PARAMS, message=f"路径不是一个文件: {old_path}"
        )

    return abs_old, abs_new
