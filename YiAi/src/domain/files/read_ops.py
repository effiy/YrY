"""File read/write/delete/rename operations for both static and project disks.

Extracted from local.py: all file-level CRUD operations that operate on
either the static base directory or project source trees.
"""
import base64
import logging
import os

import aiofiles

from domain.files import paths
from domain.files.path_ops import _resolve_project_path, _static_url
from shared.error_codes import ErrorCode
from shared.exceptions import BusinessException

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------

# read
# ---------------------------------------------------------------------------

async def read_file(target_file: str) -> dict:
    """Read file from disk.

    Image files return a static URL (``type=url``); text returns ``type=text``;
    binary returns ``type=base64``.
    """
    target_file = paths.normalize_no_spaces(target_file)
    found_path = paths.resolve_static_path(target_file)

    if not os.path.exists(found_path) or not os.path.isfile(found_path):
        raise BusinessException(
            ErrorCode.DATA_NOT_FOUND, message=f"File does not exist: {target_file}"
        )

    filename = os.path.basename(target_file)
    if paths.is_image_file(filename):
        clean_path = target_file.replace("\\", "/")
        clean_path = clean_path.removeprefix("static/")
        clean_path = clean_path.lstrip("/")
        static_url = _static_url(clean_path)
        logger.info(f"Image file, returning static URL: {static_url}")
        return {"content": static_url, "type": "url"}

    try:
        try:
            async with aiofiles.open(found_path, encoding="utf-8") as f:
                content = await f.read()
                return {"content": content, "type": "text"}
        except UnicodeDecodeError:
            async with aiofiles.open(found_path, "rb") as f:
                content_bytes = await f.read()
            content_b64 = base64.b64encode(content_bytes).decode("utf-8")
            return {"content": content_b64, "type": "base64"}
    except Exception as e:
        logger.error(f"Failed to read file: {e!s}", exc_info=True)
        raise BusinessException(
            ErrorCode.INTERNAL_ERROR, message=f"Failed to read file: {e!s}"
        ) from e


# ---------------------------------------------------------------------------
# project disk read
# ---------------------------------------------------------------------------

async def read_project_file(project: str, target_file: str) -> dict:
    """Read a file directly from a project's source tree on disk.

    Resolves ``<projects_root>/<project>/<target_file>`` with path-traversal
    protection. Returns ``{content, type, source}`` like :func:`read_file` but
    does NOT fall back to MongoDB — the on-disk content is the source of
    truth, so callers see the live project state, not a stale snapshot.

    Used by the YiVad story sidebar preview: story/scenario cards reference
    paths that may belong to a specific project's source tree or to the
    shared YiKnowledge tree, and the preview must reflect what's on that
    disk right now.
    """
    abs_path, _ = _resolve_project_path(project, target_file)

    if not os.path.exists(abs_path) or not os.path.isfile(abs_path):
        raise BusinessException(
            ErrorCode.DATA_NOT_FOUND,
            message=f"File does not exist on project disk: {project}/{target_file}",
        )

    try:
        try:
            async with aiofiles.open(abs_path, encoding="utf-8") as f:
                return {"content": await f.read(), "type": "text", "source": "project_disk"}
        except UnicodeDecodeError:
            async with aiofiles.open(abs_path, "rb") as f:
                content_b64 = base64.b64encode(await f.read()).decode("utf-8")
            return {"content": content_b64, "type": "base64", "source": "project_disk"}
    except Exception as e:
        logger.error(f"Failed to read project file: {e!s}", exc_info=True)
        raise BusinessException(
            ErrorCode.INTERNAL_ERROR, message=f"Failed to read file: {e!s}"
        ) from e


# ---------------------------------------------------------------------------
# project disk write / delete / rename
# ---------------------------------------------------------------------------

