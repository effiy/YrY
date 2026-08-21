"""Local file storage service layer.

Encapsulates disk-only file persistence: read / write / delete / rename /
upload. Route layer only parses requests and wraps success responses; all IO +
error conversion is handled here.

Metadata (file path, size, type, timestamps) should be stored in MongoDB via
the data_service API. File content lives on disk only.

Boundary: OSS uploads are in ``storage.py``; this file only handles local disk.
"""
import base64
import logging
import os
import shutil
from datetime import datetime

from domain.files import paths
from domain.files.storage import upload_bytes_to_oss
from shared.config import settings
from shared.error_codes import ErrorCode
from shared.exceptions import BusinessException

logger = logging.getLogger(__name__)


def _static_url(rel_path: str) -> str:
    return f"{settings.static_base_url.rstrip('/')}/{rel_path}"


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
        if clean_path.startswith("static/"):
            clean_path = clean_path[7:]
        clean_path = clean_path.lstrip("/")
        static_url = _static_url(clean_path)
        logger.info(f"Image file, returning static URL: {static_url}")
        return {"content": static_url, "type": "url"}

    try:
        try:
            with open(found_path, "r", encoding="utf-8") as f:
                content = f.read()
                return {"content": content, "type": "text"}
        except UnicodeDecodeError:
            with open(found_path, "rb") as f:
                content_bytes = f.read()
            content_b64 = base64.b64encode(content_bytes).decode("utf-8")
            return {"content": content_b64, "type": "base64"}
    except Exception as e:
        logger.error(f"Failed to read file: {str(e)}", exc_info=True)
        raise BusinessException(
            ErrorCode.INTERNAL_ERROR, message=f"Failed to read file: {str(e)}"
        ) from e


# ---------------------------------------------------------------------------
# project disk read
# ---------------------------------------------------------------------------

def _resolve_project_path(project: str, target_file: str) -> tuple[str, str]:
    """Resolve ``<projects_root>/<project>/<target_file>`` with path-traversal
    protection, returning ``(abs_path, project_name)``.

    Path forms accepted (story cards are inconsistent about prefixing, so we
    tolerate all three):

    1. ``src/foo.vue`` (project-relative) → resolved under
       ``<projects_root>/<project>/``.
    2. ``YiAi/src/foo.vue`` (project-prefixed) → leading ``<project>/`` is
       stripped, then resolved under ``<projects_root>/<project>/``.
    3. ``YiKnowledge/engineer/learn/projects/YiAi/.../scene.md`` (knowledge-prefixed) →
       resolved under ``<knowledge_base_dir>`` (YiKnowledge lives as a
       sibling of the projects, not inside any one project).

    When the first segment of ``target_file`` matches a directory directly
    under ``projects_root`` (e.g. ``.claude``), the actual project is
    auto-detected from that segment and the caller-supplied ``project`` is
    overridden. This lets skill paths like ``.claude/skills/<name>/SKILL.md``
    resolve against ``<projects_root>/.claude/`` regardless of the project
    the caller passed in.
    """
    project_name = (project or "").strip()
    if not project_name or "/" in project_name or ".." in project_name:
        raise BusinessException(
            ErrorCode.INVALID_PARAMS, message=f"Invalid project: {project}"
        )

    raw = (target_file or "").strip().replace("\\", "/")
    if not raw or raw.startswith("/") or ".." in raw.split("/"):
        raise BusinessException(
            ErrorCode.INVALID_PARAMS, message=f"Invalid path: {target_file}"
        )

    # Knowledge files live under the shared YiKnowledge tree, not under any
    # single project. Strip the "YiKnowledge/" prefix and resolve against
    # the configured knowledge_base_dir (default ../YiKnowledge).
    knowledge_prefix = "YiKnowledge/"
    if raw.startswith(knowledge_prefix):
        rel = raw[len(knowledge_prefix):]
        if not rel or rel.startswith("/") or ".." in rel.split("/"):
            raise BusinessException(
                ErrorCode.INVALID_PARAMS, message=f"Invalid path: {target_file}"
            )
        base_dir = os.path.realpath(os.path.abspath(settings.knowledge_base_dir))
        abs_path = os.path.realpath(os.path.join(base_dir, os.path.normpath(rel)))
        if abs_path != base_dir and not abs_path.startswith(base_dir + os.sep):
            raise BusinessException(
                ErrorCode.INVALID_PARAMS, message="Invalid path"
            )
        return abs_path, project_name

    # Project source file. Story cards store paths with the project prefix
    # already prepended ("YiAi/src/foo.py" or "YiVad/src/bar.vue"); the
    # project on the story may be "YiAi" but the file may live in a sibling
    # project. Detect the actual project from the path's first segment when
    # it matches a directory under projects_root; otherwise fall back to the
    # caller-supplied project name.
    root_abs = os.path.realpath(os.path.abspath(settings.projects_root))
    segments = raw.split("/")
    first = segments[0] if segments else ""
    first_abs = os.path.realpath(os.path.join(root_abs, first)) if first else None
    if first and first_abs != root_abs and first_abs.startswith(root_abs + os.sep) and os.path.isdir(first_abs):
        project_name = first
        rel = raw[len(first) + 1:]
    else:
        project_prefix = f"{project_name}/"
        if raw.startswith(project_prefix):
            rel = raw[len(project_prefix):]
        else:
            rel = raw
    if not rel or rel.startswith("/") or ".." in rel.split("/"):
        raise BusinessException(
            ErrorCode.INVALID_PARAMS, message=f"Invalid path: {target_file}"
        )

    project_abs = os.path.realpath(os.path.join(root_abs, project_name))
    if project_abs != root_abs and not project_abs.startswith(root_abs + os.sep):
        raise BusinessException(
            ErrorCode.INVALID_PARAMS, message=f"Invalid project: {project}"
        )
    abs_path = os.path.realpath(os.path.join(project_abs, os.path.normpath(rel)))
    if abs_path != project_abs and not abs_path.startswith(project_abs + os.sep):
        raise BusinessException(
            ErrorCode.INVALID_PARAMS, message="Invalid path"
        )
    return abs_path, project_name


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
            with open(abs_path, "r", encoding="utf-8") as f:
                return {"content": f.read(), "type": "text", "source": "project_disk"}
        except UnicodeDecodeError:
            with open(abs_path, "rb") as f:
                content_b64 = base64.b64encode(f.read()).decode("utf-8")
            return {"content": content_b64, "type": "base64", "source": "project_disk"}
    except Exception as e:
        logger.error(f"Failed to read project file: {str(e)}", exc_info=True)
        raise BusinessException(
            ErrorCode.INTERNAL_ERROR, message=f"Failed to read file: {str(e)}"
        ) from e


# ---------------------------------------------------------------------------
# project disk write / delete / rename
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
            with open(abs_path, "wb") as f:
                f.write(content_bytes)
        else:
            content_bytes = content.encode("utf-8")
            with open(abs_path, "w", encoding="utf-8") as f:
                f.write(content)

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
        logger.error(f"Failed to write project file: {str(e)}", exc_info=True)
        raise BusinessException(
            ErrorCode.DATA_STORE_FAIL, message=f"Failed to write file: {str(e)}"
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
        logger.error(f"Failed to delete project directory: {str(e)}", exc_info=True)
        raise BusinessException(
            ErrorCode.DATA_DESTROY_FAIL, message=f"Failed to delete directory: {str(e)}"
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
        logger.error(f"Failed to rename project directory: {str(e)}", exc_info=True)
        raise BusinessException(
            ErrorCode.DATA_UPDATE_FAIL, message=f"Failed to rename directory: {str(e)}"
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
            with open(target_path, "wb") as f:
                f.write(content_bytes)
        else:
            content_bytes = content.encode("utf-8")
            with open(target_path, "w", encoding="utf-8") as f:
                f.write(content)

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
        logger.error(f"Failed to write file: {str(e)}", exc_info=True)
        raise BusinessException(
            ErrorCode.DATA_STORE_FAIL, message=f"Failed to write file: {str(e)}"
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
        logger.error(f"Failed to delete file: {str(e)}", exc_info=True)
        raise BusinessException(
            ErrorCode.DATA_DESTROY_FAIL, message=f"Failed to delete file: {str(e)}"
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
        logger.error(f"Failed to delete directory: {str(e)}", exc_info=True)
        raise BusinessException(
            ErrorCode.DATA_DESTROY_FAIL, message=f"Failed to delete directory: {str(e)}"
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
        logger.error(f"Failed to rename file: {str(e)}", exc_info=True)
        raise BusinessException(
            ErrorCode.DATA_UPDATE_FAIL, message=f"Failed to rename file: {str(e)}"
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
        logger.error(f"Failed to rename folder: {str(e)}", exc_info=True)
        raise BusinessException(
            ErrorCode.DATA_UPDATE_FAIL, message=f"Failed to rename folder: {str(e)}"
        ) from e

    return {"message": "Rename successful", "old_path": old_dir, "new_path": new_dir}


# ---------------------------------------------------------------------------
# upload
# ---------------------------------------------------------------------------

async def upload_image(
    data_url: str, filename: str, directory: str
) -> dict:
    """base64 image upload: OSS first, fall back to local static directory on failure."""
    raw = (data_url or "").strip()
    if not raw:
        raise BusinessException(
            ErrorCode.INVALID_PARAMS, message="Image data is empty"
        )

    base64_part = raw
    if raw.startswith("data:"):
        comma = raw.find(",")
        if comma < 0:
            raise BusinessException(
                ErrorCode.INVALID_PARAMS, message="Image data format error"
            )
        base64_part = raw[comma + 1:].strip()

    try:
        content = base64.b64decode(base64_part, validate=True)
    except Exception as e:
        raise BusinessException(
            ErrorCode.INVALID_PARAMS, message="Base64 decode failed"
        ) from e

    filename = paths.normalize_no_spaces(filename)
    directory = paths.normalize_no_spaces(directory or "aicr")

    try:
        return await upload_bytes_to_oss(content, filename, directory=directory)
    except Exception as e:
        logger.warning(f"OSS upload failed, falling back to local storage: {e}")
        return await _upload_to_local_storage(content, filename, directory)


async def _upload_to_local_storage(
    content: bytes, filename: str, directory: str
) -> dict:
    """Upload image to local static storage."""
    safe_filename = (filename or "").strip() or "image.png"
    file_ext = os.path.splitext(safe_filename)[1].lower() or ".png"

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    unique_filename = f"{timestamp}{file_ext}"

    rel_dir = directory.strip("/")
    rel_path = f"{rel_dir}/{unique_filename}"
    abs_path = os.path.join(settings.static_base_dir, rel_path)

    os.makedirs(os.path.dirname(abs_path), exist_ok=True)
    with open(abs_path, "wb") as f:
        f.write(content)

    return {
        "url": _static_url(rel_path),
        "filename": safe_filename,
        "object_name": rel_path,
    }


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
            with open(file_path, "wb") as f:
                f.write(content_bytes)
        else:
            with open(file_path, "w", encoding="utf-8") as f:
                f.write(content)
    except Exception as e:
        logger.error(f"Failed to save file: {str(e)}", exc_info=True)
        raise BusinessException(
            ErrorCode.DATA_STORE_FAIL, message=f"Failed to save file: {str(e)}"
        ) from e

    rel_path = f"/{target_dir}/{filename}".replace(os.sep, "/")
    if rel_path.startswith("//"):
        rel_path = rel_path[1:]
    return {"url": rel_path}
