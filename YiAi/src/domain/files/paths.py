"""Path normalization and security validation helpers.

Pure functions (read-only settings), no disk IO or MongoDB access. All
filesystem / OSS / Mongo operations are in ``local.py`` / ``storage.py``.
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
    """Check if the file is an image file."""
    if not filename:
        return False
    n = str(filename).lower()
    return n.endswith(_IMAGE_EXTENSIONS)


def normalize_no_spaces(value: str) -> str:
    return re.sub(r"\s+", "_", (value or "").strip())


def normalize_db_key(target_file: str) -> str:
    """Normalize target_file to a uniform DB key (strip static/ prefix)."""
    key = (target_file or "").strip().replace("\\", "/")
    if key.startswith("static/"):
        key = key[7:]
    return key.lstrip("/")


def validate_path(path: str, param_name: str = "Path") -> str:
    """Validate path safety and return a normalized relative path.

    Use realpath to prevent encoding bypass.
    """
    if not path:
        raise BusinessException(ErrorCode.INVALID_PARAMS, message=f"Invalid {param_name}")
    cleaned = path.strip().replace("\\", "/")
    if cleaned.startswith("/"):
        raise BusinessException(ErrorCode.INVALID_PARAMS, message=f"Invalid {param_name}")
    norm = os.path.normpath(cleaned)
    if norm.startswith("..") or os.path.isabs(norm):
        raise BusinessException(ErrorCode.INVALID_PARAMS, message=f"Invalid {param_name}")
    return norm


def resolve_static_path(target_file: str) -> str:
    """Resolve a relative path to a safe absolute path."""
    rel = (target_file or "").strip().replace("\\", "/")
    if rel.startswith("static/"):
        rel = rel[7:]
    if not rel or rel.startswith("/") or ".." in rel:
        raise BusinessException(ErrorCode.INVALID_PARAMS, message="Invalid path")

    base_dir = os.path.realpath(os.path.abspath(settings.static_base_dir))
    abs_path = os.path.realpath(
        os.path.abspath(os.path.join(base_dir, os.path.normpath(rel)))
    )

    if os.path.commonpath([base_dir, abs_path]) != base_dir:
        raise BusinessException(ErrorCode.INVALID_PARAMS, message="Invalid path")

    return abs_path


def safe_rename(old_path: str, new_path: str, is_dir: bool = False) -> tuple[str, str]:
    """Safely rename a file or directory, return (old absolute path, new absolute path)."""
    base_dir = os.path.realpath(os.path.abspath(settings.static_base_dir))

    abs_old = os.path.realpath(os.path.abspath(os.path.join(base_dir, os.path.normpath(old_path))))
    abs_new = os.path.realpath(os.path.abspath(os.path.join(base_dir, os.path.normpath(new_path))))

    if os.path.commonpath([base_dir, abs_old]) != base_dir:
        raise BusinessException(ErrorCode.INVALID_PARAMS, message="Invalid old path")
    if os.path.commonpath([base_dir, abs_new]) != base_dir:
        raise BusinessException(ErrorCode.INVALID_PARAMS, message="Invalid new path")

    if not os.path.exists(abs_old):
        kind = "Directory" if is_dir else "File"
        raise BusinessException(
            ErrorCode.DATA_NOT_FOUND, message=f"Original {kind} does not exist: {old_path}"
        )

    if is_dir and not os.path.isdir(abs_old):
        raise BusinessException(
            ErrorCode.INVALID_PARAMS, message=f"Path is not a directory: {old_path}"
        )
    if not is_dir and not os.path.isfile(abs_old):
        raise BusinessException(
            ErrorCode.INVALID_PARAMS, message=f"Path is not a file: {old_path}"
        )

    return abs_old, abs_new
