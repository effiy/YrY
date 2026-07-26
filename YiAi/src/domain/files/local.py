"""Local file storage service layer.

Encapsulates disk + MongoDB dual persistence: read / write / delete / rename /
upload. Route layer only parses requests and wraps success responses; all IO +
error conversion + dual-write consistency is handled here.

Boundary: OSS uploads are in ``storage.py``; this file only handles local
disk + local Mongo mirroring.
"""
import base64
import logging
import os
import re
import shutil
from datetime import datetime
from typing import Any

from data.database import db
from domain.files import paths
from domain.files.storage import upload_bytes_to_oss
from shared.config import settings
from shared.error_codes import ErrorCode
from shared.exceptions import BusinessException
from shared.utils import get_current_time

logger = logging.getLogger(__name__)


def _static_url(rel_path: str) -> str:
    return f"{settings.static_base_url.rstrip('/')}/{rel_path}"


async def _db():
    await db.initialize()
    return db.db[settings.collection_static_files]


# ---------------------------------------------------------------------------
# read
# ---------------------------------------------------------------------------

async def read_file(target_file: str) -> dict:
    """Read file: disk-first, fall back to MongoDB on miss.

    Image files return a static URL (``type=url``); text returns ``type=text``;
    binary returns ``type=base64``. MongoDB fallback includes ``source=database``.
    """
    target_file = paths.normalize_no_spaces(target_file)
    db_key = paths.normalize_db_key(target_file)
    found_path = paths.resolve_static_path(target_file)

    if not os.path.exists(found_path) or not os.path.isfile(found_path):
        return await _read_from_database(target_file, db_key)

    if not os.path.isfile(found_path):
        raise BusinessException(
            ErrorCode.DATA_NOT_FOUND,
            message=f"Path is not a file: {target_file}",
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


async def _read_from_database(target_file: str, db_key: str) -> dict:
    """Read from MongoDB when disk miss."""
    try:
        collection = await _db()
        doc = await collection.find_one(
            {"target_file": db_key}, projection={"_id": 0}
        )
        if not doc:
            raise BusinessException(
                ErrorCode.DATA_NOT_FOUND, message=f"File does not exist: {target_file}"
            )

        content = doc.get("content", "")
        is_base64 = doc.get("is_base64", False)
        filename = os.path.basename(target_file)

        if paths.is_image_file(filename):
            static_url = _static_url(db_key)
            logger.info(f"Read image from MongoDB, returning static URL: {static_url}")
            return {
                "content": static_url,
                "type": "url",
                "source": "database",
            }

        logger.info(f"Read file from MongoDB: {target_file}")
        return {
            "content": content,
            "type": "base64" if is_base64 else "text",
            "source": "database",
        }
    except BusinessException:
        raise
    except Exception as e:
        logger.error(f"MongoDB fallback read failed: {target_file}: {e}")
        raise BusinessException(
            ErrorCode.DATA_NOT_FOUND, message=f"File does not exist: {target_file}"
        ) from e


# ---------------------------------------------------------------------------
# write
# ---------------------------------------------------------------------------

async def write_file(target_file: str, content: str, is_base64: bool) -> dict:
    """Disk + MongoDB dual write. MongoDB upsert, failure does not affect disk."""
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

        await _dual_write_mongo(target_file, content, is_base64, content_bytes)

        logger.info(f"File write successful: {target_path} ({len(content_bytes)} bytes)")
        return {"message": "Write successful", "path": target_path}
    except BusinessException:
        raise
    except Exception as e:
        logger.error(f"Failed to write file: {str(e)}", exc_info=True)
        raise BusinessException(
            ErrorCode.DATA_STORE_FAIL, message=f"Failed to write file: {str(e)}"
        ) from e


async def _dual_write_mongo(
    target_file: str, content: str, is_base64: bool, content_bytes: bytes
) -> None:
    db_key = paths.normalize_db_key(target_file)
    try:
        collection = await _db()
        await collection.update_one(
            {"target_file": db_key},
            {
                "$set": {
                    "target_file": db_key,
                    "content": content,
                    "is_base64": is_base64,
                    "size": len(content_bytes),
                    "updatedTime": get_current_time(),
                },
                "$setOnInsert": {"createdTime": get_current_time()},
            },
            upsert=True,
        )
        logger.info(f"File synchronized to MongoDB: {db_key}")
    except Exception as e:
        logger.warning(f"MongoDB persistence failed (file already written to disk): {target_file}: {e}")


# ---------------------------------------------------------------------------
# delete
# ---------------------------------------------------------------------------

async def delete_file(target_file: str) -> dict:
    target_file = paths.normalize_no_spaces(target_file)
    paths.validate_path(target_file)
    db_key = paths.normalize_db_key(target_file)
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

    try:
        collection = await _db()
        result = await collection.delete_one({"target_file": db_key})
        if result.deleted_count > 0:
            logger.info(f"Deleted file from MongoDB: {db_key}")
    except Exception as e:
        logger.warning(f"MongoDB delete failed: {db_key}: {e}")

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

    old_db_key = paths.normalize_db_key(old_path)
    new_db_key = paths.normalize_db_key(new_path)
    try:
        collection = await _db()
        result = await collection.update_one(
            {"target_file": old_db_key},
            {"$set": {"target_file": new_db_key, "updatedTime": get_current_time()}},
        )
        if result.matched_count > 0:
            logger.info(f"MongoDB rename synchronized: {old_db_key} -> {new_db_key}")
    except Exception as e:
        logger.warning(
            f"MongoDB rename sync failed: {old_db_key} -> {new_db_key}: {e}"
        )

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

    old_db_prefix = paths.normalize_db_key(old_dir)
    new_db_prefix = paths.normalize_db_key(new_dir)
    try:
        collection = await _db()
        cursor = collection.find(
            {"target_file": {"$regex": f"^{re.escape(old_db_prefix)}/"}}
        )
        updated_count = 0
        async for doc in cursor:
            old_key = doc["target_file"]
            new_key = new_db_prefix + old_key[len(old_db_prefix):]
            await collection.update_one(
                {"target_file": old_key},
                {"$set": {"target_file": new_key, "updatedTime": get_current_time()}},
            )
            updated_count += 1
        if updated_count > 0:
            logger.info(
                f"MongoDB folder rename synchronized: {old_db_prefix} -> {new_db_prefix} ({updated_count} entries)"
            )
    except Exception as e:
        logger.warning(
            f"MongoDB folder rename sync failed: {old_db_prefix} -> {new_db_prefix}: {e}"
        )

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

    filename = paths.normalize_no_spaces(filename)
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
