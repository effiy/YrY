"""OSS storage service wrapper
- Provides file upload/delete, tag management, file info maintenance, and list query
"""
import os
import oss2
import logging
from typing import Optional, List, Dict, Any
from fastapi import UploadFile
from datetime import datetime, timezone
from shared.config import settings
from data.database import db
from shared.error_codes import ErrorCode
from shared.exceptions import BusinessException

logger = logging.getLogger(__name__)

class OSSConfig:
    """Load OSS connection parameters from config"""
    def __init__(self):
        """Initialize OSS configuration"""
        self.access_key_id = settings.oss_access_key
        self.access_key_secret = settings.oss_secret_key
        self.endpoint = settings.oss_endpoint
        self.bucket_name = settings.oss_bucket

        if not all([self.access_key_id, self.access_key_secret, self.endpoint, self.bucket_name]):
            logger.warning("OSS config incomplete.")

def get_bucket(config: OSSConfig) -> oss2.Bucket:
    """
    Build Bucket client

    Args:
        config: OSS configuration object

    Returns:
        oss2.Bucket: OSS Bucket instance

    Raises:
        RuntimeError: If OSS configuration is incomplete
    """
    if not all([config.access_key_id, config.access_key_secret, config.endpoint, config.bucket_name]):
        raise RuntimeError("OSS configuration is incomplete")
    auth = oss2.Auth(config.access_key_id, config.access_key_secret)
    return oss2.Bucket(auth, config.endpoint, config.bucket_name)

def build_oss_url(bucket_name: str, endpoint: str, object_key: str) -> str:
    """
    Generate accessible URL from bucket, endpoint, and object name

    Args:
        bucket_name: Bucket name
        endpoint: Endpoint domain
        object_key: Object key

    Returns:
        str: Complete HTTPS URL
    """
    clean_endpoint = endpoint.replace('http://', '').replace('https://', '')
    return f"https://{bucket_name}.{clean_endpoint}/{object_key}"

async def upload_file_to_oss(
    file: UploadFile,
    directory: Optional[str] = None
) -> dict:
    """Upload file to OSS (parameter validation, size limit, return accessible URL)"""
    config = OSSConfig()
    bucket = get_bucket(config)

    ALLOWED_EXTENSIONS = set(ext.lower() for ext in settings.oss_allowed_extensions)
    if not file.filename:
        raise BusinessException(ErrorCode.INVALID_PARAMS, message="Filename required")

    file_ext = os.path.splitext(file.filename)[1].lower()
    if file_ext not in ALLOWED_EXTENSIONS:
        raise BusinessException(ErrorCode.INVALID_PARAMS, message=f"Unsupported file type: {file_ext}")

    content = await file.read()
    if len(content) > settings.oss_max_file_size:
        raise BusinessException(ErrorCode.INVALID_PARAMS, message="File too large")

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    object_name = f"{directory + '/' if directory else ''}{timestamp}{file_ext}"

    bucket.put_object(object_name, content)
    file_url = build_oss_url(config.bucket_name, config.endpoint, object_name)

    return {
        "url": file_url,
        "filename": file.filename,
        "object_name": object_name
    }

async def upload_bytes_to_oss(
    content: bytes,
    filename: str,
    directory: Optional[str] = None
) -> dict:
    config = OSSConfig()
    bucket = get_bucket(config)

    ALLOWED_EXTENSIONS = set(ext.lower() for ext in settings.oss_allowed_extensions)
    safe_filename = (filename or "").strip() or "image.png"
    file_ext = os.path.splitext(safe_filename)[1].lower() or ".png"
    if file_ext not in ALLOWED_EXTENSIONS:
        raise BusinessException(ErrorCode.INVALID_PARAMS, message=f"Unsupported file type: {file_ext}")

    if len(content) > settings.oss_max_file_size:
        raise BusinessException(ErrorCode.INVALID_PARAMS, message="File too large")

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    object_name = f"{directory + '/' if directory else ''}{timestamp}{file_ext}"

    bucket.put_object(object_name, content)
    file_url = build_oss_url(config.bucket_name, config.endpoint, object_name)

    return {
        "url": file_url,
        "filename": safe_filename,
        "object_name": object_name
    }

async def delete_oss_file(object_name: str):
    """
    Delete OSS file, and clean up related tags and info

    Args:
        object_name: File object name

    Returns:
        str: Deleted object name

    Raises:
        HTTPException: File not found

    Example:
        GET /?module_name=services.storage.oss_client&method_name=delete_oss_file&parameters={"object_name": "images/test.jpg"}
    """
    config = OSSConfig()
    bucket = get_bucket(config)

    if not bucket.object_exists(object_name):
        raise BusinessException(ErrorCode.DATA_NOT_FOUND, message="File not found")

    bucket.delete_object(object_name)

    await db.initialize()
    try:
        await db.delete_one(settings.collection_oss_file_tags, {"object_name": object_name})
        await db.delete_one(settings.collection_oss_file_info, {"object_name": object_name})
    except Exception as e:
        logger.warning(f"Cleanup DB failed for {object_name}: {e}")

    return object_name

async def set_file_tags(object_name: str, tags: List[str]) -> Dict[str, Any]:
    """
    Set file tags (deduplication, idempotent update)

    Args:
        object_name: File object name
        tags: Tag list

    Returns:
        Dict[str, Any]: Updated tag info

    Raises:
        ValueError: File object name cannot be empty

    Example:
        GET /?module_name=services.storage.oss_client&method_name=set_file_tags&parameters={"object_name": "images/test.jpg", "tags": ["vacation", "2023"]}
    """
    if not object_name:
        raise ValueError("File object name cannot be empty")

    tags = [tag.strip() for tag in tags if tag.strip()]
    tags = list(set(tags))

    await db.initialize()
    collection = db.db[settings.collection_oss_file_tags]

    await collection.update_one(
        {"object_name": object_name},
        {
            "$set": {
                "object_name": object_name,
                "tags": tags,
                "updatedTime": datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S')
            }
        },
        upsert=True
    )
    return {"object_name": object_name, "tags": tags}

async def get_file_tags(object_name: str) -> List[str]:
    """
    Get file tag list

    Example:
        GET /?module_name=services.storage.oss_client&method_name=get_file_tags&parameters={"object_name": "images/test.jpg"}
    """
    if not object_name:
        raise ValueError("File object name cannot be empty")

    await db.initialize()
    tag_doc = await db.find_one(settings.collection_oss_file_tags, {"object_name": object_name})
    return tag_doc.get("tags", []) if tag_doc else []

async def delete_file_tags(object_name: str) -> bool:
    """
    Delete all file tags

    Example:
        GET /?module_name=services.storage.oss_client&method_name=delete_file_tags&parameters={"object_name": "images/test.jpg"}
    """
    if not object_name:
        raise ValueError("File object name cannot be empty")

    await db.initialize()
    deleted_count = await db.delete_one(settings.collection_oss_file_tags, {"object_name": object_name})
    return deleted_count > 0

async def get_all_tags() -> List[Dict[str, Any]]:
    """
    Aggregate all tags and their usage counts

    Returns:
        List[Dict[str, Any]]: Tag statistics list, containing name and count

    Example:
        GET /?module_name=services.storage.oss_client&method_name=get_all_tags&parameters={}
    """
    await db.initialize()
    tag_docs = await db.find_many(settings.collection_oss_file_tags, {})

    tag_count = {}
    for doc in tag_docs:
        for tag in doc.get("tags", []):
            tag_count[tag] = tag_count.get(tag, 0) + 1

    sorted_tags = sorted(tag_count.items(), key=lambda x: x[1], reverse=True)
    return [{"name": tag, "count": count} for tag, count in sorted_tags]

async def update_file_info(object_name: str, title: Optional[str] = None, description: Optional[str] = None) -> Dict[str, str]:
    """
    Update file info (title/description), auto-maintain timestamps

    Args:
        object_name: File object name
        title: Title (optional)
        description: Description (optional)

    Returns:
        Dict[str, str]: Updated file info

    Raises:
        ValueError: File object name cannot be empty

    Example:
        GET /?module_name=services.storage.oss_client&method_name=update_file_info&parameters={"object_name": "images/test.jpg", "title": "New Title"}
    """
    if not object_name:
        raise ValueError("File object name cannot be empty")

    update_data = {
        "object_name": object_name,
        "updatedTime": datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S')
    }

    if title is not None:
        update_data["title"] = title.strip() if title else ""
    if description is not None:
        update_data["description"] = description.strip() if description else ""

    await db.initialize()
    collection = db.db[settings.collection_oss_file_info]

    await collection.update_one(
        {"object_name": object_name},
        {
            "$set": update_data,
            "$setOnInsert": {
                "createdTime": datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S')
            }
        },
        upsert=True
    )

    return {
        "object_name": object_name,
        "title": title or "",
        "description": description or ""
    }

async def get_file_info(object_name: str) -> Dict[str, str]:
    """
    Get file info (title/description), return empty structure if not found

    Example:
        GET /?module_name=services.storage.oss_client&method_name=get_file_info&parameters={"object_name": "images/test.jpg"}
    """
    if not object_name:
        raise ValueError("File object name cannot be empty")

    await db.initialize()
    info_doc = await db.find_one(settings.collection_oss_file_info, {"object_name": object_name})

    if info_doc:
        return {
            "object_name": object_name,
            "title": info_doc.get("title", ""),
            "description": info_doc.get("description", "")
        }
    else:
        return {
            "object_name": object_name,
            "title": "",
            "description": ""
        }

async def list_files(directory: Optional[str] = None, tags: Optional[str] = None) -> List[Dict[str, Any]]:
    """
    List files in directory (supports tag filtering), returns basic metadata and tags/info

    Example:
        GET /?module_name=services.storage.oss_client&method_name=list_files&parameters={"directory": "images/"}
    """
    config = OSSConfig()
    bucket = get_bucket(config)

    prefix = f"{directory}/" if directory else ""
    files = []

    for obj in oss2.ObjectIterator(bucket, prefix=prefix):
        last_modified_str = None
        if obj.last_modified:
            try:
                last_modified_dt = datetime.fromtimestamp(obj.last_modified, tz=timezone.utc)
                last_modified_str = last_modified_dt.strftime("%Y-%m-%d %H:%M:%S")
            except (ValueError, TypeError, OSError):
                last_modified_str = str(obj.last_modified)

        file_tags = await get_file_tags(obj.key)
        file_info = await get_file_info(obj.key)

        file_data = {
            "name": obj.key,
            "size": obj.size,
            "size_human": f"{obj.size/1024/1024:.2f}MB",
            "last_modified": obj.last_modified,
            "last_modified_str": last_modified_str,
            "url": build_oss_url(bucket.bucket_name, bucket.endpoint, obj.key),
            "tags": file_tags,
            "title": file_info.get("title", ""),
            "description": file_info.get("description", "")
        }

        if tags:
            filter_tags = [t.strip() for t in tags.split(",") if t.strip()]
            if not any(tag in file_tags for tag in filter_tags):
                continue

        files.append(file_data)

    return files
