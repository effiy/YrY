"""文件存储服务。

两层:
- ``storage.py`` — OSS 远端对象存储。
- ``local.py``   — 本地静态磁盘 + MongoDB 双持久化(read/write/
  delete/rename/upload)。
- ``paths.py``  — 路径规范化与安全验证,纯函数,无 IO。
"""
from domain.files.local import (
    delete_file,
    delete_folder,
    read_file,
    rename_file,
    rename_folder,
    upload_file,
    upload_image,
    write_file,
)
from domain.files.paths import (
    is_image_file,
    normalize_db_key,
    normalize_no_spaces,
    resolve_static_path,
    safe_rename,
    validate_path,
)
from domain.files.storage import (
    OSSConfig,
    build_oss_url,
    delete_file_tags,
    delete_oss_file,
    get_all_tags,
    get_bucket,
    get_file_info,
    get_file_tags,
    list_files,
    set_file_tags,
    update_file_info,
    upload_bytes_to_oss,
    upload_file_to_oss,
)

__all__ = [
    # OSS storage
    "OSSConfig",
    "get_bucket",
    "build_oss_url",
    "upload_file_to_oss",
    "upload_bytes_to_oss",
    "delete_oss_file",
    "set_file_tags",
    "get_file_tags",
    "delete_file_tags",
    "get_all_tags",
    "update_file_info",
    "get_file_info",
    "list_files",
    # local disk + mongo
    "read_file",
    "write_file",
    "delete_file",
    "delete_folder",
    "rename_file",
    "rename_folder",
    "upload_file",
    "upload_image",
    # paths
    "is_image_file",
    "normalize_no_spaces",
    "normalize_db_key",
    "validate_path",
    "resolve_static_path",
    "safe_rename",
]
