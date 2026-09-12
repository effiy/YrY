"""Backup API routes — manual trigger, verify, restore, list."""

from fastapi import APIRouter
from services.backup.backup_service import backup_service
from shared.response import success, fail
from shared.error_codes import ErrorCode

router = APIRouter(prefix="/backup", tags=["Backup"])


@router.post("/full")
async def trigger_full_backup():
    result = await backup_service.full_backup()
    if result["status"] == "success":
        return success(data=result)
    return fail(error=ErrorCode.DB_ERROR, message=result.get("error", "Backup failed"))


@router.post("/verify/{backup_name}")
async def verify_backup(backup_name: str):
    result = await backup_service.verify_backup(backup_name)
    if result["status"] == "verified":
        return success(data=result)
    return fail(error=ErrorCode.DB_ERROR, message=result.get("error", "Verification failed"))


@router.post("/restore/{backup_name}")
async def restore_backup(backup_name: str):
    result = await backup_service.restore(backup_name)
    if result["status"] == "success":
        return success(data=result)
    return fail(error=ErrorCode.DB_ERROR, message=result.get("error", "Restore failed"))


@router.get("/list")
async def list_backups():
    backups = backup_service.list_backups()
    return success(data={"backups": backups})