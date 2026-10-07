"""Image-specific operations: base64 upload with OSS primary + local fallback.

Extracted from local.py: upload_image and _upload_to_local_storage handle
image decoding, OSS upload with automatic local-filesystem fallback, and
static URL generation.
"""
import base64
from datetime import datetime, timezone
import logging
import os

import aiofiles

from domain.files import paths
from domain.files.path_ops import _static_url
from domain.files.storage import upload_bytes_to_oss
from shared.config import settings
from shared.error_codes import ErrorCode
from shared.exceptions import BusinessException

logger = logging.getLogger(__name__)


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

    timestamp = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
    unique_filename = f"{timestamp}{file_ext}"

    rel_dir = directory.strip("/")
    rel_path = f"{rel_dir}/{unique_filename}"
    abs_path = os.path.join(settings.static_base_dir, rel_path)

    os.makedirs(os.path.dirname(abs_path), exist_ok=True)
    async with aiofiles.open(abs_path, "wb") as f:
        await f.write(content)

    return {
        "url": _static_url(rel_path),
        "filename": safe_filename,
        "object_name": rel_path,
    }
