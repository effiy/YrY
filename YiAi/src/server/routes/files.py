"""文件管理接口 — 路由层。

只负责 request 解析 + 调 domain.files + 包装 success 响应。
所有磁盘 / OSS / Mongo IO 都在 ``domain.files`` 里。
"""
import logging

from fastapi import APIRouter

from domain.files import (
    delete_file,
    delete_folder,
    read_file,
    rename_file,
    rename_folder,
    upload_file,
    upload_image,
    write_file,
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
    """读文件:磁盘优先,磁盘未中回退 MongoDB。图片返回静态 URL。"""
    data = await read_file(request.target_file)
    return success(data=data)


@router.post("/write-file", operation_id="write_file")
async def write_file_route(request: FileWriteRequest):
    """磁盘 + MongoDB 双写。MongoDB upsert,best-effort。"""
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
    """JSON 方式文件上传(文本或 base64)。"""
    data = await upload_file(
        request.target_dir, request.filename, request.content, request.is_base64
    )
    return success(data=data)
