"""File management endpoints — route layer.

Only responsible for request parsing + calling domain.files + wrapping success response.
All disk / OSS / Mongo IO is in ``domain.files``.
"""
import logging

from fastapi import APIRouter

from domain.files import (
    delete_file,
    delete_folder,
    delete_project_folder,
    read_file,
    read_project_file,
    rename_file,
    rename_folder,
    rename_project_folder,
    upload_file,
    upload_image,
    write_file,
    write_project_file,
)
from models.schemas import (
    FileDeleteRequest,
    FileReadRequest,
    FileRenameRequest,
    FileUploadRequest,
    FileWriteRequest,
    FolderDeleteRequest,
    FolderRenameRequest,
    ImageUploadToOssRequest,
    ProjectFileReadRequest,
    ProjectFileWriteRequest,
    ProjectFolderDeleteRequest,
    ProjectFolderRenameRequest,
)
from shared.response import success

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/upload-image-to-oss", operation_id="upload_image_to_oss")
@router.post("/upload/upload-image-to-oss", operation_id="upload_image_to_oss_alt")
async def upload_image_to_oss(request: ImageUploadToOssRequest):
    data = await upload_image(request.data_url, request.filename, request.directory)
    return success(data=data)


@router.post("/read-file", operation_id="read_file")
async def read_file_route(request: FileReadRequest):
    """Read file from disk. Images return static URL."""
    data = await read_file(request.target_file)
    return success(data=data)


@router.post("/read-project-file", operation_id="read_project_file")
async def read_project_file_route(request: ProjectFileReadRequest):
    """Read a file directly from the corresponding project's source tree on disk.

    Returns live on-disk content (no MongoDB fallback) so the caller always
    sees what's in the project right now, not a stale snapshot.
    """
    data = await read_project_file(request.project, request.target_file)
    return success(data=data)


@router.post("/write-project-file", operation_id="write_project_file")
async def write_project_file_route(request: ProjectFileWriteRequest):
    """Write a file directly into a project's source tree on disk.

    Disk-only (no MongoDB dual-write); symmetric with ``/read-project-file``.
    Creates parent directories as needed.
    """
    data = await write_project_file(
        request.project, request.target_file, request.content, request.is_base64
    )
    return success(data=data)


@router.post("/delete-project-folder", operation_id="delete_project_folder")
async def delete_project_folder_route(request: ProjectFolderDeleteRequest):
    """Delete a directory from a project's source tree on disk (recursive)."""
    data = await delete_project_folder(request.project, request.target_dir)
    return success(data=data)


@router.post("/rename-project-folder", operation_id="rename_project_folder")
async def rename_project_folder_route(request: ProjectFolderRenameRequest):
    """Rename (move) a directory within a project's source tree on disk."""
    data = await rename_project_folder(request.project, request.old_dir, request.new_dir)
    return success(data=data)


@router.post("/write-file", operation_id="write_file")
async def write_file_route(request: FileWriteRequest):
    """Write file to disk."""
    data = await write_file(request.target_file, request.content, request.is_base64)
    return success(data=data)


@router.post("/delete-file", operation_id="delete_file")
async def delete_file_route(request: FileDeleteRequest):
    data = await delete_file(request.target_file)
    return success(data=data)


@router.post("/delete-folder", operation_id="delete_folder")
async def delete_folder_route(request: FolderDeleteRequest):
    data = await delete_folder(request.target_dir)
    return success(data=data)


@router.post("/rename-file", operation_id="rename_file")
async def rename_file_route(request: FileRenameRequest):
    data = await rename_file(request.old_path, request.new_path)
    return success(data=data)


@router.post("/rename-folder", operation_id="rename_folder")
async def rename_folder_route(request: FolderRenameRequest):
    data = await rename_folder(request.old_dir, request.new_dir)
    return success(data=data)


@router.post("/upload", operation_id="upload_file")
async def upload_file_route(request: FileUploadRequest):
    """JSON file upload (text or base64)."""
    data = await upload_file(
        request.target_dir, request.filename, request.content, request.is_base64
    )
    return success(data=data)
