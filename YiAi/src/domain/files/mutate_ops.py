"""File read/write/delete/rename operations for both static and project disks.

Extracted from local.py: all file-level CRUD operations that operate on
either the static base directory or project source trees.
"""
import base64
import logging
import os
import shutil

import aiofiles

from domain.files import paths
from domain.files.path_ops import _resolve_project_path
from shared.config import settings
from shared.error_codes import ErrorCode
from shared.exceptions import BusinessException

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------

async def write_project_file(project: str, target_file: str, content: str, is_base64: bool) -> dict:
    """Write a file directly into a project's source tree on disk.

    Symmetric with :func:`read_project_file`: resolves against
    ``<projects_root>`` (NOT ``static_base_dir``), creates parent dirs as
    needed, and writes only to disk — no MongoDB dual-write. The on-disk
    file is the source of truth for project source files.
    """
    abs_path, project_name = _resolve_project_path(project, target_file)

    try:
        os.makedirs(os.path.dirname(abs_path), exist_ok=True)
        if is_base64:
            content_bytes = base64.b64decode(content)
            async with aiofiles.open(abs_path, "wb") as f:
                await f.write(content_bytes)
        else:
            content_bytes = content.encode("utf-8")
            async with aiofiles.open(abs_path, "w", encoding="utf-8") as f:
                await f.write(content)

        if not os.path.exists(abs_path) or not os.path.isfile(abs_path):
            raise BusinessException(
                ErrorCode.DATA_STORE_FAIL,
                message=f"File write verification failed: {project_name}/{target_file}",
            )

        logger.info(f"Wrote project file: {abs_path} ({len(content_bytes)} bytes)")
        return {"message": "Write successful", "path": target_file}
    except BusinessException:
        raise
    except Exception as e:
        logger.error(f"Failed to write project file: {e!s}", exc_info=True)
        raise BusinessException(
            ErrorCode.DATA_STORE_FAIL, message=f"Failed to write file: {e!s}"
        ) from e


async def delete_project_folder(project: str, target_dir: str) -> dict:
    """Delete a directory from a project's source tree on disk.

    Resolves against ``<projects_root>`` (NOT ``static_base_dir``). Uses
    ``shutil.rmtree``. No MongoDB cleanup — project files are not mirrored
    there. Returns success even if the directory was missing? No: raises
    ``DATA_NOT_FOUND`` if absent, matching :func:`delete_folder`.
    """
    abs_path, project_name = _resolve_project_path(project, target_dir)

    if not os.path.exists(abs_path):
        raise BusinessException(
            ErrorCode.DATA_NOT_FOUND,
            message=f"Directory does not exist: {project_name}/{target_dir}",
        )
    if not os.path.isdir(abs_path):
        raise BusinessException(
            ErrorCode.INVALID_PARAMS,
            message=f"Path is not a directory: {project_name}/{target_dir}",
        )

    try:
        shutil.rmtree(abs_path)
        logger.info(f"Deleted project directory: {abs_path}")
    except Exception as e:
        logger.error(f"Failed to delete project directory: {e!s}", exc_info=True)
        raise BusinessException(
            ErrorCode.DATA_DESTROY_FAIL, message=f"Failed to delete directory: {e!s}"
        ) from e

    return {"message": "Delete successful", "path": target_dir}


async def rename_project_folder(project: str, old_dir: str, new_dir: str) -> dict:
    """Rename (move) a directory within a project's source tree on disk.

    Both ``old_dir`` and ``new_dir`` are resolved against the same
    ``<projects_root>``; cross-project moves are allowed as long as both
    paths stay under the root. No MongoDB cleanup — project folders are not
    mirrored there.
    """
    old_abs, _ = _resolve_project_path(project, old_dir)
    # new_dir may name a different project's folder (or a sibling dir at the
    # root); resolve it independently against the same projects_root.
    new_abs, _ = _resolve_project_path(project, new_dir)

    if not os.path.exists(old_abs):
        raise BusinessException(
            ErrorCode.DATA_NOT_FOUND,
            message=f"Directory does not exist: {project}/{old_dir}",
        )
    if not os.path.isdir(old_abs):
        raise BusinessException(
            ErrorCode.INVALID_PARAMS,
            message=f"Path is not a directory: {project}/{old_dir}",
        )

    try:
        os.makedirs(os.path.dirname(new_abs), exist_ok=True)
        os.rename(old_abs, new_abs)
        logger.info(f"Renamed project directory: {old_abs} -> {new_abs}")
    except Exception as e:
        logger.error(f"Failed to rename project directory: {e!s}", exc_info=True)
        raise BusinessException(
            ErrorCode.DATA_UPDATE_FAIL, message=f"Failed to rename directory: {e!s}"
        ) from e

    return {
        "message": "Rename successful",
        "old_path": old_dir,
        "new_path": new_dir,
    }


# ---------------------------------------------------------------------------
# write
# ---------------------------------------------------------------------------

async def write_file(target_file: str, content: str, is_base64: bool) -> dict:
    """Write file to disk only."""
    target_file = paths.normalize_no_spaces(target_file)
    paths.validate_path(target_file, "Target file path")
    target_path = paths.resolve_static_path(target_file)

    try:
        os.makedirs(os.path.dirname(target_path), exist_ok=True)
        if is_base64:
            content_bytes = base64.b64decode(content)
            async with aiofiles.open(target_path, "wb") as f:
                await f.write(content_bytes)
        else:
            content_bytes = content.encode("utf-8")
            async with aiofiles.open(target_path, "w", encoding="utf-8") as f:
                await f.write(content)

        if not os.path.exists(target_path) or not os.path.isfile(target_path):
            raise BusinessException(
                ErrorCode.DATA_STORE_FAIL,
                message=f"File write verification failed: {target_file}",
            )

        logger.info(f"File write successful: {target_path} ({len(content_bytes)} bytes)")
        return {"message": "Write successful", "path": target_path}
    except BusinessException:
        raise
    except Exception as e:
        logger.error(f"Failed to write file: {e!s}", exc_info=True)
        raise BusinessException(
            ErrorCode.DATA_STORE_FAIL, message=f"Failed to write file: {e!s}"
        ) from e


# ---------------------------------------------------------------------------
# delete
# ---------------------------------------------------------------------------

async def delete_file(target_file: str) -> dict:
    target_file = paths.normalize_no_spaces(target_file)
    paths.validate_path(target_file)
    abs_path = paths.resolve_static_path(target_file)

    if not os.path.exists(abs_path):
        raise BusinessException(
            ErrorCode.DATA_NOT_FOUND, message=f"File does not exist: {target_file}"
        )
    if not os.path.isfile(abs_path):
        raise BusinessException(
            ErrorCode.INVALID_PARAMS, message=f"Path is not a file: {target_file}"
        )

    try:
        os.remove(abs_path)
        logger.info(f"Successfully deleted file: {abs_path}")
    except Exception as e:
        logger.error(f"Failed to delete file: {e!s}", exc_info=True)
        raise BusinessException(
            ErrorCode.DATA_DESTROY_FAIL, message=f"Failed to delete file: {e!s}"
        ) from e

    return {"message": "Delete successful", "path": target_file}


async def delete_folder(target_dir: str) -> dict:
    target_dir = paths.normalize_no_spaces(target_dir)
    paths.validate_path(target_dir)
    abs_path = paths.resolve_static_path(target_dir)

    if not os.path.exists(abs_path):
        raise BusinessException(
            ErrorCode.DATA_NOT_FOUND, message=f"Directory does not exist: {target_dir}"
        )
    if not os.path.isdir(abs_path):
        raise BusinessException(
            ErrorCode.INVALID_PARAMS, message=f"Path is not a directory: {target_dir}"
        )

    try:
        shutil.rmtree(abs_path)
        logger.info(f"Successfully deleted directory: {abs_path}")
    except Exception as e:
        logger.error(f"Failed to delete directory: {e!s}", exc_info=True)
        raise BusinessException(
            ErrorCode.DATA_DESTROY_FAIL, message=f"Failed to delete directory: {e!s}"
        ) from e

    return {"message": "Delete successful", "path": target_dir}


# ---------------------------------------------------------------------------
# rename
# ---------------------------------------------------------------------------

async def rename_file(old_path: str, new_path: str) -> dict:
    old_path = paths.validate_path(old_path, "Old path")
    new_path = paths.validate_path(paths.normalize_no_spaces(new_path), "New path")

    abs_old, abs_new = paths.safe_rename(old_path, new_path, is_dir=False)

    try:
        os.makedirs(os.path.dirname(abs_new), exist_ok=True)
        os.rename(abs_old, abs_new)
        logger.info(f"Successfully renamed file: {abs_old} -> {abs_new}")
    except Exception as e:
        logger.error(f"Failed to rename file: {e!s}", exc_info=True)
        raise BusinessException(
            ErrorCode.DATA_UPDATE_FAIL, message=f"Failed to rename file: {e!s}"
        ) from e

    return {"message": "Rename successful", "old_path": old_path, "new_path": new_path}


async def rename_folder(old_dir: str, new_dir: str) -> dict:
    old_dir = paths.validate_path(old_dir, "Old path")
    new_dir = paths.validate_path(paths.normalize_no_spaces(new_dir), "New path")

    abs_old, abs_new = paths.safe_rename(old_dir, new_dir, is_dir=True)

    try:
        os.makedirs(os.path.dirname(abs_new), exist_ok=True)
        os.rename(abs_old, abs_new)
        logger.info(f"Successfully renamed folder: {abs_old} -> {abs_new}")
    except Exception as e:
        logger.error(f"Failed to rename folder: {e!s}", exc_info=True)
        raise BusinessException(
            ErrorCode.DATA_UPDATE_FAIL, message=f"Failed to rename folder: {e!s}"
        ) from e

    return {"message": "Rename successful", "old_path": old_dir, "new_path": new_dir}


# ---------------------------------------------------------------------------
# upload file
# ---------------------------------------------------------------------------

async def upload_file(
    target_dir: str, filename: str, content: str, is_base64: bool
) -> dict:
    """JSON file upload (text or base64)."""
    target_dir = paths.validate_path(
        paths.normalize_no_spaces(target_dir), "Target directory"
    )
    base_dir = os.path.abspath(settings.static_base_dir)
    save_dir = os.path.join(base_dir, target_dir)
    os.makedirs(save_dir, exist_ok=True)

    filename = os.path.basename(paths.normalize_no_spaces(filename))
    file_path = os.path.join(save_dir, filename)

    try:
        if is_base64:
            content_bytes = base64.b64decode(content)
            async with aiofiles.open(file_path, "wb") as f:
                await f.write(content_bytes)
        else:
            async with aiofiles.open(file_path, "w", encoding="utf-8") as f:
                await f.write(content)
    except Exception as e:
        logger.error(f"Failed to save file: {e!s}", exc_info=True)
        raise BusinessException(
            ErrorCode.DATA_STORE_FAIL, message=f"Failed to save file: {e!s}"
        ) from e

    rel_path = f"/{target_dir}/{filename}".replace(os.sep, "/")
    if rel_path.startswith("//"):
        rel_path = rel_path[1:]
    return {"url": rel_path}
