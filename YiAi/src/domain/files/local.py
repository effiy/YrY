"""Local file storage service layer.

Encapsulates disk-only file persistence: read / write / delete / rename /
upload / list-directory. Route layer only parses requests and wraps success
responses; all IO + error conversion is handled here.

Metadata (file path, size, type, timestamps) should be stored in MongoDB via
the data_service API. File content lives on disk only.

Boundary: OSS uploads are in ``storage.py``; this file only handles local disk.

This module is the public API surface for local file operations. Internal
helpers are split by concern:

- ``path_ops.py`` — path resolution, URL building, traversal safety
- ``file_ops.py`` — file CRUD for static and project disks
- ``image_ops.py`` — image upload with OSS-primary / local-fallback
"""
import logging
import os
import stat

from domain.files import paths
from domain.files.file_ops import (
    delete_file,
    delete_folder,
    delete_project_folder,
    read_file,
    read_project_file,
    rename_file,
    rename_folder,
    rename_project_folder,
    upload_file,
    write_file,
    write_project_file,
)
from domain.files.image_ops import upload_image
from shared.config import settings
from shared.error_codes import ErrorCode
from shared.exceptions import BusinessException

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# list directory
# ---------------------------------------------------------------------------

async def list_directory(target_dir: str = "", max_depth: int = 3) -> dict:
    """List directory contents recursively up to ``max_depth`` levels.

    Returns a nested tree::

        {"dirs": [...], "files": [{name, path, size, mtime, ext}, ...], "root": "..."}

    Empty string / "." means the static base directory root.
    """
    target_dir = (target_dir or "").strip().replace("\\", "/")
    if target_dir in (".", "/"):
        target_dir = ""

    base_dir = os.path.realpath(os.path.abspath(settings.static_base_dir))
    if target_dir:
        norm = paths.normalize_no_spaces(target_dir)
        abs_path = os.path.realpath(os.path.join(base_dir, os.path.normpath(norm)))
        if os.path.commonpath([base_dir, abs_path]) != base_dir:
            raise BusinessException(ErrorCode.INVALID_PARAMS, message="Invalid directory path")
        if not os.path.exists(abs_path) or not os.path.isdir(abs_path):
            raise BusinessException(ErrorCode.FILE_NOT_FOUND, message=f"Directory not found: {target_dir}")
    else:
        abs_path = base_dir

    files = []
    dirs = []

    async def _scan(current: str, depth: int) -> None:
        if depth > max_depth:
            return
        try:
            entries = sorted(os.scandir(current), key=lambda e: (not e.is_dir(), e.name))
        except OSError:
            return
        for entry in entries:
            rel = os.path.relpath(entry.path, base_dir).replace(os.sep, "/")
            if entry.name.startswith(".") and entry.name not in (".claude",):
                continue
            try:
                st = entry.stat()
            except OSError:
                continue
            if stat.S_ISDIR(st.st_mode):
                dirs.append({"name": entry.name, "path": rel})
                if depth < max_depth:
                    await _scan(entry.path, depth + 1)
            else:
                files.append({
                    "name": entry.name,
                    "path": rel,
                    "size": st.st_size,
                    "mtime": int(st.st_mtime * 1000),
                    "ext": os.path.splitext(entry.name)[1].lower(),
                })

    await _scan(abs_path, 1)
    return {"root": target_dir or "/", "dirs": dirs, "files": files}


# Re-export all public functions for backward compatibility
__all__ = [
    "delete_file",
    "delete_folder",
    "delete_project_folder",
    "list_directory",
    "read_file",
    "read_project_file",
    "rename_file",
    "rename_folder",
    "rename_project_folder",
    "upload_file",
    "upload_image",
    "write_file",
    "write_project_file",
]
