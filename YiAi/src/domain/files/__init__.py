"""File management domain — public API.

Re-exports disk + OSS file operations from local.py and storage.py.
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

__all__ = [
    "delete_file",
    "delete_folder",
    "read_file",
    "rename_file",
    "rename_folder",
    "upload_file",
    "upload_image",
    "write_file",
]
